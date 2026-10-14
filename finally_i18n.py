"""Language helpers shared by the plugin backend (main.py) and the popup
renderer (finally_gamescope_overlay.py, which runs as its own process).

Translations live in locales/<code>.json as {"language": "Name", "strings":
{"English text": "Translation"}}. The English text is the key, so anything
without a translation simply shows in English. Only the standard library is
used: Decky's bundled Python can lack modules, and the renderer runs under the
system Python.
"""
import json
import os
import re
from typing import Dict, Iterable, Optional

SUPPORTED = ("en", "tr", "de", "fr", "es", "pt-BR", "ru", "zh-Hans", "pl")

# Steam's own names for these languages (also what its web APIs take as `l=`).
STEAM_NAME = {
    "en": "english",
    "tr": "turkish",
    "de": "german",
    "fr": "french",
    "es": "spanish",
    "pt-BR": "brazilian",
    "ru": "russian",
    "zh-Hans": "schinese",
    "pl": "polish",
}
_FROM_STEAM = {
    "english": "en", "turkish": "tr", "german": "de", "french": "fr",
    "spanish": "es", "latam": "es", "brazilian": "pt-BR", "portuguese": "pt-BR",
    "russian": "ru", "schinese": "zh-Hans", "polish": "pl",
}
_NOT_OURS = ("tchinese", "zh-tw", "zh-hk", "zh-hant")

# Languages that write 4,7 rather than 4.7.
COMMA_DECIMAL = ("tr", "de", "fr", "es", "pt-BR", "ru", "pl")

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_cache: Dict[str, Dict[str, str]] = {}


def language_from_steam(raw: object) -> Optional[str]:
    """"turkish", "tr", "tr-TR", "pt_BR", "zh-CN" ... -> a supported code, else None."""
    if not isinstance(raw, str):
        return None
    value = raw.strip().lower().replace("_", "-")
    if not value:
        return None
    if value in _FROM_STEAM:
        return _FROM_STEAM[value]
    if value in _NOT_OURS:
        return None
    if value == "pt-br":
        return "pt-BR"
    if value.startswith("zh"):
        return "zh-Hans"
    base = value.split("-")[0]
    for code in SUPPORTED:
        if code.lower() == base:
            return code
    return None


def steam_api_language(code: Optional[str]) -> str:
    """The `l=` value for Steam's web APIs and community pages."""
    return STEAM_NAME.get(code or "en", "english")


def read_steam_registry_name(homes: Iterable[str]) -> Optional[str]:
    """Steam's language name exactly as stored in its registry.vdf ("turkish", "japanese", ...)."""
    for home in homes:
        if not home:
            continue
        for rel in (".steam/registry.vdf", ".steam/steam/registry.vdf", ".local/share/Steam/registry.vdf"):
            path = os.path.join(home, rel)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                    text = stream.read()
            except OSError:
                continue
            match = re.search(r'"language"\s+"([^"]*)"', text)
            if match and re.fullmatch(r"[a-z]{3,20}", match.group(1)):
                return match.group(1)
    return None


def load_strings(code: str, base_dir: Optional[str] = None) -> Dict[str, str]:
    if code in _cache:
        return _cache[code]
    strings: Dict[str, str] = {}
    if code in SUPPORTED and code != "en":
        path = os.path.join(base_dir or _BASE_DIR, "locales", f"{code}.json")
        try:
            with open(path, "r", encoding="utf-8") as stream:
                data = json.load(stream)
            raw = data.get("strings") if isinstance(data, dict) else None
            if isinstance(raw, dict):
                strings = {k: v for k, v in raw.items() if isinstance(k, str) and isinstance(v, str)}
        except (OSError, ValueError):
            strings = {}
    _cache[code] = strings
    return strings


def translate(code: str, text: str, **values: object) -> str:
    """`text` in language `code` (English if there is no translation), with
    {name} placeholders filled from `values`."""
    out = load_strings(code).get(text) or text
    if values:
        for name, value in values.items():
            out = out.replace("{" + name + "}", str(value))
    return out


def format_decimal(code: str, text: str) -> str:
    """"4.7" -> "4,7" for the languages that use a decimal comma."""
    return text.replace(".", ",") if code in COMMA_DECIMAL else text
