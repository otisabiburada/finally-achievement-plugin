export type TrackerTarget = {
  appid: number;
  achievement_id: string;
  name: string;
  description: string;
  icon: string | null;
  icon_path?: string | null;
};

export type TrackerState = {
  achieved: boolean;
  percent: number | null;
  has_progress: boolean;
  current: number | null;
  max: number | null;
  updated_at: number;
};

export type TrackedResponse = {
  tracked: boolean;
  target?: TrackerTarget;
  state?: TrackerState | null;
};

export type TrackerPosition = "top_left" | "top_right" | "bottom_left" | "bottom_right";

export const TRACKER_POSITION_OPTIONS: { data: TrackerPosition; label: string }[] = [
  { data: "top_left", label: "Top left" },
  { data: "top_right", label: "Top right" },
  { data: "bottom_left", label: "Bottom left" },
  { data: "bottom_right", label: "Bottom right" },
];

// Tracker overlay size, as a % of normal. Kept in sync with TRACKER_SIZE_RANGE in main.py.
export const TRACKER_SIZE_RANGE = { min: 50, max: 150, step: 10, default: 100 } as const;

export type Achievement = {
  id: string;
  order: number;
  name: string;
  description: string;
  hidden: boolean;
  achieved: boolean;
  unlock_time: number;
  global_percent: number | null;
  icon: string | null;
};

export type AchievementsResponse = {
  ok: boolean;
  error: string | null;
  appid: number | null;
  name: string | null;
  total?: number;
  unlocked_count?: number;
  achievements: Achievement[];
};

export type CurrentGame = {
  appid: number | null;
  name: string | null;
};

export type SortMode = "default" | "rarity" | "alpha";

export const SORT_OPTIONS: { data: SortMode; label: string }[] = [
  { data: "default", label: "Unlocked first" },
  { data: "rarity", label: "Rarity (rarest first)" },
  { data: "alpha", label: "Alphabetical" },
];

// Friendly copy for the error codes main.py's get_achievements() can return.
export const ERROR_MESSAGES: Record<string, string> = {
  no_running_game: "No game is currently running.",
  steamworks_lib_missing: "Steam's achievement library wasn't found on this system.",
  helper_missing: "The probe script is missing -- try reinstalling the plugin.",
  spawn_failed: "Couldn't start the achievement probe.",
  probe_timeout: "Timed out talking to Steam. Try refreshing.",
  no_probe_output: "Steam didn't return any achievement data for this game.",
  bad_probe_output: "Got an unexpected response from Steam.",
  "No achievements exposed by this title": "This game doesn't have any Steam achievements.",
};

export function friendlyError(code: string | null): string {
  if (!code) return "Something went wrong.";
  return ERROR_MESSAGES[code] ?? code;
}
