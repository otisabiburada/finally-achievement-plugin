#!/usr/bin/env python3
"""Finding and opening Steam's achievement library (libsteam_api.so).

Shared by main.py (to find the library) and the steamworks_*_probe.py helpers
(to open it). Standard library only.

Why a search: the library is not part of every Steam install. Older plugin
versions only looked in ~/.local/share/Steam/steamrt64 for the user "deck",
so on other systems (another user name, Flatpak Steam, a Steam update that
moved or dropped the file) the achievement browser and tracker said "Steam's
achievement library wasn't found" and the fast unlock detection never ran.
Now, in order:

1. FINALLY_STEAMWORKS_LIB (environment) or a libsteam_api.so dropped into the
   plugin's settings folder or the plugin folder (manual override);
2. Steam's own folders, in every Steam install found;
3. native Linux games in every Steam library folder: almost all of them ship
   libsteam_api.so next to the game.

Any 64-bit copy works: the helpers ask Steam for the running game's
achievements, not the game the library came from. Newer copies are preferred.
"""
import ctypes
import os
import re
from typing import Iterable, List, Optional, Tuple

LIB_NAME = "libsteam_api.so"
STEAM_SUBDIRS = ("steamrt64", "linux64", "ubuntu12_64", "steamrt64/lib", "ubuntu12_64/steam-runtime-sniper")
# The newest ISteamUserStats accessor first. The flat functions the helpers
# use (GetAchievement, GetAchievementName, ...) exist in all of these.
USER_STATS_VERSIONS = ("v013", "v012", "v011", "v010")
GAME_SCAN_DEPTH = 5          # <game>/<Game>_Data/Plugins/x86_64/libsteam_api.so is depth 4
GAME_SCAN_MAX_DIRS = 60000   # per library folder; stops a pathological tree from stalling startup

_VERSION_RE = re.compile(rb"SteamAPI_SteamUserStats_(v0\d\d)")


def lib_info(path: str) -> Optional[Tuple[int, bool]]:
    """(newest ISteamUserStats version number, has SteamAPI_InitFlat) for a
    usable 64-bit x86 libsteam_api.so, or None if the file can't be used."""
    try:
        with open(path, "rb") as stream:
            head = stream.read(20)
            if len(head) < 20 or head[:4] != b"\x7fELF" or head[4] != 2:   # ELF, 64-bit
                return None
            if int.from_bytes(head[18:20], "little") != 62:                   # x86-64
                return None
            stream.seek(0)
            data = stream.read()
    except OSError:
        return None
    versions = [int(m.group(1)[1:]) for m in _VERSION_RE.finditer(data)]
    if not versions or b"SteamAPI_ISteamUserStats_GetAchievement\x00" not in data:
        return None
    return max(versions), b"SteamAPI_InitFlat" in data


def _walk_games(common_dir: str) -> Iterable[str]:
    try:
        games = sorted(os.scandir(common_dir), key=lambda e: e.name.lower())
    except OSError:
        return
    budget = GAME_SCAN_MAX_DIRS
    for game in games:
        if not game.is_dir(follow_symlinks=False):
            continue
        stack = [(game.path, 0)]
        while stack and budget > 0:
            path, depth = stack.pop()
            budget -= 1
            try:
                entries = list(os.scandir(path))
            except OSError:
                continue
            for entry in entries:
                try:
                    if entry.name == LIB_NAME and entry.is_file():
                        yield entry.path
                    elif depth < GAME_SCAN_DEPTH and entry.is_dir(follow_symlinks=False):
                        # Windows-only trees and asset folders never hold it
                        lowered = entry.name.lower()
                        if lowered in ("x86", "win32", "win64", "windows", "__macosx", "shadercache", "compatdata"):
                            continue
                        stack.append((entry.path, depth + 1))
                except OSError:
                    continue


def candidates(
    steam_roots: List[str],
    library_dirs: List[str],
    override_dirs: List[str],
    scan_games: bool = True,
) -> List[str]:
    """Every libsteam_api.so worth trying, most preferred first (not yet validated)."""
    found: List[str] = []
    env = os.environ.get("FINALLY_STEAMWORKS_LIB", "").strip()
    if env:
        found.append(env)
    for directory in override_dirs:
        found.append(os.path.join(directory, LIB_NAME))
    for root in steam_roots:
        for sub in STEAM_SUBDIRS:
            found.append(os.path.join(root, sub, LIB_NAME))
    if scan_games:
        for library in library_dirs:
            found.extend(_walk_games(os.path.join(library, "steamapps", "common")))
    unique: List[str] = []
    seen = set()
    for path in found:
        try:
            real = os.path.realpath(path)
        except OSError:
            continue
        if real not in seen and os.path.isfile(real):
            seen.add(real)
            unique.append(real)
    return unique


def pick(paths: List[str]) -> Optional[str]:
    """The best usable library: the manual/Steam ones keep their order
    (they come first), game copies are ranked newest interface first."""
    best: Optional[Tuple[Tuple[int, int, int, int], str]] = None
    for index, path in enumerate(paths):
        info = lib_info(path)
        if info is None:
            continue
        version, has_flat = info
        is_game = os.sep + "steamapps" + os.sep + "common" + os.sep in path
        if is_game:
            rank = (0, version, 1 if has_flat else 0, -index)
        else:
            rank = (1, 0, 0, -index)                 # first usable manual/Steam copy wins
        if best is None or rank > best[0]:
            best = (rank, path)
    return best[1] if best else None


# --- opening it (used by the helpers) ------------------------------------------

class SteamworksError(Exception):
    pass


def open_user_stats(lib_path: str) -> Tuple[ctypes.CDLL, int]:
    """Loads the library, initialises Steamworks for SteamAppId (set by the
    caller) and returns (lib, ISteamUserStats pointer)."""
    directory = os.path.dirname(lib_path)
    try:
        lib = ctypes.CDLL(lib_path)
    except OSError as err:
        raise SteamworksError(f"load_failed: {err} ({directory})")

    init_error = None
    if hasattr(lib, "SteamAPI_InitFlat"):
        lib.SteamAPI_InitFlat.argtypes = [ctypes.c_char_p]
        lib.SteamAPI_InitFlat.restype = ctypes.c_int
        message = ctypes.create_string_buffer(1024)
        result = lib.SteamAPI_InitFlat(message)
        if result != 0:
            init_error = message.value.decode("utf-8", errors="ignore") or f"SteamAPI_InitFlat={result}"
    else:
        init = getattr(lib, "SteamAPI_InitSafe", None) or getattr(lib, "SteamAPI_Init")
        init.argtypes = []
        init.restype = ctypes.c_bool
        if not init():
            init_error = "SteamAPI_Init failed (is Steam running?)"
    if init_error:
        raise SteamworksError(init_error)

    lib.SteamAPI_RunCallbacks.argtypes = []
    lib.SteamAPI_RunCallbacks.restype = None
    lib.SteamAPI_Shutdown.argtypes = []
    lib.SteamAPI_Shutdown.restype = None

    stats = None
    for version in USER_STATS_VERSIONS:
        accessor = getattr(lib, f"SteamAPI_SteamUserStats_{version}", None)
        if accessor is None:
            continue
        accessor.argtypes = []
        accessor.restype = ctypes.c_void_p
        stats = accessor()
        if stats:
            break
    if not stats:
        raise SteamworksError("SteamUserStats unavailable")
    return lib, stats


def optional(lib: ctypes.CDLL, name: str, argtypes: list, restype) -> bool:
    """Declares a function the library may not have (older/newer SDKs)."""
    fn = getattr(lib, name, None)
    if fn is None:
        return False
    fn.argtypes = argtypes
    fn.restype = restype
    return True
