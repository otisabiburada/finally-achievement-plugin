#!/usr/bin/env python3
"""Short-lived helper that inits the Steamworks API for a given appid,
dumps every achievement (name, description, hidden flag, unlocked state,
unlock time, global rarity percent) as a single JSON line, then exits.

This is a one-shot sibling of the Finally Achievement Plugin toast plugin's steamworks_probe.py,
which instead polls forever and only reports new unlocks. Kept as a
separate script (rather than importing/reusing that one) so this plugin
has no dependency on the other plugin's install being present.
"""
import argparse
import ctypes
import json
import os
import sys
import time
from typing import Dict, List, Optional


def emit(payload: Dict[str, object]) -> None:
    print(json.dumps(payload, separators=(",", ":")), flush=True)


def decode(value: Optional[bytes]) -> str:
    if not value:
        return ""
    return value.decode("utf-8", errors="ignore")


def configure_api(lib: ctypes.CDLL) -> None:
    lib.SteamAPI_InitFlat.argtypes = [ctypes.c_char_p]
    lib.SteamAPI_InitFlat.restype = ctypes.c_char_p
    lib.SteamAPI_RunCallbacks.argtypes = []
    lib.SteamAPI_RunCallbacks.restype = None
    lib.SteamAPI_Shutdown.argtypes = []
    lib.SteamAPI_Shutdown.restype = None

    lib.SteamAPI_SteamUserStats_v013.argtypes = []
    lib.SteamAPI_SteamUserStats_v013.restype = ctypes.c_void_p
    lib.SteamAPI_ISteamUserStats_GetNumAchievements.argtypes = [ctypes.c_void_p]
    lib.SteamAPI_ISteamUserStats_GetNumAchievements.restype = ctypes.c_uint32
    lib.SteamAPI_ISteamUserStats_GetAchievementName.argtypes = [
        ctypes.c_void_p,
        ctypes.c_uint32,
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievementName.restype = ctypes.c_char_p
    lib.SteamAPI_ISteamUserStats_GetAchievement.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_bool),
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievement.restype = ctypes.c_bool
    lib.SteamAPI_ISteamUserStats_GetAchievementAndUnlockTime.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_bool),
        ctypes.POINTER(ctypes.c_uint32),
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievementAndUnlockTime.restype = ctypes.c_bool
    lib.SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute.restype = ctypes.c_char_p
    lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_float),
    ]
    lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent.restype = ctypes.c_bool


def get_achievement_names(lib: ctypes.CDLL, stats: int) -> List[str]:
    count = int(lib.SteamAPI_ISteamUserStats_GetNumAchievements(stats))
    names: List[str] = []
    for index in range(count):
        raw_name = lib.SteamAPI_ISteamUserStats_GetAchievementName(stats, index)
        name = decode(raw_name)
        if name:
            names.append(name)
    return names


def achieved_and_unlock_time(lib: ctypes.CDLL, stats: int, achievement_id: str):
    achieved = ctypes.c_bool(False)
    unlock_time = ctypes.c_uint32(0)
    ok = lib.SteamAPI_ISteamUserStats_GetAchievementAndUnlockTime(
        stats,
        achievement_id.encode("utf-8"),
        ctypes.byref(achieved),
        ctypes.byref(unlock_time),
    )
    if not ok:
        # Fall back to the simpler call, which some older titles support
        # even when the unlock-time variant doesn't return true.
        achieved2 = ctypes.c_bool(False)
        ok2 = lib.SteamAPI_ISteamUserStats_GetAchievement(
            stats, achievement_id.encode("utf-8"), ctypes.byref(achieved2)
        )
        return bool(ok2 and achieved2.value), 0
    return bool(achieved.value), int(unlock_time.value)


def display_attr(lib: ctypes.CDLL, stats: int, achievement_id: str, key: str) -> str:
    return decode(
        lib.SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute(
            stats,
            achievement_id.encode("utf-8"),
            key.encode("utf-8"),
        )
    )


def achieved_percent(lib: ctypes.CDLL, stats: int, achievement_id: str) -> Optional[float]:
    percent = ctypes.c_float(0.0)
    ok = lib.SteamAPI_ISteamUserStats_GetAchievementAchievedPercent(
        stats,
        achievement_id.encode("utf-8"),
        ctypes.byref(percent),
    )
    if not ok:
        return None
    return round(float(percent.value), 2)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--appid", type=int, required=True)
    parser.add_argument("--baseline-ms", type=int, default=1200)
    parser.add_argument("--lib", default="/home/deck/.local/share/Steam/steamrt64/libsteam_api.so")
    args = parser.parse_args()

    os.environ["SteamAppId"] = str(args.appid)
    os.environ["SteamGameId"] = str(args.appid)

    lib = None
    try:
        lib = ctypes.CDLL(args.lib)
        configure_api(lib)

        error = ctypes.create_string_buffer(1024)
        init_error = lib.SteamAPI_InitFlat(error)
        if init_error:
            emit(
                {
                    "type": "error",
                    "appid": args.appid,
                    "error": decode(error.value) or decode(init_error),
                }
            )
            return 2

        stats = lib.SteamAPI_SteamUserStats_v013()
        if not stats:
            emit({"type": "error", "appid": args.appid, "error": "SteamUserStats unavailable"})
            return 3

        # A short settle period lets Steam finish delivering the stats/achievements
        # callback before we start reading -- mirrors steamworks_probe.py's baseline
        # wait, which is what makes that plugin's live unlock detection reliable.
        deadline = time.monotonic() + max(0.0, args.baseline_ms / 1000.0)
        while time.monotonic() < deadline:
            lib.SteamAPI_RunCallbacks()
            time.sleep(0.05)

        names = get_achievement_names(lib, stats)
        if not names:
            emit({"type": "error", "appid": args.appid, "error": "No achievements exposed by this title"})
            return 4

        achievements = []
        for achievement_id in names:
            achieved, unlock_time = achieved_and_unlock_time(lib, stats, achievement_id)
            achievements.append(
                {
                    "id": achievement_id,
                    "name": display_attr(lib, stats, achievement_id, "name") or achievement_id,
                    "desc": display_attr(lib, stats, achievement_id, "desc"),
                    "hidden": display_attr(lib, stats, achievement_id, "hidden") == "1",
                    "achieved": achieved,
                    "unlock_time": unlock_time,
                    "percent": achieved_percent(lib, stats, achievement_id),
                }
            )

        emit({"type": "list", "appid": args.appid, "achievements": achievements})
        return 0
    except Exception as err:
        emit({"type": "error", "appid": args.appid, "error": str(err)})
        return 1
    finally:
        if lib is not None:
            try:
                lib.SteamAPI_Shutdown()
            except Exception:
                pass


if __name__ == "__main__":
    sys.exit(main())
