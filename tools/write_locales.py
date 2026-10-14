#!/usr/bin/env python3
"""Writes locales/<code>.json from tools/locale_src.py, then src/locales.ts.
Also checks that every key the code uses is translated (run after editing)."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import locale_src as L
NAMES = {"tr": "Türkçe", "de": "Deutsch", "fr": "Français", "es": "Español",
         "pt-BR": "Português (Brasil)", "ru": "Русский", "zh-Hans": "简体中文", "pl": "Polski"}
os.makedirs(os.path.join(ROOT, "locales"), exist_ok=True)
for i, code in enumerate(L.ORDER):
    strings = {}
    for en, tr in L.ENTRIES:
        if en in strings:
            raise SystemExit("duplicate key: " + en)
        strings[en] = tr[i]
        for ph in __import__("re").findall(r"\{(\w+)\}", en):
            if "{" + ph + "}" not in tr[i]:
                raise SystemExit(f"[{code}] placeholder {{{ph}}} missing in: {en[:50]}")
    with open(os.path.join(ROOT, "locales", code + ".json"), "w", encoding="utf-8") as f:
        json.dump({"language": NAMES[code], "strings": strings}, f, ensure_ascii=False, indent=1)
        f.write("\n")
import locale_pl as LP
for en, pl in LP.PL.items():
    for ph in __import__("re").findall(r"\{(\w+)\}", en):
        if "{" + ph + "}" not in pl:
            raise SystemExit(f"[pl] placeholder {{{ph}}} missing in: {en[:50]}")
with open(os.path.join(ROOT, "locales", "pl.json"), "w", encoding="utf-8") as f:
    json.dump({"language": NAMES["pl"], "strings": dict(LP.PL)}, f, ensure_ascii=False, indent=1)
    f.write("\n")
keys = json.loads(subprocess.check_output([sys.executable, os.path.join(ROOT, "tools", "extract_keys.py")]))
print("pl missing:", [k[:50] for k in keys if k not in LP.PL], "| pl unused:", [k[:50] for k in LP.PL if k not in keys])
have = {en for en, _ in L.ENTRIES}
missing = [k for k in keys if k not in have]
extra = [k for k in have if k not in keys]
print("keys used:", len(keys), "| translated:", len(have), "| missing:", len(missing), "| unused:", len(extra))
for k in missing: print("  MISSING:", k[:80])
for k in extra: print("  UNUSED:", k[:80])
subprocess.check_call([sys.executable, os.path.join(ROOT, "tools", "build_locales.py")])
