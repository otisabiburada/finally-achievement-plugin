#!/bin/sh
# Makes the zip you attach to a GitHub release: build/Finally-Achievement-Plugin.zip, with one folder "Finally Achievement Plugin" inside.
# Needs only zip. It packs the committed dist/index.js as it is (no pnpm, no build).
set -e
cd "$(dirname "$0")/.."
[ -f dist/index.js ] || { echo "dist/index.js is missing. Run 'pnpm i && pnpm build' once and commit dist/."; exit 1; }
OUT="build/Finally Achievement Plugin"
rm -rf build && mkdir -p "$OUT"
cp -R dist assets locales "$OUT/"
cp ./*.py plugin.json package.json LICENSE README.md "$OUT/"
chmod +x "$OUT/finally_gamescope_overlay.py" "$OUT/tracker_overlay.py"
rm -f "$OUT"/dist/*.map "$OUT"/dist/.gitkeep
find "$OUT" -name "__pycache__" -type d -prune -exec rm -rf {} +
(cd build && zip -qr Finally-Achievement-Plugin.zip "Finally Achievement Plugin")
echo "Made build/Finally-Achievement-Plugin.zip"
