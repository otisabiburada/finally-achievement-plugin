import asyncio
import base64
import ctypes
import datetime as dt
import glob
import hashlib
import html as html_lib
import json
import os
import random
import re
import struct
import subprocess
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Set, Tuple

import decky


def _load_i18n():
    """finally_i18n.py from the plugin folder, or None (the plugin then stays in English)."""
    try:
        import importlib.util
        path = os.path.join(decky.DECKY_PLUGIN_DIR, "finally_i18n.py")
        spec = importlib.util.spec_from_file_location("finally_i18n", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    except Exception as err:  # noqa: BLE001
        try:
            decky.logger.warning("Translations unavailable: %s", err)
        except Exception:
            pass
        return None


_I18N = None

STEAM_LOG_PATH = "/home/deck/.local/share/Steam/logs/stats_log.txt"
STEAM_LOG_DIR = os.path.dirname(STEAM_LOG_PATH)
STEAM_USERDATA_GLOB = "/home/deck/.local/share/Steam/userdata/*"
LIBRARYCACHE_GLOB = "/home/deck/.local/share/Steam/userdata/*/config/librarycache/*.json"
LIBRARYCACHE_DIR_GLOB = "/home/deck/.local/share/Steam/userdata/*/config/librarycache"
STEAM_APPCACHE_STATS_DIR = "/home/deck/.local/share/Steam/appcache/stats"
STEAMWORKS_LIB_PATH = "/home/deck/.local/share/Steam/steamrt64/libsteam_api.so"
STEAMWORKS_HELPER_NAME = "steamworks_probe.py"
FINALLY_OVERLAY_HELPER_NAME = "finally_gamescope_overlay.py"
STEAMWORKS_PYTHON = "/usr/bin/python3"
STEAM_COMMUNITY_STATS_URL = "https://steamcommunity.com/stats/{appid}/achievements/?l={lang}"
# Gray-icon detection (see _icon_color_verdict): Steam's locked icons are
# desaturated copies, so mean per-pixel chroma (max(rgb)-min(rgb), 0-255) is
# ~0. Colored icons sit well above this.
ICON_GRAY_MEAN_CHROMA = 12.0
ICON_GRAY_MAX_CHROMA = 70
ICON_COLOR_CHECK_SCRIPT = r"""
import sys

# Usage: <icon path> <plugin dir>  -> one verdict line.
#        --serve <plugin dir>      -> one verdict line per icon path read from stdin,
#                                     so one process can check many icons.


def load(path):
    # PyGObject's GdkPixbuf when it works (SteamOS); otherwise the plugin's
    # ctypes layer (finally_cairo_ctypes.py), which only needs libgdk_pixbuf.
    try:
        import gi
        gi.require_version("GdkPixbuf", "2.0")
        from gi.repository import GdkPixbuf
        return GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 32, 32, False)
    except Exception:
        sys.path.insert(0, sys.argv[2] if len(sys.argv) > 2 else ".")
        import finally_cairo_ctypes as shim
        return shim.GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 32, 32, False)


def check(path):
    try:
        pb = load(path)
        n = pb.get_n_channels(); rs = pb.get_rowstride()
        w = pb.get_width(); h = pb.get_height()
        px = pb.get_pixels(); alpha = pb.get_has_alpha() and n >= 4
        tot = 0; cnt = 0; mx = 0
        for y in range(h):
            base = y * rs
            for x in range(w):
                i = base + x * n
                if alpha and px[i + 3] < 32:
                    continue
                r, g, b = px[i], px[i + 1], px[i + 2]
                c = max(r, g, b) - min(r, g, b)
                tot += c; cnt += 1
                if c > mx:
                    mx = c
        if cnt == 0:
            return "unknown"
        return "%.2f %d" % (tot / cnt, mx)
    except Exception:
        return "unknown"


if len(sys.argv) > 1 and sys.argv[1] == "--serve":
    for line in sys.stdin:
        sys.stdout.write(check(line.rstrip("\n")) + "\n")
        sys.stdout.flush()
else:
    print(check(sys.argv[1]))
"""
STALE_UNLOCK_GRACE_SECONDS = 15
POLL_INTERVAL_SECONDS = 0.35
CACHE_SCAN_INTERVAL_SECONDS = 1.5
RECONCILIATION_SCAN_INTERVAL_SECONDS = 120.0
INOTIFY_DEBOUNCE_SECONDS = 0.10
STEAMWORKS_APPID_SCAN_INTERVAL_SECONDS = 1.0
STEAMWORKS_POLL_INTERVAL_MS = 100
STEAMWORKS_RESTART_COOLDOWN_SECONDS = 15.0
# How often the achievement helper asks Steam to resend the game's stats. Without
# this, some setups (reported on a Steam Machine) only notice an unlock after a
# long delay or after the Steam button is pressed.
STEAMWORKS_REFRESH_INTERVAL_MS = 2000
DESCRIPTION_LOOKUP_SECONDS = 3.0
# Steam writes appcache/stats/UserGameStats_<account>_<appid>.bin the moment a game stores an unlock, long before
# the library page data (librarycache) is refreshed. This watcher reads that file directly.
# The stats file is normally caught by inotify the moment Steam writes it; this scan is only the backstop (other
# Steam roots, or inotify unavailable).
STATS_BIN_SCAN_INTERVAL_SECONDS = 0.25
STATS_BIN_NEW_WINDOW_SECONDS = 90          # a file seen for the first time: only unlocks this recent count as new
# The longest a popup waits for its icon, percentage, description and game art after an unlock is noticed. Whatever
# isn't ready by then is left out (the lookups finish in the background and are cached for the next popup).
POPUP_PREP_BUDGET_SECONDS = 1.0
# When a game starts, this many of its still-locked achievement icons are downloaded ahead of time, so an unlock's
# popup reads its icon from disk instead of waiting for the network.
PREWARM_ICON_LIMIT = 400
DESCRIPTION_MAX_ATTEMPTS = 3
DUPLICATE_WINDOW_SECONDS = 8.0
RARE_PERCENT_THRESHOLD = 10.0
SKIP_CACHE_FILES = {"achievement_progress.json"}
AUDIO_PREROLL_SECONDS = 0.35
STEAM_ID64_BASE = 76561197960265728
STEAM_WEB_API_KEY_ENV = "STEAM_WEB_API_KEY"
FINALLY_SETTINGS_DIR = "/home/deck/homebrew/settings/Finally Achievement Plugin"
FINALLY_SETTINGS_FILE = os.path.join(FINALLY_SETTINGS_DIR, "settings.json")
FINALLY_GAME_PROFILES_FILE = os.path.join(FINALLY_SETTINGS_DIR, "game_profiles.json")
FINALLY_GAME_NAMES_FILE = os.path.join(FINALLY_SETTINGS_DIR, "game_names.json")
# Achievement browser + tracker (merged in from the old standalone achievements plugin)
OLD_TRACKER_SETTINGS_DIR = "/home/deck/homebrew/settings/Finally-Achievements-legacy"
STEAMWORKS_LIST_HELPER_NAME = "steamworks_list_probe.py"
STEAMWORKS_TRACK_HELPER_NAME = "steamworks_track_probe.py"
TRACKER_OVERLAY_SCRIPT_NAME = "tracker_overlay.py"
OVERLAY_SCRIPT_NAME = "finally_gamescope_overlay.py"
DIAGNOSE_SCRIPT_NAME = "finally_diagnose.py"
DRAWING_LAYER_NAME = "finally_cairo_ctypes.py"
TRACKER_POSITIONS = ("top_left", "top_right", "bottom_left", "bottom_right")
TRACKER_SIZE_RANGE = (100, 50, 150)             # (default, lo, hi) percent
TRACKER_ACTIVE_POLL_SECONDS = 4.0
TRACKER_IDLE_POLL_SECONDS = 8.0
TRACKER_RESTART_COOLDOWN_SECONDS = 5.0
TRACKER_HIDE_WAIT_SECONDS = 0.55                # tracker slide-out (0.35s) + margin, before a toast window opens
PROBE_TIMEOUT_SECONDS = 8.0
FINALLY_ICON_CACHE_DIR = os.path.join(FINALLY_SETTINGS_DIR, "icon-cache")
# Gray/colored answers for icon files already checked, so an icon is only ever checked once.
FINALLY_ICON_VERDICTS_FILE = os.path.join(FINALLY_ICON_CACHE_DIR, "color-verdicts.json")
ICON_CHECK_TIMEOUT_SECONDS = 4.0
# A display setup the popup couldn't open on is skipped for this long, so later
# popups don't try it again first (each failed try costs a helper start).
OVERLAY_FAILED_RETRY_SECONDS = 600.0
OLD_SETTINGS_DIR = "/home/deck/homebrew/settings/Finally-legacy"
STEAM_WEB_API_KEY_FILES = [
    os.path.join(FINALLY_SETTINGS_DIR, "steam_web_api_key"),
    os.path.join(OLD_SETTINGS_DIR, "steam_web_api_key"),
]
SOUNDS_DIR_NAME = "sounds"
# One sound per tier plus the 100%-completion popup. The defaults reproduce
# the old two-sound behaviour: the "normal" sound for common and uncommon, the
# "rare" sound for rare, ultra rare and completion.
SOUND_SLOTS = ("common", "uncommon", "rare", "ultra_rare", "completion")
DEFAULT_NORMAL_SOUND = "unlock_preroll.wav"
DEFAULT_RARE_SOUND = "rare_preroll.wav"
# Where your own sound files go. It lives in the settings folder (not the plugin
# folder) so updating or reinstalling the plugin never deletes them.
FINALLY_USER_SOUNDS_DIR = os.path.join(FINALLY_SETTINGS_DIR, "sounds")
SOUND_EXTENSIONS = (".wav", ".flac", ".ogg", ".oga", ".mp3", ".aiff", ".aif")
SOUND_MAX_BYTES = 10 * 1024 * 1024
SOUND_MAX_PLAY_SECONDS = 20.0         # a long file is cut off after this
DEFAULT_SETTINGS = {
    "sound_common": DEFAULT_NORMAL_SOUND,
    "sound_uncommon": DEFAULT_NORMAL_SOUND,
    "sound_rare": DEFAULT_RARE_SOUND,
    "sound_ultra_rare": DEFAULT_RARE_SOUND,
    "sound_completion": DEFAULT_RARE_SOUND,
    "overlay_size_percent": 50,
    "volume_percent": 50,
    "overlay_position": "bottom_center",
    "overlay_screen": "auto",
    "language": "auto",
    "overlay_template": "xbox_modern",
    "label_font_size": 13,
    "title_font_size": 26,
    "subtitle_font_size": 18,
    "normal_gradient_start": "hsla(134, 58%, 25%, 0.94)",
    "normal_gradient_end": "hsla(134, 50%, 14%, 0.94)",
    "rare_gradient_start": "hsla(45, 90%, 42%, 0.95)",
    "rare_gradient_end": "hsla(38, 70%, 22%, 0.95)",
    "normal_circle_color": "hsla(134, 62%, 51%, 1)",
    "rare_circle_color": "hsla(45, 95%, 58%, 1)",
    "duration_seconds": 5.8,
    "icon_glow_enabled": True,
    "icon_glow_intensity": 50,
    "ring_size": 50,
    "gradient_direction": "vertical",
    "glow_normal_enabled": False,
    "icon_frame_ring_enabled": True,
    "icon_gradient_enabled": False,
    "show_percent": True,
    "placeholder_icon": "auto",
    "game_art_gradient_enabled": False,
    "completion_toast_enabled": True,
    "session_summary_enabled": True,
    "near_completion_enabled": True,
    "near_completion_threshold": 2,
    "completion_title": "completionist",
    "percent_size": 100,
    "percent_position": "bottom_right",
    "rarity_tiers_enabled": True,
    "test_with_game_data": True,
    "screenshot_on_unlock": False,
    "screenshot_include_popup": False,
    "template_fx_enabled": True,
    "template_colors_enabled": False,
    "tracker_position": "top_right",
    "tracker_size_percent": 100,
    "tracker_template": "same",
    "tier_uncommon_cutoff": 25,
    "tier_rare_cutoff": 10,
    "tier_ultra_cutoff": 1.0,
}
# Kept in sync with DURATION_RANGE in src/finallyThemes.ts.
DURATION_RANGE = (5.8, 3.0, 12.0)  # (default, lo, hi), in seconds
GRADIENT_DIRECTIONS = ("vertical", "left_right", "right_left", "solid")
# The 100%-complete ("Mythic") toast. Its template is deliberately not in
# OVERLAY_TEMPLATES / the template picker -- it only ever appears on completion.
COMPLETION_TEMPLATE = "mythic_completion"
# Big-text name for the 100%-complete popup, chosen in the panel.
COMPLETION_TITLES = {
    "completionist": "Completionist",
    "legendary": "Legendary Achievement unlocked",
    "crowned": "Crowned",
}
COMPLETION_TITLE_DEFAULT = "completionist"
# Rarity-tier cutoffs (% of players who have the achievement), each a
# (default, lo, hi). Kept in sync with TIER_CUTOFF_RANGES in src/finallyThemes.ts.
TIER_ULTRA_RANGE = (1.0, 0.5, 5.0)
TIER_RARE_RANGE = (10, 2, 25)
TIER_UNCOMMON_RANGE = (25, 5, 60)
# Kept in sync with PERCENT_SIZE_RANGE in src/finallyThemes.ts (a % of normal).
PERCENT_SIZE_RANGE = (100, 70, 150)  # (default, lo, hi)
# Where the unlock-percentage badge sits; "top_right" also lets descriptions use two lines.
PERCENT_POSITIONS = ("bottom_right", "top_right")
COMPLETION_MIN_SECONDS = 9.0
# "Only N left" popup: fires when this many (or fewer) are still locked.
NEAR_COMPLETION_RANGE = (1, 5)
# Session summary: needs this many seconds of "no game running" in a row, so
# a one-scan detection hiccup doesn't end a play session early.
SESSION_END_SECONDS = 4.0
MILESTONE_MIN_SECONDS = 6.0
HISTORY_MAX_ENTRIES = 500
SHARE_DIR_NAME = "Finally Achievements"
# Screenshot on unlock: gamescope writes the picture it is asked for to this fixed path, then it is copied
# to <Pictures>/Finally Achievements/Screenshots.
SCREENSHOT_HELPER_NAME = "finally_screenshot.py"
GAMESCOPE_SCREENSHOT_PATH = "/tmp/gamescope.png"
SCREENSHOT_DIR_NAME = "Screenshots"
SCREENSHOT_WAIT_SECONDS = 4.0
SCREENSHOT_KEEP_MAX = 500            # newest files kept in the screenshots folder
# Preview image of the popup template shown in the panel.
PREVIEW_TIMEOUT_SECONDS = 30.0
PREVIEW_CACHE_MAX = 6
PREVIEW_MAX_BYTES = 8_000_000
COMPLETION_DELAY_SECONDS = 2.0
COMPLETION_DEDUPE_SECONDS = 120.0
# "auto" = original behavior (game icon if no achievement icon, else the gear badge).
PLACEHOLDER_ICON_STYLES = ("auto", "trophy", "game_icon")
# Popup canvas size. "auto" asks the X display (right on a Steam Deck's own
# screen). On a TV or a handheld whose output differs from what gamescope
# scales the overlay by, a fixed size from this list puts the popups back
# where they belong (see "Popup screen size" in the panel).
SCREEN_SIZE_CHOICES = (
    "auto", "1280x800", "1920x1080", "1920x1200", "2560x1440", "2560x1600", "3840x2160",
)
LANGUAGE_CHOICES = ("auto", "en", "tr", "de", "fr", "es", "pt-BR", "ru", "zh-Hans", "pl")
OVERLAY_POSITIONS = (
    "top_left",
    "top_center",
    "top_right",
    "bottom_left",
    "bottom_center",
    "bottom_right",
)
# Kept in sync with the TEMPLATES dict in finally_gamescope_overlay.py -- these
# are just the valid keys for validation; the actual look of each one lives
# in the renderer.
OVERLAY_TEMPLATES = (
    "xbox_modern",
    "playstation_trophy",
    "ps3_trophy",
    "switch_bold",
    "steam_flat",
    "material_minimal",
    "retro_arcade",
    "chat_toast",
    "cyber_glass",
    "xbox_360_classic",
    "xbox_360_v2",
    "xbox_360_v2_square",
    "win11_glass",
    "discord_bar",
    "vaporwave",
    "light_card",
    "wood_plaque",
    "terminal_hacker",
    "game_art",
)
# (default, min, max) -- kept in sync with the clamping in
# finally_gamescope_overlay.py's own env-var parsing, which is a second line
# of defense if a stale/edited settings file ever slips past this.
FONT_SIZE_RANGES = {
    "label_font_size": (13, 9, 18),
    "title_font_size": (26, 18, 34),
    "subtitle_font_size": (18, 12, 22),
}
STEAM_API_TIMEOUT_SECONDS = 2.0
STEAM_API_POLL_INTERVAL_SECONDS = 12.0
STEAM_API_RECENT_GAME_LIMIT = 2
STEAM_API_BASE_URL = "https://api.steampowered.com"
IN_CLOSE_WRITE = 0x00000008
IN_ATTRIB = 0x00000004
IN_MODIFY = 0x00000002
IN_MOVED_TO = 0x00000080
IN_CREATE = 0x00000100
IN_DELETE_SELF = 0x00000400
IN_MOVE_SELF = 0x00000800
IN_IGNORED = 0x00008000
IN_Q_OVERFLOW = 0x00004000
IN_ISDIR = 0x40000000
INOTIFY_STRUCT = struct.Struct("iIII")
INOTIFY_READ_SIZE = 65536


# ---------------------------------------------------------------------------
# Steam's local achievement schema: appcache/stats/UserGameStatsSchema_<appid>.bin
# (binary VDF). For each achievement it lists the COLORED "icon" and the
# "icon_gray" image names, so the unlocked icon is known with no API key and
# no network. Undocumented, so everything here is defensive and best-effort.
# ---------------------------------------------------------------------------
_VDF_DICT, _VDF_STRING, _VDF_INT32, _VDF_FLOAT32, _VDF_COLOR, _VDF_UINT64, _VDF_END = 0x00, 0x01, 0x02, 0x03, 0x06, 0x07, 0x08
_ICON_FILE_RE = re.compile(r"^[0-9a-fA-F]{20,64}\.(?:jpg|jpeg|png)$")


def _vdf_parse(data: bytes, offset: int = 0, depth: int = 0) -> Tuple[Dict[str, Any], int]:
    if depth > 64:
        raise ValueError("binary vdf nesting too deep")
    result: Dict[str, Any] = {}
    while True:
        if offset >= len(data):
            raise ValueError("unexpected end of binary vdf")
        kind = data[offset]
        offset += 1
        if kind == _VDF_END:
            return result, offset
        end = data.index(b"\x00", offset)
        key = data[offset:end].decode("utf-8", errors="ignore")
        offset = end + 1
        if kind == _VDF_DICT:
            value, offset = _vdf_parse(data, offset, depth + 1)
        elif kind == _VDF_STRING:
            end = data.index(b"\x00", offset)
            value = data[offset:end].decode("utf-8", errors="ignore")
            offset = end + 1
        elif kind in (_VDF_INT32, _VDF_COLOR, _VDF_FLOAT32):
            value = int.from_bytes(data[offset:offset + 4], "little", signed=True)
            offset += 4
        elif kind == _VDF_UINT64:
            value = int.from_bytes(data[offset:offset + 8], "little", signed=False)
            offset += 8
        else:
            raise ValueError(f"unknown binary vdf type {kind:#x}")
        result[key] = value


def _schema_icon_files(node: Any, colored: Dict[str, str], gray: Dict[str, str]) -> None:
    """Walks a parsed schema and collects {achievement id: colored icon file}
    (and the gray ones) from every node shaped like
    {"name": "<id>", "display": {"icon": "<hash>.jpg", "icon_gray": "..."}}."""
    if not isinstance(node, dict):
        return
    name = node.get("name")
    display = node.get("display") if isinstance(node.get("display"), dict) else node
    icon, icon_gray = display.get("icon"), display.get("icon_gray")
    if isinstance(name, str) and name and isinstance(icon, str) and _ICON_FILE_RE.match(icon):
        if not (isinstance(icon_gray, str) and icon_gray.lower() == icon.lower()):    # a "colored" icon identical to the gray one is useless
            colored.setdefault(name, icon)
            if isinstance(icon_gray, str) and _ICON_FILE_RE.match(icon_gray):
                gray.setdefault(name, icon_gray)
    for value in node.values():
        if isinstance(value, dict):
            _schema_icon_files(value, colored, gray)


class Plugin:
    def __init__(self) -> None:
        self._watcher_task: Optional[asyncio.Task] = None
        self._librarycache_task: Optional[asyncio.Task] = None
        self._steam_api_task: Optional[asyncio.Task] = None
        self._steamworks_task: Optional[asyncio.Task] = None
        self._steamworks_reader_task: Optional[asyncio.Task] = None
        self._steamworks_stderr_task: Optional[asyncio.Task] = None
        self._steamworks_process: Optional[asyncio.subprocess.Process] = None
        self._inotify_fd: Optional[int] = None
        self._inotify_watches: Dict[int, Tuple[str, str]] = {}
        self._inotify_queue: Optional[asyncio.Queue[Dict[str, Any]]] = None
        self._stop_event = asyncio.Event()
        self._started_at_epoch = time.time()
        self._watcher_running = False
        self._librarycache_running = False
        self._watcher_mode = "starting"
        self._steam_api_running = False
        self._steam_api_enabled = False
        self._steam_api_status: Optional[str] = None
        self._steam_api_last_error: Optional[str] = None
        self._steam_api_last_appids: List[int] = []
        self._steamworks_running = False
        self._steamworks_status: Optional[str] = None
        self._steamworks_last_error: Optional[str] = None
        self._steamworks_last_appid: Optional[int] = None
        self._steamworks_last_process_pid: Optional[int] = None
        self._steamworks_unlock_count = 0
        self._steamworks_last_start_monotonic = 0.0
        self._last_inotify_event_path: Optional[str] = None
        self._last_inotify_event_appid: Optional[int] = None
        self._last_queue_latency_ms: Optional[float] = None
        self._processed_inotify_events = 0
        self._fallback_scan_count = 0
        self._last_parse_retry_error: Optional[str] = None
        self._log_inode: Optional[int] = None
        self._log_device: Optional[int] = None
        self._log_position = 0
        self._last_match_timestamp: Optional[str] = None
        self._last_match_sample: Optional[str] = None
        self._last_match_source: Optional[str] = None
        self._last_scanned_appid: Optional[int] = None
        self._last_cache_mtime: Optional[float] = None
        self._last_new_unlock_ids: List[str] = []
        self._last_cache_status: Optional[str] = None
        self._last_parse_error: Optional[str] = None
        self._last_emitted_line = ""
        self._last_emit_monotonic = 0.0
        self._cache_mtimes: Dict[str, float] = {}
        self._known_unlocked: Dict[int, Set[str]] = {}
        self._steam_api_known_unlocked: Dict[int, Set[str]] = {}
        self._steam_api_percent_cache: Dict[int, Dict[str, float]] = {}
        self._steam_api_schema_icon_cache: Dict[int, Dict[str, str]] = {}
        self._steam_api_schema_icongray_cache: Dict[int, Dict[str, str]] = {}
        # appid -> every achievement in the game's schema (id, name, description,
        # colored icon URL). Filled by the same GetSchemaForGame call that
        # already provides the icons; used to pick a random achievement for tests.
        self._steam_api_schema_meta_cache: Dict[int, List[Dict[str, Any]]] = {}
        self._last_icon_resolution: Dict[str, Any] = {"result": "no_achievement_processed_yet"}
        self._game_icon_cache: Dict[int, Optional[str]] = {}
        # Per-game settings profiles (see _settings_for). _active_appid is
        # the game currently running, kept fresh by the Steamworks watcher.
        self._active_appid: Optional[int] = None
        self._ui_screen: Optional[tuple] = None
        self._local_schema_cache: Dict[str, Tuple[int, Dict[str, str]]] = {}
        # Overlay session detection (see _x_display_candidates).
        self._overlay_display: Optional[str] = None
        self._overlay_xauth: Optional[str] = None
        self._steam_xauth_cache: Optional[Tuple[Optional[str], float]] = None
        self._steam_display_cache: Optional[Tuple[Optional[str], float]] = None
        # Achievement tracker (see the tracker section below).
        self._tracker_task: Optional[asyncio.Task] = None
        self._tracker_process: Optional[asyncio.subprocess.Process] = None
        self._tracker_wake: asyncio.Event = asyncio.Event()
        self._tracker_last_start: float = -1e9
        self._slot_lock: asyncio.Lock = asyncio.Lock()
        self._slot_holders: Set[str] = set()
        self._toasts_queued: int = 0
        self._tracker_hidden: bool = False
        # appid -> monotonic time of the last completion toast, so the same
        # 100% moment can't fire twice (two detection paths, restarts).
        self._completion_last: Dict[int, float] = {}
        self._history: Optional[List[Dict[str, Any]]] = None
        self._session: Optional[Dict[str, Any]] = None
        self._near_notified: Set[Tuple[int, int]] = set()
        self._desc_cache: Dict[int, Dict[str, str]] = {}
        self._desc_tried: Set[Tuple[int, str]] = set()
        self._desc_attempts: Dict[Tuple[int, str], int] = {}
        # Local stats files (see _watch_stats_bin): the schema (names and descriptions in every language) and unlock times.
        self._stats_schema_cache: Dict[str, Tuple[int, Dict[str, Any]]] = {}
        self._stats_known: Dict[str, Set[str]] = {}
        self._stats_mtimes: Dict[str, int] = {}
        # One reader per stats file at a time; a change seen while it runs makes it read the file once more.
        self._stats_readers: Dict[str, asyncio.Task] = {}
        self._stats_reread: Set[str] = set()
        self._prewarmed_appids: Set[int] = set()
        self._stats_bin_task: Optional[asyncio.Task] = None
        self._stats_bin_status: str = "not_started"
        self._stats_bin_unlock_count: int = 0
        self._game_name_cache: Dict[int, str] = {}
        self._game_name_local_miss: Dict[int, float] = {}
        self._game_name_store_tried: Dict[int, float] = {}
        self._saved_names_loaded = False
        # appid -> (path or None, monotonic time). Misses expire quickly so
        # an offline moment doesn't disable game-art colors for the session,
        # but also doesn't re-try (and stall) on every single unlock.
        self._game_art_cache: Dict[int, Tuple[Optional[str], float]] = {}
        self._community_icon_cache: Dict[int, Dict[str, List[Tuple[str, str]]]] = {}
        self._recent_emit_keys: Dict[str, float] = {}
        self._emitted_achievement_keys: Set[str] = set()
        self._gamescope_overlay_lock = asyncio.Lock()
        self._screenshot_lock = asyncio.Lock()
        self._preview_cache: Dict[str, str] = {}
        # Icon color checks (see _icon_color_verdict): one helper process kept
        # running for all of them, and the answers remembered per file.
        self._color_worker: Optional[asyncio.subprocess.Process] = None
        self._color_worker_lock = asyncio.Lock()
        self._icon_verdicts: Optional[Dict[str, List[Any]]] = None
        # (display, X authority) -> when the popup last failed to open on it.
        self._overlay_failed: Dict[Tuple[str, Optional[str]], float] = {}
        self._gamescope_overlay_status: Optional[str] = None
        self._gamescope_overlay_last_error: Optional[str] = None
        self._achievement_patterns = [
            re.compile(r"\bachievement\s+unlocked\b", re.IGNORECASE),
            re.compile(r"\bunlocked\s+achievement\b", re.IGNORECASE),
            re.compile(r"\bachievement\s*:\s*unlocked\b", re.IGNORECASE),
        ]
        self._rare_pattern = re.compile(r"\brare\b", re.IGNORECASE)
        self._stats_bin_pattern = re.compile(
            r"^UserGameStats_(?P<accountid>\d+)_(?P<appid>\d+)\.bin$"
        )

    async def _main(self) -> None:
        self._stop_event.clear()
        self._save_settings(self._load_settings())
        await self._prime_librarycache_state()
        self._watcher_task = asyncio.create_task(
            self._watch_logs(), name="finally-logwatch"
        )
        self._librarycache_task = asyncio.create_task(
            self._watch_librarycache(), name="finally-librarycache-watch"
        )
        self._steam_api_task = asyncio.create_task(
            self._watch_steam_api(), name="finally-steam-api-watch"
        )
        self._steamworks_task = asyncio.create_task(
            self._watch_steamworks(), name="finally-steamworks-watch"
        )
        self._stats_bin_task = asyncio.create_task(
            self._watch_stats_bin(), name="finally-stats-bin-watch"
        )
        self._ensure_user_sounds_dir()
        try:
            self._migrate_old_tracker_pin()
        except Exception as err:
            decky.logger.warning("Tracker migration skipped: %s", err)
        self._tracker_task = asyncio.create_task(self._tracker_loop(), name="finally-tracker")
        decky.logger.info("Finally Achievement Plugin backend started")

    async def _unload(self) -> None:
        self._stop_event.set()
        self._close_inotify()
        self._stop_steamworks_process()
        self._stop_color_worker()

        tasks = [
            task
            for task in [
                self._watcher_task,
                self._librarycache_task,
                self._steam_api_task,
                self._steamworks_task,
                self._stats_bin_task,
                self._steamworks_reader_task,
                self._steamworks_stderr_task,
                self._tracker_task,
            ]
            if task is not None and not task.done()
        ]
        for task in tasks:
            task.cancel()
        try:
            await self._stop_tracker_overlay()
        except Exception as err:
            decky.logger.warning("Tracker overlay stop failed: %s", err)

        self._watcher_running = False
        self._librarycache_running = False
        self._steam_api_running = False
        self._steamworks_running = False
        decky.logger.info("Finally Achievement Plugin backend stopped")

    async def get_status(self) -> dict:
        return {
            "watcher_running": self._watcher_running,
            "librarycache_watcher_running": self._librarycache_running,
            "watcher_mode": self._watcher_mode,
            "last_inotify_event_path": self._last_inotify_event_path,
            "last_inotify_event_appid": self._last_inotify_event_appid,
            "last_queue_latency_ms": self._last_queue_latency_ms,
            "processed_inotify_events": self._processed_inotify_events,
            "fallback_scan_count": self._fallback_scan_count,
            "last_parse_retry_error": self._last_parse_retry_error,
            "steam_api_running": self._steam_api_running,
            "steam_api_enabled": self._steam_api_enabled,
            "steam_api_status": self._steam_api_status,
            "steam_api_last_error": self._steam_api_last_error,
            "steam_api_last_appids": self._steam_api_last_appids,
            "steamworks_running": self._steamworks_running,
            "steamworks_status": self._steamworks_status,
            "steamworks_last_error": self._steamworks_last_error,
            "steamworks_last_appid": self._steamworks_last_appid,
            "steamworks_last_process_pid": self._steamworks_last_process_pid,
            "steamworks_unlock_count": self._steamworks_unlock_count,
            "steamworks_poll_interval_ms": STEAMWORKS_POLL_INTERVAL_MS,
            "gamescope_overlay_status": self._gamescope_overlay_status,
            "gamescope_overlay_last_error": self._gamescope_overlay_last_error,
            "settings": self._effective_settings(),
            "game_profile": self._game_profile_info(),
            "librarycache_files_seen": len(self._cache_mtimes),
            "last_match_timestamp": self._last_match_timestamp,
            "last_match_sample": self._last_match_sample,
            "last_match_source": self._last_match_source,
            "last_scanned_appid": self._last_scanned_appid,
            "last_cache_mtime": self._last_cache_mtime,
            "last_new_unlock_ids": self._last_new_unlock_ids,
            "last_cache_status": self._last_cache_status,
            "last_parse_error": self._last_parse_error,
            "log_path": STEAM_LOG_PATH,
            "librarycache_glob": LIBRARYCACHE_GLOB,
            "duplicate_window_seconds": DUPLICATE_WINDOW_SECONDS,
        }

    async def get_settings(self) -> dict:
        self._save_settings(self._load_settings())
        return self._effective_settings()

    async def set_settings(self, settings: dict) -> dict:
        # While the running game has a custom profile switched on, panel
        # edits go to that profile only; otherwise they go to the global
        # settings exactly as before.
        appid = self._active_appid
        # The screen size and the language belong to the device, not to a
        # game: always global, never part of a per-game profile.
        device_patch = {k: settings[k] for k in ("overlay_screen", "language") if k in settings}
        if device_patch:
            self._save_settings(self._sanitize_settings({**self._load_settings(), **device_patch}))
            settings = {k: v for k, v in settings.items() if k not in device_patch}
            if "language" in device_patch:
                self._steam_api_schema_icon_cache.clear()
                self._community_icon_cache.clear()
        profile = self._enabled_profile(appid)
        if profile is not None:
            merged = self._sanitize_settings({**self._effective_settings(), **settings})
            for key in ("overlay_screen", "language"):
                merged[key] = self._load_settings()[key]
            profiles = self._load_game_profiles()
            entry = profiles.get(str(appid))
            if isinstance(entry, dict):
                entry["settings"] = merged
                self._save_game_profiles(profiles)
            self._tracker_wake.set()       # restyle the tracker right away
            return merged
        merged = self._sanitize_settings({**self._load_settings(), **settings})
        self._save_settings(merged)
        self._tracker_wake.set()
        return merged

    # ------------------------------------------------------------------
    # Per-game settings profiles
    #
    # A profile is a full snapshot of the settings for one game, stored in
    # game_profiles.json as {"<appid>": {"enabled", "name", "settings"}}.
    # Switching it off keeps the saved values, so switching it back on
    # restores them. Unlock toasts and sounds use the profile of the game
    # the unlock belongs to; everything else uses the global settings.
    # ------------------------------------------------------------------

    def _load_game_profiles(self) -> Dict[str, Dict[str, Any]]:
        try:
            with open(FINALLY_GAME_PROFILES_FILE, "r", encoding="utf-8") as stream:
                data = json.load(stream)
        except OSError:
            return {}
        except Exception as err:
            decky.logger.warning("Unable to parse Finally Achievement Plugin game profiles: %s", err)
            return {}
        if not isinstance(data, dict):
            return {}
        return {str(k): v for k, v in data.items() if isinstance(v, dict)}

    def _save_game_profiles(self, profiles: Dict[str, Dict[str, Any]]) -> None:
        try:
            os.makedirs(self._settings_dir(), exist_ok=True)
            with open(FINALLY_GAME_PROFILES_FILE, "w", encoding="utf-8") as stream:
                json.dump(profiles, stream, indent=2, sort_keys=True)
        except OSError as err:
            decky.logger.warning("Unable to save Finally Achievement Plugin game profiles: %s", err)

    def _enabled_profile(self, appid: Optional[int]) -> Optional[Dict[str, Any]]:
        if appid is None:
            return None
        entry = self._load_game_profiles().get(str(appid))
        if isinstance(entry, dict) and entry.get("enabled") and isinstance(entry.get("settings"), dict):
            return entry
        return None

    def _settings_for(self, appid: Optional[int]) -> Dict[str, Any]:
        """Settings to use for a game: its profile if one is switched on,
        else the global settings. Keys missing from an older profile fall
        back to the global value."""
        base = self._load_settings()
        entry = self._enabled_profile(appid)
        if entry is None:
            return base
        return self._sanitize_settings({**base, **entry["settings"]})

    def _effective_settings(self) -> Dict[str, Any]:
        return self._settings_for(self._active_appid)

    # ------------------------------------------------------------------
    # Game name lookup (used only to label the per-game settings toggle).
    # Order: in-memory/saved names -> Steam's own appmanifest files, found
    # via Steam's library list (so SD cards and extra drives work) -> Steam's
    # public store API in the background. Never blocks on the network.
    # ------------------------------------------------------------------

    GAME_NAME_LOCAL_MISS_TTL_SECONDS = 60.0
    GAME_NAME_STORE_RETRY_SECONDS = 300.0
    STORE_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails?appids={appid}&filters=basic"

    @staticmethod
    def _vdf_unescape(value: str) -> str:
        return value.replace('\\"', '"').replace("\\\\", "\\")

    def _steam_roots(self) -> List[str]:
        home = str(getattr(decky, "DECKY_USER_HOME", "") or "/home/deck")
        candidates = [
            os.path.join(home, ".local/share/Steam"),
            os.path.join(home, ".steam/steam"),
            os.path.join(home, ".steam/root"),
            os.path.join(home, ".var/app/com.valvesoftware.Steam/.local/share/Steam"),
            "/home/deck/.local/share/Steam",
            "/home/deck/.steam/steam",
        ]
        roots: List[str] = []
        seen = set()
        for candidate in candidates:
            try:
                real = os.path.realpath(candidate)
            except OSError:
                continue
            if real in seen or not os.path.isdir(real):
                continue
            seen.add(real)
            roots.append(real)
        return roots

    def _steamworks_lib_path(self) -> str:
        """libsteam_api.so: the Steam Deck path first, then the same place under
        whichever Steam install this system has (other users, Flatpak Steam)."""
        if os.path.exists(STEAMWORKS_LIB_PATH):
            return STEAMWORKS_LIB_PATH
        for root in self._steam_roots():
            for sub in ("steamrt64", "linux64", "ubuntu12_64"):
                candidate = os.path.join(root, sub, "libsteam_api.so")
                if os.path.exists(candidate):
                    return candidate
        return STEAMWORKS_LIB_PATH

    def _steam_library_dirs(self) -> List[str]:
        """Every Steam library folder (internal storage, SD card, other
        drives), read from Steam's own libraryfolders.vdf, plus the Steam
        roots themselves."""
        libraries: List[str] = []
        seen = set()

        def add(path: str) -> None:
            try:
                real = os.path.realpath(path)
            except OSError:
                return
            if real not in seen and os.path.isdir(real):
                seen.add(real)
                libraries.append(real)

        for root in self._steam_roots():
            add(root)
            for vdf in (
                os.path.join(root, "steamapps", "libraryfolders.vdf"),
                os.path.join(root, "config", "libraryfolders.vdf"),
            ):
                try:
                    with open(vdf, "r", encoding="utf-8", errors="replace") as stream:
                        text = stream.read(200000)
                except OSError:
                    continue
                # Current format: "path"  "/run/media/.../SteamLibrary"
                for match in re.finditer(r'"path"\s+"([^"]+)"', text):
                    add(self._vdf_unescape(match.group(1)))
                # Older format: "1"  "/run/media/.../SteamLibrary"
                for match in re.finditer(r'"\d+"\s+"(/[^"]+)"', text):
                    add(self._vdf_unescape(match.group(1)))
        return libraries

    def _read_manifest_name(self, path: str) -> Optional[str]:
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as stream:
                text = stream.read(20000)
        except OSError:
            return None
        match = re.search(r'"name"\s+"((?:[^"\\]|\\.)*)"', text)
        if not match:
            return None
        name = self._vdf_unescape(match.group(1)).strip()
        return name or None

    def _load_saved_game_names(self) -> None:
        if getattr(self, "_saved_names_loaded", False):
            return
        self._saved_names_loaded = True
        try:
            with open(FINALLY_GAME_NAMES_FILE, "r", encoding="utf-8") as stream:
                data = json.load(stream)
        except (OSError, ValueError):
            return
        if isinstance(data, dict):
            for key, value in data.items():
                if str(key).isdigit() and isinstance(value, str) and value.strip():
                    self._game_name_cache.setdefault(int(key), value.strip())

    def _remember_game_name(self, appid: int, name: str) -> None:
        self._game_name_cache[appid] = name
        try:
            os.makedirs(self._settings_dir(), exist_ok=True)
            data: Dict[str, str] = {}
            try:
                with open(FINALLY_GAME_NAMES_FILE, "r", encoding="utf-8") as stream:
                    loaded = json.load(stream)
                if isinstance(loaded, dict):
                    data = {str(k): v for k, v in loaded.items() if isinstance(v, str)}
            except (OSError, ValueError):
                pass
            data[str(appid)] = name
            with open(FINALLY_GAME_NAMES_FILE, "w", encoding="utf-8") as stream:
                json.dump(data, stream, indent=2, sort_keys=True)
        except OSError as err:
            decky.logger.warning("Unable to save game names: %s", err)

    def _lookup_game_name_local(self, appid: int) -> Optional[str]:
        for library in self._steam_library_dirs():
            name = self._read_manifest_name(
                os.path.join(library, "steamapps", f"appmanifest_{appid}.acf")
            )
            if name:
                return name
        # Last local resort for mounts Steam's list doesn't mention.
        for pattern in (
            "/run/media/*/steamapps/appmanifest_{appid}.acf",
            "/run/media/*/*/steamapps/appmanifest_{appid}.acf",
            "/mnt/*/steamapps/appmanifest_{appid}.acf",
        ):
            for path in glob.glob(pattern.format(appid=appid)):
                name = self._read_manifest_name(path)
                if name:
                    return name
        return None

    def _fetch_game_name_from_store(self, appid: int) -> Optional[str]:
        try:
            data = self._download_icon_bytes(self.STORE_APPDETAILS_URL.format(appid=appid))
            payload = json.loads(data.decode("utf-8", errors="replace"))
            entry = payload.get(str(appid)) if isinstance(payload, dict) else None
            if isinstance(entry, dict) and entry.get("success"):
                name = (entry.get("data") or {}).get("name")
                if isinstance(name, str) and name.strip():
                    return name.strip()
        except Exception as err:
            decky.logger.warning("Store name lookup failed for appid=%s: %s", appid, err)
        return None

    async def _resolve_game_name_from_store(self, appid: int) -> None:
        name = await asyncio.to_thread(self._fetch_game_name_from_store, appid)
        if name:
            self._remember_game_name(appid, name)

    def _game_name(self, appid: int) -> str:
        """Best available name for a game; "App <id>" only while nothing
        has been found. Synchronous and quick: the store lookup, if needed,
        runs in the background and the name appears on a later call."""
        self._load_saved_game_names()
        cached = self._game_name_cache.get(appid)
        if cached:
            return cached

        now = time.monotonic()
        last_miss = self._game_name_local_miss.get(appid)
        if last_miss is None or now - last_miss >= self.GAME_NAME_LOCAL_MISS_TTL_SECONDS:
            name = self._lookup_game_name_local(appid)
            if name:
                self._remember_game_name(appid, name)
                return name
            self._game_name_local_miss[appid] = now

        last_try = self._game_name_store_tried.get(appid)
        if last_try is None or now - last_try >= self.GAME_NAME_STORE_RETRY_SECONDS:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None
            if loop is not None:
                self._game_name_store_tried[appid] = now
                loop.create_task(self._resolve_game_name_from_store(appid))
        return f"App {appid}"

    def _game_profile_info(self) -> Dict[str, Any]:
        appid = self._active_appid
        if appid is None:
            return {"available": False, "appid": None, "name": "", "enabled": False}
        entry = self._load_game_profiles().get(str(appid))
        enabled = bool(isinstance(entry, dict) and entry.get("enabled"))
        return {
            "available": True,
            "appid": appid,
            "name": self._game_name(appid),
            "enabled": enabled,
        }

    async def set_game_profile_enabled(self, enabled: bool) -> Dict[str, Any]:
        """Switch the running game's custom settings on or off. Turning on
        for the first time starts from a copy of the current global
        settings; later it restores whatever was saved."""
        appid = self._active_appid
        if appid is not None:
            profiles = self._load_game_profiles()
            entry = profiles.get(str(appid))
            if not isinstance(entry, dict):
                entry = {}
            if enabled and not isinstance(entry.get("settings"), dict):
                entry["settings"] = self._load_settings()
            entry["enabled"] = bool(enabled)
            entry["name"] = self._game_name(appid)
            profiles[str(appid)] = entry
            self._save_game_profiles(profiles)
            self._tracker_wake.set()
        return {"settings": self._effective_settings(), "game_profile": self._game_profile_info()}

    async def reset_game_profile(self) -> Dict[str, Any]:
        """Overwrite the running game's profile with the current global
        settings (keeps it switched on)."""
        appid = self._active_appid
        if appid is not None:
            profiles = self._load_game_profiles()
            entry = profiles.get(str(appid))
            if isinstance(entry, dict) and entry.get("enabled"):
                entry["settings"] = self._load_settings()
                self._save_game_profiles(profiles)
                self._tracker_wake.set()
        return {"settings": self._effective_settings(), "game_profile": self._game_profile_info()}

    async def get_steam_web_api_key_status(self) -> Dict[str, Any]:
        key = self._steam_api_key()
        if not key:
            return {"configured": False, "masked": None}
        return {"configured": True, "masked": self._mask_api_key(key)}

    async def set_steam_web_api_key(self, key: str) -> Dict[str, Any]:
        cleaned = (key or "").strip()
        if not re.fullmatch(r"[0-9A-Fa-f]{32}", cleaned):
            return {
                "ok": False,
                "error": "A Steam Web API key is 32 hex characters. Get one at "
                "https://steamcommunity.com/dev/apikey",
                "configured": bool(self._steam_api_key()),
                "masked": self._mask_api_key(self._steam_api_key()) if self._steam_api_key() else None,
            }

        key_path = STEAM_WEB_API_KEY_FILES[0]
        try:
            os.makedirs(os.path.dirname(key_path), exist_ok=True)
            with open(key_path, "w", encoding="utf-8") as stream:
                stream.write(cleaned)
            os.chmod(key_path, 0o600)
        except OSError as err:
            return {"ok": False, "error": f"Couldn't save key: {err}", "configured": False, "masked": None}

        # A stale schema-icon cache entry keyed to "no key" doesn't exist
        # (lookups without a key never happen), but clear it anyway in case
        # the user is switching from one key/account to another.
        self._steam_api_schema_icon_cache.clear()
        self._steam_api_schema_icongray_cache.clear()
        self._steam_api_schema_meta_cache.clear()
        return {"ok": True, "error": None, "configured": True, "masked": self._mask_api_key(cleaned)}

    async def clear_steam_web_api_key(self) -> Dict[str, Any]:
        for key_path in STEAM_WEB_API_KEY_FILES:
            try:
                os.remove(key_path)
            except OSError:
                continue
        self._steam_api_schema_icon_cache.clear()
        self._steam_api_schema_icongray_cache.clear()
        self._steam_api_schema_meta_cache.clear()
        return {"ok": True, "error": None, "configured": False, "masked": None}

    def _mask_api_key(self, key: Optional[str]) -> Optional[str]:
        if not key:
            return None
        return f"{'*' * max(len(key) - 4, 0)}{key[-4:]}"

    async def list_sounds(self) -> List[str]:
        return self._list_sound_files()

    async def get_sounds(self) -> Dict[str, Any]:
        """Selectable sounds (with whether each is built in or yours) and the
        folder to drop your own files into."""
        self._ensure_user_sounds_dir()
        return {
            "folder": self._user_sounds_dir(),
            "extensions": list(SOUND_EXTENSIONS),
            "sounds": self._sound_entries(),
        }

    @staticmethod
    def _rarity_tier(percent: Any, settings: Dict[str, Any]) -> Optional[str]:
        """"ultra_rare" / "rare" / "uncommon" / "common" from the global
        unlock percentage and the user's cutoffs; None when tiers are off or
        the percentage isn't known (never a guess)."""
        if not settings.get("rarity_tiers_enabled", True):
            return None
        if isinstance(percent, bool) or not isinstance(percent, (int, float)):
            return None
        if percent <= float(settings.get("tier_ultra_cutoff", TIER_ULTRA_RANGE[0])):
            return "ultra_rare"
        if percent <= float(settings.get("tier_rare_cutoff", TIER_RARE_RANGE[0])):
            return "rare"
        if percent <= float(settings.get("tier_uncommon_cutoff", TIER_UNCOMMON_RANGE[0])):
            return "uncommon"
        return "common"

    @staticmethod
    def _is_game_complete(event: Dict[str, Any]) -> bool:
        unlocked = event.get("unlocked")
        total = event.get("total")
        return (
            isinstance(unlocked, int)
            and isinstance(total, int)
            and not isinstance(unlocked, bool)
            and not isinstance(total, bool)
            and total > 0
            and unlocked >= total
        )

    def _schedule_completion_toast(self, appid: int) -> bool:
        """Queue the 100%-complete toast for a game, if enabled for it and
        not already shown a moment ago. Returns whether one was queued."""
        settings = self._settings_for(appid)
        if not settings.get("completion_toast_enabled", True):
            return False
        now = time.monotonic()
        last = self._completion_last.get(appid)
        if last is not None and now - last < COMPLETION_DEDUPE_SECONDS:
            return False
        self._completion_last[appid] = now
        asyncio.create_task(self._emit_completion_toast(appid))
        return True

    async def _emit_completion_toast(self, appid: Optional[int], delay: Optional[float] = None) -> None:
        """The distinct "Pinnacle" toast shown when every achievement in a game
        is unlocked. Waits briefly so the last achievement's own toast is
        already queued (the overlay lock is FIFO), then shows after it."""
        try:
            if delay is None:
                delay = COMPLETION_DELAY_SECONDS
            if delay > 0:
                await asyncio.sleep(delay)
            game = self._game_name(appid) if appid is not None else "Sample Game"
            settings_appid = appid if appid is not None else self._active_appid
            title_key = str(self._settings_for(settings_appid).get("completion_title", COMPLETION_TITLE_DEFAULT))
            timestamp = dt.datetime.now(dt.timezone.utc).isoformat()
            payload = {
                "title": self._tr(COMPLETION_TITLES.get(title_key, COMPLETION_TITLES[COMPLETION_TITLE_DEFAULT])),
                "subtitle": game,
                "is_rare": True,
                "percent": None,
                "timestamp": timestamp,
                "appid": appid,
                "achievement_id": None,
                "icon_url": None,
                "icon_path": None,
                "placeholder_icon_path": None,
                "game_art_path": None,
                "settings_appid": settings_appid,
                "template_override": COMPLETION_TEMPLATE,
                "min_seconds": COMPLETION_MIN_SECONDS,
                "completion": True,
            }
            asyncio.create_task(self._show_gamescope_overlay(payload))
            await decky.emit("finally_show", payload)
            self._last_match_timestamp = timestamp
            self._last_match_sample = f"completion appid={appid}"
            self._last_match_source = "completion"
            decky.logger.info("Completion toast emitted for appid=%s (%s)", appid, game)
        except Exception as err:
            decky.logger.warning("Completion toast failed: %s", err)

    # ---- unlock history, session summary, near-completion, share cards ----

    def _history_path(self) -> str:
        return os.path.join(self._settings_dir(), "history.json")

    def _history_list(self) -> List[Dict[str, Any]]:
        if self._history is None:
            data = None
            try:
                with open(self._history_path(), "r", encoding="utf-8") as stream:
                    data = json.load(stream)
            except (OSError, ValueError):
                data = None
            items = data.get("unlocks") if isinstance(data, dict) else None
            self._history = [e for e in items if isinstance(e, dict)] if isinstance(items, list) else []
        return self._history

    def _save_history(self) -> None:
        try:
            os.makedirs(self._settings_dir(), exist_ok=True)
            tmp = self._history_path() + ".tmp"
            with open(tmp, "w", encoding="utf-8") as stream:
                json.dump({"unlocks": self._history_list()}, stream, ensure_ascii=False)
            os.replace(tmp, self._history_path())
        except OSError as err:
            decky.logger.warning("Could not save unlock history: %s", err)

    def _record_unlock(self, payload: Dict[str, Any]) -> None:
        """Called for every real (non-test) unlock popup: logs it to the
        history and counts it toward the current play session."""
        appid = payload.get("appid")
        if not isinstance(appid, int) or not payload.get("achievement_id"):
            return
        game = self._game_name(appid)
        tier = payload.get("tier")
        rare = bool(payload.get("is_rare")) or tier in ("rare", "ultra_rare")
        entry = {
            "ts": payload.get("timestamp"),
            "appid": appid,
            "game": game,
            "id": payload.get("achievement_id"),
            "title": payload.get("title") or "",
            "subtitle": payload.get("subtitle") or "",
            "percent": payload.get("percent"),
            "tier": tier,
            "rare": rare,
            "icon_path": payload.get("icon_path"),
        }
        history = self._history_list()
        history.append(entry)
        if len(history) > HISTORY_MAX_ENTRIES:
            del history[: len(history) - HISTORY_MAX_ENTRIES]
        self._save_history()

        session = self._session
        if session is None or session.get("appid") != appid:
            session = {"appid": appid, "unlocks": 0, "rare": 0}
            self._session = session
        session["unlocks"] += 1
        if rare:
            session["rare"] += 1

    async def _describe_achievement(self, appid: int, achievement_id: str) -> str:
        """The description of an achievement, for popups whose detection path
        didn't carry one (Steam's web data leaves it empty for secret
        achievements, and the library cache can lag). Looked up, in order, in
        Steam's own local schema (every language, secret ones included; instant),
        then asked of Steam through the list helper. A failed lookup can be
        retried a couple of times; it is not given up on after one try."""
        cache = self._desc_cache.setdefault(appid, {})
        if achievement_id in cache:
            return cache[achievement_id]
        _name, local = await asyncio.to_thread(self._local_achievement_text, appid, achievement_id)
        if local:
            cache[achievement_id] = local
            return local
        key = (appid, achievement_id)
        if key in self._desc_tried:
            return ""
        attempts = self._desc_attempts.get(key, 0) + 1
        self._desc_attempts[key] = attempts
        if attempts >= DESCRIPTION_MAX_ATTEMPTS:
            self._desc_tried.add(key)
        if not os.path.exists(self._steamworks_lib_path()):
            return ""
        probe = await self._run_oneshot_probe(appid, STEAMWORKS_LIST_HELPER_NAME)
        for item in probe.get("achievements", []) if isinstance(probe, dict) else []:
            text = str(item.get("desc") or "").strip()
            if text and item.get("id"):
                cache[str(item["id"])] = text
        if achievement_id in cache:
            self._desc_tried.add(key)
        return cache.get(achievement_id, "")

    async def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            limit = max(1, min(HISTORY_MAX_ENTRIES, int(limit)))
        except (TypeError, ValueError):
            limit = 50
        newest_first = list(reversed(self._history_list()))[:limit]
        return [{k: v for k, v in e.items() if k != "icon_path"} for e in newest_first]

    async def clear_history(self) -> bool:
        self._history = []
        self._save_history()
        return True

    async def _emit_milestone_toast(
        self, appid: Optional[int], title: str, subtitle: str, delay: float = 0.0, label: str = "milestone"
    ) -> None:
        """A free-standing popup (session summary, "only N left") in the
        same look as the completion popup, but without its completion sound."""
        try:
            if delay > 0:
                await asyncio.sleep(delay)
            settings_appid = appid if appid is not None else self._active_appid
            icon_path = await asyncio.to_thread(self._game_icon_path, appid) if appid is not None else None
            timestamp = dt.datetime.now(dt.timezone.utc).isoformat()
            payload = {
                "title": title,
                "subtitle": subtitle,
                "is_rare": False,
                "tier": None,
                "percent": None,
                "timestamp": timestamp,
                "appid": appid,
                "achievement_id": None,
                "icon_url": None,
                "icon_path": icon_path,
                "placeholder_icon_path": None,
                "game_art_path": None,
                "settings_appid": settings_appid,
                "template_override": COMPLETION_TEMPLATE,
                "min_seconds": MILESTONE_MIN_SECONDS,
                "completion": False,
            }
            asyncio.create_task(self._show_gamescope_overlay(payload))
            await decky.emit("finally_show", payload)
            self._last_match_timestamp = timestamp
            self._last_match_sample = f"{label} appid={appid}"
            self._last_match_source = label
            decky.logger.info("Milestone toast (%s) for appid=%s: %s", label, appid, title)
        except Exception as err:
            decky.logger.warning("Milestone toast failed: %s", err)

    def _session_summary_text(self, unlocked: int, rare: int) -> str:
        if rare > 0:
            return self._tr("{count} unlocked, {rare} rare", count=unlocked, rare=rare)
        return self._tr("{count} unlocked", count=unlocked)

    def _near_completion_text(self, remaining: int) -> str:
        if remaining == 1:
            return self._tr("Only 1 achievement left")
        return self._tr("Only {count} achievements left", count=remaining)

    def _end_session(self) -> None:
        session, self._session = self._session, None
        if not session or not session.get("unlocks"):
            return
        appid = session.get("appid")
        if not isinstance(appid, int):
            return
        if not self._settings_for(appid).get("session_summary_enabled", True):
            return
        title = self._session_summary_text(int(session["unlocks"]), int(session.get("rare", 0)))
        asyncio.create_task(
            self._emit_milestone_toast(appid, title, self._game_name(appid), label="session_summary")
        )

    def _maybe_near_completion(self, appid: int, event: Dict[str, Any]) -> None:
        unlocked, total = event.get("unlocked"), event.get("total")
        if not all(isinstance(v, int) and not isinstance(v, bool) for v in (unlocked, total)):
            return
        remaining = total - unlocked
        settings = self._settings_for(appid)
        if not settings.get("near_completion_enabled", True):
            return
        threshold = int(settings.get("near_completion_threshold", DEFAULT_SETTINGS["near_completion_threshold"]))
        # Not for finished games (the completion popup covers those) and not
        # for tiny achievement lists, where "2 left" is just most of the game.
        if remaining < 1 or remaining > threshold or total < 2 * threshold + 2:
            return
        key = (appid, remaining)
        if key in self._near_notified:
            return
        self._near_notified.add(key)
        asyncio.create_task(
            self._emit_milestone_toast(
                appid,
                self._near_completion_text(remaining),
                self._game_name(appid),
                delay=COMPLETION_DELAY_SECONDS,
                label="near_completion",
            )
        )

    async def test_session_popup(self) -> None:
        appid = self._active_appid
        game = self._game_name(appid) if appid is not None else "Sample Game"
        await self._emit_milestone_toast(appid, self._session_summary_text(3, 1), game, label="session_summary")

    async def test_near_completion_popup(self) -> None:
        appid = self._active_appid
        game = self._game_name(appid) if appid is not None else "Sample Game"
        await self._emit_milestone_toast(appid, self._near_completion_text(2), game, label="near_completion")

    @staticmethod
    def _file_data_uri(path: Optional[str], limit: int = 6_000_000) -> Optional[str]:
        if not path or not os.path.isfile(path):
            return None
        try:
            if os.path.getsize(path) > limit:
                return None
            with open(path, "rb") as stream:
                data = stream.read()
        except OSError:
            return None
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            mime = "image/png"
        elif data[:3] == b"\xff\xd8\xff":
            mime = "image/jpeg"
        elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            mime = "image/webp"
        else:
            return None
        return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"

    async def get_share_assets(self, appid: int, achievement_id: str, ts: str = "") -> Dict[str, Any]:
        """Images (as data URIs) for the panel to draw a share card from."""
        entry = None
        for candidate in reversed(self._history_list()):
            if candidate.get("appid") == appid and candidate.get("id") == achievement_id and (
                not ts or candidate.get("ts") == ts
            ):
                entry = candidate
                break
        icon_path = entry.get("icon_path") if entry else None
        if not icon_path or not os.path.isfile(str(icon_path)):
            icon_path = self._achievement_icon_from_cache_file(appid, achievement_id)
        art_path = await asyncio.to_thread(self._game_art_path, appid)
        return {
            "icon": self._file_data_uri(icon_path),
            "art": self._file_data_uri(art_path),
        }

    def _achievement_icon_from_cache_file(self, appid: int, achievement_id: str) -> Optional[str]:
        url = self._achievement_icon_from_cache(appid, achievement_id)
        if not url:
            return None
        try:
            return self._icon_cache_path(appid, achievement_id, url)
        except Exception:
            return None

    def _share_dir(self) -> str:
        home = getattr(decky, "DECKY_USER_HOME", None) or "/home/deck"
        for base in (os.path.join(home, "Pictures"), home):
            if os.path.isdir(base):
                return os.path.join(base, SHARE_DIR_NAME)
        return os.path.join(self._settings_dir(), SHARE_DIR_NAME)

    async def save_share_card(self, png_base64: str, name: str = "achievement") -> Dict[str, Any]:
        """Saves a card image the panel drew. Returns the path (or an error)."""
        try:
            raw = base64.b64decode(png_base64.split(",", 1)[-1], validate=False)
        except Exception:
            return {"ok": False, "error": "bad image data"}
        if raw[:8] != b"\x89PNG\r\n\x1a\n" or len(raw) > 12_000_000:
            return {"ok": False, "error": "not a PNG"}
        safe = re.sub(r"[^A-Za-z0-9._-]+", "_", str(name))[:60].strip("._") or "achievement"
        stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
        directory = self._share_dir()
        try:
            os.makedirs(directory, exist_ok=True)
            path = os.path.join(directory, f"{safe}-{stamp}.png")
            with open(path, "wb") as stream:
                stream.write(raw)
            try:
                st = os.stat(os.path.dirname(directory) or directory)
                os.chown(directory, st.st_uid, st.st_gid)
                os.chown(path, st.st_uid, st.st_gid)
            except OSError:
                pass
        except OSError as err:
            return {"ok": False, "error": str(err)}
        return {"ok": True, "path": path}

    def _start_background(self, coroutine: Any) -> None:
        task = asyncio.create_task(coroutine)
        task.add_done_callback(self._log_background_failure)

    # ------------------------------------------------------------------
    # Screenshot on unlock
    # ------------------------------------------------------------------
    def _screenshot_dir(self) -> str:
        return os.path.join(self._share_dir(), SCREENSHOT_DIR_NAME)

    @staticmethod
    def _looks_like_complete_png(path: str) -> bool:
        try:
            size = os.path.getsize(path)
            if size < 1000:
                return False
            with open(path, "rb") as stream:
                head = stream.read(8)
                stream.seek(-12, os.SEEK_END)
                tail = stream.read(12)
            return head == b"\x89PNG\r\n\x1a\n" and tail[4:8] == b"IEND"
        except OSError:
            return False

    async def _request_gamescope_screenshot(self, include_popup: bool) -> Optional[str]:
        """Asks gamescope for a screenshot. Returns an error text, or None once the request was sent."""
        helper_path = os.path.join(decky.DECKY_PLUGIN_DIR, SCREENSHOT_HELPER_NAME)
        if not os.path.exists(helper_path):
            return f"missing helper: {helper_path}"
        env = os.environ.copy()
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        env["XDG_RUNTIME_DIR"] = self._runtime_dir()
        last_error = "no display to ask"
        for display, authority in self._overlay_attempts():
            env["DISPLAY"] = display
            if authority:
                env["XAUTHORITY"] = authority
            else:
                env.pop("XAUTHORITY", None)
            try:
                process = await asyncio.create_subprocess_exec(
                    STEAMWORKS_PYTHON, helper_path, "2" if include_popup else "1",
                    env=env, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
                )
                _out, err = await asyncio.wait_for(process.communicate(), timeout=6.0)
            except (asyncio.TimeoutError, OSError) as exc:
                last_error = str(exc) or "screenshot request timed out"
                continue
            if process.returncode == 0:
                return None
            last_error = err.decode("utf-8", errors="replace").strip()[-200:] or f"helper exit {process.returncode}"
        return last_error

    def _prune_screenshots(self, directory: str) -> None:
        try:
            files = [
                os.path.join(directory, name) for name in os.listdir(directory)
                if name.lower().endswith(".png")
            ]
            if len(files) <= SCREENSHOT_KEEP_MAX:
                return
            files.sort(key=lambda f: os.path.getmtime(f))
            for old in files[: len(files) - SCREENSHOT_KEEP_MAX]:
                os.unlink(old)
        except OSError:
            pass

    async def take_screenshot_now(self, label: str = "", include_popup: bool = False) -> Dict[str, Any]:
        """Takes one screenshot of the screen and saves it. Returns {"ok", "path"} or {"ok": False, "error"}."""
        async with self._screenshot_lock:
            try:
                os.unlink(GAMESCOPE_SCREENSHOT_PATH)       # so a leftover picture can't be mistaken for the new one
            except FileNotFoundError:
                pass
            except OSError as err:
                decky.logger.info("Old screenshot file not removed: %s", err)
            started = time.time()
            error = await self._request_gamescope_screenshot(include_popup)
            if error:
                return {"ok": False, "error": error}
            deadline = time.monotonic() + SCREENSHOT_WAIT_SECONDS
            while time.monotonic() < deadline:
                await asyncio.sleep(0.2)
                try:
                    fresh = os.path.getmtime(GAMESCOPE_SCREENSHOT_PATH) >= started - 1.0
                except OSError:
                    continue
                if fresh and self._looks_like_complete_png(GAMESCOPE_SCREENSHOT_PATH):
                    break
            else:
                return {"ok": False, "error": "Gamescope did not write a screenshot (are you in Game Mode?)"}

            safe = re.sub(r"[^A-Za-z0-9._ -]+", "_", str(label))[:80].strip("._ ") or "achievement"
            stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
            directory = self._screenshot_dir()
            try:
                os.makedirs(directory, exist_ok=True)
                path = os.path.join(directory, f"{safe}-{stamp}.png")
                with open(GAMESCOPE_SCREENSHOT_PATH, "rb") as src, open(path, "wb") as dst:
                    dst.write(src.read())
                try:
                    home = getattr(decky, "DECKY_USER_HOME", None) or "/home/deck"
                    st = os.stat(home)
                    for target in (os.path.dirname(directory), directory, path):
                        os.chown(target, st.st_uid, st.st_gid)
                except OSError:
                    pass
            except OSError as err:
                return {"ok": False, "error": str(err)}
            self._prune_screenshots(directory)
            return {"ok": True, "path": path}

    async def _screenshot_for_unlock(self, payload: Dict[str, Any], delay: float, include_popup: bool) -> None:
        if delay > 0:
            await asyncio.sleep(delay)
        game = str(payload.get("game_name") or "").strip()
        title = str(payload.get("title") or "").strip()
        label = " - ".join(part for part in (game, title) if part) or "achievement"
        result = await self.take_screenshot_now(label, include_popup)
        if result.get("ok"):
            decky.logger.info("Unlock screenshot saved: %s", result.get("path"))
        else:
            decky.logger.warning("Unlock screenshot failed: %s", result.get("error"))

    async def test_screenshot(self) -> Dict[str, Any]:
        """The panel's test button: one screenshot right now, with the popup included if that option is on."""
        settings = self._effective_settings()
        return await self.take_screenshot_now("test", bool(settings.get("screenshot_include_popup")))

    # ------------------------------------------------------------------
    # Template preview for the panel
    # ------------------------------------------------------------------
    async def get_template_preview(self, template: str = "", tier: str = "common") -> Dict[str, Any]:
        """An animated PNG (as a data URI) of the whole popup in the chosen template, drawn by the same
        renderer as the real popup, with the current colors, fonts and options. `template` previews a template
        without saving it; `tier` is common, uncommon, rare or ultra_rare."""
        import tempfile

        helper_path = os.path.join(decky.DECKY_PLUGIN_DIR, FINALLY_OVERLAY_HELPER_NAME)
        if not os.path.exists(helper_path):
            return {"ok": False, "error": "missing helper"}
        if tier not in ("common", "uncommon", "rare", "ultra_rare"):
            tier = "common"
        settings = self._effective_settings()
        chosen = str(template or "").strip().lower()
        if chosen not in OVERLAY_TEMPLATES:
            chosen = str(settings.get("overlay_template") or DEFAULT_SETTINGS["overlay_template"])
        title, subtitle = (self._tr(text) for text in self.TEST_TIER_SAMPLES[tier])
        icon_path = None
        if self._active_appid is not None:
            icon_path = await self._within_budget(
                asyncio.to_thread(self._game_icon_path, self._active_appid), 1.0
            )
        payload = {
            "title": title,
            "subtitle": subtitle,
            "is_rare": tier in ("rare", "ultra_rare"),
            "tier": None if tier == "common" else tier,
            "percent": self._sample_percent_for_tier(tier, settings),
            "icon_path": icon_path,
            "placeholder_icon_path": icon_path,
            "template_override": chosen,
            "settings_appid": self._active_appid,
        }
        game_art = None
        if self._active_appid is not None and (
            chosen == "game_art" or (settings.get("game_art_gradient_enabled") and not settings.get("template_colors_enabled"))
        ):
            game_art = await self._within_budget(asyncio.to_thread(self._game_art_path, self._active_appid), 1.0)
        payload["game_art_path"] = game_art
        env_vars = self._overlay_env_vars(settings, payload)
        env_vars["FINALLY_GAME_NAME"] = ""
        # Same inputs, same picture: reuse the last one.
        cache_key = hashlib.sha1(
            json.dumps(
                [sorted(env_vars.items()), [os.path.getmtime(f) if f and os.path.exists(f) else 0 for f in (icon_path, game_art)]],
                sort_keys=True, default=str,
            ).encode()
        ).hexdigest()
        cached = self._preview_cache.get(cache_key)
        if cached:
            return {"ok": True, "image": cached, "template": chosen}

        fd, out_path = tempfile.mkstemp(suffix=".png", prefix="finally-preview-")
        os.close(fd)
        try:
            env = os.environ.copy()
            env.pop("LD_LIBRARY_PATH", None)
            env.pop("LD_PRELOAD", None)
            env.update(env_vars)
            env["FINALLY_PREVIEW_PATH"] = out_path
            try:
                process = await asyncio.create_subprocess_exec(
                    STEAMWORKS_PYTHON, helper_path,
                    env=env, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
                )
                _out, err = await asyncio.wait_for(process.communicate(), timeout=PREVIEW_TIMEOUT_SECONDS)
            except asyncio.TimeoutError:
                return {"ok": False, "error": "preview timed out"}
            except OSError as exc:
                return {"ok": False, "error": str(exc)}
            if process.returncode != 0:
                return {"ok": False, "error": err.decode("utf-8", errors="replace").strip()[-300:] or f"exit {process.returncode}"}
            try:
                with open(out_path, "rb") as stream:
                    raw = stream.read()
            except OSError as exc:
                return {"ok": False, "error": str(exc)}
            if raw[:8] != b"\x89PNG\r\n\x1a\n" or len(raw) > PREVIEW_MAX_BYTES:
                return {"ok": False, "error": "preview was not a picture"}
            image = "data:image/png;base64," + base64.b64encode(raw).decode("ascii")
            if len(self._preview_cache) >= PREVIEW_CACHE_MAX:
                self._preview_cache.pop(next(iter(self._preview_cache)))
            self._preview_cache[cache_key] = image
            return {"ok": True, "image": image, "template": chosen}
        finally:
            try:
                os.unlink(out_path)
            except OSError:
                pass

    async def test_completion_popup(self) -> None:
        await self._emit_completion_toast(self._active_appid, delay=0.0)

    # ------------------------------------------------------------------
    # Test popups
    #
    # One test per tier. When a game is running (and the setting allows) the
    # test shows a RANDOM achievement from that game -- locked or unlocked --
    # with its real name, description and icon, plus the game's artwork for
    # the gradient/placeholder options. It is display-only: `test=True`
    # keeps it out of the "already shown" bookkeeping, so testing a locked
    # achievement can never suppress its real popup later.
    # ------------------------------------------------------------------

    TEST_TIER_SAMPLES = {
        "common": ("Achievement Unlocked", "Manual common popup test"),
        "uncommon": ("Uncommon Achievement", "Manual uncommon popup test"),
        "rare": ("Rare Achievement Unlocked", "Manual rare popup test"),
        "ultra_rare": ("Ultra Rare Achievement", "Manual ultra rare popup test"),
    }

    @staticmethod
    def _sample_percent_for_tier(tier: str, settings: Dict[str, Any]) -> float:
        """A percentage that lands squarely inside the tier for the user's
        current cutoffs (so the test shows the tier no matter how they set
        the sliders)."""
        ultra = float(settings.get("tier_ultra_cutoff", TIER_ULTRA_RANGE[0]))
        rare = float(settings.get("tier_rare_cutoff", TIER_RARE_RANGE[0]))
        uncommon = float(settings.get("tier_uncommon_cutoff", TIER_UNCOMMON_RANGE[0]))
        if tier == "ultra_rare":
            return round(max(ultra / 2.0, 0.05), 2)
        if tier == "rare":
            return round((ultra + rare) / 2.0, 1)
        if tier == "uncommon":
            return round((rare + uncommon) / 2.0, 1)
        return round(min((uncommon + 100.0) / 2.0, 95.0), 1)

    async def _random_game_achievement_api(self, appid: int) -> Optional[Dict[str, Any]]:
        """Preferred source for tests: a random achievement from the game's
        Steam Web API schema (needs the API key). Lists every achievement,
        locked or not, with its real name, description and *colored* icon,
        independent of what Steam's local cache happens to hold. None when
        there's no key, the call fails, or the schema is empty."""
        key = self._steam_api_key()
        if not key:
            return None
        try:
            await self._steam_api_schema_icons(appid, key)
        except Exception as err:
            decky.logger.warning("Test achievement: Web API schema fetch failed for %s: %s", appid, err)
            return None
        meta = self._steam_api_schema_meta_cache.get(appid) or []
        usable = [a for a in meta if a.get("id") and a.get("name")]
        if not usable:
            return None
        pick = dict(random.choice(usable))
        pick["source"] = "steam_web_api"
        return pick

    def _random_game_achievement(self, appid: int) -> Optional[Dict[str, Any]]:
        """A random achievement (locked or unlocked) from Steam's local
        cache for the game, or None if the cache has nothing usable."""
        path = self._librarycache_path_for_appid(appid)
        if path is None:
            return None
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception:
            return None
        achievements = self._sections_from_cache(payload).get("achievements")
        if not isinstance(achievements, dict):
            return None
        found: Dict[str, Dict[str, Any]] = {}
        for _section, values in self._achievement_lists(achievements):
            for item in values:
                if not isinstance(item, dict):
                    continue
                aid = item.get("strID")
                name = item.get("strName")
                if not isinstance(aid, str) or not aid or not isinstance(name, str) or not name.strip():
                    continue
                found.setdefault(
                    aid,
                    {
                        "id": aid,
                        "name": name.strip(),
                        "desc": str(item.get("strDescription") or "").strip(),
                        "icon": item.get("strImage") if isinstance(item.get("strImage"), str) else None,
                        "achieved": item.get("bAchieved") is True,
                    },
                )
        if not found:
            return None
        return random.choice(list(found.values()))

    async def _run_tier_test(self, tier: str) -> None:
        settings = self._effective_settings()
        percent = self._sample_percent_for_tier(tier, settings)
        is_rare = tier in ("rare", "ultra_rare")
        appid = self._active_appid
        pick = None
        if appid is not None and settings.get("test_with_game_data", True):
            # Steam Web API first (all achievements, colored icons); Steam's
            # local cache only as the fallback.
            pick = await self._random_game_achievement_api(appid)
            if pick is None:
                pick = await asyncio.to_thread(self._random_game_achievement, appid)

        if pick is not None:
            await self._emit_notification(
                title=pick["name"],
                subtitle=pick["desc"],
                is_rare=is_rare,
                line_hint=f"manual:test:{tier}:{appid}:{pick['id']}",
                source="manual_game_test",
                dedupe_key=f"manual:{tier}:{time.monotonic()}",
                appid=appid,
                achievement_id=pick["id"],
                icon_url=pick["icon"],
                percent=percent,
                test=True,
            )
            return

        title, subtitle = (self._tr(text) for text in self.TEST_TIER_SAMPLES[tier])
        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=f"manual:test:{tier}",
            source="manual",
            dedupe_key=f"manual:{tier}:{time.monotonic()}",
            percent=percent,
            test=True,
        )

    async def test_popup_common(self) -> None:
        await self._run_tier_test("common")

    async def test_popup_uncommon(self) -> None:
        await self._run_tier_test("uncommon")

    async def test_popup_rare(self) -> None:
        await self._run_tier_test("rare")

    async def test_popup_ultra_rare(self) -> None:
        await self._run_tier_test("ultra_rare")

    # Older names, kept so a panel built before these buttons existed still works.
    async def test_popup_main(self) -> None:
        await self._run_tier_test("common")

    async def test_xbox_popup(self) -> None:
        await self._run_tier_test("ultra_rare")

    async def test_xbox_theme(self) -> None:
        await self._run_tier_test("ultra_rare")

    def _settings_dir(self) -> str:
        return FINALLY_SETTINGS_DIR

    def _sound_dir(self) -> str:
        return os.path.join(decky.DECKY_PLUGIN_DIR, "assets", SOUNDS_DIR_NAME)

    def _user_sounds_dir(self) -> str:
        return FINALLY_USER_SOUNDS_DIR

    def _ensure_user_sounds_dir(self) -> None:
        """Creates the "drop your sounds here" folder (with a short note)."""
        try:
            os.makedirs(self._user_sounds_dir(), exist_ok=True)
            note = os.path.join(self._user_sounds_dir(), "PUT YOUR SOUNDS HERE.txt")
            if not os.path.exists(note) and not any(
                e.lower().endswith(SOUND_EXTENSIONS) for e in os.listdir(self._user_sounds_dir())
            ):
                with open(note, "w", encoding="utf-8") as stream:
                    stream.write(
                        "Drop your own short sound files in this folder (.wav, .flac, .ogg, .mp3, .aiff; "
                        "10 MB or less; anything longer than ~20 seconds is cut off), then open the Finally Achievement Plugin panel "
                        "-> Sound & tests -> Refresh sound list and pick them for each popup type.\n"
                        "This folder is kept when the plugin is updated.\n"
                    )
        except OSError as err:
            decky.logger.warning("Couldn't create the user sounds folder: %s", err)

    @staticmethod
    def _is_sound_file(directory: str, entry: str, allowed: Tuple[str, ...]) -> bool:
        if entry.startswith(".") or not entry.lower().endswith(allowed):
            return False
        path = os.path.join(directory, entry)
        try:
            return os.path.isfile(path) and 0 < os.path.getsize(path) <= SOUND_MAX_BYTES
        except OSError:
            return False

    def _sound_entries(self) -> List[Dict[str, str]]:
        """Every selectable sound as {"name", "source"} ("builtin" or "user").
        Bundled sounds are .wav only; your own can be any of SOUND_EXTENSIONS.
        A file of yours with the same name as a bundled one replaces it."""
        found: Dict[str, str] = {}
        for sound_dir in (self._sound_dir(), os.path.join(decky.DECKY_PLUGIN_DIR, "assets")):
            try:
                for entry in os.listdir(sound_dir):
                    if self._is_sound_file(sound_dir, entry, (".wav",)):
                        found.setdefault(entry, "builtin")
            except OSError:
                continue
        try:
            for entry in os.listdir(self._user_sounds_dir()):
                if self._is_sound_file(self._user_sounds_dir(), entry, SOUND_EXTENSIONS):
                    found[entry] = "user"
        except OSError:
            pass
        return [{"name": n, "source": found[n]} for n in sorted(found, key=str.lower)]

    def _list_sound_files(self) -> List[str]:
        return [entry["name"] for entry in self._sound_entries()]

    def _coerce_percent(self, value: Any, default: int, step: int = 10) -> int:
        """0-100, rounded to the nearest `step` (10 for volume; the popup
        size slider uses 5)."""
        try:
            percent = int(round(float(value)))
        except (TypeError, ValueError):
            return default
        return max(0, min(100, int(round(percent / step) * step)))

    def _coerce_int_range(self, value: Any, default: int, lo: int, hi: int) -> int:
        try:
            number = int(round(float(value)))
        except (TypeError, ValueError):
            return default
        return max(lo, min(hi, number))

    def _coerce_float_range(
        self, value: Any, default: float, lo: float, hi: float, step: float = 0.5
    ) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return default
        number = max(lo, min(hi, number))
        # Snap to the same step the slider moves in, avoiding float drift
        # (e.g. 5.7999999999999998) from repeated round-trips through JSON.
        return round(round(number / step) * step, 2)

    def _sanitize_color(self, value: Any, default: str) -> str:
        if not isinstance(value, str):
            return default

        color = value.strip()
        if re.fullmatch(
            r"hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+)\s*)?\)",
            color,
            re.IGNORECASE,
        ):
            return color
        if re.fullmatch(r"#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?", color):
            return color
        return default

    def _sanitize_settings(self, raw_settings: Dict[str, Any]) -> Dict[str, Any]:
        settings = dict(DEFAULT_SETTINGS)
        # Older saved settings had one "normal" and one "rare" sound; carry
        # those over to the new per-tier slots when a slot hasn't been set yet.
        legacy = {
            "common": raw_settings.get("normal_sound"),
            "uncommon": raw_settings.get("normal_sound"),
            "rare": raw_settings.get("rare_sound"),
            "ultra_rare": raw_settings.get("rare_sound"),
            "completion": raw_settings.get("rare_sound"),
        }
        for slot in SOUND_SLOTS:
            key = f"sound_{slot}"
            value = raw_settings.get(key)
            if not isinstance(value, str):
                value = legacy[slot]
            if isinstance(value, str):
                settings[key] = value

        # Popup size moves in steps of 5; volume stays in steps of 10.
        for key, step in (("overlay_size_percent", 5), ("volume_percent", 10)):
            settings[key] = self._coerce_percent(raw_settings.get(key), int(settings[key]), step)

        position = raw_settings.get("overlay_position")
        if isinstance(position, str) and position.strip().lower() in OVERLAY_POSITIONS:
            settings["overlay_position"] = position.strip().lower()
        else:
            settings["overlay_position"] = DEFAULT_SETTINGS["overlay_position"]

        screen = raw_settings.get("overlay_screen")
        if isinstance(screen, str) and screen.strip().lower() in SCREEN_SIZE_CHOICES:
            settings["overlay_screen"] = screen.strip().lower()
        else:
            settings["overlay_screen"] = DEFAULT_SETTINGS["overlay_screen"]

        language = raw_settings.get("language")
        if isinstance(language, str) and language.strip() in LANGUAGE_CHOICES:
            settings["language"] = language.strip()
        else:
            settings["language"] = DEFAULT_SETTINGS["language"]

        template = raw_settings.get("overlay_template")
        if isinstance(template, str) and template.strip().lower() in OVERLAY_TEMPLATES:
            settings["overlay_template"] = template.strip().lower()
        else:
            settings["overlay_template"] = DEFAULT_SETTINGS["overlay_template"]

        for key, (default, lo, hi) in FONT_SIZE_RANGES.items():
            settings[key] = self._coerce_int_range(raw_settings.get(key), default, lo, hi)

        duration_default, duration_lo, duration_hi = DURATION_RANGE
        settings["duration_seconds"] = self._coerce_float_range(
            raw_settings.get("duration_seconds"), duration_default, duration_lo, duration_hi
        )

        settings["icon_glow_enabled"] = bool(
            raw_settings.get("icon_glow_enabled", DEFAULT_SETTINGS["icon_glow_enabled"])
        )
        settings["ring_size"] = self._coerce_int_range(
            raw_settings.get("ring_size"), DEFAULT_SETTINGS["ring_size"], 0, 100
        )
        settings["icon_glow_intensity"] = self._coerce_int_range(
            raw_settings.get("icon_glow_intensity"), DEFAULT_SETTINGS["icon_glow_intensity"], 0, 100
        )

        gradient_direction = raw_settings.get("gradient_direction")
        if isinstance(gradient_direction, str) and gradient_direction.strip().lower() in GRADIENT_DIRECTIONS:
            settings["gradient_direction"] = gradient_direction.strip().lower()
        else:
            settings["gradient_direction"] = DEFAULT_SETTINGS["gradient_direction"]

        settings["glow_normal_enabled"] = bool(
            raw_settings.get("glow_normal_enabled", DEFAULT_SETTINGS["glow_normal_enabled"])
        )
        settings["icon_frame_ring_enabled"] = bool(
            raw_settings.get("icon_frame_ring_enabled", DEFAULT_SETTINGS["icon_frame_ring_enabled"])
        )
        settings["show_percent"] = bool(
            raw_settings.get("show_percent", DEFAULT_SETTINGS["show_percent"])
        )
        placeholder_icon = raw_settings.get("placeholder_icon")
        if isinstance(placeholder_icon, str) and placeholder_icon.strip().lower() in PLACEHOLDER_ICON_STYLES:
            settings["placeholder_icon"] = placeholder_icon.strip().lower()
        else:
            settings["placeholder_icon"] = DEFAULT_SETTINGS["placeholder_icon"]
        settings["icon_gradient_enabled"] = bool(
            raw_settings.get("icon_gradient_enabled", DEFAULT_SETTINGS["icon_gradient_enabled"])
        )
        completion_title = raw_settings.get("completion_title")
        if isinstance(completion_title, str) and completion_title.strip().lower() in COMPLETION_TITLES:
            settings["completion_title"] = completion_title.strip().lower()
        else:
            settings["completion_title"] = DEFAULT_SETTINGS["completion_title"]
        percent_position = raw_settings.get("percent_position")
        settings["percent_position"] = (
            percent_position if percent_position in PERCENT_POSITIONS else DEFAULT_SETTINGS["percent_position"]
        )
        settings["percent_size"] = self._coerce_int_range(
            raw_settings.get("percent_size"), PERCENT_SIZE_RANGE[0], PERCENT_SIZE_RANGE[1], PERCENT_SIZE_RANGE[2]
        )
        tracker_position = raw_settings.get("tracker_position")
        settings["tracker_position"] = (
            tracker_position if tracker_position in TRACKER_POSITIONS else DEFAULT_SETTINGS["tracker_position"]
        )
        tracker_template = raw_settings.get("tracker_template")
        if isinstance(tracker_template, str) and tracker_template.strip().lower() in ("same",) + OVERLAY_TEMPLATES:
            settings["tracker_template"] = tracker_template.strip().lower()
        else:
            settings["tracker_template"] = DEFAULT_SETTINGS["tracker_template"]
        settings["tracker_size_percent"] = self._coerce_int_range(
            raw_settings.get("tracker_size_percent"), *TRACKER_SIZE_RANGE
        )
        settings["template_colors_enabled"] = bool(
            raw_settings.get("template_colors_enabled", DEFAULT_SETTINGS["template_colors_enabled"])
        )
        settings["template_fx_enabled"] = bool(
            raw_settings.get("template_fx_enabled", DEFAULT_SETTINGS["template_fx_enabled"])
        )
        settings["test_with_game_data"] = bool(
            raw_settings.get("test_with_game_data", DEFAULT_SETTINGS["test_with_game_data"])
        )
        settings["screenshot_on_unlock"] = bool(
            raw_settings.get("screenshot_on_unlock", DEFAULT_SETTINGS["screenshot_on_unlock"])
        )
        settings["screenshot_include_popup"] = bool(
            raw_settings.get("screenshot_include_popup", DEFAULT_SETTINGS["screenshot_include_popup"])
        )
        settings["rarity_tiers_enabled"] = bool(
            raw_settings.get("rarity_tiers_enabled", DEFAULT_SETTINGS["rarity_tiers_enabled"])
        )
        tier_ultra = self._coerce_float_range(
            raw_settings.get("tier_ultra_cutoff"), *TIER_ULTRA_RANGE, step=0.5
        )
        tier_rare = self._coerce_int_range(raw_settings.get("tier_rare_cutoff"), *TIER_RARE_RANGE)
        tier_uncommon = self._coerce_int_range(
            raw_settings.get("tier_uncommon_cutoff"), *TIER_UNCOMMON_RANGE
        )
        # Keep the tiers ordered (ultra rare < rare < uncommon): a higher tier
        # is pushed up rather than letting two cutoffs cross.
        tier_rare = max(tier_rare, int(tier_ultra) + 1)
        tier_uncommon = max(tier_uncommon, tier_rare + 1)
        settings["tier_ultra_cutoff"] = tier_ultra
        settings["tier_rare_cutoff"] = tier_rare
        settings["tier_uncommon_cutoff"] = tier_uncommon
        settings["completion_toast_enabled"] = bool(
            raw_settings.get(
                "completion_toast_enabled", DEFAULT_SETTINGS["completion_toast_enabled"]
            )
        )
        settings["session_summary_enabled"] = bool(
            raw_settings.get("session_summary_enabled", DEFAULT_SETTINGS["session_summary_enabled"])
        )
        settings["near_completion_enabled"] = bool(
            raw_settings.get("near_completion_enabled", DEFAULT_SETTINGS["near_completion_enabled"])
        )
        settings["near_completion_threshold"] = self._coerce_int_range(
            raw_settings.get("near_completion_threshold"),
            DEFAULT_SETTINGS["near_completion_threshold"],
            NEAR_COMPLETION_RANGE[0],
            NEAR_COMPLETION_RANGE[1],
        )
        settings["game_art_gradient_enabled"] = bool(
            raw_settings.get(
                "game_art_gradient_enabled", DEFAULT_SETTINGS["game_art_gradient_enabled"]
            )
        )
        # The two gradient sources are mutually exclusive; game artwork wins
        # if a settings file somehow has both on.
        if settings["game_art_gradient_enabled"]:
            settings["icon_gradient_enabled"] = False

        for key in [
            "normal_gradient_start",
            "normal_gradient_end",
            "rare_gradient_start",
            "rare_gradient_end",
            "normal_circle_color",
            "rare_circle_color",
        ]:
            settings[key] = self._sanitize_color(raw_settings.get(key), str(settings[key]))

        sounds = set(self._list_sound_files())
        for slot in SOUND_SLOTS:
            key = f"sound_{slot}"
            if settings[key] not in sounds:
                settings[key] = DEFAULT_SETTINGS[key]

        return settings

    def _load_settings(self) -> Dict[str, Any]:
        try:
            with open(FINALLY_SETTINGS_FILE, "r", encoding="utf-8") as stream:
                raw_settings = json.load(stream)
        except OSError:
            return dict(DEFAULT_SETTINGS)
        except Exception as err:
            decky.logger.warning("Unable to parse Finally Achievement Plugin settings: %s", err)
            return dict(DEFAULT_SETTINGS)

        if not isinstance(raw_settings, dict):
            return dict(DEFAULT_SETTINGS)
        return self._sanitize_settings(raw_settings)

    def _save_settings(self, settings: Dict[str, Any]) -> None:
        try:
            os.makedirs(self._settings_dir(), exist_ok=True)
            with open(FINALLY_SETTINGS_FILE, "w", encoding="utf-8") as stream:
                json.dump(settings, stream, indent=2, sort_keys=True)
        except OSError as err:
            decky.logger.warning("Unable to save Finally Achievement Plugin settings: %s", err)

    @staticmethod
    def _sound_slot(is_rare: bool, tier: Optional[str] = None, completion: bool = False) -> str:
        """Which sound slot a popup uses: the completion popup has its own;
        otherwise the rarity tier when it's known; otherwise (tiers off or no
        percentage) the old rare / normal split."""
        if completion:
            return "completion"
        if tier in ("common", "uncommon", "rare", "ultra_rare"):
            return str(tier)
        return "rare" if is_rare else "common"

    def _sound_path(
        self,
        is_rare: bool,
        settings: Optional[Dict[str, Any]] = None,
        tier: Optional[str] = None,
        completion: bool = False,
    ) -> str:
        settings = settings if settings is not None else self._load_settings()
        key = f"sound_{self._sound_slot(is_rare, tier, completion)}"
        filename = str(settings.get(key) or DEFAULT_SETTINGS[key])
        candidates = [
            os.path.join(self._user_sounds_dir(), filename),     # yours first (replaces a built-in of the same name)
            os.path.join(self._sound_dir(), filename),
            os.path.join(decky.DECKY_PLUGIN_DIR, "assets", filename),
            os.path.join(decky.DECKY_PLUGIN_DIR, "assets", DEFAULT_SETTINGS[key]),
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
        return candidates[-1]

    def _build_audio_env(self) -> Dict[str, str]:
        env = os.environ.copy()
        runtime_dir = env.get("XDG_RUNTIME_DIR") or f"/run/user/{os.getuid()}"
        env["XDG_RUNTIME_DIR"] = runtime_dir

        pulse_socket = os.path.join(runtime_dir, "pulse", "native")
        if os.path.exists(pulse_socket):
            env.setdefault("PULSE_SERVER", f"unix:{pulse_socket}")

        return env

    def _looks_like_image(self, data: Optional[bytes]) -> bool:
        """Minimal sanity check on downloaded/cached icon bytes: real
        image files start with a recognizable signature and are more than
        a trivial handful of bytes. Catches the case where a URL returns
        200 OK with something that isn't actually an image (an HTML error
        page, an empty/near-empty response, etc.) before we ever cache or
        show it -- rather than caching a broken file forever."""
        if not data or len(data) < 256:
            return False
        return (
            data.startswith(b"\xff\xd8\xff")  # JPEG
            or data.startswith(b"\x89PNG\r\n\x1a\n")  # PNG
            or data.startswith(b"GIF87a")
            or data.startswith(b"GIF89a")
            or (data[:4] == b"RIFF" and data[8:12] == b"WEBP")
        )

    def _icon_cache_path(self, appid: int, achievement_id: str, icon_url: str) -> str:
        parsed = urllib.parse.urlparse(icon_url)
        _, ext = os.path.splitext(parsed.path)
        if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".img"
        safe_id = re.sub(r"[^A-Za-z0-9_.-]+", "_", achievement_id)[:96] or "achievement"
        # Include a short hash of the resolved URL so that if the icon
        # source ever changes for this achievement (e.g. we start
        # preferring the Steam Web API's icon over a stale/gray one from
        # the local cache), the cache key changes too and a fresh icon gets
        # downloaded instead of an old wrong one being served forever.
        url_hash = hashlib.sha1(icon_url.encode("utf-8")).hexdigest()[:10]
        return os.path.join(FINALLY_ICON_CACHE_DIR, f"{appid}-{safe_id}-{url_hash}{ext.lower()}")

    def _download_icon_bytes(self, icon_url: str) -> bytes:
        try:
            with urllib.request.urlopen(icon_url, timeout=3.0) as response:
                data = response.read(3 * 1024 * 1024)
            if data:
                return data
        except Exception as err:
            decky.logger.warning("Python icon download failed for %s: %s", icon_url, err)

        env = os.environ.copy()
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        result = subprocess.run(
            [
                "curl",
                "--fail",
                "--silent",
                "--show-error",
                "--location",
                "--max-time",
                "3",
                "--user-agent",
                "FinallyAchievementPlugin/1.0",
                icon_url,
            ],
            text=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            check=False,
        )
        if result.returncode != 0 or not result.stdout:
            stderr = result.stderr.decode("utf-8", errors="replace").strip()
            raise RuntimeError(f"curl failed ({result.returncode}): {stderr}")
        return result.stdout[: 3 * 1024 * 1024]

    STEAM_IMAGES_CDN_BASE = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps"

    def _resolve_icon_url(self, appid: int, icon_url: Optional[str]) -> Optional[str]:
        """Steam's local librarycache JSON stores `strImage` as a bare
        filename/hash (e.g. "e3f595a9...jpg"), not a full URL -- the Steam
        client prepends its CDN base itself when rendering the achievements
        page. `_cache_icon` only accepts absolute http(s) URLs, so a bare
        filename was silently discarded every time, which is why the real
        icon never showed up and the fallback badge always did. This turns
        a bare filename into the same absolute CDN URL the Steam client
        itself would use, while leaving an already-absolute URL untouched.
        """
        if not icon_url:
            return None
        icon_url = icon_url.strip()
        if not icon_url:
            return None
        parsed = urllib.parse.urlparse(icon_url)
        if parsed.scheme in ("http", "https"):
            return icon_url
        return f"{self.STEAM_IMAGES_CDN_BASE}/{appid}/{icon_url.lstrip('/')}"

    # Well-known, hash-free Steam store CDN paths -- unlike the achievement
    # icon CDN path above (which needs a per-icon hash we don't have for a
    # game's own icon), these work for any valid appid with no lookup
    # needed. Ordered by preference: closer to square/small first.
    GAME_ICON_CDN_CANDIDATES = (
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/capsule_231x87.jpg",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg",
    )
    GAME_ICON_LOCAL_CANDIDATES = (
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}_icon.jpg",
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}/*icon*.jpg",
        "/home/deck/.steam/steam/appcache/librarycache/{appid}_icon.jpg",
    )

    def _game_icon_path(self, appid: Optional[int]) -> Optional[str]:
        """Best-effort fallback icon for when an achievement has no icon
        of its own (network hiccup, no icon found in Steam's cache, etc.):
        the game's own icon, so the toast still shows *something*
        recognizable rather than the generic abstract badge. Tries Steam's
        local library cache first (fast, works offline), then falls back
        to a couple of well-known, hash-free Steam CDN paths. Caches the
        result (including a negative "couldn't find one" result) per
        appid for the life of the process, so this never re-does the
        lookup/download for every achievement in the same play session."""
        if appid is None:
            return None
        if appid in self._game_icon_cache:
            return self._game_icon_cache[appid]

        for pattern in self.GAME_ICON_LOCAL_CANDIDATES:
            for path in glob.glob(pattern.format(appid=appid)):
                if os.path.isfile(path):
                    try:
                        with open(path, "rb") as stream:
                            if not self._looks_like_image(stream.read()):
                                continue
                    except OSError:
                        continue
                    self._game_icon_cache[appid] = path
                    return path

        cache_path = os.path.join(FINALLY_ICON_CACHE_DIR, f"game-{appid}.jpg")
        if os.path.isfile(cache_path):
            try:
                with open(cache_path, "rb") as stream:
                    cached_ok = self._looks_like_image(stream.read())
            except OSError:
                cached_ok = False
            if cached_ok:
                self._game_icon_cache[appid] = cache_path
                return cache_path

        for url_template in self.GAME_ICON_CDN_CANDIDATES:
            url = url_template.format(appid=appid)
            try:
                data = self._download_icon_bytes(url)
                if not self._looks_like_image(data):
                    continue
                os.makedirs(FINALLY_ICON_CACHE_DIR, exist_ok=True)
                with open(cache_path, "wb") as stream:
                    stream.write(data)
                self._game_icon_cache[appid] = cache_path
                return cache_path
            except Exception as err:
                decky.logger.warning("Game icon download failed for appid=%s (%s): %s", appid, url, err)
                continue

        self._game_icon_cache[appid] = None
        return None

    GAME_ART_LOCAL_CANDIDATES = (
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}_header.jpg",
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}_library_hero.jpg",
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}/**/header*.jpg",
        "/home/deck/.local/share/Steam/appcache/librarycache/{appid}/**/library_hero*.jpg",
        "/home/deck/.steam/steam/appcache/librarycache/{appid}_header.jpg",
    )
    GAME_ART_CDN_CANDIDATES = (
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_hero.jpg",
    )
    GAME_ART_MISS_TTL_SECONDS = 120.0

    def _game_art_path(self, appid: Optional[int]) -> Optional[str]:
        """The game's own artwork (store header / library hero), used only
        to pull a per-game color palette for "Gradient from game artwork
        colors". Local Steam cache first,
        then the Steam CDN, then the game's icon as a last resort. Hits are
        cached for the process; misses for a couple of minutes."""
        if appid is None:
            return None
        cached = self._game_art_cache.get(appid)
        if cached is not None:
            path, stamp = cached
            if path or (time.monotonic() - stamp) < self.GAME_ART_MISS_TTL_SECONDS:
                return path

        def _valid(path: str) -> bool:
            try:
                with open(path, "rb") as stream:
                    return self._looks_like_image(stream.read())
            except OSError:
                return False

        for pattern in self.GAME_ART_LOCAL_CANDIDATES:
            for path in glob.glob(pattern.format(appid=appid), recursive=True):
                if os.path.isfile(path) and _valid(path):
                    self._game_art_cache[appid] = (path, time.monotonic())
                    return path

        cache_path = os.path.join(FINALLY_ICON_CACHE_DIR, f"gameart-{appid}.jpg")
        if os.path.isfile(cache_path) and _valid(cache_path):
            self._game_art_cache[appid] = (cache_path, time.monotonic())
            return cache_path

        for url_template in self.GAME_ART_CDN_CANDIDATES:
            url = url_template.format(appid=appid)
            try:
                data = self._download_icon_bytes(url)
                if not self._looks_like_image(data):
                    continue
                os.makedirs(FINALLY_ICON_CACHE_DIR, exist_ok=True)
                with open(cache_path, "wb") as stream:
                    stream.write(data)
                self._game_art_cache[appid] = (cache_path, time.monotonic())
                return cache_path
            except Exception as err:
                decky.logger.warning("Game art download failed for appid=%s (%s): %s", appid, url, err)

        # Last resort: the game's icon (still one palette per game).
        icon = self._game_icon_path(appid)
        self._game_art_cache[appid] = (icon, time.monotonic())
        return icon

    def _cache_icon(self, appid: Optional[int], achievement_id: Optional[str], icon_url: Optional[str]) -> Optional[str]:
        if appid is None or not achievement_id or not icon_url:
            return None

        icon_url = self._resolve_icon_url(appid, icon_url)
        if not icon_url:
            return None

        parsed = urllib.parse.urlparse(icon_url)
        if parsed.scheme not in ("http", "https"):
            return None

        path = self._icon_cache_path(appid, achievement_id, icon_url)
        if os.path.exists(path):
            # Self-heal: a file cached by an older version of this code
            # (before byte-validation existed) could be a stale, empty, or
            # otherwise broken download. Don't keep serving it forever --
            # re-fetch instead.
            try:
                with open(path, "rb") as stream:
                    existing = stream.read()
            except OSError:
                existing = None
            if self._looks_like_image(existing):
                return path

        try:
            os.makedirs(FINALLY_ICON_CACHE_DIR, exist_ok=True)
            data = self._download_icon_bytes(icon_url)
        except Exception as err:
            decky.logger.warning("Unable to cache achievement icon %s: %s", icon_url, err)
            return None

        if not self._looks_like_image(data):
            decky.logger.warning("Downloaded icon doesn't look like a real image, discarding: %s", icon_url)
            return None

        try:
            # Unique per writer: the game-start prewarm and a popup can fetch the same icon at once.
            tmp_path = f"{path}.{os.getpid()}-{random.getrandbits(32):08x}.tmp"
            with open(tmp_path, "wb") as stream:
                stream.write(data)
            os.replace(tmp_path, path)
            return path
        except OSError as err:
            decky.logger.warning("Unable to store achievement icon %s: %s", icon_url, err)
            return None

    def _achievement_icon_from_cache(self, appid: int, achievement_id: str) -> Optional[str]:
        cache_path = self._librarycache_path_for_appid(appid)
        if cache_path is None:
            return None

        try:
            with open(cache_path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception:
            return None

        sections = self._sections_from_cache(payload)
        achievements = sections.get("achievements")
        if not isinstance(achievements, dict):
            return None

        for _section, values in self._achievement_lists(achievements):
            for item in values:
                if not isinstance(item, dict):
                    continue
                if item.get("strID") != achievement_id:
                    continue
                icon_url = item.get("strImage")
                if isinstance(icon_url, str) and icon_url:
                    return icon_url
        return None

    async def _play_sound(
        self,
        is_rare: bool,
        settings: Optional[Dict[str, Any]] = None,
        tier: Optional[str] = None,
        completion: bool = False,
    ) -> Optional[str]:
        """Starts the sound; returns its path (None if nothing played)."""
        settings = settings if settings is not None else self._load_settings()
        sound_path = self._sound_path(is_rare, settings, tier, completion)
        if not os.path.exists(sound_path):
            decky.logger.warning("Sound file missing: %s", sound_path)
            return None

        volume_percent = int(settings.get("volume_percent", DEFAULT_SETTINGS["volume_percent"]))
        if volume_percent <= 0:
            return None

        pulse_volume = max(0, min(131072, int(round((volume_percent / 50.0) * 65536))))
        env = self._build_audio_env()

        try:
            player = subprocess.Popen(
                [
                    "paplay",
                    "--stream-name",
                    "Finally Achievement Plugin",
                    # No media.role here: tagging the stream as an "event" sends it
                    # to a role-based route that has no output on some setups
                    # (Steam Machine, TVs over HDMI), so the popup sound was silent.
                    f"--volume={pulse_volume}",
                    sound_path,
                ],
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            # Your own files can be any length; never let one play on forever.
            try:
                asyncio.get_running_loop().call_later(SOUND_MAX_PLAY_SECONDS, self._stop_player, player)
            except RuntimeError:
                pass
            return sound_path
        except Exception as err:
            decky.logger.error("Audio playback failed: %s", err)
            return None

    @staticmethod
    def _stop_player(player: Any) -> None:
        try:
            if player.poll() is None:
                player.terminate()
        except Exception:
            pass

    async def _systemctl_user(self, action: str, unit: str) -> None:
        process = await asyncio.create_subprocess_exec(
            "systemctl",
            "--user",
            action,
            unit,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await process.wait()

    # ------------------------------------------------------------------
    # Display / session detection for the overlay processes
    #
    # The popup and tracker windows are opened by helper processes that need
    # to be told which X display and runtime folder to use. These used to be
    # hard-coded (":0" and /run/user/1000, right for a Steam Deck), which
    # silently fails on a device where either differs: sound still plays but
    # no popup appears. They're detected now, with the old values as the
    # fallback.
    # ------------------------------------------------------------------

    def _user_uid(self) -> int:
        """UID of the desktop/gaming user (the plugin itself usually runs as root)."""
        try:
            import pwd
            name = getattr(decky, "DECKY_USER", None)
            if name:
                return pwd.getpwnam(str(name)).pw_uid
        except Exception:
            pass
        try:
            home = str(getattr(decky, "DECKY_USER_HOME", "") or "")
            if home and os.path.isdir(home):
                uid = os.stat(home).st_uid
                if uid > 0:
                    return uid
        except OSError:
            pass
        if os.getuid() > 0:
            return os.getuid()
        candidates = sorted(
            int(os.path.basename(p)) for p in glob.glob("/run/user/[0-9]*") if int(os.path.basename(p)) > 0
        )
        return candidates[0] if candidates else 1000

    def _runtime_dir(self) -> str:
        preferred = f"/run/user/{self._user_uid()}"
        if os.path.isdir(preferred):
            return preferred
        others = sorted(p for p in glob.glob("/run/user/[0-9]*") if os.path.basename(p) != "0")
        return others[0] if others else preferred

    def _steam_client_display(self) -> Optional[str]:
        """DISPLAY of the running Steam client: the X server gamescope shows
        overlays from. Cached briefly (the scan reads /proc)."""
        cached = self._steam_display_cache
        if cached is not None and time.monotonic() - cached[1] < 60.0:
            return cached[0]
        found: Optional[str] = None
        found_auth: Optional[str] = None
        try:
            for comm_path in glob.glob("/proc/[0-9]*/comm"):
                try:
                    with open(comm_path, "r", encoding="utf-8", errors="ignore") as stream:
                        if stream.read().strip() not in ("steam", "steamwebhelper"):
                            continue
                    with open(os.path.join(os.path.dirname(comm_path), "environ"), "rb") as stream:
                        env = stream.read().split(b"\0")
                except OSError:
                    continue
                for item in env:
                    if item.startswith(b"DISPLAY="):
                        value = item[8:].decode("utf-8", errors="ignore").strip()
                        if re.fullmatch(r":\d+(\.\d+)?", value):
                            found = value.split(".")[0]
                    elif item.startswith(b"XAUTHORITY="):
                        value = item[11:].decode("utf-8", errors="ignore").strip()
                        if value.startswith("/"):
                            found_auth = value
                if found:
                    break
        except Exception:
            found = None
        self._steam_display_cache = (found, time.monotonic())
        self._steam_xauth_cache = (found_auth, time.monotonic())
        return found

    def _xauthority_candidates(self) -> List[str]:
        """X authority (cookie) files that may let the overlay helper talk to
        the display, best first: the one the Steam client itself uses, one
        that worked before, then the usual places. Only files that exist."""
        self._steam_client_display()                      # refreshes the Steam client's XAUTHORITY too
        ordered: List[str] = []
        steam_auth = self._steam_xauth_cache[0] if self._steam_xauth_cache else None
        for candidate in (self._overlay_xauth, steam_auth, os.environ.get("XAUTHORITY")):
            if candidate:
                ordered.append(candidate)
        runtime = self._runtime_dir()
        home = str(getattr(decky, "DECKY_USER_HOME", "") or "")
        patterns = [
            os.path.join(runtime, "xauth_*"),
            os.path.join(runtime, ".mutter-Xwaylandauth.*"),
            os.path.join(runtime, "Xauthority"),
            os.path.join(runtime, "gdm", "Xauthority"),
            os.path.join(home, ".Xauthority") if home else "",
            "/home/*/.Xauthority",
            "/tmp/xauth_*",
        ]
        for pattern in patterns:
            if pattern:
                ordered.extend(sorted(glob.glob(pattern)))
        result: List[str] = []
        for path in ordered:
            if path not in result and os.path.isfile(path):
                result.append(path)
        return result[:4]

    def _overlay_attempts(self) -> List[Tuple[str, Optional[str]]]:
        """(display, X authority file or None) combinations to try, best
        first. With no authority files found this is just the displays."""
        displays = self._x_display_candidates()[:3]
        authorities = self._xauthority_candidates()[:2]
        pairs: List[Tuple[str, Optional[str]]] = []
        if self._overlay_display:
            pairs.append((self._overlay_display, self._overlay_xauth))
        for display in displays:
            for authority in authorities + [None]:
                pairs.append((display, authority))
        unique: List[Tuple[str, Optional[str]]] = []
        for pair in pairs:
            if pair not in unique:
                unique.append(pair)
        unique = unique[:5]
        # Skip setups that failed recently. If every one did, try just the one
        # that failed longest ago: still one attempt per popup (so a display
        # that comes back is found again) instead of all of them.
        now = time.monotonic()
        fresh = [
            pair for pair in unique
            if now - self._overlay_failed.get(pair, -OVERLAY_FAILED_RETRY_SECONDS) >= OVERLAY_FAILED_RETRY_SECONDS
        ]
        if fresh:
            return fresh
        return sorted(unique, key=lambda pair: self._overlay_failed.get(pair, 0.0))[:1]

    def _x_display_candidates(self) -> List[str]:
        """Displays to try, best first: the one that worked before, the Steam
        client's, the historical ":0", then any other X socket present."""
        ordered: List[str] = []
        if self._overlay_display:
            ordered.append(self._overlay_display)
        steam = self._steam_client_display()
        if steam:
            ordered.append(steam)
        ordered.append(":0")
        for path in sorted(glob.glob("/tmp/.X11-unix/X[0-9]*")):
            ordered.append(":" + os.path.basename(path)[1:])
        seen: List[str] = []
        for display in ordered:
            if display not in seen:
                seen.append(display)
        return seen

    def _overlay_session_env(self) -> Dict[str, str]:
        """DISPLAY + XDG_RUNTIME_DIR (+ XAUTHORITY when one is found) for overlay helper processes."""
        env = {"DISPLAY": self._x_display_candidates()[0], "XDG_RUNTIME_DIR": self._runtime_dir()}
        authorities = self._xauthority_candidates()
        if authorities:
            env["XAUTHORITY"] = authorities[0]
        return env

    @staticmethod
    def _looks_like_display_failure(stderr_text: str) -> bool:
        lowered = stderr_text.lower()
        return any(
            marker in lowered
            for marker in (
                "glfwinit failed", "cannot open display", "can't open display", "could not open x display",
                "failed to open display", "no display", "authorization required", "no authorization protocol",
            )
        )

    async def run_overlay_check(self) -> Dict[str, Any]:
        """Self-test for "the sound plays but no popup shows": runs the
        overlay's requirements check under the same interpreter and
        environment the popup uses and turns it into a plain-English report."""
        env = os.environ.copy()
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        env.update(self._overlay_session_env())
        checks: List[Dict[str, Any]] = []
        uid = self._user_uid()
        checks.append({"name": "User", "ok": True, "detail": f"uid {uid}, runtime dir {env['XDG_RUNTIME_DIR']}", "fatal": False})
        checks.append({
            "name": "Display candidates", "ok": True, "fatal": False,
            "detail": ", ".join(self._x_display_candidates()) + f" (using {env['DISPLAY']})",
        })
        authority = env.get("XAUTHORITY")
        checks.append({
            "name": "X authority", "ok": True, "fatal": False,
            "detail": authority if authority else "none found (fine when the display allows local connections)",
        })
        gamescope_running = any(
            self._proc_comm_contains(pid_dir, "gamescope") for pid_dir in glob.glob("/proc/[0-9]*")
        )
        checks.append({
            "name": "Gamescope running", "ok": gamescope_running, "fatal": False,
            "detail": "found" if gamescope_running else "no gamescope process found (popups only show in Game Mode)",
        })
        checks.append({
            "name": "Overlay helper files", "fatal": True,
            "ok": all(os.path.exists(os.path.join(decky.DECKY_PLUGIN_DIR, n)) for n in (OVERLAY_SCRIPT_NAME, DIAGNOSE_SCRIPT_NAME, DRAWING_LAYER_NAME)),
            "detail": f"{OVERLAY_SCRIPT_NAME}, {DIAGNOSE_SCRIPT_NAME}, {DRAWING_LAYER_NAME} in the plugin folder",
        })
        helper = os.path.join(decky.DECKY_PLUGIN_DIR, DIAGNOSE_SCRIPT_NAME)
        if os.path.exists(helper):
            try:
                process = await asyncio.create_subprocess_exec(
                    STEAMWORKS_PYTHON, helper, env=env,
                    stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=20.0)
                report = json.loads(stdout.decode("utf-8", errors="replace").strip().splitlines()[-1])
                checks.extend(report.get("checks", []))
            except asyncio.TimeoutError:
                checks.append({"name": "Self-check", "ok": False, "fatal": True, "detail": "timed out after 20 seconds"})
            except Exception as err:
                checks.append({"name": "Self-check", "ok": False, "fatal": True, "detail": f"could not run: {err}"})
        failed = [c for c in checks if not c.get("ok") and c.get("fatal", True)]
        if failed:
            first = failed[0]
            verdict = f"Problem found: {first['name']} - {first['detail']}"
        elif not gamescope_running:
            verdict = "The popup's requirements are all present, but Game Mode (gamescope) isn't running right now."
        else:
            verdict = (
                "Everything the popup needs is present. If popups still don't show, send the last popup status below."
            )
        return {
            "ok": not failed,
            "verdict": verdict,
            "checks": checks,
            "last_status": self._gamescope_overlay_status,
            "last_error": self._gamescope_overlay_last_error,
        }

    @staticmethod
    def _proc_comm_contains(pid_dir: str, needle: str) -> bool:
        try:
            with open(os.path.join(pid_dir, "comm"), "r", encoding="utf-8", errors="ignore") as stream:
                return needle in stream.read()
        except OSError:
            return False

    # ------------------------------------------------------------------
    # Achievement browser + tracker (merged in from the old standalone achievements
    # plugin)
    #
    # * The browser lists every achievement of the running game (locked and
    #   unlocked) using a one-shot Steamworks probe. Icons come from the Web
    #   API schema first (colored), then Steam's local cache.
    # * One achievement can be pinned. A small persistent overlay
    #   (tracker_overlay.py) shows it, drawn with the toast plugin's own
    #   template and colors. Game detection is the toast watcher's
    #   (_active_appid) -- there is no second /proc scan.
    # * Only one gamescope overlay window can be shown at a time, so this
    #   class is the single owner of it: while a toast plays the tracker
    #   slides away and its window is destroyed, and it returns afterwards.
    #   MangoApp is stopped once and restarted only when nobody needs the
    #   slot any more.
    # ------------------------------------------------------------------

    def _tracker_dir(self) -> str:
        return os.path.join(FINALLY_SETTINGS_DIR, "tracker")

    def _tracker_paths(self) -> Dict[str, str]:
        base = self._tracker_dir()
        return {
            "target": os.path.join(base, "tracker_target.json"),
            "state": os.path.join(base, "tracker_state.json"),
            "style": os.path.join(base, "tracker_style.json"),
            "control": os.path.join(base, "tracker_control.json"),
            "log": os.path.join(base, "tracker_overlay.log"),
        }

    def _read_json_file(self, path: str) -> Optional[Dict[str, Any]]:
        try:
            with open(path, "r", encoding="utf-8") as stream:
                data = json.load(stream)
        except (OSError, ValueError):
            return None
        return data if isinstance(data, dict) else None

    def _write_json_file(self, path: str, payload: Optional[Dict[str, Any]]) -> None:
        """Atomic write (temp file + rename) so the overlay never reads half a
        file; payload None deletes the file. Skips the write when the content
        is unchanged so file timestamps only move on real changes."""
        try:
            if payload is None:
                if os.path.exists(path):
                    os.remove(path)
                return
            if self._read_json_file(path) == payload:
                return
            os.makedirs(os.path.dirname(path), exist_ok=True)
            tmp_path = f"{path}.tmp"
            with open(tmp_path, "w", encoding="utf-8") as stream:
                json.dump(payload, stream)
            os.replace(tmp_path, path)
        except OSError as err:
            decky.logger.warning("Couldn't write %s: %s", path, err)

    def _migrate_old_tracker_pin(self) -> None:
        """One-time: carry the pinned achievement (and its position/size)
        over from the old standalone achievements plugin."""
        paths = self._tracker_paths()
        if os.path.exists(paths["target"]):
            return
        old_dir = OLD_TRACKER_SETTINGS_DIR
        old_target = self._read_json_file(os.path.join(old_dir, "tracker_target.json"))
        if old_target:
            self._write_json_file(paths["target"], old_target)
        old_settings = self._read_json_file(os.path.join(old_dir, "tracker_settings.json"))
        if old_settings:
            patch: Dict[str, Any] = {}
            if old_settings.get("position") in TRACKER_POSITIONS:
                patch["tracker_position"] = old_settings["position"]
            if isinstance(old_settings.get("size_percent"), (int, float)):
                patch["tracker_size_percent"] = old_settings["size_percent"]
            if patch and not os.path.exists(FINALLY_SETTINGS_FILE + ".tracker-migrated"):
                self._save_settings(self._sanitize_settings({**self._load_settings(), **patch}))
        try:
            open(FINALLY_SETTINGS_FILE + ".tracker-migrated", "w").close()
        except OSError:
            pass

    # --- public API used by the panel ---------------------------------------

    async def get_current_game(self) -> Dict[str, Any]:
        appid = self._active_appid
        if appid is None:
            return {"appid": None, "name": None}
        return {"appid": appid, "name": self._game_name(appid)}

    async def get_achievements(self, appid: Optional[int] = None) -> Dict[str, Any]:
        resolved = appid if isinstance(appid, int) and appid > 0 else self._active_appid
        if resolved is None:
            return {"ok": False, "error": "no_running_game", "appid": None, "name": None, "achievements": []}
        name = self._game_name(resolved)
        if not os.path.exists(self._steamworks_lib_path()):
            return {"ok": False, "error": "steamworks_lib_missing", "appid": resolved, "name": name, "achievements": []}

        probe = await self._run_oneshot_probe(resolved, STEAMWORKS_LIST_HELPER_NAME)
        if probe.get("type") == "error":
            return {"ok": False, "error": probe.get("error", "probe_failed"), "appid": resolved, "name": name, "achievements": []}

        icons = await self._browser_icons(resolved)
        achievements: List[Dict[str, Any]] = []
        for order, item in enumerate(probe.get("achievements", [])):
            aid = item.get("id")
            hidden = bool(item.get("hidden"))
            achieved = bool(item.get("achieved"))
            display_name = item.get("name") or aid
            display_desc = item.get("desc") or ""
            # Match Steam's own convention: no name/description for secret
            # achievements until they're unlocked.
            if hidden and not achieved:
                display_name = "Hidden achievement"
                display_desc = ""
            achievements.append(
                {
                    "id": aid,
                    "order": order,
                    "name": display_name,
                    "description": display_desc,
                    "hidden": hidden,
                    "achieved": achieved,
                    "unlock_time": item.get("unlock_time") or 0,
                    "global_percent": item.get("percent"),
                    "icon": icons.get(aid),
                }
            )
        unlocked = [a for a in achievements if a["achieved"]]
        locked = [a for a in achievements if not a["achieved"]]
        unlocked.sort(key=lambda a: a["unlock_time"], reverse=True)
        # Rarest first for locked ones: more interesting than what most people have.
        locked.sort(key=lambda a: (a["global_percent"] is None, a["global_percent"] or 0))
        return {
            "ok": True,
            "error": None,
            "appid": resolved,
            "name": name,
            "total": len(achievements),
            "unlocked_count": len(unlocked),
            "achievements": unlocked + locked,
        }

    async def _browser_icons(self, appid: int) -> Dict[str, str]:
        """Icon URL per achievement id: Web API schema (colored) first, then
        Steam's local library cache for anything the schema doesn't cover."""
        icons: Dict[str, str] = {}
        key = self._steam_api_key()
        if key:
            try:
                icons.update(await self._steam_api_schema_icons(appid, key))
            except Exception as err:
                decky.logger.warning("Browser icons: Web API schema failed for %s: %s", appid, err)
        try:
            from_schema = await asyncio.to_thread(self._local_schema_icon_urls, appid)   # colored, no key needed
        except Exception:
            from_schema = {}
        for aid, url in from_schema.items():
            icons.setdefault(aid, url)
        try:
            local = await asyncio.to_thread(self._local_icon_lookup, appid)
        except Exception:
            local = {}
        for aid, url in local.items():
            icons.setdefault(aid, url)
        return icons

    def _local_icon_lookup(self, appid: int) -> Dict[str, str]:
        path = self._librarycache_path_for_appid(appid)
        if path is None:
            return {}
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception:
            return {}
        achievements = self._sections_from_cache(payload).get("achievements")
        if not isinstance(achievements, dict):
            return {}
        icons: Dict[str, str] = {}
        for _section, values in self._achievement_lists(achievements):
            for item in values:
                if not isinstance(item, dict):
                    continue
                aid = item.get("strID")
                url = self._resolve_icon_url(appid, item.get("strImage"))
                if isinstance(aid, str) and url:
                    icons[aid] = url
        return icons

    async def _run_oneshot_probe(
        self, appid: int, script_name: str, extra_args: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        helper_path = os.path.join(decky.DECKY_PLUGIN_DIR, script_name)
        if not os.path.exists(helper_path):
            return {"type": "error", "error": "helper_missing"}
        env = os.environ.copy()
        env["SteamAppId"] = str(appid)
        env["SteamGameId"] = str(appid)
        env["LD_LIBRARY_PATH"] = os.path.dirname(self._steamworks_lib_path()) + os.pathsep + env.get("LD_LIBRARY_PATH", "")
        try:
            process = await asyncio.create_subprocess_exec(
                STEAMWORKS_PYTHON, helper_path, "--appid", str(appid), "--lib", self._steamworks_lib_path(),
                *(extra_args or []),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, env=env,
            )
        except Exception as err:
            return {"type": "error", "error": f"spawn_failed: {err}"}
        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=PROBE_TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            try:
                process.kill()
            except Exception:
                pass
            return {"type": "error", "error": "probe_timeout"}
        if stderr:
            decky.logger.warning("%s stderr: %s", script_name, stderr.decode("utf-8", errors="ignore")[:500])
        last_line = None
        for line in stdout.decode("utf-8", errors="ignore").splitlines():
            if line.strip():
                last_line = line.strip()
        if not last_line:
            return {"type": "error", "error": "no_probe_output"}
        try:
            result = json.loads(last_line)
        except json.JSONDecodeError:
            return {"type": "error", "error": "bad_probe_output"}
        return result if isinstance(result, dict) else {"type": "error", "error": "bad_probe_output"}

    async def get_tracked_achievement(self) -> Dict[str, Any]:
        target = self._read_json_file(self._tracker_paths()["target"])
        if target is None:
            return {"tracked": False}
        return {"tracked": True, "target": target, "state": self._read_json_file(self._tracker_paths()["state"])}

    async def set_tracked_achievement(
        self, appid: int, achievement_id: str, name: str, description: str = "", icon: Optional[str] = None
    ) -> Dict[str, Any]:
        # Prefer the schema's colored icon (a locked achievement's list icon
        # is often the gray one).
        colored = None
        key = self._steam_api_key()
        if key:
            try:
                colored = (await self._steam_api_schema_icons(appid, key)).get(achievement_id)
            except Exception:
                colored = None
        if not colored:
            try:
                colored = await asyncio.to_thread(self._local_schema_icon_url, appid, achievement_id)
            except Exception:
                colored = None
        icon_url = colored or icon
        icon_path = await asyncio.to_thread(self._download_tracker_icon, appid, achievement_id, icon_url) if icon_url else None
        target = {
            "appid": appid,
            "achievement_id": achievement_id,
            "name": name,
            "description": description,
            "icon": icon_url,
            "icon_path": icon_path,
        }
        paths = self._tracker_paths()
        self._write_json_file(paths["state"], None)          # the old pin's live state doesn't apply
        self._write_json_file(paths["target"], target)
        self._tracker_wake.set()
        return {"tracked": True, "target": target}

    async def clear_tracked_achievement(self) -> Dict[str, Any]:
        paths = self._tracker_paths()
        self._write_json_file(paths["target"], None)
        self._write_json_file(paths["state"], None)
        self._tracker_wake.set()
        await self._stop_tracker_overlay()
        return {"tracked": False}

    def _download_tracker_icon(self, appid: int, achievement_id: str, icon_url: str) -> Optional[str]:
        """Downloads the pinned achievement's icon once so the overlay
        process (GdkPixbuf, not a browser) can load it from disk. Reuses the
        toast plugin's validated icon cache."""
        return self._cache_icon(appid, achievement_id, icon_url)

    # --- overlay slot / MangoApp ownership ------------------------------------

    async def _acquire_overlay_slot(self, holder: str) -> None:
        """Marks `holder` ("toast" or "tracker") as needing the gamescope
        overlay slot; MangoApp is stopped when the first holder arrives."""
        async with self._slot_lock:
            first = not self._slot_holders
            self._slot_holders.add(holder)
            if first:
                try:
                    await self._systemctl_user("stop", "gamescope-mangoapp.service")
                except Exception as err:
                    decky.logger.warning("Couldn't stop MangoApp: %s", err)

    async def _release_overlay_slot(self, holder: str) -> None:
        """MangoApp is restarted only when the last holder lets go."""
        async with self._slot_lock:
            self._slot_holders.discard(holder)
            if not self._slot_holders:
                try:
                    await self._systemctl_user("start", "gamescope-mangoapp.service")
                except Exception as err:
                    decky.logger.warning("Couldn't restart MangoApp: %s", err)

    def _tracker_running(self) -> bool:
        process = self._tracker_process
        return process is not None and process.returncode is None

    async def _tracker_hide_for_toast(self) -> None:
        """Called (under the toast lock) before a toast window opens: asks the
        tracker to slide away and waits until its window is gone."""
        if not self._tracker_running() or self._tracker_hidden:
            return                       # nothing to hide, or already hidden by an earlier toast in this burst
        self._write_json_file(self._tracker_paths()["control"], {"hidden": True})
        self._tracker_hidden = True
        await asyncio.sleep(TRACKER_HIDE_WAIT_SECONDS)

    async def _tracker_show_after_toast(self) -> None:
        if self._toasts_queued > 0:
            return                       # another toast is waiting; stay hidden (no flicker between them)
        if self._tracker_hidden:
            self._tracker_hidden = False
            self._write_json_file(self._tracker_paths()["control"], {"hidden": False})

    def _tracker_style(self, appid: int) -> Dict[str, Any]:
        """The toast settings the tracker card is drawn with, for the pinned
        game (so a game's own profile applies to its tracker too)."""
        settings = self._settings_for(appid)
        keys = (
            "overlay_template", "normal_gradient_start", "normal_gradient_end", "normal_circle_color",
            "gradient_direction", "label_font_size", "title_font_size", "subtitle_font_size",
            "icon_glow_enabled", "icon_glow_intensity", "icon_frame_ring_enabled",
            "template_colors_enabled", "icon_gradient_enabled", "game_art_gradient_enabled",
        )
        style: Dict[str, Any] = {k: settings.get(k) for k in keys}
        popup_template = style.pop("overlay_template")
        # "same" follows the popup template (the default); any other value is
        # a template just for the tracker, e.g. Game Art Blur.
        tracker_template = settings.get("tracker_template", DEFAULT_SETTINGS["tracker_template"])
        style["template"] = popup_template if tracker_template in ("same", None) else tracker_template
        style["position"] = settings.get("tracker_position", DEFAULT_SETTINGS["tracker_position"])
        style["size_percent"] = settings.get("tracker_size_percent", DEFAULT_SETTINGS["tracker_size_percent"])
        style["language"] = self._language()
        return style

    @staticmethod
    def _tracker_needs_art(style: Dict[str, Any]) -> bool:
        return style.get("template") == "game_art" or bool(
            style.get("game_art_gradient_enabled") and not style.get("template_colors_enabled")
        )

    async def _write_tracker_style(self, appid: int) -> None:
        style = self._tracker_style(appid)
        if self._tracker_needs_art(style):
            try:
                style["game_art_path"] = await asyncio.wait_for(asyncio.to_thread(self._game_art_path, appid), timeout=4.0)
            except Exception:
                style["game_art_path"] = None
        self._write_json_file(self._tracker_paths()["style"], style)

    async def _ensure_tracker_overlay(self) -> None:
        if self._tracker_running():
            return
        overlay_path = os.path.join(decky.DECKY_PLUGIN_DIR, TRACKER_OVERLAY_SCRIPT_NAME)
        if not os.path.exists(overlay_path):
            decky.logger.warning("Tracker overlay script missing: %s", overlay_path)
            return
        now = time.monotonic()
        if now - self._tracker_last_start < TRACKER_RESTART_COOLDOWN_SECONDS:
            return                       # don't crash-loop
        self._tracker_last_start = now

        paths = self._tracker_paths()
        os.makedirs(self._tracker_dir(), exist_ok=True)
        self._tracker_hidden = self._toasts_queued > 0
        self._write_json_file(paths["control"], {"hidden": self._tracker_hidden})
        env = os.environ.copy()
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        # Plugin backends don't inherit DISPLAY/XDG_RUNTIME_DIR (see the toast overlay).
        env.update(self._overlay_session_env())
        env.update(self._screen_env())
        env["FINALLY_LANG"] = self._language()
        env.update(self._fontconfig_env())      # extra font folders (Chinese fonts); harmless for other languages
        env["FINALLY_TRACKER_TARGET_FILE"] = paths["target"]
        env["FINALLY_TRACKER_STATE_FILE"] = paths["state"]
        env["FINALLY_TRACKER_STYLE_FILE"] = paths["style"]
        env["FINALLY_TRACKER_CONTROL_FILE"] = paths["control"]
        await self._acquire_overlay_slot("tracker")
        try:
            log_file: Any = open(paths["log"], "wb")
        except OSError:
            log_file = asyncio.subprocess.DEVNULL
        try:
            self._tracker_process = await asyncio.create_subprocess_exec(
                STEAMWORKS_PYTHON, overlay_path, stdout=log_file, stderr=log_file, env=env,
            )
        except Exception as err:
            decky.logger.warning("Couldn't start tracker overlay: %s", err)
            self._tracker_process = None
            await self._release_overlay_slot("tracker")
        finally:
            if hasattr(log_file, "close"):
                log_file.close()

    async def _stop_tracker_overlay(self) -> None:
        process = self._tracker_process
        self._tracker_process = None
        self._tracker_hidden = False
        if process is not None and process.returncode is None:
            try:
                process.terminate()
                await asyncio.wait_for(process.wait(), timeout=2.0)
            except Exception:
                try:
                    process.kill()
                except Exception:
                    pass
        if "tracker" in self._slot_holders:
            await self._release_overlay_slot("tracker")

    async def _tracker_sleep(self, seconds: float) -> None:
        self._tracker_wake.clear()
        try:
            await asyncio.wait_for(self._tracker_wake.wait(), timeout=seconds)
        except asyncio.TimeoutError:
            pass

    async def _tracker_loop(self) -> None:
        """Lives as long as the plugin. While the pinned achievement's game
        is the one running: polls its live state, keeps the style file
        current and the overlay alive. Otherwise the overlay is torn down
        (the pin itself is kept for next time)."""
        while not self._stop_event.is_set():
            try:
                target = self._read_json_file(self._tracker_paths()["target"])
                if target is None:
                    await self._stop_tracker_overlay()
                    await self._tracker_sleep(TRACKER_IDLE_POLL_SECONDS)
                    continue
                running = self._active_appid
                if running is None or running != target.get("appid"):
                    await self._stop_tracker_overlay()
                    await self._tracker_sleep(TRACKER_IDLE_POLL_SECONDS)
                    continue
                if not os.path.exists(self._steamworks_lib_path()):
                    await self._tracker_sleep(TRACKER_ACTIVE_POLL_SECONDS)
                    continue

                await self._write_tracker_style(running)
                probe = await self._run_oneshot_probe(
                    running, STEAMWORKS_TRACK_HELPER_NAME, ["--achievement", str(target.get("achievement_id"))]
                )
                if probe.get("type") == "progress":
                    self._write_json_file(
                        self._tracker_paths()["state"],
                        {
                            "achieved": bool(probe.get("achieved")),
                            "percent": probe.get("percent"),
                            "has_progress": bool(probe.get("has_progress")),
                            "current": probe.get("current"),
                            "max": probe.get("max"),
                            "updated_at": time.time(),
                        },
                    )
                    await self._ensure_tracker_overlay()
                else:
                    decky.logger.warning("Tracker probe error: %s", probe.get("error"))
                await self._tracker_sleep(TRACKER_ACTIVE_POLL_SECONDS)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                decky.logger.warning("Tracker loop error: %s", err)
                await self._tracker_sleep(TRACKER_ACTIVE_POLL_SECONDS)

    # ------------------------------------------------------------------
    # Language
    #
    # "auto" follows Steam's own language. The panel reads it from Steam's UI
    # and tells us (set_detected_language); failing that it is read from
    # Steam's registry.vdf. Popups use the same language as the panel.
    # ------------------------------------------------------------------

    def _i18n(self):
        global _I18N
        if _I18N is None:
            _I18N = _load_i18n() or False
        return _I18N or None

    def _user_homes(self) -> List[str]:
        homes = [str(getattr(decky, "DECKY_USER_HOME", "") or ""), "/home/deck"]
        return [h for h in homes if h and os.path.isdir(h)]

    def _detected_language_path(self) -> str:
        return os.path.join(FINALLY_SETTINGS_DIR, "detected_language.txt")

    def _steam_language_name(self) -> Optional[str]:
        """Steam's language name as Steam spells it ("turkish", "japanese", ...), or None."""
        i18n = self._i18n()
        if i18n is None:
            return None
        raw = i18n.read_steam_registry_name(self._user_homes())
        if raw:
            return raw
        try:
            with open(self._detected_language_path(), "r", encoding="utf-8") as stream:
                code = stream.read().strip()
            return i18n.steam_api_language(code) if code in i18n.SUPPORTED else None
        except OSError:
            return None

    def _steam_l_param(self) -> str:
        """`l=` for Steam's web APIs and community pages: Steam's own language, so the
        names match the ones Steam shows in the popups."""
        return self._steam_language_name() or "english"

    def _language(self) -> str:
        """The language code popups and messages use."""
        i18n = self._i18n()
        if i18n is None:
            return "en"
        setting = str(self._load_settings().get("language", "auto"))
        if setting != "auto":
            return setting if setting in i18n.SUPPORTED else "en"
        try:
            with open(self._detected_language_path(), "r", encoding="utf-8") as stream:
                code = stream.read().strip()
            if code in i18n.SUPPORTED:
                return code
        except OSError:
            pass
        return i18n.language_from_steam(i18n.read_steam_registry_name(self._user_homes())) or "en"

    def _tr(self, text: str, **values: Any) -> str:
        i18n = self._i18n()
        if i18n is None:
            for name, value in values.items():
                text = text.replace("{" + name + "}", str(value))
            return text
        return i18n.translate(self._language(), text, **values)

    async def get_steam_language(self) -> str:
        """Steam's language as a supported code ("" when unknown or not translated)."""
        i18n = self._i18n()
        if i18n is None:
            return ""
        return i18n.language_from_steam(i18n.read_steam_registry_name(self._user_homes())) or ""

    async def set_detected_language(self, code: str = "") -> None:
        """The panel's reading of Steam's language, kept for the popup renderer."""
        i18n = self._i18n()
        value = code if (i18n is not None and code in i18n.SUPPORTED) else ""
        try:
            os.makedirs(FINALLY_SETTINGS_DIR, exist_ok=True)
            with open(self._detected_language_path(), "w", encoding="utf-8") as stream:
                stream.write(value)
        except OSError as err:
            decky.logger.warning("Couldn't save the detected language: %s", err)

    def _fonts_dir(self) -> str:
        return os.path.join(FINALLY_SETTINGS_DIR, "fonts")

    def _cjk_font_dirs(self) -> List[str]:
        """Extra folders searched for a Chinese font: yours, and Steam's own font folders."""
        roots = [os.path.join(h, ".local/share/Steam") for h in self._user_homes()]
        dirs = [self._fonts_dir()]
        for root in roots:
            for sub in ("steamui/fonts", "clientui/fonts", "resource/fonts"):
                dirs.append(os.path.join(root, sub))
        return [d for d in dirs if os.path.isdir(d)]

    def _fontconfig_env(self) -> Dict[str, str]:
        """FONTCONFIG_FILE adding those folders to the system fonts. Only used for
        Simplified Chinese; nothing changes for the other languages."""
        dirs = self._cjk_font_dirs()
        if not dirs:
            return {}
        try:
            os.makedirs(self._settings_dir(), exist_ok=True)
            path = os.path.join(self._settings_dir(), "fonts.conf")
            body = (
                '<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n'
                '  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>\n'
                + "".join(f"  <dir>{d}</dir>\n" for d in dirs)
                + f'  <cachedir>{os.path.join(self._settings_dir(), "fontcache")}</cachedir>\n</fontconfig>\n'
            )
            with open(path, "w", encoding="utf-8") as stream:
                stream.write(body)
            return {"FONTCONFIG_FILE": path}
        except OSError:
            return {}

    async def get_language_info(self) -> Dict[str, Any]:
        """What language is in use, and (for Chinese) whether a Chinese font exists."""
        language = self._language()
        info: Dict[str, Any] = {
            "language": language,
            "steam_language": self._steam_language_name(),
            "fonts_folder": self._fonts_dir(),
            "cjk_font": None,
            "cjk_checked": False,
        }
        if language == "zh-Hans":
            os.makedirs(self._fonts_dir(), exist_ok=True)
            env = os.environ.copy()
            env.pop("LD_LIBRARY_PATH", None)
            env.pop("LD_PRELOAD", None)
            env.update(self._fontconfig_env())
            try:
                result = await asyncio.to_thread(
                    subprocess.run, ["fc-list", ":lang=zh-cn", "family"],
                    stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, env=env, timeout=8, check=False,
                )
                names = [line.split(",")[0].strip() for line in (result.stdout or "").splitlines() if line.strip()]
                info["cjk_checked"] = True
                info["cjk_font"] = names[0] if names else None
            except Exception as err:  # noqa: BLE001
                decky.logger.warning("Font check failed: %s", err)
        return info

    def _screen_env(self, override: Optional[str] = None) -> Dict[str, str]:
        """FINALLY_WIDTH/HEIGHT for the overlay helpers, or nothing for "auto"."""
        choice = (override or self._load_settings().get("overlay_screen") or "auto").strip().lower()
        if choice not in SCREEN_SIZE_CHOICES:
            choice = "auto"
        if choice == "auto":
            # Use the size Steam's own UI reports (sent by the panel). On a TV
            # the X display can be a different size (e.g. 1280x800 on a 1080p
            # TV), which put the popups in the wrong place.
            ui = getattr(self, "_ui_screen", None)
            if ui:
                return {"FINALLY_WIDTH": str(ui[0]), "FINALLY_HEIGHT": str(ui[1])}
            return {}
        width, height = choice.split("x")
        return {"FINALLY_WIDTH": width, "FINALLY_HEIGHT": height}

    async def set_ui_screen(self, width: int = 0, height: int = 0) -> None:
        """The real screen size Steam's UI is drawn at, reported by the panel."""
        try:
            w, h = int(width), int(height)
        except (TypeError, ValueError):
            return
        if not (640 <= w <= 7680 and 400 <= h <= 4320):
            return
        if getattr(self, "_ui_screen", None) != (w, h):
            decky.logger.info("UI screen size reported: %sx%s", w, h)
        self._ui_screen = (w, h)

    async def show_screen_frame(self, size: str = "") -> None:
        """Draws a bright frame around the popup canvas (no sound) so you can
        see whether it matches the real screen edges. `size` is a choice from
        SCREEN_SIZE_CHOICES, tried without saving it."""
        choice = (size or "").strip().lower()
        if choice not in SCREEN_SIZE_CHOICES:
            choice = ""
        payload = {
            "title": "Screen size test",
            "subtitle": choice or "auto",
            "is_rare": False,
            "percent": None,
            "settings_appid": None,
            "test_frame": True,
            "screen_override": choice,
            "min_seconds": 6.0,
        }
        asyncio.create_task(self._show_gamescope_overlay(payload))

    async def _show_gamescope_overlay(self, payload: Dict[str, Any]) -> None:
        helper_path = os.path.join(decky.DECKY_PLUGIN_DIR, FINALLY_OVERLAY_HELPER_NAME)
        if not os.path.exists(helper_path):
            self._gamescope_overlay_last_error = f"missing helper: {helper_path}"
            return

        # Counted from the moment it's queued, so the tracker stays hidden
        # through a whole burst of toasts instead of flickering between them.
        self._toasts_queued += 1
        try:
            await self._show_gamescope_overlay_locked(payload, helper_path)
        finally:
            self._toasts_queued -= 1
            try:
                await self._tracker_show_after_toast()
            except Exception as err:
                decky.logger.warning("Tracker show after toast failed: %s", err)

    def _overlay_env_vars(self, settings: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, str]:
        """Everything the popup renderer reads from its environment, for one popup."""
        return {
            **self._overlay_session_env(),
            **self._screen_env(payload.get("screen_override") or None),
            "FINALLY_LANG": self._language(),
            **(self._fontconfig_env() if self._language() == "zh-Hans" else {}),
            "FINALLY_TEST_FRAME": "1" if payload.get("test_frame") else "0",
            "FINALLY_TITLE": str(payload.get("title") or "Achievement Unlocked"),
            "FINALLY_SUBTITLE": str(payload.get("subtitle") or ""),
            "FINALLY_RARE": "1" if payload.get("is_rare") else "0",
            "FINALLY_TEMPLATE_COLORS": "1" if settings.get(
                "template_colors_enabled", DEFAULT_SETTINGS["template_colors_enabled"]
            ) else "0",
            "FINALLY_TEMPLATE_FX": "1" if settings.get(
                "template_fx_enabled", DEFAULT_SETTINGS["template_fx_enabled"]
            ) else "0",
            "FINALLY_GAME_NAME": str(payload.get("game_name") or ""),
            "FINALLY_TIER": (
                str(payload.get("tier"))
                if payload.get("tier") in ("uncommon", "rare", "ultra_rare")
                else ""
            ),
            "FINALLY_ICON_PATH": str(payload.get("icon_path") or ""),
            "FINALLY_PLACEHOLDER_STYLE": str(
                settings.get("placeholder_icon", DEFAULT_SETTINGS["placeholder_icon"])
            ),
            "FINALLY_GAME_ART_GRADIENT_ENABLED": "1" if settings.get(
                "game_art_gradient_enabled", DEFAULT_SETTINGS["game_art_gradient_enabled"]
            ) else "0",
            "FINALLY_GAME_ART_PATH": str(payload.get("game_art_path") or ""),
            "FINALLY_PLACEHOLDER_ICON_PATH": str(payload.get("placeholder_icon_path") or ""),
            "FINALLY_PERCENT": (
                f"{payload['percent']:.2f}" if isinstance(payload.get("percent"), (int, float)) else ""
            ),
            "FINALLY_PERCENT_POSITION": str(
                settings.get("percent_position", DEFAULT_SETTINGS["percent_position"])
            ),
            "FINALLY_PERCENT_SIZE": str(
                settings.get("percent_size", DEFAULT_SETTINGS["percent_size"])
            ),
            "FINALLY_PERCENT_ENABLED": "1" if settings.get(
                "show_percent", DEFAULT_SETTINGS["show_percent"]
            ) else "0",
            "FINALLY_SIZE_PERCENT": str(settings.get("overlay_size_percent", 50)),
            "FINALLY_POSITION": str(settings.get("overlay_position", DEFAULT_SETTINGS["overlay_position"])),
            "FINALLY_TEMPLATE": str(
                payload.get("template_override")
                or settings.get("overlay_template", DEFAULT_SETTINGS["overlay_template"])
            ),
            "FINALLY_LABEL_SIZE": str(settings.get("label_font_size", DEFAULT_SETTINGS["label_font_size"])),
            "FINALLY_TITLE_SIZE": str(settings.get("title_font_size", DEFAULT_SETTINGS["title_font_size"])),
            "FINALLY_SUBTITLE_SIZE": str(settings.get("subtitle_font_size", DEFAULT_SETTINGS["subtitle_font_size"])),
            "FINALLY_NORMAL_GRADIENT_START": str(settings.get("normal_gradient_start")),
            "FINALLY_NORMAL_GRADIENT_END": str(settings.get("normal_gradient_end")),
            "FINALLY_RARE_GRADIENT_START": str(settings.get("rare_gradient_start")),
            "FINALLY_RARE_GRADIENT_END": str(settings.get("rare_gradient_end")),
            "FINALLY_NORMAL_CIRCLE_COLOR": str(settings.get("normal_circle_color")),
            "FINALLY_RARE_CIRCLE_COLOR": str(settings.get("rare_circle_color")),
            "FINALLY_SECONDS": str(
                max(
                    float(settings.get("duration_seconds", DEFAULT_SETTINGS["duration_seconds"])),
                    float(payload.get("min_seconds") or 0.0),
                )
            ),
            "FINALLY_GLOW_ENABLED": "1" if settings.get(
                "icon_glow_enabled", DEFAULT_SETTINGS["icon_glow_enabled"]
            ) else "0",
            "FINALLY_RING_SIZE": str(
                settings.get("ring_size", DEFAULT_SETTINGS["ring_size"])
            ),
            "FINALLY_GLOW_INTENSITY": str(
                settings.get("icon_glow_intensity", DEFAULT_SETTINGS["icon_glow_intensity"])
            ),
            "FINALLY_GRADIENT_DIRECTION": str(
                settings.get("gradient_direction", DEFAULT_SETTINGS["gradient_direction"])
            ),
            "FINALLY_GLOW_NORMAL": "1" if settings.get(
                "glow_normal_enabled", DEFAULT_SETTINGS["glow_normal_enabled"]
            ) else "0",
            "FINALLY_FRAME_RING_ENABLED": "1" if settings.get(
                "icon_frame_ring_enabled", DEFAULT_SETTINGS["icon_frame_ring_enabled"]
            ) else "0",
            "FINALLY_ICON_GRADIENT_ENABLED": "1" if settings.get(
                "icon_gradient_enabled", DEFAULT_SETTINGS["icon_gradient_enabled"]
            ) else "0",
        }

    async def _show_gamescope_overlay_locked(self, payload: Dict[str, Any], helper_path: str) -> None:
        async with self._gamescope_overlay_lock:
            settings = self._settings_for(payload.get("settings_appid"))
            if int(settings.get("overlay_size_percent", DEFAULT_SETTINGS["overlay_size_percent"])) <= 0:
                self._gamescope_overlay_status = "hidden_size_zero"
                self._gamescope_overlay_last_error = None
                return

            # Sound plays here, inside the same lock that serializes the
            # visual overlay, so a burst of achievements unlocking at once
            # gets a sound+visual pair *per item, in turn* -- rather than
            # every sound firing all at once the moment each was detected
            # while only the first item's visual (and, it turned out, only
            # the first item's sound) actually made it to the screen/speakers.
            # The tracker starts sliding away while the sound's lead-in plays.
            # MangoApp is stopped (freeing gamescope's overlay slot) while the
            # sound's lead-in plays and the tracker slides away, instead of
            # only after them.
            slot_task = asyncio.create_task(self._acquire_overlay_slot("toast"))
            try:
                hide_task = asyncio.create_task(self._tracker_hide_for_toast())
                played = None if payload.get("test_frame") else await self._play_sound(
                    bool(payload.get("is_rare")),
                    settings,
                    tier=payload.get("tier"),
                    completion=bool(payload.get("completion")),
                )
                # The bundled "*_preroll" sounds start with a short silence so the
                # audible part lines up with the popup, hence the wait. A sound
                # without that lead-in (yours, or the plain bundled ones) starts
                # at once, so the popup shouldn't be held back for it.
                if not (played and "preroll" not in os.path.basename(played).lower()):
                    await asyncio.sleep(AUDIO_PREROLL_SECONDS)
                try:
                    await hide_task
                except Exception as err:
                    decky.logger.warning("Tracker hide failed: %s", err)

                env = os.environ.copy()
                # Decky's bundled libs (LD_LIBRARY_PATH/LD_PRELOAD) can shadow the
                # system GL/EGL drivers and break GLFW window creation.
                env.pop("LD_LIBRARY_PATH", None)
                env.pop("LD_PRELOAD", None)
                env.update(self._overlay_env_vars(settings, payload))
                self._gamescope_overlay_status = "starting"
                try:
                    await slot_task
                    # Try the detected display first; if the helper couldn't reach
                    # it, try the next candidate (at most three). The one that
                    # works is remembered for next time.
                    if payload.get("screenshot_with_popup"):
                        popup_seconds = float(env.get("FINALLY_SECONDS") or DEFAULT_SETTINGS["duration_seconds"])
                        self._start_background(
                            self._screenshot_for_unlock(payload, 0.6 + popup_seconds * 0.45, True)
                        )
                    for display, authority in self._overlay_attempts():
                        env["DISPLAY"] = display
                        if authority:
                            env["XAUTHORITY"] = authority
                        else:
                            env.pop("XAUTHORITY", None)
                        process = await asyncio.create_subprocess_exec(
                            STEAMWORKS_PYTHON,
                            helper_path,
                            env=env,
                            stdout=asyncio.subprocess.PIPE,
                            stderr=asyncio.subprocess.PIPE,
                        )
                        stdout, stderr = await process.communicate()
                        if process.returncode == 0:
                            if stderr:
                                decky.logger.info("Popup overlay: %s", stderr.decode("utf-8", errors="replace").strip()[-300:])
                            self._gamescope_overlay_status = "shown"
                            self._gamescope_overlay_last_error = None
                            self._overlay_display = display
                            self._overlay_xauth = authority
                            self._overlay_failed.pop((display, authority), None)
                            break
                        stderr_text = stderr.decode("utf-8", errors="replace").strip()
                        self._gamescope_overlay_status = f"failed:{process.returncode}"
                        self._gamescope_overlay_last_error = (
                            f"[DISPLAY={display}{' XAUTHORITY=' + os.path.basename(authority) if authority else ''}] "
                            + (stderr_text[-440:] or "unknown overlay helper error")
                        )
                        decky.logger.warning(
                            "Gamescope overlay failed on %s rc=%s stdout=%s stderr=%s",
                            display,
                            process.returncode,
                            stdout.decode("utf-8", errors="replace")[-500:],
                            stderr_text[-500:],
                        )
                        if not self._looks_like_display_failure(stderr_text):
                            break                     # not a display problem: another display won't help
                        self._overlay_failed[(display, authority)] = time.monotonic()
                        if self._overlay_display == display and self._overlay_xauth == authority:
                            self._overlay_display = None      # stop putting it first
                            self._overlay_xauth = None
                except Exception as err:
                    self._gamescope_overlay_status = "failed"
                    self._gamescope_overlay_last_error = str(err)
                    decky.logger.warning("Gamescope overlay failed: %s", err)
            finally:
                try:
                    await slot_task
                except (Exception, asyncio.CancelledError):
                    pass
                # MangoApp comes back only if the tracker isn't holding the slot.
                await self._release_overlay_slot("toast")

    def _is_achievement_line(self, line: str) -> bool:
        return any(pattern.search(line) for pattern in self._achievement_patterns)

    def _is_rare_line(self, line: str) -> bool:
        return bool(self._rare_pattern.search(line))

    def _dedupe_emit(self, dedupe_key: str) -> bool:
        now = time.monotonic()
        stale = [
            key
            for key, seen in self._recent_emit_keys.items()
            if now - seen > DUPLICATE_WINDOW_SECONDS * 3
        ]
        for key in stale:
            self._recent_emit_keys.pop(key, None)

        seen = self._recent_emit_keys.get(dedupe_key)
        if seen is not None and now - seen < DUPLICATE_WINDOW_SECONDS:
            return True

        self._recent_emit_keys[dedupe_key] = now
        return False

    @staticmethod
    def _log_background_failure(task: "asyncio.Future[Any]") -> None:
        """Done-callback for lookups a popup stopped waiting for: they finish on
        their own, and a failure is logged instead of going unretrieved."""
        if task.cancelled():
            return
        err = task.exception()
        if err is not None:
            decky.logger.warning("Background popup lookup failed: %s", err)

    async def _within_budget(self, awaitable: Any, timeout: float) -> Any:
        """The awaitable's result, or None if it fails or isn't done within
        `timeout`. It isn't cancelled on timeout, so a lookup that fills a
        cache still completes for the next popup."""
        task = asyncio.ensure_future(awaitable)
        task.add_done_callback(self._log_background_failure)
        try:
            return await asyncio.wait_for(asyncio.shield(task), timeout=timeout)
        except asyncio.TimeoutError:
            return None
        except Exception as err:
            decky.logger.warning("Popup lookup skipped: %s", err)
            return None

    async def _prepare_popup_icon(
        self,
        appid: Optional[int],
        achievement_id: Optional[str],
        title: str,
        subtitle: str,
        icon_url: Optional[str],
        state: Dict[str, Optional[str]],
    ) -> None:
        """Finds and caches the popup's colored icon. `state` ("path", "url")
        is updated after every step, so a popup that can't wait any longer
        still gets the best icon found so far."""
        icon_url = await self._resolve_authoritative_icon_url(appid, achievement_id, icon_url)
        state["url"] = icon_url
        icon_path = await asyncio.to_thread(
            self._cache_icon, appid, achievement_id, icon_url
        )
        if icon_path:
            state["path"] = icon_path

        if not icon_path and appid is not None and achievement_id:
            # The fast Steamworks-poll detection path can notice an unlock
            # within ~100ms -- sometimes faster than Steam's own client
            # finishes rewriting the local librarycache JSON with that
            # achievement's icon entry (this matters most for achievements
            # in a game whose achievements page has never been opened
            # before, i.e. the very first time this specific JSON gets
            # populated with icon data at all). A couple of short, bounded
            # retries catches that without meaningfully delaying the
            # toast for the common case where the icon was already there.
            for delay in (0.15, 0.35):
                await asyncio.sleep(delay)
                fresh_url = await asyncio.to_thread(
                    self._achievement_icon_from_cache, appid, achievement_id
                )
                if not fresh_url:
                    continue
                icon_path = await asyncio.to_thread(
                    self._cache_icon, appid, achievement_id, fresh_url
                )
                if icon_path:
                    icon_url = fresh_url
                    state["path"], state["url"] = icon_path, icon_url
                    break

        if icon_path and appid is not None and achievement_id:
            # Runs for every source, including the Web API: the schema's
            # "icon" was seen coming back gray for some (new) games.
            try:
                icon_path, icon_url = await self._ensure_colored_icon(
                    appid, achievement_id, title, subtitle, icon_path, icon_url
                )
                state["path"], state["url"] = icon_path, icon_url
            except Exception as err:
                decky.logger.warning("Colored-icon check failed, using icon as-is: %s", err)

    def _schedule_prewarm(self, appid: int) -> None:
        if appid in self._prewarmed_appids:
            return
        self._prewarmed_appids.add(appid)
        task = asyncio.create_task(self._prewarm_game(appid), name="finally-prewarm")
        task.add_done_callback(self._log_background_failure)

    async def _prewarm_game(self, appid: int) -> None:
        """Run once when a game starts: fetches what an unlock popup would
        otherwise download at unlock time (global percentages, the game's
        icon and art, and the icons of achievements still locked), so the
        popup can be shown straight from disk."""
        try:
            await self._steam_api_global_percentages(appid)
        except Exception as err:
            decky.logger.info("Prewarm: percentages for %s unavailable: %s", appid, err)

        icons: Dict[str, str] = {}
        key = self._steam_api_key()
        if key:
            try:
                icons = dict(await self._steam_api_schema_icons(appid, key))
            except Exception as err:
                decky.logger.info("Prewarm: Web API schema for %s unavailable: %s", appid, err)
        if not icons:
            try:
                icons = await asyncio.to_thread(self._local_schema_icon_urls, appid)
            except Exception as err:
                decky.logger.info("Prewarm: local schema for %s unavailable: %s", appid, err)

        settings = self._settings_for(appid)
        needs_art = settings.get("overlay_template") == "game_art" or (
            settings.get("game_art_gradient_enabled") and not settings.get("template_colors_enabled")
        )

        def warm() -> int:
            self._game_icon_path(appid)
            if needs_art:
                self._game_art_path(appid)
            unlocked: Set[str] = set()
            for directory in self._stats_dirs():
                for path in glob.glob(os.path.join(directory, f"UserGameStats_*_{appid}.bin")):
                    unlocked |= set(self._stats_bin_unlocks(appid, path) or {})
            paths: List[str] = []
            for aid, url in icons.items():
                if self._stop_event.is_set() or len(paths) >= PREWARM_ICON_LIMIT:
                    break
                if aid in unlocked:
                    continue
                path = self._cache_icon(appid, aid, url)
                if path:
                    paths.append(path)
            return paths

        paths = await asyncio.to_thread(warm)
        # Check their colors now too, so the gray-icon check at unlock time is
        # a lookup instead of work.
        for path in paths:
            if self._stop_event.is_set():
                break
            await self._icon_color_verdict(path, persist=False)
        self._save_icon_verdicts()
        decky.logger.info("Prewarm for appid=%s done: %s locked achievement icons cached and checked", appid, len(paths))

    async def _emit_notification(
        self,
        title: str,
        subtitle: str,
        is_rare: bool,
        line_hint: str,
        source: str,
        dedupe_key: str,
        appid: Optional[int] = None,
        achievement_id: Optional[str] = None,
        icon_url: Optional[str] = None,
        percent: Optional[float] = None,
        test: bool = False,
    ) -> None:
        # `test` popups are display-only: they never read or write the
        # "already shown" set, so previewing a (possibly locked) achievement
        # can't stop its real unlock popup from appearing later.
        achievement_key = None
        if not test and appid is not None and achievement_id:
            achievement_key = f"{appid}:{achievement_id}"
            if achievement_key in self._emitted_achievement_keys:
                return

        if self._dedupe_emit(dedupe_key):
            return
        if achievement_key is not None:
            self._emitted_achievement_keys.add(achievement_key)

        timestamp = dt.datetime.now(dt.timezone.utc).isoformat()

        # Global unlock percentage, shown on the toast. Some detection
        # paths already know it; for the rest it's looked up from Steam's
        # keyless global-percentages endpoint (cached per game). The lookup
        # runs concurrently with icon resolution below, so it doesn't add
        # its own delay before the toast. If it can't be found, the toast
        # simply shows no percentage -- never a guess.
        percent_task = None
        if not isinstance(percent, (int, float)) and appid is not None and achievement_id:
            percent_task = asyncio.create_task(self._lookup_percent(appid, achievement_id))

        # No description (a fallback detection path, or a secret achievement)?
        # Ask Steam for it while the icon is being fetched; capped so a game
        # that really has none only costs a moment, once.
        desc_task = None
        if not test and appid is not None and achievement_id and not str(subtitle or "").strip():
            # Steam's local schema has the text for every achievement, secret ones too: no waiting needed.
            try:
                _local_name, local_desc = await asyncio.to_thread(self._local_achievement_text, appid, achievement_id)
            except Exception:
                local_desc = ""
            if local_desc:
                subtitle = local_desc
        if not test and appid is not None and achievement_id and not str(subtitle or "").strip():
            desc_task = asyncio.create_task(
                asyncio.wait_for(self._describe_achievement(appid, achievement_id), DESCRIPTION_LOOKUP_SECONDS)
            )

        # Game-art palette source (only when chosen and the gradient is on):
        # fetched concurrently with the icon so it adds no delay.
        # Settings come from the game's profile if it has one on. Test popups
        # have no game of their own, so they preview the running game's.
        settings_appid = appid if appid is not None else self._active_appid
        early_settings = self._settings_for(settings_appid)
        art_task = None
        # The game's art is needed for the "Game Art Blur" template (always)
        # and for the art-colors gradient (unless template colors are on).
        needs_art = early_settings.get("overlay_template") == "game_art" or (
            early_settings.get("game_art_gradient_enabled") and not early_settings.get("template_colors_enabled")
        )
        if appid is not None and needs_art:
            art_task = asyncio.create_task(asyncio.to_thread(self._game_art_path, appid))

        # Everything below (icon, percentage, description, game art) gets one
        # shared time budget. Each used to be awaited in turn with its own
        # multi-second network timeouts, plus a gray-icon check and retries,
        # which together held the popup back 10+ seconds after the unlock.
        # Anything not ready when the budget runs out is left out of this
        # popup; the lookups keep going in the background and are cached, so
        # the next popup has them at once.
        loop = asyncio.get_running_loop()
        deadline = loop.time() + POPUP_PREP_BUDGET_SECONDS

        def remaining(floor: float = 0.05) -> float:
            return max(floor, deadline - loop.time())

        icon_state: Dict[str, Optional[str]] = {"path": None, "url": icon_url}
        icon_task = asyncio.create_task(
            self._prepare_popup_icon(appid, achievement_id, title, subtitle, icon_url, icon_state)
        )
        icon_task.add_done_callback(self._log_background_failure)
        try:
            await asyncio.wait_for(asyncio.shield(icon_task), timeout=remaining())
        except asyncio.TimeoutError:
            decky.logger.info(
                "Popup icon for %s/%s not settled within %.1fs; showing the best one so far",
                appid, achievement_id, POPUP_PREP_BUDGET_SECONDS,
            )
        except Exception as err:
            decky.logger.warning("Popup icon lookup failed: %s", err)
        icon_path, icon_url = icon_state["path"], icon_state["url"]

        placeholder_style = str(
            early_settings.get("placeholder_icon", DEFAULT_SETTINGS["placeholder_icon"])
        )
        if not icon_path and placeholder_style != "trophy":
            # No per-achievement icon available (network hiccup, nothing
            # found in Steam's cache, etc.) -- fall back to the game's own
            # icon rather than the generic abstract badge, so the toast
            # still shows something recognizable. (With the "trophy"
            # placeholder chosen, skip this and let the renderer draw it.)
            icon_path = await self._within_budget(
                asyncio.to_thread(self._game_icon_path, appid), remaining(0.25)
            )

        # The "game icon" placeholder is also shown *before* the real icon
        # arrives on templates that crossfade (Xbox 360 v2), so it's needed
        # even when the real icon was found.
        game_art_path = None
        if art_task is not None:
            game_art_path = await self._within_budget(art_task, remaining())

        placeholder_icon_path = None
        if placeholder_style == "game_icon":
            placeholder_icon_path = await self._within_budget(
                asyncio.to_thread(self._game_icon_path, appid), remaining(0.25)
            )

        if percent_task is not None:
            percent = await self._within_budget(percent_task, remaining())

        if desc_task is not None:
            found = await self._within_budget(desc_task, remaining())
            if found:
                subtitle = found

        # Rarity tier from the final percentage and the user's cutoffs. When
        # known it decides "rare" styling too, so the label, gold look and
        # rare sound always agree with the cutoffs (at the defaults this is
        # the same 10% line as before).
        tier = self._rarity_tier(percent, early_settings)
        if tier is not None:
            is_rare = tier in ("rare", "ultra_rare")

        # Game name for templates that show it (Windows 11 Glass header).
        # Left blank while it's only the "App 12345" placeholder.
        game_name_for_toast = ""
        if settings_appid is not None:
            candidate = self._game_name(settings_appid)
            if candidate and not re.fullmatch(r"App \d+", candidate):
                game_name_for_toast = candidate

        payload = {
            "title": title,
            "subtitle": subtitle,
            "is_rare": is_rare,
            "tier": tier,
            "game_name": game_name_for_toast,
            "percent": float(percent) if isinstance(percent, (int, float)) else None,
            "timestamp": timestamp,
            "appid": appid,
            "achievement_id": achievement_id,
            "icon_url": icon_url,
            "icon_path": icon_path,
            "placeholder_icon_path": placeholder_icon_path,
            "game_art_path": game_art_path,
            "settings_appid": settings_appid,
        }

        if not test and early_settings.get("screenshot_on_unlock"):
            if early_settings.get("screenshot_include_popup"):
                payload["screenshot_with_popup"] = True        # taken once the popup is on screen
            else:
                self._start_background(self._screenshot_for_unlock(payload, 0.0, False))

        if not test:
            try:
                self._record_unlock(payload)
            except Exception as err:
                decky.logger.warning("Unlock history skipped: %s", err)

        asyncio.create_task(self._show_gamescope_overlay(payload))
        await decky.emit("finally_show", payload)

        self._last_match_timestamp = timestamp
        self._last_match_sample = line_hint
        self._last_match_source = source
        decky.logger.info("Notification emitted via %s: %s", source, payload)

    async def _handle_log_line(self, line: str) -> None:
        cleaned = line.strip()
        if not cleaned or not self._is_achievement_line(cleaned):
            return

        now = time.monotonic()
        if (
            cleaned == self._last_emitted_line
            and now - self._last_emit_monotonic < DUPLICATE_WINDOW_SECONDS
        ):
            return

        self._last_emitted_line = cleaned
        self._last_emit_monotonic = now

        is_rare = self._is_rare_line(cleaned)
        title = "Rare Achievement Unlocked" if is_rare else "Achievement Unlocked"
        subtitle = cleaned
        if len(subtitle) > 150:
            subtitle = f"...{subtitle[-147:]}"

        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=cleaned,
            source="stats_log",
            dedupe_key=f"log:{cleaned}",
        )

    async def _read_new_stats_log_lines(self, initial: bool = False) -> None:
        try:
            stat = os.stat(STEAM_LOG_PATH)
        except OSError:
            self._watcher_running = False
            return

        changed_file = (
            self._log_inode is not None
            and (stat.st_ino != self._log_inode or stat.st_dev != self._log_device)
        )
        truncated = self._log_inode is not None and stat.st_size < self._log_position

        if initial:
            self._log_position = stat.st_size
        elif self._log_inode is None or changed_file or truncated:
            self._log_position = 0

        self._log_inode = stat.st_ino
        self._log_device = stat.st_dev

        try:
            with open(STEAM_LOG_PATH, "r", encoding="utf-8", errors="ignore") as stream:
                stream.seek(self._log_position)
                while True:
                    line = stream.readline()
                    if not line:
                        self._log_position = stream.tell()
                        break
                    await self._handle_log_line(line)
        except OSError as err:
            self._last_parse_retry_error = f"stats_log read failed: {err}"

    async def _watch_logs(self) -> None:
        while not self._stop_event.is_set():
            if not os.path.exists(STEAM_LOG_PATH):
                self._watcher_running = False
                decky.logger.warning("Steam log path missing: %s", STEAM_LOG_PATH)
                await asyncio.sleep(2.0)
                continue

            try:
                self._watcher_running = True
                await self._read_new_stats_log_lines(initial=True)
                decky.logger.info("Watching Steam log: %s", STEAM_LOG_PATH)

                while not self._stop_event.is_set():
                    await self._read_new_stats_log_lines()
                    await asyncio.sleep(POLL_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._watcher_running = False
                decky.logger.error("Log watcher error: %s", err)
                await asyncio.sleep(2.0)

        self._watcher_running = False

    def _iter_librarycache_files(self) -> List[str]:
        paths = glob.glob(LIBRARYCACHE_GLOB)
        filtered = []
        for path in paths:
            basename = os.path.basename(path)
            if basename in SKIP_CACHE_FILES:
                continue
            if not basename.endswith(".json"):
                continue
            filtered.append(path)
        return filtered

    def _iter_librarycache_dirs(self) -> List[str]:
        return [
            path
            for path in glob.glob(LIBRARYCACHE_DIR_GLOB)
            if os.path.isdir(path)
        ]

    def _librarycache_path_for_appid(
        self, appid: int, accountid: Optional[str] = None
    ) -> Optional[str]:
        if accountid:
            path = (
                f"/home/deck/.local/share/Steam/userdata/{accountid}/"
                f"config/librarycache/{appid}.json"
            )
            if os.path.exists(path):
                return path

        matches = glob.glob(
            f"/home/deck/.local/share/Steam/userdata/*/config/librarycache/{appid}.json"
        )
        if matches:
            return matches[0]
        return None

    def _appid_from_librarycache_path(self, path: str) -> Optional[int]:
        basename = os.path.basename(path)
        appid_text, ext = os.path.splitext(basename)
        if ext != ".json" or not appid_text.isdigit():
            return None
        if basename in SKIP_CACHE_FILES:
            return None
        return int(appid_text)

    def _load_inotify_libc(self) -> Any:
        try:
            libc = ctypes.CDLL("libc.so.6", use_errno=True)
        except OSError as err:
            raise RuntimeError(f"inotify unavailable: {err}") from err

        libc.inotify_init1.argtypes = [ctypes.c_int]
        libc.inotify_init1.restype = ctypes.c_int
        libc.inotify_add_watch.argtypes = [
            ctypes.c_int,
            ctypes.c_char_p,
            ctypes.c_uint32,
        ]
        libc.inotify_add_watch.restype = ctypes.c_int
        libc.inotify_rm_watch.argtypes = [ctypes.c_int, ctypes.c_int]
        libc.inotify_rm_watch.restype = ctypes.c_int
        return libc

    def _add_inotify_watch(
        self, libc: Any, fd: int, path: str, kind: str, mask: int
    ) -> None:
        if not os.path.exists(path):
            return

        wd = libc.inotify_add_watch(fd, path.encode("utf-8"), mask)
        if wd < 0:
            err_no = ctypes.get_errno()
            raise OSError(err_no, os.strerror(err_no), path)
        self._inotify_watches[wd] = (kind, path)

    def _close_inotify(self) -> None:
        fd = self._inotify_fd
        self._inotify_fd = None
        self._inotify_watches.clear()

        if fd is None:
            return

        loop = asyncio.get_running_loop()
        try:
            loop.remove_reader(fd)
        except Exception:
            pass
        try:
            os.close(fd)
        except OSError:
            pass

    def _open_inotify(self) -> None:
        self._close_inotify()
        libc = self._load_inotify_libc()
        fd = libc.inotify_init1(os.O_NONBLOCK | os.O_CLOEXEC)
        if fd < 0:
            err_no = ctypes.get_errno()
            raise OSError(err_no, os.strerror(err_no))

        self._inotify_fd = fd
        watch_mask = (
            IN_CLOSE_WRITE
            | IN_MOVED_TO
            | IN_CREATE
            | IN_ATTRIB
            | IN_DELETE_SELF
            | IN_MOVE_SELF
            | IN_IGNORED
            | IN_Q_OVERFLOW
        )
        log_mask = watch_mask | IN_MODIFY

        for path in self._iter_librarycache_dirs():
            self._add_inotify_watch(libc, fd, path, "librarycache_dir", watch_mask)

        self._add_inotify_watch(
            libc, fd, STEAM_APPCACHE_STATS_DIR, "appcache_stats_dir", watch_mask
        )
        self._add_inotify_watch(libc, fd, STEAM_LOG_DIR, "steam_log_dir", log_mask)

        if not self._inotify_watches:
            raise RuntimeError("inotify has no valid watch paths")

        loop = asyncio.get_running_loop()
        loop.add_reader(fd, self._read_inotify_events)

    def _read_inotify_events(self) -> None:
        fd = self._inotify_fd
        queue = self._inotify_queue
        if fd is None or queue is None:
            return

        while True:
            try:
                data = os.read(fd, INOTIFY_READ_SIZE)
            except BlockingIOError:
                return
            except OSError as err:
                queue.put_nowait(
                    {"kind": "inotify_error", "error": str(err), "event_time": time.monotonic()}
                )
                return

            if not data:
                return

            offset = 0
            while offset + INOTIFY_STRUCT.size <= len(data):
                wd, mask, cookie, name_len = INOTIFY_STRUCT.unpack_from(data, offset)
                offset += INOTIFY_STRUCT.size
                raw_name = data[offset : offset + name_len]
                offset += name_len
                name = raw_name.split(b"\0", 1)[0].decode("utf-8", errors="ignore")
                watch = self._inotify_watches.get(wd)
                if watch is None:
                    continue
                kind, base_path = watch
                path = os.path.join(base_path, name) if name else base_path
                queue.put_nowait(
                    {
                        "kind": kind,
                        "path": path,
                        "mask": mask,
                        "cookie": cookie,
                        "event_time": time.monotonic(),
                    }
                )

    def _event_to_cache_path(self, event: Dict[str, Any]) -> Optional[Tuple[str, str, int]]:
        kind = event.get("kind")
        path = str(event.get("path") or "")
        mask = int(event.get("mask") or 0)

        if mask & IN_Q_OVERFLOW:
            return None

        if kind == "librarycache_dir":
            appid = self._appid_from_librarycache_path(path)
            if appid is None:
                return None
            return path, "librarycache_inotify", appid

        if kind == "appcache_stats_dir":
            match = self._stats_bin_pattern.match(os.path.basename(path))
            if not match:
                return None
            appid = int(match.group("appid"))
            cache_path = self._librarycache_path_for_appid(
                appid, accountid=match.group("accountid")
            )
            if cache_path is None:
                return None
            return cache_path, "appcache_stats_inotify", appid

        return None

    def _detect_running_steam_appid(self) -> Optional[Tuple[int, int]]:
        candidates: List[Tuple[int, int]] = []
        ignored_appids = {0, 769, 1675200}

        for pid_text in os.listdir("/proc"):
            if not pid_text.isdigit():
                continue

            environ_path = os.path.join("/proc", pid_text, "environ")
            cmdline_path = os.path.join("/proc", pid_text, "cmdline")
            stat_path = os.path.join("/proc", pid_text, "stat")
            try:
                environ = open(environ_path, "rb").read()
                cmdline = open(cmdline_path, "rb").read().decode(
                    "utf-8", errors="ignore"
                )
            except OSError:
                continue

            if STEAMWORKS_HELPER_NAME in cmdline:
                continue

            appid: Optional[int] = None
            for raw_item in environ.split(b"\0"):
                if not raw_item.startswith((b"SteamAppId=", b"SteamGameId=")):
                    continue
                try:
                    value = raw_item.split(b"=", 1)[1].decode("ascii", errors="ignore")
                    parsed = int(value)
                except (IndexError, ValueError):
                    continue
                if parsed not in ignored_appids:
                    appid = parsed
                    break

            if appid is None:
                continue

            try:
                stat = open(stat_path, "r", encoding="utf-8", errors="ignore").read()
                start_ticks = int(stat.rsplit(") ", 1)[1].split()[19])
            except Exception:
                start_ticks = 0

            candidates.append((start_ticks, appid))

        if not candidates:
            return None

        start_ticks, appid = max(candidates, key=lambda item: item[0])
        return appid, start_ticks

    def _steamworks_helper_path(self) -> str:
        return os.path.join(decky.DECKY_PLUGIN_DIR, STEAMWORKS_HELPER_NAME)

    def _stop_steamworks_process(self) -> None:
        process = self._steamworks_process
        self._steamworks_process = None
        if process is None or process.returncode is not None:
            return

        try:
            process.terminate()
        except ProcessLookupError:
            pass
        except Exception as err:
            decky.logger.warning("Unable to terminate Steamworks helper: %s", err)

    async def _start_steamworks_process(self, appid: int) -> None:
        self._stop_steamworks_process()

        helper_path = self._steamworks_helper_path()
        if not os.path.exists(helper_path):
            self._steamworks_status = "disabled_helper_missing"
            self._steamworks_running = False
            return
        lib_path = self._steamworks_lib_path()
        if not os.path.exists(lib_path):
            self._steamworks_status = "disabled_lib_missing"
            self._steamworks_last_error = lib_path
            self._steamworks_running = False
            return

        env = os.environ.copy()
        env["SteamAppId"] = str(appid)
        env["SteamGameId"] = str(appid)
        env["LD_LIBRARY_PATH"] = (
            os.path.dirname(lib_path)
            + os.pathsep
            + env.get("LD_LIBRARY_PATH", "")
        )

        process = await asyncio.create_subprocess_exec(
            STEAMWORKS_PYTHON,
            helper_path,
            "--appid",
            str(appid),
            "--poll-ms",
            str(STEAMWORKS_POLL_INTERVAL_MS),
            "--lib",
            lib_path,
            "--refresh-ms",
            str(STEAMWORKS_REFRESH_INTERVAL_MS),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        self._steamworks_process = process
        self._steamworks_last_appid = appid
        self._steamworks_last_process_pid = process.pid
        self._steamworks_last_start_monotonic = time.monotonic()
        self._steamworks_status = "started"
        self._steamworks_running = True
        self._steamworks_reader_task = asyncio.create_task(
            self._read_steamworks_stdout(process, appid),
            name="finally-steamworks-stdout",
        )
        self._steamworks_stderr_task = asyncio.create_task(
            self._read_steamworks_stderr(process),
            name="finally-steamworks-stderr",
        )
        decky.logger.info("Steamworks helper started for appid=%s", appid)

    async def _read_steamworks_stderr(
        self, process: asyncio.subprocess.Process
    ) -> None:
        if process.stderr is None:
            return

        while not self._stop_event.is_set():
            line = await process.stderr.readline()
            if not line:
                return
            text = line.decode("utf-8", errors="ignore").strip()
            if text:
                self._steamworks_last_error = text[:300]

    async def _read_steamworks_stdout(
        self, process: asyncio.subprocess.Process, appid: int
    ) -> None:
        if process.stdout is None:
            return

        while not self._stop_event.is_set():
            line = await process.stdout.readline()
            if not line:
                return

            try:
                event = json.loads(line.decode("utf-8", errors="ignore"))
            except json.JSONDecodeError:
                continue

            event_type = event.get("type")
            if event_type == "ready":
                self._steamworks_status = (
                    f"appid={appid}: ready achievements={event.get('count', 0)}"
                )
                continue
            if event_type == "error":
                self._steamworks_status = "error"
                self._steamworks_last_error = str(event.get("error") or "unknown")
                continue
            if event_type != "unlock":
                continue

            achievement_id = str(event.get("id") or "")
            if not achievement_id:
                continue

            name = str(event.get("name") or achievement_id)
            desc = str(event.get("desc") or "").strip()
            percent = event.get("percent")
            is_rare = isinstance(percent, (int, float)) and percent <= RARE_PERCENT_THRESHOLD
            title = name
            subtitle = desc
            icon_url = self._achievement_icon_from_cache(appid, achievement_id)
            self._steamworks_unlock_count += 1
            self._last_new_unlock_ids = [achievement_id]
            self._last_scanned_appid = appid
            self._last_cache_status = "steamworks_new_unlock"

            await self._emit_notification(
                title=title,
                subtitle=subtitle,
                is_rare=is_rare,
                line_hint=f"appid={appid} id={achievement_id} name={name}",
                source="steamworks_poll",
                dedupe_key=f"achievement:{appid}:{achievement_id}",
                appid=appid,
                achievement_id=achievement_id,
                icon_url=icon_url,
                percent=percent if isinstance(percent, (int, float)) else None,
            )

            # Game complete? The probe reports how many are unlocked out of
            # the game's total, straight from Steam, so this works for every
            # game -- and it's evaluated even if another detection path won
            # the race to show this unlock's regular toast.
            if self._is_game_complete(event):
                self._schedule_completion_toast(appid)
            else:
                self._maybe_near_completion(appid, event)

    async def _watch_steamworks(self) -> None:
        active_appid: Optional[int] = None
        none_since: Optional[float] = None

        while not self._stop_event.is_set():
            try:
                detected = await asyncio.to_thread(self._detect_running_steam_appid)
                if detected is None:
                    if none_since is None:
                        none_since = time.monotonic()
                    elif time.monotonic() - none_since >= SESSION_END_SECONDS:
                        self._end_session()
                    if active_appid is not None:
                        self._stop_steamworks_process()
                    active_appid = None
                    self._active_appid = None
                    self._steamworks_running = False
                    self._steamworks_status = "idle_no_running_game"
                else:
                    appid, _start_ticks = detected
                    none_since = None
                    if self._session is not None and self._session.get("appid") != appid:
                        self._end_session()
                    self._active_appid = appid
                    self._game_name(appid)  # warms the name (local now, store in background)
                    self._schedule_prewarm(appid)  # percentages and icons, so an unlock popup needn't download them
                    process = self._steamworks_process
                    process_dead = process is not None and process.returncode is not None
                    cooldown_active = (
                        process_dead
                        and appid == active_appid
                        and time.monotonic() - self._steamworks_last_start_monotonic
                        < STEAMWORKS_RESTART_COOLDOWN_SECONDS
                    )
                    if (
                        not cooldown_active
                        and (
                            appid != active_appid
                            or process is None
                            or process_dead
                        )
                    ):
                        active_appid = appid
                        self._steamworks_last_process_pid = None
                        await self._start_steamworks_process(appid)
                    elif cooldown_active:
                        self._steamworks_running = False
                        self._steamworks_status = "restart_cooldown"

                await asyncio.sleep(STEAMWORKS_APPID_SCAN_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._steamworks_running = False
                self._steamworks_status = "error"
                self._steamworks_last_error = str(err)
                decky.logger.warning("Steamworks watcher error: %s", err)
                await asyncio.sleep(2.0)

        self._stop_steamworks_process()
        self._steamworks_running = False

    def _steam_api_key(self) -> Optional[str]:
        env_key = os.environ.get(STEAM_WEB_API_KEY_ENV, "").strip()
        if env_key:
            return env_key

        for key_file in STEAM_WEB_API_KEY_FILES:
            try:
                with open(key_file, "r", encoding="utf-8") as stream:
                    file_key = stream.read().strip()
            except OSError:
                continue

            if file_key:
                return file_key

        return None

    def _steamid64_from_userdata(self) -> Optional[int]:
        candidates: List[Tuple[int, int]] = []
        for path in glob.glob("/home/deck/.local/share/Steam/userdata/*"):
            account_id_text = os.path.basename(path)
            if not account_id_text.isdigit():
                continue

            cache_glob = os.path.join(path, "config", "librarycache", "*.json")
            candidates.append((len(glob.glob(cache_glob)), int(account_id_text)))

        if not candidates:
            return None

        _cache_count, account_id = max(candidates)
        return STEAM_ID64_BASE + account_id

    async def _steam_api_json(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{STEAM_API_BASE_URL}{path}?{urllib.parse.urlencode(params)}"

        def _request() -> Dict[str, Any]:
            env = os.environ.copy()
            env.pop("LD_LIBRARY_PATH", None)
            env.pop("LD_PRELOAD", None)
            result = subprocess.run(
                [
                    "curl",
                    "--fail",
                    "--silent",
                    "--show-error",
                    "--location",
                    "--max-time",
                    str(int(STEAM_API_TIMEOUT_SECONDS)),
                    "--user-agent",
                    "FinallyAchievementPlugin/1.0",
                    url,
                ],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                check=False,
            )
            if result.returncode != 0:
                stderr = (result.stderr or "").strip()
                raise RuntimeError(f"curl failed ({result.returncode}): {stderr}")
            return json.loads(result.stdout)

        return await asyncio.to_thread(_request)

    async def _steam_api_recent_appids(self, key: str, steamid64: int) -> List[int]:
        payload = await self._steam_api_json(
            "/IPlayerService/GetRecentlyPlayedGames/v1/",
            {
                "key": key,
                "steamid": steamid64,
                "count": STEAM_API_RECENT_GAME_LIMIT,
                "format": "json",
            },
        )

        games = payload.get("response", {}).get("games", [])
        appids: List[int] = []
        for game in games:
            appid = game.get("appid") if isinstance(game, dict) else None
            if isinstance(appid, int):
                appids.append(appid)

        return appids

    async def _lookup_percent(self, appid: int, achievement_id: str) -> Optional[float]:
        try:
            percentages = await self._steam_api_global_percentages(appid)
        except Exception as err:
            decky.logger.warning("Unlock percentage lookup failed for appid=%s: %s", appid, err)
            return None
        if achievement_id in percentages:
            return percentages[achievement_id]
        lowered = achievement_id.lower()
        return next((v for k, v in percentages.items() if k.lower() == lowered), None)

    async def _steam_api_global_percentages(self, appid: int) -> Dict[str, float]:
        cached = self._steam_api_percent_cache.get(appid)
        if cached is not None:
            return cached

        payload = await self._steam_api_json(
            f"/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/",
            {"gameid": appid, "format": "json"},
        )
        achievements = payload.get("achievementpercentages", {}).get(
            "achievements", []
        )
        percentages: Dict[str, float] = {}
        for item in achievements:
            if not isinstance(item, dict):
                continue
            name = item.get("name")
            percent = item.get("percent")
            if isinstance(name, str) and isinstance(percent, (int, float)):
                percentages[name] = float(percent)

        if percentages:
            self._steam_api_percent_cache[appid] = percentages
        return percentages

    async def _steam_api_schema_icons(self, appid: int, key: str) -> Dict[str, str]:
        """Maps achievement apiname -> the *colored/unlocked* icon URL, via
        Steam's official GetSchemaForGame endpoint. Unlike the local
        librarycache JSON (which stores a single ambiguous icon per
        achievement, sometimes the gray/locked variant, sometimes stale),
        this is the authoritative source Steam itself uses and always
        returns both the "icon" (unlocked) and "icongray" (locked) URLs
        explicitly -- we only ever want "icon" here since a toast only ever
        fires for an unlock. Cached indefinitely per appid: the schema is
        static game metadata, it doesn't change achievement to achievement.

        Only caches a *non-empty* result. A 200 OK response with an empty/
        unexpected body (a momentary Steam API hiccup, rate limiting that
        doesn't surface as an HTTP error, etc.) doesn't raise -- it used to
        get cached as a permanent negative result, silently downgrading
        every achievement for the rest of that game's session to the
        ambiguous local-cache icon lookup after just one bad call. Now a
        soft failure just means "try again next time" instead of "give up
        on the authoritative source for this entire play session."
        """
        cached = self._steam_api_schema_icon_cache.get(appid)
        if cached:
            return cached

        payload = await self._steam_api_json(
            "/ISteamUserStats/GetSchemaForGame/v2/",
            {"key": key, "appid": appid, "l": self._steam_l_param(), "format": "json"},
        )
        achievements = (
            payload.get("game", {}).get("availableGameStats", {}).get("achievements", [])
        )
        icons: Dict[str, str] = {}
        grays: Dict[str, str] = {}
        meta: List[Dict[str, Any]] = []
        if isinstance(achievements, list):
            for item in achievements:
                if not isinstance(item, dict):
                    continue
                name = item.get("name")
                icon = item.get("icon")
                icongray = item.get("icongray")
                if isinstance(name, str) and isinstance(icon, str) and icon:
                    icons[name] = icon
                    display = item.get("displayName")
                    meta.append(
                        {
                            "id": name,
                            "name": display.strip() if isinstance(display, str) and display.strip() else name,
                            "desc": str(item.get("description") or "").strip(),
                            "icon": icon,
                        }
                    )
                if isinstance(name, str) and isinstance(icongray, str) and icongray:
                    grays[name] = icongray

        if icons:
            self._steam_api_schema_icon_cache[appid] = icons
            self._steam_api_schema_icongray_cache[appid] = grays
            self._steam_api_schema_meta_cache[appid] = meta
        return icons

    # --- local schema: colored icons with no key and no network ---------------

    def _schema_stats_files(self, appid: int) -> List[str]:
        found: List[str] = []
        for root in self._steam_roots():
            path = os.path.join(root, "appcache", "stats", f"UserGameStatsSchema_{appid}.bin")
            if os.path.isfile(path):
                found.append(path)
        return found

    def _local_schema_icon_files(self, appid: int) -> Dict[str, str]:
        """{achievement id: colored icon file name} from Steam's local schema
        for this game ({} if the file is missing or unreadable). Cached until
        the file changes."""
        merged: Dict[str, str] = {}
        for path in self._schema_stats_files(appid):
            try:
                stamp = os.stat(path).st_mtime_ns
                cached = self._local_schema_cache.get(path)
                if cached is not None and cached[0] == stamp:
                    icons = cached[1]
                else:
                    with open(path, "rb") as stream:
                        parsed, _ = _vdf_parse(stream.read(), 0)
                    icons, gray = {}, {}
                    _schema_icon_files(parsed, icons, gray)
                    self._local_schema_cache[path] = (stamp, icons)
            except Exception as err:
                decky.logger.warning("Local schema parse failed for %s: %s", path, err)
                continue
            for aid, icon in icons.items():
                merged.setdefault(aid, icon)
        return merged

    def _local_schema_icon_urls(self, appid: int) -> Dict[str, str]:
        urls: Dict[str, str] = {}
        for aid, icon in self._local_schema_icon_files(appid).items():
            url = self._resolve_icon_url(appid, icon)
            if url:
                urls[aid] = url
        return urls

    def _local_schema_icon_url(self, appid: int, achievement_id: str) -> Optional[str]:
        urls = self._local_schema_icon_urls(appid)
        if achievement_id in urls:
            return urls[achievement_id]
        lowered = achievement_id.lower()
        return next((u for n, u in urls.items() if n.lower() == lowered), None)

    # ------------------------------------------------------------------
    # Local stats files: instant unlock detection and descriptions
    # ------------------------------------------------------------------

    def _stats_dirs(self) -> List[str]:
        dirs = []
        for root in self._steam_roots():
            path = os.path.join(root, "appcache", "stats")
            if os.path.isdir(path):
                dirs.append(path)
        return dirs

    def _local_stats_schema(self, appid: int) -> Dict[str, Any]:
        """From appcache/stats/UserGameStatsSchema_<appid>.bin: {"by_bit": {(statid, bit): id}, "by_id": {id: {...}}} where each
        entry has "names" and "descs" (language -> text, as Steam spells the languages) and "hidden". Cached until the file changes."""
        for path in self._schema_stats_files(appid):
            try:
                stamp = os.stat(path).st_mtime_ns
                cached = self._stats_schema_cache.get(path)
                if cached is not None and cached[0] == stamp:
                    return cached[1]
                with open(path, "rb") as stream:
                    parsed, _ = _vdf_parse(stream.read(), 0)
            except Exception as err:
                decky.logger.warning("Local stats schema unreadable (%s): %s", path, err)
                continue
            by_bit: Dict[Tuple[str, str], str] = {}
            by_id: Dict[str, Dict[str, Any]] = {}
            top = parsed.get(str(appid)) if isinstance(parsed.get(str(appid)), dict) else next(
                (v for v in parsed.values() if isinstance(v, dict) and "stats" in v), {})
            stats = top.get("stats") if isinstance(top, dict) else None
            for stat_id, stat in (stats or {}).items():
                bits = stat.get("bits") if isinstance(stat, dict) else None
                if not isinstance(bits, dict):
                    continue
                for bit, node in bits.items():
                    if not isinstance(node, dict) or not isinstance(node.get("name"), str):
                        continue
                    display = node.get("display") if isinstance(node.get("display"), dict) else {}
                    def langs(value: Any) -> Dict[str, str]:
                        return {k: v for k, v in value.items() if isinstance(v, str) and k != "token"} if isinstance(value, dict) else {}
                    by_bit[(str(stat_id), str(bit))] = node["name"]
                    by_id[node["name"]] = {
                        "names": langs(display.get("name")),
                        "descs": langs(display.get("desc")),
                        "hidden": str(display.get("hidden", "0")) in ("1", "true"),
                    }
            result = {"by_bit": by_bit, "by_id": by_id}
            self._stats_schema_cache[path] = (stamp, result)
            return result
        return {"by_bit": {}, "by_id": {}}

    def _local_achievement_text(self, appid: int, achievement_id: str) -> Tuple[str, str]:
        """(name, description) of an achievement in Steam's language, from Steam's local schema; ("", "") when it isn't there."""
        entry = self._local_stats_schema(appid)["by_id"].get(achievement_id)
        if entry is None:
            lowered = achievement_id.lower()
            entry = next((v for k, v in self._local_stats_schema(appid)["by_id"].items() if k.lower() == lowered), None)
        if entry is None:
            return "", ""
        language = self._steam_language_name() or "english"
        def pick(texts: Dict[str, str]) -> str:
            return (texts.get(language) or texts.get("english") or next(iter(texts.values()), "")).strip()
        return pick(entry["names"]), pick(entry["descs"])

    def _stats_bin_unlocks(self, appid: int, path: str) -> Optional[Dict[str, int]]:
        """{achievement id: unlock time} from Steam's UserGameStats file for this game, or None if it can't be read right now."""
        try:
            with open(path, "rb") as stream:
                tree, _ = _vdf_parse(stream.read(), 0)
        except Exception:
            return None
        schema = self._local_stats_schema(appid)["by_bit"]
        cache = tree.get("cache") if isinstance(tree.get("cache"), dict) else {}
        unlocked: Dict[str, int] = {}
        for stat_id, node in cache.items():
            times = node.get("AchievementTimes") if isinstance(node, dict) else None
            if not isinstance(times, dict):
                continue
            for bit, stamp in times.items():
                ach_id = schema.get((str(stat_id), str(bit)))
                if ach_id and isinstance(stamp, int) and stamp > 0:
                    unlocked[ach_id] = stamp
        return unlocked

    async def _process_stats_bin(self, path: str, appid: int, source: str = "stats_bin") -> None:
        unlocked = None
        for attempt in range(3):                 # Steam may still be writing the file
            unlocked = await asyncio.to_thread(self._stats_bin_unlocks, appid, path)
            if unlocked is not None:
                break
            await asyncio.sleep(0.15 * (attempt + 1))
        if unlocked is None:
            self._stats_bin_status = f"appid={appid}: unreadable"
            return
        previous = self._stats_known.get(path)
        self._stats_known[path] = set(unlocked)
        now = time.time()
        if previous is None:
            new_ids = [i for i, stamp in unlocked.items() if stamp >= now - STATS_BIN_NEW_WINDOW_SECONDS]
        else:
            new_ids = [i for i in unlocked if i not in previous]
        if not new_ids:
            self._stats_bin_status = f"appid={appid}: no_new_unlocks"
            return
        for ach_id in sorted(new_ids, key=lambda i: unlocked[i]):
            name, desc = await asyncio.to_thread(self._local_achievement_text, appid, ach_id)
            icon_url = self._local_schema_icon_url(appid, ach_id) or self._achievement_icon_from_cache(appid, ach_id)
            self._stats_bin_status = f"appid={appid}: new_unlock {ach_id}"
            self._stats_bin_unlock_count += 1
            await self._emit_notification(
                title=name or ach_id,
                subtitle=desc,
                is_rare=False,
                line_hint=f"appid={appid} id={ach_id} name={name or ach_id}",
                source=source,
                dedupe_key=f"achievement:{appid}:{ach_id}",
                appid=appid,
                achievement_id=ach_id,
                icon_url=icon_url,
            )

    def _schedule_stats_bin(self, path: str, appid: int, source: str) -> None:
        """Reads a changed UserGameStats file right away, without holding up the watcher that noticed it."""
        reader = self._stats_readers.get(path)
        if reader is not None and not reader.done():
            self._stats_reread.add(path)
            return
        self._stats_readers[path] = asyncio.create_task(
            self._read_stats_bin_changes(path, appid, source), name="finally-stats-bin-read"
        )

    async def _read_stats_bin_changes(self, path: str, appid: int, source: str) -> None:
        while not self._stop_event.is_set():
            self._stats_reread.discard(path)
            try:
                self._stats_mtimes[path] = os.stat(path).st_mtime_ns
            except OSError:
                pass
            try:
                await self._process_stats_bin(path, appid, source=source)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._stats_bin_status = f"error: {err}"
                decky.logger.warning("Stats file read failed for %s: %s", path, err)
            if path not in self._stats_reread:
                return

    async def _watch_stats_bin(self) -> None:
        """Backstop for the inotify watcher: looks for changes of Steam's UserGameStats files a few times a second (a
        directory listing: cheap) and reads the one that changed. Reading this file is how an unlock is noticed at once
        on setups where the library data and the game's Steamworks stats are slow to update."""
        pattern = self._stats_bin_pattern
        first = True
        while not self._stop_event.is_set():
            try:
                for directory in self._stats_dirs():
                    try:
                        entries = list(os.scandir(directory))
                    except OSError:
                        continue
                    for entry in entries:
                        match = pattern.match(entry.name)
                        if not match:
                            continue
                        try:
                            stamp = entry.stat().st_mtime_ns
                        except OSError:
                            continue
                        previous = self._stats_mtimes.get(entry.path)
                        self._stats_mtimes[entry.path] = stamp
                        if first or previous is None or stamp == previous:
                            continue
                        self._schedule_stats_bin(entry.path, int(match.group("appid")), "stats_bin")
                first = False
                if self._stats_bin_status == "not_started":
                    self._stats_bin_status = "watching"
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._stats_bin_status = f"error: {err}"
                decky.logger.warning("Stats file watcher error: %s", err)
            await asyncio.sleep(STATS_BIN_SCAN_INTERVAL_SECONDS)

    async def _resolve_authoritative_icon_url(
        self, appid: Optional[int], achievement_id: Optional[str], fallback_icon_url: Optional[str]
    ) -> Optional[str]:
        """The COLORED icon for an achievement, best source first: the Steam
        Web API schema (needs a key), then Steam's own local schema file (no
        key, no network). Anything else is left to the caller's local-cache
        icon, which _ensure_colored_icon then checks and replaces if gray."""
        url = await self._resolve_api_icon_url(appid, achievement_id, None)
        if url:
            return url
        if appid is not None and achievement_id:
            try:
                local = await asyncio.to_thread(self._local_schema_icon_url, appid, achievement_id)
            except Exception as err:
                decky.logger.warning("Local schema icon lookup failed for %s/%s: %s", appid, achievement_id, err)
                local = None
            if local:
                self._last_icon_resolution["result"] = "authoritative_local_schema"
                return local
        return fallback_icon_url

    async def _resolve_api_icon_url(
        self, appid: Optional[int], achievement_id: Optional[str], fallback_icon_url: Optional[str]
    ) -> Optional[str]:
        """If a Steam Web API key is configured, prefer its icon URL over
        whatever the local-cache-based lookup came up with -- it's always a
        full, correct, already-colored URL regardless of which detection
        path (log line / fast Steamworks poll / Steam Web API poll) found
        the unlock, and regardless of whether the local librarycache JSON
        has been refreshed yet. Falls back to the passed-in URL on any
        failure (no key configured, network error, achievement not found
        in the schema, etc.) so this is purely additive/best-effort.

        Every fallback path logs *why* it fell back (via decky.logger,
        visible in Decky Loader's plugin log) and records the reason on
        self._last_icon_resolution -- if the colored icon still doesn't
        show up after this, that log/status is the way to find out
        whether it's this function falling back (and why) rather than
        something further down the pipeline (download failing validation,
        etc.), instead of guessing again.
        """
        self._last_icon_resolution = {"appid": appid, "achievement_id": achievement_id}

        if appid is None or not achievement_id:
            self._last_icon_resolution["result"] = "skipped_no_appid_or_id"
            return fallback_icon_url

        key = self._steam_api_key()
        if not key:
            self._last_icon_resolution["result"] = "no_api_key_configured"
            return fallback_icon_url

        try:
            icons = await self._steam_api_schema_icons(appid, key)
        except Exception as err:
            decky.logger.warning(
                "Icon resolution: Web API schema fetch failed for appid=%s achievement=%s: %s",
                appid, achievement_id, err,
            )
            self._last_icon_resolution["result"] = f"schema_fetch_error:{err}"
            return fallback_icon_url

        if not icons:
            decky.logger.warning(
                "Icon resolution: Web API schema for appid=%s returned no usable icons "
                "(empty/unexpected response) -- falling back to local cache for achievement=%s",
                appid, achievement_id,
            )
            self._last_icon_resolution["result"] = "schema_empty"
            return fallback_icon_url

        # Exact match first; fall back to a case-insensitive match in case
        # the Steamworks-side achievement id and the Web API schema's own
        # "name" field ever differ only in case (both come from the same
        # underlying Steam schema, so this should be rare, but it's a
        # free, harmless safety net against silently dropping to the
        # ambiguous local-cache icon over a trivial mismatch).
        if achievement_id in icons:
            self._last_icon_resolution["result"] = "authoritative_exact_match"
            return icons[achievement_id]
        lowered = achievement_id.lower()
        for name, icon in icons.items():
            if name.lower() == lowered:
                self._last_icon_resolution["result"] = "authoritative_case_insensitive_match"
                return icon

        decky.logger.warning(
            "Icon resolution: appid=%s achievement=%s not found in the Web API schema "
            "(%d achievements known) -- falling back to local cache",
            appid, achievement_id, len(icons),
        )
        self._last_icon_resolution["result"] = "achievement_not_in_schema"
        return fallback_icon_url

    # ------------------------------------------------------------------
    # Colored-icon guarantee (no API key needed)
    #
    # Steam's local librarycache JSON keeps ONE `strImage` per achievement
    # and it reflects the state when Steam last wrote the file. The fast
    # Steamworks poll often fires before Steam rewrites it, so the entry can
    # still point at the GRAY (locked) icon -- most visible on newly
    # released games whose cache has only ever been written in the locked
    # state. The old retry only ran when the icon was *missing*, never when
    # it was present-but-gray. The methods below detect a gray icon and try,
    # in order: the public Steam Community achievements page (keyless,
    # colored icons, matched by title), then short re-reads of the local
    # cache waiting for Steam to swap in the colored hash.
    # ------------------------------------------------------------------

    async def _icon_color_verdict(self, path: Optional[str], persist: bool = True) -> str:
        """"gray", "color" or "unknown" for an icon file. "unknown" on any
        failure -- callers treat that as "don't second-guess". A file is
        checked once: the answer is remembered (on disk too) until the file
        changes. The check itself runs in a helper under the system python
        (which has GdkPixbuf, same as the renderer), started once and kept
        running instead of a new process per icon."""
        if not path or not os.path.isfile(path) or "\n" in path:
            return "unknown"
        try:
            st = os.stat(path)
        except OSError:
            return "unknown"
        verdicts = self._load_icon_verdicts()
        known = verdicts.get(path)
        if known and known[0] == st.st_mtime_ns and known[1] == st.st_size:
            return str(known[2])
        verdict = self._parse_color_verdict(await self._color_worker_check(path))
        if verdict != "unknown":
            verdicts[path] = [st.st_mtime_ns, st.st_size, verdict]
            if persist:
                self._save_icon_verdicts()
        return verdict

    def _load_icon_verdicts(self) -> Dict[str, List[Any]]:
        if self._icon_verdicts is None:
            stored = self._read_json_file(FINALLY_ICON_VERDICTS_FILE)
            self._icon_verdicts = {
                k: v for k, v in (stored or {}).items()
                if isinstance(v, list) and len(v) == 3 and os.path.isfile(k)
            } if isinstance(stored, dict) else {}
        return self._icon_verdicts

    def _save_icon_verdicts(self) -> None:
        if self._icon_verdicts is not None:
            self._write_json_file(FINALLY_ICON_VERDICTS_FILE, dict(self._icon_verdicts))

    def _stop_color_worker(self) -> None:
        process = self._color_worker
        self._color_worker = None
        if process is not None and process.returncode is None:
            try:
                process.kill()
            except ProcessLookupError:
                pass

    async def _color_worker_check(self, path: str) -> str:
        """The helper's raw answer for one icon ("" on failure). A helper that
        hangs or dies is stopped and a fresh one starts on the next check."""
        async with self._color_worker_lock:
            try:
                process = self._color_worker
                if process is None or process.returncode is not None:
                    env = os.environ.copy()
                    env.pop("LD_LIBRARY_PATH", None)
                    env.pop("LD_PRELOAD", None)
                    process = await asyncio.create_subprocess_exec(
                        STEAMWORKS_PYTHON, "-c", ICON_COLOR_CHECK_SCRIPT, "--serve", decky.DECKY_PLUGIN_DIR,
                        stdin=asyncio.subprocess.PIPE,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.DEVNULL,
                        env=env,
                    )
                    self._color_worker = process
                assert process.stdin is not None and process.stdout is not None
                process.stdin.write(path.encode("utf-8") + b"\n")
                await process.stdin.drain()
                line = await asyncio.wait_for(process.stdout.readline(), timeout=ICON_CHECK_TIMEOUT_SECONDS)
                if not line:
                    raise RuntimeError("icon check helper exited")
                return line.decode("utf-8", errors="replace")
            except asyncio.CancelledError:
                self._stop_color_worker()       # it may still owe an answer; don't let it reach the next check
                raise
            except Exception as err:
                decky.logger.warning("Icon color check failed: %s", err)
                self._stop_color_worker()
                return ""

    @staticmethod
    def _parse_color_verdict(text: str) -> str:
        parts = text.strip().split()
        if len(parts) != 2:
            return "unknown"
        try:
            mean_chroma = float(parts[0])
            max_chroma = int(parts[1])
        except ValueError:
            return "unknown"
        if mean_chroma < ICON_GRAY_MEAN_CHROMA and max_chroma < ICON_GRAY_MAX_CHROMA:
            return "gray"
        return "color"

    @staticmethod
    def _norm_text(value: str) -> str:
        return re.sub(r"\s+", " ", html_lib.unescape(value or "")).strip().casefold()

    def _parse_community_achievements(self, page: str) -> Dict[str, List[Tuple[str, str]]]:
        """title(normalized) -> [(icon_url, description_normalized), ...] from
        the public achievements page (rows are `achieveRow` blocks with an
        <img>, an <h3> title and an <h5> description)."""
        result: Dict[str, List[Tuple[str, str]]] = {}
        for row in re.split(r'<div class="achieveRow', page)[1:]:
            img = re.search(r'<img[^>]+src="([^"]+)"', row)
            title = re.search(r"<h3[^>]*>(.*?)</h3>", row, re.S)
            if not img or not title:
                continue
            desc = re.search(r"<h5[^>]*>(.*?)</h5>", row, re.S)
            url = html_lib.unescape(img.group(1)).strip()
            if not url.startswith("http"):
                continue
            key = self._norm_text(re.sub(r"<[^>]+>", "", title.group(1)))
            if not key:
                continue
            desc_norm = self._norm_text(re.sub(r"<[^>]+>", "", desc.group(1))) if desc else ""
            result.setdefault(key, []).append((url, desc_norm))
        return result

    def _fetch_community_page(self, appid: int) -> str:
        env = os.environ.copy()
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        result = subprocess.run(
            ["curl", "--fail", "--silent", "--show-error", "--location", "--max-time", "4",
             "--user-agent", "FinallyAchievementPlugin/1.0", STEAM_COMMUNITY_STATS_URL.format(appid=appid, lang=self._steam_l_param())],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f"curl failed ({result.returncode}): {(result.stderr or '').strip()}")
        return result.stdout

    async def _community_icon_url(self, appid: int, title: str, description: str) -> Optional[str]:
        """Colored icon URL from the keyless public achievements page,
        matched by title (English page; a non-English title just won't match).
        Ambiguous titles are disambiguated by description, else skipped."""
        table = self._community_icon_cache.get(appid)
        if not table:
            try:
                page = await asyncio.to_thread(self._fetch_community_page, appid)
                table = self._parse_community_achievements(page)
            except Exception as err:
                decky.logger.warning("Community achievements page fetch failed for %s: %s", appid, err)
                return None
            if table:  # only cache non-empty, same lesson as the schema cache
                self._community_icon_cache[appid] = table
        entries = table.get(self._norm_text(title)) if table else None
        if not entries:
            return None
        if len(entries) == 1:
            return entries[0][0]
        want = self._norm_text(description)
        for url, desc in entries:
            if desc and desc == want:
                return url
        return None

    async def _ensure_colored_icon(
        self,
        appid: int,
        achievement_id: str,
        title: str,
        description: str,
        icon_path: str,
        icon_url: Optional[str],
    ) -> Tuple[str, Optional[str]]:
        """Returns (icon_path, icon_url), replacing a gray icon with a colored
        one when one can be found; otherwise returns the input unchanged."""
        diag = self._last_icon_resolution
        verdict = await self._icon_color_verdict(icon_path)
        diag["color_check"] = verdict
        was_authoritative = str(diag.get("result", "")).startswith("authoritative")
        if verdict == "color":
            return icon_path, icon_url
        if verdict == "unknown" and was_authoritative:
            return icon_path, icon_url          # Steam's own "icon" for this achievement: trust it
        # Gray (confirmed), or an icon from the local cache that couldn't be
        # checked ("unknown"): don't risk showing the locked one -- look for
        # a colored variant. A colored icon is only swapped in if it checks
        # out too.
        decky.logger.info("Icon for %s/%s is %s; looking for colored variant", appid, achievement_id, verdict)
        current_resolved = self._resolve_icon_url(appid, icon_url)

        if was_authoritative:
            # Some games have the schema's "icon"/"icongray" swapped or both
            # gray; if "icongray" is the colored one, use it.
            grays = self._steam_api_schema_icongray_cache.get(appid) or {}
            alt = grays.get(achievement_id)
            if not alt:
                low = achievement_id.lower()
                alt = next((u for n, u in grays.items() if n.lower() == low), None)
            if alt and alt != current_resolved:
                path = await asyncio.to_thread(self._cache_icon, appid, achievement_id, alt)
                if path and await self._icon_color_verdict(path) == "color":
                    diag["result"] = "authoritative_icon_gray_swapped_to_icongray"
                    return path, alt

        url = await self._community_icon_url(appid, title, description)
        if url and url != current_resolved:
            path = await asyncio.to_thread(self._cache_icon, appid, achievement_id, url)
            if path and await self._icon_color_verdict(path) != "gray":
                diag["result"] = "gray_replaced_by_community_page"
                return path, url

        # Steam rewrites its cache a moment after an unlock; wait longer when
        # we KNOW the icon is the locked one.
        for delay in ((0.3, 0.6, 1.0, 1.5) if verdict == "gray" else (0.3, 0.6)):
            await asyncio.sleep(delay)
            fresh = await asyncio.to_thread(self._achievement_icon_from_cache, appid, achievement_id)
            fresh_resolved = self._resolve_icon_url(appid, fresh)
            if not fresh_resolved or fresh_resolved == current_resolved:
                continue
            path = await asyncio.to_thread(self._cache_icon, appid, achievement_id, fresh)
            if path and await self._icon_color_verdict(path) != "gray":
                diag["result"] = "gray_replaced_by_cache_refresh"
                return path, fresh

        if was_authoritative:
            diag["result"] = "authoritative_gray_no_alternative"
        elif verdict == "gray":
            diag["result"] = "gray_no_colored_variant_found"
        else:
            diag["result"] = "unverified_icon_kept"      # couldn't check it and found nothing better
        return icon_path, icon_url

    async def get_last_icon_resolution(self) -> Dict[str, Any]:
        """Diagnostic for the settings panel / support requests: how the
        most recent achievement's icon was actually resolved. If the
        colored icon still isn't showing up despite a Web API key being
        configured, this says exactly why -- e.g. "schema_empty" (the API
        call itself came back empty/unusable) vs "achievement_not_in_schema"
        (the API worked fine, but this particular achievement id wasn't in
        it) vs "authoritative_exact_match" (worked as intended; if the
        icon still looks wrong here, the issue is downstream -- the
        download/cache step or the icon file itself -- not this lookup)."""
        return getattr(self, "_last_icon_resolution", {"result": "no_achievement_processed_yet"})

    async def _process_steam_api_appid(
        self, key: str, steamid64: int, appid: int
    ) -> None:
        payload = await self._steam_api_json(
            "/ISteamUserStats/GetPlayerAchievements/v1/",
            {
                "key": key,
                "steamid": steamid64,
                "appid": appid,
                "l": self._steam_l_param(),
                "format": "json",
            },
        )

        stats = payload.get("playerstats", {})
        achievements = stats.get("achievements", [])
        if not isinstance(achievements, list):
            self._steam_api_status = f"appid={appid}: no achievements"
            return

        achieved_items: List[Dict[str, Any]] = []
        for item in achievements:
            if not isinstance(item, dict):
                continue
            if item.get("achieved") not in (1, True, "1"):
                continue
            ach_id = item.get("apiname")
            if isinstance(ach_id, str) and ach_id:
                achieved_items.append(item)

        unlocked = {
            str(item["apiname"])
            for item in achieved_items
            if isinstance(item.get("apiname"), str) and item.get("apiname")
        }
        previous = self._steam_api_known_unlocked.get(appid)
        self._steam_api_known_unlocked[appid] = unlocked

        if previous is None:
            self._steam_api_status = f"appid={appid}: baseline_loaded"
            return

        newly_unlocked = unlocked - previous
        if not newly_unlocked:
            self._steam_api_status = f"appid={appid}: no_new_unlocks"
            return

        candidates = [
            item
            for item in achieved_items
            if isinstance(item.get("apiname"), str)
            and item.get("apiname") in newly_unlocked
        ]
        candidates.sort(
            key=lambda item: int(item.get("unlocktime") or 0),
            reverse=True,
        )
        latest = candidates[0] if candidates else {}
        ach_id = str(latest.get("apiname") or sorted(newly_unlocked)[-1])
        ach_name = str(latest.get("name") or ach_id)
        ach_desc = str(latest.get("description") or "").strip()

        is_rare = False
        percent = None
        try:
            percentages = await self._steam_api_global_percentages(appid)
            percent = percentages.get(ach_id)
            is_rare = percent is not None and percent <= RARE_PERCENT_THRESHOLD
        except Exception as err:
            self._steam_api_last_error = f"rarity lookup failed: {err}"

        title = ach_name
        subtitle = ach_desc
        icon_url = self._achievement_icon_from_cache(appid, ach_id)
        self._steam_api_status = f"appid={appid}: new_unlocks_detected"
        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=f"appid={appid} id={ach_id} name={ach_name}",
            source="steam_web_api",
            dedupe_key=f"achievement:{appid}:{ach_id}",
            appid=appid,
            achievement_id=ach_id,
            icon_url=icon_url,
            percent=percent,
        )

    def _sections_from_cache(self, payload: Any) -> Dict[str, Any]:
        if isinstance(payload, dict):
            return payload

        sections: Dict[str, Any] = {}
        if not isinstance(payload, list):
            return sections

        for entry in payload:
            if (
                not isinstance(entry, list)
                or len(entry) < 2
                or not isinstance(entry[0], str)
            ):
                continue
            data_blob = entry[1]
            if isinstance(data_blob, dict) and "data" in data_blob:
                sections[entry[0]] = data_blob.get("data")
            else:
                sections[entry[0]] = data_blob

        return sections

    def _achievement_lists(self, achievements: Dict[str, Any]) -> List[Tuple[str, List[Any]]]:
        lists: List[Tuple[str, List[Any]]] = []
        for section, values in achievements.items():
            values = achievements.get(section)
            if not isinstance(values, list):
                continue
            if not any(isinstance(item, dict) and "strID" in item for item in values):
                continue
            lists.append((section, values))
        return lists

    def _achieved_items(self, achievements: Dict[str, Any]) -> List[Dict[str, Any]]:
        achieved: List[Dict[str, Any]] = []
        for _section, values in self._achievement_lists(achievements):
            for item in values:
                if not isinstance(item, dict):
                    continue
                if item.get("bAchieved") is not True:
                    continue
                aid = item.get("strID")
                if isinstance(aid, str) and aid:
                    achieved.append(item)
        return achieved

    def _extract_unlocked_ids(self, achievements: Dict[str, Any]) -> Set[str]:
        return {
            str(item["strID"])
            for item in self._achieved_items(achievements)
            if isinstance(item.get("strID"), str) and item.get("strID")
        }

    def _parse_highlight(
        self, appid: int, achievements: Dict[str, Any], newly_unlocked: Set[str]
    ) -> Optional[Tuple[str, str, bool, str, str, Optional[str]]]:
        candidates: List[Dict[str, Any]] = []
        for item in self._achieved_items(achievements):
            aid = item.get("strID")
            if isinstance(aid, str) and aid in newly_unlocked:
                candidates.append(item)

        if not candidates:
            return None

        candidates.sort(
            key=lambda item: int(item.get("rtUnlocked") or 0),
            reverse=True,
        )
        latest = candidates[0]

        ach_id = str(latest.get("strID") or "UNKNOWN")
        ach_name = str(latest.get("strName") or ach_id)
        ach_desc = str(latest.get("strDescription") or "").strip()
        rarity_value = latest.get("flAchieved")
        is_rare = False
        if isinstance(rarity_value, (int, float)):
            is_rare = float(rarity_value) <= RARE_PERCENT_THRESHOLD

        title = ach_name
        subtitle = ach_desc
        hint = f"appid={appid} id={ach_id} name={ach_name}"
        icon_url = latest.get("strImage")
        return (
            title,
            subtitle,
            is_rare,
            hint,
            ach_id,
            icon_url if isinstance(icon_url, str) and icon_url else None,
        )

    def _latest_unlock_time(
        self, achievements: Dict[str, Any], newly_unlocked: Set[str]
    ) -> Optional[int]:
        unlock_times: List[int] = []
        for item in self._achieved_items(achievements):
            aid = item.get("strID")
            if not isinstance(aid, str) or aid not in newly_unlocked:
                continue
            try:
                unlocked_at = int(item.get("rtUnlocked") or 0)
            except (TypeError, ValueError):
                continue
            if unlocked_at > 0:
                unlock_times.append(unlocked_at)
        return max(unlock_times) if unlock_times else None

    def _is_stale_cache_unlock(
        self, achievements: Dict[str, Any], newly_unlocked: Set[str]
    ) -> bool:
        latest_unlock_time = self._latest_unlock_time(achievements, newly_unlocked)
        if latest_unlock_time is None:
            return False
        return latest_unlock_time < self._started_at_epoch - STALE_UNLOCK_GRACE_SECONDS

    async def _prime_librarycache_state(self) -> None:
        for path in self._iter_librarycache_files():
            await self._process_librarycache_file(path, emit=False)
        decky.logger.info(
            "Librarycache baseline loaded: %s files", len(self._cache_mtimes)
        )

    async def _process_librarycache_file(
        self, path: str, emit: bool, source: str = "librarycache"
    ) -> bool:
        basename = os.path.basename(path)
        appid_text, _ = os.path.splitext(basename)
        if not appid_text.isdigit():
            return True

        appid = int(appid_text)
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            return False

        self._last_scanned_appid = appid
        self._last_cache_mtime = mtime

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception as err:
            self._last_parse_error = f"{basename}: json load failed: {err}"
            self._last_cache_status = "json_error"
            return False

        sections = self._sections_from_cache(payload)
        achievements = sections.get("achievements")
        if not isinstance(achievements, dict):
            self._cache_mtimes[path] = mtime
            self._last_parse_error = f"{basename}: achievements section missing"
            self._last_cache_status = "no_achievements_section"
            return True

        self._cache_mtimes[path] = mtime
        self._last_parse_error = None
        unlocked = self._extract_unlocked_ids(achievements)
        previous = self._known_unlocked.get(appid)
        self._known_unlocked[appid] = unlocked

        if previous is None or not emit:
            self._last_cache_status = "baseline_loaded"
            return True

        newly_unlocked = unlocked - previous
        if not newly_unlocked:
            self._last_new_unlock_ids = []
            self._last_cache_status = "no_new_unlocks"
            return True

        self._last_new_unlock_ids = sorted(newly_unlocked)
        if self._is_stale_cache_unlock(achievements, newly_unlocked):
            self._last_cache_status = "stale_unlock_suppressed"
            return True

        self._last_cache_status = "new_unlocks_detected"
        parsed = self._parse_highlight(appid, achievements, newly_unlocked)
        if parsed is None:
            title = "Achievement Unlocked"
            subtitle = f"App {appid} unlocked {len(newly_unlocked)} achievement(s)"
            is_rare = False
            hint = f"appid={appid} unlocked={','.join(sorted(newly_unlocked))}"
            dedupe_id = ",".join(sorted(newly_unlocked))
            icon_url = None
        else:
            title, subtitle, is_rare, hint, dedupe_id, icon_url = parsed

        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=hint,
            source=source,
            dedupe_key=f"achievement:{appid}:{dedupe_id}",
            appid=appid,
            achievement_id=dedupe_id,
            icon_url=icon_url,
        )
        return True

    async def _process_librarycache_file_with_retries(
        self, path: str, source: str
    ) -> None:
        for attempt in range(3):
            ok = await self._process_librarycache_file(path, emit=True, source=source)
            if ok:
                self._last_parse_retry_error = None
                return

            self._last_parse_retry_error = (
                f"{os.path.basename(path)} parse retry {attempt + 1}/3"
            )
            await asyncio.sleep(INOTIFY_DEBOUNCE_SECONDS * (attempt + 1))

        self._last_parse_retry_error = f"{os.path.basename(path)} parse failed after retry"

    async def _scan_librarycache_changes(self, source: str) -> None:
        self._fallback_scan_count += 1
        paths = self._iter_librarycache_files()
        known = set(paths)

        for stale in list(self._cache_mtimes.keys()):
            if stale not in known:
                self._cache_mtimes.pop(stale, None)

        for path in paths:
            try:
                mtime = os.path.getmtime(path)
            except OSError:
                continue

            previous = self._cache_mtimes.get(path)
            if previous is not None and mtime <= previous:
                continue
            await self._process_librarycache_file(path, emit=True, source=source)

    async def _watch_librarycache_poll(self) -> None:
        self._watcher_mode = "poll_fallback"
        while not self._stop_event.is_set():
            try:
                self._librarycache_running = True
                await self._scan_librarycache_changes(source="poll_fallback")
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._librarycache_running = False
                decky.logger.error("Librarycache watcher error: %s", err)

            await asyncio.sleep(CACHE_SCAN_INTERVAL_SECONDS)

        self._librarycache_running = False

    async def _watch_librarycache_inotify(self) -> None:
        self._inotify_queue = asyncio.Queue()
        self._open_inotify()
        self._watcher_mode = "inotify"
        self._librarycache_running = True
        pending: Dict[str, Dict[str, Any]] = {}
        next_reconciliation = time.monotonic() + RECONCILIATION_SCAN_INTERVAL_SECONDS
        decky.logger.info("Librarycache inotify watcher started")

        try:
            while not self._stop_event.is_set():
                now = time.monotonic()
                due_times = [event["due_time"] for event in pending.values()]
                next_due = min(due_times) if due_times else None
                next_tick = min(
                    value
                    for value in [next_due, next_reconciliation]
                    if value is not None
                )
                timeout = max(0.0, next_tick - now)

                try:
                    event = await asyncio.wait_for(
                        self._inotify_queue.get(), timeout=timeout
                    )
                    event_kind = event.get("kind")
                    if event_kind == "inotify_error":
                        raise RuntimeError(str(event.get("error")))

                    mask = int(event.get("mask") or 0)
                    if mask & IN_Q_OVERFLOW:
                        await self._scan_librarycache_changes(source="inotify_overflow")
                        continue

                    if event_kind == "steam_log_dir" and os.path.basename(
                        str(event.get("path") or "")
                    ) == os.path.basename(STEAM_LOG_PATH):
                        await self._read_new_stats_log_lines()
                        continue

                    if event_kind == "appcache_stats_dir":
                        # Steam rewrites UserGameStats_<account>_<appid>.bin the moment the game stores an unlock:
                        # read it now instead of waiting for the library cache, which can lag by many seconds.
                        stats_path = str(event.get("path") or "")
                        stats_match = self._stats_bin_pattern.match(os.path.basename(stats_path))
                        if stats_match and mask & (IN_CLOSE_WRITE | IN_MOVED_TO):
                            self._schedule_stats_bin(
                                stats_path, int(stats_match.group("appid")), "stats_bin_inotify"
                            )

                    cache_event = self._event_to_cache_path(event)
                    if cache_event is None:
                        continue

                    path, source, appid = cache_event
                    event_time = float(event.get("event_time") or time.monotonic())
                    pending[path] = {
                        "path": path,
                        "source": source,
                        "appid": appid,
                        "event_time": event_time,
                        "due_time": time.monotonic() + INOTIFY_DEBOUNCE_SECONDS,
                    }
                except asyncio.TimeoutError:
                    pass

                now = time.monotonic()
                if now >= next_reconciliation:
                    await self._scan_librarycache_changes(source="librarycache_reconcile")
                    next_reconciliation = now + RECONCILIATION_SCAN_INTERVAL_SECONDS

                due_paths = [
                    path
                    for path, event in pending.items()
                    if event["due_time"] <= now
                ]
                for path in due_paths:
                    event = pending.pop(path)
                    self._processed_inotify_events += 1
                    self._last_inotify_event_path = path
                    self._last_inotify_event_appid = int(event["appid"])
                    self._last_queue_latency_ms = round(
                        (time.monotonic() - float(event["event_time"])) * 1000.0,
                        1,
                    )
                    decky.logger.info(
                        "Inotify event processed via %s appid=%s latency_ms=%s path=%s",
                        event["source"],
                        event["appid"],
                        self._last_queue_latency_ms,
                        path,
                    )
                    await self._process_librarycache_file_with_retries(
                        path, source=str(event["source"])
                    )
        finally:
            self._librarycache_running = False
            self._close_inotify()

    async def _watch_librarycache(self) -> None:
        try:
            await self._watch_librarycache_inotify()
        except asyncio.CancelledError:
            raise
        except Exception as err:
            self._watcher_mode = "poll_fallback"
            self._librarycache_running = False
            decky.logger.error("Inotify watcher unavailable, falling back to polling: %s", err)
            await self._watch_librarycache_poll()

    async def _watch_steam_api(self) -> None:
        while not self._stop_event.is_set():
            key = self._steam_api_key()
            steamid64 = self._steamid64_from_userdata()

            if not key:
                self._steam_api_enabled = False
                self._steam_api_running = False
                self._steam_api_status = "disabled_no_api_key"
                await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)
                continue

            if steamid64 is None:
                self._steam_api_enabled = True
                self._steam_api_running = False
                self._steam_api_status = "disabled_no_steamid"
                await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)
                continue

            try:
                self._steam_api_enabled = True
                self._steam_api_running = True
                appids = await self._steam_api_recent_appids(key, steamid64)
                self._steam_api_last_appids = appids

                if not appids:
                    self._steam_api_status = "no_recent_games"
                for appid in appids:
                    await self._process_steam_api_appid(key, steamid64, appid)

                self._steam_api_last_error = None
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._steam_api_running = False
                self._steam_api_last_error = str(err)
                self._steam_api_status = "error"
                decky.logger.warning("Steam Web API watcher error: %s", err)

            await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)

        self._steam_api_running = False
