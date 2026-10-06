const manifest = {"name":"Finally Achievement Plugin"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const call = api.call;
const addEventListener = api.addEventListener;
const removeEventListener = api.removeEventListener;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaSteam (props) {
  return GenIcon({"attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z"},"child":[]}]})(props);
}function FaMapPin (props) {
  return GenIcon({"attr":{"viewBox":"0 0 288 512"},"child":[{"tag":"path","attr":{"d":"M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"},"child":[]}]})(props);
}function FaSyncAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z"},"child":[]}]})(props);
}function FaTrophy (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"},"child":[]}]})(props);
}function FaRegCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"},"child":[]}]})(props);
}

const EVENT_NAME = "finally_show";
const SETTINGS_EVENT = "finally_settings_changed";
const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
const DEFAULT_RARE_SOUND = "rare_preroll.wav";
// Kept in sync with FONT_SIZE_RANGES in main.py / the clamping in
// finally_gamescope_overlay.py's main().
const FONT_SIZE_RANGES = {
    label_font_size: { min: 9, max: 18},
    title_font_size: { min: 18, max: 34},
    subtitle_font_size: { min: 12, max: 22},
};
// Kept in sync with DURATION_RANGE in main.py and the FINALLY_SECONDS default
// in finally_gamescope_overlay.py. Value is seconds the toast stays on screen.
const DURATION_RANGE = { min: 3, max: 12, step: 0.5};
// Kept in sync with the clamping in main.py / finally_gamescope_overlay.py's
// main(). At the default (50), today's look is exactly unchanged; 0 turns
// the glow off (same as the toggle), 100 doubles it.
const GLOW_INTENSITY_RANGE = { min: 0, max: 100, step: 10};
// How far the glow rings spread (badge halo, ping rings, pulse ring). Sent to
// the renderer as FINALLY_RING_SIZE. 50 is today's look; 0 hides the rings.
const RING_SIZE_RANGE = { min: 0, max: 100, step: 10};
const GRADIENT_DIRECTION_OPTIONS = [
    { data: "vertical", label: "Vertical (default)" },
    { data: "left_right", label: "Left to right" },
    { data: "right_left", label: "Right to left" },
    { data: "solid", label: "Solid color" },
];
// Rarity-tier cutoffs, in % of players who have the achievement. Kept in sync
// with the TIER_*_RANGE constants in main.py (which also keeps them ordered).
const TIER_CUTOFF_RANGES = {
    ultra: { min: 0.5, max: 5, step: 0.5 },
    rare: { min: 2, max: 25, step: 1 },
    uncommon: { min: 5, max: 60, step: 1 },
};
const SOUND_SLOT_OPTIONS = [
    { slot: "common", label: "Common sound", description: "Everyday unlocks (above the Uncommon cutoff)." },
    { slot: "uncommon", label: "Uncommon sound", description: "Needs Rarity Tiers on; otherwise common sounds play." },
    { slot: "rare", label: "Rare sound", description: "Rare unlocks." },
    { slot: "ultra_rare", label: "Ultra rare sound", description: "Needs Rarity Tiers on; otherwise the rare sound plays." },
    { slot: "completion", label: "Completionist sound", description: "The popup for unlocking every achievement in a game." },
];
const PERCENT_POSITION_OPTIONS = [
    { data: "bottom_right", label: "Bottom right (default)" },
    { data: "top_right", label: "Top right (descriptions can use 2 lines)" },
];
const COMPLETION_TITLE_OPTIONS = [
    { data: "completionist", label: "Completionist" },
    { data: "legendary", label: "Legendary Achievement unlocked" },
    { data: "crowned", label: "Crowned" },
];
// Size of the "4.7% of players" badge, as a % of its normal size. Kept in
// sync with PERCENT_SIZE_RANGE in main.py.
const PERCENT_SIZE_RANGE = { min: 70, max: 150, step: 5};
const PLACEHOLDER_ICON_OPTIONS = [
    { data: "auto", label: "Default (game icon, else badge)" },
    { data: "trophy", label: "Trophy" },
    { data: "game_icon", label: "Game icon" },
];
const OVERLAY_POSITION_OPTIONS = [
    { data: "top_left", label: "Top left" },
    { data: "top_center", label: "Top middle" },
    { data: "top_right", label: "Top right" },
    { data: "bottom_left", label: "Bottom left" },
    { data: "bottom_center", label: "Bottom middle" },
    { data: "bottom_right", label: "Bottom right" },
];
const OVERLAY_TEMPLATE_OPTIONS = [
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
    { data: "game_art", label: "Game Art Blur" },
];
const TRACKER_TEMPLATE_OPTIONS = [
    { data: "same", label: "Same as popups" },
    ...OVERLAY_TEMPLATE_OPTIONS,
];
// Modern Xbox-style defaults: a deep charcoal card tinted with Xbox green
// for normal unlocks, and gold for rare ones (matching the "rare
// achievement" treatment on the Xbox dashboard / Game Bar).
const DEFAULT_SETTINGS = {
    sound_common: DEFAULT_NORMAL_SOUND,
    sound_uncommon: DEFAULT_NORMAL_SOUND,
    sound_rare: DEFAULT_RARE_SOUND,
    sound_ultra_rare: DEFAULT_RARE_SOUND,
    sound_completion: DEFAULT_RARE_SOUND,
    overlay_size_percent: 50,
    volume_percent: 50,
    overlay_position: "bottom_center",
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
    rare_circle_color: "hsla(45, 95%, 58%, 1)",
};

const TRACKER_POSITION_OPTIONS = [
    { data: "top_left", label: "Top left" },
    { data: "top_right", label: "Top right" },
    { data: "bottom_left", label: "Bottom left" },
    { data: "bottom_right", label: "Bottom right" },
];
// Tracker overlay size, as a % of normal. Kept in sync with TRACKER_SIZE_RANGE in main.py.
const TRACKER_SIZE_RANGE = { min: 50, max: 150, step: 10};
const SORT_OPTIONS = [
    { data: "default", label: "Unlocked first" },
    { data: "rarity", label: "Rarity (rarest first)" },
    { data: "alpha", label: "Alphabetical" },
];
// Friendly copy for the error codes main.py's get_achievements() can return.
const ERROR_MESSAGES = {
    no_running_game: "No game is currently running.",
    steamworks_lib_missing: "Steam's achievement library wasn't found on this system.",
    helper_missing: "The probe script is missing -- try reinstalling the plugin.",
    spawn_failed: "Couldn't start the achievement probe.",
    probe_timeout: "Timed out talking to Steam. Try refreshing.",
    no_probe_output: "Steam didn't return any achievement data for this game.",
    bad_probe_output: "Got an unexpected response from Steam.",
    "No achievements exposed by this title": "This game doesn't have any Steam achievements.",
};
function friendlyError(code) {
    if (!code)
        return "Something went wrong.";
    return ERROR_MESSAGES[code] ?? code;
}

const ICON_RESOLUTION_LABELS = {
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
    unverified_icon_kept: "Couldn't confirm this icon is the colored one, and nothing better was found.",
};
function describeIconResolution(diagnostic) {
    const code = diagnostic.result.split(":")[0];
    return ICON_RESOLUTION_LABELS[code] ?? diagnostic.result;
}
const parseHsla = (value) => {
    const match = value.match(/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i);
    if (!match) {
        return { h: 35, s: 98, l: 38, a: 0.94 };
    }
    return {
        h: Number(match[1]),
        s: Number(match[2]),
        l: Number(match[3]),
        a: match[4] ? Number(match[4]) : 1,
    };
};
const toErrorMessage = (value) => {
    if (value instanceof Error) {
        return value.message;
    }
    return String(value);
};
const formatTimestamp = (value) => {
    if (!value) {
        return "never";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString();
};
// ---------------------------------------------------------------------------
// Achievements browser + tracker (merged in from the old standalone achievements plugin)
// ---------------------------------------------------------------------------
const ACH_REFRESH_INTERVAL_MS = 20000;
const TRACKER_REFRESH_INTERVAL_MS = 5000;
const VIEW_OPTIONS = [
    { data: "popup", label: "Popup" },
    { data: "style", label: "Colors & style" },
    { data: "sound", label: "Sound & tests" },
    { data: "achievements", label: "Achievements & tracker" },
    { data: "advanced", label: "Advanced" },
];
function formatUnlockTime(unixSeconds) {
    if (!unixSeconds)
        return "";
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function formatRarity(percent) {
    if (percent === null || percent === undefined)
        return "";
    if (percent < 0.1)
        return "<0.1% of players";
    return `${percent.toFixed(1)}% of players`;
}
// Case-insensitive search over name and description. Every word typed has to
// appear somewhere, so "boss fire" finds "Defeat the Fire Boss".
function filterAchievements(list, query) {
    const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 0);
    if (words.length === 0)
        return list;
    return list.filter((achievement) => {
        const haystack = `${achievement.name} ${achievement.description}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
    });
}
function sortAchievements(list, mode) {
    const copy = [...list];
    if (mode === "alpha") {
        copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (mode === "rarity") {
        copy.sort((a, b) => (a.global_percent ?? 101) - (b.global_percent ?? 101));
    }
    else {
        copy.sort((a, b) => {
            if (a.achieved !== b.achieved)
                return a.achieved ? -1 : 1;
            if (a.achieved)
                return b.unlock_time - a.unlock_time;
            return a.order - b.order;
        });
    }
    return copy;
}
function AchievementIcon({ achievement }) {
    const [failed, setFailed] = SP_REACT.useState(false);
    const showFallback = !achievement.icon || failed;
    return (SP_JSX.jsx("div", { style: {
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
            filter: achievement.achieved ? "none" : "grayscale(0.6)",
        }, children: showFallback ? (SP_JSX.jsx(FaTrophy, { size: 18, color: "rgba(255,255,255,0.5)" })) : (SP_JSX.jsx("img", { src: achievement.icon ?? undefined, alt: "", loading: "lazy", onError: () => setFailed(true), style: { width: "100%", height: "100%", objectFit: "cover" } })) }));
}
function AchievementRow({ achievement, isTracked, onToggleTrack, }) {
    // Green overlay on the row the cursor is on while you scroll the list.
    // Gamepad focus events drive it; plain focus/blur cover touch and mouse.
    const [focused, setFocused] = SP_REACT.useState(false);
    return (SP_JSX.jsxs(DFL.Focusable, { style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 2px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: focused
                ? "rgba(92, 195, 92, 0.30)"
                : isTracked
                    ? "rgba(92, 195, 92, 0.08)"
                    : "transparent",
            boxShadow: focused ? "inset 3px 0 0 #5cc35c" : "none",
            transition: "background 0.12s ease",
        }, onActivate: () => onToggleTrack(achievement), ...{
            onGamepadFocus: () => setFocused(true),
            onGamepadBlur: () => setFocused(false),
        }, onFocus: () => setFocused(true), onBlur: () => setFocused(false), children: [SP_JSX.jsx(AchievementIcon, { achievement: achievement }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: {
                            fontWeight: 600,
                            fontSize: 14,
                            color: achievement.achieved ? "#fff" : "rgba(255,255,255,0.75)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }, children: achievement.name }), achievement.description && (SP_JSX.jsx("div", { style: {
                            fontSize: 12,
                            color: "rgba(255,255,255,0.55)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }, children: achievement.description }))] }), SP_JSX.jsx("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "right", flexShrink: 0, maxWidth: 90 }, children: achievement.achieved ? formatUnlockTime(achievement.unlock_time) : formatRarity(achievement.global_percent) }), isTracked ? (SP_JSX.jsx(FaMapPin, { size: 14, color: "#5cc35c", style: { flexShrink: 0 } })) : (SP_JSX.jsx(FaRegCircle, { size: 11, color: "rgba(255,255,255,0.25)", style: { flexShrink: 0 } }))] }));
}
function ProgressSummary({ data }) {
    const total = data.total ?? data.achievements.length;
    const unlocked = data.unlocked_count ?? data.achievements.filter((a) => a.achieved).length;
    const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return (SP_JSX.jsxs("div", { style: { marginBottom: 8 }, children: [SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }, children: [SP_JSX.jsxs("span", { children: [unlocked, " / ", total, " unlocked"] }), SP_JSX.jsxs("span", { children: [percent, "%"] })] }), SP_JSX.jsx("div", { style: { height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }, children: SP_JSX.jsx("div", { style: {
                        height: "100%",
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, #5cc35c, #3a9d3a)",
                        transition: "width 0.3s ease",
                    } }) })] }));
}
function TrackerSummary({ tracked, onStop }) {
    const target = tracked.target;
    const state = tracked.state;
    if (!target)
        return null;
    let statusText = "Waiting for live data...";
    if (state) {
        if (state.achieved)
            statusText = "\u2713 Unlocked";
        else if (state.has_progress && state.max)
            statusText = `${state.current ?? 0} / ${state.max}`;
        else if (typeof state.percent === "number")
            statusText = formatRarity(state.percent);
        else
            statusText = "In progress";
    }
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [SP_JSX.jsx(FaMapPin, { color: "#5cc35c" }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: target.name }), SP_JSX.jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: statusText })] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: onStop, children: "Stop tracking" }) })] }));
}
function AchievementsView({ settings, updateSettings, busy, }) {
    const [game, setGame] = SP_REACT.useState(null);
    const [data, setData] = SP_REACT.useState(null);
    const [loading, setLoading] = SP_REACT.useState(true);
    const [sortMode, setSortMode] = SP_REACT.useState("default");
    const [query, setQuery] = SP_REACT.useState("");
    const [tracked, setTracked] = SP_REACT.useState({ tracked: false });
    const load = async () => {
        setLoading(true);
        try {
            const currentGame = await call("get_current_game");
            setGame(currentGame);
            const response = await call("get_achievements", currentGame.appid ?? undefined);
            setData(response);
        }
        catch (err) {
            setData({ ok: false, error: String(err), appid: null, name: null, achievements: [] });
        }
        finally {
            setLoading(false);
        }
    };
    const refreshTracked = async () => {
        try {
            setTracked(await call("get_tracked_achievement"));
        }
        catch {
            // Non-fatal -- the list still works without this.
        }
    };
    SP_REACT.useEffect(() => {
        void load();
        void refreshTracked();
        const dataInterval = setInterval(() => void load(), ACH_REFRESH_INTERVAL_MS);
        const trackerInterval = setInterval(() => void refreshTracked(), TRACKER_REFRESH_INTERVAL_MS);
        return () => {
            clearInterval(dataInterval);
            clearInterval(trackerInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleToggleTrack = async (achievement) => {
        const isCurrentlyTracked = tracked.target?.achievement_id === achievement.id;
        try {
            if (isCurrentlyTracked) {
                setTracked(await call("clear_tracked_achievement"));
            }
            else if (data?.appid) {
                setTracked(await call("set_tracked_achievement", data.appid, achievement.id, achievement.name, achievement.description, achievement.icon));
            }
        }
        catch {
            void refreshTracked();
        }
    };
    const handleStopTracking = async () => {
        try {
            setTracked(await call("clear_tracked_achievement"));
        }
        catch {
            void refreshTracked();
        }
    };
    const sorted = SP_REACT.useMemo(() => (data?.ok ? sortAchievements(filterAchievements(data.achievements, query), sortMode) : []), [data, sortMode, query]);
    const searching = query.trim().length > 0;
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Currently Playing", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 14, fontWeight: 600 }, children: game?.name ?? (game?.appid ? `App ${game.appid}` : "No game running") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: () => void load(), children: [SP_JSX.jsx(FaSyncAlt, { style: { marginRight: 6 } }), loading ? "Refreshing..." : "Refresh"] }) })] }), SP_JSX.jsx(DFL.PanelSection, { title: "Achievements", children: !data || (loading && !data.achievements.length) ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: "Loading achievements..." }) })) : !data.ok ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.7)" }, children: friendlyError(data.error) }) })) : data.achievements.length === 0 ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: "No achievements found for this game." }) })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(ProgressSummary, { data: data }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Search", description: "Type part of a name or description.", value: query, onChange: (event) => setQuery(event.target.value) }) }), searching && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setQuery(""), children: "Clear search" }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Sort by", rgOptions: SORT_OPTIONS, selectedOption: sortMode, onChange: (selection) => setSortMode(selection.data) }) }), searching && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: sorted.length === 0
                                    ? "No achievements match your search."
                                    : `Showing ${sorted.length} of ${data.achievements.length}` }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Focusable, { style: { maxHeight: 420, overflowY: "auto", width: "100%" }, "flow-children": "vertical", children: sorted.map((achievement) => (SP_JSX.jsx(AchievementRow, { achievement: achievement, isTracked: tracked.target?.achievement_id === achievement.id, onToggleTrack: handleToggleTrack }, achievement.id))) }) })] })) }), SP_JSX.jsxs(DFL.PanelSection, { title: "Achievement Tracker", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.6)" }, children: "Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked." }) }), tracked.tracked && tracked.target ? (SP_JSX.jsx(TrackerSummary, { tracked: tracked, onStop: handleStopTracking })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.6)" }, children: "Nothing pinned right now." }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Tracker position", rgOptions: TRACKER_POSITION_OPTIONS, selectedOption: settings.tracker_position, disabled: busy, onChange: (selection) => void updateSettings({ tracker_position: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Tracker template", description: "Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.", rgOptions: TRACKER_TEMPLATE_OPTIONS, selectedOption: settings.tracker_template, disabled: busy, onChange: (selection) => void updateSettings({ tracker_template: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Tracker size", value: settings.tracker_size_percent, min: TRACKER_SIZE_RANGE.min, max: TRACKER_SIZE_RANGE.max, step: TRACKER_SIZE_RANGE.step, notchCount: (TRACKER_SIZE_RANGE.max - TRACKER_SIZE_RANGE.min) / TRACKER_SIZE_RANGE.step + 1, showValue: true, valueSuffix: "%", disabled: busy, onChange: (value) => void updateSettings({ tracker_size_percent: value }) }) })] })] }));
}
function StatusPanel() {
    const [status, setStatus] = SP_REACT.useState(null);
    const [settings, setSettings] = SP_REACT.useState(DEFAULT_SETTINGS);
    const [sounds, setSounds] = SP_REACT.useState([]);
    const [soundFolder, setSoundFolder] = SP_REACT.useState("");
    const [statusError, setStatusError] = SP_REACT.useState(null);
    const [lastEvent, setLastEvent] = SP_REACT.useState(null);
    const [pendingAction, setPendingAction] = SP_REACT.useState(null);
    const [profileOverride, setProfileOverride] = SP_REACT.useState(null);
    const [view, setView] = SP_REACT.useState("popup");
    const [overlayCheck, setOverlayCheck] = SP_REACT.useState(null);
    const [apiKeyStatus, setApiKeyStatus] = SP_REACT.useState({
        configured: false,
        masked: null,
    });
    const [apiKeyInput, setApiKeyInput] = SP_REACT.useState("");
    const [apiKeyMessage, setApiKeyMessage] = SP_REACT.useState(null);
    const [apiKeyBusy, setApiKeyBusy] = SP_REACT.useState(false);
    const [iconDiagnostic, setIconDiagnostic] = SP_REACT.useState({
        result: "no_achievement_processed_yet",
    });
    const refreshIconDiagnostic = SP_REACT.useCallback(async () => {
        try {
            const next = await call("get_last_icon_resolution");
            setIconDiagnostic(next);
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    const refreshApiKeyStatus = SP_REACT.useCallback(async () => {
        try {
            const next = await call("get_steam_web_api_key_status");
            setApiKeyStatus(next);
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    const refreshStatus = SP_REACT.useCallback(async () => {
        try {
            const next = await call("get_status");
            setStatus(next);
            setProfileOverride(null);
            setSettings(next.settings ?? DEFAULT_SETTINGS);
            setStatusError(null);
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    const refreshSettings = SP_REACT.useCallback(async () => {
        try {
            const [nextSettings, nextSounds] = await Promise.all([
                call("get_settings"),
                call("get_sounds"),
            ]);
            setSettings(nextSettings);
            setSounds(nextSounds.sounds);
            setSoundFolder(nextSounds.folder);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: nextSettings }));
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    SP_REACT.useEffect(() => {
        const listener = addEventListener(EVENT_NAME, (payload) => {
            if (payload) {
                setLastEvent(payload);
            }
        });
        void refreshStatus();
        void refreshSettings();
        void refreshApiKeyStatus();
        void refreshIconDiagnostic();
        const interval = window.setInterval(() => {
            void refreshStatus();
            void refreshIconDiagnostic();
        }, 5000);
        return () => {
            window.clearInterval(interval);
            removeEventListener(EVENT_NAME, listener);
        };
    }, [refreshSettings, refreshStatus, refreshApiKeyStatus, refreshIconDiagnostic]);
    const gameProfile = profileOverride ??
        status?.game_profile ?? { available: false, name: "", enabled: false };
    const handleProfileToggle = SP_REACT.useCallback(async (enabled) => {
        setPendingAction("profile");
        try {
            const result = await call("set_game_profile_enabled", enabled);
            setSettings(result.settings);
            setProfileOverride(result.game_profile);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: result.settings }));
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
        finally {
            setPendingAction(null);
        }
    }, []);
    const handleOverlayCheck = SP_REACT.useCallback(async () => {
        setPendingAction("overlay_check");
        try {
            setOverlayCheck(await call("run_overlay_check"));
        }
        catch (error) {
            setOverlayCheck({
                ok: false,
                verdict: `The check itself failed: ${toErrorMessage(error)}`,
                checks: [],
                last_status: "",
                last_error: null,
            });
        }
        finally {
            setPendingAction(null);
        }
    }, []);
    const handleProfileReset = SP_REACT.useCallback(async () => {
        setPendingAction("profile");
        try {
            const result = await call("reset_game_profile");
            setSettings(result.settings);
            setProfileOverride(result.game_profile);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: result.settings }));
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
        finally {
            setPendingAction(null);
        }
    }, []);
    const handleSaveApiKey = SP_REACT.useCallback(async () => {
        setApiKeyBusy(true);
        setApiKeyMessage(null);
        try {
            const result = await call("set_steam_web_api_key", apiKeyInput);
            setApiKeyStatus({ configured: result.configured, masked: result.masked });
            if (result.ok) {
                setApiKeyInput("");
                setApiKeyMessage("Saved.");
            }
            else {
                setApiKeyMessage(result.error ?? "Couldn't save that key.");
            }
        }
        catch (error) {
            setApiKeyMessage(toErrorMessage(error));
        }
        finally {
            setApiKeyBusy(false);
        }
    }, [apiKeyInput]);
    const handleClearApiKey = SP_REACT.useCallback(async () => {
        setApiKeyBusy(true);
        setApiKeyMessage(null);
        try {
            const result = await call("clear_steam_web_api_key");
            setApiKeyStatus({ configured: result.configured, masked: result.masked });
            setApiKeyMessage("Removed.");
        }
        catch (error) {
            setApiKeyMessage(toErrorMessage(error));
        }
        finally {
            setApiKeyBusy(false);
        }
    }, []);
    const updateSettings = SP_REACT.useCallback(async (patch) => {
        setPendingAction("settings");
        try {
            const next = await call("set_settings", patch);
            setSettings(next);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
            await refreshStatus();
        }
        finally {
            setPendingAction(null);
        }
    }, [refreshStatus]);
    const openColorPicker = SP_REACT.useCallback((key, title) => {
        const color = parseHsla(settings[key]);
        let modal;
        modal = DFL.showModal(SP_JSX.jsx(DFL.ColorPickerModal, { closeModal: () => modal?.Close(), title: title, defaultH: color.h, defaultS: color.s, defaultL: color.l, defaultA: color.a, onConfirm: (nextColor) => {
                void updateSettings({ [key]: nextColor });
            } }));
    }, [settings, updateSettings]);
    const colorsLocked = settings.template_colors_enabled;
    const colorButton = (key, label) => (SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null || colorsLocked, onClick: () => openColorPicker(key, label), layout: "below", description: settings[key], children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [SP_JSX.jsx("span", { children: label }), SP_JSX.jsx("span", { style: {
                        width: "42px",
                        height: "18px",
                        borderRadius: "999px",
                        background: settings[key],
                        border: "1px solid rgba(255,255,255,0.5)",
                        display: "inline-block",
                    } })] }) }));
    const soundOptions = sounds.map((sound) => ({
        data: sound.name,
        label: sound.source === "user" ? `${sound.name} (yours)` : sound.name,
    }));
    const trigger = SP_REACT.useCallback(async (method) => {
        setPendingAction(method);
        try {
            await call(method);
            await refreshStatus();
        }
        finally {
            setPendingAction(null);
        }
    }, [refreshStatus]);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Finally Achievement Plugin", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Show", rgOptions: VIEW_OPTIONS, selectedOption: view, onChange: (selection) => setView(selection.data) }) }), view !== "achievements" && view !== "popup" && gameProfile.available && gameProfile.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "12px", opacity: 0.8 }, children: ["Editing settings for ", gameProfile.name, " only."] }) }))] }), view === "achievements" && (SP_JSX.jsx(AchievementsView, { settings: settings, updateSettings: updateSettings, busy: pendingAction !== null })), view === "popup" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Game Settings", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: gameProfile.available
                                        ? `Custom settings for ${gameProfile.name}`
                                        : "Custom settings for this game", description: gameProfile.available
                                        ? "When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved."
                                        : "Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.", checked: gameProfile.enabled, disabled: pendingAction !== null || !gameProfile.available, onChange: (value) => void handleProfileToggle(value) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: gameProfile.available && gameProfile.enabled
                                        ? `Editing settings for ${gameProfile.name} only.`
                                        : "Editing settings for all games." }) }), gameProfile.available && gameProfile.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: pendingAction !== null, onClick: () => void handleProfileReset(), children: "Reset this game to the global settings" }) }))] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Appearance", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Popup template", description: "The overall card design/style.", rgOptions: OVERLAY_TEMPLATE_OPTIONS, selectedOption: settings.overlay_template, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ overlay_template: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Popup position", description: "Where the banner appears on screen.", rgOptions: OVERLAY_POSITION_OPTIONS, selectedOption: settings.overlay_position, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ overlay_position: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Popup size", description: "0% hides the banner; 50% is the default size.", value: settings.overlay_size_percent, min: 0, max: 100, step: 5, notchCount: 21, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ overlay_size_percent: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Popup duration", description: "How long the toast stays on screen before it slides away.", value: settings.duration_seconds, min: DURATION_RANGE.min, max: DURATION_RANGE.max, step: DURATION_RANGE.step, notchCount: DURATION_RANGE.max - DURATION_RANGE.min + 1, showValue: true, valueSuffix: "s", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ duration_seconds: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Show unlock percentage", description: "Shows what percentage of players have the achievement, e.g. 4.7% of players.", checked: settings.show_percent, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ show_percent: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Percentage badge position", description: "Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.", rgOptions: PERCENT_POSITION_OPTIONS, selectedOption: settings.percent_position, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ percent_position: selection.data }) }) }), settings.show_percent && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Unlock percentage size", description: "Size of the small '4.7% of players' badge. 100% is the default.", value: settings.percent_size, min: PERCENT_SIZE_RANGE.min, max: PERCENT_SIZE_RANGE.max, step: PERCENT_SIZE_RANGE.step, notchCount: (PERCENT_SIZE_RANGE.max - PERCENT_SIZE_RANGE.min) / PERCENT_SIZE_RANGE.step + 1, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ percent_size: value }) }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Template effects", description: "Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.", checked: settings.template_fx_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ template_fx_enabled: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Completion popup at 100%", description: "When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.", checked: settings.completion_toast_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ completion_toast_enabled: value }) }) }), settings.completion_toast_enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Completion popup name", description: "The big text on the 100% completion popup.", rgOptions: COMPLETION_TITLE_OPTIONS, selectedOption: settings.completion_title, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ completion_title: selection.data }) }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Placeholder icon", description: "Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).", rgOptions: PLACEHOLDER_ICON_OPTIONS, selectedOption: settings.placeholder_icon, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ placeholder_icon: selection.data }) }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Rarity Tiers", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Rarity tiers", description: "Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.", checked: settings.rarity_tiers_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ rarity_tiers_enabled: value }) }) }), settings.rarity_tiers_enabled && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Ultra rare: this % or lower", value: settings.tier_ultra_cutoff, min: TIER_CUTOFF_RANGES.ultra.min, max: TIER_CUTOFF_RANGES.ultra.max, step: TIER_CUTOFF_RANGES.ultra.step, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ tier_ultra_cutoff: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Rare: this % or lower", value: settings.tier_rare_cutoff, min: TIER_CUTOFF_RANGES.rare.min, max: TIER_CUTOFF_RANGES.rare.max, step: TIER_CUTOFF_RANGES.rare.step, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ tier_rare_cutoff: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Uncommon: this % or lower", value: settings.tier_uncommon_cutoff, min: TIER_CUTOFF_RANGES.uncommon.min, max: TIER_CUTOFF_RANGES.uncommon.max, step: TIER_CUTOFF_RANGES.uncommon.step, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ tier_uncommon_cutoff: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: `Ultra rare ≤ ${settings.tier_ultra_cutoff}%, Rare ≤ ${settings.tier_rare_cutoff}%, Uncommon ≤ ${settings.tier_uncommon_cutoff}%, anything higher is common (no tier label). The cutoffs stay in order automatically.` }) })] }))] })] })), view === "style" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Colors", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Use each template's own colors", description: "The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.", checked: settings.template_colors_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ template_colors_enabled: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Gradient from icon colors", description: "Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).", checked: settings.icon_gradient_enabled, disabled: pendingAction !== null || colorsLocked, onChange: (value) => void updateSettings(value
                                        ? { icon_gradient_enabled: true, game_art_gradient_enabled: false }
                                        : { icon_gradient_enabled: false }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Gradient from game artwork colors", description: "Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.", checked: settings.game_art_gradient_enabled, disabled: pendingAction !== null || colorsLocked, onChange: (value) => void updateSettings(value
                                        ? { game_art_gradient_enabled: true, icon_gradient_enabled: false }
                                        : { game_art_gradient_enabled: false }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Gradient direction", description: "Direction of the card's background gradient, or a flat solid color.", rgOptions: GRADIENT_DIRECTION_OPTIONS, selectedOption: settings.gradient_direction, disabled: pendingAction !== null || colorsLocked, onChange: (selection) => void updateSettings({ gradient_direction: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                        height: "18px",
                                        borderRadius: "999px",
                                        background: `linear-gradient(90deg, ${settings.normal_gradient_start}, ${settings.normal_gradient_end})`,
                                        border: "1px solid rgba(255,255,255,0.35)",
                                        opacity: colorsLocked ? 0.35 : 1,
                                    } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("normal_gradient_start", "Normal gradient start") }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("normal_gradient_end", "Normal gradient end") }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                        height: "18px",
                                        borderRadius: "999px",
                                        background: `linear-gradient(90deg, ${settings.rare_gradient_start}, ${settings.rare_gradient_end})`,
                                        border: "1px solid rgba(255,255,255,0.35)",
                                        opacity: colorsLocked ? 0.35 : 1,
                                    } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("rare_gradient_start", "Rare gradient start") }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("rare_gradient_end", "Rare gradient end") }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("normal_circle_color", "Normal circle color") }), SP_JSX.jsx(DFL.PanelSectionRow, { children: colorButton("rare_circle_color", "Rare circle color") })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Glow", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Icon glow", description: "The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).", checked: settings.icon_glow_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ icon_glow_enabled: value }) }) }), settings.icon_glow_enabled && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Glow intensity", description: "50 is the default look; 0 is basically off, 100 doubles it.", value: settings.icon_glow_intensity, min: GLOW_INTENSITY_RANGE.min, max: GLOW_INTENSITY_RANGE.max, step: GLOW_INTENSITY_RANGE.step, notchCount: 11, showValue: true, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ icon_glow_intensity: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Ring size", description: "How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.", value: settings.ring_size, min: RING_SIZE_RANGE.min, max: RING_SIZE_RANGE.max, step: RING_SIZE_RANGE.step, notchCount: 11, showValue: true, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ ring_size: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Glow for normal achievements", description: "The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)", checked: settings.glow_normal_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ glow_normal_enabled: value }) }) })] })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Icon frame ring", description: "The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.", checked: settings.icon_frame_ring_enabled, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ icon_frame_ring_enabled: value }) }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Text", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Title font size", description: "Font size of the achievement name.", value: settings.title_font_size, min: FONT_SIZE_RANGES.title_font_size.min, max: FONT_SIZE_RANGES.title_font_size.max, step: 1, showValue: true, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ title_font_size: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Description font size", description: "Font size of the subtitle/description line.", value: settings.subtitle_font_size, min: FONT_SIZE_RANGES.subtitle_font_size.min, max: FONT_SIZE_RANGES.subtitle_font_size.max, step: 1, showValue: true, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ subtitle_font_size: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Label font size", description: "Font size of the small eyebrow label above the title.", value: settings.label_font_size, min: FONT_SIZE_RANGES.label_font_size.min, max: FONT_SIZE_RANGES.label_font_size.max, step: 1, showValue: true, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ label_font_size: value }) }) })] })] })), view === "sound" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Sound", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Volume", description: "50% is the default volume; 0% is silent.", value: settings.volume_percent, min: 0, max: 100, step: 10, notchCount: 11, showValue: true, valueSuffix: "%", disabled: pendingAction !== null, onChange: (value) => void updateSettings({ volume_percent: value }) }) }), SOUND_SLOT_OPTIONS.map(({ slot, label, description }) => {
                                const key = `sound_${slot}`;
                                return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: label, description: description, rgOptions: soundOptions, selectedOption: settings[key], disabled: pendingAction !== null || soundOptions.length === 0, onChange: (selection) => void updateSettings({ [key]: selection.data }) }) }, slot));
                            }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "12px", opacity: 0.8 }, children: ["Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in", " ", SP_JSX.jsx("b", { children: soundFolder || "the Finally Achievement Plugin settings folder, sounds" }), ", then press Refresh. They show up with \"(yours)\" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one."] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: pendingAction !== null, onClick: () => void refreshSettings(), children: "Refresh sound list" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Popup Tests", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Use the running game for tests", description: "While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.", checked: settings.test_with_game_data, disabled: pendingAction !== null, onChange: (value) => void updateSettings({ test_with_game_data: value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_common"), layout: "below", description: "A common unlock (above the Uncommon cutoff): no tier label.", children: "Test Common" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_uncommon"), layout: "below", description: "An uncommon unlock: tier label only.", children: "Test Uncommon" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_rare"), layout: "below", description: "A rare unlock: gold look, rare sound and glow.", children: "Test Rare" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_ultra_rare"), layout: "below", description: "An ultra rare unlock: extra sparkles and a longer shine.", children: "Test Ultra Rare" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_completion_popup"), layout: "below", description: "The special popup for unlocking every achievement in a game, using the running game's name.", children: "Test Completionist" }) })] })] })), view === "advanced" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Popup Not Showing?", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", opacity: 0.8 }, children: "If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing." }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: pendingAction !== null, onClick: () => void handleOverlayCheck(), children: pendingAction === "overlay_check" ? "Checking..." : "Run overlay check" }) }), overlayCheck && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "13px", fontWeight: 600, color: overlayCheck.ok ? "#5cc35c" : "#ff8a5c" }, children: overlayCheck.verdict }) }), overlayCheck.checks.map((check, index) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "12px", display: "flex", gap: 6 }, children: [SP_JSX.jsx("span", { style: { color: check.ok ? "#5cc35c" : check.fatal === false ? "#d8c25c" : "#ff8a5c", flexShrink: 0 }, children: check.ok ? "\u2713" : check.fatal === false ? "!" : "\u2717" }), SP_JSX.jsxs("span", { style: { opacity: 0.9 }, children: [SP_JSX.jsx("b", { children: check.name }), check.detail ? ` \u2014 ${check.detail}` : ""] })] }) }, `${check.name}-${index}`))), (overlayCheck.last_status || overlayCheck.last_error) && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "12px", opacity: 0.8 }, children: ["Last popup: ", overlayCheck.last_status || "none yet", overlayCheck.last_error ? ` \u2014 ${overlayCheck.last_error}` : ""] }) }))] }))] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Achievement Icon Accuracy", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }, children: "Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 13 }, children: apiKeyStatus.configured
                                        ? `Key saved (ending in ${apiKeyStatus.masked?.slice(-4) ?? "????"})`
                                        : "No API key set -- using the local cache only." }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Steam Web API key", value: apiKeyInput, onChange: (event) => setApiKeyInput(event.target.value), disabled: apiKeyBusy }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: apiKeyBusy || apiKeyInput.trim().length === 0, onClick: () => void handleSaveApiKey(), children: apiKeyBusy ? "Saving..." : "Save key" }) }), apiKeyStatus.configured && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: apiKeyBusy, onClick: () => void handleClearApiKey(), children: "Remove key" }) })), apiKeyMessage && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.7)" }, children: apiKeyMessage }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }, children: ["Last unlock's icon: ", describeIconResolution(iconDiagnostic), iconDiagnostic.achievement_id ? ` (${iconDiagnostic.achievement_id})` : ""] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => void refreshIconDiagnostic(), children: "Refresh" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Watcher Status", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void refreshStatus(), description: "Manually refresh backend status.", children: "Refresh Status" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsxs("div", { children: ["Log watcher: ", SP_JSX.jsx("strong", { children: status?.watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Cache watcher:", " ", SP_JSX.jsx("strong", { children: status?.librarycache_watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Watcher mode: ", status?.watcher_mode ?? "-"] }), SP_JSX.jsxs("div", { children: ["Inotify app: ", status?.last_inotify_event_appid ?? "-", " / latency:", " ", status?.last_queue_latency_ms ?? "-", "ms"] }), SP_JSX.jsxs("div", { children: ["Inotify events: ", status?.processed_inotify_events ?? 0, " / fallback scans:", " ", status?.fallback_scan_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Last inotify path: ", status?.last_inotify_event_path ?? "-"] }), SP_JSX.jsxs("div", { children: ["Parse retry: ", status?.last_parse_retry_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API:", " ", SP_JSX.jsx("strong", { children: status?.steam_api_enabled
                                                        ? status.steam_api_running
                                                            ? "running"
                                                            : "enabled"
                                                        : "disabled" })] }), SP_JSX.jsxs("div", { children: ["Steam API status: ", status?.steam_api_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API appids:", " ", status?.steam_api_last_appids?.length
                                                    ? status.steam_api_last_appids.join(", ")
                                                    : "-"] }), SP_JSX.jsxs("div", { children: ["Steam API error: ", status?.steam_api_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks:", " ", SP_JSX.jsx("strong", { children: status?.steamworks_running ? "running" : "idle" })] }), SP_JSX.jsxs("div", { children: ["Steamworks app: ", status?.steamworks_last_appid ?? "-", " / poll:", " ", status?.steamworks_poll_interval_ms ?? "-", "ms"] }), SP_JSX.jsx("div", { children: "Theme: XBOX Achievement" }), SP_JSX.jsxs("div", { children: ["Sounds: ", settings.sound_common, " / ", settings.sound_rare] }), SP_JSX.jsxs("div", { children: ["Size/volume: ", settings.overlay_size_percent, "% / ", settings.volume_percent, "%"] }), SP_JSX.jsxs("div", { children: ["Position: ", settings.overlay_position] }), SP_JSX.jsxs("div", { children: ["Template: ", settings.overlay_template] }), SP_JSX.jsxs("div", { children: ["Fonts: ", settings.label_font_size, " / ", settings.title_font_size, " /", " ", settings.subtitle_font_size] }), SP_JSX.jsxs("div", { children: ["Steamworks status: ", status?.steamworks_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks unlocks: ", status?.steamworks_unlock_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Steamworks error: ", status?.steamworks_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last match: ", formatTimestamp(status?.last_match_timestamp ?? null)] }), SP_JSX.jsxs("div", { children: ["Last source: ", status?.last_match_source ?? "-"] }), SP_JSX.jsxs("div", { children: ["Duplicate window: ", status?.duplicate_window_seconds ?? "?", "s"] }), SP_JSX.jsxs("div", { children: ["Log path: ", status?.log_path ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Cache files seen: ", status?.librarycache_files_seen ?? "?"] }), SP_JSX.jsxs("div", { children: ["Cache glob: ", status?.librarycache_glob ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Last scanned app: ", status?.last_scanned_appid ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache status: ", status?.last_cache_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache mtime:", " ", status?.last_cache_mtime
                                                    ? formatTimestamp(new Date(status.last_cache_mtime * 1000).toISOString())
                                                    : "-"] }), SP_JSX.jsxs("div", { children: ["New IDs:", " ", status?.last_new_unlock_ids?.length
                                                    ? status.last_new_unlock_ids.join(", ")
                                                    : "-"] }), SP_JSX.jsxs("div", { children: ["Parse note: ", status?.last_parse_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Sample: ", status?.last_match_sample ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last event:", " ", lastEvent
                                                    ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                                                    : "none"] }), statusError ? (SP_JSX.jsxs("div", { style: { color: "#ff8a80" }, children: ["Status error: ", statusError] })) : null] }) })] })] }))] }));
}
var index = definePlugin(() => {
    return {
        name: "Finally Achievement Plugin",
        icon: SP_JSX.jsx(FaSteam, {}),
        alwaysRender: true,
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Finally Achievement Plugin" }),
        content: SP_JSX.jsx(StatusPanel, {}),
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
