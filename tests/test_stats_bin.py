"""Offline test of the local-stats unlock detection and the description lookup:  python3 -I tests/test_stats_bin.py
Builds small Steam-style binary files in a temp folder (no Steam needed) and checks that an unlock is noticed from
UserGameStats_<account>_<appid>.bin, that its name and description come out in Steam's language (secret ones too),
and that nothing is announced twice."""
import asyncio, logging, os, struct, sys, tempfile, time, types

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
tmp = tempfile.mkdtemp(prefix="fa-test-")
home = os.path.join(tmp, "home")
steam = os.path.join(home, ".local", "share", "Steam")
stats = os.path.join(steam, "appcache", "stats")
os.makedirs(stats)

fake = types.ModuleType("decky")
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

def ach(name, en, pl, desc_en, desc_pl, hidden=0):
    return {"name": name, "display": {"name": {"token": name + "_N", "english": en, "polish": pl},
                                      "desc": {"token": name + "_D", "english": desc_en, "polish": desc_pl}, "hidden": hidden}}

SCHEMA = {"440": {"gamename": "Test", "version": 1, "stats": {"266": {"type": "ACHIEVEMENTS", "bits": {
    "3": ach("ACH_FIRST", "First Blood", "Pierwsza krew", "Win once.", "Wygraj raz."),
    "4": ach("ACH_SECRET", "Hidden Gem", "Ukryty klejnot", "Find the gem behind the waterfall.", "Znajdz klejnot za wodospadem.", 1),
    "5": ach("ACH_THIRD", "Third", "Trzeci", "Do it three times.", "Zrob to trzy razy."),
}}}}}
def stats_file(times):
    return enc({"cache": {"crc": 1, "PendingChanges": 0, "266": {"data": 0, "AchievementTimes": times}}})

bad = 0
def check(c, m):
    global bad
    if not c:
        bad += 1
        print("FAIL:", m)

async def run():
    now = int(time.time())
    open(os.path.join(stats, "UserGameStatsSchema_440.bin"), "wb").write(enc(SCHEMA))
    path = os.path.join(stats, "UserGameStats_123_440.bin")
    open(path, "wb").write(stats_file({"3": now - 86400 * 30}))

    pl = main.Plugin()
    sent = []
    async def emit(**kw):
        sent.append(kw)
    pl._emit_notification = emit

    # names and descriptions come from the local schema, secret ones included
    check(pl._local_achievement_text(440, "ACH_SECRET") == ("Hidden Gem", "Find the gem behind the waterfall."), "secret achievement text (English)")
    pl._steam_language_name = lambda: "polish"
    check(pl._local_achievement_text(440, "ACH_SECRET") == ("Ukryty klejnot", "Znajdz klejnot za wodospadem."), "secret achievement text (Polish)")
    pl._steam_language_name = lambda: "german"
    check(pl._local_achievement_text(440, "ACH_FIRST") == ("First Blood", "Win once."), "missing language falls back to English")
    check(pl._local_achievement_text(440, "NOPE") == ("", ""), "unknown achievement")
    check(pl._local_achievement_text(440, "ach_third")[0] == "Third", "id match ignores case")
    pl._steam_language_name = lambda: "polish"

    # the stats file: an old unlock is not announced the first time the file is seen
    check(pl._stats_bin_unlocks(440, path) == {"ACH_FIRST": now - 86400 * 30}, "unlock times read from the stats file")
    await pl._process_stats_bin(path, 440)
    check(sent == [], "an old unlock is not announced")
    # a new unlock appears
    open(path, "wb").write(stats_file({"3": now - 86400 * 30, "4": now}))
    await pl._process_stats_bin(path, 440)
    check(len(sent) == 1 and sent[0]["achievement_id"] == "ACH_SECRET", "the new unlock is announced")
    check(sent and sent[0]["title"] == "Ukryty klejnot" and sent[0]["subtitle"] == "Znajdz klejnot za wodospadem.", "title and description in Steam's language, secret one included")
    check(sent and sent[0]["source"] == "stats_bin" and sent[0]["dedupe_key"] == "achievement:440:ACH_SECRET", "source and dedupe key")
    # the same file again: nothing new
    await pl._process_stats_bin(path, 440)
    check(len(sent) == 1, "not announced twice")
    # two at once, oldest first
    open(path, "wb").write(stats_file({"3": now - 86400 * 30, "4": now, "5": now + 2}))
    await pl._process_stats_bin(path, 440)
    check(len(sent) == 2 and sent[1]["achievement_id"] == "ACH_THIRD", "next unlock announced")

    # a file seen for the first time with a fresh unlock still counts (the plugin started just before it)
    path2 = os.path.join(stats, "UserGameStats_123_441.bin")
    open(os.path.join(stats, "UserGameStatsSchema_441.bin"), "wb").write(enc({"441": SCHEMA["440"]}))
    open(path2, "wb").write(stats_file({"3": now - 5}))
    await pl._process_stats_bin(path2, 441)
    check(len(sent) == 3 and sent[2]["achievement_id"] == "ACH_FIRST", "a fresh unlock in a new file is announced")

    # an unreadable (half-written) file is retried, then reported, never a crash
    path3 = os.path.join(stats, "UserGameStats_123_442.bin")
    open(path3, "wb").write(b"\x00cache\x00\x02crc")
    await pl._process_stats_bin(path3, 442)
    check(pl._stats_bin_status.endswith("unreadable"), "half-written file is reported, not a crash")

    # the watcher: detects a changed file by its modified time
    pl._stop_event = asyncio.Event()
    sent.clear()
    task = asyncio.create_task(pl._watch_stats_bin())
    await asyncio.sleep(0.3)
    open(path, "wb").write(stats_file({"3": now - 86400 * 30, "4": now, "5": now + 2}))
    os.utime(path, None)
    open(path2, "wb").write(stats_file({"3": now - 5, "4": now - 1}))
    await asyncio.sleep(main.STATS_BIN_SCAN_INTERVAL_SECONDS * 2.5)
    pl._stop_event.set()
    task.cancel()
    check(any(k["achievement_id"] == "ACH_SECRET" and k["appid"] == 441 for k in sent), "the watcher announces an unlock from a changed file (got %s)" % [k["achievement_id"] for k in sent])

    # descriptions: when a path sends none, the local schema fills it in (no helper, no waiting)
    text = await pl._describe_achievement(440, "ACH_SECRET")
    check(text == "Znajdz klejnot za wodospadem.", "describe falls back to the local schema")

asyncio.run(run())
print("stats test ok" if not bad else f"{bad} FAILED")
sys.exit(1 if bad else 0)
