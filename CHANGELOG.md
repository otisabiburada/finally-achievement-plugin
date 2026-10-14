# Changelog

## 1.6.2
- Unlocks are noticed within about a second by reading Steam's `UserGameStats` file directly, instead of waiting for the library cache (which only refreshed when the Steam interface did, e.g. after pressing the Steam button).
- Names and descriptions come first from Steam's local schema (every language, secret achievements included); the helper lookup is retried up to 3 times instead of once.
- New `tests/test_stats_bin.py`.

## 1.6.1
- Polish translation. Steamworks refresh every 2 seconds. Steam library lookup under other user names and Flatpak Steam.
