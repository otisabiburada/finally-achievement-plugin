"""Offline test of how fast an unlock reaches the screen:  python3 -I tests/test_popup_latency.py
Simulates slow network lookups (icon check, unlock percentage, description) and checks the popup is still handed to
the overlay within the preparation budget, and that a changed UserGameStats file is read at once and only once."""
import asyncio, logging, os, sys, tempfile, time, types

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
tmp = tempfile.mkdtemp(prefix="fa-latency-")

fake = types.ModuleType("decky")
fake.DECKY_PLUGIN_SETTINGS_DIR = os.path.join(tmp, "settings")
fake.DECKY_PLUGIN_RUNTIME_DIR = os.path.join(tmp, "runtime")
fake.DECKY_PLUGIN_DIR = ROOT
fake.DECKY_USER_HOME = os.path.join(tmp, "home")
fake.logger = logging.getLogger("t")
async def _emit(*a, **k): pass
fake.emit = _emit
sys.modules["decky"] = fake
sys.path.insert(0, ROOT)
import main  # noqa: E402

bad = 0
def check(ok, label):
    global bad
    if not ok:
        bad += 1
        print("FAIL:", label)

async def run():
    pl = main.Plugin()
    pl._record_unlock = lambda payload: None
    shown = []
    async def overlay(payload):
        shown.append((time.monotonic(), payload))
    pl._show_gamescope_overlay = overlay

    icon = os.path.join(tmp, "icon.jpg")
    async def resolve(appid, aid, url):
        return "https://example.invalid/icon.jpg"
    def cache_icon(appid, aid, url):
        time.sleep(0.05)
        return icon
    async def slow_colored_check(appid, aid, title, desc, path, url):
        await asyncio.sleep(8)                    # gray check + community page + retries
        return path, url
    async def slow_percent(appid, aid):
        await asyncio.sleep(5)
        return 3.5
    async def slow_describe(appid, aid):
        await asyncio.sleep(5)
        return "late description"
    pl._resolve_authoritative_icon_url = resolve
    pl._cache_icon = cache_icon
    pl._ensure_colored_icon = slow_colored_check
    pl._lookup_percent = slow_percent
    pl._describe_achievement = slow_describe
    pl._local_achievement_text = lambda appid, aid: ("", "")

    start = time.monotonic()
    await pl._emit_notification(
        title="First Blood", subtitle="", is_rare=False, line_hint="t", source="test",
        dedupe_key="achievement:440:ACH_FIRST", appid=440, achievement_id="ACH_FIRST",
    )
    await asyncio.sleep(0)
    check(len(shown) == 1, "popup handed to the overlay")
    if shown:
        took = shown[0][0] - start
        check(took < main.POPUP_PREP_BUDGET_SECONDS + 0.3, f"popup within budget (took {took:.2f}s)")
        check(shown[0][1]["icon_path"] == icon, "icon found before the slow check is still used")

    # a fast percentage lookup is still shown
    pl._ensure_colored_icon = lambda appid, aid, title, desc, path, url: asyncio.sleep(0, (path, url))
    async def fast_percent(appid, aid):
        return 0.8
    pl._lookup_percent = fast_percent
    await pl._emit_notification(
        title="Second", subtitle="desc", is_rare=False, line_hint="t", source="test",
        dedupe_key="achievement:440:ACH_TWO", appid=440, achievement_id="ACH_TWO",
    )
    await asyncio.sleep(0)
    check(len(shown) == 2 and shown[1][1]["percent"] == 0.8, "fast percentage included")

    # a changed stats file is read at once, and a burst of events reads it at most twice
    reads = []
    async def process(path, appid, source="stats_bin"):
        reads.append((time.monotonic(), source))
        await asyncio.sleep(0.1)
    pl._process_stats_bin = process
    path = os.path.join(tmp, "UserGameStats_1_440.bin")
    open(path, "wb").write(b"x")
    t0 = time.monotonic()
    pl._schedule_stats_bin(path, 440, "stats_bin_inotify")
    await asyncio.sleep(0.01)
    check(len(reads) == 1 and reads[0][0] - t0 < 0.05, "stats file read immediately")
    for _ in range(4):                            # more writes while the first read is still running
        pl._schedule_stats_bin(path, 440, "stats_bin_inotify")
    await asyncio.sleep(0.3)
    check(len(reads) == 2, f"burst of changes coalesced into one re-read (got {len(reads)})")

    await color_checks()
    display_retries()

async def color_checks():
    # the real script answers one line per path in --serve mode (here it can't load images, so "unknown")
    proc = await asyncio.create_subprocess_exec(
        sys.executable, "-c", main.ICON_COLOR_CHECK_SCRIPT, "--serve", tmp,
        stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
    out, _ = await proc.communicate(b"/nope/a.jpg\n/nope/b.jpg\n")
    check(out.decode().splitlines() == ["unknown", "unknown"], f"script serve mode answers per line (got {out!r})")

    # a stand-in helper with the same protocol, counting how often it is started
    starts = os.path.join(tmp, "starts")
    main.STEAMWORKS_PYTHON = sys.executable
    main.ICON_COLOR_CHECK_SCRIPT = (
        "import sys\n"
        f"open({starts!r}, 'a').write('x')\n"
        "for line in sys.stdin:\n"
        "    print('50.00 200' if 'color' in line else '1.00 5', flush=True)\n"
    )
    main.FINALLY_ICON_VERDICTS_FILE = os.path.join(tmp, "verdicts.json")
    paths = []
    for name in ("color1.jpg", "color2.jpg", "gray1.jpg"):
        paths.append(os.path.join(tmp, name))
        open(paths[-1], "wb").write(b"img")
    pl = main.Plugin()
    got = [await pl._icon_color_verdict(p) for p in paths]
    check(got == ["color", "color", "gray"], f"verdicts from the helper (got {got})")
    check(open(starts).read() == "x", "one helper process for every check")
    calls = []
    real = pl._color_worker_check
    async def counting(path):
        calls.append(path)
        return await real(path)
    pl._color_worker_check = counting
    check(await pl._icon_color_verdict(paths[0]) == "color" and not calls, "second check of a file is remembered")
    pl._stop_color_worker()

    pl2 = main.Plugin()
    pl2._color_worker_check = counting
    check(await pl2._icon_color_verdict(paths[2]) == "gray" and not calls, "answers survive a plugin restart")
    open(paths[2], "wb").write(b"changed icon")
    await pl2._icon_color_verdict(paths[2])
    check(calls == [paths[2]], "a changed file is checked again")
    pl2._stop_color_worker()

def display_retries():
    pl = main.Plugin()
    pl._x_display_candidates = lambda: [":0", ":1", ":2"]
    pl._xauthority_candidates = lambda: []
    check(pl._overlay_attempts() == [(":0", None), (":1", None), (":2", None)], "all setups tried at first")
    pl._overlay_failed[(":0", None)] = time.monotonic()
    check(pl._overlay_attempts() == [(":1", None), (":2", None)], "a failed setup is skipped")
    pl._overlay_failed[(":1", None)] = time.monotonic() + 1
    pl._overlay_failed[(":2", None)] = time.monotonic() + 2
    check(pl._overlay_attempts() == [(":0", None)], "all failed: only the oldest failure is retried")
    pl._overlay_failed[(":1", None)] = time.monotonic() - main.OVERLAY_FAILED_RETRY_SECONDS - 1
    check(pl._overlay_attempts() == [(":1", None)], "a setup is tried again after the wait")

asyncio.run(run())
print("latency test ok" if not bad else f"{bad} FAILED")
sys.exit(1 if bad else 0)
