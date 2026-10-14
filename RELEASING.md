# Releasing

Users install the zip from a GitHub release; nothing is built for them: `dist/index.js` is committed.

1. Change the code. If anything under `src/` changed, rebuild once and commit the result: `pnpm i && pnpm build`.
2. Bump `version` in `package.json` and `plugin.json`, and add a line to `CHANGELOG.md`.
3. Commit, then tag and push: `git tag v1.6.2 && git push origin main v1.6.2`.
4. The Release workflow checks the tag matches `package.json`, runs the tests, packs `Finally-Achievement-Plugin.zip` and attaches it to a new release.

To make the zip yourself: `sh scripts/package.sh` (needs only `zip`).
