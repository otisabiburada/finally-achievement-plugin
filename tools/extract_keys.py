#!/usr/bin/env python3
"""Lists every English string the panel can translate (for checking locales/*.json)."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def unjs(x):
    x = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), x)
    return x.replace('\\"', '"').replace("\\'", "'").replace("\\\\", "\\")
keys = []
idx = read("src/index.tsx")
for m in re.finditer(r'\bt\("((?:[^"\\]|\\.)*)"', idx):
    keys.append(unjs(m.group(1)))
for m in re.finditer(r'\bt\("((?:[^"\\]|\\.)*)"', read("src/achievementsTypes.ts")):
    keys.append(unjs(m.group(1)))
for m in re.finditer(r'\bt\("((?:[^"\\]|\\.)*)"', read("src/historyView.tsx")):
    keys.append(unjs(m.group(1)))
# strings that are translated where they are used, not where they are written
for f in ("src/finallyThemes.ts", "src/achievementsTypes.ts", "src/index.tsx"):
    src = read(f)
    for m in re.finditer(r'(?:label|description):\s*"((?:[^"\\]|\\.)*)"', src):
        keys.append(unjs(m.group(1)))
for m in re.finditer(r'^\s+(?:[a-z_]+|"[^"]+"):\s*"((?:[^"\\]|\\.)*)",?$', idx.split("function describeIconResolution")[0].split("ICON_RESOLUTION_LABELS")[1], re.M):
    keys.append(unjs(m.group(1)))
ach = read("src/achievementsTypes.ts")
for m in re.finditer(r'^\s+(?:[a-z_]+|"[^"]+"):\s*"((?:[^"\\]|\\.)*)",$', ach.split("ERROR_MESSAGES")[1], re.M):
    keys.append(unjs(m.group(1)))
# Text the popup renderer and backend translate (finally_gamescope_overlay.py, main.py),
# plus the language list's "Auto" entry (src/i18n.ts).
PY_KEYS = [
    "Auto (Steam language)",
    "ACHIEVEMENT UNLOCKED", "RARE ACHIEVEMENT UNLOCKED", "TROPHY UNLOCKED", "RARE TROPHY UNLOCKED",
    "UNLOCKED!", "RARE UNLOCK!", "RARE ACHIEVEMENT", "Rare achievement", "New achievement",
    "[RARE UNLOCK]", "[ACHIEVEMENT]",
    "UNCOMMON ACHIEVEMENT", "ULTRA RARE ACHIEVEMENT", "UNCOMMON TROPHY", "ULTRA RARE TROPHY",
    "UNCOMMON UNLOCK!", "ULTRA RARE UNLOCK!", "Uncommon achievement", "Ultra rare achievement",
    "[UNCOMMON UNLOCK]", "[ULTRA RARE UNLOCK]",
    "100% COMPLETE", "UNLOCKED", "TRACKING", "Unlocked", "Tracking", "Achievement",
    "Loading...", "Achievement Unlocked",
    "{count} unlocked", "{count} unlocked, {rare} rare", "Only 1 achievement left",
    "Only {count} achievements left",
    "Uncommon Achievement", "Rare Achievement Unlocked", "Ultra Rare Achievement",
    "Manual common popup test", "Manual uncommon popup test", "Manual rare popup test",
    "Manual ultra rare popup test",
]
keys.extend(PY_KEYS)
# Names and numbers that read the same in every language; they need no translation.
SAME_IN_ALL = {
    "Finally Achievement Plugin", "1280 x 800", "1920 x 1200", "2560 x 1440",
    "Xbox Modern", "Trophy Case", "Handheld Bold", "Steam Flat", "Material Minimal", "Retro Arcade",
    "Chat Toast", "Cyber Glass", "Xbox 360 Classic", "Xbox 360 Classic v2", "Xbox 360 Classic v2 (Square)",
    "Fluent Glass", "Chat Bar", "Vaporwave", "Paper Light", "Trophy Plaque", "Terminal", "Game Art Blur",
}
seen = []
for k in keys:
    if k not in seen and k not in SAME_IN_ALL: seen.append(k)
if __name__ == "__main__":
    json.dump(seen, sys.stdout, ensure_ascii=False, indent=0)
