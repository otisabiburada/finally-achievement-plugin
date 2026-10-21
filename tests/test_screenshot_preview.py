"""Offline test of the unlock screenshot and the panel's template preview:  python3 -I tests/test_screenshot_preview.py
Gamescope and the drawing helper are faked; checks the settings, the saving, and when a screenshot is requested."""
import asyncio, logging, os, stat, struct, sys, tempfile, types, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
tmp = tempfile.mkdtemp(prefix="fa-shot-")

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
os.makedirs(os.path.join(tmp, "home", "Pictures"))
import main  # noqa: E402

bad = 0
def check(ok, label):
    global bad
    if not ok:
        bad += 1
        print("FAIL:", label)

def png_bytes(w=40, h=40):
    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)
    raw = b"".join(b"\x00" + os.urandom(3 * w) for _ in range(h))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))

async def run():
    pl = main.Plugin()
    stored = {}
    pl._load_settings = lambda: dict(stored)
    pl._save_settings = lambda settings: (stored.clear(), stored.update(settings))

    # settings: off by default, kept when on, junk becomes a boolean
    check(pl._sanitize_settings({})["screenshot_on_unlock"] is False, "screenshot off by default")
    on = pl._sanitize_settings({"screenshot_on_unlock": True, "screenshot_include_popup": True, "overlay_template": "ps3_trophy"})
    check(on["screenshot_on_unlock"] and on["screenshot_include_popup"], "screenshot settings kept")
    check(on["overlay_template"] == "ps3_trophy", "PS3 template accepted")

    # the PNG check refuses partial files
    good = os.path.join(tmp, "good.png"); open(good, "wb").write(png_bytes())
    cut = os.path.join(tmp, "cut.png"); open(cut, "wb").write(png_bytes()[:-20])
    check(pl._looks_like_complete_png(good), "complete png accepted")
    check(not pl._looks_like_complete_png(cut), "cut-off png refused")
    check(not pl._looks_like_complete_png(os.path.join(tmp, "none.png")), "missing file refused")

    # take_screenshot_now: request, wait for the file, copy into Pictures
    main.GAMESCOPE_SCREENSHOT_PATH = os.path.join(tmp, "gamescope.png")
    requests = []
    async def request(include_popup):
        requests.append(include_popup)
        open(main.GAMESCOPE_SCREENSHOT_PATH, "wb").write(png_bytes())
        return None
    pl._request_gamescope_screenshot = request
    result = await pl.take_screenshot_now("My Game - First/Win", True)
    check(result.get("ok") and requests == [True], f"screenshot taken ({result})")
    path = result.get("path", "")
    check(os.path.dirname(path).endswith(os.path.join("Pictures", main.SHARE_DIR_NAME, main.SCREENSHOT_DIR_NAME)), "saved under Pictures")
    check("/" not in os.path.basename(path) and os.path.exists(path), "file name is safe")

    # a leftover old picture is not taken for the new one
    async def silent(include_popup): return None
    pl._request_gamescope_screenshot = silent
    main.SCREENSHOT_WAIT_SECONDS = 0.6
    open(main.GAMESCOPE_SCREENSHOT_PATH, "wb").write(png_bytes())
    missing = await pl.take_screenshot_now("x", False)
    check(not missing.get("ok"), "no new file -> failure, not a stale picture")

    # request error is passed on
    async def failing(include_popup): return "Cannot open display"
    pl._request_gamescope_screenshot = failing
    failed = await pl.take_screenshot_now("x", False)
    check(not failed.get("ok") and "display" in failed.get("error", ""), "request error reported")

    # real unlock: screenshot when enabled, none for tests, deferred when the popup is included
    taken = []
    async def fake_shot(payload, delay, include_popup): taken.append((delay, include_popup))
    pl._screenshot_for_unlock = fake_shot
    pl._record_unlock = lambda payload: None
    shown = []
    async def overlay(payload): shown.append(payload)
    pl._show_gamescope_overlay = overlay
    pl._local_achievement_text = lambda appid, aid: ("", "")
    async def resolve(appid, aid, url): return None
    pl._resolve_authoritative_icon_url = resolve
    pl._cache_icon = lambda appid, aid, url: None
    async def pct(appid, aid): return None
    pl._lookup_percent = pct
    async def ensure(appid, aid, title, desc, path, url): return path, url
    pl._ensure_colored_icon = ensure
    pl._game_icon_path = lambda appid: None

    async def unlock(key, test=False):
        await pl._emit_notification("Title", "Desc", False, "h", "t", key, appid=7, achievement_id=key, test=test)
        await asyncio.sleep(0.05)

    pl._save_settings(pl._sanitize_settings({"screenshot_on_unlock": False}))
    await unlock("a1")
    check(not taken, "no screenshot while the option is off")

    pl._save_settings(pl._sanitize_settings({"screenshot_on_unlock": True}))
    await unlock("a2")
    check(taken == [(0.0, False)], f"screenshot at once when popup not included ({taken})")
    check(not shown[-1].get("screenshot_with_popup"), "popup payload not flagged")
    taken.clear()
    await unlock("a3", test=True)
    check(not taken, "test popups take no screenshot")

    pl._save_settings(pl._sanitize_settings({"screenshot_on_unlock": True, "screenshot_include_popup": True}))
    await unlock("a4")
    check(not taken and shown[-1].get("screenshot_with_popup"), "popup-included screenshot is left to the overlay")

    # template preview: fake renderer writes a PNG, second call comes from the cache
    renderer = os.path.join(tmp, "render.py")
    with open(renderer, "w") as f:
        f.write("import os,sys\nopen(os.environ['FINALLY_PREVIEW_PATH'],'wb').write(%r)\n"
                "open(%r,'a').write(os.environ['FINALLY_TEMPLATE']+'|'+os.environ.get('FINALLY_TIER','')+'\\n')\n"
                % (png_bytes(), os.path.join(tmp, "calls.txt")))
    main.STEAMWORKS_PYTHON = sys.executable
    main.FINALLY_OVERLAY_HELPER_NAME = "render.py"
    fake.DECKY_PLUGIN_DIR = tmp
    pl._save_settings(pl._sanitize_settings({}))
    first = await pl.get_template_preview("ps3_trophy", "rare")
    check(first.get("ok") and first["image"].startswith("data:image/png;base64,"), f"preview returned ({first.get('error')})")
    again = await pl.get_template_preview("ps3_trophy", "rare")
    other = await pl.get_template_preview("not_a_template", "common")
    calls = open(os.path.join(tmp, "calls.txt")).read().split()
    check(again.get("ok") and calls.count("ps3_trophy|rare") == 1, f"same preview is cached ({calls})")
    check(other.get("template") == "xbox_modern", "unknown template falls back to the saved one")

    # animated PNG: right chunks, sequence numbers and checksums
    import finally_apng
    frames = [png_bytes(8, 4) for _ in range(3)]
    apng = finally_apng.frames_to_apng(frames, [100, 100, 500])
    chunks, pos = [], 8
    while pos < len(apng):
        size = struct.unpack(">I", apng[pos:pos + 4])[0]
        kind, data = apng[pos + 4:pos + 8], apng[pos + 8:pos + 8 + size]
        check(struct.unpack(">I", apng[pos + 8 + size:pos + 12 + size])[0] == zlib.crc32(kind + data) & 0xFFFFFFFF, f"crc of {kind}")
        chunks.append((kind, data))
        pos += 12 + size
    kinds = [k for k, _ in chunks]
    check(kinds == [b"IHDR", b"acTL", b"fcTL", b"IDAT", b"fcTL", b"fdAT", b"fcTL", b"fdAT", b"IEND"], f"apng layout {kinds}")
    check(struct.unpack(">II", chunks[1][1]) == (3, 0), "3 frames, loops forever")
    seqs = [struct.unpack(">I", d[:4])[0] for k, d in chunks if k in (b"fcTL", b"fdAT")]
    check(seqs == list(range(5)), f"sequence numbers {seqs}")
    try:
        finally_apng.frames_to_apng([png_bytes(8, 4), png_bytes(9, 4)], [1, 1])
        check(False, "different frame sizes refused")
    except ValueError:
        pass

    # the helper scripts compile
    for name in ("finally_screenshot.py", "finally_gamescope_overlay.py", "finally_apng.py"):
        compile(open(os.path.join(ROOT, name)).read(), name, "exec")

asyncio.run(run())
if bad:
    print(bad, "FAILED"); sys.exit(1)
print("screenshot/preview test ok")
