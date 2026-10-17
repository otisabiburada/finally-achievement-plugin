# Changelog

## 1.6.3
- Popups appear right after an unlock instead of 10-15 seconds later. The icon, unlock percentage, description and game art now share a 1-second budget; anything slower is left out of that popup and cached for the next one. Before, each was awaited in turn with multi-second network timeouts, a gray-icon check and retries.
- A change to Steam's `UserGameStats` file is read the moment inotify reports it (the 1-second scan is now a 0.25-second backstop). Before, the inotify event went to the library cache, which lags.
- When a game starts, its unlock percentages, game icon/art and the icons of locked achievements are downloaded ahead of time.
- MangoApp is stopped while the sound lead-in plays instead of after it.
- The gray-icon check runs in one helper that stays running, instead of starting a new Python process per icon. Each icon's answer is saved (`icon-cache/color-verdicts.json`) and only rechecked if the file changes. Icons downloaded when a game starts are checked then too.
- A display setup the popup couldn't open on is skipped for 10 minutes instead of being tried first on every popup. If every setup failed, each popup tries only one of them.
- On a TV, popups use the screen size Steam's UI reports (sent by the panel) when the popup screen size is "auto", instead of the X display's size, which can differ (e.g. 1280x800 on a 1080p TV) and put popups in the wrong place.
- New `tests/test_popup_latency.py`.

## 1.6.2
- Unlocks are noticed within about a second by reading Steam's `UserGameStats` file directly, instead of waiting for the library cache (which only refreshed when the Steam interface did, e.g. after pressing the Steam button).
- Names and descriptions come first from Steam's local schema (every language, secret achievements included); the helper lookup is retried up to 3 times instead of once.
- New `tests/test_stats_bin.py`.

## 1.6.1
- Polish translation. Steamworks refresh every 2 seconds. Steam library lookup under other user names and Flatpak Steam.
