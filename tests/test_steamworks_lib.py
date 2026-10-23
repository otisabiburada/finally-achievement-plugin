"""Offline test of finding Steam's achievement library and of the achievement list without it:
    python3 -I tests/test_steamworks_lib.py
Builds a fake Steam install for a user who is not "deck" (no Steam needed) and checks that:
- the Steam folder is found from the Decky user home (not /home/deck);
- libsteam_api.so is found inside an installed native game, 32-bit and too-old copies are skipped, the newest wins,
  and a copy put in the plugin's settings folder overrides all of them;
- with no usable library at all, the achievement browser still lists every achievement (unlocked ones first) from
  Steam's local schema and stats files, and the tracker still knows when the pinned achievement is unlocked."""
import asyncio, logging, os, struct, sys, tempfile, time, types

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
tmp = tempfile.mkdtemp(prefix="fa-swlib-")
home = os.path.join(tmp, "home", "gamer")
steam = os.path.join(home, ".local", "share", "Steam")
stats = os.path.join(steam, "appcache", "stats")
os.makedirs(stats)
os.makedirs(os.path.join(steam, "userdata", "123", "config", "librarycache"))

fake = types.ModuleType("decky")
fake.DECKY_HOME = os.path.join(tmp, "homebrew")
fake.DECKY_PLUGIN_SETTINGS_DIR = os.path.join(tmp, "settings")
fake.DECKY_PLUGIN_RUNTIME_DIR = os.path.join(tmp, "runtime")
fake.DECKY_PLUGIN_DIR = ROOT
fake.DECKY_USER_HOME = home
fake.logger = logging.getLogger("t")
async def _emit(*a, **k): pass
fake.emit = _emit
sys.modules["decky"] = fake
sys.path.insert(0, ROOT)
import main  # noqa: E402

bad = 0
def check(c, m):
    global bad
    if not c:
        bad += 1
        print("FAIL:", m)


def fake_lib(path, version="v013", bits64=True, machine=62, flat=True):
    """Not loadable, but has what lib_info looks at: the ELF header and the exported names."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    head = bytearray(64)
    head[:4] = b"\x7fELF"
    head[4] = 2 if bits64 else 1
    head[18:20] = struct.pack("<H", machine)
    body = b"\0SteamAPI_SteamUserStats_" + version.encode() + b"\0SteamAPI_ISteamUserStats_GetAchievement\0"
    if flat:
        body += b"SteamAPI_InitFlat\0"
    open(path, "wb").write(bytes(head) + body)


def enc(node):
    out = bytearray()
    for key, value in node.items():
        k = str(key).encode() + b"\0"
        if isinstance(value, dict):
            out += b"\x00" + k + enc(value)
        elif isinstance(value, str):
            out += b"\x01" + k + value.encode() + b"\0"
        else:
            out += b"\x02" + k + struct.pack("<i", value)
    return bytes(out) + b"\x08"


def ach(name, en, desc, hidden=0):
    return {"name": name, "display": {"name": {"english": en}, "desc": {"english": desc}, "hidden": hidden}}


SCHEMA = {"440": {"gamename": "Test", "stats": {"266": {"type": "ACHIEVEMENTS", "bits": {
    "0": ach("ACH_A", "Alpha", "Do A."),
    "1": ach("ACH_B", "Bravo", "Do B.", hidden=1),
    "2": ach("ACH_C", "Charlie", "Do C."),
}}}}}


async def run():
    check(main.USER_HOME == home, f"user home from Decky ({main.USER_HOME})")
    check(main.STEAM_ROOT == os.path.realpath(steam), f"Steam root under that home ({main.STEAM_ROOT})")
    check(main.STEAM_LOG_PATH.startswith(os.path.realpath(steam)), "Steam log under that Steam root")
    check(main.STEAM_APPCACHE_STATS_DIR == os.path.join(os.path.realpath(steam), "appcache", "stats"), "stats folder")

    pl = main.Plugin()
    common = os.path.join(steam, "steamapps", "common")

    # nothing anywhere yet
    check(await pl._ensure_steamworks_lib() == "", "no library: empty path")

    old = os.path.join(common, "OldGame", "libsteam_api.so")
    new = os.path.join(common, "UnityGame", "UnityGame_Data", "Plugins", "x86_64", "libsteam_api.so")
    fake_lib(old, version="v011", flat=False)
    fake_lib(new, version="v013")
    fake_lib(os.path.join(common, "Game32", "libsteam_api.so"), bits64=False)
    fake_lib(os.path.join(common, "ArmGame", "libsteam_api.so"), machine=183)
    pl._swlib_searched_at = -1e9                     # pretend the last search is old: search again
    found = await pl._ensure_steamworks_lib()
    check(found == os.path.realpath(new), f"newest game copy wins ({found})")
    check(os.path.isfile(pl._steamworks_cache_file()), "result remembered")

    # a fresh plugin (reload) takes the remembered path without searching
    pl2 = main.Plugin()
    check(pl2._steamworks_lib_path() == os.path.realpath(new), "remembered path used after reload")

    # manual override in the settings folder beats game copies
    override = os.path.join(main.FINALLY_SETTINGS_DIR, "libsteam_api.so")
    fake_lib(override, version="v012")
    pl3 = main.Plugin()
    check(pl3._steamworks_lib_path() == os.path.realpath(override), "settings-folder copy overrides")
    os.remove(override)

    # Steam's own folder beats game copies
    own = os.path.join(steam, "steamrt64", "libsteam_api.so")
    fake_lib(own, version="v012")
    pl4 = main.Plugin()
    check(pl4._steamworks_lib_path() == os.path.realpath(own), "Steam's own copy preferred")

    # --- no usable library (these fakes can't be loaded): list and tracker from local files ---
    now = int(time.time())
    open(os.path.join(stats, "UserGameStatsSchema_440.bin"), "wb").write(enc(SCHEMA))
    open(os.path.join(stats, "UserGameStats_123_440.bin"), "wb").write(
        enc({"cache": {"266": {"data": 0, "AchievementTimes": {"2": now - 60}}}}))

    async def percentages(appid):
        return {"ACH_A": 50.0, "ACH_B": 5.0, "ACH_C": 80.0}
    pl4._steam_api_global_percentages = percentages
    pl4._steam_language_name = lambda: "english"
    result = await pl4.get_achievements(440)
    check(result.get("ok"), f"list ok without Steamworks ({result.get('error')})")
    check(result.get("total") == 3 and result.get("unlocked_count") == 1, f"counts ({result.get('total')}, {result.get('unlocked_count')})")
    items = result.get("achievements") or []
    check([a["id"] for a in items] == ["ACH_C", "ACH_B", "ACH_A"], f"unlocked first, then rarest ({[a['id'] for a in items]})")
    check(items and items[0]["name"] == "Charlie" and items[0]["achieved"], "unlocked entry has its name")
    check(len(items) > 1 and items[1]["name"] == "Hidden achievement" and items[1]["description"] == "", "secret stays secret")
    check(len(items) > 2 and items[2]["global_percent"] == 50.0, "global percent filled in")

    check((pl4._local_tracker_state(440, "ACH_C") or {}).get("achieved") is True, "tracker: unlocked")
    check((pl4._local_tracker_state(440, "ach_a") or {}).get("achieved") is False, "tracker: locked")


asyncio.run(run())
print("steamworks lib test ok" if not bad else f"{bad} failure(s)")
sys.exit(1 if bad else 0)
