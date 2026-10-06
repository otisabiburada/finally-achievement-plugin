import type { TrackerPosition } from "./achievementsTypes";
export const PLUGIN_NAME = "Finally Achievement Plugin";
export const EVENT_NAME = "finally_show";
export const SETTINGS_EVENT = "finally_settings_changed";
export const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
export const DEFAULT_RARE_SOUND = "rare_preroll.wav";

export type FinallySettings = {
  sound_common: string;
  sound_uncommon: string;
  sound_rare: string;
  sound_ultra_rare: string;
  sound_completion: string;
  overlay_size_percent: number;
  volume_percent: number;
  overlay_position: OverlayPosition;
  overlay_template: OverlayTemplate;
  label_font_size: number;
  title_font_size: number;
  subtitle_font_size: number;
  duration_seconds: number;
  icon_glow_enabled: boolean;
  icon_glow_intensity: number;
  ring_size: number;
  gradient_direction: GradientDirection;
  glow_normal_enabled: boolean;
  icon_frame_ring_enabled: boolean;
  icon_gradient_enabled: boolean;
  show_percent: boolean;
  placeholder_icon: PlaceholderIcon;
  game_art_gradient_enabled: boolean;
  completion_toast_enabled: boolean;
  completion_title: CompletionTitle;
  percent_size: number;
  percent_position: PercentPosition;
  rarity_tiers_enabled: boolean;
  test_with_game_data: boolean;
  template_fx_enabled: boolean;
  template_colors_enabled: boolean;
  tracker_position: TrackerPosition;
  tracker_size_percent: number;
  tracker_template: TrackerTemplate;
  tier_uncommon_cutoff: number;
  tier_rare_cutoff: number;
  tier_ultra_cutoff: number;
  rarity_enabled: boolean;
  normal_gradient_start: string;
  normal_gradient_end: string;
  rare_gradient_start: string;
  rare_gradient_end: string;
  normal_circle_color: string;
  rare_circle_color: string;
};

// Kept in sync with FONT_SIZE_RANGES in main.py / the clamping in
// finally_gamescope_overlay.py's main().
export const FONT_SIZE_RANGES = {
  label_font_size: { min: 9, max: 18, default: 13 },
  title_font_size: { min: 18, max: 34, default: 26 },
  subtitle_font_size: { min: 12, max: 22, default: 18 },
} as const;

// Kept in sync with DURATION_RANGE in main.py and the FINALLY_SECONDS default
// in finally_gamescope_overlay.py. Value is seconds the toast stays on screen.
export const DURATION_RANGE = { min: 3, max: 12, step: 0.5, default: 5.8 } as const;

// Kept in sync with the clamping in main.py / finally_gamescope_overlay.py's
// main(). At the default (50), today's look is exactly unchanged; 0 turns
// the glow off (same as the toggle), 100 doubles it.
export const GLOW_INTENSITY_RANGE = { min: 0, max: 100, step: 10, default: 50 } as const;

// How far the glow rings spread (badge halo, ping rings, pulse ring). Sent to
// the renderer as FINALLY_RING_SIZE. 50 is today's look; 0 hides the rings.
export const RING_SIZE_RANGE = { min: 0, max: 100, step: 10, default: 50 } as const;

export type GradientDirection = "vertical" | "left_right" | "right_left" | "solid";

export const GRADIENT_DIRECTION_OPTIONS: { data: GradientDirection; label: string }[] = [
  { data: "vertical", label: "Vertical (default)" },
  { data: "left_right", label: "Left to right" },
  { data: "right_left", label: "Right to left" },
  { data: "solid", label: "Solid color" },
];

// Rarity-tier cutoffs, in % of players who have the achievement. Kept in sync
// with the TIER_*_RANGE constants in main.py (which also keeps them ordered).
export const TIER_CUTOFF_RANGES = {
  ultra: { min: 0.5, max: 5, step: 0.5 },
  rare: { min: 2, max: 25, step: 1 },
  uncommon: { min: 5, max: 60, step: 1 },
} as const;

// One sound per popup type. "completion" is the 100%-complete popup.
export type SoundSlot = "common" | "uncommon" | "rare" | "ultra_rare" | "completion";

export const SOUND_SLOT_OPTIONS: { slot: SoundSlot; label: string; description: string }[] = [
  { slot: "common", label: "Common sound", description: "Everyday unlocks (above the Uncommon cutoff)." },
  { slot: "uncommon", label: "Uncommon sound", description: "Needs Rarity Tiers on; otherwise common sounds play." },
  { slot: "rare", label: "Rare sound", description: "Rare unlocks." },
  { slot: "ultra_rare", label: "Ultra rare sound", description: "Needs Rarity Tiers on; otherwise the rare sound plays." },
  { slot: "completion", label: "Completionist sound", description: "The popup for unlocking every achievement in a game." },
];

export type SoundEntry = { name: string; source: "builtin" | "user" };
export type SoundsResponse = { folder: string; extensions: string[]; sounds: SoundEntry[] };

// Where the "4.7% of players" badge sits. Top right frees the description line, so
// descriptions can use the full width and wrap onto two lines.
export type PercentPosition = "bottom_right" | "top_right";

export const PERCENT_POSITION_OPTIONS: { data: PercentPosition; label: string }[] = [
  { data: "bottom_right", label: "Bottom right (default)" },
  { data: "top_right", label: "Top right (descriptions can use 2 lines)" },
];

export type CompletionTitle = "completionist" | "legendary" | "crowned";

export const COMPLETION_TITLE_OPTIONS: { data: CompletionTitle; label: string }[] = [
  { data: "completionist", label: "Completionist" },
  { data: "legendary", label: "Legendary Achievement unlocked" },
  { data: "crowned", label: "Crowned" },
];

// Size of the "4.7% of players" badge, as a % of its normal size. Kept in
// sync with PERCENT_SIZE_RANGE in main.py.
export const PERCENT_SIZE_RANGE = { min: 70, max: 150, step: 5, default: 100 } as const;

export type PlaceholderIcon = "auto" | "trophy" | "game_icon";

export const PLACEHOLDER_ICON_OPTIONS: { data: PlaceholderIcon; label: string }[] = [
  { data: "auto", label: "Default (game icon, else badge)" },
  { data: "trophy", label: "Trophy" },
  { data: "game_icon", label: "Game icon" },
];

export type OverlayPosition =
  | "top_left"
  | "top_center"
  | "top_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";

export const OVERLAY_POSITION_OPTIONS: { data: OverlayPosition; label: string }[] = [
  { data: "top_left", label: "Top left" },
  { data: "top_center", label: "Top middle" },
  { data: "top_right", label: "Top right" },
  { data: "bottom_left", label: "Bottom left" },
  { data: "bottom_center", label: "Bottom middle" },
  { data: "bottom_right", label: "Bottom right" },
];

export type OverlayTemplate =
  | "xbox_modern"
  | "playstation_trophy"
  | "switch_bold"
  | "steam_flat"
  | "material_minimal"
  | "retro_arcade"
  | "chat_toast"
  | "cyber_glass"
  | "xbox_360_classic"
  | "xbox_360_v2"
  | "xbox_360_v2_square"
  | "win11_glass"
  | "discord_bar"
  | "vaporwave"
  | "light_card"
  | "wood_plaque"
  | "terminal_hacker"
  | "game_art";

export const OVERLAY_TEMPLATE_OPTIONS: { data: OverlayTemplate; label: string }[] = [
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

// The tracker follows the popup template ("same") unless given its own.
export type TrackerTemplate = "same" | OverlayTemplate;

export const TRACKER_TEMPLATE_OPTIONS: { data: TrackerTemplate; label: string }[] = [
  { data: "same", label: "Same as popups" },
  ...OVERLAY_TEMPLATE_OPTIONS,
];

export type NotificationPayload = {
  title: string;
  subtitle: string;
  is_rare: boolean;
  timestamp: string;
  appid?: number | null;
  achievement_id?: string | null;
  icon_url?: string | null;
  icon_path?: string | null;
};

// Modern Xbox-style defaults: a deep charcoal card tinted with Xbox green
// for normal unlocks, and gold for rare ones (matching the "rare
// achievement" treatment on the Xbox dashboard / Game Bar).
export const DEFAULT_SETTINGS: FinallySettings = {
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
