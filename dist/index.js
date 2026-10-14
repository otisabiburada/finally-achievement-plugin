// shims/api.js
var manifest = { "name": "Finally Achievement Plugin" };
var API_VERSION = 2;
var conn = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!conn) throw new Error("[@decky/api]: Failed to connect to the loader as the loader API was not initialized.");
var api;
try {
  api = conn.connect(API_VERSION, manifest.name);
} catch {
  api = conn.connect(1, manifest.name);
}
var call = api.call;
var addEventListener = api.addEventListener;
var removeEventListener = api.removeEventListener;
var definePlugin = (fn) => (...args) => fn(...args);

// shims/ui.js
var D = window.DFL;
var ButtonItem = D.ButtonItem;
var DropdownItem = D.DropdownItem;
var Focusable = D.Focusable;
var PanelSection = D.PanelSection;
var PanelSectionRow = D.PanelSectionRow;
var SliderField = D.SliderField;
var TextField = D.TextField;
var ToggleField = D.ToggleField;
var ColorPickerModal = D.ColorPickerModal;
var showModal = D.showModal;
var staticClasses = D.staticClasses;

// shims/react.js
var R = window.SP_REACT;
var useState = R.useState;
var useEffect = R.useEffect;
var useRef = R.useRef;
var useCallback = R.useCallback;
var useMemo = R.useMemo;
var useContext = R.useContext;
var createContext = R.createContext;
var createElement = R.createElement;
var Fragment = R.Fragment;
var react_default = R;

// ../work/Finally Achievement Plugin/src/finallyThemes.ts
var EVENT_NAME = "finally_show";
var SETTINGS_EVENT = "finally_settings_changed";
var DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
var DEFAULT_RARE_SOUND = "rare_preroll.wav";
var FONT_SIZE_RANGES = {
  label_font_size: { min: 9, max: 18, default: 13 },
  title_font_size: { min: 18, max: 34, default: 26 },
  subtitle_font_size: { min: 12, max: 22, default: 18 }
};
var DURATION_RANGE = { min: 3, max: 12, step: 0.5, default: 5.8 };
var GLOW_INTENSITY_RANGE = { min: 0, max: 100, step: 10, default: 50 };
var RING_SIZE_RANGE = { min: 0, max: 100, step: 10, default: 50 };
var GRADIENT_DIRECTION_OPTIONS = [
  { data: "vertical", label: "Vertical (default)" },
  { data: "left_right", label: "Left to right" },
  { data: "right_left", label: "Right to left" },
  { data: "solid", label: "Solid color" }
];
var TIER_CUTOFF_RANGES = {
  ultra: { min: 0.5, max: 5, step: 0.5 },
  rare: { min: 2, max: 25, step: 1 },
  uncommon: { min: 5, max: 60, step: 1 }
};
var SOUND_SLOT_OPTIONS = [
  { slot: "common", label: "Common sound", description: "Everyday unlocks (above the Uncommon cutoff)." },
  { slot: "uncommon", label: "Uncommon sound", description: "Needs Rarity Tiers on; otherwise common sounds play." },
  { slot: "rare", label: "Rare sound", description: "Rare unlocks." },
  { slot: "ultra_rare", label: "Ultra rare sound", description: "Needs Rarity Tiers on; otherwise the rare sound plays." },
  { slot: "completion", label: "Completionist sound", description: "The popup for unlocking every achievement in a game." }
];
var PERCENT_POSITION_OPTIONS = [
  { data: "bottom_right", label: "Bottom right (default)" },
  { data: "top_right", label: "Top right (descriptions can use 2 lines)" }
];
var COMPLETION_TITLE_OPTIONS = [
  { data: "completionist", label: "Completionist" },
  { data: "legendary", label: "Legendary Achievement unlocked" },
  { data: "crowned", label: "Crowned" }
];
var PERCENT_SIZE_RANGE = { min: 70, max: 150, step: 5, default: 100 };
var PLACEHOLDER_ICON_OPTIONS = [
  { data: "auto", label: "Default (game icon, else badge)" },
  { data: "trophy", label: "Trophy" },
  { data: "game_icon", label: "Game icon" }
];
var OVERLAY_POSITION_OPTIONS = [
  { data: "top_left", label: "Top left" },
  { data: "top_center", label: "Top middle" },
  { data: "top_right", label: "Top right" },
  { data: "bottom_left", label: "Bottom left" },
  { data: "bottom_center", label: "Bottom middle" },
  { data: "bottom_right", label: "Bottom right" }
];
var OVERLAY_SCREEN_OPTIONS = [
  { data: "auto", label: "Auto (detect)" },
  { data: "1280x800", label: "1280 x 800" },
  { data: "1920x1080", label: "1920 x 1080 (Full HD TV)" },
  { data: "1920x1200", label: "1920 x 1200" },
  { data: "2560x1440", label: "2560 x 1440" },
  { data: "2560x1600", label: "2560 x 1600 (Legion Go screen)" },
  { data: "3840x2160", label: "3840 x 2160 (4K TV)" }
];
var OVERLAY_TEMPLATE_OPTIONS = [
  { data: "xbox_modern", label: "Xbox Modern" },
  { data: "playstation_trophy", label: "Trophy Case" },
  { data: "switch_bold", label: "Handheld Bold" },
  { data: "steam_flat", label: "Steam Flat" },
  { data: "material_minimal", label: "Material Minimal" },
  { data: "retro_arcade", label: "Retro Arcade" },
  { data: "chat_toast", label: "Chat Toast" },
  { data: "cyber_glass", label: "Cyber Glass" },
  { data: "xbox_360_classic", label: "Xbox 360 Classic" },
  { data: "xbox_360_v2", label: "Xbox 360 Classic v2" },
  { data: "xbox_360_v2_square", label: "Xbox 360 Classic v2 (Square)" },
  { data: "win11_glass", label: "Fluent Glass" },
  { data: "discord_bar", label: "Chat Bar" },
  { data: "vaporwave", label: "Vaporwave" },
  { data: "light_card", label: "Paper Light" },
  { data: "wood_plaque", label: "Trophy Plaque" },
  { data: "terminal_hacker", label: "Terminal" },
  { data: "game_art", label: "Game Art Blur" }
];
var TRACKER_TEMPLATE_OPTIONS = [
  { data: "same", label: "Same as popups" },
  ...OVERLAY_TEMPLATE_OPTIONS
];
var DEFAULT_SETTINGS = {
  sound_common: DEFAULT_NORMAL_SOUND,
  sound_uncommon: DEFAULT_NORMAL_SOUND,
  sound_rare: DEFAULT_RARE_SOUND,
  sound_ultra_rare: DEFAULT_RARE_SOUND,
  sound_completion: DEFAULT_RARE_SOUND,
  overlay_size_percent: 50,
  volume_percent: 50,
  overlay_position: "bottom_center",
  overlay_screen: "auto",
  language: "auto",
  overlay_template: "xbox_modern",
  label_font_size: 13,
  title_font_size: 26,
  subtitle_font_size: 18,
  duration_seconds: 5.8,
  icon_glow_enabled: true,
  icon_glow_intensity: 50,
  ring_size: 50,
  gradient_direction: "vertical",
  glow_normal_enabled: false,
  icon_frame_ring_enabled: true,
  icon_gradient_enabled: false,
  show_percent: true,
  placeholder_icon: "auto",
  game_art_gradient_enabled: false,
  completion_toast_enabled: true,
  session_summary_enabled: true,
  near_completion_enabled: true,
  near_completion_threshold: 2,
  completion_title: "completionist",
  percent_size: 100,
  percent_position: "bottom_right",
  rarity_tiers_enabled: true,
  test_with_game_data: true,
  template_fx_enabled: true,
  template_colors_enabled: false,
  tracker_position: "top_right",
  tracker_size_percent: 100,
  tracker_template: "same",
  tier_uncommon_cutoff: 25,
  tier_rare_cutoff: 10,
  tier_ultra_cutoff: 1,
  rarity_enabled: true,
  normal_gradient_start: "hsla(134, 58%, 25%, 0.94)",
  normal_gradient_end: "hsla(134, 50%, 14%, 0.94)",
  rare_gradient_start: "hsla(45, 90%, 42%, 0.95)",
  rare_gradient_end: "hsla(38, 70%, 22%, 0.95)",
  normal_circle_color: "hsla(134, 62%, 51%, 1)",
  rare_circle_color: "hsla(45, 95%, 58%, 1)"
};

// ../work/Finally Achievement Plugin/src/locales.ts
var LOCALES = {
  "de": {
    "(yours)": "(deine)",
    "0% hides the banner; 50% is the default size.": "0 % blendet das Banner aus; 50 % ist die Standardgr\xF6\xDFe.",
    "100% COMPLETE": "100 % ABGESCHLOSSEN",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (Full-HD-Fernseher)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (Legion-Go-Display)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (4K-Fernseher)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 ist der Standardlook; 0 ist praktisch aus, 100 verdoppelt es.",
    "50% is the default volume; 0% is silent.": "50 % ist die Standardlautst\xE4rke; 0 % ist stumm.",
    "<0.1% of players": "<0,1 % der Spieler",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Eine h\xE4ufige Freischaltung (\xFCber der Grenze f\xFCr Ungew\xF6hnlich): kein Stufen-Label.",
    "A rare unlock: gold look, rare sound and glow.": "Eine seltene Freischaltung: Goldlook, seltener Ton und Leuchten.",
    "ACHIEVEMENT UNLOCKED": "ERFOLG FREIGESCHALTET",
    "Achievement": "Erfolg",
    "Achievement Icon Accuracy": "Genauigkeit der Erfolgssymbole",
    "Achievement Tracker": "Erfolgs-Tracker",
    "Achievement Unlocked": "Erfolg freigeschaltet",
    "Achievements": "Erfolge",
    "Achievements & tracker": "Erfolge & Tracker",
    "Advanced": "Erweitert",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Zeigt nach einer Freischaltung einen Popup wie \u201ENur noch 2 Erfolge \xFCbrig\u201C, wenn ein Spiel kurz vor 100 % ist.",
    "Alert when this many are left": "Hinweis, wenn nur noch so viele \xFCbrig sind",
    "Almost there alert": "Fast-geschafft-Hinweis",
    "Alphabetical": "Alphabetisch",
    "An ultra rare unlock: extra sparkles and a longer shine.": "Eine ultra-seltene Freischaltung: mehr Funkeln und l\xE4ngerer Glanz.",
    "An uncommon unlock: tier label only.": "Eine ungew\xF6hnliche Freischaltung: nur Stufen-Label.",
    "App {id}": "App {id}",
    "Appearance": "Darstellung",
    "Auto (Steam language)": "Auto (Steam-Sprache)",
    "Auto (detect)": "Auto (erkennen)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Auto passt auf dem Bildschirm des Decks. Landen Popups am Fernseher an der falschen Stelle, w\xE4hle die Aufl\xF6sung des Fernsehers und pr\xFCfe sie mit dem Rahmentest unten.",
    "Bottom left": "Unten links",
    "Bottom middle": "Unten Mitte",
    "Bottom right": "Unten rechts",
    "Bottom right (default)": "Unten rechts (Standard)",
    "Checking...": "Pr\xFCfe ...",
    "Clear history": "Verlauf l\xF6schen",
    "Clear search": "Suche l\xF6schen",
    "Colors": "Farben",
    "Colors & style": "Farben & Stil",
    "Common sound": "Ton f\xFCr H\xE4ufig",
    "Completion popup at 100%": "Abschluss-Popup bei 100 %",
    "Completion popup name": "Name des Abschluss-Popups",
    "Completionist": "Komplettist",
    "Completionist sound": "Ton f\xFCr Abschluss",
    "Could not save the card: {error}": "Karte konnte nicht gespeichert werden: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "Es konnte nicht best\xE4tigt werden, dass dieses Symbol das farbige ist, und nichts Besseres wurde gefunden.",
    "Couldn't identify the game/achievement for this unlock.": "Spiel/Erfolg f\xFCr diese Freischaltung konnte nicht ermittelt werden.",
    "Couldn't save that key.": "Der Schl\xFCssel konnte nicht gespeichert werden.",
    "Couldn't start the achievement probe.": "Der Erfolgs-Probe konnte nicht gestartet werden.",
    "Crowned": "Gekr\xF6nt",
    "Currently Playing": "Aktuelles Spiel",
    "Custom settings for this game": "Eigene Einstellungen f\xFCr dieses Spiel",
    "Custom settings for {name}": "Eigene Einstellungen f\xFCr {name}",
    "Default (game icon, else badge)": "Standard (Spielsymbol, sonst Plakette)",
    "Description font size": "Schriftgr\xF6\xDFe der Beschreibung",
    "Direction of the card's background gradient, or a flat solid color.": "Richtung des Hintergrundverlaufs der Karte oder eine einfarbige Fl\xE4che.",
    "Editing settings for all games.": "Einstellungen f\xFCr alle Spiele werden bearbeitet.",
    "Editing settings for {name} only.": "Einstellungen nur f\xFCr {name} werden bearbeitet.",
    "Everyday unlocks (above the Uncommon cutoff).": "Allt\xE4gliche Freischaltungen (\xFCber der Grenze f\xFCr Ungew\xF6hnlich).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Extras bei manchen Vorlagen: Tipp-Text, animierte Hintergr\xFCnde, Glitches, Schrauben, eine Spielnamen-Kopfzeile und mehr. F\xFCr den schlichten Look ausschalten.",
    "Font size of the achievement name.": "Schriftgr\xF6\xDFe des Erfolgsnamens.",
    "Font size of the small eyebrow label above the title.": "Schriftgr\xF6\xDFe des kleinen Labels \xFCber dem Titel.",
    "Font size of the subtitle/description line.": "Schriftgr\xF6\xDFe der Untertitel-/Beschreibungszeile.",
    "Game Settings": "Spieleinstellungen",
    "Game icon": "Spielsymbol",
    "Glow": "Leuchten",
    "Glow for normal achievements": "Leuchten f\xFCr normale Erfolge",
    "Glow intensity": "Leuchtst\xE4rke",
    "Got an unexpected response from Steam.": "Unerwartete Antwort von Steam erhalten.",
    "Gradient direction": "Verlaufsrichtung",
    "Gradient from game artwork colors": "Verlauf aus Spielbild-Farben",
    "Gradient from icon colors": "Verlauf aus Symbolfarben",
    "History & sharing": "Verlauf & Teilen",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "Wie weit sich die Leuchtringe ausbreiten. 50 ist der Standardlook; 0 blendet sie aus, 100 verdoppelt sie.",
    "How long the toast stays on screen before it slides away.": "Wie lange das Popup sichtbar bleibt, bevor es wegrutscht.",
    "Icon frame ring": "Symbol-Rahmenring",
    "Icon glow": "Symbol-Leuchten",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "H\xF6rst du den Ton, aber es erscheint kein Popup (z. B. auf einem anderen Handheld), f\xFChre diese Pr\xFCfung aus. Sie testet die Python-Pakete, Grafikbibliotheken, Anzeige und Fenstererstellung, die das Popup braucht, und sagt dir, was fehlt.",
    "In progress": "In Arbeit",
    "Key saved (ending in {tail})": "Schl\xFCssel gespeichert (endet auf {tail})",
    "Label font size": "Schriftgr\xF6\xDFe des Labels",
    "Language": "Sprache",
    "Last unlock's icon:": "Symbol der letzten Freischaltung:",
    "Left to right": "Von links nach rechts",
    "Legendary Achievement unlocked": "Legend\xE4rer Erfolg freigeschaltet",
    "Loading achievements...": "Erfolge werden geladen ...",
    "Loading...": "L\xE4dt ...",
    "Making card...": "Karte wird erstellt ...",
    "Manual common popup test": "Manueller Popup-Test: h\xE4ufig",
    "Manual rare popup test": "Manueller Popup-Test: selten",
    "Manual ultra rare popup test": "Manueller Popup-Test: ultra-selten",
    "Manual uncommon popup test": "Manueller Popup-Test: ungew\xF6hnlich",
    "Manually refresh backend status.": "Backend-Status manuell aktualisieren.",
    "Milestone popups": "Meilenstein-Popups",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "Benennt jede Freischaltung im Popup-Label danach, wie wenige Spieler sie haben (Ungew\xF6hnlich, Selten, Ultra-selten). Ultra-selten bekommt zus\xE4tzlich mehr Funkeln und einen l\xE4ngeren Glanz. Selten beh\xE4lt Goldlook und Sound.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "Erfordert aktivierte Seltenheitsstufen; sonst l\xE4uft der Ton f\xFCr H\xE4ufig.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "Erfordert aktivierte Seltenheitsstufen; sonst l\xE4uft der Ton f\xFCr Selten.",
    "New achievement": "Neuer Erfolg",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "Kein API-Schl\xFCssel gesetzt -- es wird nur der lokale Cache genutzt (das farbige Symbol ist nicht garantiert).",
    "No API key set -- using the local cache only.": "Kein API-Schl\xFCssel gesetzt -- es wird nur der lokale Cache genutzt.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "Es wurde keine chinesische Schriftart gefunden, daher kann chinesischer Popup-Text als leere K\xE4stchen erscheinen. Kopiere eine Schriftdatei (.ttf, .otf oder .ttc, z. B. Noto Sans SC) nach {folder} und starte ein Test-Popup.",
    "No achievements found for this game.": "F\xFCr dieses Spiel wurden keine Erfolge gefunden.",
    "No achievements match your search.": "Keine Erfolge entsprechen deiner Suche.",
    "No game is currently running.": "Derzeit l\xE4uft kein Spiel.",
    "No game running": "Kein Spiel gestartet",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "Noch keine Freischaltungen aufgezeichnet. Ab jetzt freigeschaltete Erfolge erscheinen hier.",
    "Nothing pinned right now.": "Derzeit ist nichts angeheftet.",
    "Nothing unlocked yet this session.": "In dieser Sitzung wurde noch nichts freigeschaltet.",
    "Only 1 achievement left": "Nur noch 1 Erfolg \xFCbrig",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Diesmal war nur das graue (gesperrte) Symbol verf\xFCgbar -- ein farbiges war nicht zu finden.",
    "Only {count} achievements left": "Nur noch {count} Erfolge \xFCbrig",
    "Percentage badge position": "Position der Prozent-Plakette",
    "Placeholder icon": "Platzhaltersymbol",
    "Popup": "Popup",
    "Popup Not Showing?": "Popup erscheint nicht?",
    "Popup Tests": "Popup-Tests",
    "Popup duration": "Popup-Dauer",
    "Popup position": "Popup-Position",
    "Popup screen size": "Popup-Bildschirmgr\xF6\xDFe",
    "Popup size": "Popup-Gr\xF6\xDFe",
    "Popup template": "Popup-Vorlage",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Holt den Hintergrundverlauf der Karte aus den Farben des Erfolgssymbols statt aus den festen Farben unten. Funktioniert bei jeder Vorlage au\xDFer Paper Light. F\xE4llt auf die festen Farben zur\xFCck, wenn das Symbol keine klaren Hauptfarben hat (oder keins vorhanden ist).",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Holt den Verlauf stattdessen aus dem Bild des Spiels, sodass alle Popups eines Spiels dieselbe Palette teilen. Das Aktivieren schaltet die Symbol-Option oben aus (es gilt das eine oder das andere). F\xE4llt auf die Symbolfarben zur\xFCck, wenn das Bild nicht gelesen werden kann.",
    "RARE ACHIEVEMENT": "SELTENER ERFOLG",
    "RARE ACHIEVEMENT UNLOCKED": "SELTENER ERFOLG FREIGESCHALTET",
    "RARE TROPHY UNLOCKED": "SELTENER POKAL FREIGESCHALTET",
    "RARE UNLOCK!": "SELTEN FREIGESCHALTET!",
    "Rare Achievement Unlocked": "Seltener Erfolg freigeschaltet",
    "Rare achievement": "Seltener Erfolg",
    "Rare sound": "Ton f\xFCr Selten",
    "Rare unlocks.": "Seltene Freischaltungen.",
    "Rare: this % or lower": "Selten: dieser % oder weniger",
    "Rarity (rarest first)": "Seltenheit (seltenste zuerst)",
    "Rarity Tiers": "Seltenheitsstufen",
    "Rarity tiers": "Seltenheitsstufen",
    "Recent Unlocks": "Letzte Freischaltungen",
    "Refresh": "Aktualisieren",
    "Refresh sound list": "Tonliste aktualisieren",
    "Refreshing...": "Aktualisiere ...",
    "Remove key": "Schl\xFCssel entfernen",
    "Removed.": "Entfernt.",
    "Reset this game to the global settings": "Dieses Spiel auf die globalen Einstellungen zur\xFCcksetzen",
    "Right to left": "Von rechts nach links",
    "Ring size": "Ringgr\xF6\xDFe",
    "Run overlay check": "Overlay-Pr\xFCfung starten",
    "Same as popups": "Wie die Popups",
    "Save key": "Schl\xFCssel speichern",
    "Saved to {path}": "Gespeichert unter {path}",
    "Saved.": "Gespeichert.",
    "Saving...": "Speichere ...",
    "Search": "Suchen",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "W\xE4hle oben einen Erfolg aus (Aktionstaste dr\xFCcken), um ihn beim Spielen als kleinen Tracker auf dem Bildschirm anzuheften. Der Tracker nutzt deine Popup-Vorlage und Farben und gleitet weg, w\xE4hrend ein Popup erscheint. Ein Zahlenfortschritt erscheint nur bei Erfolgen, die das Spiel mit einer verfolgbaren Statistik verkn\xFCpft; andere zeigen gesperrt oder freigeschaltet.",
    "Select an unlock to make a shareable image card.": "W\xE4hle einen Erfolg, um eine teilbare Bildkarte zu erstellen.",
    "Session summary": "Sitzungszusammenfassung",
    "Share card": "Teilen-Karte",
    "Show": "Anzeigen",
    "Show more": "Mehr anzeigen",
    "Show screen frame": "Bildschirmrahmen anzeigen",
    "Show unlock percentage": "Freischaltquote anzeigen",
    "Showing {shown} of {total}": "{shown} von {total} werden angezeigt",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Wird angezeigt, wenn ein Erfolg noch kein Symbol hat (und als Startsymbol bei Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Zeigt einige Sekunden lang einen roten Rahmen (gelber Block = oben links). Er sollte genau an den Bildschirmr\xE4ndern liegen. Falls nicht, w\xE4hle oben eine andere Gr\xF6\xDFe.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Zeigt, wie viel Prozent der Spieler den Erfolg haben, z. B. 4,7 % der Spieler.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "Gr\xF6\xDFe der kleinen Plakette \u201E4,7 % der Spieler\u201C. 100 % ist der Standard.",
    "Solid color": "Einfarbig",
    "Something went wrong.": "Etwas ist schiefgelaufen.",
    "Sort by": "Sortieren nach",
    "Sound": "Ton",
    "Sound & tests": "Ton & Tests",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Starte ein Spiel und \xF6ffne dann dieses Panel, um ihm eigene Einstellungen zu geben. Derzeit gelten die Einstellungen unten f\xFCr alle Spiele.",
    "Steam Web API key": "Steam-Web-API-Schl\xFCssel",
    "Steam didn't return any achievement data for this game.": "Steam hat f\xFCr dieses Spiel keine Erfolgsdaten geliefert.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam lieferte f\xFCr diesen Erfolg nur ein graues Symbol -- in den Daten gibt es kein farbiges.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "Steams API lieferte eine leere/unbrauchbare Antwort -- es wurde auf den lokalen Cache zur\xFCckgegriffen. Tritt das bei demselben Spiel wiederholt auf, k\xF6nnte es ein vor\xFCbergehendes Problem bei Steam sein.",
    "Steam's achievement library wasn't found on this system.": "Steams Erfolgsbibliothek wurde auf diesem System nicht gefunden.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "Steams Symbol kam grau zur\xFCck, daher wurde das andere Symbol in den Daten (das farbige) verwendet.",
    "Stop tracking": "Verfolgung beenden",
    "TRACKING": "WIRD VERFOLGT",
    "TROPHY UNLOCKED": "POKAL FREIGESCHALTET",
    "Template effects": "Vorlageneffekte",
    "Test Common": "H\xE4ufig testen",
    "Test Completionist": "Abschluss testen",
    "Test Rare": "Selten testen",
    "Test Ultra Rare": "Ultra-selten testen",
    "Test Uncommon": "Ungew\xF6hnlich testen",
    "Test almost there alert": "Fast-geschafft-Hinweis testen",
    "Test session summary": "Sitzungszusammenfassung testen",
    "Text": "Text",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "Der API-Aufruf hat funktioniert, aber dieser Erfolg war darin nicht enthalten -- es wurde auf den lokalen Cache zur\xFCckgegriffen.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "Der Web-API-Aufruf selbst ist fehlgeschlagen (Netzwerkproblem) -- es wurde auf den lokalen Cache zur\xFCckgegriffen.",
    "The big text on the 100% completion popup.": "Der gro\xDFe Text im 100-%-Abschluss-Popup.",
    "The check itself failed: {error}": "Die Pr\xFCfung selbst ist fehlgeschlagen: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "Der farbige Ring um das Symbol, getrennt vom Leuchten oben. Ist er aus, liegt das Symbol auf einem schlichten dunklen Untergrund.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "Das lokale Symbol war grau (gesperrt); das farbige Symbol von Steams \xF6ffentlicher Erfolgsseite wurde verwendet.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "Das lokale Symbol war grau (gesperrt); es wurde auf Steams Aktualisierung gewartet und das farbige verwendet.",
    "The overall card design/style.": "Das Gesamtdesign der Karte.",
    "The popup for unlocking every achievement in a game.": "Das Popup f\xFCr das Freischalten aller Erfolge eines Spiels.",
    "The probe script is missing -- try reinstalling the plugin.": "Das Probe-Skript fehlt -- versuche, das Plugin neu zu installieren.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "Der pulsierende Leuchtring l\xE4uft normalerweise nur bei seltenen Freischaltungen -- aktiviere dies, um ihn auch bei normalen abzuspielen. (Das Band in der Ecke und das Funkeln bleiben seltenen vorbehalten, da sie ausdr\xFCcklich \u201Eder ist selten\u201C bedeuten.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "Der einfache Weg: Jede Vorlage nutzt ihre eigene Palette (z. B. Xbox-Gr\xFCn, PlayStation-Blau, Steam-Blau). Solange das aktiv ist, sind alle Farboptionen unten ausgegraut und werden ignoriert.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "Das weiche Leuchten um das Symbol und der pulsierende Leuchtring (seltene Erfolge, bei Aktivierung unten auch normale).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "Das besondere Popup f\xFCr das Freischalten aller Erfolge eines Spiels, mit dem Namen des laufenden Spiels.",
    "This game doesn't have any Steam achievements.": "Dieses Spiel hat keine Steam-Erfolge.",
    "Timed out talking to Steam. Try refreshing.": "Zeit\xFCberschreitung bei der Kommunikation mit Steam. Versuche zu aktualisieren.",
    "Title font size": "Schriftgr\xF6\xDFe des Titels",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Popup-Symbole stammen normalerweise aus Steams lokalem Cache, der gelegentlich das falsche (graue/gesperrte) Symbol zeigt. Mit einem kostenlosen Steam-Web-API-Schl\xFCssel holt Finally Achievement Plugin jedes Mal das garantiert richtige, farbige Symbol direkt von Steam. Einen Schl\xFCssel gibt es unter steamcommunity.com/dev/apikey",
    "Top left": "Oben links",
    "Top middle": "Oben Mitte",
    "Top right": "Oben rechts",
    "Top right (descriptions can use 2 lines)": "Oben rechts (Beschreibungen k\xF6nnen 2 Zeilen nutzen)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "Oben rechts gibt der Beschreibung die volle Breite: Kurze Beschreibungen enden nicht auf ..., lange k\xF6nnen zwei Zeilen nutzen.",
    "Tracker position": "Tracker-Position",
    "Tracker size": "Tracker-Gr\xF6\xDFe",
    "Tracker template": "Tracker-Vorlage",
    "Tracking": "Wird verfolgt",
    "Trophy": "Pokal",
    "Type part of a name or description.": "Teil eines Namens oder einer Beschreibung eingeben.",
    "ULTRA RARE ACHIEVEMENT": "ULTRA-SELTENER ERFOLG",
    "ULTRA RARE TROPHY": "ULTRA-SELTENER POKAL",
    "ULTRA RARE UNLOCK!": "ULTRA-SELTEN FREIGESCHALTET!",
    "UNCOMMON ACHIEVEMENT": "UNGEW\xD6HNLICHER ERFOLG",
    "UNCOMMON TROPHY": "UNGEW\xD6HNLICHER POKAL",
    "UNCOMMON UNLOCK!": "UNGEW\xD6HNLICH FREIGESCHALTET!",
    "UNLOCKED": "FREIGESCHALTET",
    "UNLOCKED!": "FREIGESCHALTET!",
    "Ultra Rare Achievement": "Ultra-seltener Erfolg",
    "Ultra rare achievement": "Ultra-seltener Erfolg",
    "Ultra rare sound": "Ton f\xFCr Ultra-selten",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "Ultra-selten \u2264 {ultra} %, Selten \u2264 {rare} %, Ungew\xF6hnlich \u2264 {uncommon} %, alles dar\xFCber ist h\xE4ufig (kein Stufen-Label). Die Grenzen bleiben automatisch in Reihenfolge.",
    "Ultra rare: this % or lower": "Ultra-selten: dieser % oder weniger",
    "Uncommon Achievement": "Ungew\xF6hnlicher Erfolg",
    "Uncommon achievement": "Ungew\xF6hnlicher Erfolg",
    "Uncommon sound": "Ton f\xFCr Ungew\xF6hnlich",
    "Uncommon: this % or lower": "Ungew\xF6hnlich: dieser % oder weniger",
    "Unlock percentage size": "Gr\xF6\xDFe der Freischaltquote",
    "Unlocked": "Freigeschaltet",
    "Unlocked first": "Freigeschaltete zuerst",
    "Use each template's own colors": "Eigene Farben jeder Vorlage verwenden",
    "Use the running game for tests": "Laufendes Spiel f\xFCr Tests verwenden",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "Das farbige Symbol aus Steams eigenen lokalen Erfolgsdaten wurde verwendet (kein API-Schl\xFCssel n\xF6tig).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "Das garantiert richtige farbige Symbol aus Steams Web-API wurde verwendet (Treffer ohne Beachtung der Gro\xDF-/Kleinschreibung).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "Das garantiert richtige farbige Symbol aus Steams Web-API wurde verwendet.",
    "Vertical (default)": "Vertikal (Standard)",
    "Volume": "Lautst\xE4rke",
    "Waiting for live data...": "Warte auf Live-Daten ...",
    "Watcher Status": "Watcher-Status",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "Wenn aktiv, gelten alle Einstellungen unten nur f\xFCr dieses Spiel und werden f\xFCr das n\xE4chste Mal gespeichert. Sie beginnen als Kopie deiner aktuellen Einstellungen. Beim Ausschalten bleibt das Gespeicherte erhalten.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "Beim Beenden eines Spiels wird angezeigt, wie viele Erfolge du beim Spielen freigeschaltet hast, zum Beispiel 3 freigeschaltet, 1 selten.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Wenn du den allerletzten Erfolg eines Spiels freischaltest, erscheint nach dessen eigenem Popup ein besonderes smaragdgr\xFCnes Abschluss-Popup.",
    "Where the banner appears on screen.": "Wo das Banner auf dem Bildschirm erscheint.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Mit welcher Popup-Vorlage der Tracker gezeichnet wird. Probiere Game Art Blur, um das Spielbild dahinter zu legen.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "L\xE4uft ein Spiel, zeigen Tests einen zuf\xE4lligen Erfolg daraus (auch einen gesperrten) mit echtem Symbol und Spielbild. Tests z\xE4hlen nie als Freischaltung. L\xE4uft kein Spiel oder ist dies aus, nutzen Tests ein Beispiel.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "Eigene T\xF6ne: Lege .wav-, .flac-, .ogg- oder .mp3-Dateien (maximal 10 MB, kurz halten) in {folder} und dr\xFCcke dann Aktualisieren. Sie erscheinen mit \u201E(deine)\u201C hinter dem Namen, und Plugin-Updates l\xF6schen sie nie. Mit den Test-Schaltfl\xE4chen unten h\xF6rst du jeden einzelnen.",
    "[ACHIEVEMENT]": "[ERFOLG]",
    "[RARE UNLOCK]": "[SELTEN FREIGESCHALTET]",
    "[ULTRA RARE UNLOCK]": "[ULTRA-SELTEN FREIGESCHALTET]",
    "[UNCOMMON UNLOCK]": "[UNGEW\xD6HNLICH FREIGESCHALTET]",
    "never": "nie",
    "the Finally Achievement Plugin settings folder, sounds": "dem Einstellungsordner des Finally Achievement Plugin, Unterordner sounds",
    "{count} unlocked": "{count} freigeschaltet",
    "{count} unlocked, {rare} rare": "{count} freigeschaltet, {rare} selten",
    "{percent}% of players": "{percent} % der Spieler",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} freigeschaltet",
    "\u2713 Unlocked": "\u2713 Freigeschaltet"
  },
  "es": {
    "(yours)": "(tuyo)",
    "0% hides the banner; 50% is the default size.": "0 % oculta el banner; 50 % es el tama\xF1o predeterminado.",
    "100% COMPLETE": "100 % COMPLETADO",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (TV Full HD)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (pantalla de la Legion Go)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (TV 4K)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 es el aspecto predeterminado; 0 equivale a desactivarlo, 100 lo duplica.",
    "50% is the default volume; 0% is silent.": "50 % es el volumen predeterminado; 0 % es silencio.",
    "<0.1% of players": "<0,1 % de los jugadores",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Un desbloqueo com\xFAn (por encima del l\xEDmite de Poco com\xFAn): sin etiqueta de nivel.",
    "A rare unlock: gold look, rare sound and glow.": "Un desbloqueo raro: aspecto dorado, sonido raro y resplandor.",
    "ACHIEVEMENT UNLOCKED": "LOGRO DESBLOQUEADO",
    "Achievement": "Logro",
    "Achievement Icon Accuracy": "Precisi\xF3n de los iconos de logros",
    "Achievement Tracker": "Seguimiento de logros",
    "Achievement Unlocked": "Logro desbloqueado",
    "Achievements": "Logros",
    "Achievements & tracker": "Logros y seguimiento",
    "Advanced": "Avanzado",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Tras un desbloqueo, muestra un aviso como \xABSolo quedan 2 logros\xBB cuando un juego est\xE1 cerca del 100 %.",
    "Alert when this many are left": "Avisar cuando queden tantos",
    "Almost there alert": "Aviso de casi completado",
    "Alphabetical": "Alfab\xE9tico",
    "An ultra rare unlock: extra sparkles and a longer shine.": "Un desbloqueo ultra raro: m\xE1s destellos y un brillo m\xE1s largo.",
    "An uncommon unlock: tier label only.": "Un desbloqueo poco com\xFAn: solo la etiqueta de nivel.",
    "App {id}": "App {id}",
    "Appearance": "Apariencia",
    "Auto (Steam language)": "Auto (idioma de Steam)",
    "Auto (detect)": "Auto (detectar)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Auto funciona bien en la pantalla de la Deck. En una TV, si los avisos salen en un sitio equivocado, elige la resoluci\xF3n de la TV y compru\xE9bala con la prueba del marco de abajo.",
    "Bottom left": "Abajo a la izquierda",
    "Bottom middle": "Abajo en el centro",
    "Bottom right": "Abajo a la derecha",
    "Bottom right (default)": "Abajo a la derecha (predeterminado)",
    "Checking...": "Comprobando...",
    "Clear history": "Borrar historial",
    "Clear search": "Borrar b\xFAsqueda",
    "Colors": "Colores",
    "Colors & style": "Colores y estilo",
    "Common sound": "Sonido Com\xFAn",
    "Completion popup at 100%": "Aviso de finalizaci\xF3n al 100 %",
    "Completion popup name": "Nombre del aviso de finalizaci\xF3n",
    "Completionist": "Completista",
    "Completionist sound": "Sonido de finalizaci\xF3n",
    "Could not save the card: {error}": "No se pudo guardar la tarjeta: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "No se pudo confirmar que este icono sea el de color y no se encontr\xF3 nada mejor.",
    "Couldn't identify the game/achievement for this unlock.": "No se pudo identificar el juego o logro de este desbloqueo.",
    "Couldn't save that key.": "No se pudo guardar esa clave.",
    "Couldn't start the achievement probe.": "No se pudo iniciar el sondeo de logros.",
    "Crowned": "Coronado",
    "Currently Playing": "Jugando ahora",
    "Custom settings for this game": "Ajustes personalizados para este juego",
    "Custom settings for {name}": "Ajustes personalizados para {name}",
    "Default (game icon, else badge)": "Predeterminado (icono del juego, si no, insignia)",
    "Description font size": "Tama\xF1o de fuente de la descripci\xF3n",
    "Direction of the card's background gradient, or a flat solid color.": "Direcci\xF3n del degradado de fondo de la tarjeta, o un color liso.",
    "Editing settings for all games.": "Editando los ajustes de todos los juegos.",
    "Editing settings for {name} only.": "Editando los ajustes solo de {name}.",
    "Everyday unlocks (above the Uncommon cutoff).": "Desbloqueos cotidianos (por encima del l\xEDmite de Poco com\xFAn).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Extras en algunas plantillas: texto que se escribe, fondos animados, glitches, tornillos, un encabezado con el nombre del juego y m\xE1s. Desact\xEDvalo para un aspecto limpio.",
    "Font size of the achievement name.": "Tama\xF1o de fuente del nombre del logro.",
    "Font size of the small eyebrow label above the title.": "Tama\xF1o de fuente de la peque\xF1a etiqueta sobre el t\xEDtulo.",
    "Font size of the subtitle/description line.": "Tama\xF1o de fuente de la l\xEDnea de subt\xEDtulo/descripci\xF3n.",
    "Game Settings": "Ajustes del juego",
    "Game icon": "Icono del juego",
    "Glow": "Resplandor",
    "Glow for normal achievements": "Resplandor para logros normales",
    "Glow intensity": "Intensidad del resplandor",
    "Got an unexpected response from Steam.": "Se recibi\xF3 una respuesta inesperada de Steam.",
    "Gradient direction": "Direcci\xF3n del degradado",
    "Gradient from game artwork colors": "Degradado a partir de los colores de la imagen del juego",
    "Gradient from icon colors": "Degradado a partir de los colores del icono",
    "History & sharing": "Historial y compartir",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "Cu\xE1nto se extienden los anillos luminosos. 50 es el aspecto predeterminado; 0 los oculta, 100 los duplica.",
    "How long the toast stays on screen before it slides away.": "Cu\xE1nto tiempo permanece el aviso en pantalla antes de deslizarse fuera.",
    "Icon frame ring": "Anillo marco del icono",
    "Icon glow": "Resplandor del icono",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "Si oyes el sonido pero no aparece el aviso (por ejemplo en otra consola port\xE1til), ejecuta esta comprobaci\xF3n. Prueba los paquetes de Python, las bibliotecas gr\xE1ficas, la pantalla y la creaci\xF3n de ventanas que necesita el aviso, y te dice qu\xE9 falta.",
    "In progress": "En curso",
    "Key saved (ending in {tail})": "Clave guardada (termina en {tail})",
    "Label font size": "Tama\xF1o de fuente de la etiqueta",
    "Language": "Idioma",
    "Last unlock's icon:": "Icono del \xFAltimo desbloqueo:",
    "Left to right": "De izquierda a derecha",
    "Legendary Achievement unlocked": "Logro legendario desbloqueado",
    "Loading achievements...": "Cargando logros...",
    "Loading...": "Cargando...",
    "Making card...": "Creando tarjeta...",
    "Manual common popup test": "Prueba manual de aviso com\xFAn",
    "Manual rare popup test": "Prueba manual de aviso raro",
    "Manual ultra rare popup test": "Prueba manual de aviso ultra raro",
    "Manual uncommon popup test": "Prueba manual de aviso poco com\xFAn",
    "Manually refresh backend status.": "Actualizar manualmente el estado del backend.",
    "Milestone popups": "Avisos de hitos",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "Nombra cada desbloqueo seg\xFAn los pocos jugadores que lo tienen (Poco com\xFAn, Raro, Ultra raro) en la etiqueta del aviso. Ultra raro a\xF1ade m\xE1s destellos y un brillo m\xE1s largo. Raro mantiene el aspecto dorado y el sonido.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "Requiere los niveles de rareza activados; si no, suenan los sonidos comunes.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "Requiere los niveles de rareza activados; si no, suena el sonido raro.",
    "New achievement": "Nuevo logro",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "No hay clave de API -- se usa solo la cach\xE9 local (no se garantiza el icono en color).",
    "No API key set -- using the local cache only.": "No hay clave de API -- se usa solo la cach\xE9 local.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "No se encontr\xF3 ninguna fuente china, por lo que el texto chino de los avisos puede verse como cuadros vac\xEDos. Copia un archivo de fuente (.ttf, .otf o .ttc, por ejemplo Noto Sans SC) en {folder} y ejecuta un aviso de prueba.",
    "No achievements found for this game.": "No se encontraron logros para este juego.",
    "No achievements match your search.": "Ning\xFAn logro coincide con tu b\xFAsqueda.",
    "No game is currently running.": "Ahora mismo no hay ning\xFAn juego en ejecuci\xF3n.",
    "No game running": "Ning\xFAn juego en ejecuci\xF3n",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "A\xFAn no hay desbloqueos registrados. Los logros que desbloquees a partir de ahora aparecer\xE1n aqu\xED.",
    "Nothing pinned right now.": "No hay nada fijado ahora mismo.",
    "Nothing unlocked yet this session.": "A\xFAn no se ha desbloqueado nada en esta sesi\xF3n.",
    "Only 1 achievement left": "Solo queda 1 logro",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Esta vez solo estaba disponible el icono gris (bloqueado) -- no se encontr\xF3 uno de color.",
    "Only {count} achievements left": "Solo quedan {count} logros",
    "Percentage badge position": "Posici\xF3n de la insignia de porcentaje",
    "Placeholder icon": "Icono provisional",
    "Popup": "Aviso",
    "Popup Not Showing?": "\xBFNo aparece el aviso?",
    "Popup Tests": "Pruebas de aviso",
    "Popup duration": "Duraci\xF3n del aviso",
    "Popup position": "Posici\xF3n del aviso",
    "Popup screen size": "Tama\xF1o de pantalla de los avisos",
    "Popup size": "Tama\xF1o del aviso",
    "Popup template": "Plantilla de aviso",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Toma el degradado de fondo de la tarjeta de los colores del icono del logro en lugar de los colores fijos de abajo. Funciona con todas las plantillas excepto Paper Light. Vuelve a los colores fijos si el icono no tiene colores dominantes claros (o no hay icono).",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Toma el degradado de la imagen del juego, de modo que todos los avisos de un juego compartan una paleta. Al activarlo se desactiva la opci\xF3n de icono de arriba (una u otra). Vuelve a los colores del icono si no se puede leer la imagen.",
    "RARE ACHIEVEMENT": "LOGRO RARO",
    "RARE ACHIEVEMENT UNLOCKED": "LOGRO RARO DESBLOQUEADO",
    "RARE TROPHY UNLOCKED": "TROFEO RARO DESBLOQUEADO",
    "RARE UNLOCK!": "\xA1DESBLOQUEO RARO!",
    "Rare Achievement Unlocked": "Logro raro desbloqueado",
    "Rare achievement": "Logro raro",
    "Rare sound": "Sonido Raro",
    "Rare unlocks.": "Desbloqueos raros.",
    "Rare: this % or lower": "Raro: este % o menos",
    "Rarity (rarest first)": "Rareza (los m\xE1s raros primero)",
    "Rarity Tiers": "Niveles de rareza",
    "Rarity tiers": "Niveles de rareza",
    "Recent Unlocks": "Desbloqueos recientes",
    "Refresh": "Actualizar",
    "Refresh sound list": "Actualizar lista de sonidos",
    "Refreshing...": "Actualizando...",
    "Remove key": "Eliminar clave",
    "Removed.": "Eliminada.",
    "Reset this game to the global settings": "Restablecer este juego a los ajustes globales",
    "Right to left": "De derecha a izquierda",
    "Ring size": "Tama\xF1o del anillo",
    "Run overlay check": "Ejecutar comprobaci\xF3n del overlay",
    "Same as popups": "Igual que los avisos",
    "Save key": "Guardar clave",
    "Saved to {path}": "Guardada en {path}",
    "Saved.": "Guardado.",
    "Saving...": "Guardando...",
    "Search": "Buscar",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "Selecciona un logro arriba (pulsa el bot\xF3n de acci\xF3n sobre \xE9l) para fijarlo como un peque\xF1o seguimiento en pantalla mientras juegas. El seguimiento usa tu plantilla y colores de aviso, y se desliza fuera mientras se muestra un aviso. El progreso num\xE9rico solo aparece en logros que el juego vincula a una estad\xEDstica; los dem\xE1s se muestran bloqueados o desbloqueados.",
    "Select an unlock to make a shareable image card.": "Selecciona un desbloqueo para crear una tarjeta de imagen para compartir.",
    "Session summary": "Resumen de sesi\xF3n",
    "Share card": "Tarjeta para compartir",
    "Show": "Mostrar",
    "Show more": "Mostrar m\xE1s",
    "Show screen frame": "Mostrar marco de pantalla",
    "Show unlock percentage": "Mostrar porcentaje de desbloqueo",
    "Showing {shown} of {total}": "Mostrando {shown} de {total}",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Se muestra cuando un logro a\xFAn no tiene icono (y como icono inicial en Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Muestra un marco rojo (bloque amarillo = arriba a la izquierda) durante unos segundos. Debe coincidir justo con los bordes de la pantalla. Si no, elige otro tama\xF1o arriba.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Muestra qu\xE9 porcentaje de jugadores tiene el logro, p. ej. 4,7 % de los jugadores.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "Tama\xF1o de la peque\xF1a insignia \xAB4,7 % de los jugadores\xBB. 100 % es el valor predeterminado.",
    "Solid color": "Color liso",
    "Something went wrong.": "Algo sali\xF3 mal.",
    "Sort by": "Ordenar por",
    "Sound": "Sonido",
    "Sound & tests": "Sonido y pruebas",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Inicia un juego y abre este panel para darle sus propios ajustes. Ahora mismo los ajustes de abajo se aplican a todos los juegos.",
    "Steam Web API key": "Clave de la API web de Steam",
    "Steam didn't return any achievement data for this game.": "Steam no devolvi\xF3 datos de logros para este juego.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam solo proporcion\xF3 un icono gris para este logro -- no existe uno de color en sus datos.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "La API de Steam devolvi\xF3 una respuesta vac\xEDa o inutilizable -- se volvi\xF3 a la cach\xE9 local. Si sigue ocurriendo con el mismo juego, puede ser un problema temporal de Steam.",
    "Steam's achievement library wasn't found on this system.": "No se encontr\xF3 la biblioteca de logros de Steam en este sistema.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "El icono de Steam lleg\xF3 en gris, as\xED que se us\xF3 el otro icono de sus datos (el de color).",
    "Stop tracking": "Dejar de seguir",
    "TRACKING": "SIGUIENDO",
    "TROPHY UNLOCKED": "TROFEO DESBLOQUEADO",
    "Template effects": "Efectos de la plantilla",
    "Test Common": "Probar Com\xFAn",
    "Test Completionist": "Probar Finalizaci\xF3n",
    "Test Rare": "Probar Raro",
    "Test Ultra Rare": "Probar Ultra raro",
    "Test Uncommon": "Probar Poco com\xFAn",
    "Test almost there alert": "Probar aviso de casi completado",
    "Test session summary": "Probar resumen de sesi\xF3n",
    "Text": "Texto",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "La llamada a la API funcion\xF3, pero este logro no estaba en ella -- se volvi\xF3 a la cach\xE9 local.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "Fall\xF3 la propia llamada a la API web (problema de red) -- se volvi\xF3 a la cach\xE9 local.",
    "The big text on the 100% completion popup.": "El texto grande del aviso de finalizaci\xF3n al 100 %.",
    "The check itself failed: {error}": "La comprobaci\xF3n fall\xF3: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "El anillo de color que enmarca el icono, independiente del resplandor de arriba. Desactivado, el icono queda sobre un fondo oscuro liso.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "El icono local era gris (bloqueado); se us\xF3 el icono en color de la p\xE1gina p\xFAblica de logros de Steam.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "El icono local era gris (bloqueado); se esper\xF3 a que Steam lo actualizara y se us\xF3 el de color.",
    "The overall card design/style.": "El dise\xF1o/estilo general de la tarjeta.",
    "The popup for unlocking every achievement in a game.": "El aviso por desbloquear todos los logros de un juego.",
    "The probe script is missing -- try reinstalling the plugin.": "Falta el script de sondeo -- prueba a reinstalar el plugin.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "El anillo luminoso pulsante normalmente solo se reproduce en desbloqueos raros -- activa esto para que tambi\xE9n salga en los normales. (La cinta de la esquina y los destellos siguen siendo solo para raros, porque significan espec\xEDficamente \xABeste es raro\xBB.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "La forma sencilla: cada plantilla usa su propia paleta (por ejemplo verde Xbox, azul PlayStation, azul Steam). Mientras est\xE9 activado, todas las opciones de color de abajo aparecen atenuadas y se ignoran.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "El resplandor suave alrededor del icono y el anillo luminoso pulsante (logros raros, o tambi\xE9n los normales si se activa abajo).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "El aviso especial por desbloquear todos los logros de un juego, con el nombre del juego en ejecuci\xF3n.",
    "This game doesn't have any Steam achievements.": "Este juego no tiene logros de Steam.",
    "Timed out talking to Steam. Try refreshing.": "Se agot\xF3 el tiempo al comunicarse con Steam. Prueba a actualizar.",
    "Title font size": "Tama\xF1o de fuente del t\xEDtulo",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Los iconos de los avisos normalmente vienen de la cach\xE9 local de Steam, que a veces puede mostrar el icono equivocado (en gris/bloqueado). A\xF1adir una clave gratuita de la API web de Steam hace que Finally Achievement Plugin obtenga siempre el icono a todo color garantizado directamente de Steam. Consigue una en steamcommunity.com/dev/apikey",
    "Top left": "Arriba a la izquierda",
    "Top middle": "Arriba en el centro",
    "Top right": "Arriba a la derecha",
    "Top right (descriptions can use 2 lines)": "Arriba a la derecha (las descripciones pueden usar 2 l\xEDneas)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "Arriba a la derecha da a la descripci\xF3n todo el ancho: las descripciones cortas no terminan en ... y las largas pueden usar dos l\xEDneas.",
    "Tracker position": "Posici\xF3n del seguimiento",
    "Tracker size": "Tama\xF1o del seguimiento",
    "Tracker template": "Plantilla del seguimiento",
    "Tracking": "Siguiendo",
    "Trophy": "Trofeo",
    "Type part of a name or description.": "Escribe parte del nombre o de la descripci\xF3n.",
    "ULTRA RARE ACHIEVEMENT": "LOGRO ULTRA RARO",
    "ULTRA RARE TROPHY": "TROFEO ULTRA RARO",
    "ULTRA RARE UNLOCK!": "\xA1DESBLOQUEO ULTRA RARO!",
    "UNCOMMON ACHIEVEMENT": "LOGRO POCO COM\xDAN",
    "UNCOMMON TROPHY": "TROFEO POCO COM\xDAN",
    "UNCOMMON UNLOCK!": "\xA1DESBLOQUEO POCO COM\xDAN!",
    "UNLOCKED": "DESBLOQUEADO",
    "UNLOCKED!": "\xA1DESBLOQUEADO!",
    "Ultra Rare Achievement": "Logro ultra raro",
    "Ultra rare achievement": "Logro ultra raro",
    "Ultra rare sound": "Sonido Ultra raro",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "Ultra raro \u2264 {ultra} %, Raro \u2264 {rare} %, Poco com\xFAn \u2264 {uncommon} %, lo dem\xE1s es com\xFAn (sin etiqueta de nivel). Los l\xEDmites se mantienen ordenados autom\xE1ticamente.",
    "Ultra rare: this % or lower": "Ultra raro: este % o menos",
    "Uncommon Achievement": "Logro poco com\xFAn",
    "Uncommon achievement": "Logro poco com\xFAn",
    "Uncommon sound": "Sonido Poco com\xFAn",
    "Uncommon: this % or lower": "Poco com\xFAn: este % o menos",
    "Unlock percentage size": "Tama\xF1o del porcentaje de desbloqueo",
    "Unlocked": "Desbloqueado",
    "Unlocked first": "Desbloqueados primero",
    "Use each template's own colors": "Usar los colores propios de cada plantilla",
    "Use the running game for tests": "Usar el juego en ejecuci\xF3n para las pruebas",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "Se us\xF3 el icono en color de los datos locales de logros de Steam (no hace falta clave de API).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "Se us\xF3 el icono en color garantizado de la API web de Steam (coincidencia sin distinguir may\xFAsculas).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "Se us\xF3 el icono en color garantizado de la API web de Steam.",
    "Vertical (default)": "Vertical (predeterminado)",
    "Volume": "Volumen",
    "Waiting for live data...": "Esperando datos en directo...",
    "Watcher Status": "Estado del vigilante",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "Si est\xE1 activado, todos los ajustes de abajo se aplican solo a este juego y se guardan para la pr\xF3xima vez. Empieza como una copia de tus ajustes actuales. Al desactivarlo se conserva lo guardado.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "Al cerrar un juego, muestra cu\xE1ntos logros desbloqueaste mientras jugabas, por ejemplo 3 desbloqueados, 1 raro.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Al desbloquear el \xFAltimo logro de cualquier juego, muestra un aviso esmeralda especial de finalizaci\xF3n despu\xE9s del aviso de ese logro.",
    "Where the banner appears on screen.": "D\xF3nde aparece el banner en la pantalla.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Con qu\xE9 plantilla de aviso se dibuja el seguimiento. Prueba Game Art Blur para poner la imagen del juego detr\xE1s.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "Mientras hay un juego en ejecuci\xF3n, las pruebas muestran un logro aleatorio suyo (incluso bloqueado) con su icono real y la imagen del juego. Las pruebas nunca cuentan como desbloqueos. Sin juego en ejecuci\xF3n, o si est\xE1 desactivado, las pruebas usan un ejemplo.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "Tus propios sonidos: coloca archivos .wav, .flac, .ogg o .mp3 (10 MB o menos, cortos) en {folder} y pulsa Actualizar. Aparecen con \xAB(tuyo)\xBB tras su nombre, y actualizar el plugin nunca los borra. Usa los botones de prueba de abajo para o\xEDr cada uno.",
    "[ACHIEVEMENT]": "[LOGRO]",
    "[RARE UNLOCK]": "[DESBLOQUEO RARO]",
    "[ULTRA RARE UNLOCK]": "[DESBLOQUEO ULTRA RARO]",
    "[UNCOMMON UNLOCK]": "[DESBLOQUEO POCO COM\xDAN]",
    "never": "nunca",
    "the Finally Achievement Plugin settings folder, sounds": "la carpeta de ajustes de Finally Achievement Plugin, subcarpeta sounds",
    "{count} unlocked": "{count} desbloqueados",
    "{count} unlocked, {rare} rare": "{count} desbloqueados, {rare} raros",
    "{percent}% of players": "{percent} % de los jugadores",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} desbloqueados",
    "\u2713 Unlocked": "\u2713 Desbloqueado"
  },
  "fr": {
    "(yours)": "(\xE0 vous)",
    "0% hides the banner; 50% is the default size.": "0 % masque la banni\xE8re ; 50 % est la taille par d\xE9faut.",
    "100% COMPLETE": "100 % TERMIN\xC9",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (TV Full HD)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (\xE9cran de la Legion Go)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (TV 4K)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 est l'aspect par d\xE9faut ; 0 revient \xE0 d\xE9sactiver, 100 le double.",
    "50% is the default volume; 0% is silent.": "50 % est le volume par d\xE9faut ; 0 % est silencieux.",
    "<0.1% of players": "<0,1 % des joueurs",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Un d\xE9blocage commun (au-dessus du seuil Peu commun) : pas d'\xE9tiquette de niveau.",
    "A rare unlock: gold look, rare sound and glow.": "Un d\xE9blocage rare : aspect dor\xE9, son rare et lueur.",
    "ACHIEVEMENT UNLOCKED": "SUCC\xC8S D\xC9BLOQU\xC9",
    "Achievement": "Succ\xE8s",
    "Achievement Icon Accuracy": "Exactitude des ic\xF4nes de succ\xE8s",
    "Achievement Tracker": "Suivi de succ\xE8s",
    "Achievement Unlocked": "Succ\xE8s d\xE9bloqu\xE9",
    "Achievements": "Succ\xE8s",
    "Achievements & tracker": "Succ\xE8s et suivi",
    "Advanced": "Avanc\xE9",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Apr\xE8s un d\xE9blocage, affiche une notification du type \xAB Plus que 2 succ\xE8s \xBB quand un jeu approche des 100 %.",
    "Alert when this many are left": "Alerte quand il en reste autant",
    "Almost there alert": "Alerte \xAB presque fini \xBB",
    "Alphabetical": "Alphab\xE9tique",
    "An ultra rare unlock: extra sparkles and a longer shine.": "Un d\xE9blocage ultra rare : \xE9tincelles suppl\xE9mentaires et \xE9clat plus long.",
    "An uncommon unlock: tier label only.": "Un d\xE9blocage peu commun : \xE9tiquette de niveau uniquement.",
    "App {id}": "App {id}",
    "Appearance": "Apparence",
    "Auto (Steam language)": "Auto (langue de Steam)",
    "Auto (detect)": "Auto (d\xE9tecter)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Auto convient \xE0 l'\xE9cran du Deck. Sur une TV, si les notifications s'affichent au mauvais endroit, choisissez la r\xE9solution de la TV et v\xE9rifiez avec le test du cadre ci-dessous.",
    "Bottom left": "En bas \xE0 gauche",
    "Bottom middle": "En bas au centre",
    "Bottom right": "En bas \xE0 droite",
    "Bottom right (default)": "En bas \xE0 droite (par d\xE9faut)",
    "Checking...": "V\xE9rification...",
    "Clear history": "Effacer l'historique",
    "Clear search": "Effacer la recherche",
    "Colors": "Couleurs",
    "Colors & style": "Couleurs et style",
    "Common sound": "Son Commun",
    "Completion popup at 100%": "Notification de compl\xE9tion \xE0 100 %",
    "Completion popup name": "Nom de la notification de compl\xE9tion",
    "Completionist": "Compl\xE9tiste",
    "Completionist sound": "Son de compl\xE9tion",
    "Could not save the card: {error}": "Impossible d'enregistrer la carte : {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "Impossible de confirmer que cette ic\xF4ne est celle en couleur, et rien de mieux n'a \xE9t\xE9 trouv\xE9.",
    "Couldn't identify the game/achievement for this unlock.": "Impossible d'identifier le jeu ou le succ\xE8s pour ce d\xE9blocage.",
    "Couldn't save that key.": "Impossible d'enregistrer cette cl\xE9.",
    "Couldn't start the achievement probe.": "Impossible de d\xE9marrer la sonde de succ\xE8s.",
    "Crowned": "Couronn\xE9",
    "Currently Playing": "Jeu en cours",
    "Custom settings for this game": "R\xE9glages personnalis\xE9s pour ce jeu",
    "Custom settings for {name}": "R\xE9glages personnalis\xE9s pour {name}",
    "Default (game icon, else badge)": "Par d\xE9faut (ic\xF4ne du jeu, sinon badge)",
    "Description font size": "Taille de police de la description",
    "Direction of the card's background gradient, or a flat solid color.": "Direction du d\xE9grad\xE9 de fond de la carte, ou une couleur unie.",
    "Editing settings for all games.": "Modification des r\xE9glages de tous les jeux.",
    "Editing settings for {name} only.": "Modification des r\xE9glages de {name} uniquement.",
    "Everyday unlocks (above the Uncommon cutoff).": "D\xE9blocages courants (au-dessus du seuil Peu commun).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Petits plus sur certains mod\xE8les : texte qui s'\xE9crit, fonds anim\xE9s, glitchs, vis, en-t\xEAte avec le nom du jeu et plus. D\xE9sactivez pour un rendu sobre.",
    "Font size of the achievement name.": "Taille de police du nom du succ\xE8s.",
    "Font size of the small eyebrow label above the title.": "Taille de police de la petite \xE9tiquette au-dessus du titre.",
    "Font size of the subtitle/description line.": "Taille de police de la ligne de sous-titre/description.",
    "Game Settings": "R\xE9glages du jeu",
    "Game icon": "Ic\xF4ne du jeu",
    "Glow": "Lueur",
    "Glow for normal achievements": "Lueur pour les succ\xE8s normaux",
    "Glow intensity": "Intensit\xE9 de la lueur",
    "Got an unexpected response from Steam.": "R\xE9ponse inattendue de Steam.",
    "Gradient direction": "Direction du d\xE9grad\xE9",
    "Gradient from game artwork colors": "D\xE9grad\xE9 issu des couleurs de l'illustration du jeu",
    "Gradient from icon colors": "D\xE9grad\xE9 issu des couleurs de l'ic\xF4ne",
    "History & sharing": "Historique et partage",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "\xC9tendue des anneaux lumineux. 50 est l'aspect par d\xE9faut ; 0 les masque, 100 les double.",
    "How long the toast stays on screen before it slides away.": "Dur\xE9e d'affichage de la notification avant qu'elle ne disparaisse.",
    "Icon frame ring": "Anneau autour de l'ic\xF4ne",
    "Icon glow": "Lueur de l'ic\xF4ne",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "Si vous entendez le son mais qu'aucune notification n'appara\xEEt (p. ex. sur une autre console portable), lancez cette v\xE9rification. Elle teste les paquets Python, les biblioth\xE8ques graphiques, l'affichage et la cr\xE9ation de fen\xEAtre dont la notification a besoin, et vous dit ce qui manque.",
    "In progress": "En cours",
    "Key saved (ending in {tail})": "Cl\xE9 enregistr\xE9e (se terminant par {tail})",
    "Label font size": "Taille de police de l'\xE9tiquette",
    "Language": "Langue",
    "Last unlock's icon:": "Ic\xF4ne du dernier d\xE9blocage :",
    "Left to right": "De gauche \xE0 droite",
    "Legendary Achievement unlocked": "Succ\xE8s l\xE9gendaire d\xE9bloqu\xE9",
    "Loading achievements...": "Chargement des succ\xE8s...",
    "Loading...": "Chargement...",
    "Making card...": "Cr\xE9ation de la carte...",
    "Manual common popup test": "Test manuel de notification commune",
    "Manual rare popup test": "Test manuel de notification rare",
    "Manual ultra rare popup test": "Test manuel de notification ultra rare",
    "Manual uncommon popup test": "Test manuel de notification peu commune",
    "Manually refresh backend status.": "Actualiser manuellement l'\xE9tat du backend.",
    "Milestone popups": "Popups de jalons",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "Nomme chaque d\xE9blocage selon le peu de joueurs qui l'ont (Peu commun, Rare, Ultra rare) dans l'\xE9tiquette de la notification. L'ultra rare ajoute des \xE9tincelles et un \xE9clat plus long. Le rare garde l'aspect dor\xE9 et le son.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "N\xE9cessite les niveaux de raret\xE9 activ\xE9s ; sinon les sons communs sont jou\xE9s.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "N\xE9cessite les niveaux de raret\xE9 activ\xE9s ; sinon le son rare est jou\xE9.",
    "New achievement": "Nouveau succ\xE8s",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "Aucune cl\xE9 d'API d\xE9finie -- seul le cache local est utilis\xE9 (l'ic\xF4ne en couleur n'est pas garantie).",
    "No API key set -- using the local cache only.": "Aucune cl\xE9 d'API d\xE9finie -- seul le cache local est utilis\xE9.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "Aucune police chinoise n'a \xE9t\xE9 trouv\xE9e : le texte chinois des notifications peut s'afficher sous forme de cases vides. Copiez un fichier de police (.ttf, .otf ou .ttc, p. ex. Noto Sans SC) dans {folder} et lancez une notification de test.",
    "No achievements found for this game.": "Aucun succ\xE8s trouv\xE9 pour ce jeu.",
    "No achievements match your search.": "Aucun succ\xE8s ne correspond \xE0 votre recherche.",
    "No game is currently running.": "Aucun jeu n'est en cours d'ex\xE9cution.",
    "No game running": "Aucun jeu lanc\xE9",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "Aucun d\xE9blocage enregistr\xE9 pour l'instant. Les succ\xE8s que vous d\xE9bloquerez \xE0 partir de maintenant appara\xEEtront ici.",
    "Nothing pinned right now.": "Rien d'\xE9pingl\xE9 pour le moment.",
    "Nothing unlocked yet this session.": "Rien n'a encore \xE9t\xE9 d\xE9bloqu\xE9 durant cette session.",
    "Only 1 achievement left": "Plus qu'un succ\xE8s",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Seule l'ic\xF4ne grise (verrouill\xE9e) \xE9tait disponible cette fois -- aucune en couleur n'a pu \xEAtre trouv\xE9e.",
    "Only {count} achievements left": "Plus que {count} succ\xE8s",
    "Percentage badge position": "Position du badge de pourcentage",
    "Placeholder icon": "Ic\xF4ne de remplacement",
    "Popup": "Notification",
    "Popup Not Showing?": "La notification ne s'affiche pas ?",
    "Popup Tests": "Tests de notification",
    "Popup duration": "Dur\xE9e de la notification",
    "Popup position": "Position de la notification",
    "Popup screen size": "Taille d'\xE9cran des notifications",
    "Popup size": "Taille de la notification",
    "Popup template": "Mod\xE8le de notification",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Tire le d\xE9grad\xE9 de fond de la carte des couleurs de l'ic\xF4ne du succ\xE8s plut\xF4t que des couleurs fixes ci-dessous. Fonctionne avec tous les mod\xE8les sauf Paper Light. Revient aux couleurs fixes si l'ic\xF4ne n'a pas de couleurs dominantes nettes (ou n'existe pas).",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Tire le d\xE9grad\xE9 de l'illustration du jeu, de sorte que toutes les notifications d'un jeu partagent une m\xEAme palette. L'activer d\xE9sactive l'option d'ic\xF4ne ci-dessus (l'une ou l'autre). Revient aux couleurs de l'ic\xF4ne si l'illustration est illisible.",
    "RARE ACHIEVEMENT": "SUCC\xC8S RARE",
    "RARE ACHIEVEMENT UNLOCKED": "SUCC\xC8S RARE D\xC9BLOQU\xC9",
    "RARE TROPHY UNLOCKED": "TROPH\xC9E RARE D\xC9BLOQU\xC9",
    "RARE UNLOCK!": "D\xC9BLOCAGE RARE !",
    "Rare Achievement Unlocked": "Succ\xE8s rare d\xE9bloqu\xE9",
    "Rare achievement": "Succ\xE8s rare",
    "Rare sound": "Son Rare",
    "Rare unlocks.": "D\xE9blocages rares.",
    "Rare: this % or lower": "Rare : ce % ou moins",
    "Rarity (rarest first)": "Raret\xE9 (les plus rares d'abord)",
    "Rarity Tiers": "Niveaux de raret\xE9",
    "Rarity tiers": "Niveaux de raret\xE9",
    "Recent Unlocks": "Derniers d\xE9blocages",
    "Refresh": "Actualiser",
    "Refresh sound list": "Actualiser la liste des sons",
    "Refreshing...": "Actualisation...",
    "Remove key": "Supprimer la cl\xE9",
    "Removed.": "Supprim\xE9e.",
    "Reset this game to the global settings": "R\xE9initialiser ce jeu aux r\xE9glages globaux",
    "Right to left": "De droite \xE0 gauche",
    "Ring size": "Taille de l'anneau",
    "Run overlay check": "Lancer la v\xE9rification de l'overlay",
    "Same as popups": "Comme les notifications",
    "Save key": "Enregistrer la cl\xE9",
    "Saved to {path}": "Enregistr\xE9e dans {path}",
    "Saved.": "Enregistr\xE9.",
    "Saving...": "Enregistrement...",
    "Search": "Rechercher",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "S\xE9lectionnez un succ\xE8s ci-dessus (appuyez sur le bouton d'action) pour l'\xE9pingler en petit suivi \xE0 l'\xE9cran pendant que vous jouez. Le suivi reprend votre mod\xE8le de notification et vos couleurs, et s'efface pendant qu'une notification s'affiche. La progression chiffr\xE9e n'appara\xEEt que pour les succ\xE8s li\xE9s par le jeu \xE0 une statistique suivie ; les autres sont verrouill\xE9s ou d\xE9bloqu\xE9s.",
    "Select an unlock to make a shareable image card.": "S\xE9lectionnez un d\xE9blocage pour cr\xE9er une carte image \xE0 partager.",
    "Session summary": "R\xE9sum\xE9 de session",
    "Share card": "Carte \xE0 partager",
    "Show": "Afficher",
    "Show more": "Afficher plus",
    "Show screen frame": "Afficher le cadre d'\xE9cran",
    "Show unlock percentage": "Afficher le pourcentage de d\xE9blocage",
    "Showing {shown} of {total}": "{shown} sur {total} affich\xE9s",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Affich\xE9e quand un succ\xE8s n'a pas encore d'ic\xF4ne (et comme ic\xF4ne de d\xE9part sur Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Affiche un cadre rouge (bloc jaune = en haut \xE0 gauche) pendant quelques secondes. Il doit \xE9pouser exactement les bords de l'\xE9cran. Sinon, choisissez une autre taille ci-dessus.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Affiche le pourcentage de joueurs ayant le succ\xE8s, p. ex. 4,7 % des joueurs.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "Taille du petit badge \xAB 4,7 % des joueurs \xBB. 100 % est la valeur par d\xE9faut.",
    "Solid color": "Couleur unie",
    "Something went wrong.": "Une erreur s'est produite.",
    "Sort by": "Trier par",
    "Sound": "Son",
    "Sound & tests": "Son et tests",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Lancez un jeu, puis ouvrez ce panneau pour lui donner ses propres r\xE9glages. Pour l'instant, les r\xE9glages ci-dessous s'appliquent \xE0 tous les jeux.",
    "Steam Web API key": "Cl\xE9 d'API Web Steam",
    "Steam didn't return any achievement data for this game.": "Steam n'a renvoy\xE9 aucune donn\xE9e de succ\xE8s pour ce jeu.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam n'a fourni qu'une ic\xF4ne grise pour ce succ\xE8s -- il n'y en a pas en couleur dans ses donn\xE9es.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "L'API de Steam a renvoy\xE9 une r\xE9ponse vide ou inutilisable -- retour au cache local. Si cela se r\xE9p\xE8te pour le m\xEAme jeu, il peut s'agir d'un probl\xE8me temporaire c\xF4t\xE9 Steam.",
    "Steam's achievement library wasn't found on this system.": "La biblioth\xE8que de succ\xE8s de Steam est introuvable sur ce syst\xE8me.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "L'ic\xF4ne de Steam est revenue en gris, l'autre ic\xF4ne de ses donn\xE9es (celle en couleur) a donc \xE9t\xE9 utilis\xE9e.",
    "Stop tracking": "Arr\xEAter le suivi",
    "TRACKING": "SUIVI EN COURS",
    "TROPHY UNLOCKED": "TROPH\xC9E D\xC9BLOQU\xC9",
    "Template effects": "Effets du mod\xE8le",
    "Test Common": "Tester Commun",
    "Test Completionist": "Tester Compl\xE9tion",
    "Test Rare": "Tester Rare",
    "Test Ultra Rare": "Tester Ultra rare",
    "Test Uncommon": "Tester Peu commun",
    "Test almost there alert": "Tester l'alerte \xAB presque fini \xBB",
    "Test session summary": "Tester le r\xE9sum\xE9 de session",
    "Text": "Texte",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "L'appel \xE0 l'API a fonctionn\xE9, mais ce succ\xE8s n'y figurait pas -- retour au cache local.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "L'appel \xE0 l'API Web a lui-m\xEAme \xE9chou\xE9 (probl\xE8me r\xE9seau) -- retour au cache local.",
    "The big text on the 100% completion popup.": "Le grand texte de la notification de compl\xE9tion \xE0 100 %.",
    "The check itself failed: {error}": "La v\xE9rification elle-m\xEAme a \xE9chou\xE9 : {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "L'anneau color\xE9 qui encadre l'ic\xF4ne, ind\xE9pendant de la lueur ci-dessus. D\xE9sactiv\xE9, l'ic\xF4ne repose sur un simple fond sombre.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "L'ic\xF4ne locale \xE9tait grise (verrouill\xE9e) ; l'ic\xF4ne en couleur de la page publique des succ\xE8s de Steam a \xE9t\xE9 utilis\xE9e.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "L'ic\xF4ne locale \xE9tait grise (verrouill\xE9e) ; on a attendu que Steam la mette \xE0 jour et utilis\xE9 celle en couleur.",
    "The overall card design/style.": "Le design g\xE9n\xE9ral de la carte.",
    "The popup for unlocking every achievement in a game.": "La notification pour avoir d\xE9bloqu\xE9 tous les succ\xE8s d'un jeu.",
    "The probe script is missing -- try reinstalling the plugin.": "Le script de sonde est absent -- essayez de r\xE9installer le plugin.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "L'anneau lumineux pulsant ne se joue normalement que pour les d\xE9blocages rares -- activez ceci pour l'avoir aussi sur les normaux. (Le ruban d'angle et les \xE9tincelles restent r\xE9serv\xE9s aux rares, car ils signifient pr\xE9cis\xE9ment \xAB celui-ci est rare \xBB.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "La m\xE9thode simple : chaque mod\xE8le utilise sa propre palette (p. ex. vert Xbox, bleu PlayStation, bleu Steam). Tant que c'est activ\xE9, toutes les options de couleur ci-dessous sont gris\xE9es et ignor\xE9es.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "La lueur douce autour de l'ic\xF4ne et l'anneau lumineux pulsant (succ\xE8s rares, ou aussi les normaux si activ\xE9 ci-dessous).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "La notification sp\xE9ciale pour avoir d\xE9bloqu\xE9 tous les succ\xE8s d'un jeu, avec le nom du jeu en cours.",
    "This game doesn't have any Steam achievements.": "Ce jeu n'a aucun succ\xE8s Steam.",
    "Timed out talking to Steam. Try refreshing.": "D\xE9lai d\xE9pass\xE9 en communiquant avec Steam. Essayez d'actualiser.",
    "Title font size": "Taille de police du titre",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Les ic\xF4nes des notifications viennent normalement du cache local de Steam, qui peut parfois afficher la mauvaise ic\xF4ne (en gris/verrouill\xE9e). Ajouter une cl\xE9 d'API Web Steam gratuite permet \xE0 Finally Achievement Plugin de r\xE9cup\xE9rer \xE0 chaque fois l'ic\xF4ne en couleur garantie exacte directement depuis Steam. Obtenez-en une sur steamcommunity.com/dev/apikey",
    "Top left": "En haut \xE0 gauche",
    "Top middle": "En haut au centre",
    "Top right": "En haut \xE0 droite",
    "Top right (descriptions can use 2 lines)": "En haut \xE0 droite (les descriptions peuvent tenir sur 2 lignes)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "En haut \xE0 droite, la description dispose de toute la largeur : les descriptions courtes ne finissent pas par ... et les longues peuvent tenir sur deux lignes.",
    "Tracker position": "Position du suivi",
    "Tracker size": "Taille du suivi",
    "Tracker template": "Mod\xE8le du suivi",
    "Tracking": "Suivi en cours",
    "Trophy": "Troph\xE9e",
    "Type part of a name or description.": "Saisissez une partie du nom ou de la description.",
    "ULTRA RARE ACHIEVEMENT": "SUCC\xC8S ULTRA RARE",
    "ULTRA RARE TROPHY": "TROPH\xC9E ULTRA RARE",
    "ULTRA RARE UNLOCK!": "D\xC9BLOCAGE ULTRA RARE !",
    "UNCOMMON ACHIEVEMENT": "SUCC\xC8S PEU COMMUN",
    "UNCOMMON TROPHY": "TROPH\xC9E PEU COMMUN",
    "UNCOMMON UNLOCK!": "D\xC9BLOCAGE PEU COMMUN !",
    "UNLOCKED": "D\xC9BLOQU\xC9",
    "UNLOCKED!": "D\xC9BLOQU\xC9 !",
    "Ultra Rare Achievement": "Succ\xE8s ultra rare",
    "Ultra rare achievement": "Succ\xE8s ultra rare",
    "Ultra rare sound": "Son Ultra rare",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "Ultra rare \u2264 {ultra} %, Rare \u2264 {rare} %, Peu commun \u2264 {uncommon} %, tout le reste est commun (pas d'\xE9tiquette). Les seuils restent automatiquement dans l'ordre.",
    "Ultra rare: this % or lower": "Ultra rare : ce % ou moins",
    "Uncommon Achievement": "Succ\xE8s peu commun",
    "Uncommon achievement": "Succ\xE8s peu commun",
    "Uncommon sound": "Son Peu commun",
    "Uncommon: this % or lower": "Peu commun : ce % ou moins",
    "Unlock percentage size": "Taille du pourcentage de d\xE9blocage",
    "Unlocked": "D\xE9bloqu\xE9",
    "Unlocked first": "D\xE9bloqu\xE9s d'abord",
    "Use each template's own colors": "Utiliser les couleurs propres \xE0 chaque mod\xE8le",
    "Use the running game for tests": "Utiliser le jeu en cours pour les tests",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "L'ic\xF4ne en couleur issue des donn\xE9es locales de succ\xE8s de Steam a \xE9t\xE9 utilis\xE9e (aucune cl\xE9 d'API n\xE9cessaire).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "L'ic\xF4ne en couleur garantie exacte de l'API Web de Steam a \xE9t\xE9 utilis\xE9e (correspondance insensible \xE0 la casse).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "L'ic\xF4ne en couleur garantie exacte de l'API Web de Steam a \xE9t\xE9 utilis\xE9e.",
    "Vertical (default)": "Vertical (par d\xE9faut)",
    "Volume": "Volume",
    "Waiting for live data...": "En attente des donn\xE9es en direct...",
    "Watcher Status": "\xC9tat du surveillant",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "Activ\xE9, chaque r\xE9glage ci-dessous ne s'applique qu'\xE0 ce jeu et est conserv\xE9 pour la prochaine fois. Il d\xE9marre comme une copie de vos r\xE9glages actuels. Le d\xE9sactiver conserve ce que vous avez enregistr\xE9.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "\xC0 la fermeture d'un jeu, affiche le nombre de succ\xE8s d\xE9bloqu\xE9s pendant la partie, par exemple 3 d\xE9bloqu\xE9s, 1 rare.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Quand vous d\xE9bloquez le tout dernier succ\xE8s d'un jeu, une notification de compl\xE9tion \xE9meraude sp\xE9ciale s'affiche apr\xE8s celle du succ\xE8s.",
    "Where the banner appears on screen.": "L'endroit de l'\xE9cran o\xF9 la banni\xE8re appara\xEEt.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Le mod\xE8le de notification utilis\xE9 pour le suivi. Essayez Game Art Blur pour placer l'illustration du jeu derri\xE8re.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "Quand un jeu est lanc\xE9, les tests affichent un succ\xE8s au hasard de ce jeu (m\xEAme verrouill\xE9) avec sa vraie ic\xF4ne et l'illustration du jeu. Les tests ne comptent jamais comme des d\xE9blocages. Sans jeu lanc\xE9, ou si c'est d\xE9sactiv\xE9, les tests utilisent un exemple.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "Vos propres sons : placez des fichiers .wav, .flac, .ogg ou .mp3 (10 Mo maximum, courts) dans {folder}, puis appuyez sur Actualiser. Ils apparaissent avec \xAB (\xE0 vous) \xBB apr\xE8s leur nom, et la mise \xE0 jour du plugin ne les supprime jamais. Utilisez les boutons de test ci-dessous pour les \xE9couter.",
    "[ACHIEVEMENT]": "[SUCC\xC8S]",
    "[RARE UNLOCK]": "[D\xC9BLOCAGE RARE]",
    "[ULTRA RARE UNLOCK]": "[D\xC9BLOCAGE ULTRA RARE]",
    "[UNCOMMON UNLOCK]": "[D\xC9BLOCAGE PEU COMMUN]",
    "never": "jamais",
    "the Finally Achievement Plugin settings folder, sounds": "le dossier de r\xE9glages de Finally Achievement Plugin, sous-dossier sounds",
    "{count} unlocked": "{count} d\xE9bloqu\xE9s",
    "{count} unlocked, {rare} rare": "{count} d\xE9bloqu\xE9s, dont {rare} rare(s)",
    "{percent}% of players": "{percent} % des joueurs",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} d\xE9bloqu\xE9s",
    "\u2713 Unlocked": "\u2713 D\xE9bloqu\xE9"
  },
  "pl": {
    "(yours)": "(Tw\xF3j)",
    "0% hides the banner; 50% is the default size.": "0% ukrywa baner; 50% to rozmiar domy\u015Blny.",
    "100% COMPLETE": "UKO\u0143CZONO W 100%",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (telewizor Full HD)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (ekran Legion Go)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (telewizor 4K)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 to wygl\u0105d domy\u015Blny; 0 to praktycznie wy\u0142\u0105czone, 100 podwaja efekt.",
    "50% is the default volume; 0% is silent.": "50% to g\u0142o\u015Bno\u015B\u0107 domy\u015Blna; 0% to cisza.",
    "<0.1% of players": "<0,1% graczy",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Pospolite odblokowanie (powy\u017Cej progu Niepospolite): bez etykiety poziomu.",
    "A rare unlock: gold look, rare sound and glow.": "Rzadkie odblokowanie: z\u0142oty wygl\u0105d, rzadki d\u017Awi\u0119k i po\u015Bwiata.",
    "ACHIEVEMENT UNLOCKED": "ODBLOKOWANO OSI\u0104GNI\u0118CIE",
    "Achievement": "Osi\u0105gni\u0119cie",
    "Achievement Icon Accuracy": "Dok\u0142adno\u015B\u0107 ikon osi\u0105gni\u0119\u0107",
    "Achievement Tracker": "\u015Aledzenie osi\u0105gni\u0119cia",
    "Achievement Unlocked": "Odblokowano osi\u0105gni\u0119cie",
    "Achievements": "Osi\u0105gni\u0119cia",
    "Achievements & tracker": "Osi\u0105gni\u0119cia i \u015Bledzenie",
    "Advanced": "Zaawansowane",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Po odblokowaniu pokazuje powiadomienie, np. Zosta\u0142y tylko 2 osi\u0105gni\u0119cia, gdy gra jest bliska 100%.",
    "Alert when this many are left": "Alert, gdy zostanie tyle",
    "Almost there alert": "Alert \u201Eprawie gotowe\u201D",
    "Alphabetical": "Alfabetycznie",
    "An ultra rare unlock: extra sparkles and a longer shine.": "Ultrarzadkie odblokowanie: dodatkowe iskry i d\u0142u\u017Cszy blask.",
    "An uncommon unlock: tier label only.": "Niepospolite odblokowanie: tylko etykieta poziomu.",
    "App {id}": "Aplikacja {id}",
    "Appearance": "Wygl\u0105d",
    "Auto (Steam language)": "Auto (j\u0119zyk Steam)",
    "Auto (detect)": "Auto (wykryj)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Opcja Auto jest w\u0142a\u015Bciwa na ekranie samego Decka. Na telewizorze, je\u015Bli powiadomienia pojawiaj\u0105 si\u0119 w z\u0142ym miejscu, wybierz rozdzielczo\u015B\u0107 telewizora i sprawd\u017A j\u0105 testem ramki poni\u017Cej.",
    "Bottom left": "Lewy dolny r\xF3g",
    "Bottom middle": "D\xF3\u0142 po\u015Brodku",
    "Bottom right": "Prawy dolny r\xF3g",
    "Bottom right (default)": "Prawy dolny r\xF3g (domy\u015Blnie)",
    "Checking...": "Sprawdzanie...",
    "Clear history": "Wyczy\u015B\u0107 histori\u0119",
    "Clear search": "Wyczy\u015B\u0107 wyszukiwanie",
    "Colors": "Kolory",
    "Colors & style": "Kolory i styl",
    "Common sound": "D\u017Awi\u0119k pospolitego",
    "Completion popup at 100%": "Powiadomienie o uko\u0144czeniu na 100%",
    "Completion popup name": "Nazwa powiadomienia o uko\u0144czeniu",
    "Completionist": "Perfekcjonista",
    "Completionist sound": "D\u017Awi\u0119k uko\u0144czenia gry",
    "Could not save the card: {error}": "Nie uda\u0142o si\u0119 zapisa\u0107 karty: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "Nie uda\u0142o si\u0119 potwierdzi\u0107, \u017Ce to kolorowa ikona, i nie znaleziono nic lepszego.",
    "Couldn't identify the game/achievement for this unlock.": "Nie uda\u0142o si\u0119 ustali\u0107 gry/osi\u0105gni\u0119cia dla tego odblokowania.",
    "Couldn't save that key.": "Nie uda\u0142o si\u0119 zapisa\u0107 tego klucza.",
    "Couldn't start the achievement probe.": "Nie uda\u0142o si\u0119 uruchomi\u0107 sondy osi\u0105gni\u0119\u0107.",
    "Crowned": "Ukoronowany",
    "Currently Playing": "Aktualnie w grze",
    "Custom settings for this game": "W\u0142asne ustawienia dla tej gry",
    "Custom settings for {name}": "W\u0142asne ustawienia dla: {name}",
    "Default (game icon, else badge)": "Domy\u015Blna (ikona gry, a w razie braku odznaka)",
    "Description font size": "Rozmiar czcionki opisu",
    "Direction of the card's background gradient, or a flat solid color.": "Kierunek gradientu t\u0142a karty lub jednolity kolor.",
    "Editing settings for all games.": "Edytujesz ustawienia dla wszystkich gier.",
    "Editing settings for {name} only.": "Edytujesz ustawienia tylko dla: {name}.",
    "Everyday unlocks (above the Uncommon cutoff).": "Zwyk\u0142e odblokowania (powy\u017Cej progu Niepospolite).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Dodatkowe akcenty w niekt\xF3rych szablonach: pisanie tekstu, animowane t\u0142a, zak\u0142\xF3cenia, \u015Bruby, nag\u0142\xF3wek z nazw\u0105 gry i inne. Wy\u0142\u0105cz, aby uzyska\u0107 prosty wygl\u0105d.",
    "Font size of the achievement name.": "Rozmiar czcionki nazwy osi\u0105gni\u0119cia.",
    "Font size of the small eyebrow label above the title.": "Rozmiar czcionki ma\u0142ej etykiety nad tytu\u0142em.",
    "Font size of the subtitle/description line.": "Rozmiar czcionki linii podtytu\u0142u/opisu.",
    "Game Settings": "Ustawienia gry",
    "Game icon": "Ikona gry",
    "Glow": "Po\u015Bwiata",
    "Glow for normal achievements": "Po\u015Bwiata dla zwyk\u0142ych osi\u0105gni\u0119\u0107",
    "Glow intensity": "Intensywno\u015B\u0107 po\u015Bwiaty",
    "Got an unexpected response from Steam.": "Otrzymano nieoczekiwan\u0105 odpowied\u017A od Steam.",
    "Gradient direction": "Kierunek gradientu",
    "Gradient from game artwork colors": "Gradient z kolor\xF3w grafiki gry",
    "Gradient from icon colors": "Gradient z kolor\xF3w ikony",
    "History & sharing": "Historia i udost\u0119pnianie",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "Jak daleko rozchodz\u0105 si\u0119 pier\u015Bcienie po\u015Bwiaty. 50 to wygl\u0105d domy\u015Blny; 0 je ukrywa, 100 podwaja.",
    "How long the toast stays on screen before it slides away.": "Jak d\u0142ugo powiadomienie pozostaje na ekranie, zanim zniknie.",
    "Icon frame ring": "Pier\u015Bcie\u0144 ramki ikony",
    "Icon glow": "Po\u015Bwiata ikony",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "Je\u015Bli s\u0142yszysz d\u017Awi\u0119k, ale powiadomienie si\u0119 nie pojawia (na przyk\u0142ad na innej konsoli przeno\u015Bnej), uruchom t\u0119 kontrol\u0119. Sprawdza pakiety Pythona, biblioteki graficzne, ekran i tworzenie okna potrzebne powiadomieniu i m\xF3wi, czego brakuje.",
    "In progress": "W trakcie",
    "Key saved (ending in {tail})": "Klucz zapisany (ko\u0144czy si\u0119 na {tail})",
    "Label font size": "Rozmiar czcionki etykiety",
    "Language": "J\u0119zyk",
    "Last unlock's icon:": "Ikona ostatniego odblokowania:",
    "Left to right": "Od lewej do prawej",
    "Legendary Achievement unlocked": "Odblokowano legendarne osi\u0105gni\u0119cie",
    "Loading achievements...": "Wczytywanie osi\u0105gni\u0119\u0107...",
    "Loading...": "Wczytywanie...",
    "Making card...": "Tworzenie karty...",
    "Manual common popup test": "R\u0119czny test pospolitego powiadomienia",
    "Manual rare popup test": "R\u0119czny test rzadkiego powiadomienia",
    "Manual ultra rare popup test": "R\u0119czny test ultrarzadkiego powiadomienia",
    "Manual uncommon popup test": "R\u0119czny test niepospolitego powiadomienia",
    "Manually refresh backend status.": "R\u0119cznie od\u015Bwie\u017C stan zaplecza.",
    "Milestone popups": "Powiadomienia o kamieniach milowych",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "W etykiecie powiadomienia nazywa ka\u017Cde odblokowanie wed\u0142ug tego, jak niewielu graczy je ma (Niepospolite, Rzadkie, Ultrarzadkie). Ultrarzadkie dostaje te\u017C dodatkowe iskry i d\u0142u\u017Cszy blask. Rzadkie zachowuje z\u0142oty wygl\u0105d i d\u017Awi\u0119k.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "Wymaga w\u0142\u0105czonych poziom\xF3w rzadko\u015Bci; w przeciwnym razie gra d\u017Awi\u0119k pospolitego.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "Wymaga w\u0142\u0105czonych poziom\xF3w rzadko\u015Bci; w przeciwnym razie gra d\u017Awi\u0119k rzadkiego.",
    "New achievement": "Nowe osi\u0105gni\u0119cie",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "Nie ustawiono klucza API \u2014 u\u017Cywana jest tylko lokalna pami\u0119\u0107 podr\u0119czna (nie mo\u017Cna zagwarantowa\u0107 kolorowej ikony).",
    "No API key set -- using the local cache only.": "Nie ustawiono klucza API \u2014 u\u017Cywana jest tylko lokalna pami\u0119\u0107 podr\u0119czna.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "Nie znaleziono czcionki chi\u0144skiej, wi\u0119c chi\u0144ski tekst w powiadomieniach mo\u017Ce wy\u015Bwietla\u0107 si\u0119 jako puste kwadraty. Skopiuj plik czcionki (.ttf, .otf lub .ttc, na przyk\u0142ad Noto Sans SC) do {folder} i uruchom powiadomienie testowe.",
    "No achievements found for this game.": "Nie znaleziono osi\u0105gni\u0119\u0107 dla tej gry.",
    "No achievements match your search.": "\u017Badne osi\u0105gni\u0119cie nie pasuje do wyszukiwania.",
    "No game is currently running.": "\u017Badna gra nie jest teraz uruchomiona.",
    "No game running": "Nie uruchomiono \u017Cadnej gry",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "Nie zapisano jeszcze \u017Cadnych odblokowa\u0144. Osi\u0105gni\u0119cia odblokowane od teraz pojawi\u0105 si\u0119 tutaj.",
    "Nothing pinned right now.": "Nic nie jest teraz przypi\u0119te.",
    "Nothing unlocked yet this session.": "W tej sesji nic jeszcze nie odblokowano.",
    "Only 1 achievement left": "Zosta\u0142o tylko 1 osi\u0105gni\u0119cie",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Tym razem dost\u0119pna by\u0142a tylko szara (zablokowana) ikona \u2014 nie znaleziono kolorowej.",
    "Only {count} achievements left": "Pozosta\u0142o osi\u0105gni\u0119\u0107: {count}",
    "Percentage badge position": "Pozycja odznaki z odsetkiem",
    "Placeholder icon": "Ikona zast\u0119pcza",
    "Popup": "Powiadomienie",
    "Popup Not Showing?": "Powiadomienie si\u0119 nie pokazuje?",
    "Popup Tests": "Testy powiadomie\u0144",
    "Popup duration": "Czas wy\u015Bwietlania",
    "Popup position": "Pozycja powiadomienia",
    "Popup screen size": "Rozmiar ekranu powiadomie\u0144",
    "Popup size": "Rozmiar powiadomienia",
    "Popup template": "Szablon powiadomienia",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Pobiera gradient t\u0142a karty z kolor\xF3w ikony osi\u0105gni\u0119cia zamiast ze sta\u0142ych kolor\xF3w poni\u017Cej. Dzia\u0142a w ka\u017Cdym szablonie poza Paper Light. Wraca do sta\u0142ych kolor\xF3w, je\u015Bli ikona nie ma wyra\u017Anych dominuj\u0105cych kolor\xF3w (lub nie ma ikony).",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Pobiera gradient z grafiki samej gry, dzi\u0119ki czemu wszystkie powiadomienia w danej grze maj\u0105 wsp\xF3ln\u0105 palet\u0119. W\u0142\u0105czenie wy\u0142\u0105cza opcj\u0119 ikony powy\u017Cej (dzia\u0142a albo jedno, albo drugie). Wraca do kolor\xF3w ikony, je\u015Bli nie mo\u017Cna odczyta\u0107 grafiki.",
    "RARE ACHIEVEMENT": "RZADKIE OSI\u0104GNI\u0118CIE",
    "RARE ACHIEVEMENT UNLOCKED": "ODBLOKOWANO RZADKIE OSI\u0104GNI\u0118CIE",
    "RARE TROPHY UNLOCKED": "ODBLOKOWANO RZADKI PUCHAR",
    "RARE UNLOCK!": "RZADKIE ODBLOKOWANIE!",
    "Rare Achievement Unlocked": "Odblokowano rzadkie osi\u0105gni\u0119cie",
    "Rare achievement": "Rzadkie osi\u0105gni\u0119cie",
    "Rare sound": "D\u017Awi\u0119k rzadkiego",
    "Rare unlocks.": "Rzadkie odblokowania.",
    "Rare: this % or lower": "Rzadkie: ten % lub mniej",
    "Rarity (rarest first)": "Rzadko\u015B\u0107 (najrzadsze najpierw)",
    "Rarity Tiers": "Poziomy rzadko\u015Bci",
    "Rarity tiers": "Poziomy rzadko\u015Bci",
    "Recent Unlocks": "Ostatnie odblokowania",
    "Refresh": "Od\u015Bwie\u017C",
    "Refresh sound list": "Od\u015Bwie\u017C list\u0119 d\u017Awi\u0119k\xF3w",
    "Refreshing...": "Od\u015Bwie\u017Canie...",
    "Remove key": "Usu\u0144 klucz",
    "Removed.": "Usuni\u0119to.",
    "Reset this game to the global settings": "Przywr\xF3\u0107 tej grze ustawienia globalne",
    "Right to left": "Od prawej do lewej",
    "Ring size": "Rozmiar pier\u015Bcienia",
    "Run overlay check": "Uruchom kontrol\u0119 nak\u0142adki",
    "Same as popups": "Tak samo jak powiadomienia",
    "Save key": "Zapisz klucz",
    "Saved to {path}": "Zapisano w {path}",
    "Saved.": "Zapisano.",
    "Saving...": "Zapisywanie...",
    "Search": "Szukaj",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "Wybierz osi\u0105gni\u0119cie powy\u017Cej (naci\u015Bnij na nim przycisk akcji), aby przypi\u0105\u0107 je jako ma\u0142y wska\u017Anik na ekranie podczas gry. Wska\u017Anik u\u017Cywa Twojego szablonu powiadomie\u0144 i kolor\xF3w oraz zsuwa si\u0119, gdy pojawia si\u0119 powiadomienie. Post\u0119p liczbowy wida\u0107 tylko przy osi\u0105gni\u0119ciach powi\u0105zanych przez gr\u0119 ze statystyk\u0105; pozosta\u0142e pokazuj\u0105 stan zablokowane lub odblokowane.",
    "Select an unlock to make a shareable image card.": "Wybierz odblokowanie, aby utworzy\u0107 kart\u0119-obraz do udost\u0119pnienia.",
    "Session summary": "Podsumowanie sesji",
    "Share card": "Karta do udost\u0119pnienia",
    "Show": "Poka\u017C",
    "Show more": "Poka\u017C wi\u0119cej",
    "Show screen frame": "Poka\u017C ramk\u0119 ekranu",
    "Show unlock percentage": "Poka\u017C odsetek odblokowa\u0144",
    "Showing {shown} of {total}": "Wy\u015Bwietlono {shown} z {total}",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Pokazywana, gdy osi\u0105gni\u0119cie nie ma jeszcze ikony (oraz jako ikona pocz\u0105tkowa w Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Pokazuje na kilka sekund czerwon\u0105 ramk\u0119 (\u017C\xF3\u0142ty kwadrat = lewy g\xF3rny r\xF3g). Powinna dok\u0142adnie przylega\u0107 do kraw\u0119dzi ekranu. Je\u015Bli nie, wybierz powy\u017Cej inny rozmiar.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Pokazuje, jaki odsetek graczy ma dane osi\u0105gni\u0119cie, np. 4,7% graczy.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "Rozmiar ma\u0142ej odznaki \u201E4,7% graczy\u201D. Domy\u015Blnie 100%.",
    "Solid color": "Jednolity kolor",
    "Something went wrong.": "Co\u015B posz\u0142o nie tak.",
    "Sort by": "Sortuj wed\u0142ug",
    "Sound": "D\u017Awi\u0119k",
    "Sound & tests": "D\u017Awi\u0119k i testy",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Uruchom gr\u0119, a nast\u0119pnie otw\xF3rz ten panel, aby nada\u0107 jej w\u0142asne ustawienia. Teraz poni\u017Csze ustawienia dotycz\u0105 wszystkich gier.",
    "Steam Web API key": "Klucz Steam Web API",
    "Steam didn't return any achievement data for this game.": "Steam nie zwr\xF3ci\u0142 \u017Cadnych danych o osi\u0105gni\u0119ciach dla tej gry.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam udost\u0119pni\u0142 dla tego osi\u0105gni\u0119cia tylko szar\u0105 ikon\u0119 \u2014 w jego danych nie ma kolorowej.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "API Steam zwr\xF3ci\u0142o pust\u0105 lub bezu\u017Cyteczn\u0105 odpowied\u017A \u2014 u\u017Cyto lokalnej pami\u0119ci podr\u0119cznej. Je\u015Bli powtarza si\u0119 to dla tej samej gry, mo\u017Ce to by\u0107 tymczasowy problem po stronie Steam.",
    "Steam's achievement library wasn't found on this system.": "Nie znaleziono biblioteki osi\u0105gni\u0119\u0107 Steam w tym systemie.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "Ikona ze Steam by\u0142a szara, wi\u0119c u\u017Cyto drugiej ikony z jej danych (kolorowej).",
    "Stop tracking": "Przesta\u0144 \u015Bledzi\u0107",
    "TRACKING": "\u015ALEDZENIE",
    "TROPHY UNLOCKED": "ODBLOKOWANO PUCHAR",
    "Template effects": "Efekty szablonu",
    "Test Common": "Testuj pospolite",
    "Test Completionist": "Testuj uko\u0144czenie gry",
    "Test Rare": "Testuj rzadkie",
    "Test Ultra Rare": "Testuj ultrarzadkie",
    "Test Uncommon": "Testuj niepospolite",
    "Test almost there alert": "Testuj alert \u201Eprawie gotowe\u201D",
    "Test session summary": "Testuj podsumowanie sesji",
    "Text": "Tekst",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "Wywo\u0142anie API zadzia\u0142a\u0142o, ale nie znaleziono w nim tego osi\u0105gni\u0119cia \u2014 u\u017Cyto lokalnej pami\u0119ci podr\u0119cznej.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "Samo wywo\u0142anie Web API nie powiod\u0142o si\u0119 (problem z sieci\u0105) \u2014 u\u017Cyto lokalnej pami\u0119ci podr\u0119cznej.",
    "The big text on the 100% completion popup.": "Du\u017Cy napis na powiadomieniu o uko\u0144czeniu na 100%.",
    "The check itself failed: {error}": "Sama kontrola nie powiod\u0142a si\u0119: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "Kolorowy pier\u015Bcie\u0144 okalaj\u0105cy ikon\u0119, niezale\u017Cny od po\u015Bwiaty powy\u017Cej. Po wy\u0142\u0105czeniu ikona le\u017Cy na zwyk\u0142ym ciemnym tle.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "Lokalna ikona by\u0142a szara (zablokowana); u\u017Cyto kolorowej ikony z publicznej strony osi\u0105gni\u0119\u0107 Steam.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "Lokalna ikona by\u0142a szara (zablokowana); poczekano, a\u017C Steam j\u0105 zaktualizuje, i u\u017Cyto kolorowej.",
    "The overall card design/style.": "Og\xF3lny projekt i styl karty.",
    "The popup for unlocking every achievement in a game.": "Powiadomienie za odblokowanie wszystkich osi\u0105gni\u0119\u0107 w grze.",
    "The probe script is missing -- try reinstalling the plugin.": "Brakuje skryptu sondy \u2014 spr\xF3buj ponownie zainstalowa\u0107 wtyczk\u0119.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "Pulsuj\u0105cy pier\u015Bcie\u0144 po\u015Bwiaty zwykle pojawia si\u0119 tylko przy rzadkich odblokowaniach \u2014 w\u0142\u0105cz t\u0119 opcj\u0119, aby pojawia\u0142 si\u0119 te\u017C przy zwyk\u0142ych. (Rzadka wst\u0105\u017Cka w rogu i iskry pozostaj\u0105 tylko dla rzadkich, bo oznaczaj\u0105 w\u0142a\u015Bnie \u201Eto jest rzadkie\u201D.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "Prosty spos\xF3b: ka\u017Cdy szablon u\u017Cywa w\u0142asnej wbudowanej palety (na przyk\u0142ad zieleni Xbox, b\u0142\u0119kitu PlayStation, b\u0142\u0119kitu Steam). Gdy ta opcja jest w\u0142\u0105czona, wszystkie poni\u017Csze opcje kolor\xF3w s\u0105 wyszarzone i ignorowane.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "Delikatna po\u015Bwiata wok\xF3\u0142 ikony oraz pulsuj\u0105cy pier\u015Bcie\u0144 po\u015Bwiaty (rzadkie osi\u0105gni\u0119cia, a tak\u017Ce zwyk\u0142e, je\u015Bli w\u0142\u0105czysz to poni\u017Cej).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "Specjalne powiadomienie za odblokowanie wszystkich osi\u0105gni\u0119\u0107 w grze, z nazw\u0105 uruchomionej gry.",
    "This game doesn't have any Steam achievements.": "Ta gra nie ma osi\u0105gni\u0119\u0107 Steam.",
    "Timed out talking to Steam. Try refreshing.": "Przekroczono czas oczekiwania na odpowied\u017A Steam. Spr\xF3buj od\u015Bwie\u017Cy\u0107.",
    "Title font size": "Rozmiar czcionki tytu\u0142u",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Ikony powiadomie\u0144 zwykle pochodz\u0105 z lokalnej pami\u0119ci podr\u0119cznej Steam, kt\xF3ra czasem mo\u017Ce pokaza\u0107 niew\u0142a\u015Bciw\u0105 (szar\u0105/zablokowan\u0105) ikon\u0119. Dodanie bezp\u0142atnego klucza Steam Web API sprawi, \u017Ce Finally Achievement Plugin za ka\u017Cdym razem pobierze prawid\u0142ow\u0105, pe\u0142nokolorow\u0105 ikon\u0119 prosto ze Steam. Zdob\u0119dziesz go na steamcommunity.com/dev/apikey",
    "Top left": "Lewy g\xF3rny r\xF3g",
    "Top middle": "G\xF3ra po\u015Brodku",
    "Top right": "Prawy g\xF3rny r\xF3g",
    "Top right (descriptions can use 2 lines)": "Prawy g\xF3rny r\xF3g (opisy mog\u0105 zaj\u0105\u0107 2 linie)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "Prawy g\xF3rny r\xF3g daje opisowi pe\u0142n\u0105 szeroko\u015B\u0107, wi\u0119c kr\xF3tkie opisy nie ko\u0144cz\u0105 si\u0119 wielokropkiem, a d\u0142ugie mog\u0105 zaj\u0105\u0107 dwie linie.",
    "Tracker position": "Pozycja wska\u017Anika",
    "Tracker size": "Rozmiar wska\u017Anika",
    "Tracker template": "Szablon wska\u017Anika",
    "Tracking": "\u015Aledzenie",
    "Trophy": "Puchar",
    "Type part of a name or description.": "Wpisz fragment nazwy lub opisu.",
    "ULTRA RARE ACHIEVEMENT": "ULTRARZADKIE OSI\u0104GNI\u0118CIE",
    "ULTRA RARE TROPHY": "ULTRARZADKI PUCHAR",
    "ULTRA RARE UNLOCK!": "ULTRARZADKIE ODBLOKOWANIE!",
    "UNCOMMON ACHIEVEMENT": "NIEPOSPOLITE OSI\u0104GNI\u0118CIE",
    "UNCOMMON TROPHY": "NIEPOSPOLITY PUCHAR",
    "UNCOMMON UNLOCK!": "NIEPOSPOLITE ODBLOKOWANIE!",
    "UNLOCKED": "ODBLOKOWANO",
    "UNLOCKED!": "ODBLOKOWANO!",
    "Ultra Rare Achievement": "Ultrarzadkie osi\u0105gni\u0119cie",
    "Ultra rare achievement": "Ultrarzadkie osi\u0105gni\u0119cie",
    "Ultra rare sound": "D\u017Awi\u0119k ultrarzadkiego",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "Ultrarzadkie \u2264 {ultra}%, Rzadkie \u2264 {rare}%, Niepospolite \u2264 {uncommon}%, wszystko powy\u017Cej to pospolite (bez etykiety poziomu). Progi automatycznie pozostaj\u0105 w kolejno\u015Bci.",
    "Ultra rare: this % or lower": "Ultrarzadkie: ten % lub mniej",
    "Uncommon Achievement": "Niepospolite osi\u0105gni\u0119cie",
    "Uncommon achievement": "Niepospolite osi\u0105gni\u0119cie",
    "Uncommon sound": "D\u017Awi\u0119k niepospolitego",
    "Uncommon: this % or lower": "Niepospolite: ten % lub mniej",
    "Unlock percentage size": "Rozmiar odsetka odblokowa\u0144",
    "Unlocked": "Odblokowano",
    "Unlocked first": "Najpierw odblokowane",
    "Use each template's own colors": "U\u017Cywaj w\u0142asnych kolor\xF3w ka\u017Cdego szablonu",
    "Use the running game for tests": "U\u017Cywaj uruchomionej gry do test\xF3w",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "U\u017Cyto kolorowej ikony z lokalnych danych osi\u0105gni\u0119\u0107 Steam (klucz API niepotrzebny).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "U\u017Cyto prawid\u0142owej kolorowej ikony z Steam Web API (dopasowanie bez rozr\xF3\u017Cniania wielko\u015Bci liter).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "U\u017Cyto prawid\u0142owej kolorowej ikony z Steam Web API.",
    "Vertical (default)": "Pionowy (domy\u015Blny)",
    "Volume": "G\u0142o\u015Bno\u015B\u0107",
    "Waiting for live data...": "Oczekiwanie na dane na \u017Cywo...",
    "Watcher Status": "Stan obserwatora",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "Gdy w\u0142\u0105czone, wszystkie poni\u017Csze ustawienia dotycz\u0105 tylko tej gry i s\u0105 zapami\u0119tywane. Na pocz\u0105tku to kopia Twoich bie\u017C\u0105cych ustawie\u0144. Wy\u0142\u0105czenie zachowuje to, co zapisano.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "Po zamkni\u0119ciu gry pokazuje, ile osi\u0105gni\u0119\u0107 odblokowano podczas grania, na przyk\u0142ad odblokowano 3, w tym 1 rzadkie.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Gdy odblokujesz ostatnie osi\u0105gni\u0119cie w dowolnej grze, po powiadomieniu o tym osi\u0105gni\u0119ciu pokazuje specjalne szmaragdowe powiadomienie o uko\u0144czeniu.",
    "Where the banner appears on screen.": "Gdzie na ekranie pojawia si\u0119 baner.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Szablon powiadomie\u0144, kt\xF3rym rysowany jest wska\u017Anik. Wypr\xF3buj Rozmyt\u0105 grafik\u0119 gry, aby umie\u015Bci\u0107 za nim grafik\u0119 z gry.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "Gdy gra jest uruchomiona, testy pokazuj\u0105 losowe osi\u0105gni\u0119cie z niej (nawet zablokowane) z prawdziw\u0105 ikon\u0105 i grafik\u0105 gry. Testy nigdy nie licz\u0105 si\u0119 jako odblokowania. Bez uruchomionej gry lub po wy\u0142\u0105czeniu tej opcji testy u\u017Cywaj\u0105 przyk\u0142adu.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "W\u0142asne d\u017Awi\u0119ki: umie\u015B\u0107 pliki .wav, .flac, .ogg lub .mp3 (do 10 MB, najlepiej kr\xF3tkie) w {folder}, a nast\u0119pnie naci\u015Bnij Od\u015Bwie\u017C. Pojawi\u0105 si\u0119 z dopiskiem \u201E(Tw\xF3j)\u201D po nazwie, a aktualizacja wtyczki nigdy ich nie usuwa. Przyciskami testowymi poni\u017Cej mo\u017Cesz pos\u0142ucha\u0107 ka\u017Cdego z nich.",
    "[ACHIEVEMENT]": "[OSI\u0104GNI\u0118CIE]",
    "[RARE UNLOCK]": "[RZADKIE ODBLOKOWANIE]",
    "[ULTRA RARE UNLOCK]": "[ULTRARZADKIE ODBLOKOWANIE]",
    "[UNCOMMON UNLOCK]": "[NIEPOSPOLITE ODBLOKOWANIE]",
    "never": "nigdy",
    "the Finally Achievement Plugin settings folder, sounds": "folderze ustawie\u0144 wtyczki Finally Achievement Plugin, podfolderze sounds",
    "{count} unlocked": "Odblokowano: {count}",
    "{count} unlocked, {rare} rare": "Odblokowano: {count}, w tym rzadkich: {rare}",
    "{percent}% of players": "{percent}% graczy",
    "{unlocked} / {total} unlocked": "Odblokowano {unlocked} / {total}",
    "\u2713 Unlocked": "\u2713 Odblokowano"
  },
  "pt-BR": {
    "(yours)": "(seu)",
    "0% hides the banner; 50% is the default size.": "0% oculta o banner; 50% \xE9 o tamanho padr\xE3o.",
    "100% COMPLETE": "100% CONCLU\xCDDO",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (TV Full HD)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (tela do Legion Go)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (TV 4K)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 \xE9 o visual padr\xE3o; 0 \xE9 praticamente desligado, 100 dobra o efeito.",
    "50% is the default volume; 0% is silent.": "50% \xE9 o volume padr\xE3o; 0% \xE9 mudo.",
    "<0.1% of players": "<0,1% dos jogadores",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Um desbloqueio comum (acima do limite de Incomum): sem r\xF3tulo de n\xEDvel.",
    "A rare unlock: gold look, rare sound and glow.": "Um desbloqueio raro: visual dourado, som raro e brilho.",
    "ACHIEVEMENT UNLOCKED": "CONQUISTA DESBLOQUEADA",
    "Achievement": "Conquista",
    "Achievement Icon Accuracy": "Precis\xE3o dos \xEDcones de conquistas",
    "Achievement Tracker": "Rastreador de conquistas",
    "Achievement Unlocked": "Conquista desbloqueada",
    "Achievements": "Conquistas",
    "Achievements & tracker": "Conquistas e rastreador",
    "Advanced": "Avan\xE7ado",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Ap\xF3s um desbloqueio, mostra um aviso como \u201CS\xF3 faltam 2 conquistas\u201D quando um jogo est\xE1 perto de 100%.",
    "Alert when this many are left": "Avisar quando faltarem tantas",
    "Almost there alert": "Aviso de quase l\xE1",
    "Alphabetical": "Alfab\xE9tica",
    "An ultra rare unlock: extra sparkles and a longer shine.": "Um desbloqueio ultra raro: mais brilhos e um reflexo mais longo.",
    "An uncommon unlock: tier label only.": "Um desbloqueio incomum: apenas o r\xF3tulo de n\xEDvel.",
    "App {id}": "App {id}",
    "Appearance": "Apar\xEAncia",
    "Auto (Steam language)": "Autom\xE1tico (idioma da Steam)",
    "Auto (detect)": "Autom\xE1tico (detectar)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Autom\xE1tico funciona bem na tela do Deck. Em uma TV, se as notifica\xE7\xF5es aparecerem no lugar errado, escolha a resolu\xE7\xE3o da TV e confira com o teste de moldura abaixo.",
    "Bottom left": "Canto inferior esquerdo",
    "Bottom middle": "Centro inferior",
    "Bottom right": "Canto inferior direito",
    "Bottom right (default)": "Canto inferior direito (padr\xE3o)",
    "Checking...": "Verificando...",
    "Clear history": "Limpar hist\xF3rico",
    "Clear search": "Limpar pesquisa",
    "Colors": "Cores",
    "Colors & style": "Cores e estilo",
    "Common sound": "Som Comum",
    "Completion popup at 100%": "Notifica\xE7\xE3o de conclus\xE3o em 100%",
    "Completion popup name": "Nome da notifica\xE7\xE3o de conclus\xE3o",
    "Completionist": "Completista",
    "Completionist sound": "Som de conclus\xE3o",
    "Could not save the card: {error}": "N\xE3o foi poss\xEDvel salvar o cart\xE3o: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "N\xE3o foi poss\xEDvel confirmar que este \xEDcone \xE9 o colorido, e nada melhor foi encontrado.",
    "Couldn't identify the game/achievement for this unlock.": "N\xE3o foi poss\xEDvel identificar o jogo/conquista deste desbloqueio.",
    "Couldn't save that key.": "N\xE3o foi poss\xEDvel salvar essa chave.",
    "Couldn't start the achievement probe.": "N\xE3o foi poss\xEDvel iniciar a sondagem de conquistas.",
    "Crowned": "Coroado",
    "Currently Playing": "Jogando agora",
    "Custom settings for this game": "Configura\xE7\xF5es personalizadas para este jogo",
    "Custom settings for {name}": "Configura\xE7\xF5es personalizadas para {name}",
    "Default (game icon, else badge)": "Padr\xE3o (\xEDcone do jogo, sen\xE3o selo)",
    "Description font size": "Tamanho da fonte da descri\xE7\xE3o",
    "Direction of the card's background gradient, or a flat solid color.": "Dire\xE7\xE3o do gradiente de fundo do cart\xE3o, ou uma cor s\xF3lida.",
    "Editing settings for all games.": "Editando as configura\xE7\xF5es de todos os jogos.",
    "Editing settings for {name} only.": "Editando as configura\xE7\xF5es somente de {name}.",
    "Everyday unlocks (above the Uncommon cutoff).": "Desbloqueios do dia a dia (acima do limite de Incomum).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Extras em alguns modelos: texto sendo digitado, fundos animados, glitches, parafusos, um cabe\xE7alho com o nome do jogo e mais. Desative para um visual simples.",
    "Font size of the achievement name.": "Tamanho da fonte do nome da conquista.",
    "Font size of the small eyebrow label above the title.": "Tamanho da fonte do pequeno r\xF3tulo acima do t\xEDtulo.",
    "Font size of the subtitle/description line.": "Tamanho da fonte da linha de subt\xEDtulo/descri\xE7\xE3o.",
    "Game Settings": "Configura\xE7\xF5es do jogo",
    "Game icon": "\xCDcone do jogo",
    "Glow": "Brilho",
    "Glow for normal achievements": "Brilho para conquistas normais",
    "Glow intensity": "Intensidade do brilho",
    "Got an unexpected response from Steam.": "Resposta inesperada da Steam.",
    "Gradient direction": "Dire\xE7\xE3o do gradiente",
    "Gradient from game artwork colors": "Gradiente a partir das cores da arte do jogo",
    "Gradient from icon colors": "Gradiente a partir das cores do \xEDcone",
    "History & sharing": "Hist\xF3rico e compartilhamento",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "Quanto os an\xE9is luminosos se espalham. 50 \xE9 o visual padr\xE3o; 0 os oculta, 100 dobra o efeito.",
    "How long the toast stays on screen before it slides away.": "Quanto tempo a notifica\xE7\xE3o fica na tela antes de sair.",
    "Icon frame ring": "Anel de moldura do \xEDcone",
    "Icon glow": "Brilho do \xEDcone",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "Se voc\xEA ouve o som mas nenhuma notifica\xE7\xE3o aparece (por exemplo em outro port\xE1til), execute esta verifica\xE7\xE3o. Ela testa os pacotes Python, as bibliotecas gr\xE1ficas, a tela e a cria\xE7\xE3o de janela de que a notifica\xE7\xE3o precisa e diz o que est\xE1 faltando.",
    "In progress": "Em andamento",
    "Key saved (ending in {tail})": "Chave salva (terminada em {tail})",
    "Label font size": "Tamanho da fonte do r\xF3tulo",
    "Language": "Idioma",
    "Last unlock's icon:": "\xCDcone do \xFAltimo desbloqueio:",
    "Left to right": "Da esquerda para a direita",
    "Legendary Achievement unlocked": "Conquista lend\xE1ria desbloqueada",
    "Loading achievements...": "Carregando conquistas...",
    "Loading...": "Carregando...",
    "Making card...": "Criando cart\xE3o...",
    "Manual common popup test": "Teste manual de notifica\xE7\xE3o comum",
    "Manual rare popup test": "Teste manual de notifica\xE7\xE3o rara",
    "Manual ultra rare popup test": "Teste manual de notifica\xE7\xE3o ultra rara",
    "Manual uncommon popup test": "Teste manual de notifica\xE7\xE3o incomum",
    "Manually refresh backend status.": "Atualizar manualmente o status do backend.",
    "Milestone popups": "Avisos de marcos",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "Nomeia cada desbloqueio conforme poucos jogadores o t\xEAm (Incomum, Raro, Ultra raro) no r\xF3tulo da notifica\xE7\xE3o. Ultra raro ganha mais brilhos e um reflexo mais longo. Raro mant\xE9m o visual dourado e o som.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "Requer os n\xEDveis de raridade ativados; caso contr\xE1rio tocam os sons comuns.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "Requer os n\xEDveis de raridade ativados; caso contr\xE1rio toca o som raro.",
    "New achievement": "Nova conquista",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "Nenhuma chave de API definida -- usando apenas o cache local (o \xEDcone colorido n\xE3o \xE9 garantido).",
    "No API key set -- using the local cache only.": "Nenhuma chave de API definida -- usando apenas o cache local.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "Nenhuma fonte chinesa foi encontrada, ent\xE3o o texto chin\xEAs das notifica\xE7\xF5es pode aparecer como caixas vazias. Copie um arquivo de fonte (.ttf, .otf ou .ttc, por exemplo Noto Sans SC) para {folder} e execute uma notifica\xE7\xE3o de teste.",
    "No achievements found for this game.": "Nenhuma conquista encontrada para este jogo.",
    "No achievements match your search.": "Nenhuma conquista corresponde \xE0 sua pesquisa.",
    "No game is currently running.": "Nenhum jogo est\xE1 em execu\xE7\xE3o no momento.",
    "No game running": "Nenhum jogo em execu\xE7\xE3o",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "Nenhum desbloqueio registrado ainda. As conquistas que voc\xEA desbloquear a partir de agora aparecer\xE3o aqui.",
    "Nothing pinned right now.": "Nada fixado no momento.",
    "Nothing unlocked yet this session.": "Nada foi desbloqueado ainda nesta sess\xE3o.",
    "Only 1 achievement left": "S\xF3 falta 1 conquista",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Desta vez s\xF3 o \xEDcone cinza (bloqueado) estava dispon\xEDvel -- nenhum colorido foi encontrado.",
    "Only {count} achievements left": "S\xF3 faltam {count} conquistas",
    "Percentage badge position": "Posi\xE7\xE3o do selo de porcentagem",
    "Placeholder icon": "\xCDcone provis\xF3rio",
    "Popup": "Notifica\xE7\xE3o",
    "Popup Not Showing?": "A notifica\xE7\xE3o n\xE3o aparece?",
    "Popup Tests": "Testes de notifica\xE7\xE3o",
    "Popup duration": "Dura\xE7\xE3o da notifica\xE7\xE3o",
    "Popup position": "Posi\xE7\xE3o da notifica\xE7\xE3o",
    "Popup screen size": "Tamanho de tela das notifica\xE7\xF5es",
    "Popup size": "Tamanho da notifica\xE7\xE3o",
    "Popup template": "Modelo de notifica\xE7\xE3o",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Pega o gradiente de fundo do cart\xE3o das cores do \xEDcone da conquista em vez das cores fixas abaixo. Funciona em todos os modelos, exceto Paper Light. Volta \xE0s cores fixas se o \xEDcone n\xE3o tiver cores dominantes claras (ou se n\xE3o houver \xEDcone).",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Pega o gradiente da arte do pr\xF3prio jogo, de modo que todas as notifica\xE7\xF5es de um jogo compartilhem uma paleta. Ativar isto desativa a op\xE7\xE3o de \xEDcone acima (\xE9 uma ou a outra). Volta \xE0s cores do \xEDcone se a arte n\xE3o puder ser lida.",
    "RARE ACHIEVEMENT": "CONQUISTA RARA",
    "RARE ACHIEVEMENT UNLOCKED": "CONQUISTA RARA DESBLOQUEADA",
    "RARE TROPHY UNLOCKED": "TROF\xC9U RARO DESBLOQUEADO",
    "RARE UNLOCK!": "DESBLOQUEIO RARO!",
    "Rare Achievement Unlocked": "Conquista rara desbloqueada",
    "Rare achievement": "Conquista rara",
    "Rare sound": "Som Raro",
    "Rare unlocks.": "Desbloqueios raros.",
    "Rare: this % or lower": "Raro: esta % ou menos",
    "Rarity (rarest first)": "Raridade (mais raras primeiro)",
    "Rarity Tiers": "N\xEDveis de raridade",
    "Rarity tiers": "N\xEDveis de raridade",
    "Recent Unlocks": "Desbloqueios recentes",
    "Refresh": "Atualizar",
    "Refresh sound list": "Atualizar lista de sons",
    "Refreshing...": "Atualizando...",
    "Remove key": "Remover chave",
    "Removed.": "Removida.",
    "Reset this game to the global settings": "Redefinir este jogo para as configura\xE7\xF5es globais",
    "Right to left": "Da direita para a esquerda",
    "Ring size": "Tamanho do anel",
    "Run overlay check": "Executar verifica\xE7\xE3o do overlay",
    "Same as popups": "Igual \xE0s notifica\xE7\xF5es",
    "Save key": "Salvar chave",
    "Saved to {path}": "Salvo em {path}",
    "Saved.": "Salvo.",
    "Saving...": "Salvando...",
    "Search": "Pesquisar",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "Selecione uma conquista acima (pressione o bot\xE3o de a\xE7\xE3o nela) para fix\xE1-la como um pequeno rastreador na tela enquanto joga. O rastreador usa seu modelo e suas cores de notifica\xE7\xE3o e sai da tela quando uma notifica\xE7\xE3o aparece. O progresso num\xE9rico s\xF3 aparece em conquistas que o jogo liga a uma estat\xEDstica rastre\xE1vel; as demais aparecem como bloqueadas ou desbloqueadas.",
    "Select an unlock to make a shareable image card.": "Selecione um desbloqueio para criar um cart\xE3o de imagem para compartilhar.",
    "Session summary": "Resumo da sess\xE3o",
    "Share card": "Cart\xE3o para compartilhar",
    "Show": "Exibir",
    "Show more": "Mostrar mais",
    "Show screen frame": "Mostrar moldura da tela",
    "Show unlock percentage": "Mostrar porcentagem de desbloqueio",
    "Showing {shown} of {total}": "Mostrando {shown} de {total}",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Mostrado quando uma conquista ainda n\xE3o tem \xEDcone (e como \xEDcone inicial no Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Mostra uma moldura vermelha (bloco amarelo = canto superior esquerdo) por alguns segundos. Ela deve ficar exatamente nas bordas da tela. Se n\xE3o ficar, escolha outro tamanho acima.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Mostra a porcentagem de jogadores que t\xEAm a conquista, p. ex. 4,7% dos jogadores.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "Tamanho do pequeno selo \xAB4,7% dos jogadores\xBB. 100% \xE9 o padr\xE3o.",
    "Solid color": "Cor s\xF3lida",
    "Something went wrong.": "Algo deu errado.",
    "Sort by": "Ordenar por",
    "Sound": "Som",
    "Sound & tests": "Som e testes",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Inicie um jogo e abra este painel para dar a ele configura\xE7\xF5es pr\xF3prias. No momento, as configura\xE7\xF5es abaixo valem para todos os jogos.",
    "Steam Web API key": "Chave da API Web da Steam",
    "Steam didn't return any achievement data for this game.": "A Steam n\xE3o retornou dados de conquistas para este jogo.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "A Steam s\xF3 forneceu um \xEDcone cinza para esta conquista -- n\xE3o h\xE1 nenhum colorido nos dados dela.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "A API da Steam retornou uma resposta vazia/inutiliz\xE1vel -- voltou ao cache local. Se isso continuar acontecendo no mesmo jogo, pode ser um problema tempor\xE1rio do lado da Steam.",
    "Steam's achievement library wasn't found on this system.": "A biblioteca de conquistas da Steam n\xE3o foi encontrada neste sistema.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "O \xEDcone da Steam veio cinza, ent\xE3o foi usado o outro \xEDcone dos dados dela (o colorido).",
    "Stop tracking": "Parar de acompanhar",
    "TRACKING": "ACOMPANHANDO",
    "TROPHY UNLOCKED": "TROF\xC9U DESBLOQUEADO",
    "Template effects": "Efeitos do modelo",
    "Test Common": "Testar Comum",
    "Test Completionist": "Testar Conclus\xE3o",
    "Test Rare": "Testar Raro",
    "Test Ultra Rare": "Testar Ultra raro",
    "Test Uncommon": "Testar Incomum",
    "Test almost there alert": "Testar aviso de quase l\xE1",
    "Test session summary": "Testar resumo da sess\xE3o",
    "Text": "Texto",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "A chamada \xE0 API funcionou, mas esta conquista n\xE3o foi encontrada nela -- voltou ao cache local.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "A pr\xF3pria chamada \xE0 API Web falhou (problema de rede) -- voltou ao cache local.",
    "The big text on the 100% completion popup.": "O texto grande da notifica\xE7\xE3o de conclus\xE3o em 100%.",
    "The check itself failed: {error}": "A pr\xF3pria verifica\xE7\xE3o falhou: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "O anel colorido que emoldura o \xEDcone, separado do brilho acima. Desativado, o \xEDcone fica sobre um fundo escuro simples.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "O \xEDcone local estava cinza (bloqueado); foi usado o \xEDcone colorido da p\xE1gina p\xFAblica de conquistas da Steam.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "O \xEDcone local estava cinza (bloqueado); aguardou-se a Steam atualiz\xE1-lo e usou-se o colorido.",
    "The overall card design/style.": "O design/estilo geral do cart\xE3o.",
    "The popup for unlocking every achievement in a game.": "A notifica\xE7\xE3o por desbloquear todas as conquistas de um jogo.",
    "The probe script is missing -- try reinstalling the plugin.": "O script de sondagem est\xE1 ausente -- tente reinstalar o plugin.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "O anel luminoso pulsante normalmente s\xF3 aparece em desbloqueios raros -- ative isto para que apare\xE7a tamb\xE9m nos comuns. (A fita no canto e os brilhos continuam s\xF3 para raros, pois significam especificamente \xABesta \xE9 rara\xBB.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "O jeito simples: cada modelo usa sua pr\xF3pria paleta (por exemplo verde Xbox, azul PlayStation, azul Steam). Enquanto estiver ativado, todas as op\xE7\xF5es de cor abaixo ficam esmaecidas e s\xE3o ignoradas.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "O brilho suave em volta do \xEDcone e o anel luminoso pulsante (conquistas raras, ou tamb\xE9m as normais se ativado abaixo).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "A notifica\xE7\xE3o especial por desbloquear todas as conquistas de um jogo, usando o nome do jogo em execu\xE7\xE3o.",
    "This game doesn't have any Steam achievements.": "Este jogo n\xE3o tem conquistas da Steam.",
    "Timed out talking to Steam. Try refreshing.": "Tempo esgotado ao falar com a Steam. Tente atualizar.",
    "Title font size": "Tamanho da fonte do t\xEDtulo",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Os \xEDcones das notifica\xE7\xF5es normalmente v\xEAm do cache local da Steam, que \xE0s vezes pode mostrar o \xEDcone errado (cinza/bloqueado). Adicionar uma chave gratuita da API Web da Steam faz o Finally Achievement Plugin buscar sempre o \xEDcone colorido garantidamente correto direto da Steam. Obtenha uma em steamcommunity.com/dev/apikey",
    "Top left": "Canto superior esquerdo",
    "Top middle": "Centro superior",
    "Top right": "Canto superior direito",
    "Top right (descriptions can use 2 lines)": "Canto superior direito (descri\xE7\xF5es podem usar 2 linhas)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "No canto superior direito a descri\xE7\xE3o usa toda a largura: descri\xE7\xF5es curtas n\xE3o terminam em ... e as longas podem usar duas linhas.",
    "Tracker position": "Posi\xE7\xE3o do rastreador",
    "Tracker size": "Tamanho do rastreador",
    "Tracker template": "Modelo do rastreador",
    "Tracking": "Acompanhando",
    "Trophy": "Trof\xE9u",
    "Type part of a name or description.": "Digite parte do nome ou da descri\xE7\xE3o.",
    "ULTRA RARE ACHIEVEMENT": "CONQUISTA ULTRA RARA",
    "ULTRA RARE TROPHY": "TROF\xC9U ULTRA RARO",
    "ULTRA RARE UNLOCK!": "DESBLOQUEIO ULTRA RARO!",
    "UNCOMMON ACHIEVEMENT": "CONQUISTA INCOMUM",
    "UNCOMMON TROPHY": "TROF\xC9U INCOMUM",
    "UNCOMMON UNLOCK!": "DESBLOQUEIO INCOMUM!",
    "UNLOCKED": "DESBLOQUEADA",
    "UNLOCKED!": "DESBLOQUEADO!",
    "Ultra Rare Achievement": "Conquista ultra rara",
    "Ultra rare achievement": "Conquista ultra rara",
    "Ultra rare sound": "Som Ultra raro",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "Ultra raro \u2264 {ultra}%, Raro \u2264 {rare}%, Incomum \u2264 {uncommon}%, o que for maior \xE9 comum (sem r\xF3tulo de n\xEDvel). Os limites permanecem em ordem automaticamente.",
    "Ultra rare: this % or lower": "Ultra raro: esta % ou menos",
    "Uncommon Achievement": "Conquista incomum",
    "Uncommon achievement": "Conquista incomum",
    "Uncommon sound": "Som Incomum",
    "Uncommon: this % or lower": "Incomum: esta % ou menos",
    "Unlock percentage size": "Tamanho da porcentagem de desbloqueio",
    "Unlocked": "Desbloqueada",
    "Unlocked first": "Desbloqueadas primeiro",
    "Use each template's own colors": "Usar as cores pr\xF3prias de cada modelo",
    "Use the running game for tests": "Usar o jogo em execu\xE7\xE3o nos testes",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "Foi usado o \xEDcone colorido dos dados locais de conquistas da pr\xF3pria Steam (n\xE3o precisa de chave de API).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "Foi usado o \xEDcone colorido garantidamente correto da API Web da Steam (correspond\xEAncia sem diferenciar mai\xFAsculas).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "Foi usado o \xEDcone colorido garantidamente correto da API Web da Steam.",
    "Vertical (default)": "Vertical (padr\xE3o)",
    "Volume": "Volume",
    "Waiting for live data...": "Aguardando dados ao vivo...",
    "Watcher Status": "Status do monitor",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "Quando ativado, todas as configura\xE7\xF5es abaixo valem s\xF3 para este jogo e ficam salvas para a pr\xF3xima vez. Come\xE7a como uma c\xF3pia das suas configura\xE7\xF5es atuais. Desativar mant\xE9m o que voc\xEA salvou.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "Ao fechar um jogo, mostra quantas conquistas voc\xEA desbloqueou enquanto jogava, por exemplo 3 desbloqueadas, 1 rara.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Ao desbloquear a \xFAltima conquista de qualquer jogo, mostra uma notifica\xE7\xE3o esmeralda especial de conclus\xE3o depois da notifica\xE7\xE3o dessa conquista.",
    "Where the banner appears on screen.": "Onde o banner aparece na tela.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Com qual modelo de notifica\xE7\xE3o o rastreador \xE9 desenhado. Experimente Game Art Blur para colocar a arte do jogo ao fundo.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "Enquanto um jogo est\xE1 em execu\xE7\xE3o, os testes mostram uma conquista aleat\xF3ria dele (mesmo bloqueada) com o \xEDcone real e a arte do jogo. Testes nunca contam como desbloqueios. Sem jogo em execu\xE7\xE3o, ou com isto desativado, os testes usam um exemplo.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "Seus pr\xF3prios sons: coloque arquivos .wav, .flac, .ogg ou .mp3 (10 MB ou menos, curtos) em {folder} e pressione Atualizar. Eles aparecem com \xAB(seu)\xBB depois do nome, e atualizar o plugin nunca os apaga. Use os bot\xF5es de teste abaixo para ouvir cada um.",
    "[ACHIEVEMENT]": "[CONQUISTA]",
    "[RARE UNLOCK]": "[DESBLOQUEIO RARO]",
    "[ULTRA RARE UNLOCK]": "[DESBLOQUEIO ULTRA RARO]",
    "[UNCOMMON UNLOCK]": "[DESBLOQUEIO INCOMUM]",
    "never": "nunca",
    "the Finally Achievement Plugin settings folder, sounds": "a pasta de configura\xE7\xF5es do Finally Achievement Plugin, subpasta sounds",
    "{count} unlocked": "{count} desbloqueadas",
    "{count} unlocked, {rare} rare": "{count} desbloqueadas, {rare} rara(s)",
    "{percent}% of players": "{percent}% dos jogadores",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} desbloqueadas",
    "\u2713 Unlocked": "\u2713 Desbloqueada"
  },
  "ru": {
    "(yours)": "(\u0432\u0430\u0448)",
    "0% hides the banner; 50% is the default size.": "0% \u0441\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0431\u0430\u043D\u043D\u0435\u0440; 50% \u2014 \u0440\u0430\u0437\u043C\u0435\u0440 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E.",
    "100% COMPLETE": "100% \u041F\u0420\u041E\u0419\u0414\u0415\u041D\u041E",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (Full HD \u0422\u0412)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (\u044D\u043A\u0440\u0430\u043D Legion Go)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (4K \u0422\u0412)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 \u2014 \u0432\u0438\u0434 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E; 0 \u2014 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E, 100 \u2014 \u0432\u0434\u0432\u043E\u0435 \u0441\u0438\u043B\u044C\u043D\u0435\u0435.",
    "50% is the default volume; 0% is silent.": "50% \u2014 \u0433\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E; 0% \u2014 \u0431\u0435\u0437 \u0437\u0432\u0443\u043A\u0430.",
    "<0.1% of players": "<0,1% \u0438\u0433\u0440\u043E\u043A\u043E\u0432",
    "A common unlock (above the Uncommon cutoff): no tier label.": "\u041E\u0431\u044B\u0447\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 (\u0432\u044B\u0448\u0435 \u043F\u043E\u0440\u043E\u0433\u0430 \xAB\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435\xBB): \u0431\u0435\u0437 \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0443\u0440\u043E\u0432\u043D\u044F.",
    "A rare unlock: gold look, rare sound and glow.": "\u0420\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435: \u0437\u043E\u043B\u043E\u0442\u043E\u0439 \u0432\u0438\u0434, \u0437\u0432\u0443\u043A \u0440\u0435\u0434\u043A\u043E\u0433\u043E \u0438 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435.",
    "ACHIEVEMENT UNLOCKED": "\u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415 \u041F\u041E\u041B\u0423\u0427\u0415\u041D\u041E",
    "Achievement": "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Achievement Icon Accuracy": "\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0437\u043D\u0430\u0447\u043A\u043E\u0432 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439",
    "Achievement Tracker": "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F",
    "Achievement Unlocked": "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E",
    "Achievements": "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F",
    "Achievements & tracker": "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0438 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440",
    "Advanced": "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0432\u0440\u043E\u0434\u0435 \xAB\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439: 2\xBB, \u043A\u043E\u0433\u0434\u0430 \u0438\u0433\u0440\u0430 \u0431\u043B\u0438\u0437\u043A\u0430 \u043A 100%.",
    "Alert when this many are left": "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0430\u0442\u044C, \u043A\u043E\u0433\u0434\u0430 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C",
    "Almost there alert": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \xAB\u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0451\xBB",
    "Alphabetical": "\u041F\u043E \u0430\u043B\u0444\u0430\u0432\u0438\u0442\u0443",
    "An ultra rare unlock: extra sparkles and a longer shine.": "\u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435: \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u0441\u043A\u0440 \u0438 \u0431\u043E\u043B\u0435\u0435 \u0434\u043E\u043B\u0433\u0438\u0439 \u0431\u043B\u0435\u0441\u043A.",
    "An uncommon unlock: tier label only.": "\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435: \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0434\u043F\u0438\u0441\u044C \u0443\u0440\u043E\u0432\u043D\u044F.",
    "App {id}": "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 {id}",
    "Appearance": "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434",
    "Auto (Steam language)": "\u0410\u0432\u0442\u043E (\u044F\u0437\u044B\u043A Steam)",
    "Auto (detect)": "\u0410\u0432\u0442\u043E (\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0442\u044C)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "\u0410\u0432\u0442\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u044D\u043A\u0440\u0430\u043D\u0430 \u0441\u0430\u043C\u043E\u0439 Deck. \u0415\u0441\u043B\u0438 \u043D\u0430 \u0442\u0435\u043B\u0435\u0432\u0438\u0437\u043E\u0440\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043D\u0435 \u0442\u0430\u043C, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0422\u0412 \u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0435\u0433\u043E \u0442\u0435\u0441\u0442\u043E\u043C \u0440\u0430\u043C\u043A\u0438 \u043D\u0438\u0436\u0435.",
    "Bottom left": "\u0421\u043B\u0435\u0432\u0430 \u0432\u043D\u0438\u0437\u0443",
    "Bottom middle": "\u0421\u043D\u0438\u0437\u0443 \u043F\u043E \u0446\u0435\u043D\u0442\u0440\u0443",
    "Bottom right": "\u0421\u043F\u0440\u0430\u0432\u0430 \u0432\u043D\u0438\u0437\u0443",
    "Bottom right (default)": "\u0421\u043F\u0440\u0430\u0432\u0430 \u0432\u043D\u0438\u0437\u0443 (\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E)",
    "Checking...": "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430...",
    "Clear history": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E",
    "Clear search": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A",
    "Colors": "\u0426\u0432\u0435\u0442\u0430",
    "Colors & style": "\u0426\u0432\u0435\u0442\u0430 \u0438 \u0441\u0442\u0438\u043B\u044C",
    "Common sound": "\u0417\u0432\u0443\u043A \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E",
    "Completion popup at 100%": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E 100% \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0438",
    "Completion popup name": "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0438",
    "Completionist": "\u041F\u0435\u0440\u0444\u0435\u043A\u0446\u0438\u043E\u043D\u0438\u0441\u0442",
    "Completionist sound": "\u0417\u0432\u0443\u043A \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F",
    "Could not save the card: {error}": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C, \u0447\u0442\u043E \u044D\u0442\u043E\u0442 \u0437\u043D\u0430\u0447\u043E\u043A \u0446\u0432\u0435\u0442\u043D\u043E\u0439, \u0438 \u043D\u0438\u0447\u0435\u0433\u043E \u043B\u0443\u0447\u0448\u0435 \u043D\u0435 \u043D\u0430\u0448\u043B\u043E\u0441\u044C.",
    "Couldn't identify the game/achievement for this unlock.": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0438\u0433\u0440\u0443 \u0438\u043B\u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u043E\u0431\u044B\u0442\u0438\u044F.",
    "Couldn't save that key.": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043B\u044E\u0447.",
    "Couldn't start the achievement probe.": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439.",
    "Crowned": "\u0423\u0432\u0435\u043D\u0447\u0430\u043D\u043D\u044B\u0439",
    "Currently Playing": "\u0421\u0435\u0439\u0447\u0430\u0441 \u0432 \u0438\u0433\u0440\u0435",
    "Custom settings for this game": "\u0421\u0432\u043E\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u044B",
    "Custom settings for {name}": "\u0421\u0432\u043E\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0434\u043B\u044F {name}",
    "Default (game icon, else badge)": "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E (\u0437\u043D\u0430\u0447\u043E\u043A \u0438\u0433\u0440\u044B, \u0438\u043D\u0430\u0447\u0435 \u044D\u043C\u0431\u043B\u0435\u043C\u0430)",
    "Description font size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F",
    "Direction of the card's background gradient, or a flat solid color.": "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0444\u043E\u043D\u043E\u0432\u043E\u0433\u043E \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u0438\u043B\u0438 \u043E\u0434\u043D\u043E\u0442\u043E\u043D\u043D\u0430\u044F \u0437\u0430\u043B\u0438\u0432\u043A\u0430.",
    "Editing settings for all games.": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0438\u0433\u0440.",
    "Editing settings for {name} only.": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F {name}.",
    "Everyday unlocks (above the Uncommon cutoff).": "\u041E\u0431\u044B\u0447\u043D\u044B\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F (\u0432\u044B\u0448\u0435 \u043F\u043E\u0440\u043E\u0433\u0430 \xAB\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435\xBB).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u044D\u0444\u0444\u0435\u043A\u0442\u044B \u0432 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0448\u0430\u0431\u043B\u043E\u043D\u0430\u0445: \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0442\u0435\u043A\u0441\u0442, \u0430\u043D\u0438\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0444\u043E\u043D, \u0433\u043B\u0438\u0442\u0447\u0438, \u0432\u0438\u043D\u0442\u044B, \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0441 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435\u043C \u0438\u0433\u0440\u044B \u0438 \u0434\u0440\u0443\u0433\u043E\u0435. \u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u0442\u043E\u0433\u043E \u0432\u0438\u0434\u0430.",
    "Font size of the achievement name.": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F.",
    "Font size of the small eyebrow label above the title.": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0439 \u043D\u0430\u0434\u043F\u0438\u0441\u0438 \u043D\u0430\u0434 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u043C.",
    "Font size of the subtitle/description line.": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u0441\u0442\u0440\u043E\u043A\u0438 \u043F\u043E\u0434\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430/\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F.",
    "Game Settings": "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0433\u0440\u044B",
    "Game icon": "\u0417\u043D\u0430\u0447\u043E\u043A \u0438\u0433\u0440\u044B",
    "Glow": "\u0421\u0432\u0435\u0447\u0435\u043D\u0438\u0435",
    "Glow for normal achievements": "\u0421\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043E\u0431\u044B\u0447\u043D\u044B\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439",
    "Glow intensity": "\u042F\u0440\u043A\u043E\u0441\u0442\u044C \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u044F",
    "Got an unexpected response from Steam.": "\u041F\u043E\u043B\u0443\u0447\u0435\u043D \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043E\u0442 Steam.",
    "Gradient direction": "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u0430",
    "Gradient from game artwork colors": "\u0413\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u0438\u0437 \u0446\u0432\u0435\u0442\u043E\u0432 \u043E\u0431\u043B\u043E\u0436\u043A\u0438 \u0438\u0433\u0440\u044B",
    "Gradient from icon colors": "\u0413\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u0438\u0437 \u0446\u0432\u0435\u0442\u043E\u0432 \u0437\u043D\u0430\u0447\u043A\u0430",
    "History & sharing": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0438 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u044F",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0434\u0430\u043B\u0435\u043A\u043E \u0440\u0430\u0441\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0441\u0432\u0435\u0442\u043E\u0432\u044B\u0435 \u043A\u043E\u043B\u044C\u0446\u0430. 50 \u2014 \u0432\u0438\u0434 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E; 0 \u0441\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0438\u0445, 100 \u2014 \u0432\u0434\u0432\u043E\u0435 \u0448\u0438\u0440\u0435.",
    "How long the toast stays on screen before it slides away.": "\u041A\u0430\u043A \u0434\u043E\u043B\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435, \u043F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C \u0443\u0439\u0442\u0438.",
    "Icon frame ring": "\u041A\u043E\u043B\u044C\u0446\u043E \u0432\u043E\u043A\u0440\u0443\u0433 \u0437\u043D\u0430\u0447\u043A\u0430",
    "Icon glow": "\u0421\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0437\u043D\u0430\u0447\u043A\u0430",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "\u0415\u0441\u043B\u0438 \u0437\u0432\u0443\u043A \u0441\u043B\u044B\u0448\u0435\u043D, \u0430 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u043F\u043E\u0440\u0442\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u043A\u043E\u043D\u0441\u043E\u043B\u0438), \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u044D\u0442\u0443 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443. \u041E\u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u043F\u0430\u043A\u0435\u0442\u044B Python, \u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438, \u0434\u0438\u0441\u043F\u043B\u0435\u0439 \u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043E\u043A\u043D\u0430, \u043D\u0443\u0436\u043D\u044B\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044E, \u0438 \u0441\u043E\u043E\u0431\u0449\u0430\u0435\u0442, \u0447\u0435\u0433\u043E \u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442.",
    "In progress": "\u0412 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435",
    "Key saved (ending in {tail})": "\u041A\u043B\u044E\u0447 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D (\u043E\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043D\u0430 {tail})",
    "Label font size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u0438",
    "Language": "\u042F\u0437\u044B\u043A",
    "Last unlock's icon:": "\u0417\u043D\u0430\u0447\u043E\u043A \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F:",
    "Left to right": "\u0421\u043B\u0435\u0432\u0430 \u043D\u0430\u043F\u0440\u0430\u0432\u043E",
    "Legendary Achievement unlocked": "\u041B\u0435\u0433\u0435\u043D\u0434\u0430\u0440\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E",
    "Loading achievements...": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439...",
    "Loading...": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
    "Making card...": "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438...",
    "Manual common popup test": "\u0420\u0443\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Manual rare popup test": "\u0420\u0443\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0440\u0435\u0434\u043A\u043E\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Manual ultra rare popup test": "\u0420\u0443\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Manual uncommon popup test": "\u0420\u0443\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Manually refresh backend status.": "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0431\u044D\u043A\u0435\u043D\u0434\u0430 \u0432\u0440\u0443\u0447\u043D\u0443\u044E.",
    "Milestone popups": "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "\u041D\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043A\u0430\u0436\u0434\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u043E \u0442\u043E\u043C\u0443, \u043A\u0430\u043A \u043C\u0430\u043B\u043E \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0435\u0433\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 (\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435, \u0420\u0435\u0434\u043A\u043E\u0435, \u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435), \u0432 \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F. \u0423 \u0441\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u0438\u0445 \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u0441\u043A\u0440 \u0438 \u0434\u043E\u043B\u044C\u0448\u0435 \u0431\u043B\u0435\u0441\u043A. \u0420\u0435\u0434\u043A\u0438\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442 \u0437\u043E\u043B\u043E\u0442\u043E\u0439 \u0432\u0438\u0434 \u0438 \u0437\u0432\u0443\u043A.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "\u041D\u0443\u0436\u043D\u044B \u0432\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u044B\u0435 \u0443\u0440\u043E\u0432\u043D\u0438 \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438; \u0438\u043D\u0430\u0447\u0435 \u0438\u0433\u0440\u0430\u044E\u0442 \u0437\u0432\u0443\u043A\u0438 \u043E\u0431\u044B\u0447\u043D\u044B\u0445.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "\u041D\u0443\u0436\u043D\u044B \u0432\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u044B\u0435 \u0443\u0440\u043E\u0432\u043D\u0438 \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438; \u0438\u043D\u0430\u0447\u0435 \u0438\u0433\u0440\u0430\u0435\u0442 \u0437\u0432\u0443\u043A \u0440\u0435\u0434\u043A\u043E\u0433\u043E.",
    "New achievement": "\u041D\u043E\u0432\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "\u041A\u043B\u044E\u0447 API \u043D\u0435 \u0437\u0430\u0434\u0430\u043D -- \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u044D\u0448 (\u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u043D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D).",
    "No API key set -- using the local cache only.": "\u041A\u043B\u044E\u0447 API \u043D\u0435 \u0437\u0430\u0434\u0430\u043D -- \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u044D\u0448.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "\u041A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 \u0448\u0440\u0438\u0444\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043C\u043E\u0436\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C\u0441\u044F \u043F\u0443\u0441\u0442\u044B\u043C\u0438 \u043A\u0432\u0430\u0434\u0440\u0430\u0442\u0430\u043C\u0438. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u0444\u0430\u0439\u043B \u0448\u0440\u0438\u0444\u0442\u0430 (.ttf, .otf \u0438\u043B\u0438 .ttc, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 Noto Sans SC) \u0432 {folder} \u0438 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0442\u0435\u0441\u0442\u043E\u0432\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435.",
    "No achievements found for this game.": "\u0414\u043B\u044F \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u044B \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B.",
    "No achievements match your search.": "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439, \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u043F\u043E\u0434 \u0437\u0430\u043F\u0440\u043E\u0441.",
    "No game is currently running.": "\u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430 \u043D\u0438 \u043E\u0434\u043D\u0430 \u0438\u0433\u0440\u0430.",
    "No game running": "\u0418\u0433\u0440\u0430 \u043D\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0435\u0439. \u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435 \u0441 \u044D\u0442\u043E\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430, \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C.",
    "Nothing pinned right now.": "\u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E.",
    "Nothing unlocked yet this session.": "\u0412 \u044D\u0442\u043E\u043C \u0441\u0435\u0430\u043D\u0441\u0435 \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E.",
    "Only 1 achievement left": "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0432\u0441\u0435\u0433\u043E 1 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "\u041D\u0430 \u044D\u0442\u043E\u0442 \u0440\u0430\u0437 \u0431\u044B\u043B \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0440\u044B\u0439 (\u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0439) \u0437\u043D\u0430\u0447\u043E\u043A -- \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u043D\u0430\u0439\u0442\u0438 \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C.",
    "Only {count} achievements left": "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439: {count}",
    "Percentage badge position": "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0437\u043D\u0430\u0447\u043A\u0430 \u0441 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u043E\u043C",
    "Placeholder icon": "\u0417\u043D\u0430\u0447\u043E\u043A-\u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430",
    "Popup": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435",
    "Popup Not Showing?": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F?",
    "Popup Tests": "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439",
    "Popup duration": "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Popup position": "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Popup screen size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u044D\u043A\u0440\u0430\u043D\u0430 \u0434\u043B\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439",
    "Popup size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Popup template": "\u0428\u0430\u0431\u043B\u043E\u043D \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "\u0411\u0435\u0440\u0451\u0442 \u0444\u043E\u043D\u043E\u0432\u044B\u0439 \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u0438\u0437 \u0446\u0432\u0435\u0442\u043E\u0432 \u0437\u043D\u0430\u0447\u043A\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0432\u043C\u0435\u0441\u0442\u043E \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u0446\u0432\u0435\u0442\u043E\u0432 \u043D\u0438\u0436\u0435. \u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0432\u043E \u0432\u0441\u0435\u0445 \u0448\u0430\u0431\u043B\u043E\u043D\u0430\u0445, \u043A\u0440\u043E\u043C\u0435 Paper Light. \u0415\u0441\u043B\u0438 \u0443 \u0437\u043D\u0430\u0447\u043A\u0430 \u043D\u0435\u0442 \u044F\u0432\u043D\u044B\u0445 \u0434\u043E\u043C\u0438\u043D\u0438\u0440\u0443\u044E\u0449\u0438\u0445 \u0446\u0432\u0435\u0442\u043E\u0432 (\u0438\u043B\u0438 \u0437\u043D\u0430\u0447\u043A\u0430 \u043D\u0435\u0442), \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0446\u0432\u0435\u0442\u0430.",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "\u0411\u0435\u0440\u0451\u0442 \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u0438\u0437 \u043E\u0431\u043B\u043E\u0436\u043A\u0438 \u0438\u0433\u0440\u044B, \u0447\u0442\u043E\u0431\u044B \u0432\u0441\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E\u0434\u043D\u043E\u0439 \u0438\u0433\u0440\u044B \u0438\u043C\u0435\u043B\u0438 \u043E\u0431\u0449\u0443\u044E \u043F\u0430\u043B\u0438\u0442\u0440\u0443. \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043E\u043F\u0446\u0438\u044E \u0437\u043D\u0430\u0447\u043A\u0430 \u0432\u044B\u0448\u0435 (\u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0447\u0442\u043E-\u0442\u043E \u043E\u0434\u043D\u043E). \u0415\u0441\u043B\u0438 \u043E\u0431\u043B\u043E\u0436\u043A\u0443 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u043D\u0435\u043B\u044C\u0437\u044F, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0446\u0432\u0435\u0442\u0430 \u0437\u043D\u0430\u0447\u043A\u0430.",
    "RARE ACHIEVEMENT": "\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415",
    "RARE ACHIEVEMENT UNLOCKED": "\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415 \u041F\u041E\u041B\u0423\u0427\u0415\u041D\u041E",
    "RARE TROPHY UNLOCKED": "\u0420\u0415\u0414\u041A\u0418\u0419 \u041A\u0423\u0411\u041E\u041A \u041F\u041E\u041B\u0423\u0427\u0415\u041D",
    "RARE UNLOCK!": "\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415!",
    "Rare Achievement Unlocked": "\u0420\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E",
    "Rare achievement": "\u0420\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Rare sound": "\u0417\u0432\u0443\u043A \u0440\u0435\u0434\u043A\u043E\u0433\u043E",
    "Rare unlocks.": "\u0420\u0435\u0434\u043A\u0438\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F.",
    "Rare: this % or lower": "\u0420\u0435\u0434\u043A\u043E\u0435: \u044D\u0442\u043E\u0442 % \u0438\u043B\u0438 \u043C\u0435\u043D\u044C\u0448\u0435",
    "Rarity (rarest first)": "\u0420\u0435\u0434\u043A\u043E\u0441\u0442\u044C (\u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u0430\u043C\u044B\u0435 \u0440\u0435\u0434\u043A\u0438\u0435)",
    "Rarity Tiers": "\u0423\u0440\u043E\u0432\u043D\u0438 \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438",
    "Rarity tiers": "\u0423\u0440\u043E\u0432\u043D\u0438 \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438",
    "Recent Unlocks": "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F",
    "Refresh": "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
    "Refresh sound list": "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u0437\u0432\u0443\u043A\u043E\u0432",
    "Refreshing...": "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435...",
    "Remove key": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u043B\u044E\u0447",
    "Removed.": "\u0423\u0434\u0430\u043B\u0435\u043D\u043E.",
    "Reset this game to the global settings": "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0438\u0433\u0440\u0443 \u043D\u0430 \u043E\u0431\u0449\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    "Right to left": "\u0421\u043F\u0440\u0430\u0432\u0430 \u043D\u0430\u043B\u0435\u0432\u043E",
    "Ring size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u043A\u043E\u043B\u044C\u0446\u0430",
    "Run overlay check": "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u043E\u0432\u0435\u0440\u043B\u0435\u044F",
    "Same as popups": "\u041A\u0430\u043A \u0443 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439",
    "Save key": "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043B\u044E\u0447",
    "Saved to {path}": "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E: {path}",
    "Saved.": "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E.",
    "Saving...": "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435...",
    "Search": "\u041F\u043E\u0438\u0441\u043A",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u044B\u0448\u0435 (\u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043D\u0451\u043C \u043A\u043D\u043E\u043F\u043A\u0443 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F), \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u0435\u0433\u043E \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u043C \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u043C \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0438\u0433\u0440\u044B. \u0418\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0432\u0430\u0448 \u0448\u0430\u0431\u043B\u043E\u043D \u0438 \u0446\u0432\u0435\u0442\u0430 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0438 \u0443\u0445\u043E\u0434\u0438\u0442 \u0437\u0430 \u043A\u0440\u0430\u0439, \u043F\u043E\u043A\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435. \u0427\u0438\u0441\u043B\u043E\u0432\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0432\u0438\u0434\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u0443 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0438\u0433\u0440\u0430 \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043E \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u043E\u0439; \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u043A\u0430\u043A \u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0435 \u0438\u043B\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435.",
    "Select an unlock to make a shareable image card.": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443-\u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438.",
    "Session summary": "\u0418\u0442\u043E\u0433\u0438 \u0441\u0435\u0441\u0441\u0438\u0438",
    "Share card": "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0434\u043B\u044F \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438",
    "Show": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C",
    "Show more": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451",
    "Show screen frame": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0440\u0430\u043C\u043A\u0443 \u044D\u043A\u0440\u0430\u043D\u0430",
    "Show unlock percentage": "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u043D\u0442 \u043F\u043E\u043B\u0443\u0447\u0438\u0432\u0448\u0438\u0445",
    "Showing {shown} of {total}": "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E {shown} \u0438\u0437 {total}",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0443 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u043D\u0430\u0447\u043A\u0430 (\u0438 \u043A\u0430\u043A \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0432 Xbox 360 v2).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "\u041D\u0430 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043A\u0440\u0430\u0441\u043D\u0443\u044E \u0440\u0430\u043C\u043A\u0443 (\u0436\u0451\u043B\u0442\u044B\u0439 \u0431\u043B\u043E\u043A = \u043B\u0435\u0432\u044B\u0439 \u0432\u0435\u0440\u0445\u043D\u0438\u0439 \u0443\u0433\u043E\u043B). \u041E\u043D\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0442\u043E\u0447\u043D\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0442\u044C \u0441 \u043A\u0440\u0430\u044F\u043C\u0438 \u044D\u043A\u0440\u0430\u043D\u0430. \u0415\u0441\u043B\u0438 \u043D\u0435\u0442 \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u044B\u0448\u0435 \u0434\u0440\u0443\u0433\u043E\u0439 \u0440\u0430\u0437\u043C\u0435\u0440.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u043A\u0430\u043A\u043E\u0439 \u043F\u0440\u043E\u0446\u0435\u043D\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 4,7% \u0438\u0433\u0440\u043E\u043A\u043E\u0432.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "\u0420\u0430\u0437\u043C\u0435\u0440 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0433\u043E \u0437\u043D\u0430\u0447\u043A\u0430 \xAB4,7% \u0438\u0433\u0440\u043E\u043A\u043E\u0432\xBB. 100% \u2014 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E.",
    "Solid color": "\u0421\u043F\u043B\u043E\u0448\u043D\u043E\u0439 \u0446\u0432\u0435\u0442",
    "Something went wrong.": "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A.",
    "Sort by": "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430",
    "Sound": "\u0417\u0432\u0443\u043A",
    "Sound & tests": "\u0417\u0432\u0443\u043A \u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0438\u0433\u0440\u0443 \u0438 \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u044D\u0442\u0443 \u043F\u0430\u043D\u0435\u043B\u044C, \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0434\u0430\u0442\u044C \u0434\u043B\u044F \u043D\u0435\u0451 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438. \u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043D\u0438\u0436\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0442 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0438\u0433\u0440.",
    "Steam Web API key": "\u041A\u043B\u044E\u0447 Steam Web API",
    "Steam didn't return any achievement data for this game.": "Steam \u043D\u0435 \u0432\u0435\u0440\u043D\u0443\u043B \u0434\u0430\u043D\u043D\u044B\u0445 \u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F\u0445 \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u044B.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u0438\u043B \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0440\u044B\u0439 \u0437\u043D\u0430\u0447\u043E\u043A -- \u0446\u0432\u0435\u0442\u043D\u043E\u0433\u043E \u0432 \u0435\u0433\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u043D\u0435\u0442.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "API Steam \u0432\u0435\u0440\u043D\u0443\u043B \u043F\u0443\u0441\u0442\u043E\u0439 \u0438\u043B\u0438 \u043D\u0435\u043F\u0440\u0438\u0433\u043E\u0434\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 -- \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u044D\u0448. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u043E\u0434\u043D\u043E\u0439 \u0438 \u0442\u043E\u0439 \u0436\u0435 \u0438\u0433\u0440\u044B, \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u0430 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u043D\u0430 \u0441\u0442\u043E\u0440\u043E\u043D\u0435 Steam.",
    "Steam's achievement library wasn't found on this system.": "\u0411\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 Steam \u0432 \u044D\u0442\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "\u0417\u043D\u0430\u0447\u043E\u043A \u043E\u0442 Steam \u043E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u0441\u0435\u0440\u044B\u043C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0434\u0440\u0443\u0433\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0438\u0437 \u0435\u0433\u043E \u0434\u0430\u043D\u043D\u044B\u0445 (\u0446\u0432\u0435\u0442\u043D\u043E\u0439).",
    "Stop tracking": "\u041F\u0435\u0440\u0435\u0441\u0442\u0430\u0442\u044C \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C",
    "TRACKING": "\u041E\u0422\u0421\u041B\u0415\u0416\u0418\u0412\u0410\u0415\u0422\u0421\u042F",
    "TROPHY UNLOCKED": "\u041A\u0423\u0411\u041E\u041A \u041F\u041E\u041B\u0423\u0427\u0415\u041D",
    "Template effects": "\u042D\u0444\u0444\u0435\u043A\u0442\u044B \u0448\u0430\u0431\u043B\u043E\u043D\u0430",
    "Test Common": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043E\u0431\u044B\u0447\u043D\u043E\u0435",
    "Test Completionist": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0435",
    "Test Rare": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0440\u0435\u0434\u043A\u043E\u0435",
    "Test Ultra Rare": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0441\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435",
    "Test Uncommon": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435",
    "Test almost there alert": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \xAB\u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0451\xBB",
    "Test session summary": "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0438\u0442\u043E\u0433\u0438 \u0441\u0435\u0441\u0441\u0438\u0438",
    "Text": "\u0422\u0435\u043A\u0441\u0442",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "\u0412\u044B\u0437\u043E\u0432 API \u043F\u0440\u043E\u0448\u0451\u043B, \u043D\u043E \u044D\u0442\u043E\u0433\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0432 \u043E\u0442\u0432\u0435\u0442\u0435 \u043D\u0435\u0442 -- \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u044D\u0448.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "\u0421\u0430\u043C \u0432\u044B\u0437\u043E\u0432 Web API \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F (\u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0441\u0435\u0442\u0438) -- \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u044D\u0448.",
    "The big text on the 100% completion popup.": "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442 \u0432 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0438 \u043E 100% \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0438.",
    "The check itself failed: {error}": "\u0421\u0430\u043C\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "\u0426\u0432\u0435\u0442\u043D\u043E\u0435 \u043A\u043E\u043B\u044C\u0446\u043E \u0432\u043E\u043A\u0440\u0443\u0433 \u0437\u043D\u0430\u0447\u043A\u0430, \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0435 \u043E\u0442 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u044F \u0432\u044B\u0448\u0435. \u0415\u0441\u043B\u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E, \u0437\u043D\u0430\u0447\u043E\u043A \u043B\u0435\u0436\u0438\u0442 \u043D\u0430 \u043F\u0440\u043E\u0441\u0442\u043E\u0439 \u0442\u0451\u043C\u043D\u043E\u0439 \u043F\u043E\u0434\u043B\u043E\u0436\u043A\u0435.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0431\u044B\u043B \u0441\u0435\u0440\u044B\u043C (\u0437\u0430\u043A\u0440\u044B\u0442\u044B\u043C); \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0441 \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 Steam.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0431\u044B\u043B \u0441\u0435\u0440\u044B\u043C (\u0437\u0430\u043A\u0440\u044B\u0442\u044B\u043C); \u0434\u043E\u0436\u0434\u0430\u043B\u0438\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F Steam \u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B\u0438 \u0446\u0432\u0435\u0442\u043D\u043E\u0439.",
    "The overall card design/style.": "\u041E\u0431\u0449\u0438\u0439 \u0434\u0438\u0437\u0430\u0439\u043D \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438.",
    "The popup for unlocking every achievement in a game.": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 \u0438\u0433\u0440\u044B.",
    "The probe script is missing -- try reinstalling the plugin.": "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0441\u043A\u0440\u0438\u043F\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 -- \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u0435\u0440\u0435\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "\u041F\u0443\u043B\u044C\u0441\u0438\u0440\u0443\u044E\u0449\u0435\u0435 \u0441\u0432\u0435\u0442\u043E\u0432\u043E\u0435 \u043A\u043E\u043B\u044C\u0446\u043E \u043E\u0431\u044B\u0447\u043D\u043E \u043F\u0440\u043E\u0438\u0433\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0440\u0435\u0434\u043A\u0438\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 -- \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u043D\u043E \u0431\u044B\u043B\u043E \u0438 \u0443 \u043E\u0431\u044B\u0447\u043D\u044B\u0445. (\u0423\u0433\u043B\u043E\u0432\u0430\u044F \u043B\u0435\u043D\u0442\u0430 \u0438 \u0438\u0441\u043A\u0440\u044B \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0443 \u0440\u0435\u0434\u043A\u0438\u0445, \u0442\u0430\u043A \u043A\u0430\u043A \u043E\u0437\u043D\u0430\u0447\u0430\u044E\u0442 \u0438\u043C\u0435\u043D\u043D\u043E \xAB\u044D\u0442\u043E \u0440\u0435\u0434\u043A\u043E\u0435\xBB.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431: \u043A\u0430\u0436\u0434\u044B\u0439 \u0448\u0430\u0431\u043B\u043E\u043D \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0443\u044E \u043F\u0430\u043B\u0438\u0442\u0440\u0443 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0437\u0435\u043B\u0451\u043D\u044B\u0439 Xbox, \u0441\u0438\u043D\u0438\u0439 PlayStation, \u0441\u0438\u043D\u0438\u0439 Steam). \u041F\u043E\u043A\u0430 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E, \u0432\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0446\u0432\u0435\u0442\u0430 \u043D\u0438\u0436\u0435 \u043D\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u044B \u0438 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u044E\u0442\u0441\u044F.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "\u041C\u044F\u0433\u043A\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0432\u043E\u043A\u0440\u0443\u0433 \u0437\u043D\u0430\u0447\u043A\u0430 \u0438 \u043F\u0443\u043B\u044C\u0441\u0438\u0440\u0443\u044E\u0449\u0435\u0435 \u0441\u0432\u0435\u0442\u043E\u0432\u043E\u0435 \u043A\u043E\u043B\u044C\u0446\u043E (\u0443 \u0440\u0435\u0434\u043A\u0438\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439, \u0430 \u0442\u0430\u043A\u0436\u0435 \u0443 \u043E\u0431\u044B\u0447\u043D\u044B\u0445, \u0435\u0441\u043B\u0438 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u043D\u0438\u0436\u0435).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "\u041E\u0441\u043E\u0431\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 \u0438\u0433\u0440\u044B, \u0441 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435\u043C \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043D\u043E\u0439 \u0438\u0433\u0440\u044B.",
    "This game doesn't have any Steam achievements.": "\u0412 \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u0435 \u043D\u0435\u0442 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 Steam.",
    "Timed out talking to Steam. Try refreshing.": "\u0418\u0441\u0442\u0435\u043A\u043B\u043E \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u043E\u0442\u0432\u0435\u0442\u0430 Steam. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C.",
    "Title font size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "\u0417\u043D\u0430\u0447\u043A\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E\u0431\u044B\u0447\u043D\u043E \u0431\u0435\u0440\u0443\u0442\u0441\u044F \u0438\u0437 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u044D\u0448\u0430 Steam, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0438\u043D\u043E\u0433\u0434\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0435 \u0442\u043E\u0442 (\u0441\u0435\u0440\u044B\u0439/\u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0439) \u0437\u043D\u0430\u0447\u043E\u043A. \u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 Steam Web API \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 Finally Achievement Plugin \u043A\u0430\u0436\u0434\u044B\u0439 \u0440\u0430\u0437 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u043F\u0440\u044F\u043C\u043E \u0438\u0437 Steam. \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043A\u043B\u044E\u0447: steamcommunity.com/dev/apikey",
    "Top left": "\u0421\u043B\u0435\u0432\u0430 \u0432\u0432\u0435\u0440\u0445\u0443",
    "Top middle": "\u0421\u0432\u0435\u0440\u0445\u0443 \u043F\u043E \u0446\u0435\u043D\u0442\u0440\u0443",
    "Top right": "\u0421\u043F\u0440\u0430\u0432\u0430 \u0432\u0432\u0435\u0440\u0445\u0443",
    "Top right (descriptions can use 2 lines)": "\u0421\u043F\u0440\u0430\u0432\u0430 \u0432\u0432\u0435\u0440\u0445\u0443 (\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u0438\u043C\u0430\u0442\u044C 2 \u0441\u0442\u0440\u043E\u043A\u0438)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "\u0421\u043F\u0440\u0430\u0432\u0430 \u0432\u0432\u0435\u0440\u0445\u0443 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0432\u0441\u044E \u0448\u0438\u0440\u0438\u043D\u0443: \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u043D\u0435 \u043E\u0431\u0440\u0435\u0437\u0430\u044E\u0442\u0441\u044F \u043C\u043D\u043E\u0433\u043E\u0442\u043E\u0447\u0438\u0435\u043C, \u0430 \u0434\u043B\u0438\u043D\u043D\u044B\u0435 \u043C\u043E\u0433\u0443\u0442 \u0437\u0430\u043D\u0438\u043C\u0430\u0442\u044C \u0434\u0432\u0435 \u0441\u0442\u0440\u043E\u043A\u0438.",
    "Tracker position": "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430",
    "Tracker size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430",
    "Tracker template": "\u0428\u0430\u0431\u043B\u043E\u043D \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430",
    "Tracking": "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F",
    "Trophy": "\u041A\u0443\u0431\u043E\u043A",
    "Type part of a name or description.": "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F \u0438\u043B\u0438 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F.",
    "ULTRA RARE ACHIEVEMENT": "\u0421\u0412\u0415\u0420\u0425\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415",
    "ULTRA RARE TROPHY": "\u0421\u0412\u0415\u0420\u0425\u0420\u0415\u0414\u041A\u0418\u0419 \u041A\u0423\u0411\u041E\u041A",
    "ULTRA RARE UNLOCK!": "\u0421\u0412\u0415\u0420\u0425\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415!",
    "UNCOMMON ACHIEVEMENT": "\u041D\u0415\u041E\u0411\u042B\u0427\u041D\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415",
    "UNCOMMON TROPHY": "\u041D\u0415\u041E\u0411\u042B\u0427\u041D\u042B\u0419 \u041A\u0423\u0411\u041E\u041A",
    "UNCOMMON UNLOCK!": "\u041D\u0415\u041E\u0411\u042B\u0427\u041D\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415!",
    "UNLOCKED": "\u041F\u041E\u041B\u0423\u0427\u0415\u041D\u041E",
    "UNLOCKED!": "\u041F\u041E\u041B\u0423\u0427\u0415\u041D\u041E!",
    "Ultra Rare Achievement": "\u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Ultra rare achievement": "\u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Ultra rare sound": "\u0417\u0432\u0443\u043A \u0441\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0433\u043E",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "\u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435 \u2264 {ultra}%, \u0420\u0435\u0434\u043A\u043E\u0435 \u2264 {rare}%, \u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u2264 {uncommon}%, \u0432\u0441\u0451 \u0432\u044B\u0448\u0435 \u2014 \u043E\u0431\u044B\u0447\u043D\u043E\u0435 (\u0431\u0435\u0437 \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0443\u0440\u043E\u0432\u043D\u044F). \u041F\u043E\u0440\u043E\u0433\u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u043F\u043E \u043F\u043E\u0440\u044F\u0434\u043A\u0443.",
    "Ultra rare: this % or lower": "\u0421\u0432\u0435\u0440\u0445\u0440\u0435\u0434\u043A\u043E\u0435: \u044D\u0442\u043E\u0442 % \u0438\u043B\u0438 \u043C\u0435\u043D\u044C\u0448\u0435",
    "Uncommon Achievement": "\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Uncommon achievement": "\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435",
    "Uncommon sound": "\u0417\u0432\u0443\u043A \u043D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E",
    "Uncommon: this % or lower": "\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u043E\u0435: \u044D\u0442\u043E\u0442 % \u0438\u043B\u0438 \u043C\u0435\u043D\u044C\u0448\u0435",
    "Unlock percentage size": "\u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430 \u043F\u043E\u043B\u0443\u0447\u0438\u0432\u0448\u0438\u0445",
    "Unlocked": "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E",
    "Unlocked first": "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435",
    "Use each template's own colors": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0446\u0432\u0435\u0442\u0430 \u0441\u0430\u043C\u043E\u0433\u043E \u0448\u0430\u0431\u043B\u043E\u043D\u0430",
    "Use the running game for tests": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043D\u0443\u044E \u0438\u0433\u0440\u0443 \u0434\u043B\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0438\u0437 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 Steam (\u043A\u043B\u044E\u0447 API \u043D\u0435 \u043D\u0443\u0436\u0435\u043D).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0438\u0437 Steam Web API (\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0431\u0435\u0437 \u0443\u0447\u0451\u0442\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0438\u0437 Steam Web API.",
    "Vertical (default)": "\u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E (\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E)",
    "Volume": "\u0413\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C",
    "Waiting for live data...": "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0445...",
    "Watcher Status": "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043D\u0430\u0431\u043B\u044E\u0434\u0430\u0442\u0435\u043B\u044F",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "\u041A\u043E\u0433\u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E, \u0432\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043D\u0438\u0436\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u044B \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u043D\u0430 \u0431\u0443\u0434\u0443\u0449\u0435\u0435. \u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u044D\u0442\u043E \u043A\u043E\u043F\u0438\u044F \u0432\u0430\u0448\u0438\u0445 \u0442\u0435\u043A\u0443\u0449\u0438\u0445 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A. \u041F\u0440\u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u043E\u0435 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "\u041F\u0440\u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0438 \u0438\u0433\u0440\u044B \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u0437\u0430 \u0441\u0435\u0441\u0441\u0438\u044E, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E 3, \u0440\u0435\u0434\u043A\u0438\u0445 1.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "\u041A\u043E\u0433\u0434\u0430 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435 \u0441\u0430\u043C\u043E\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0432 \u043B\u044E\u0431\u043E\u0439 \u0438\u0433\u0440\u0435, \u043F\u043E\u0441\u043B\u0435 \u0435\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043E\u0441\u043E\u0431\u043E\u0435 \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0438.",
    "Where the banner appears on screen.": "\u0413\u0434\u0435 \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0431\u0430\u043D\u043D\u0435\u0440.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "\u041A\u0430\u043A\u0438\u043C \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0440\u0438\u0441\u0443\u0435\u0442\u0441\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 Game Art Blur, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u0437\u0430 \u043D\u0438\u043C \u043E\u0431\u043B\u043E\u0436\u043A\u0443 \u0438\u0433\u0440\u044B.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "\u041F\u043E\u043A\u0430 \u0438\u0433\u0440\u0430 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430, \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0438\u0437 \u043D\u0435\u0451 (\u0434\u0430\u0436\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u043E\u0435) \u0441 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u043C \u0437\u043D\u0430\u0447\u043A\u043E\u043C \u0438 \u043E\u0431\u043B\u043E\u0436\u043A\u043E\u0439 \u0438\u0433\u0440\u044B. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043D\u0438\u043A\u043E\u0433\u0434\u0430 \u043D\u0435 \u0437\u0430\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u043A\u0430\u043A \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435. \u0415\u0441\u043B\u0438 \u0438\u0433\u0440\u0430 \u043D\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430 \u0438\u043B\u0438 \u043E\u043F\u0446\u0438\u044F \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u0430, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u0438\u043C\u0435\u0440.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "\u0421\u0432\u043E\u0438 \u0437\u0432\u0443\u043A\u0438: \u043F\u043E\u043C\u0435\u0441\u0442\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B .wav, .flac, .ogg \u0438\u043B\u0438 .mp3 (\u0434\u043E 10 \u041C\u0411, \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0435) \u0432 {folder} \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C\xBB. \u041E\u043D\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0441 \u043F\u043E\u043C\u0435\u0442\u043A\u043E\u0439 \xAB(\u0432\u0430\u0448)\xBB \u043F\u043E\u0441\u043B\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F, \u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043B\u0430\u0433\u0438\u043D\u0430 \u0438\u0445 \u043D\u0435 \u0443\u0434\u0430\u043B\u044F\u0435\u0442. \u041A\u043D\u043E\u043F\u043A\u0430\u043C\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043D\u0438\u0436\u0435 \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0441\u043B\u0443\u0448\u0430\u0442\u044C \u043A\u0430\u0436\u0434\u044B\u0439.",
    "[ACHIEVEMENT]": "[\u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415]",
    "[RARE UNLOCK]": "[\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415]",
    "[ULTRA RARE UNLOCK]": "[\u0421\u0412\u0415\u0420\u0425\u0420\u0415\u0414\u041A\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415]",
    "[UNCOMMON UNLOCK]": "[\u041D\u0415\u041E\u0411\u042B\u0427\u041D\u041E\u0415 \u0414\u041E\u0421\u0422\u0418\u0416\u0415\u041D\u0418\u0415]",
    "never": "\u043D\u0438\u043A\u043E\u0433\u0434\u0430",
    "the Finally Achievement Plugin settings folder, sounds": "\u043F\u0430\u043F\u043A\u0443 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A Finally Achievement Plugin, \u043F\u043E\u0434\u043F\u0430\u043F\u043A\u0443 sounds",
    "{count} unlocked": "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: {count}",
    "{count} unlocked, {rare} rare": "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: {count}, \u0440\u0435\u0434\u043A\u0438\u0445: {rare}",
    "{percent}% of players": "{percent}% \u0438\u0433\u0440\u043E\u043A\u043E\u0432",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E",
    "\u2713 Unlocked": "\u2713 \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E"
  },
  "tr": {
    "(yours)": "(sizin)",
    "0% hides the banner; 50% is the default size.": "0% banner\u0131 gizler; 50% varsay\u0131lan boyuttur.",
    "100% COMPLETE": "%100 TAMAMLANDI",
    "1920 x 1080 (Full HD TV)": "1920 x 1080 (Full HD TV)",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600 (Legion Go ekran\u0131)",
    "3840 x 2160 (4K TV)": "3840 x 2160 (4K TV)",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 varsay\u0131lan g\xF6r\xFCn\xFCmd\xFCr; 0 neredeyse kapal\u0131d\u0131r, 100 iki kat\u0131na \xE7\u0131kar\u0131r.",
    "50% is the default volume; 0% is silent.": "%50 varsay\u0131lan ses seviyesidir; %0 sessizdir.",
    "<0.1% of players": "Oyuncular\u0131n <%0,1",
    "A common unlock (above the Uncommon cutoff): no tier label.": "Yayg\u0131n bir a\xE7\u0131l\u0131\u015F (Az rastlanan s\u0131n\u0131r\u0131n\u0131n \xFCst\xFCnde): kademe etiketi yok.",
    "A rare unlock: gold look, rare sound and glow.": "Nadir bir a\xE7\u0131l\u0131\u015F: alt\u0131n g\xF6r\xFCn\xFCm, nadir ses ve par\u0131lt\u0131.",
    "ACHIEVEMENT UNLOCKED": "BA\u015EARIM A\xC7ILDI",
    "Achievement": "Ba\u015Far\u0131m",
    "Achievement Icon Accuracy": "Ba\u015Far\u0131m Simgesi Do\u011Frulu\u011Fu",
    "Achievement Tracker": "Ba\u015Far\u0131m Takibi",
    "Achievement Unlocked": "Ba\u015Far\u0131m A\xE7\u0131ld\u0131",
    "Achievements": "Ba\u015Far\u0131mlar",
    "Achievements & tracker": "Ba\u015Far\u0131mlar ve takip\xE7i",
    "Advanced": "Geli\u015Fmi\u015F",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "Bir ba\u015Far\u0131m a\xE7t\u0131ktan sonra oyun %100'e yakla\u015Ft\u0131\u011F\u0131nda \u201CYaln\u0131zca 2 ba\u015Far\u0131m kald\u0131\u201D gibi bir bildirim g\xF6sterir.",
    "Alert when this many are left": "Bu kadar kald\u0131\u011F\u0131nda uyar",
    "Almost there alert": "Neredeyse tamam uyar\u0131s\u0131",
    "Alphabetical": "Alfabetik",
    "An ultra rare unlock: extra sparkles and a longer shine.": "\xC7ok nadir bir a\xE7\u0131l\u0131\u015F: ekstra par\u0131lt\u0131lar ve daha uzun bir \u0131\u015F\u0131lt\u0131.",
    "An uncommon unlock: tier label only.": "Az rastlanan bir a\xE7\u0131l\u0131\u015F: yaln\u0131zca kademe etiketi.",
    "App {id}": "Uygulama {id}",
    "Appearance": "G\xF6r\xFCn\xFCm",
    "Auto (Steam language)": "Otomatik (Steam dili)",
    "Auto (detect)": "Otomatik (alg\u0131la)",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "Otomatik, Deck'in kendi ekran\u0131nda do\u011Fru \xE7al\u0131\u015F\u0131r. Bir TV'de bildirimler yanl\u0131\u015F yere d\xFC\u015F\xFCyorsa TV'nin \xE7\xF6z\xFCn\xFCrl\xFC\u011F\xFCn\xFC se\xE7in ve a\u015Fa\u011F\u0131daki \xE7er\xE7eve testiyle kontrol edin.",
    "Bottom left": "Sol alt",
    "Bottom middle": "Alt orta",
    "Bottom right": "Sa\u011F alt",
    "Bottom right (default)": "Sa\u011F alt (varsay\u0131lan)",
    "Checking...": "Kontrol ediliyor...",
    "Clear history": "Ge\xE7mi\u015Fi temizle",
    "Clear search": "Aramay\u0131 temizle",
    "Colors": "Renkler",
    "Colors & style": "Renkler ve stil",
    "Common sound": "Yayg\u0131n ses",
    "Completion popup at 100%": "%100'de tamamlama bildirimi",
    "Completion popup name": "Tamamlama bildirimi ad\u0131",
    "Completionist": "Tamamlay\u0131c\u0131",
    "Completionist sound": "Tamamlama sesi",
    "Could not save the card: {error}": "Kart kaydedilemedi: {error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "Bu simgenin renkli olan oldu\u011Fu do\u011Frulanamad\u0131 ve daha iyisi bulunamad\u0131.",
    "Couldn't identify the game/achievement for this unlock.": "Bu a\xE7\u0131l\u0131\u015F i\xE7in oyun/ba\u015Far\u0131m belirlenemedi.",
    "Couldn't save that key.": "Bu anahtar kaydedilemedi.",
    "Couldn't start the achievement probe.": "Ba\u015Far\u0131m yoklamas\u0131 ba\u015Flat\u0131lamad\u0131.",
    "Crowned": "Ta\xE7land\u0131r\u0131ld\u0131",
    "Currently Playing": "\u015Eu An Oynanan",
    "Custom settings for this game": "Bu oyun i\xE7in \xF6zel ayarlar",
    "Custom settings for {name}": "{name} i\xE7in \xF6zel ayarlar",
    "Default (game icon, else badge)": "Varsay\u0131lan (oyun simgesi, yoksa rozet)",
    "Description font size": "A\xE7\u0131klama yaz\u0131 boyutu",
    "Direction of the card's background gradient, or a flat solid color.": "Kart\u0131n arka plan gradyan\u0131n\u0131n y\xF6n\xFC veya d\xFCz tek renk.",
    "Editing settings for all games.": "T\xFCm oyunlar i\xE7in ayarlar d\xFCzenleniyor.",
    "Editing settings for {name} only.": "Yaln\u0131zca {name} i\xE7in ayarlar d\xFCzenleniyor.",
    "Everyday unlocks (above the Uncommon cutoff).": "S\u0131radan a\xE7\u0131l\u0131\u015Flar (Az rastlanan s\u0131n\u0131r\u0131n\u0131n \xFCst\xFC).",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "Baz\u0131 \u015Fablonlarda ekstralar: yaz\u0131lan metin, hareketli arka planlar, aksakl\u0131k efektleri, vidalar, oyun ad\u0131 ba\u015Fl\u0131\u011F\u0131 ve daha fazlas\u0131. Sade g\xF6r\xFCn\xFCm i\xE7in kapat\u0131n.",
    "Font size of the achievement name.": "Ba\u015Far\u0131m ad\u0131n\u0131n yaz\u0131 boyutu.",
    "Font size of the small eyebrow label above the title.": "Ba\u015Fl\u0131\u011F\u0131n \xFCst\xFCndeki k\xFC\xE7\xFCk etiketin yaz\u0131 boyutu.",
    "Font size of the subtitle/description line.": "Alt ba\u015Fl\u0131k/a\xE7\u0131klama sat\u0131r\u0131n\u0131n yaz\u0131 boyutu.",
    "Game Settings": "Oyun Ayarlar\u0131",
    "Game icon": "Oyun simgesi",
    "Glow": "Par\u0131lt\u0131",
    "Glow for normal achievements": "Normal ba\u015Far\u0131mlar i\xE7in par\u0131lt\u0131",
    "Glow intensity": "Par\u0131lt\u0131 yo\u011Funlu\u011Fu",
    "Got an unexpected response from Steam.": "Steam'den beklenmeyen bir yan\u0131t al\u0131nd\u0131.",
    "Gradient direction": "Gradyan y\xF6n\xFC",
    "Gradient from game artwork colors": "Gradyan\u0131 oyun g\xF6rseli renklerinden al",
    "Gradient from icon colors": "Gradyan\u0131 simge renklerinden al",
    "History & sharing": "Ge\xE7mi\u015F ve payla\u015F\u0131m",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "Par\u0131lt\u0131 halkalar\u0131n\u0131n ne kadar yay\u0131ld\u0131\u011F\u0131. 50 varsay\u0131lan g\xF6r\xFCn\xFCmd\xFCr; 0 onlar\u0131 gizler, 100 iki kat\u0131na \xE7\u0131kar\u0131r.",
    "How long the toast stays on screen before it slides away.": "Bildirimin kay\u0131p gitmeden \xF6nce ekranda kalma s\xFCresi.",
    "Icon frame ring": "Simge \xE7er\xE7eve halkas\u0131",
    "Icon glow": "Simge par\u0131lt\u0131s\u0131",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "Sesi duyuyor ama bildirim g\xF6r\xFCnm\xFCyorsa (\xF6rne\u011Fin farkl\u0131 bir el konsolunda) bu kontrol\xFC \xE7al\u0131\u015Ft\u0131r\u0131n. Bildirimin ihtiya\xE7 duydu\u011Fu Python paketlerini, grafik kitapl\u0131klar\u0131n\u0131, ekran\u0131 ve pencere olu\u015Fturmay\u0131 s\u0131nar ve nelerin eksik oldu\u011Funu s\xF6yler.",
    "In progress": "Devam ediyor",
    "Key saved (ending in {tail})": "Anahtar kaydedildi ({tail} ile biten)",
    "Label font size": "Etiket yaz\u0131 boyutu",
    "Language": "Dil",
    "Last unlock's icon:": "Son a\xE7\u0131l\u0131\u015F\u0131n simgesi:",
    "Left to right": "Soldan sa\u011Fa",
    "Legendary Achievement unlocked": "Efsanevi Ba\u015Far\u0131m a\xE7\u0131ld\u0131",
    "Loading achievements...": "Ba\u015Far\u0131mlar y\xFCkleniyor...",
    "Loading...": "Y\xFCkleniyor...",
    "Making card...": "Kart haz\u0131rlan\u0131yor...",
    "Manual common popup test": "Elle yayg\u0131n bildirim testi",
    "Manual rare popup test": "Elle nadir bildirim testi",
    "Manual ultra rare popup test": "Elle \xE7ok nadir bildirim testi",
    "Manual uncommon popup test": "Elle az rastlanan bildirim testi",
    "Manually refresh backend status.": "Arka u\xE7 durumunu elle yenile.",
    "Milestone popups": "D\xF6n\xFCm noktas\u0131 bildirimleri",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "Her a\xE7\u0131l\u0131\u015F\u0131, ka\xE7 oyuncuda oldu\u011Funa g\xF6re (Az rastlanan, Nadir, \xC7ok nadir) bildirim etiketinde adland\u0131r\u0131r. \xC7ok nadir ayr\u0131ca ekstra par\u0131lt\u0131 ve daha uzun bir \u0131\u015F\u0131lt\u0131 al\u0131r. Nadir, alt\u0131n g\xF6r\xFCn\xFCm\xFC ve sesi korur.",
    "Needs Rarity Tiers on; otherwise common sounds play.": "Nadirlik Kademeleri a\xE7\u0131k olmal\u0131; aksi halde yayg\u0131n sesler \xE7alar.",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "Nadirlik Kademeleri a\xE7\u0131k olmal\u0131; aksi halde nadir ses \xE7alar.",
    "New achievement": "Yeni ba\u015Far\u0131m",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "API anahtar\u0131 ayarlanmad\u0131 -- yaln\u0131zca yerel \xF6nbellek kullan\u0131l\u0131yor (renkli simge garanti edilemez).",
    "No API key set -- using the local cache only.": "API anahtar\u0131 ayarlanmad\u0131 -- yaln\u0131zca yerel \xF6nbellek kullan\u0131l\u0131yor.",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "\xC7ince yaz\u0131 tipi bulunamad\u0131, bu y\xFCzden \xC7ince bildirim metni bo\u015F kutular olarak g\xF6r\xFCnebilir. Bir yaz\u0131 tipi dosyas\u0131n\u0131 (.ttf, .otf veya .ttc, \xF6rne\u011Fin Noto Sans SC) {folder} klas\xF6r\xFCne kopyalay\u0131n ve bir test bildirimi \xE7al\u0131\u015Ft\u0131r\u0131n.",
    "No achievements found for this game.": "Bu oyun i\xE7in ba\u015Far\u0131m bulunamad\u0131.",
    "No achievements match your search.": "Araman\u0131zla e\u015Fle\u015Fen ba\u015Far\u0131m yok.",
    "No game is currently running.": "\u015Eu anda \xE7al\u0131\u015Fan bir oyun yok.",
    "No game running": "\xC7al\u0131\u015Fan oyun yok",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "Hen\xFCz kay\u0131tl\u0131 a\xE7\u0131l\u0131\u015F yok. Bundan sonra a\xE7t\u0131\u011F\u0131n\u0131z ba\u015Far\u0131mlar burada g\xF6r\xFCnecek.",
    "Nothing pinned right now.": "\u015Eu an sabitlenmi\u015F bir \u015Fey yok.",
    "Nothing unlocked yet this session.": "Bu oturumda hen\xFCz bir \u015Fey a\xE7\u0131lmad\u0131.",
    "Only 1 achievement left": "Yaln\u0131zca 1 ba\u015Far\u0131m kald\u0131",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "Bu sefer yaln\u0131zca gri (kilitli) simge mevcuttu -- renkli olan bulunamad\u0131.",
    "Only {count} achievements left": "Yaln\u0131zca {count} ba\u015Far\u0131m kald\u0131",
    "Percentage badge position": "Y\xFCzde rozeti konumu",
    "Placeholder icon": "Yer tutucu simge",
    "Popup": "Bildirim",
    "Popup Not Showing?": "Bildirim G\xF6r\xFCnm\xFCyor mu?",
    "Popup Tests": "Bildirim Testleri",
    "Popup duration": "Bildirim s\xFCresi",
    "Popup position": "Bildirim konumu",
    "Popup screen size": "Bildirim ekran boyutu",
    "Popup size": "Bildirim boyutu",
    "Popup template": "Bildirim \u015Fablonu",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "Kart\u0131n arka plan gradyan\u0131n\u0131, a\u015Fa\u011F\u0131daki sabit renkler yerine ba\u015Far\u0131m simgesinin kendi renklerinden al\u0131r. Paper Light d\u0131\u015F\u0131ndaki her \u015Fablonda \xE7al\u0131\u015F\u0131r. Simgede belirgin bask\u0131n renk yoksa (veya simge yoksa) sabit renklere d\xF6ner.",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "Gradyan\u0131 bunun yerine oyunun kendi g\xF6rselinden al\u0131r; b\xF6ylece bir oyundaki t\xFCm bildirimler tek bir palet payla\u015F\u0131r. Bunu a\xE7mak yukar\u0131daki simge se\xE7ene\u011Fini kapat\u0131r (ikisinden biri ge\xE7erlidir). G\xF6rsel okunamazsa simgenin renklerine d\xF6ner.",
    "RARE ACHIEVEMENT": "NAD\u0130R BA\u015EARIM",
    "RARE ACHIEVEMENT UNLOCKED": "NAD\u0130R BA\u015EARIM A\xC7ILDI",
    "RARE TROPHY UNLOCKED": "NAD\u0130R KUPA A\xC7ILDI",
    "RARE UNLOCK!": "NAD\u0130R A\xC7ILI\u015E!",
    "Rare Achievement Unlocked": "Nadir Ba\u015Far\u0131m A\xE7\u0131ld\u0131",
    "Rare achievement": "Nadir ba\u015Far\u0131m",
    "Rare sound": "Nadir ses",
    "Rare unlocks.": "Nadir a\xE7\u0131l\u0131\u015Flar.",
    "Rare: this % or lower": "Nadir: bu % veya alt\u0131",
    "Rarity (rarest first)": "Nadirlik (en nadir \xF6nce)",
    "Rarity Tiers": "Nadirlik Kademeleri",
    "Rarity tiers": "Nadirlik kademeleri",
    "Recent Unlocks": "Son A\xE7\u0131lanlar",
    "Refresh": "Yenile",
    "Refresh sound list": "Ses listesini yenile",
    "Refreshing...": "Yenileniyor...",
    "Remove key": "Anahtar\u0131 kald\u0131r",
    "Removed.": "Kald\u0131r\u0131ld\u0131.",
    "Reset this game to the global settings": "Bu oyunu genel ayarlara s\u0131f\u0131rla",
    "Right to left": "Sa\u011Fdan sola",
    "Ring size": "Halka boyutu",
    "Run overlay check": "Katman kontrol\xFCn\xFC \xE7al\u0131\u015Ft\u0131r",
    "Same as popups": "Bildirimlerle ayn\u0131",
    "Save key": "Anahtar\u0131 kaydet",
    "Saved to {path}": "{path} konumuna kaydedildi",
    "Saved.": "Kaydedildi.",
    "Saving...": "Kaydediliyor...",
    "Search": "Ara",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "Oynarken ekranda k\xFC\xE7\xFCk bir takip\xE7i olarak sabitlemek i\xE7in yukar\u0131dan bir ba\u015Far\u0131m se\xE7in (\xFCzerinde eylem tu\u015Funa bas\u0131n). Takip\xE7i bildirim \u015Fablonunuzu ve renklerinizi kullan\u0131r, bir bildirim g\xF6sterilirken kenara kayar. Say\u0131sal ilerleme yaln\u0131zca oyunun takip edilebilir bir istatisti\u011Fe ba\u011Flad\u0131\u011F\u0131 ba\u015Far\u0131mlarda g\xF6r\xFCn\xFCr; di\u011Ferleri kilitli veya a\xE7\u0131k olarak g\xF6sterilir.",
    "Select an unlock to make a shareable image card.": "Payla\u015F\u0131labilir bir g\xF6rsel kart olu\u015Fturmak i\xE7in bir ba\u015Far\u0131m se\xE7in.",
    "Session summary": "Oturum \xF6zeti",
    "Share card": "Payla\u015F\u0131m kart\u0131",
    "Show": "G\xF6ster",
    "Show more": "Daha fazla g\xF6ster",
    "Show screen frame": "Ekran \xE7er\xE7evesini g\xF6ster",
    "Show unlock percentage": "A\xE7\u0131lma y\xFCzdesini g\xF6ster",
    "Showing {shown} of {total}": "{total} i\xE7inden {shown} g\xF6steriliyor",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "Bir ba\u015Far\u0131m\u0131n hen\xFCz simgesi yokken g\xF6sterilir (ve Xbox 360 v2'de ba\u015Flang\u0131\xE7 simgesi olarak).",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "Birka\xE7 saniye k\u0131rm\u0131z\u0131 bir \xE7er\xE7eve g\xF6sterir (sar\u0131 blok = sol \xFCst). Tam olarak ekran kenarlar\u0131nda durmal\u0131d\u0131r. Durmuyorsa yukar\u0131dan ba\u015Fka bir boyut se\xE7in.",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "Ba\u015Far\u0131ma sahip oyuncular\u0131n y\xFCzdesini g\xF6sterir, \xF6rn. oyuncular\u0131n %4,7'si.",
    "Size of the small '4.7% of players' badge. 100% is the default.": "K\xFC\xE7\xFCk 'oyuncular\u0131n %4,7'si' rozetinin boyutu. 100% varsay\u0131land\u0131r.",
    "Solid color": "D\xFCz renk",
    "Something went wrong.": "Bir \u015Feyler ters gitti.",
    "Sort by": "S\u0131rala",
    "Sound": "Ses",
    "Sound & tests": "Ses ve testler",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "Bir oyun ba\u015Flat\u0131n, ard\u0131ndan ona \xF6zel ayarlar vermek i\xE7in bu paneli a\xE7\u0131n. \u015Eu an a\u015Fa\u011F\u0131daki ayarlar t\xFCm oyunlar i\xE7in ge\xE7erlidir.",
    "Steam Web API key": "Steam Web API anahtar\u0131",
    "Steam didn't return any achievement data for this game.": "Steam bu oyun i\xE7in hi\xE7bir ba\u015Far\u0131m verisi d\xF6nd\xFCrmedi.",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam bu ba\u015Far\u0131m i\xE7in yaln\u0131zca gri bir simge sa\u011Flad\u0131 -- verisinde renkli olan yok.",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "Steam'in API'si bo\u015F/kullan\u0131lamaz bir yan\u0131t d\xF6nd\xFCrd\xFC -- yerel \xF6nbelle\u011Fe d\xF6n\xFCld\xFC. Ayn\u0131 oyunda bu tekrar ederse Steam taraf\u0131nda ge\xE7ici bir sorun olabilir.",
    "Steam's achievement library wasn't found on this system.": "Steam'in ba\u015Far\u0131m kitapl\u0131\u011F\u0131 bu sistemde bulunamad\u0131.",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "Steam'in simgesi gri geldi, bu y\xFCzden verisindeki di\u011Fer simge (renkli olan) kullan\u0131ld\u0131.",
    "Stop tracking": "Takibi durdur",
    "TRACKING": "TAK\u0130P ED\u0130L\u0130YOR",
    "TROPHY UNLOCKED": "KUPA A\xC7ILDI",
    "Template effects": "\u015Eablon efektleri",
    "Test Common": "Yayg\u0131n\u0131 test et",
    "Test Completionist": "Tamamlamay\u0131 test et",
    "Test Rare": "Nadiri test et",
    "Test Ultra Rare": "\xC7ok nadiri test et",
    "Test Uncommon": "Az rastlanan\u0131 test et",
    "Test almost there alert": "Neredeyse tamam uyar\u0131s\u0131n\u0131 test et",
    "Test session summary": "Oturum \xF6zetini test et",
    "Text": "Metin",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "API \xE7a\u011Fr\u0131s\u0131 \xE7al\u0131\u015Ft\u0131 ama bu ba\u015Far\u0131m i\xE7inde bulunamad\u0131 -- yerel \xF6nbelle\u011Fe d\xF6n\xFCld\xFC.",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "Web API \xE7a\u011Fr\u0131s\u0131n\u0131n kendisi ba\u015Far\u0131s\u0131z oldu (a\u011F sorunu) -- yerel \xF6nbelle\u011Fe d\xF6n\xFCld\xFC.",
    "The big text on the 100% completion popup.": "%100 tamamlama bildirimindeki b\xFCy\xFCk metin.",
    "The check itself failed: {error}": "Kontrol\xFCn kendisi ba\u015Far\u0131s\u0131z oldu: {error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "Simgeyi \xE7er\xE7eveleyen renkli halka, yukar\u0131daki par\u0131lt\u0131dan ba\u011F\u0131ms\u0131zd\u0131r. Kapal\u0131yken simge sade koyu bir zeminde durur.",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "Yerel simge griydi (kilitli); Steam'in herkese a\xE7\u0131k ba\u015Far\u0131mlar sayfas\u0131ndaki renkli simge kullan\u0131ld\u0131.",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "Yerel simge griydi (kilitli); Steam'in g\xFCncellemesi beklendi ve renkli olan kullan\u0131ld\u0131.",
    "The overall card design/style.": "Kart\u0131n genel tasar\u0131m\u0131/stili.",
    "The popup for unlocking every achievement in a game.": "Bir oyundaki t\xFCm ba\u015Far\u0131mlar\u0131 a\xE7ma bildirimi.",
    "The probe script is missing -- try reinstalling the plugin.": "Yoklama beti\u011Fi eksik -- eklentiyi yeniden y\xFCklemeyi deneyin.",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "Nab\u0131z gibi atan par\u0131lt\u0131 halkas\u0131 normalde yaln\u0131zca nadir a\xE7\u0131l\u0131\u015Flarda oynar -- s\u0131radan olanlarda da oynamas\u0131 i\xE7in bunu a\xE7\u0131n. (Nadir k\xF6\u015Fe kurdelesi ve par\u0131lt\u0131lar yaln\u0131zca nadirlere \xF6zel kal\u0131r, \xE7\xFCnk\xFC bunlar \xF6zellikle 'bu nadir' anlam\u0131na gelir.)",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "Basit yol: her \u015Fablon kendi yerle\u015Fik paletini kullan\u0131r (\xF6rne\u011Fin Xbox ye\u015Fili, PlayStation mavisi, Steam mavisi). Bu a\xE7\u0131kken a\u015Fa\u011F\u0131daki t\xFCm renk se\xE7enekleri soluk g\xF6sterilir ve yok say\u0131l\u0131r.",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "Simgenin etraf\u0131ndaki yumu\u015Fak par\u0131lt\u0131 ve nab\u0131z gibi atan par\u0131lt\u0131 halkas\u0131 (nadir ba\u015Far\u0131mlar, veya a\u015Fa\u011F\u0131da a\xE7\u0131l\u0131rsa normal olanlar da).",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "Bir oyundaki t\xFCm ba\u015Far\u0131mlar\u0131 a\xE7ma \xF6zel bildirimi; \xE7al\u0131\u015Fan oyunun ad\u0131n\u0131 kullan\u0131r.",
    "This game doesn't have any Steam achievements.": "Bu oyunun hi\xE7 Steam ba\u015Far\u0131m\u0131 yok.",
    "Timed out talking to Steam. Try refreshing.": "Steam ile ileti\u015Fim zaman a\u015F\u0131m\u0131na u\u011Frad\u0131. Yenilemeyi deneyin.",
    "Title font size": "Ba\u015Fl\u0131k yaz\u0131 boyutu",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "Bildirim simgeleri normalde Steam'in yerel \xF6nbelle\u011Finden gelir ve bu bazen yanl\u0131\u015F (gri tonlamal\u0131/kilitli) simge g\xF6sterebilir. \xDCcretsiz bir Steam Web API anahtar\u0131 eklemek, Finally Achievement Plugin'in do\u011Frulu\u011Fu garantili, tam renkli simgeyi her seferinde do\u011Frudan Steam'den almas\u0131n\u0131 sa\u011Flar. Bir tane almak i\xE7in: steamcommunity.com/dev/apikey",
    "Top left": "Sol \xFCst",
    "Top middle": "\xDCst orta",
    "Top right": "Sa\u011F \xFCst",
    "Top right (descriptions can use 2 lines)": "Sa\u011F \xFCst (a\xE7\u0131klamalar 2 sat\u0131r kullanabilir)",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "Sa\u011F \xFCst, a\xE7\u0131klamaya t\xFCm geni\u015Fli\u011Fi verir; b\xF6ylece k\u0131sa a\xE7\u0131klamalar ... ile bitmez, uzun olanlar iki sat\u0131r kullanabilir.",
    "Tracker position": "Takip\xE7i konumu",
    "Tracker size": "Takip\xE7i boyutu",
    "Tracker template": "Takip\xE7i \u015Fablonu",
    "Tracking": "Takipte",
    "Trophy": "Kupa",
    "Type part of a name or description.": "Ad\u0131n veya a\xE7\u0131klaman\u0131n bir k\u0131sm\u0131n\u0131 yaz\u0131n.",
    "ULTRA RARE ACHIEVEMENT": "\xC7OK NAD\u0130R BA\u015EARIM",
    "ULTRA RARE TROPHY": "\xC7OK NAD\u0130R KUPA",
    "ULTRA RARE UNLOCK!": "\xC7OK NAD\u0130R A\xC7ILI\u015E!",
    "UNCOMMON ACHIEVEMENT": "AZ RASTLANAN BA\u015EARIM",
    "UNCOMMON TROPHY": "AZ RASTLANAN KUPA",
    "UNCOMMON UNLOCK!": "AZ RASTLANAN A\xC7ILI\u015E!",
    "UNLOCKED": "A\xC7ILDI",
    "UNLOCKED!": "A\xC7ILDI!",
    "Ultra Rare Achievement": "\xC7ok Nadir Ba\u015Far\u0131m",
    "Ultra rare achievement": "\xC7ok nadir ba\u015Far\u0131m",
    "Ultra rare sound": "\xC7ok nadir ses",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "\xC7ok nadir \u2264 {ultra}%, Nadir \u2264 {rare}%, Az rastlanan \u2264 {uncommon}%, daha y\xFCksek her \u015Fey yayg\u0131nd\u0131r (kademe etiketi yok). S\u0131n\u0131rlar otomatik olarak s\u0131ral\u0131 kal\u0131r.",
    "Ultra rare: this % or lower": "\xC7ok nadir: bu % veya alt\u0131",
    "Uncommon Achievement": "Az Rastlanan Ba\u015Far\u0131m",
    "Uncommon achievement": "Az rastlanan ba\u015Far\u0131m",
    "Uncommon sound": "Az rastlanan ses",
    "Uncommon: this % or lower": "Az rastlanan: bu % veya alt\u0131",
    "Unlock percentage size": "A\xE7\u0131lma y\xFCzdesi boyutu",
    "Unlocked": "A\xE7\u0131ld\u0131",
    "Unlocked first": "\xD6nce a\xE7\u0131lanlar",
    "Use each template's own colors": "Her \u015Fablonun kendi renklerini kullan",
    "Use the running game for tests": "Testlerde \xE7al\u0131\u015Fan oyunu kullan",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "Steam'in kendi yerel ba\u015Far\u0131m verisinden renkli simge kullan\u0131ld\u0131 (API anahtar\u0131 gerekmez).",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "Steam'in Web API'sinden do\u011Frulu\u011Fu garantili renkli simge kullan\u0131ld\u0131 (b\xFCy\xFCk/k\xFC\xE7\xFCk harf duyars\u0131z e\u015Fle\u015Fme).",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "Steam'in Web API'sinden do\u011Frulu\u011Fu garantili renkli simge kullan\u0131ld\u0131.",
    "Vertical (default)": "Dikey (varsay\u0131lan)",
    "Volume": "Ses seviyesi",
    "Waiting for live data...": "Canl\u0131 veri bekleniyor...",
    "Watcher Status": "\u0130zleyici Durumu",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "A\xE7\u0131kken, a\u015Fa\u011F\u0131daki t\xFCm ayarlar yaln\u0131zca bu oyun i\xE7in ge\xE7erlidir ve bir sonraki sefer i\xE7in kaydedilir. Mevcut ayarlar\u0131n\u0131z\u0131n bir kopyas\u0131yla ba\u015Flar. Kapatmak, kaydettiklerinizi korur.",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "Bir oyunu kapatt\u0131\u011F\u0131n\u0131zda, oynarken ka\xE7 ba\u015Far\u0131m a\xE7t\u0131\u011F\u0131n\u0131z\u0131 g\xF6sterir; \xF6rne\u011Fin 3 a\xE7\u0131ld\u0131, 1 nadir.",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "Herhangi bir oyundaki son ba\u015Far\u0131m\u0131 a\xE7t\u0131\u011F\u0131n\u0131zda, o ba\u015Far\u0131m\u0131n kendi bildiriminden sonra \xF6zel bir z\xFCmr\xFCt rengi tamamlama bildirimi g\xF6sterir.",
    "Where the banner appears on screen.": "Banner\u0131n ekranda g\xF6r\xFCnd\xFC\u011F\xFC yer.",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "Takip\xE7inin hangi bildirim \u015Fablonuyla \xE7izilece\u011Fi. Oyunun g\xF6rselini arkas\u0131na koymak i\xE7in Game Art Blur'u deneyin.",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "Bir oyun \xE7al\u0131\u015F\u0131rken testler, ondan rastgele bir ba\u015Far\u0131m\u0131 (kilitli olan dahil) ger\xE7ek simgesi ve oyunun g\xF6rseliyle g\xF6sterir. Testler asla a\xE7\u0131l\u0131\u015F say\u0131lmaz. \xC7al\u0131\u015Fan oyun yoksa veya bu kapal\u0131ysa testler bir \xF6rnek kullan\u0131r.",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': `Kendi seslerinizi ekleyin: .wav, .flac, .ogg veya .mp3 dosyalar\u0131n\u0131 (10 MB veya daha k\xFC\xE7\xFCk, k\u0131sa tutun) {folder} klas\xF6r\xFCne koyup Yenile'ye bas\u0131n. Adlar\u0131n\u0131n yan\u0131nda "(sizin)" ile g\xF6r\xFCn\xFCrler ve eklentiyi g\xFCncellemek onlar\u0131 asla silmez. Her birini duymak i\xE7in a\u015Fa\u011F\u0131daki test d\xFC\u011Fmelerini kullan\u0131n.`,
    "[ACHIEVEMENT]": "[BA\u015EARIM]",
    "[RARE UNLOCK]": "[NAD\u0130R A\xC7ILI\u015E]",
    "[ULTRA RARE UNLOCK]": "[\xC7OK NAD\u0130R A\xC7ILI\u015E]",
    "[UNCOMMON UNLOCK]": "[AZ RASTLANAN A\xC7ILI\u015E]",
    "never": "hi\xE7",
    "the Finally Achievement Plugin settings folder, sounds": "Finally Achievement Plugin ayar klas\xF6r\xFC, sounds",
    "{count} unlocked": "{count} a\xE7\u0131ld\u0131",
    "{count} unlocked, {rare} rare": "{count} a\xE7\u0131ld\u0131, {rare} nadir",
    "{percent}% of players": "Oyuncular\u0131n %{percent}",
    "{unlocked} / {total} unlocked": "{unlocked} / {total} a\xE7\u0131ld\u0131",
    "\u2713 Unlocked": "\u2713 A\xE7\u0131ld\u0131"
  },
  "zh-Hans": {
    "(yours)": "\uFF08\u81EA\u5B9A\u4E49\uFF09",
    "0% hides the banner; 50% is the default size.": "0% \u4F1A\u9690\u85CF\u6A2A\u5E45\uFF1B50% \u4E3A\u9ED8\u8BA4\u5927\u5C0F\u3002",
    "100% COMPLETE": "100% \u5B8C\u6210",
    "1920 x 1080 (Full HD TV)": "1920 x 1080\uFF08\u5168\u9AD8\u6E05\u7535\u89C6\uFF09",
    "2560 x 1600 (Legion Go screen)": "2560 x 1600\uFF08Legion Go \u5C4F\u5E55\uFF09",
    "3840 x 2160 (4K TV)": "3840 x 2160\uFF084K \u7535\u89C6\uFF09",
    "50 is the default look; 0 is basically off, 100 doubles it.": "50 \u4E3A\u9ED8\u8BA4\u6548\u679C\uFF1B0 \u57FA\u672C\u7B49\u4E8E\u5173\u95ED\uFF0C100 \u4E3A\u4E24\u500D\u3002",
    "50% is the default volume; 0% is silent.": "50% \u4E3A\u9ED8\u8BA4\u97F3\u91CF\uFF1B0% \u4E3A\u9759\u97F3\u3002",
    "<0.1% of players": "<0.1% \u7684\u73A9\u5BB6",
    "A common unlock (above the Uncommon cutoff): no tier label.": "\u666E\u901A\u89E3\u9501\uFF08\u9AD8\u4E8E\u201C\u5C11\u89C1\u201D\u9608\u503C\uFF09\uFF1A\u6CA1\u6709\u7B49\u7EA7\u6807\u7B7E\u3002",
    "A rare unlock: gold look, rare sound and glow.": "\u7A00\u6709\u89E3\u9501\uFF1A\u91D1\u8272\u5916\u89C2\u3001\u7A00\u6709\u97F3\u6548\u548C\u5149\u6655\u3002",
    "ACHIEVEMENT UNLOCKED": "\u6210\u5C31\u5DF2\u89E3\u9501",
    "Achievement": "\u6210\u5C31",
    "Achievement Icon Accuracy": "\u6210\u5C31\u56FE\u6807\u51C6\u786E\u6027",
    "Achievement Tracker": "\u6210\u5C31\u8FFD\u8E2A",
    "Achievement Unlocked": "\u6210\u5C31\u5DF2\u89E3\u9501",
    "Achievements": "\u6210\u5C31",
    "Achievements & tracker": "\u6210\u5C31\u4E0E\u8FFD\u8E2A\u5668",
    "Advanced": "\u9AD8\u7EA7",
    "After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.": "\u89E3\u9501\u6210\u5C31\u540E\uFF0C\u5F53\u6E38\u620F\u63A5\u8FD1 100% \u65F6\uFF0C\u663E\u793A\u7C7B\u4F3C\u201C\u4EC5\u5269 2 \u4E2A\u6210\u5C31\u201D\u7684\u5F39\u7A97\u3002",
    "Alert when this many are left": "\u5269\u4F59\u591A\u5C11\u4E2A\u65F6\u63D0\u9192",
    "Almost there alert": "\u5373\u5C06\u5168\u6210\u5C31\u63D0\u9192",
    "Alphabetical": "\u6309\u5B57\u6BCD\u987A\u5E8F",
    "An ultra rare unlock: extra sparkles and a longer shine.": "\u6781\u7A00\u6709\u89E3\u9501\uFF1A\u66F4\u591A\u95EA\u5149\u548C\u66F4\u957F\u7684\u5149\u6CFD\u3002",
    "An uncommon unlock: tier label only.": "\u5C11\u89C1\u89E3\u9501\uFF1A\u4EC5\u5E26\u7B49\u7EA7\u6807\u7B7E\u3002",
    "App {id}": "\u5E94\u7528 {id}",
    "Appearance": "\u5916\u89C2",
    "Auto (Steam language)": "\u81EA\u52A8\uFF08Steam \u8BED\u8A00\uFF09",
    "Auto (detect)": "\u81EA\u52A8\uFF08\u68C0\u6D4B\uFF09",
    "Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.": "\u81EA\u52A8\u6A21\u5F0F\u9002\u7528\u4E8E Deck \u81EA\u5E26\u5C4F\u5E55\u3002\u5728\u7535\u89C6\u4E0A\u5982\u679C\u5F39\u7A97\u4F4D\u7F6E\u4E0D\u5BF9\uFF0C\u8BF7\u9009\u62E9\u7535\u89C6\u7684\u5206\u8FA8\u7387\uFF0C\u5E76\u7528\u4E0B\u65B9\u7684\u8FB9\u6846\u6D4B\u8BD5\u786E\u8BA4\u3002",
    "Bottom left": "\u5DE6\u4E0B\u89D2",
    "Bottom middle": "\u5E95\u90E8\u5C45\u4E2D",
    "Bottom right": "\u53F3\u4E0B\u89D2",
    "Bottom right (default)": "\u53F3\u4E0B\u89D2\uFF08\u9ED8\u8BA4\uFF09",
    "Checking...": "\u6B63\u5728\u68C0\u67E5...",
    "Clear history": "\u6E05\u9664\u5386\u53F2",
    "Clear search": "\u6E05\u9664\u641C\u7D22",
    "Colors": "\u989C\u8272",
    "Colors & style": "\u989C\u8272\u4E0E\u6837\u5F0F",
    "Common sound": "\u666E\u901A\u97F3\u6548",
    "Completion popup at 100%": "100% \u5B8C\u6210\u5F39\u7A97",
    "Completion popup name": "\u5B8C\u6210\u5F39\u7A97\u540D\u79F0",
    "Completionist": "\u5168\u6210\u5C31\u8FBE\u4EBA",
    "Completionist sound": "\u5168\u6210\u5C31\u97F3\u6548",
    "Could not save the card: {error}": "\u65E0\u6CD5\u4FDD\u5B58\u5361\u7247\uFF1A{error}",
    "Couldn't confirm this icon is the colored one, and nothing better was found.": "\u65E0\u6CD5\u786E\u8BA4\u6B64\u56FE\u6807\u662F\u5F69\u8272\u7248\u672C\uFF0C\u4E5F\u6CA1\u6709\u627E\u5230\u66F4\u597D\u7684\u3002",
    "Couldn't identify the game/achievement for this unlock.": "\u65E0\u6CD5\u786E\u5B9A\u6B64\u6B21\u89E3\u9501\u5BF9\u5E94\u7684\u6E38\u620F/\u6210\u5C31\u3002",
    "Couldn't save that key.": "\u65E0\u6CD5\u4FDD\u5B58\u8BE5\u5BC6\u94A5\u3002",
    "Couldn't start the achievement probe.": "\u65E0\u6CD5\u542F\u52A8\u6210\u5C31\u63A2\u6D4B\u3002",
    "Crowned": "\u52A0\u5195",
    "Currently Playing": "\u5F53\u524D\u6E38\u620F",
    "Custom settings for this game": "\u6B64\u6E38\u620F\u7684\u81EA\u5B9A\u4E49\u8BBE\u7F6E",
    "Custom settings for {name}": "{name} \u7684\u81EA\u5B9A\u4E49\u8BBE\u7F6E",
    "Default (game icon, else badge)": "\u9ED8\u8BA4\uFF08\u6E38\u620F\u56FE\u6807\uFF0C\u5426\u5219\u5FBD\u7AE0\uFF09",
    "Description font size": "\u63CF\u8FF0\u5B57\u53F7",
    "Direction of the card's background gradient, or a flat solid color.": "\u5361\u7247\u80CC\u666F\u6E10\u53D8\u7684\u65B9\u5411\uFF0C\u6216\u7EAF\u8272\u3002",
    "Editing settings for all games.": "\u6B63\u5728\u7F16\u8F91\u6240\u6709\u6E38\u620F\u7684\u8BBE\u7F6E\u3002",
    "Editing settings for {name} only.": "\u4EC5\u6B63\u5728\u7F16\u8F91 {name} \u7684\u8BBE\u7F6E\u3002",
    "Everyday unlocks (above the Uncommon cutoff).": "\u65E5\u5E38\u89E3\u9501\uFF08\u9AD8\u4E8E\u201C\u5C11\u89C1\u201D\u9608\u503C\uFF09\u3002",
    "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.": "\u90E8\u5206\u6A21\u677F\u7684\u989D\u5916\u6548\u679C\uFF1A\u6253\u5B57\u6587\u5B57\u3001\u52A8\u6001\u80CC\u666F\u3001\u6545\u969C\u6548\u679C\u3001\u87BA\u4E1D\u3001\u6E38\u620F\u540D\u79F0\u6807\u9898\u7B49\u3002\u5173\u95ED\u540E\u4E3A\u7B80\u6D01\u5916\u89C2\u3002",
    "Font size of the achievement name.": "\u6210\u5C31\u540D\u79F0\u7684\u5B57\u53F7\u3002",
    "Font size of the small eyebrow label above the title.": "\u6807\u9898\u4E0A\u65B9\u5C0F\u6807\u7B7E\u7684\u5B57\u53F7\u3002",
    "Font size of the subtitle/description line.": "\u526F\u6807\u9898/\u63CF\u8FF0\u884C\u7684\u5B57\u53F7\u3002",
    "Game Settings": "\u6E38\u620F\u8BBE\u7F6E",
    "Game icon": "\u6E38\u620F\u56FE\u6807",
    "Glow": "\u5149\u6655",
    "Glow for normal achievements": "\u666E\u901A\u6210\u5C31\u7684\u5149\u6655",
    "Glow intensity": "\u5149\u6655\u5F3A\u5EA6",
    "Got an unexpected response from Steam.": "\u6536\u5230\u4E86\u6765\u81EA Steam \u7684\u610F\u5916\u54CD\u5E94\u3002",
    "Gradient direction": "\u6E10\u53D8\u65B9\u5411",
    "Gradient from game artwork colors": "\u6839\u636E\u6E38\u620F\u56FE\u7247\u989C\u8272\u751F\u6210\u6E10\u53D8",
    "Gradient from icon colors": "\u6839\u636E\u56FE\u6807\u989C\u8272\u751F\u6210\u6E10\u53D8",
    "History & sharing": "\u5386\u53F2\u4E0E\u5206\u4EAB",
    "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.": "\u5149\u73AF\u6269\u6563\u7684\u8303\u56F4\u300250 \u4E3A\u9ED8\u8BA4\u6548\u679C\uFF1B0 \u4E3A\u9690\u85CF\uFF0C100 \u4E3A\u4E24\u500D\u3002",
    "How long the toast stays on screen before it slides away.": "\u5F39\u7A97\u5728\u6ED1\u51FA\u4E4B\u524D\u505C\u7559\u5728\u5C4F\u5E55\u4E0A\u7684\u65F6\u95F4\u3002",
    "Icon frame ring": "\u56FE\u6807\u8FB9\u6846\u73AF",
    "Icon glow": "\u56FE\u6807\u5149\u6655",
    "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.": "\u5982\u679C\u80FD\u542C\u5230\u58F0\u97F3\u4F46\u6CA1\u6709\u5F39\u7A97\uFF08\u4F8B\u5982\u5728\u5176\u4ED6\u638C\u673A\u4E0A\uFF09\uFF0C\u8BF7\u8FD0\u884C\u6B64\u68C0\u67E5\u3002\u5B83\u4F1A\u6D4B\u8BD5\u5F39\u7A97\u6240\u9700\u7684 Python \u5305\u3001\u56FE\u5F62\u5E93\u3001\u663E\u793A\u548C\u7A97\u53E3\u521B\u5EFA\uFF0C\u5E76\u544A\u8BC9\u4F60\u7F3A\u5C11\u4EC0\u4E48\u3002",
    "In progress": "\u8FDB\u884C\u4E2D",
    "Key saved (ending in {tail})": "\u5BC6\u94A5\u5DF2\u4FDD\u5B58\uFF08\u672B\u5C3E\u4E3A {tail}\uFF09",
    "Label font size": "\u6807\u7B7E\u5B57\u53F7",
    "Language": "\u8BED\u8A00",
    "Last unlock's icon:": "\u4E0A\u6B21\u89E3\u9501\u7684\u56FE\u6807\uFF1A",
    "Left to right": "\u4ECE\u5DE6\u5230\u53F3",
    "Legendary Achievement unlocked": "\u89E3\u9501\u4F20\u5947\u6210\u5C31",
    "Loading achievements...": "\u6B63\u5728\u52A0\u8F7D\u6210\u5C31...",
    "Loading...": "\u52A0\u8F7D\u4E2D...",
    "Making card...": "\u6B63\u5728\u751F\u6210\u5361\u7247...",
    "Manual common popup test": "\u624B\u52A8\u6D4B\u8BD5\u666E\u901A\u5F39\u7A97",
    "Manual rare popup test": "\u624B\u52A8\u6D4B\u8BD5\u7A00\u6709\u5F39\u7A97",
    "Manual ultra rare popup test": "\u624B\u52A8\u6D4B\u8BD5\u6781\u7A00\u6709\u5F39\u7A97",
    "Manual uncommon popup test": "\u624B\u52A8\u6D4B\u8BD5\u5C11\u89C1\u5F39\u7A97",
    "Manually refresh backend status.": "\u624B\u52A8\u5237\u65B0\u540E\u53F0\u72B6\u6001\u3002",
    "Milestone popups": "\u91CC\u7A0B\u7891\u5F39\u7A97",
    "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.": "\u6309\u62E5\u6709\u8BE5\u6210\u5C31\u7684\u73A9\u5BB6\u6709\u591A\u5C11\uFF0C\u5728\u5F39\u7A97\u6807\u7B7E\u4E2D\u6807\u51FA\uFF08\u5C11\u89C1\u3001\u7A00\u6709\u3001\u6781\u7A00\u6709\uFF09\u3002\u6781\u7A00\u6709\u4F1A\u6709\u66F4\u591A\u95EA\u5149\u548C\u66F4\u957F\u7684\u5149\u6CFD\uFF1B\u7A00\u6709\u4FDD\u7559\u91D1\u8272\u5916\u89C2\u548C\u97F3\u6548\u3002",
    "Needs Rarity Tiers on; otherwise common sounds play.": "\u9700\u8981\u5F00\u542F\u7A00\u6709\u5EA6\u7B49\u7EA7\uFF1B\u5426\u5219\u64AD\u653E\u666E\u901A\u97F3\u6548\u3002",
    "Needs Rarity Tiers on; otherwise the rare sound plays.": "\u9700\u8981\u5F00\u542F\u7A00\u6709\u5EA6\u7B49\u7EA7\uFF1B\u5426\u5219\u64AD\u653E\u7A00\u6709\u97F3\u6548\u3002",
    "New achievement": "\u65B0\u6210\u5C31",
    "No API key set -- using the local cache only (can't guarantee the colored icon).": "\u672A\u8BBE\u7F6E API \u5BC6\u94A5\u2014\u2014\u4EC5\u4F7F\u7528\u672C\u5730\u7F13\u5B58\uFF08\u65E0\u6CD5\u4FDD\u8BC1\u5F69\u8272\u56FE\u6807\uFF09\u3002",
    "No API key set -- using the local cache only.": "\u672A\u8BBE\u7F6E API \u5BC6\u94A5\u2014\u2014\u4EC5\u4F7F\u7528\u672C\u5730\u7F13\u5B58\u3002",
    "No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.": "\u672A\u627E\u5230\u4E2D\u6587\u5B57\u4F53\uFF0C\u56E0\u6B64\u5F39\u7A97\u4E2D\u7684\u4E2D\u6587\u53EF\u80FD\u663E\u793A\u4E3A\u7A7A\u6846\u3002\u8BF7\u628A\u5B57\u4F53\u6587\u4EF6\uFF08.ttf\u3001.otf \u6216 .ttc\uFF0C\u4F8B\u5982 Noto Sans SC\uFF09\u590D\u5236\u5230 {folder}\uFF0C\u7136\u540E\u8FD0\u884C\u6D4B\u8BD5\u5F39\u7A97\u3002",
    "No achievements found for this game.": "\u672A\u627E\u5230\u6B64\u6E38\u620F\u7684\u6210\u5C31\u3002",
    "No achievements match your search.": "\u6CA1\u6709\u7B26\u5408\u641C\u7D22\u6761\u4EF6\u7684\u6210\u5C31\u3002",
    "No game is currently running.": "\u5F53\u524D\u6CA1\u6709\u6B63\u5728\u8FD0\u884C\u7684\u6E38\u620F\u3002",
    "No game running": "\u6CA1\u6709\u6B63\u5728\u8FD0\u884C\u7684\u6E38\u620F",
    "No unlocks recorded yet. Achievements you unlock from now on will appear here.": "\u5C1A\u65E0\u89E3\u9501\u8BB0\u5F55\u3002\u4ECE\u73B0\u5728\u8D77\u89E3\u9501\u7684\u6210\u5C31\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002",
    "Nothing pinned right now.": "\u76EE\u524D\u6CA1\u6709\u56FA\u5B9A\u7684\u6210\u5C31\u3002",
    "Nothing unlocked yet this session.": "\u672C\u6B21\u4F1A\u8BDD\u4E2D\u5C1A\u672A\u89E3\u9501\u4EFB\u4F55\u6210\u5C31\u3002",
    "Only 1 achievement left": "\u4EC5\u5269 1 \u4E2A\u6210\u5C31",
    "Only the gray (locked) icon was available this time -- no colored one could be found.": "\u8FD9\u6B21\u53EA\u6709\u7070\u8272\uFF08\u672A\u89E3\u9501\uFF09\u56FE\u6807\u53EF\u7528\u2014\u2014\u627E\u4E0D\u5230\u5F69\u8272\u56FE\u6807\u3002",
    "Only {count} achievements left": "\u4EC5\u5269 {count} \u4E2A\u6210\u5C31",
    "Percentage badge position": "\u6BD4\u4F8B\u5FBD\u7AE0\u4F4D\u7F6E",
    "Placeholder icon": "\u5360\u4F4D\u56FE\u6807",
    "Popup": "\u5F39\u7A97",
    "Popup Not Showing?": "\u5F39\u7A97\u4E0D\u663E\u793A\uFF1F",
    "Popup Tests": "\u5F39\u7A97\u6D4B\u8BD5",
    "Popup duration": "\u5F39\u7A97\u65F6\u957F",
    "Popup position": "\u5F39\u7A97\u4F4D\u7F6E",
    "Popup screen size": "\u5F39\u7A97\u5C4F\u5E55\u5C3A\u5BF8",
    "Popup size": "\u5F39\u7A97\u5927\u5C0F",
    "Popup template": "\u5F39\u7A97\u6A21\u677F",
    "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).": "\u5361\u7247\u80CC\u666F\u6E10\u53D8\u53D6\u81EA\u6210\u5C31\u56FE\u6807\u672C\u8EAB\u7684\u989C\u8272\uFF0C\u800C\u4E0D\u662F\u4E0B\u65B9\u7684\u56FA\u5B9A\u989C\u8272\u3002\u9664 Paper Light \u5916\u7684\u6240\u6709\u6A21\u677F\u5747\u53EF\u4F7F\u7528\u3002\u82E5\u56FE\u6807\u6CA1\u6709\u660E\u663E\u7684\u4E3B\u8272\uFF08\u6216\u6CA1\u6709\u56FE\u6807\uFF09\uFF0C\u5219\u56DE\u9000\u5230\u56FA\u5B9A\u989C\u8272\u3002",
    "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.": "\u6539\u4E3A\u4ECE\u6E38\u620F\u81EA\u8EAB\u56FE\u7247\u53D6\u8272\uFF0C\u4F7F\u540C\u4E00\u6E38\u620F\u7684\u6240\u6709\u5F39\u7A97\u5171\u7528\u4E00\u5957\u914D\u8272\u3002\u5F00\u542F\u540E\u4F1A\u5173\u95ED\u4E0A\u9762\u7684\u56FE\u6807\u9009\u9879\uFF08\u4E8C\u9009\u4E00\uFF09\u3002\u82E5\u65E0\u6CD5\u8BFB\u53D6\u56FE\u7247\uFF0C\u5219\u56DE\u9000\u5230\u56FE\u6807\u989C\u8272\u3002",
    "RARE ACHIEVEMENT": "\u7A00\u6709\u6210\u5C31",
    "RARE ACHIEVEMENT UNLOCKED": "\u7A00\u6709\u6210\u5C31\u5DF2\u89E3\u9501",
    "RARE TROPHY UNLOCKED": "\u7A00\u6709\u5956\u676F\u5DF2\u89E3\u9501",
    "RARE UNLOCK!": "\u7A00\u6709\u89E3\u9501\uFF01",
    "Rare Achievement Unlocked": "\u7A00\u6709\u6210\u5C31\u5DF2\u89E3\u9501",
    "Rare achievement": "\u7A00\u6709\u6210\u5C31",
    "Rare sound": "\u7A00\u6709\u97F3\u6548",
    "Rare unlocks.": "\u7A00\u6709\u89E3\u9501\u3002",
    "Rare: this % or lower": "\u7A00\u6709\uFF1A\u6B64\u767E\u5206\u6BD4\u6216\u66F4\u4F4E",
    "Rarity (rarest first)": "\u7A00\u6709\u5EA6\uFF08\u6700\u7A00\u6709\u4F18\u5148\uFF09",
    "Rarity Tiers": "\u7A00\u6709\u5EA6\u7B49\u7EA7",
    "Rarity tiers": "\u7A00\u6709\u5EA6\u7B49\u7EA7",
    "Recent Unlocks": "\u6700\u8FD1\u89E3\u9501",
    "Refresh": "\u5237\u65B0",
    "Refresh sound list": "\u5237\u65B0\u58F0\u97F3\u5217\u8868",
    "Refreshing...": "\u6B63\u5728\u5237\u65B0...",
    "Remove key": "\u79FB\u9664\u5BC6\u94A5",
    "Removed.": "\u5DF2\u79FB\u9664\u3002",
    "Reset this game to the global settings": "\u5C06\u6B64\u6E38\u620F\u91CD\u7F6E\u4E3A\u5168\u5C40\u8BBE\u7F6E",
    "Right to left": "\u4ECE\u53F3\u5230\u5DE6",
    "Ring size": "\u5149\u73AF\u5927\u5C0F",
    "Run overlay check": "\u8FD0\u884C\u8986\u76D6\u5C42\u68C0\u67E5",
    "Same as popups": "\u4E0E\u5F39\u7A97\u76F8\u540C",
    "Save key": "\u4FDD\u5B58\u5BC6\u94A5",
    "Saved to {path}": "\u5DF2\u4FDD\u5B58\u5230 {path}",
    "Saved.": "\u5DF2\u4FDD\u5B58\u3002",
    "Saving...": "\u6B63\u5728\u4FDD\u5B58...",
    "Search": "\u641C\u7D22",
    "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.": "\u5728\u4E0A\u65B9\u9009\u62E9\u4E00\u4E2A\u6210\u5C31\uFF08\u5728\u5176\u4E0A\u6309\u52A8\u4F5C\u952E\uFF09\uFF0C\u5373\u53EF\u5728\u6E38\u620F\u65F6\u628A\u5B83\u56FA\u5B9A\u4E3A\u5C4F\u5E55\u4E0A\u7684\u5C0F\u578B\u8FFD\u8E2A\u5668\u3002\u8FFD\u8E2A\u5668\u4F7F\u7528\u4F60\u7684\u5F39\u7A97\u6A21\u677F\u548C\u989C\u8272\uFF0C\u5F39\u7A97\u663E\u793A\u65F6\u4F1A\u6ED1\u51FA\u5C4F\u5E55\u3002\u53EA\u6709\u6E38\u620F\u5173\u8054\u4E86\u53EF\u8FFD\u8E2A\u7EDF\u8BA1\u6570\u636E\u7684\u6210\u5C31\u624D\u4F1A\u663E\u793A\u6570\u5B57\u8FDB\u5EA6\uFF0C\u5176\u4ED6\u6210\u5C31\u53EA\u663E\u793A\u672A\u89E3\u9501\u6216\u5DF2\u89E3\u9501\u3002",
    "Select an unlock to make a shareable image card.": "\u9009\u62E9\u4E00\u4E2A\u89E3\u9501\u8BB0\u5F55\uFF0C\u751F\u6210\u53EF\u5206\u4EAB\u7684\u56FE\u7247\u5361\u7247\u3002",
    "Session summary": "\u6E38\u620F\u65F6\u6BB5\u603B\u7ED3",
    "Share card": "\u5206\u4EAB\u5361\u7247",
    "Show": "\u663E\u793A",
    "Show more": "\u663E\u793A\u66F4\u591A",
    "Show screen frame": "\u663E\u793A\u5C4F\u5E55\u8FB9\u6846",
    "Show unlock percentage": "\u663E\u793A\u89E3\u9501\u6BD4\u4F8B",
    "Showing {shown} of {total}": "\u663E\u793A {shown} / {total}",
    "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).": "\u5F53\u6210\u5C31\u8FD8\u6CA1\u6709\u56FE\u6807\u65F6\u663E\u793A\uFF08\u4E5F\u662F Xbox 360 v2 \u7684\u8D77\u59CB\u56FE\u6807\uFF09\u3002",
    "Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.": "\u663E\u793A\u7EA2\u8272\u8FB9\u6846\u51E0\u79D2\u949F\uFF08\u9EC4\u8272\u65B9\u5757 = \u5DE6\u4E0A\u89D2\uFF09\u3002\u8FB9\u6846\u5E94\u6B63\u597D\u8D34\u5408\u5C4F\u5E55\u8FB9\u7F18\uFF1B\u5426\u5219\u8BF7\u5728\u4E0A\u65B9\u9009\u62E9\u5176\u4ED6\u5C3A\u5BF8\u3002",
    "Shows what percentage of players have the achievement, e.g. 4.7% of players.": "\u663E\u793A\u62E5\u6709\u8BE5\u6210\u5C31\u7684\u73A9\u5BB6\u6BD4\u4F8B\uFF0C\u4F8B\u5982 4.7% \u7684\u73A9\u5BB6\u3002",
    "Size of the small '4.7% of players' badge. 100% is the default.": "\u201C4.7% \u7684\u73A9\u5BB6\u201D\u5C0F\u5FBD\u7AE0\u7684\u5927\u5C0F\u3002\u9ED8\u8BA4\u4E3A 100%\u3002",
    "Solid color": "\u7EAF\u8272",
    "Something went wrong.": "\u51FA\u4E86\u70B9\u95EE\u9898\u3002",
    "Sort by": "\u6392\u5E8F\u65B9\u5F0F",
    "Sound": "\u58F0\u97F3",
    "Sound & tests": "\u58F0\u97F3\u4E0E\u6D4B\u8BD5",
    "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.": "\u5148\u542F\u52A8\u4E00\u4E2A\u6E38\u620F\uFF0C\u518D\u6253\u5F00\u6B64\u9762\u677F\u4E3A\u5B83\u8BBE\u7F6E\u4E13\u5C5E\u9009\u9879\u3002\u76EE\u524D\u4E0B\u65B9\u8BBE\u7F6E\u9002\u7528\u4E8E\u6240\u6709\u6E38\u620F\u3002",
    "Steam Web API key": "Steam Web API \u5BC6\u94A5",
    "Steam didn't return any achievement data for this game.": "Steam \u6CA1\u6709\u8FD4\u56DE\u6B64\u6E38\u620F\u7684\u4EFB\u4F55\u6210\u5C31\u6570\u636E\u3002",
    "Steam only provided a gray icon for this achievement -- no colored one exists in its data.": "Steam \u53EA\u4E3A\u8FD9\u4E2A\u6210\u5C31\u63D0\u4F9B\u4E86\u7070\u8272\u56FE\u6807\u2014\u2014\u5176\u6570\u636E\u4E2D\u6CA1\u6709\u5F69\u8272\u56FE\u6807\u3002",
    "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.": "Steam \u7684 API \u8FD4\u56DE\u4E86\u7A7A\u7684\u6216\u65E0\u6CD5\u4F7F\u7528\u7684\u54CD\u5E94\u2014\u2014\u5DF2\u56DE\u9000\u5230\u672C\u5730\u7F13\u5B58\u3002\u5982\u679C\u540C\u4E00\u6E38\u620F\u6301\u7EED\u51FA\u73B0\uFF0C\u53EF\u80FD\u662F Steam \u7AEF\u7684\u4E34\u65F6\u95EE\u9898\u3002",
    "Steam's achievement library wasn't found on this system.": "\u5728\u6B64\u7CFB\u7EDF\u4E0A\u627E\u4E0D\u5230 Steam \u7684\u6210\u5C31\u5E93\u3002",
    "Steam's icon came back gray, so the other icon in its data (the colored one) was used.": "Steam \u8FD4\u56DE\u7684\u56FE\u6807\u662F\u7070\u8272\u7684\uFF0C\u56E0\u6B64\u6539\u7528\u4E86\u5176\u6570\u636E\u4E2D\u7684\u53E6\u4E00\u4E2A\u56FE\u6807\uFF08\u5F69\u8272\u7684\uFF09\u3002",
    "Stop tracking": "\u505C\u6B62\u8FFD\u8E2A",
    "TRACKING": "\u8FFD\u8E2A\u4E2D",
    "TROPHY UNLOCKED": "\u5956\u676F\u5DF2\u89E3\u9501",
    "Template effects": "\u6A21\u677F\u7279\u6548",
    "Test Common": "\u6D4B\u8BD5\u666E\u901A",
    "Test Completionist": "\u6D4B\u8BD5\u5168\u6210\u5C31",
    "Test Rare": "\u6D4B\u8BD5\u7A00\u6709",
    "Test Ultra Rare": "\u6D4B\u8BD5\u6781\u7A00\u6709",
    "Test Uncommon": "\u6D4B\u8BD5\u5C11\u89C1",
    "Test almost there alert": "\u6D4B\u8BD5\u5373\u5C06\u5168\u6210\u5C31\u63D0\u9192",
    "Test session summary": "\u6D4B\u8BD5\u6E38\u620F\u65F6\u6BB5\u603B\u7ED3",
    "Text": "\u6587\u5B57",
    "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.": "API \u8C03\u7528\u6210\u529F\uFF0C\u4F46\u5176\u4E2D\u6CA1\u6709\u627E\u5230\u8FD9\u4E2A\u6210\u5C31\u2014\u2014\u5DF2\u56DE\u9000\u5230\u672C\u5730\u7F13\u5B58\u3002",
    "The Web API call itself failed (network issue) -- fell back to the local cache.": "Web API \u8C03\u7528\u672C\u8EAB\u5931\u8D25\uFF08\u7F51\u7EDC\u95EE\u9898\uFF09\u2014\u2014\u5DF2\u56DE\u9000\u5230\u672C\u5730\u7F13\u5B58\u3002",
    "The big text on the 100% completion popup.": "100% \u5B8C\u6210\u5F39\u7A97\u4E0A\u7684\u5927\u5B57\u3002",
    "The check itself failed: {error}": "\u68C0\u67E5\u672C\u8EAB\u5931\u8D25\uFF1A{error}",
    "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.": "\u56F4\u7ED5\u56FE\u6807\u7684\u5F69\u8272\u73AF\uFF0C\u4E0E\u4E0A\u9762\u7684\u5149\u6655\u76F8\u4E92\u72EC\u7ACB\u3002\u5173\u95ED\u540E\u56FE\u6807\u53EA\u663E\u793A\u5728\u7EAF\u6DF1\u8272\u5E95\u4E0A\u3002",
    "The local icon was gray (locked); used the colored icon from Steam's public achievements page.": "\u672C\u5730\u56FE\u6807\u662F\u7070\u8272\u7684\uFF08\u672A\u89E3\u9501\uFF09\uFF1B\u5DF2\u4F7F\u7528 Steam \u516C\u5F00\u6210\u5C31\u9875\u9762\u4E0A\u7684\u5F69\u8272\u56FE\u6807\u3002",
    "The local icon was gray (locked); waited for Steam to update it and used the colored one.": "\u672C\u5730\u56FE\u6807\u662F\u7070\u8272\u7684\uFF08\u672A\u89E3\u9501\uFF09\uFF1B\u5DF2\u7B49\u5F85 Steam \u66F4\u65B0\u5E76\u4F7F\u7528\u4E86\u5F69\u8272\u56FE\u6807\u3002",
    "The overall card design/style.": "\u5361\u7247\u7684\u6574\u4F53\u8BBE\u8BA1/\u98CE\u683C\u3002",
    "The popup for unlocking every achievement in a game.": "\u89E3\u9501\u6E38\u620F\u5168\u90E8\u6210\u5C31\u65F6\u7684\u5F39\u7A97\u3002",
    "The probe script is missing -- try reinstalling the plugin.": "\u7F3A\u5C11\u63A2\u6D4B\u811A\u672C\u2014\u2014\u8BF7\u5C1D\u8BD5\u91CD\u65B0\u5B89\u88C5\u63D2\u4EF6\u3002",
    "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)": "\u8109\u52A8\u5149\u73AF\u901A\u5E38\u53EA\u5728\u7A00\u6709\u6210\u5C31\u65F6\u51FA\u73B0\u2014\u2014\u5F00\u542F\u540E\u666E\u901A\u6210\u5C31\u4E5F\u4F1A\u51FA\u73B0\u3002\uFF08\u89D2\u843D\u7684\u4E1D\u5E26\u548C\u95EA\u5149\u4ECD\u4EC5\u9650\u7A00\u6709\u6210\u5C31\uFF0C\u56E0\u4E3A\u5B83\u4EEC\u4E13\u95E8\u8868\u793A\u201C\u8FD9\u4E2A\u5F88\u7A00\u6709\u201D\u3002\uFF09",
    "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.": "\u7B80\u5355\u7684\u65B9\u5F0F\uFF1A\u6BCF\u4E2A\u6A21\u677F\u4F7F\u7528\u81EA\u5E26\u7684\u914D\u8272\uFF08\u5982 Xbox \u7EFF\u3001PlayStation \u84DD\u3001Steam \u84DD\uFF09\u3002\u5F00\u542F\u65F6\uFF0C\u4E0B\u65B9\u6240\u6709\u989C\u8272\u9009\u9879\u90FD\u4F1A\u53D8\u7070\u5E76\u88AB\u5FFD\u7565\u3002",
    "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).": "\u56FE\u6807\u5468\u56F4\u7684\u67D4\u548C\u5149\u6655\u548C\u8109\u52A8\u5149\u73AF\uFF08\u7A00\u6709\u6210\u5C31\uFF1B\u82E5\u5728\u4E0B\u65B9\u542F\u7528\uFF0C\u666E\u901A\u6210\u5C31\u4E5F\u4F1A\u6709\uFF09\u3002",
    "The special popup for unlocking every achievement in a game, using the running game's name.": "\u89E3\u9501\u6E38\u620F\u5168\u90E8\u6210\u5C31\u65F6\u7684\u7279\u522B\u5F39\u7A97\uFF0C\u4F7F\u7528\u6B63\u5728\u8FD0\u884C\u6E38\u620F\u7684\u540D\u79F0\u3002",
    "This game doesn't have any Steam achievements.": "\u6B64\u6E38\u620F\u6CA1\u6709\u4EFB\u4F55 Steam \u6210\u5C31\u3002",
    "Timed out talking to Steam. Try refreshing.": "\u4E0E Steam \u901A\u4FE1\u8D85\u65F6\u3002\u8BF7\u5C1D\u8BD5\u5237\u65B0\u3002",
    "Title font size": "\u6807\u9898\u5B57\u53F7",
    "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey": "\u5F39\u7A97\u56FE\u6807\u901A\u5E38\u6765\u81EA Steam \u7684\u672C\u5730\u7F13\u5B58\uFF0C\u5076\u5C14\u4F1A\u663E\u793A\u9519\u8BEF\u7684\uFF08\u7070\u8272/\u672A\u89E3\u9501\uFF09\u56FE\u6807\u3002\u6DFB\u52A0\u514D\u8D39\u7684 Steam Web API \u5BC6\u94A5\u540E\uFF0CFinally Achievement Plugin \u6BCF\u6B21\u90FD\u4F1A\u76F4\u63A5\u4ECE Steam \u83B7\u53D6\u4FDD\u8BC1\u6B63\u786E\u7684\u5F69\u8272\u56FE\u6807\u3002\u83B7\u53D6\u5BC6\u94A5\uFF1Asteamcommunity.com/dev/apikey",
    "Top left": "\u5DE6\u4E0A\u89D2",
    "Top middle": "\u9876\u90E8\u5C45\u4E2D",
    "Top right": "\u53F3\u4E0A\u89D2",
    "Top right (descriptions can use 2 lines)": "\u53F3\u4E0A\u89D2\uFF08\u63CF\u8FF0\u53EF\u663E\u793A 2 \u884C\uFF09",
    "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.": "\u653E\u5728\u53F3\u4E0A\u89D2\u65F6\u63CF\u8FF0\u53EF\u4F7F\u7528\u5168\u90E8\u5BBD\u5EA6\uFF0C\u56E0\u6B64\u8F83\u77ED\u7684\u63CF\u8FF0\u4E0D\u4F1A\u4EE5 ... \u7ED3\u5C3E\uFF0C\u8F83\u957F\u7684\u53EF\u4EE5\u663E\u793A\u4E24\u884C\u3002",
    "Tracker position": "\u8FFD\u8E2A\u5668\u4F4D\u7F6E",
    "Tracker size": "\u8FFD\u8E2A\u5668\u5927\u5C0F",
    "Tracker template": "\u8FFD\u8E2A\u5668\u6A21\u677F",
    "Tracking": "\u8FFD\u8E2A\u4E2D",
    "Trophy": "\u5956\u676F",
    "Type part of a name or description.": "\u8F93\u5165\u540D\u79F0\u6216\u63CF\u8FF0\u7684\u4E00\u90E8\u5206\u3002",
    "ULTRA RARE ACHIEVEMENT": "\u6781\u7A00\u6709\u6210\u5C31",
    "ULTRA RARE TROPHY": "\u6781\u7A00\u6709\u5956\u676F",
    "ULTRA RARE UNLOCK!": "\u6781\u7A00\u6709\u89E3\u9501\uFF01",
    "UNCOMMON ACHIEVEMENT": "\u5C11\u89C1\u6210\u5C31",
    "UNCOMMON TROPHY": "\u5C11\u89C1\u5956\u676F",
    "UNCOMMON UNLOCK!": "\u5C11\u89C1\u89E3\u9501\uFF01",
    "UNLOCKED": "\u5DF2\u89E3\u9501",
    "UNLOCKED!": "\u5DF2\u89E3\u9501\uFF01",
    "Ultra Rare Achievement": "\u6781\u7A00\u6709\u6210\u5C31",
    "Ultra rare achievement": "\u6781\u7A00\u6709\u6210\u5C31",
    "Ultra rare sound": "\u6781\u7A00\u6709\u97F3\u6548",
    "Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.": "\u6781\u7A00\u6709 \u2264 {ultra}%\uFF0C\u7A00\u6709 \u2264 {rare}%\uFF0C\u5C11\u89C1 \u2264 {uncommon}%\uFF0C\u66F4\u9AD8\u7684\u4E3A\u666E\u901A\uFF08\u65E0\u7B49\u7EA7\u6807\u7B7E\uFF09\u3002\u5404\u9608\u503C\u4F1A\u81EA\u52A8\u4FDD\u6301\u987A\u5E8F\u3002",
    "Ultra rare: this % or lower": "\u6781\u7A00\u6709\uFF1A\u6B64\u767E\u5206\u6BD4\u6216\u66F4\u4F4E",
    "Uncommon Achievement": "\u5C11\u89C1\u6210\u5C31",
    "Uncommon achievement": "\u5C11\u89C1\u6210\u5C31",
    "Uncommon sound": "\u5C11\u89C1\u97F3\u6548",
    "Uncommon: this % or lower": "\u5C11\u89C1\uFF1A\u6B64\u767E\u5206\u6BD4\u6216\u66F4\u4F4E",
    "Unlock percentage size": "\u89E3\u9501\u6BD4\u4F8B\u5927\u5C0F",
    "Unlocked": "\u5DF2\u89E3\u9501",
    "Unlocked first": "\u5DF2\u89E3\u9501\u4F18\u5148",
    "Use each template's own colors": "\u4F7F\u7528\u5404\u6A21\u677F\u81EA\u5E26\u7684\u989C\u8272",
    "Use the running game for tests": "\u6D4B\u8BD5\u65F6\u4F7F\u7528\u6B63\u5728\u8FD0\u884C\u7684\u6E38\u620F",
    "Used the colored icon from Steam's own local achievement data (no API key needed).": "\u5DF2\u4F7F\u7528 Steam \u81EA\u8EAB\u672C\u5730\u6210\u5C31\u6570\u636E\u4E2D\u7684\u5F69\u8272\u56FE\u6807\uFF08\u65E0\u9700 API \u5BC6\u94A5\uFF09\u3002",
    "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).": "\u5DF2\u4F7F\u7528\u6765\u81EA Steam Web API \u7684\u4FDD\u8BC1\u6B63\u786E\u7684\u5F69\u8272\u56FE\u6807\uFF08\u4E0D\u533A\u5206\u5927\u5C0F\u5199\u5339\u914D\uFF09\u3002",
    "Used the guaranteed-correct colored icon from Steam's Web API.": "\u5DF2\u4F7F\u7528\u6765\u81EA Steam Web API \u7684\u4FDD\u8BC1\u6B63\u786E\u7684\u5F69\u8272\u56FE\u6807\u3002",
    "Vertical (default)": "\u5782\u76F4\uFF08\u9ED8\u8BA4\uFF09",
    "Volume": "\u97F3\u91CF",
    "Waiting for live data...": "\u6B63\u5728\u7B49\u5F85\u5B9E\u65F6\u6570\u636E...",
    "Watcher Status": "\u76D1\u89C6\u5668\u72B6\u6001",
    "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.": "\u5F00\u542F\u540E\uFF0C\u4E0B\u65B9\u6240\u6709\u8BBE\u7F6E\u4EC5\u9002\u7528\u4E8E\u6B64\u6E38\u620F\uFF0C\u5E76\u4F1A\u4FDD\u5B58\u4F9B\u4E0B\u6B21\u4F7F\u7528\u3002\u5B83\u4EE5\u4F60\u5F53\u524D\u8BBE\u7F6E\u7684\u526F\u672C\u4E3A\u8D77\u70B9\u3002\u5173\u95ED\u540E\u5DF2\u4FDD\u5B58\u7684\u5185\u5BB9\u4F1A\u4FDD\u7559\u3002",
    "When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.": "\u5173\u95ED\u6E38\u620F\u65F6\uFF0C\u663E\u793A\u672C\u6B21\u6E38\u73A9\u671F\u95F4\u89E3\u9501\u7684\u6210\u5C31\u6570\u91CF\uFF0C\u4F8B\u5982\u201C\u5DF2\u89E3\u9501 3 \u4E2A\uFF0C\u5176\u4E2D 1 \u4E2A\u7A00\u6709\u201D\u3002",
    "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.": "\u89E3\u9501\u4EFB\u4F55\u6E38\u620F\u7684\u6700\u540E\u4E00\u4E2A\u6210\u5C31\u65F6\uFF0C\u4F1A\u5728\u8BE5\u6210\u5C31\u81EA\u5DF1\u7684\u5F39\u7A97\u4E4B\u540E\u663E\u793A\u4E00\u4E2A\u7279\u522B\u7684\u7FE0\u7EFF\u8272\u5B8C\u6210\u5F39\u7A97\u3002",
    "Where the banner appears on screen.": "\u6A2A\u5E45\u5728\u5C4F\u5E55\u4E0A\u51FA\u73B0\u7684\u4F4D\u7F6E\u3002",
    "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.": "\u8FFD\u8E2A\u5668\u4F7F\u7528\u54EA\u79CD\u5F39\u7A97\u6A21\u677F\u7ED8\u5236\u3002\u8BD5\u8BD5 Game Art Blur\uFF0C\u53EF\u628A\u6E38\u620F\u56FE\u7247\u4F5C\u4E3A\u80CC\u666F\u3002",
    "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.": "\u6E38\u620F\u8FD0\u884C\u65F6\uFF0C\u6D4B\u8BD5\u4F1A\u663E\u793A\u8BE5\u6E38\u620F\u4E2D\u7684\u968F\u673A\u6210\u5C31\uFF08\u5305\u62EC\u672A\u89E3\u9501\u7684\uFF09\uFF0C\u5E76\u4F7F\u7528\u5176\u771F\u5B9E\u56FE\u6807\u548C\u6E38\u620F\u56FE\u7247\u3002\u6D4B\u8BD5\u6C38\u8FDC\u4E0D\u4F1A\u8BA1\u4E3A\u89E3\u9501\u3002\u6CA1\u6709\u8FD0\u884C\u7684\u6E38\u620F\u6216\u5173\u95ED\u6B64\u9879\u65F6\uFF0C\u4F7F\u7528\u793A\u4F8B\u3002",
    'Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.': "\u81EA\u5B9A\u4E49\u58F0\u97F3\uFF1A\u628A .wav\u3001.flac\u3001.ogg \u6216 .mp3 \u6587\u4EF6\uFF08\u4E0D\u8D85\u8FC7 10 MB\uFF0C\u5C3D\u91CF\u77ED\uFF09\u653E\u5165 {folder}\uFF0C\u7136\u540E\u70B9\u6309\u5237\u65B0\u3002\u5B83\u4EEC\u7684\u540D\u79F0\u540E\u4F1A\u663E\u793A\u201C\uFF08\u81EA\u5B9A\u4E49\uFF09\u201D\uFF0C\u66F4\u65B0\u63D2\u4EF6\u4E0D\u4F1A\u5220\u9664\u5B83\u4EEC\u3002\u7528\u4E0B\u65B9\u7684\u6D4B\u8BD5\u6309\u94AE\u8BD5\u542C\u6BCF\u4E00\u4E2A\u3002",
    "[ACHIEVEMENT]": "[\u6210\u5C31]",
    "[RARE UNLOCK]": "[\u7A00\u6709\u89E3\u9501]",
    "[ULTRA RARE UNLOCK]": "[\u6781\u7A00\u6709\u89E3\u9501]",
    "[UNCOMMON UNLOCK]": "[\u5C11\u89C1\u89E3\u9501]",
    "never": "\u4ECE\u672A",
    "the Finally Achievement Plugin settings folder, sounds": "Finally Achievement Plugin \u8BBE\u7F6E\u6587\u4EF6\u5939\u4E2D\u7684 sounds \u5B50\u6587\u4EF6\u5939",
    "{count} unlocked": "\u5DF2\u89E3\u9501 {count} \u4E2A",
    "{count} unlocked, {rare} rare": "\u5DF2\u89E3\u9501 {count} \u4E2A\uFF0C\u5176\u4E2D {rare} \u4E2A\u7A00\u6709",
    "{percent}% of players": "{percent}% \u7684\u73A9\u5BB6",
    "{unlocked} / {total} unlocked": "\u5DF2\u89E3\u9501 {unlocked} / {total}",
    "\u2713 Unlocked": "\u2713 \u5DF2\u89E3\u9501"
  }
};

// ../work/Finally Achievement Plugin/src/i18n.ts
var LANGUAGE_OPTIONS = [
  { data: "auto", label: "Auto (Steam language)" },
  { data: "en", label: "English" },
  { data: "tr", label: "T\xFCrk\xE7e" },
  { data: "de", label: "Deutsch" },
  { data: "fr", label: "Fran\xE7ais" },
  { data: "es", label: "Espa\xF1ol" },
  { data: "pt-BR", label: "Portugu\xEAs (Brasil)" },
  { data: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { data: "pl", label: "Polski" },
  { data: "zh-Hans", label: "\u7B80\u4F53\u4E2D\u6587" }
];
var SUPPORTED = ["en", "tr", "de", "fr", "es", "pt-BR", "ru", "zh-Hans", "pl"];
var current = "en";
function setLanguage(code) {
  current = SUPPORTED.includes(code) ? code : "en";
}
function getLanguage() {
  return current;
}
function formatDecimal(text) {
  return ["tr", "de", "fr", "es", "pt-BR", "ru", "pl"].includes(current) ? text.replace(".", ",") : text;
}
function t(key, vars) {
  const table = LOCALES[current];
  let text = table && table[key] || key;
  if (vars) {
    text = text.replace(
      /\{(\w+)\}/g,
      (match, name) => name in vars ? String(vars[name]) : match
    );
  }
  return text;
}
function tOpts(options) {
  return options.map((option) => ({ ...option, label: t(option.label) }));
}
var STEAM_NAMES = {
  english: "en",
  turkish: "tr",
  german: "de",
  french: "fr",
  spanish: "es",
  latam: "es",
  brazilian: "pt-BR",
  portuguese: "pt-BR",
  russian: "ru",
  schinese: "zh-Hans",
  polish: "pl"
};
function languageFromSteam(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase().replace(/_/g, "-");
  if (!value) return null;
  if (STEAM_NAMES[value]) return STEAM_NAMES[value];
  if (value === "tchinese" || value === "zh-tw" || value === "zh-hk" || value === "zh-hant") return null;
  if (value === "pt-br") return "pt-BR";
  if (value.startsWith("zh")) return "zh-Hans";
  const base = value.split("-")[0];
  const match = SUPPORTED.find((code) => code.toLowerCase() === base);
  return match ?? null;
}
function detectSteamLanguage() {
  const w = window;
  const sources = [
    () => w.LocalizationManager?.m_rgLocalesToUse?.[0],
    () => w.LocalizationManager?.m_strLanguage,
    () => navigator.language
  ];
  for (const read of sources) {
    try {
      const code = languageFromSteam(read());
      if (code) return code;
    } catch {
    }
  }
  return null;
}

// ../work/Finally Achievement Plugin/src/shareCard.ts
var CARD_WIDTH = 1200;
var CARD_HEIGHT = 630;
var FONT = '"Motiva Sans", "Noto Sans", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "Segoe UI", Arial, sans-serif';
var TIER_COLORS = {
  ultra_rare: "#c58bff",
  rare: "#f5c542",
  uncommon: "#5cc8ff",
  common: "#aab4c0"
};
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    const timer = window.setTimeout(() => resolve(null), 4e3);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function wrapText(ctx, text, maxWidth, maxLines) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const tokens = clean.includes(" ") ? clean.split(" ").flatMap((w, i, a) => i < a.length - 1 ? [w + " "] : [w]) : Array.from(clean);
  const lines = [];
  let line = "";
  const push = () => {
    lines.push(line.trimEnd());
    line = "";
  };
  for (const raw of tokens) {
    let token = raw;
    while (ctx.measureText(token.trimEnd()).width > maxWidth) {
      const chars = Array.from(token);
      let fit = "";
      for (const ch of chars) {
        if (ctx.measureText(line + fit + ch).width > maxWidth) break;
        fit += ch;
      }
      if (!fit) fit = chars[0];
      line += fit;
      token = token.slice(fit.length);
      push();
      if (!token) break;
    }
    if (!token) continue;
    if (ctx.measureText((line + token).trimEnd()).width > maxWidth && line) push();
    line += token;
  }
  if (line.trim()) push();
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 0 && ctx.measureText(last + "...").width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = last.trimEnd() + "...";
    return kept;
  }
  return lines;
}
async function renderShareCard(data) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  const [icon, art] = await Promise.all([loadImage(data.icon), loadImage(data.art)]);
  const accent = TIER_COLORS[data.tier || ""] || (data.rare ? TIER_COLORS.rare : "#6ea8ff");
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, "#10151f");
  bg.addColorStop(1, "#1b2434");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  if (art && art.width > 0 && art.height > 0) {
    const scale = Math.max(CARD_WIDTH / art.width, CARD_HEIGHT / art.height);
    const w = art.width * scale;
    const h = art.height * scale;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(art, (CARD_WIDTH - w) / 2, (CARD_HEIGHT - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }
  const shade = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  shade.addColorStop(0, "rgba(8,10,16,0.82)");
  shade.addColorStop(1, "rgba(8,10,16,0.38)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 12, CARD_HEIGHT);
  const iconSize = 260;
  const ix = 80;
  const iy = (CARD_HEIGHT - iconSize) / 2 - 10;
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 40;
  roundRect(ctx, ix, iy, iconSize, iconSize, 28);
  ctx.fillStyle = "#0b0e14";
  ctx.fill();
  ctx.restore();
  if (icon) {
    ctx.save();
    roundRect(ctx, ix, iy, iconSize, iconSize, 28);
    ctx.clip();
    ctx.drawImage(icon, ix, iy, iconSize, iconSize);
    ctx.restore();
  } else {
    ctx.fillStyle = accent;
    ctx.font = `bold 120px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u2605", ix + iconSize / 2, iy + iconSize / 2);
  }
  roundRect(ctx, ix, iy, iconSize, iconSize, 28);
  ctx.lineWidth = 5;
  ctx.strokeStyle = accent;
  ctx.stroke();
  const tx = ix + iconSize + 64;
  const tw = CARD_WIDTH - tx - 70;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent;
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText(t("Achievement Unlocked").toUpperCase(), tx, 150);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 60px ${FONT}`;
  const titleLines = wrapText(ctx, data.title, tw, 2);
  let y = 225;
  for (const line of titleLines) {
    ctx.fillText(line, tx, y);
    y += 68;
  }
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `400 30px ${FONT}`;
  const descLines = wrapText(ctx, data.description, tw, titleLines.length > 1 ? 2 : 3);
  y += 6;
  for (const line of descLines) {
    ctx.fillText(line, tx, y);
    y += 42;
  }
  if (data.rarityText) {
    ctx.fillStyle = accent;
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText(data.rarityText, tx, Math.max(y + 24, 400));
  }
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `600 32px ${FONT}`;
  const gameLines = wrapText(ctx, data.game, CARD_WIDTH - 80 - 80 - 300, 1);
  ctx.fillText(gameLines[0] || "", 80, CARD_HEIGHT - 70);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `400 26px ${FONT}`;
  ctx.fillText(data.dateText, CARD_WIDTH - 70, CARD_HEIGHT - 70);
  ctx.font = `400 20px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("Finally Achievement Plugin", CARD_WIDTH - 70, CARD_HEIGHT - 36);
  return canvas.toDataURL("image/png");
}

// shims/jsx.js
var J = window.SP_JSX;
var jsx = J.jsx;
var jsxs = J.jsxs;
var Fragment2 = J.Fragment;

// ../work/Finally Achievement Plugin/src/historyView.tsx
var PAGE = 10;
var NEAR_RANGE = { min: 1, max: 5 };
function locale() {
  return getLanguage() || "en";
}
function relativeTime(iso) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.round((then - Date.now()) / 1e3);
  const abs = Math.abs(seconds);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: "auto" });
    if (abs < 60) return rtf.format(0, "second");
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
    if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), "day");
    return new Date(then).toLocaleDateString(locale(), { dateStyle: "medium" });
  } catch {
    return new Date(then).toLocaleDateString();
  }
}
function rarityText(percent) {
  if (typeof percent !== "number") return "";
  if (percent < 0.1) return t("<0.1% of players");
  return t("{percent}% of players", { percent: formatDecimal(percent.toFixed(1)) });
}
function HistoryView({
  settings,
  updateSettings,
  busy
}) {
  const [entries, setEntries] = useState(null);
  const [shown, setShown] = useState(PAGE);
  const [working, setWorking] = useState(null);
  const [card, setCard] = useState(null);
  const refresh = useCallback(async () => {
    try {
      setEntries(await call("get_history", 100));
    } catch {
      setEntries([]);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const listener = addEventListener(EVENT_NAME, () => {
      window.setTimeout(() => void refresh(), 600);
    });
    return () => removeEventListener(EVENT_NAME, listener);
  }, [refresh]);
  const makeCard = useCallback(async (entry) => {
    const key = `${entry.appid}:${entry.id}:${entry.ts}`;
    setWorking(key);
    setCard(null);
    try {
      const assets = await call(
        "get_share_assets",
        entry.appid,
        entry.id,
        entry.ts
      );
      const url = await renderShareCard({
        title: entry.title,
        description: entry.subtitle,
        game: entry.game,
        rarityText: rarityText(entry.percent),
        tier: entry.tier,
        rare: entry.rare,
        dateText: new Date(entry.ts).toLocaleDateString(locale(), { dateStyle: "medium" }),
        icon: assets?.icon ?? null,
        art: assets?.art ?? null
      });
      const saved = await call(
        "save_share_card",
        url,
        `${entry.game}-${entry.title}`
      );
      setCard({ url, path: saved?.ok ? saved.path ?? null : null, error: saved?.ok ? null : saved?.error ?? "error" });
    } catch (err) {
      setCard({ url: "", path: null, error: String(err) });
    } finally {
      setWorking(null);
    }
  }, []);
  const clear = useCallback(async () => {
    await call("clear_history");
    setCard(null);
    setShown(PAGE);
    await refresh();
  }, [refresh]);
  const list = entries ?? [];
  return /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsxs(PanelSection, { title: t("Recent Unlocks"), children: [
      entries === null && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("Loading...") }) }),
      entries !== null && list.length === 0 && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("No unlocks recorded yet. Achievements you unlock from now on will appear here.") }) }),
      list.slice(0, shown).map((entry) => {
        const key = `${entry.appid}:${entry.id}:${entry.ts}`;
        const parts = [entry.game, rarityText(entry.percent), relativeTime(entry.ts)].filter(Boolean);
        return /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: working !== null,
            onClick: () => void makeCard(entry),
            description: parts.join(" \xB7 "),
            children: working === key ? t("Making card...") : entry.title
          }
        ) }, key);
      }),
      list.length > 0 && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("Select an unlock to make a shareable image card.") }) }),
      list.length > shown && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", onClick: () => setShown(shown + PAGE), children: t("Show more") }) }),
      list.length > 0 && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", disabled: working !== null, onClick: () => void clear(), children: t("Clear history") }) })
    ] }),
    card && /* @__PURE__ */ jsxs(PanelSection, { title: t("Share card"), children: [
      card.url && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("img", { src: card.url, style: { width: "100%", borderRadius: "6px" } }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.85, wordBreak: "break-all" }, children: card.path ? t("Saved to {path}", { path: card.path }) : t("Could not save the card: {error}", { error: card.error ?? "" }) }) })
    ] }),
    /* @__PURE__ */ jsxs(PanelSection, { title: t("Milestone popups"), children: [
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        ToggleField,
        {
          label: t("Session summary"),
          description: t("When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare."),
          checked: settings.session_summary_enabled,
          disabled: busy,
          onChange: (value) => void updateSettings({ session_summary_enabled: value })
        }
      ) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        ToggleField,
        {
          label: t("Almost there alert"),
          description: t("After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%."),
          checked: settings.near_completion_enabled,
          disabled: busy,
          onChange: (value) => void updateSettings({ near_completion_enabled: value })
        }
      ) }),
      settings.near_completion_enabled && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        SliderField,
        {
          label: t("Alert when this many are left"),
          value: settings.near_completion_threshold,
          min: NEAR_RANGE.min,
          max: NEAR_RANGE.max,
          step: 1,
          notchCount: NEAR_RANGE.max - NEAR_RANGE.min + 1,
          showValue: true,
          disabled: busy,
          onChange: (value) => void updateSettings({ near_completion_threshold: value })
        }
      ) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", disabled: busy, onClick: () => void call("test_session_popup"), children: t("Test session summary") }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", disabled: busy, onClick: () => void call("test_near_completion_popup"), children: t("Test almost there alert") }) })
    ] })
  ] });
}

// ../../../opt/npm-tools/node_modules/react-icons/lib/iconContext.mjs
var DefaultContext = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
};
var IconContext = react_default.createContext && /* @__PURE__ */ react_default.createContext(DefaultContext);

// ../../../opt/npm-tools/node_modules/react-icons/lib/iconBase.mjs
var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t2) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t2);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t2.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t2 = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t2[n] = r[n];
  }
  return t2;
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r in t2) ({}).hasOwnProperty.call(t2, r) && (n[r] = t2[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function ownKeys(e, r) {
  var t2 = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t2.push.apply(t2, o);
  }
  return t2;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t2), true).forEach(function(r2) {
      _defineProperty(e, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e;
}
function _defineProperty(e, r, t2) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t2, enumerable: true, configurable: true, writable: true }) : e[r] = t2, e;
}
function _toPropertyKey(t2) {
  var i = _toPrimitive(t2, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t2, r) {
  if ("object" != typeof t2 || !t2) return t2;
  var e = t2[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t2, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t2);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /* @__PURE__ */ react_default.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return (props) => /* @__PURE__ */ react_default.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = (conf) => {
    var attr = props.attr, size = props.size, title = props.title, svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /* @__PURE__ */ react_default.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /* @__PURE__ */ react_default.createElement("title", null, title), props.children);
  };
  return IconContext !== void 0 ? /* @__PURE__ */ react_default.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
}

// ../../../opt/npm-tools/node_modules/react-icons/fa/index.mjs
function FaSteam(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 496 512" }, "child": [{ "tag": "path", "attr": { "d": "M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z" }, "child": [] }] })(props);
}
function FaTrophy(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 576 512" }, "child": [{ "tag": "path", "attr": { "d": "M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z" }, "child": [] }] })(props);
}
function FaSyncAlt(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z" }, "child": [] }] })(props);
}
function FaMapPin(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 288 512" }, "child": [{ "tag": "path", "attr": { "d": "M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z" }, "child": [] }] })(props);
}
function FaRegCircle(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z" }, "child": [] }] })(props);
}

// ../work/Finally Achievement Plugin/src/achievementsTypes.ts
var TRACKER_POSITION_OPTIONS = [
  { data: "top_left", label: "Top left" },
  { data: "top_right", label: "Top right" },
  { data: "bottom_left", label: "Bottom left" },
  { data: "bottom_right", label: "Bottom right" }
];
var TRACKER_SIZE_RANGE = { min: 50, max: 150, step: 10, default: 100 };
var SORT_OPTIONS = [
  { data: "default", label: "Unlocked first" },
  { data: "rarity", label: "Rarity (rarest first)" },
  { data: "alpha", label: "Alphabetical" }
];
var ERROR_MESSAGES = {
  no_running_game: "No game is currently running.",
  steamworks_lib_missing: "Steam's achievement library wasn't found on this system.",
  helper_missing: "The probe script is missing -- try reinstalling the plugin.",
  spawn_failed: "Couldn't start the achievement probe.",
  probe_timeout: "Timed out talking to Steam. Try refreshing.",
  no_probe_output: "Steam didn't return any achievement data for this game.",
  bad_probe_output: "Got an unexpected response from Steam.",
  "No achievements exposed by this title": "This game doesn't have any Steam achievements."
};
function friendlyError(code) {
  if (!code) return t("Something went wrong.");
  const message = ERROR_MESSAGES[code];
  return message ? t(message) : code;
}

// ../work/Finally Achievement Plugin/src/index.tsx
var ICON_RESOLUTION_LABELS = {
  no_achievement_processed_yet: "Nothing unlocked yet this session.",
  no_api_key_configured: "No API key set -- using the local cache only (can't guarantee the colored icon).",
  skipped_no_appid_or_id: "Couldn't identify the game/achievement for this unlock.",
  schema_fetch_error: "The Web API call itself failed (network issue) -- fell back to the local cache.",
  schema_empty: "Steam's API returned an empty/unusable response -- fell back to the local cache. If this keeps happening for the same game, it may be a temporary Steam-side issue.",
  achievement_not_in_schema: "The API call worked, but this specific achievement wasn't found in it -- fell back to the local cache.",
  authoritative_exact_match: "Used the guaranteed-correct colored icon from Steam's Web API.",
  authoritative_case_insensitive_match: "Used the guaranteed-correct colored icon from Steam's Web API (case-insensitive match).",
  authoritative_local_schema: "Used the colored icon from Steam's own local achievement data (no API key needed).",
  authoritative_icon_gray_swapped_to_icongray: "Steam's icon came back gray, so the other icon in its data (the colored one) was used.",
  gray_replaced_by_community_page: "The local icon was gray (locked); used the colored icon from Steam's public achievements page.",
  gray_replaced_by_cache_refresh: "The local icon was gray (locked); waited for Steam to update it and used the colored one.",
  gray_no_colored_variant_found: "Only the gray (locked) icon was available this time -- no colored one could be found.",
  authoritative_gray_no_alternative: "Steam only provided a gray icon for this achievement -- no colored one exists in its data.",
  unverified_icon_kept: "Couldn't confirm this icon is the colored one, and nothing better was found."
};
function describeIconResolution(diagnostic) {
  const code = diagnostic.result.split(":")[0];
  const label = ICON_RESOLUTION_LABELS[code];
  return label ? t(label) : diagnostic.result;
}
var parseHsla = (value) => {
  const match = value.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i
  );
  if (!match) {
    return { h: 35, s: 98, l: 38, a: 0.94 };
  }
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
    a: match[4] ? Number(match[4]) : 1
  };
};
var toErrorMessage = (value) => {
  if (value instanceof Error) {
    return value.message;
  }
  return String(value);
};
var formatTimestamp = (value) => {
  if (!value) {
    return t("never");
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};
var ACH_REFRESH_INTERVAL_MS = 2e4;
var TRACKER_REFRESH_INTERVAL_MS = 5e3;
var VIEW_OPTIONS = [
  { data: "popup", label: "Popup" },
  { data: "style", label: "Colors & style" },
  { data: "sound", label: "Sound & tests" },
  { data: "achievements", label: "Achievements & tracker" },
  { data: "history", label: "History & sharing" },
  { data: "advanced", label: "Advanced" }
];
function formatUnlockTime(unixSeconds) {
  if (!unixSeconds) return "";
  const date = new Date(unixSeconds * 1e3);
  return date.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function formatRarity(percent) {
  if (percent === null || percent === void 0) return "";
  if (percent < 0.1) return t("<0.1% of players");
  return t("{percent}% of players", { percent: formatDecimal(percent.toFixed(1)) });
}
function filterAchievements(list, query) {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return list;
  return list.filter((achievement) => {
    const haystack = `${achievement.name} ${achievement.description}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
function sortAchievements(list, mode) {
  const copy = [...list];
  if (mode === "alpha") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode === "rarity") {
    copy.sort((a, b) => (a.global_percent ?? 101) - (b.global_percent ?? 101));
  } else {
    copy.sort((a, b) => {
      if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
      if (a.achieved) return b.unlock_time - a.unlock_time;
      return a.order - b.order;
    });
  }
  return copy;
}
function AchievementIcon({ achievement }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !achievement.icon || failed;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: achievement.achieved ? 1 : 0.45,
        filter: achievement.achieved ? "none" : "grayscale(0.6)"
      },
      children: showFallback ? /* @__PURE__ */ jsx(FaTrophy, { size: 18, color: "rgba(255,255,255,0.5)" }) : /* @__PURE__ */ jsx(
        "img",
        {
          src: achievement.icon ?? void 0,
          alt: "",
          loading: "lazy",
          onError: () => setFailed(true),
          style: { width: "100%", height: "100%", objectFit: "cover" }
        }
      )
    }
  );
}
function AchievementRow({
  achievement,
  isTracked,
  onToggleTrack
}) {
  const [focused, setFocused] = useState(false);
  return /* @__PURE__ */ jsxs(
    Focusable,
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 2px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: focused ? "rgba(92, 195, 92, 0.30)" : isTracked ? "rgba(92, 195, 92, 0.08)" : "transparent",
        boxShadow: focused ? "inset 3px 0 0 #5cc35c" : "none",
        transition: "background 0.12s ease"
      },
      onActivate: () => onToggleTrack(achievement),
      ...{
        onGamepadFocus: () => setFocused(true),
        onGamepadBlur: () => setFocused(false)
      },
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      children: [
        /* @__PURE__ */ jsx(AchievementIcon, { achievement }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                fontWeight: 600,
                fontSize: 14,
                color: achievement.achieved ? "#fff" : "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              },
              children: achievement.name
            }
          ),
          achievement.description && /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              },
              children: achievement.description
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: { fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "right", flexShrink: 0, maxWidth: 90 },
            children: achievement.achieved ? formatUnlockTime(achievement.unlock_time) : formatRarity(achievement.global_percent)
          }
        ),
        isTracked ? /* @__PURE__ */ jsx(FaMapPin, { size: 14, color: "#5cc35c", style: { flexShrink: 0 } }) : /* @__PURE__ */ jsx(FaRegCircle, { size: 11, color: "rgba(255,255,255,0.25)", style: { flexShrink: 0 } })
      ]
    }
  );
}
function ProgressSummary({ data }) {
  const total = data.total ?? data.achievements.length;
  const unlocked = data.unlocked_count ?? data.achievements.filter((a) => a.achieved).length;
  const percent = total > 0 ? Math.round(unlocked / total * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 8 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }, children: [
      /* @__PURE__ */ jsx("span", { children: t("{unlocked} / {total} unlocked", { unlocked, total }) }),
      /* @__PURE__ */ jsxs("span", { children: [
        percent,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          height: "100%",
          width: `${percent}%`,
          background: "linear-gradient(90deg, #5cc35c, #3a9d3a)",
          transition: "width 0.3s ease"
        }
      }
    ) })
  ] });
}
function TrackerSummary({ tracked, onStop }) {
  const target = tracked.target;
  const state = tracked.state;
  if (!target) return null;
  let statusText = t("Waiting for live data...");
  if (state) {
    if (state.achieved) statusText = t("\u2713 Unlocked");
    else if (state.has_progress && state.max) statusText = `${state.current ?? 0} / ${state.max}`;
    else if (typeof state.percent === "number") statusText = formatRarity(state.percent);
    else statusText = t("In progress");
  }
  return /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsx(FaMapPin, { color: "#5cc35c" }),
      /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: target.name }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: statusText })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", onClick: onStop, children: t("Stop tracking") }) })
  ] });
}
function AchievementsView({
  settings,
  updateSettings,
  busy
}) {
  const [game, setGame] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("default");
  const [query, setQuery] = useState("");
  const [tracked, setTracked] = useState({ tracked: false });
  const load = async () => {
    setLoading(true);
    try {
      const currentGame = await call("get_current_game");
      setGame(currentGame);
      const response = await call(
        "get_achievements",
        currentGame.appid ?? void 0
      );
      setData(response);
    } catch (err) {
      setData({ ok: false, error: String(err), appid: null, name: null, achievements: [] });
    } finally {
      setLoading(false);
    }
  };
  const refreshTracked = async () => {
    try {
      setTracked(await call("get_tracked_achievement"));
    } catch {
    }
  };
  useEffect(() => {
    void load();
    void refreshTracked();
    const dataInterval = setInterval(() => void load(), ACH_REFRESH_INTERVAL_MS);
    const trackerInterval = setInterval(() => void refreshTracked(), TRACKER_REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(dataInterval);
      clearInterval(trackerInterval);
    };
  }, []);
  const handleToggleTrack = async (achievement) => {
    const isCurrentlyTracked = tracked.target?.achievement_id === achievement.id;
    try {
      if (isCurrentlyTracked) {
        setTracked(await call("clear_tracked_achievement"));
      } else if (data?.appid) {
        setTracked(
          await call(
            "set_tracked_achievement",
            data.appid,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.icon
          )
        );
      }
    } catch {
      void refreshTracked();
    }
  };
  const handleStopTracking = async () => {
    try {
      setTracked(await call("clear_tracked_achievement"));
    } catch {
      void refreshTracked();
    }
  };
  const sorted = useMemo(
    () => data?.ok ? sortAchievements(filterAchievements(data.achievements, query), sortMode) : [],
    [data, sortMode, query]
  );
  const searching = query.trim().length > 0;
  return /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsxs(PanelSection, { title: t("Currently Playing"), children: [
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600 }, children: game?.name ?? (game?.appid ? t("App {id}", { id: game.appid }) : t("No game running")) }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs(ButtonItem, { layout: "below", onClick: () => void load(), children: [
        /* @__PURE__ */ jsx(FaSyncAlt, { style: { marginRight: 6 } }),
        loading ? t("Refreshing...") : t("Refresh")
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(PanelSection, { title: t("Achievements"), children: !data || loading && !data.achievements.length ? /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: t("Loading achievements...") }) }) : !data.ok ? /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.7)" }, children: friendlyError(data.error) }) }) : data.achievements.length === 0 ? /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: t("No achievements found for this game.") }) }) : /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ProgressSummary, { data }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        TextField,
        {
          label: t("Search"),
          description: t("Type part of a name or description."),
          value: query,
          onChange: (event) => setQuery(event.target.value)
        }
      ) }),
      searching && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", onClick: () => setQuery(""), children: t("Clear search") }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        DropdownItem,
        {
          label: t("Sort by"),
          rgOptions: tOpts(SORT_OPTIONS),
          selectedOption: sortMode,
          onChange: (selection) => setSortMode(selection.data)
        }
      ) }),
      searching && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: sorted.length === 0 ? t("No achievements match your search.") : t("Showing {shown} of {total}", { shown: sorted.length, total: data.achievements.length }) }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(Focusable, { style: { maxHeight: 420, overflowY: "auto", width: "100%" }, "flow-children": "vertical", children: sorted.map((achievement) => /* @__PURE__ */ jsx(
        AchievementRow,
        {
          achievement,
          isTracked: tracked.target?.achievement_id === achievement.id,
          onToggleTrack: handleToggleTrack
        },
        achievement.id
      )) }) })
    ] }) }),
    /* @__PURE__ */ jsxs(PanelSection, { title: t("Achievement Tracker"), children: [
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: t("Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.") }) }),
      tracked.tracked && tracked.target ? /* @__PURE__ */ jsx(TrackerSummary, { tracked, onStop: handleStopTracking }) : /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: t("Nothing pinned right now.") }) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        DropdownItem,
        {
          label: t("Tracker position"),
          rgOptions: tOpts(TRACKER_POSITION_OPTIONS),
          selectedOption: settings.tracker_position,
          disabled: busy,
          onChange: (selection) => void updateSettings({ tracker_position: selection.data })
        }
      ) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        DropdownItem,
        {
          label: t("Tracker template"),
          description: t("Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it."),
          rgOptions: tOpts(TRACKER_TEMPLATE_OPTIONS),
          selectedOption: settings.tracker_template,
          disabled: busy,
          onChange: (selection) => void updateSettings({ tracker_template: selection.data })
        }
      ) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        SliderField,
        {
          label: t("Tracker size"),
          value: settings.tracker_size_percent,
          min: TRACKER_SIZE_RANGE.min,
          max: TRACKER_SIZE_RANGE.max,
          step: TRACKER_SIZE_RANGE.step,
          notchCount: (TRACKER_SIZE_RANGE.max - TRACKER_SIZE_RANGE.min) / TRACKER_SIZE_RANGE.step + 1,
          showValue: true,
          valueSuffix: "%",
          disabled: busy,
          onChange: (value) => void updateSettings({ tracker_size_percent: value })
        }
      ) })
    ] })
  ] });
}
function StatusPanel() {
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sounds, setSounds] = useState([]);
  const [soundFolder, setSoundFolder] = useState("");
  const [statusError, setStatusError] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [profileOverride, setProfileOverride] = useState(null);
  const [view, setView] = useState("popup");
  const [steamLang, setSteamLang] = useState(null);
  const [langInfo, setLangInfo] = useState(null);
  const [overlayCheck, setOverlayCheck] = useState(null);
  const [apiKeyStatus, setApiKeyStatus] = useState({
    configured: false,
    masked: null
  });
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyMessage, setApiKeyMessage] = useState(null);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);
  const [iconDiagnostic, setIconDiagnostic] = useState({
    result: "no_achievement_processed_yet"
  });
  const refreshIconDiagnostic = useCallback(async () => {
    try {
      const next = await call("get_last_icon_resolution");
      setIconDiagnostic(next);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);
  const refreshApiKeyStatus = useCallback(async () => {
    try {
      const next = await call("get_steam_web_api_key_status");
      setApiKeyStatus(next);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);
  const refreshStatus = useCallback(async () => {
    try {
      const next = await call("get_status");
      setStatus(next);
      setProfileOverride(null);
      setSettings(next.settings ?? DEFAULT_SETTINGS);
      setStatusError(null);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);
  const refreshSettings = useCallback(async () => {
    try {
      const [nextSettings, nextSounds] = await Promise.all([
        call("get_settings"),
        call("get_sounds")
      ]);
      setSettings(nextSettings);
      setSounds(nextSounds.sounds);
      setSoundFolder(nextSounds.folder);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: nextSettings }));
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);
  useEffect(() => {
    const listener = addEventListener(
      EVENT_NAME,
      (payload) => {
        if (payload) {
          setLastEvent(payload);
        }
      }
    );
    void refreshStatus();
    void refreshSettings();
    void call("get_steam_language").then((code) => setSteamLang(languageFromSteam(code))).catch(() => void 0);
    void refreshApiKeyStatus();
    void refreshIconDiagnostic();
    const interval = window.setInterval(() => {
      void refreshStatus();
      void refreshIconDiagnostic();
    }, 5e3);
    return () => {
      window.clearInterval(interval);
      removeEventListener(EVENT_NAME, listener);
    };
  }, [refreshSettings, refreshStatus, refreshApiKeyStatus, refreshIconDiagnostic]);
  const chosenLanguage = settings.language === "auto" ? detectSteamLanguage() ?? steamLang ?? "en" : settings.language;
  setLanguage(chosenLanguage);
  useEffect(() => {
    void call("set_detected_language", detectSteamLanguage() ?? "").catch(() => void 0);
  }, []);
  useEffect(() => {
    if (chosenLanguage !== "zh-Hans") {
      setLangInfo(null);
      return;
    }
    void call("get_language_info").then((info) => setLangInfo(info)).catch(() => void 0);
  }, [chosenLanguage, settings.language]);
  const gameProfile = profileOverride ?? status?.game_profile ?? { available: false, appid: null, name: "", enabled: false };
  const handleProfileToggle = useCallback(
    async (enabled) => {
      setPendingAction("profile");
      try {
        const result = await call(
          "set_game_profile_enabled",
          enabled
        );
        setSettings(result.settings);
        setProfileOverride(result.game_profile);
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: result.settings }));
      } catch (error) {
        setStatusError(toErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    },
    []
  );
  const handleOverlayCheck = useCallback(async () => {
    setPendingAction("overlay_check");
    try {
      setOverlayCheck(await call("run_overlay_check"));
    } catch (error) {
      setOverlayCheck({
        ok: false,
        verdict: t("The check itself failed: {error}", { error: toErrorMessage(error) }),
        checks: [],
        last_status: "",
        last_error: null
      });
    } finally {
      setPendingAction(null);
    }
  }, []);
  const handleProfileReset = useCallback(async () => {
    setPendingAction("profile");
    try {
      const result = await call("reset_game_profile");
      setSettings(result.settings);
      setProfileOverride(result.game_profile);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: result.settings }));
    } catch (error) {
      setStatusError(toErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, []);
  const handleSaveApiKey = useCallback(async () => {
    setApiKeyBusy(true);
    setApiKeyMessage(null);
    try {
      const result = await call(
        "set_steam_web_api_key",
        apiKeyInput
      );
      setApiKeyStatus({ configured: result.configured, masked: result.masked });
      if (result.ok) {
        setApiKeyInput("");
        setApiKeyMessage(t("Saved."));
      } else {
        setApiKeyMessage(result.error ?? t("Couldn't save that key."));
      }
    } catch (error) {
      setApiKeyMessage(toErrorMessage(error));
    } finally {
      setApiKeyBusy(false);
    }
  }, [apiKeyInput]);
  const handleClearApiKey = useCallback(async () => {
    setApiKeyBusy(true);
    setApiKeyMessage(null);
    try {
      const result = await call("clear_steam_web_api_key");
      setApiKeyStatus({ configured: result.configured, masked: result.masked });
      setApiKeyMessage(t("Removed."));
    } catch (error) {
      setApiKeyMessage(toErrorMessage(error));
    } finally {
      setApiKeyBusy(false);
    }
  }, []);
  const updateSettings = useCallback(
    async (patch) => {
      setPendingAction("settings");
      try {
        const next = await call(
          "set_settings",
          patch
        );
        setSettings(next);
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus]
  );
  const openColorPicker = useCallback(
    (key, title) => {
      const color = parseHsla(settings[key]);
      let modal;
      modal = showModal(
        /* @__PURE__ */ jsx(
          ColorPickerModal,
          {
            closeModal: () => modal?.Close(),
            title,
            defaultH: color.h,
            defaultS: color.s,
            defaultL: color.l,
            defaultA: color.a,
            onConfirm: (nextColor) => {
              void updateSettings({ [key]: nextColor });
            }
          }
        )
      );
    },
    [settings, updateSettings]
  );
  const colorsLocked = settings.template_colors_enabled;
  const colorButton = (key, rawLabel) => {
    const label = t(rawLabel);
    return /* @__PURE__ */ jsx(
      ButtonItem,
      {
        disabled: pendingAction !== null || colorsLocked,
        onClick: () => openColorPicker(key, label),
        layout: "below",
        description: settings[key],
        children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ jsx("span", { children: label }),
          /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                width: "42px",
                height: "18px",
                borderRadius: "999px",
                background: settings[key],
                border: "1px solid rgba(255,255,255,0.5)",
                display: "inline-block"
              }
            }
          )
        ] })
      }
    );
  };
  const soundOptions = sounds.map((sound) => ({
    data: sound.name,
    label: sound.source === "user" ? `${sound.name} ${t("(yours)")}` : sound.name
  }));
  const trigger = useCallback(
    async (method) => {
      setPendingAction(method);
      try {
        await call(method);
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus]
  );
  return /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsxs(PanelSection, { title: t("Finally Achievement Plugin"), children: [
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        DropdownItem,
        {
          label: t("Show"),
          rgOptions: tOpts(VIEW_OPTIONS),
          selectedOption: view,
          onChange: (selection) => setView(selection.data)
        }
      ) }),
      /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
        DropdownItem,
        {
          label: t("Language"),
          rgOptions: tOpts(LANGUAGE_OPTIONS),
          selectedOption: settings.language,
          disabled: pendingAction !== null,
          onChange: (selection) => void updateSettings({ language: selection.data })
        }
      ) }),
      chosenLanguage === "zh-Hans" && langInfo && langInfo.cjk_checked && !langInfo.cjk_font && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.", { folder: langInfo.fonts_folder }) }) }),
      view !== "achievements" && view !== "popup" && view !== "history" && gameProfile.available && gameProfile.enabled && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("Editing settings for {name} only.", { name: gameProfile.name }) }) })
    ] }),
    view === "achievements" && /* @__PURE__ */ jsx(
      AchievementsView,
      {
        settings,
        updateSettings,
        busy: pendingAction !== null
      }
    ),
    view === "history" && /* @__PURE__ */ jsx(
      HistoryView,
      {
        settings,
        updateSettings,
        busy: pendingAction !== null
      }
    ),
    view === "popup" && /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Game Settings"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: gameProfile.available ? t("Custom settings for {name}", { name: gameProfile.name }) : t("Custom settings for this game"),
            description: gameProfile.available ? t("When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.") : t("Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games."),
            checked: gameProfile.enabled,
            disabled: pendingAction !== null || !gameProfile.available,
            onChange: (value) => void handleProfileToggle(value)
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: gameProfile.available && gameProfile.enabled ? t("Editing settings for {name} only.", { name: gameProfile.name }) : t("Editing settings for all games.") }) }),
        gameProfile.available && gameProfile.enabled && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: pendingAction !== null,
            onClick: () => void handleProfileReset(),
            children: t("Reset this game to the global settings")
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Appearance"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Popup template"),
            description: t("The overall card design/style."),
            rgOptions: tOpts(OVERLAY_TEMPLATE_OPTIONS),
            selectedOption: settings.overlay_template,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ overlay_template: selection.data })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Popup position"),
            description: t("Where the banner appears on screen."),
            rgOptions: tOpts(OVERLAY_POSITION_OPTIONS),
            selectedOption: settings.overlay_position,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ overlay_position: selection.data })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Popup screen size"),
            description: t("Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below."),
            rgOptions: tOpts(OVERLAY_SCREEN_OPTIONS),
            selectedOption: settings.overlay_screen,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ overlay_screen: selection.data })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: pendingAction !== null,
            onClick: () => void call("show_screen_frame", settings.overlay_screen),
            description: t("Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above."),
            children: t("Show screen frame")
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Popup size"),
            description: t("0% hides the banner; 50% is the default size."),
            value: settings.overlay_size_percent,
            min: 0,
            max: 100,
            step: 5,
            notchCount: 21,
            showValue: true,
            valueSuffix: "%",
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ overlay_size_percent: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Popup duration"),
            description: t("How long the toast stays on screen before it slides away."),
            value: settings.duration_seconds,
            min: DURATION_RANGE.min,
            max: DURATION_RANGE.max,
            step: DURATION_RANGE.step,
            notchCount: DURATION_RANGE.max - DURATION_RANGE.min + 1,
            showValue: true,
            valueSuffix: "s",
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ duration_seconds: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Show unlock percentage"),
            description: t("Shows what percentage of players have the achievement, e.g. 4.7% of players."),
            checked: settings.show_percent,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ show_percent: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Percentage badge position"),
            description: t("Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines."),
            rgOptions: tOpts(PERCENT_POSITION_OPTIONS),
            selectedOption: settings.percent_position,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ percent_position: selection.data })
          }
        ) }),
        settings.show_percent && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Unlock percentage size"),
            description: t("Size of the small '4.7% of players' badge. 100% is the default."),
            value: settings.percent_size,
            min: PERCENT_SIZE_RANGE.min,
            max: PERCENT_SIZE_RANGE.max,
            step: PERCENT_SIZE_RANGE.step,
            notchCount: (PERCENT_SIZE_RANGE.max - PERCENT_SIZE_RANGE.min) / PERCENT_SIZE_RANGE.step + 1,
            showValue: true,
            valueSuffix: "%",
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ percent_size: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Template effects"),
            description: t("Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look."),
            checked: settings.template_fx_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ template_fx_enabled: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Completion popup at 100%"),
            description: t("When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup."),
            checked: settings.completion_toast_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ completion_toast_enabled: value })
          }
        ) }),
        settings.completion_toast_enabled && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Completion popup name"),
            description: t("The big text on the 100% completion popup."),
            rgOptions: tOpts(COMPLETION_TITLE_OPTIONS),
            selectedOption: settings.completion_title,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ completion_title: selection.data })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Placeholder icon"),
            description: t("Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2)."),
            rgOptions: tOpts(PLACEHOLDER_ICON_OPTIONS),
            selectedOption: settings.placeholder_icon,
            disabled: pendingAction !== null,
            onChange: (selection) => void updateSettings({ placeholder_icon: selection.data })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Rarity Tiers"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Rarity tiers"),
            description: t("Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound."),
            checked: settings.rarity_tiers_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ rarity_tiers_enabled: value })
          }
        ) }),
        settings.rarity_tiers_enabled && /* @__PURE__ */ jsxs(Fragment2, { children: [
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            SliderField,
            {
              label: t("Ultra rare: this % or lower"),
              value: settings.tier_ultra_cutoff,
              min: TIER_CUTOFF_RANGES.ultra.min,
              max: TIER_CUTOFF_RANGES.ultra.max,
              step: TIER_CUTOFF_RANGES.ultra.step,
              showValue: true,
              valueSuffix: "%",
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ tier_ultra_cutoff: value })
            }
          ) }),
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            SliderField,
            {
              label: t("Rare: this % or lower"),
              value: settings.tier_rare_cutoff,
              min: TIER_CUTOFF_RANGES.rare.min,
              max: TIER_CUTOFF_RANGES.rare.max,
              step: TIER_CUTOFF_RANGES.rare.step,
              showValue: true,
              valueSuffix: "%",
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ tier_rare_cutoff: value })
            }
          ) }),
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            SliderField,
            {
              label: t("Uncommon: this % or lower"),
              value: settings.tier_uncommon_cutoff,
              min: TIER_CUTOFF_RANGES.uncommon.min,
              max: TIER_CUTOFF_RANGES.uncommon.max,
              step: TIER_CUTOFF_RANGES.uncommon.step,
              showValue: true,
              valueSuffix: "%",
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ tier_uncommon_cutoff: value })
            }
          ) }),
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("Ultra rare \u2264 {ultra}%, Rare \u2264 {rare}%, Uncommon \u2264 {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.", { ultra: settings.tier_ultra_cutoff, rare: settings.tier_rare_cutoff, uncommon: settings.tier_uncommon_cutoff }) }) })
        ] })
      ] })
    ] }),
    view === "style" && /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Colors"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Use each template's own colors"),
            description: t("The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored."),
            checked: settings.template_colors_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ template_colors_enabled: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Gradient from icon colors"),
            description: t("Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available)."),
            checked: settings.icon_gradient_enabled,
            disabled: pendingAction !== null || colorsLocked,
            onChange: (value) => void updateSettings(
              value ? { icon_gradient_enabled: true, game_art_gradient_enabled: false } : { icon_gradient_enabled: false }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Gradient from game artwork colors"),
            description: t("Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read."),
            checked: settings.game_art_gradient_enabled,
            disabled: pendingAction !== null || colorsLocked,
            onChange: (value) => void updateSettings(
              value ? { game_art_gradient_enabled: true, icon_gradient_enabled: false } : { game_art_gradient_enabled: false }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          DropdownItem,
          {
            label: t("Gradient direction"),
            description: t("Direction of the card's background gradient, or a flat solid color."),
            rgOptions: tOpts(GRADIENT_DIRECTION_OPTIONS),
            selectedOption: settings.gradient_direction,
            disabled: pendingAction !== null || colorsLocked,
            onChange: (selection) => void updateSettings({ gradient_direction: selection.data })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.normal_gradient_start}, ${settings.normal_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
              opacity: colorsLocked ? 0.35 : 1
            }
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("normal_gradient_start", "Normal gradient start") }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("normal_gradient_end", "Normal gradient end") }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.rare_gradient_start}, ${settings.rare_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
              opacity: colorsLocked ? 0.35 : 1
            }
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("rare_gradient_start", "Rare gradient start") }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("rare_gradient_end", "Rare gradient end") }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("normal_circle_color", "Normal circle color") }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: colorButton("rare_circle_color", "Rare circle color") })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Glow"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Icon glow"),
            description: t("The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below)."),
            checked: settings.icon_glow_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ icon_glow_enabled: value })
          }
        ) }),
        settings.icon_glow_enabled && /* @__PURE__ */ jsxs(Fragment2, { children: [
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            SliderField,
            {
              label: t("Glow intensity"),
              description: t("50 is the default look; 0 is basically off, 100 doubles it."),
              value: settings.icon_glow_intensity,
              min: GLOW_INTENSITY_RANGE.min,
              max: GLOW_INTENSITY_RANGE.max,
              step: GLOW_INTENSITY_RANGE.step,
              notchCount: 11,
              showValue: true,
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ icon_glow_intensity: value })
            }
          ) }),
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            SliderField,
            {
              label: t("Ring size"),
              description: t("How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it."),
              value: settings.ring_size,
              min: RING_SIZE_RANGE.min,
              max: RING_SIZE_RANGE.max,
              step: RING_SIZE_RANGE.step,
              notchCount: 11,
              showValue: true,
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ ring_size: value })
            }
          ) }),
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            ToggleField,
            {
              label: t("Glow for normal achievements"),
              description: t("The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)"),
              checked: settings.glow_normal_enabled,
              disabled: pendingAction !== null,
              onChange: (value) => void updateSettings({ glow_normal_enabled: value })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Icon frame ring"),
            description: t("The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing."),
            checked: settings.icon_frame_ring_enabled,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ icon_frame_ring_enabled: value })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Text"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Title font size"),
            description: t("Font size of the achievement name."),
            value: settings.title_font_size,
            min: FONT_SIZE_RANGES.title_font_size.min,
            max: FONT_SIZE_RANGES.title_font_size.max,
            step: 1,
            showValue: true,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ title_font_size: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Description font size"),
            description: t("Font size of the subtitle/description line."),
            value: settings.subtitle_font_size,
            min: FONT_SIZE_RANGES.subtitle_font_size.min,
            max: FONT_SIZE_RANGES.subtitle_font_size.max,
            step: 1,
            showValue: true,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ subtitle_font_size: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Label font size"),
            description: t("Font size of the small eyebrow label above the title."),
            value: settings.label_font_size,
            min: FONT_SIZE_RANGES.label_font_size.min,
            max: FONT_SIZE_RANGES.label_font_size.max,
            step: 1,
            showValue: true,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ label_font_size: value })
          }
        ) })
      ] })
    ] }),
    view === "sound" && /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Sound"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          SliderField,
          {
            label: t("Volume"),
            description: t("50% is the default volume; 0% is silent."),
            value: settings.volume_percent,
            min: 0,
            max: 100,
            step: 10,
            notchCount: 11,
            showValue: true,
            valueSuffix: "%",
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ volume_percent: value })
          }
        ) }),
        SOUND_SLOT_OPTIONS.map(({ slot, label, description }) => {
          const key = `sound_${slot}`;
          return /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
            DropdownItem,
            {
              label: t(label),
              description: t(description),
              rgOptions: soundOptions,
              selectedOption: settings[key],
              disabled: pendingAction !== null || soundOptions.length === 0,
              onChange: (selection) => void updateSettings({ [key]: selection.data })
            }
          ) }, slot);
        }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t('Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with "(yours)" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.', { folder: soundFolder || t("the Finally Achievement Plugin settings folder, sounds") }) }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: pendingAction !== null,
            onClick: () => void refreshSettings(),
            children: t("Refresh sound list")
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Popup Tests"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ToggleField,
          {
            label: t("Use the running game for tests"),
            description: t("While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample."),
            checked: settings.test_with_game_data,
            disabled: pendingAction !== null,
            onChange: (value) => void updateSettings({ test_with_game_data: value })
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void trigger("test_popup_common"),
            layout: "below",
            description: t("A common unlock (above the Uncommon cutoff): no tier label."),
            children: t("Test Common")
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void trigger("test_popup_uncommon"),
            layout: "below",
            description: t("An uncommon unlock: tier label only."),
            children: t("Test Uncommon")
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void trigger("test_popup_rare"),
            layout: "below",
            description: t("A rare unlock: gold look, rare sound and glow."),
            children: t("Test Rare")
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void trigger("test_popup_ultra_rare"),
            layout: "below",
            description: t("An ultra rare unlock: extra sparkles and a longer shine."),
            children: t("Test Ultra Rare")
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void trigger("test_completion_popup"),
            layout: "below",
            description: t("The special popup for unlocking every achievement in a game, using the running game's name."),
            children: t("Test Completionist")
          }
        ) })
      ] })
    ] }),
    view === "advanced" && /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Popup Not Showing?"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: t("If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.") }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: pendingAction !== null,
            onClick: () => void handleOverlayCheck(),
            children: pendingAction === "overlay_check" ? t("Checking...") : t("Run overlay check")
          }
        ) }),
        overlayCheck && /* @__PURE__ */ jsxs(Fragment2, { children: [
          /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: "13px", fontWeight: 600, color: overlayCheck.ok ? "#5cc35c" : "#ff8a5c" }, children: overlayCheck.verdict }) }),
          overlayCheck.checks.map((check, index) => /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs("div", { style: { fontSize: "12px", display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ jsx("span", { style: { color: check.ok ? "#5cc35c" : check.fatal === false ? "#d8c25c" : "#ff8a5c", flexShrink: 0 }, children: check.ok ? "\u2713" : check.fatal === false ? "!" : "\u2717" }),
            /* @__PURE__ */ jsxs("span", { style: { opacity: 0.9 }, children: [
              /* @__PURE__ */ jsx("b", { children: check.name }),
              check.detail ? ` \u2014 ${check.detail}` : ""
            ] })
          ] }) }, `${check.name}-${index}`)),
          (overlayCheck.last_status || overlayCheck.last_error) && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs("div", { style: { fontSize: "12px", opacity: 0.8 }, children: [
            "Last popup: ",
            overlayCheck.last_status || "none yet",
            overlayCheck.last_error ? ` \u2014 ${overlayCheck.last_error}` : ""
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Achievement Icon Accuracy"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }, children: t("Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey") }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13 }, children: apiKeyStatus.configured ? t("Key saved (ending in {tail})", { tail: apiKeyStatus.masked?.slice(-4) ?? "????" }) : t("No API key set -- using the local cache only.") }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          TextField,
          {
            label: t("Steam Web API key"),
            value: apiKeyInput,
            onChange: (event) => setApiKeyInput(event.target.value),
            disabled: apiKeyBusy
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            layout: "below",
            disabled: apiKeyBusy || apiKeyInput.trim().length === 0,
            onClick: () => void handleSaveApiKey(),
            children: apiKeyBusy ? t("Saving...") : t("Save key")
          }
        ) }),
        apiKeyStatus.configured && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", disabled: apiKeyBusy, onClick: () => void handleClearApiKey(), children: t("Remove key") }) }),
        apiKeyMessage && /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.7)" }, children: apiKeyMessage }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }, children: [
          t("Last unlock's icon:"),
          " ",
          describeIconResolution(iconDiagnostic),
          iconDiagnostic.achievement_id ? ` (${iconDiagnostic.achievement_id})` : ""
        ] }) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(ButtonItem, { layout: "below", onClick: () => void refreshIconDiagnostic(), children: t("Refresh") }) })
      ] }),
      /* @__PURE__ */ jsxs(PanelSection, { title: t("Watcher Status"), children: [
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsx(
          ButtonItem,
          {
            disabled: pendingAction !== null,
            onClick: () => void refreshStatus(),
            description: t("Manually refresh backend status."),
            children: "Refresh Status"
          }
        ) }),
        /* @__PURE__ */ jsx(PanelSectionRow, { children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "Log watcher: ",
            /* @__PURE__ */ jsx("strong", { children: status?.watcher_running ? "yes" : "no" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Cache watcher:",
            " ",
            /* @__PURE__ */ jsx("strong", { children: status?.librarycache_watcher_running ? "yes" : "no" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Watcher mode: ",
            status?.watcher_mode ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Inotify app: ",
            status?.last_inotify_event_appid ?? "-",
            " / latency:",
            " ",
            status?.last_queue_latency_ms ?? "-",
            "ms"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Inotify events: ",
            status?.processed_inotify_events ?? 0,
            " / fallback scans:",
            " ",
            status?.fallback_scan_count ?? 0
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last inotify path: ",
            status?.last_inotify_event_path ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Parse retry: ",
            status?.last_parse_retry_error ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steam API:",
            " ",
            /* @__PURE__ */ jsx("strong", { children: status?.steam_api_enabled ? status.steam_api_running ? "running" : "enabled" : "disabled" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steam API status: ",
            status?.steam_api_status ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steam API appids:",
            " ",
            status?.steam_api_last_appids?.length ? status.steam_api_last_appids.join(", ") : "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steam API error: ",
            status?.steam_api_last_error ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steamworks:",
            " ",
            /* @__PURE__ */ jsx("strong", { children: status?.steamworks_running ? "running" : "idle" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steamworks app: ",
            status?.steamworks_last_appid ?? "-",
            " / poll:",
            " ",
            status?.steamworks_poll_interval_ms ?? "-",
            "ms"
          ] }),
          /* @__PURE__ */ jsx("div", { children: "Theme: XBOX Achievement" }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Sounds: ",
            settings.sound_common,
            " / ",
            settings.sound_rare
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Size/volume: ",
            settings.overlay_size_percent,
            "% / ",
            settings.volume_percent,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Position: ",
            settings.overlay_position
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Template: ",
            settings.overlay_template
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Fonts: ",
            settings.label_font_size,
            " / ",
            settings.title_font_size,
            " /",
            " ",
            settings.subtitle_font_size
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steamworks status: ",
            status?.steamworks_status ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steamworks unlocks: ",
            status?.steamworks_unlock_count ?? 0
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Steamworks error: ",
            status?.steamworks_last_error ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last match: ",
            formatTimestamp(status?.last_match_timestamp ?? null)
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last source: ",
            status?.last_match_source ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Duplicate window: ",
            status?.duplicate_window_seconds ?? "?",
            "s"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Log path: ",
            status?.log_path ?? "unknown"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Cache files seen: ",
            status?.librarycache_files_seen ?? "?"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Cache glob: ",
            status?.librarycache_glob ?? "unknown"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last scanned app: ",
            status?.last_scanned_appid ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Cache status: ",
            status?.last_cache_status ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Cache mtime:",
            " ",
            status?.last_cache_mtime ? formatTimestamp(new Date(status.last_cache_mtime * 1e3).toISOString()) : "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "New IDs:",
            " ",
            status?.last_new_unlock_ids?.length ? status.last_new_unlock_ids.join(", ") : "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Parse note: ",
            status?.last_parse_error ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Sample: ",
            status?.last_match_sample ?? "-"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Last event:",
            " ",
            lastEvent ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}` : "none"
          ] }),
          statusError ? /* @__PURE__ */ jsxs("div", { style: { color: "#ff8a80" }, children: [
            "Status error: ",
            statusError
          ] }) : null
        ] }) })
      ] })
    ] })
  ] });
}
var index_default = definePlugin(() => {
  return {
    name: "Finally Achievement Plugin",
    icon: /* @__PURE__ */ jsx(FaSteam, {}),
    alwaysRender: true,
    titleView: /* @__PURE__ */ jsx("div", { className: staticClasses.Title, children: "Finally Achievement Plugin" }),
    content: /* @__PURE__ */ jsx(StatusPanel, {})
  };
});
export {
  index_default as default
};
