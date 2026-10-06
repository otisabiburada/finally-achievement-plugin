#!/usr/bin/env python3
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


def is_activated(lib: ctypes.CDLL, stats: int, achievement_id: str) -> bool:
    achieved = ctypes.c_bool(False)
    ok = lib.SteamAPI_ISteamUserStats_GetAchievement(
        stats,
        achievement_id.encode("utf-8"),
        ctypes.byref(achieved),
    )
    return bool(ok and achieved.value)


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


def snapshot(lib: ctypes.CDLL, stats: int, names: List[str]) -> Dict[str, bool]:
    return {name: is_activated(lib, stats, name) for name in names}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--appid", type=int, required=True)
    parser.add_argument("--poll-ms", type=int, default=100)
    parser.add_argument("--baseline-ms", type=int, default=2500)
    parser.add_argument("--lib", default="/home/deck/.local/share/Steam/steamrt64/libsteam_api.so")
    args = parser.parse_args()

    os.environ["SteamAppId"] = str(args.appid)
    os.environ["SteamGameId"] = str(args.appid)

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

        names = get_achievement_names(lib, stats)

        interval = max(0.05, args.poll_ms / 1000.0)
        baseline_deadline = time.monotonic() + max(0.0, args.baseline_ms / 1000.0)
        previous = snapshot(lib, stats, names)
        while time.monotonic() < baseline_deadline:
            lib.SteamAPI_RunCallbacks()
            current = snapshot(lib, stats, names)
            if current:
                previous = current
            time.sleep(interval)

        emit({
            "type": "ready", "appid": args.appid, "count": len(names),
            "unlocked": sum(1 for v in previous.values() if v),
        })

        while True:
            lib.SteamAPI_RunCallbacks()
            current = snapshot(lib, stats, names)
            # Running count of unlocked achievements, advanced one unlock at
            # a time, so that when several land in the same poll only the
            # LAST one reports unlocked == total (the game-complete signal).
            unlocked_so_far = sum(1 for k, v in previous.items() if v)
            for achievement_id, achieved in current.items():
                if achieved and not previous.get(achievement_id, False):
                    unlocked_so_far += 1
                    emit(
                        {
                            "type": "unlock",
                            "appid": args.appid,
                            "id": achievement_id,
                            "name": display_attr(lib, stats, achievement_id, "name") or achievement_id,
                            "desc": display_attr(lib, stats, achievement_id, "desc"),
                            "hidden": display_attr(lib, stats, achievement_id, "hidden") == "1",
                            "percent": achieved_percent(lib, stats, achievement_id),
                            "unlocked": unlocked_so_far,
                            "total": len(names),
                        }
                    )
            previous = current
            time.sleep(interval)
    except KeyboardInterrupt:
        return 0
    except Exception as err:
        emit({"type": "error", "appid": args.appid, "error": str(err)})
        return 1
    finally:
        try:
            lib.SteamAPI_Shutdown()  # type: ignore[name-defined]
        except Exception:
            pass


if __name__ == "__main__":
    sys.exit(main())
