#!/usr/bin/env python3
"""Short-lived helper that checks ONE achievement's live state for the
overlay tracker: locked/unlocked, and -- best effort -- numeric progress
(e.g. "45/100 kills") for achievements the game has linked to a stat.

Locked/unlocked and global rarity are always reliable; they come from
documented, stable Steamworks calls. Numeric progress is NOT reliably
obtainable from the public Steamworks client API alone -- there is no
official call for "how far along is achievement X". The one thing the
public API *does* give us is GetAchievementProgressLimitsInt32/Float,
which tells us an achievement supports progress display and what its
min/max bounds are, but not which stat drives it or that stat's current
value.

To get the current value, we fall back to a best-effort read of Steam's
own local (undocumented, binary VDF) schema cache, which is the exact
file Steam's own client reads to show its "45/100" achievement toasts.
This is reverse-engineered, not officially documented, so every step here
is wrapped defensively: if parsing fails, looks structurally wrong, or the
resulting numbers don't make sense (out of the min/max bounds), we report
"no progress available" rather than ever showing a guessed/wrong number.
"""
import argparse
import ctypes
import glob
import json
import os
import sys
import time
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from finally_steamworks_lib import SteamworksError, open_user_stats, optional  # noqa: E402


def emit(payload: Dict[str, object]) -> None:
    print(json.dumps(payload, separators=(",", ":")), flush=True)


def decode(value: Optional[bytes]) -> str:
    if not value:
        return ""
    return value.decode("utf-8", errors="ignore")


def configure_api(lib: ctypes.CDLL) -> None:

    lib.SteamAPI_ISteamUserStats_GetAchievement.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_bool),
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievement.restype = ctypes.c_bool

    lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_float),
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent.restype = ctypes.c_bool

    optional(lib, "SteamAPI_ISteamUserStats_GetAchievementProgressLimitsInt32", [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_int32),
        ctypes.POINTER(ctypes.c_int32),
    ], ctypes.c_bool)

    optional(lib, "SteamAPI_ISteamUserStats_GetStatInt32", [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_int32),
    ], ctypes.c_bool)


# --- Minimal binary-VDF reader (Valve's "appinfo"-style binary format) ------
# Best-effort only, see module docstring. Structure per node:
#   type_byte, key (null-terminated string), value
# type 0x00 = nested dict (terminated by a lone 0x08), 0x01 = string,
# 0x02 = int32 (4 bytes LE), 0x03 = float32 (4 bytes LE), 0x07 = uint64
# (8 bytes LE). Anything else aborts parsing for that branch rather than
# guessing.
_T_DICT = 0x00
_T_STRING = 0x01
_T_INT32 = 0x02
_T_FLOAT32 = 0x03
_T_COLOR = 0x06
_T_UINT64 = 0x07
_T_END = 0x08


def _read_cstring(data: bytes, offset: int) -> (str, int):
    end = data.index(b"\x00", offset)
    return data[offset:end].decode("utf-8", errors="ignore"), end + 1


def _parse_binary_vdf_dict(data: bytes, offset: int, depth: int = 0) -> (Dict[str, Any], int):
    if depth > 64:
        raise ValueError("binary vdf nesting too deep, aborting (likely misparsed)")
    result: Dict[str, Any] = {}
    while True:
        if offset >= len(data):
            raise ValueError("unexpected end of binary vdf data")
        type_byte = data[offset]
        offset += 1
        if type_byte == _T_END:
            return result, offset

        key, offset = _read_cstring(data, offset)

        if type_byte == _T_DICT:
            value, offset = _parse_binary_vdf_dict(data, offset, depth + 1)
        elif type_byte == _T_STRING:
            value, offset = _read_cstring(data, offset)
        elif type_byte == _T_INT32 or type_byte == _T_COLOR:
            value = int.from_bytes(data[offset : offset + 4], "little", signed=True)
            offset += 4
        elif type_byte == _T_FLOAT32:
            value = ctypes.c_float.from_buffer_copy(data[offset : offset + 4]).value
            offset += 4
        elif type_byte == _T_UINT64:
            value = int.from_bytes(data[offset : offset + 8], "little", signed=False)
            offset += 8
        else:
            raise ValueError(f"unknown binary vdf type byte {type_byte:#x}, aborting")

        result[key] = value


def _find_schema_files(appid: int) -> List[str]:
    roots = [r for r in os.environ.get("FINALLY_STEAM_ROOTS", "").split(os.pathsep) if r]
    roots += [os.path.expanduser("~/.local/share/Steam"), os.path.expanduser("~/.steam/steam"),
              "/home/deck/.local/share/Steam", "/home/deck/.steam/steam"]
    patterns = sorted({os.path.realpath(os.path.join(r, "appcache", "stats", f"UserGameStatsSchema_{appid}.bin"))
                       for r in roots})
    found = []
    for pattern in patterns:
        found.extend(glob.glob(pattern))
    return found


def _walk_for_progress_stat(node: Any, achievement_id: str) -> Optional[Dict[str, Any]]:
    """Recursively searches the parsed schema for the distinctive shape
    Steam uses to describe a progress-tracked achievement:
        {"name": "<achievement_id>", ..., "progress": {
            "value": {"operand1": "<stat_api_name>", ...},
            "max_val": <int or str-int>, ...
        }}
    Returns {"stat": str, "max": int} if found and structurally sane, else
    None. Matched anywhere in the tree by shape, not by a fixed path, since
    the exact nesting depth is not something we can verify offline."""
    if not isinstance(node, dict):
        return None

    name = node.get("name")
    progress = node.get("progress")
    if isinstance(name, str) and name.lower() == achievement_id.lower() and isinstance(progress, dict):
        value_node = progress.get("value")
        max_val = progress.get("max_val")
        stat_name = None
        if isinstance(value_node, dict):
            stat_name = value_node.get("operand1")
        try:
            max_int = int(max_val) if max_val is not None else None
        except (TypeError, ValueError):
            max_int = None
        if isinstance(stat_name, str) and stat_name and isinstance(max_int, int) and max_int > 0:
            return {"stat": stat_name, "max": max_int}

    for value in node.values():
        if isinstance(value, dict):
            found = _walk_for_progress_stat(value, achievement_id)
            if found:
                return found
    return None


def _lookup_progress_stat(appid: int, achievement_id: str) -> Optional[Dict[str, Any]]:
    for path in _find_schema_files(appid):
        try:
            with open(path, "rb") as stream:
                data = stream.read()
            parsed, _ = _parse_binary_vdf_dict(data, 0)
            found = _walk_for_progress_stat(parsed, achievement_id)
            if found:
                return found
        except Exception:
            continue
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--appid", type=int, required=True)
    parser.add_argument("--achievement", required=True)
    parser.add_argument("--baseline-ms", type=int, default=800)
    parser.add_argument("--lib", required=True)
    args = parser.parse_args()

    os.environ["SteamAppId"] = str(args.appid)
    os.environ["SteamGameId"] = str(args.appid)

    lib = None
    try:
        try:
            lib, stats = open_user_stats(args.lib)
        except SteamworksError as err:
            emit({"type": "error", "error": str(err)})
            return 2
        configure_api(lib)

        deadline = time.monotonic() + max(0.0, args.baseline_ms / 1000.0)
        while time.monotonic() < deadline:
            lib.SteamAPI_RunCallbacks()
            time.sleep(0.05)

        aid = args.achievement.encode("utf-8")

        achieved = ctypes.c_bool(False)
        lib.SteamAPI_ISteamUserStats_GetAchievement(stats, aid, ctypes.byref(achieved))

        percent = ctypes.c_float(0.0)
        has_percent = lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent(
            stats, aid, ctypes.byref(percent)
        )

        result: Dict[str, Any] = {
            "type": "progress",
            "appid": args.appid,
            "achievement": args.achievement,
            "achieved": bool(achieved.value),
            "percent": round(float(percent.value), 2) if has_percent else None,
            "has_progress": False,
            "current": None,
            "max": None,
        }

        min_bound = ctypes.c_int32(0)
        max_bound = ctypes.c_int32(0)
        limits = getattr(lib, "SteamAPI_ISteamUserStats_GetAchievementProgressLimitsInt32", None)
        supports_progress = limits is not None and hasattr(lib, "SteamAPI_ISteamUserStats_GetStatInt32") and limits(
            stats, aid, ctypes.byref(min_bound), ctypes.byref(max_bound)
        )

        if supports_progress and not achieved.value:
            try:
                stat_info = _lookup_progress_stat(args.appid, args.achievement)
            except Exception:
                stat_info = None

            if stat_info:
                current = ctypes.c_int32(0)
                got_stat = lib.SteamAPI_ISteamUserStats_GetStatInt32(
                    stats, stat_info["stat"].encode("utf-8"), ctypes.byref(current)
                )
                max_val = stat_info["max"] or int(max_bound.value) or None
                # Sanity check: only trust this if the number actually falls
                # in a plausible range. A wrong parse could produce a
                # negative or wildly out-of-range value; better to show
                # nothing than to show something misleading.
                if got_stat and max_val and 0 <= current.value <= max_val:
                    result["has_progress"] = True
                    result["current"] = int(current.value)
                    result["max"] = int(max_val)

        emit(result)
        return 0
    except Exception as err:
        emit({"type": "error", "error": str(err)})
        return 1
    finally:
        if lib is not None:
            try:
                lib.SteamAPI_Shutdown()
            except Exception:
                pass


if __name__ == "__main__":
    sys.exit(main())
