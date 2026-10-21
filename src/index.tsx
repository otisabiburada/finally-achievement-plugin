import {
  addEventListener,
  call,
  definePlugin,
  removeEventListener,
} from "@decky/api";
import {
  ButtonItem,
  DropdownItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  SliderField,
  TextField,
  ToggleField,
  ColorPickerModal,
  showModal,
  staticClasses,
} from "@decky/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HistoryView } from "./historyView";
import {
  LANGUAGE_OPTIONS,
  detectSteamLanguage,
  formatDecimal,
  languageFromSteam,
  setLanguage,
  t,
  tOpts,
  type LangCode,
  type LanguageSetting,
} from "./i18n";
import { FaMapPin, FaRegCircle, FaSteam, FaSyncAlt, FaTrophy } from "react-icons/fa";
import {
  DEFAULT_SETTINGS,
  EVENT_NAME,
  FONT_SIZE_RANGES,
  DURATION_RANGE,
  GLOW_INTENSITY_RANGE,
  GRADIENT_DIRECTION_OPTIONS,
  OVERLAY_POSITION_OPTIONS,
  OVERLAY_SCREEN_OPTIONS,
  PLACEHOLDER_ICON_OPTIONS,
  COMPLETION_TITLE_OPTIONS,
  SOUND_SLOT_OPTIONS,
  type SoundEntry,
  type SoundsResponse,
  type SoundSlot,
  PERCENT_SIZE_RANGE,
  PERCENT_POSITION_OPTIONS,
  type PercentPosition,
  TIER_CUTOFF_RANGES,
  RING_SIZE_RANGE,
  OVERLAY_TEMPLATE_OPTIONS,
  SETTINGS_EVENT,
  TRACKER_TEMPLATE_OPTIONS,
  type TrackerTemplate,
  type GradientDirection,
  type NotificationPayload,
  type OverlayPosition,
  type OverlayScreen,
  type OverlayTemplate,
  type PlaceholderIcon,
  type CompletionTitle,
  type FinallySettings,
  PREVIEW_TIER_OPTIONS,
  type PreviewTier,
  type ScreenshotResponse,
  type TemplatePreviewResponse,
} from "./finallyThemes";
import {
  type Achievement,
  type AchievementsResponse,
  type CurrentGame,
  type SortMode,
  type TrackedResponse,
  type TrackerPosition,
  SORT_OPTIONS,
  TRACKER_POSITION_OPTIONS,
  TRACKER_SIZE_RANGE,
  friendlyError,
} from "./achievementsTypes";

type LanguageInfo = {
  language: string;
  steam_language: string | null;
  fonts_folder: string;
  cjk_font: string | null;
  cjk_checked: boolean;
};

type ApiKeyStatus = {
  configured: boolean;
  masked: string | null;
};

type ApiKeySaveResult = ApiKeyStatus & {
  ok: boolean;
  error: string | null;
};

type IconResolutionDiagnostic = {
  appid?: number;
  achievement_id?: string;
  result: string;
};

const ICON_RESOLUTION_LABELS: Record<string, string> = {
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

function describeIconResolution(diagnostic: IconResolutionDiagnostic): string {
  const code = diagnostic.result.split(":")[0];
  const label = ICON_RESOLUTION_LABELS[code];
  return label ? t(label) : diagnostic.result;
}

type GameProfileInfo = {
  available: boolean;
  appid: number | null;
  name: string;
  enabled: boolean;
};

type GameProfileResult = {
  settings: FinallySettings;
  game_profile: GameProfileInfo;
};

type OverlayCheckItem = { name: string; ok: boolean; detail: string; fatal?: boolean };
type OverlayCheckResult = {
  ok: boolean;
  verdict: string;
  checks: OverlayCheckItem[];
  last_status: string;
  last_error: string | null;
};

type BackendStatus = {
  game_profile?: GameProfileInfo;
  watcher_running: boolean;
  librarycache_watcher_running: boolean;
  watcher_mode: string;
  last_inotify_event_path: string | null;
  last_inotify_event_appid: number | null;
  last_queue_latency_ms: number | null;
  processed_inotify_events: number;
  fallback_scan_count: number;
  last_parse_retry_error: string | null;
  steam_api_running: boolean;
  steam_api_enabled: boolean;
  steam_api_status: string | null;
  steam_api_last_error: string | null;
  steam_api_last_appids: number[];
  steamworks_running: boolean;
  steamworks_status: string | null;
  steamworks_last_error: string | null;
  steamworks_last_appid: number | null;
  steamworks_last_process_pid: number | null;
  steamworks_unlock_count: number;
  steamworks_poll_interval_ms: number;
  settings: FinallySettings;
  librarycache_files_seen: number;
  last_match_timestamp: string | null;
  last_match_sample: string | null;
  last_match_source: string | null;
  last_scanned_appid: number | null;
  last_cache_mtime: number | null;
  last_new_unlock_ids: string[];
  last_cache_status: string | null;
  last_parse_error: string | null;
  log_path: string;
  librarycache_glob: string;
  duplicate_window_seconds: number;
};

type DropdownSelection = {
  data: string;
};

type ColorSettingKey =
  | "normal_gradient_start"
  | "normal_gradient_end"
  | "rare_gradient_start"
  | "rare_gradient_end"
  | "normal_circle_color"
  | "rare_circle_color";

const parseHsla = (value: string) => {
  const match = value.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i,
  );
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

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }
  return String(value);
};

const formatTimestamp = (value: string | null): string => {
  if (!value) {
    return t("never");
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

type SortDropdownSelection = { data: SortMode };
type PositionDropdownSelection = { data: TrackerPosition };
type PanelView = "popup" | "style" | "sound" | "achievements" | "history" | "advanced";
type ViewDropdownSelection = { data: PanelView };

const VIEW_OPTIONS: { data: PanelView; label: string }[] = [
  { data: "popup", label: "Popup" },
  { data: "style", label: "Colors & style" },
  { data: "sound", label: "Sound & tests" },
  { data: "achievements", label: "Achievements & tracker" },
  { data: "history", label: "History & sharing" },
  { data: "advanced", label: "Advanced" },
];

function formatUnlockTime(unixSeconds: number): string {
  if (!unixSeconds) return "";
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatRarity(percent: number | null): string {
  if (percent === null || percent === undefined) return "";
  if (percent < 0.1) return t("<0.1% of players");
  return t("{percent}% of players", { percent: formatDecimal(percent.toFixed(1)) });
}

// Case-insensitive search over name and description. Every word typed has to
// appear somewhere, so "boss fire" finds "Defeat the Fire Boss".
function filterAchievements(list: Achievement[], query: string): Achievement[] {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return list;
  return list.filter((achievement) => {
    const haystack = `${achievement.name} ${achievement.description}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

function sortAchievements(list: Achievement[], mode: SortMode): Achievement[] {
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

function AchievementIcon({ achievement }: { achievement: Achievement }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !achievement.icon || failed;
  return (
    <div
      style={{
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
      }}
    >
      {showFallback ? (
        <FaTrophy size={18} color="rgba(255,255,255,0.5)" />
      ) : (
        <img
          src={achievement.icon ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

function AchievementRow({
  achievement,
  isTracked,
  onToggleTrack,
}: {
  achievement: Achievement;
  isTracked: boolean;
  onToggleTrack: (achievement: Achievement) => void;
}) {
  // Green overlay on the row the cursor is on while you scroll the list.
  // Gamepad focus events drive it; plain focus/blur cover touch and mouse.
  const [focused, setFocused] = useState(false);
  return (
    <Focusable
      style={{
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
      }}
      onActivate={() => onToggleTrack(achievement)}
      // Spread so the build can't fail if a Decky UI version types these
      // gamepad events differently; they are ignored if unsupported.
      {...({
        onGamepadFocus: () => setFocused(true),
        onGamepadBlur: () => setFocused(false),
      } as Record<string, unknown>)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <AchievementIcon achievement={achievement} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: achievement.achieved ? "#fff" : "rgba(255,255,255,0.75)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {achievement.name}
        </div>
        {achievement.description && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {achievement.description}
          </div>
        )}
      </div>
      <div
        style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "right", flexShrink: 0, maxWidth: 90 }}
      >
        {achievement.achieved ? formatUnlockTime(achievement.unlock_time) : formatRarity(achievement.global_percent)}
      </div>
      {isTracked ? (
        <FaMapPin size={14} color="#5cc35c" style={{ flexShrink: 0 }} />
      ) : (
        <FaRegCircle size={11} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
      )}
    </Focusable>
  );
}

function ProgressSummary({ data }: { data: AchievementsResponse }) {
  const total = data.total ?? data.achievements.length;
  const unlocked = data.unlocked_count ?? data.achievements.filter((a) => a.achieved).length;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>
          {t("{unlocked} / {total} unlocked", { unlocked, total })}
        </span>
        <span>{percent}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "linear-gradient(90deg, #5cc35c, #3a9d3a)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function TrackerSummary({ tracked, onStop }: { tracked: TrackedResponse; onStop: () => void }) {
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
  return (
    <>
      <PanelSectionRow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FaMapPin color="#5cc35c" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {target.name}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{statusText}</div>
          </div>
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onStop}>
          {t("Stop tracking")}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}

function AchievementsView({
  settings,
  updateSettings,
  busy,
}: {
  settings: FinallySettings;
  updateSettings: (patch: Partial<FinallySettings>) => Promise<void>;
  busy: boolean;
}) {
  const [game, setGame] = useState<CurrentGame | null>(null);
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [query, setQuery] = useState("");
  const [tracked, setTracked] = useState<TrackedResponse>({ tracked: false });

  const load = async () => {
    setLoading(true);
    try {
      const currentGame = await call<[], CurrentGame>("get_current_game");
      setGame(currentGame);
      const response = await call<[number | undefined], AchievementsResponse>(
        "get_achievements",
        currentGame.appid ?? undefined,
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
      setTracked(await call<[], TrackedResponse>("get_tracked_achievement"));
    } catch {
      // Non-fatal -- the list still works without this.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleTrack = async (achievement: Achievement) => {
    const isCurrentlyTracked = tracked.target?.achievement_id === achievement.id;
    try {
      if (isCurrentlyTracked) {
        setTracked(await call<[], TrackedResponse>("clear_tracked_achievement"));
      } else if (data?.appid) {
        setTracked(
          await call<[number, string, string, string, string | null], TrackedResponse>(
            "set_tracked_achievement",
            data.appid,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.icon,
          ),
        );
      }
    } catch {
      void refreshTracked();
    }
  };

  const handleStopTracking = async () => {
    try {
      setTracked(await call<[], TrackedResponse>("clear_tracked_achievement"));
    } catch {
      void refreshTracked();
    }
  };

  const sorted = useMemo(
    () => (data?.ok ? sortAchievements(filterAchievements(data.achievements, query), sortMode) : []),
    [data, sortMode, query],
  );
  const searching = query.trim().length > 0;

  return (
    <>
      <PanelSection title={t("Currently Playing")}>
        <PanelSectionRow>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {game?.name ?? (game?.appid ? t("App {id}", { id: game.appid }) : t("No game running"))}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => void load()}>
            <FaSyncAlt style={{ marginRight: 6 }} />
            {loading ? t("Refreshing...") : t("Refresh")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t("Achievements")}>
        {!data || (loading && !data.achievements.length) ? (
          <PanelSectionRow>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t("Loading achievements...")}</div>
          </PanelSectionRow>
        ) : !data.ok ? (
          <PanelSectionRow>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{friendlyError(data.error)}</div>
          </PanelSectionRow>
        ) : data.achievements.length === 0 ? (
          <PanelSectionRow>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t("No achievements found for this game.")}</div>
          </PanelSectionRow>
        ) : (
          <>
            <PanelSectionRow>
              <ProgressSummary data={data} />
            </PanelSectionRow>
            <PanelSectionRow>
              <TextField
                label={t("Search")}
                description={t("Type part of a name or description.")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </PanelSectionRow>
            {searching && (
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={() => setQuery("")}>
                  {t("Clear search")}
                </ButtonItem>
              </PanelSectionRow>
            )}
            <PanelSectionRow>
              <DropdownItem
                label={t("Sort by")}
                rgOptions={tOpts(SORT_OPTIONS)}
                selectedOption={sortMode}
                onChange={(selection: SortDropdownSelection) => setSortMode(selection.data)}
              />
            </PanelSectionRow>
            {searching && (
              <PanelSectionRow>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {sorted.length === 0
                    ? t("No achievements match your search.")
                    : t("Showing {shown} of {total}", { shown: sorted.length, total: data.achievements.length })}
                </div>
              </PanelSectionRow>
            )}
            <PanelSectionRow>
              <Focusable style={{ maxHeight: 420, overflowY: "auto", width: "100%" }} flow-children="vertical">
                {sorted.map((achievement) => (
                  <AchievementRow
                    key={achievement.id}
                    achievement={achievement}
                    isTracked={tracked.target?.achievement_id === achievement.id}
                    onToggleTrack={handleToggleTrack}
                  />
                ))}
              </Focusable>
            </PanelSectionRow>
          </>
        )}
      </PanelSection>

      <PanelSection title={t("Achievement Tracker")}>
        <PanelSectionRow>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            {t("Select an achievement above (press the action button on it) to pin it as a small on-screen tracker while you play. The tracker uses your toast template and colors, and slides away while a popup shows. Numeric progress only appears for achievements the game links to a trackable stat; others show locked or unlocked.")}
          </div>
        </PanelSectionRow>
        {tracked.tracked && tracked.target ? (
          <TrackerSummary tracked={tracked} onStop={handleStopTracking} />
        ) : (
          <PanelSectionRow>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t("Nothing pinned right now.")}</div>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <DropdownItem
            label={t("Tracker position")}
            rgOptions={tOpts(TRACKER_POSITION_OPTIONS)}
            selectedOption={settings.tracker_position}
            disabled={busy}
            onChange={(selection: PositionDropdownSelection) =>
              void updateSettings({ tracker_position: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Tracker template")}
            description={t("Which popup template the tracker is drawn with. Try Game Art Blur to put the game's artwork behind it.")}
            rgOptions={tOpts(TRACKER_TEMPLATE_OPTIONS)}
            selectedOption={settings.tracker_template}
            disabled={busy}
            onChange={(selection: { data: TrackerTemplate }) =>
              void updateSettings({ tracker_template: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t("Tracker size")}
            value={settings.tracker_size_percent}
            min={TRACKER_SIZE_RANGE.min}
            max={TRACKER_SIZE_RANGE.max}
            step={TRACKER_SIZE_RANGE.step}
            notchCount={(TRACKER_SIZE_RANGE.max - TRACKER_SIZE_RANGE.min) / TRACKER_SIZE_RANGE.step + 1}
            showValue
            valueSuffix="%"
            disabled={busy}
            onChange={(value) => void updateSettings({ tracker_size_percent: value })}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

function StatusPanel() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [settings, setSettings] = useState<FinallySettings>(DEFAULT_SETTINGS);
  const [sounds, setSounds] = useState<SoundEntry[]>([]);
  const [soundFolder, setSoundFolder] = useState<string>("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<NotificationPayload | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [profileOverride, setProfileOverride] = useState<GameProfileInfo | null>(null);
  const [view, setView] = useState<PanelView>("popup");
  const [previewTier, setPreviewTier] = useState<PreviewTier>("common");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [shotMessage, setShotMessage] = useState<string | null>(null);
  const [steamLang, setSteamLang] = useState<LangCode | null>(null);
  const [langInfo, setLangInfo] = useState<LanguageInfo | null>(null);
  const [overlayCheck, setOverlayCheck] = useState<OverlayCheckResult | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    configured: false,
    masked: null,
  });
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyMessage, setApiKeyMessage] = useState<string | null>(null);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);
  const [iconDiagnostic, setIconDiagnostic] = useState<IconResolutionDiagnostic>({
    result: "no_achievement_processed_yet",
  });

  const refreshIconDiagnostic = useCallback(async () => {
    try {
      const next = await call<[], IconResolutionDiagnostic>("get_last_icon_resolution");
      setIconDiagnostic(next);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);

  const refreshApiKeyStatus = useCallback(async () => {
    try {
      const next = await call<[], ApiKeyStatus>("get_steam_web_api_key_status");
      setApiKeyStatus(next);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await call<[], BackendStatus>("get_status");
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
        call<[], FinallySettings>("get_settings"),
        call<[], SoundsResponse>("get_sounds"),
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
    const listener = addEventListener<[NotificationPayload]>(
      EVENT_NAME,
      (payload) => {
        if (payload) {
          setLastEvent(payload);
        }
      },
    );

    void refreshStatus();
    void refreshSettings();
    void call<[], string>("get_steam_language")
      .then((code) => setSteamLang(languageFromSteam(code)))
      .catch(() => undefined);
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

  // The panel's language: your choice, or Steam's language when set to Auto.
  // Applied while rendering so every label below already uses it.
  const chosenLanguage: LangCode =
    settings.language === "auto"
      ? (detectSteamLanguage() ?? steamLang ?? "en")
      : (settings.language as LangCode);
  setLanguage(chosenLanguage);

  // Tell the backend which language Steam is using (the popups follow it on
  // Auto), and for Chinese check that a Chinese font exists for the popups.
  useEffect(() => {
    void call<[string], void>("set_detected_language", detectSteamLanguage() ?? "").catch(() => undefined);
  }, []);
  useEffect(() => {
    if (chosenLanguage !== "zh-Hans") {
      setLangInfo(null);
      return;
    }
    void call<[], LanguageInfo>("get_language_info")
      .then((info) => setLangInfo(info))
      .catch(() => undefined);
  }, [chosenLanguage, settings.language]);

  const gameProfile: GameProfileInfo = profileOverride ??
    status?.game_profile ?? { available: false, appid: null, name: "", enabled: false };

  const handleProfileToggle = useCallback(
    async (enabled: boolean) => {
      setPendingAction("profile");
      try {
        const result = await call<[boolean], GameProfileResult>(
          "set_game_profile_enabled",
          enabled,
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
    [],
  );

  const handleOverlayCheck = useCallback(async () => {
    setPendingAction("overlay_check");
    try {
      setOverlayCheck(await call<[], OverlayCheckResult>("run_overlay_check"));
    } catch (error) {
      setOverlayCheck({
        ok: false,
        verdict: t("The check itself failed: {error}", { error: toErrorMessage(error) }),
        checks: [],
        last_status: "",
        last_error: null,
      });
    } finally {
      setPendingAction(null);
    }
  }, []);

  const handleProfileReset = useCallback(async () => {
    setPendingAction("profile");
    try {
      const result = await call<[], GameProfileResult>("reset_game_profile");
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
      const result = await call<[string], ApiKeySaveResult>(
        "set_steam_web_api_key",
        apiKeyInput,
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
      const result = await call<[], ApiKeySaveResult>("clear_steam_web_api_key");
      setApiKeyStatus({ configured: result.configured, masked: result.masked });
      setApiKeyMessage(t("Removed."));
    } catch (error) {
      setApiKeyMessage(toErrorMessage(error));
    } finally {
      setApiKeyBusy(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<FinallySettings>) => {
      setPendingAction("settings");
      try {
        const next = await call<[Partial<FinallySettings>], FinallySettings>(
          "set_settings",
          patch,
        );
        setSettings(next);
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus],
  );

  const openColorPicker = useCallback(
    (key: ColorSettingKey, title: string) => {
      const color = parseHsla(settings[key]);
      let modal: { Close: () => void } | undefined;
      modal = showModal(
        <ColorPickerModal
          closeModal={() => modal?.Close()}
          title={title}
          defaultH={color.h}
          defaultS={color.s}
          defaultL={color.l}
          defaultA={color.a}
          onConfirm={(nextColor) => {
            void updateSettings({ [key]: nextColor } as Partial<FinallySettings>);
          }}
        />,
      );
    },
    [settings, updateSettings],
  );

  const colorsLocked = settings.template_colors_enabled;
  const colorButton = (key: ColorSettingKey, rawLabel: string) => {
    const label = t(rawLabel);
    return (
    <ButtonItem
      disabled={pendingAction !== null || colorsLocked}
      onClick={() => openColorPicker(key, label)}
      layout="below"
      description={settings[key]}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>{label}</span>
        <span
          style={{
            width: "42px",
            height: "18px",
            borderRadius: "999px",
            background: settings[key],
            border: "1px solid rgba(255,255,255,0.5)",
            display: "inline-block",
          }}
        />
      </div>
    </ButtonItem>
    );
  };

  const soundOptions = sounds.map((sound) => ({
    data: sound.name,
    label: sound.source === "user" ? `${sound.name} ${t("(yours)")}` : sound.name,
  }));

  // Live preview of the chosen template, drawn by the same renderer as the real popup. Redrawn (after a short
  // pause, so dragging a slider doesn't start a drawing per step) whenever a setting or the preview kind changes.
  const previewKey = JSON.stringify(settings);
  useEffect(() => {
    if (view !== "popup") return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await call<[string, string], TemplatePreviewResponse>(
          "get_template_preview",
          settings.overlay_template,
          previewTier,
        );
        if (cancelled) return;
        if (result.ok && result.image) {
          setPreviewImage(result.image);
          setPreviewError(null);
        } else {
          setPreviewError(result.error ?? "");
        }
      } catch (error) {
        if (!cancelled) setPreviewError(toErrorMessage(error));
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, previewTier, view]);

  const testScreenshot = useCallback(async () => {
    setPendingAction("screenshot");
    setShotMessage(null);
    try {
      const result = await call<[], ScreenshotResponse>("test_screenshot");
      setShotMessage(
        result.ok
          ? t("Saved to {path}", { path: result.path ?? "" })
          : t("Screenshot failed: {error}", { error: result.error ?? "" }),
      );
    } catch (error) {
      setShotMessage(t("Screenshot failed: {error}", { error: toErrorMessage(error) }));
    } finally {
      setPendingAction(null);
    }
  }, []);

  const trigger = useCallback(
    async (
      method:
        | "test_popup_common"
        | "test_popup_uncommon"
        | "test_popup_rare"
        | "test_popup_ultra_rare"
        | "test_completion_popup",
    ) => {
      setPendingAction(method);
      try {
        await call<[], void>(method);
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus],
  );

  return (
    <>
      <PanelSection title={t("Finally Achievement Plugin")}>
        <PanelSectionRow>
          <DropdownItem
            label={t("Show")}
            rgOptions={tOpts(VIEW_OPTIONS)}
            selectedOption={view}
            onChange={(selection: ViewDropdownSelection) => setView(selection.data)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Language")}
            rgOptions={tOpts(LANGUAGE_OPTIONS)}
            selectedOption={settings.language}
            disabled={pendingAction !== null}
            onChange={(selection: { data: LanguageSetting }) =>
              void updateSettings({ language: selection.data })
            }
          />
        </PanelSectionRow>
        {chosenLanguage === "zh-Hans" && langInfo && langInfo.cjk_checked && !langInfo.cjk_font && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {t("No Chinese font was found, so Chinese popup text may show as empty boxes. Copy a font file (.ttf, .otf or .ttc, for example Noto Sans SC) into {folder} and run a test popup.", { folder: langInfo.fonts_folder })}
            </div>
          </PanelSectionRow>
        )}
        {view !== "achievements" && view !== "popup" && view !== "history" && gameProfile.available && gameProfile.enabled && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {t("Editing settings for {name} only.", { name: gameProfile.name })}
            </div>
          </PanelSectionRow>
        )}
      </PanelSection>

      {view === "achievements" && (
        <AchievementsView
          settings={settings}
          updateSettings={updateSettings}
          busy={pendingAction !== null}
        />
      )}

      {view === "history" && (
        <HistoryView
          settings={settings}
          updateSettings={updateSettings}
          busy={pendingAction !== null}
        />
      )}

      {view === "popup" && (
        <>
      <PanelSection title={t("Game Settings")}>
        <PanelSectionRow>
          <ToggleField
            label={
              gameProfile.available
                ? t("Custom settings for {name}", { name: gameProfile.name })
                : t("Custom settings for this game")
            }
            description={
              gameProfile.available
                ? t("When on, every setting below applies only to this game and is saved for next time. It starts as a copy of your current settings. Turning it off keeps what you saved.")
                : t("Start a game, then open this panel to give it its own settings. Right now the settings below apply to all games.")
            }
            checked={gameProfile.enabled}
            disabled={pendingAction !== null || !gameProfile.available}
            onChange={(value) => void handleProfileToggle(value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {gameProfile.available && gameProfile.enabled
              ? t("Editing settings for {name} only.", { name: gameProfile.name })
              : t("Editing settings for all games.")}
          </div>
        </PanelSectionRow>
        {gameProfile.available && gameProfile.enabled && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={pendingAction !== null}
              onClick={() => void handleProfileReset()}
            >
              {t("Reset this game to the global settings")}
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>
      <PanelSection title={t("Appearance")}>
        <PanelSectionRow>
          <DropdownItem
            label={t("Popup template")}
            description={t("The overall card design/style.")}
            rgOptions={tOpts(OVERLAY_TEMPLATE_OPTIONS)}
            selectedOption={settings.overlay_template}
            disabled={pendingAction !== null}
            onChange={(selection: { data: OverlayTemplate }) =>
              void updateSettings({ overlay_template: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Preview as")}
            description={t("Shows the selected template below as a looping animation of the whole popup, drawn the same way as the real popup. The Test buttons further down still play it on screen.")}
            rgOptions={tOpts(PREVIEW_TIER_OPTIONS)}
            selectedOption={previewTier}
            onChange={(selection: { data: PreviewTier }) => setPreviewTier(selection.data)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {previewImage ? (
            <img
              src={previewImage}
              alt={t("Popup template preview")}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {previewError ? t("Preview unavailable: {error}", { error: previewError }) : t("Drawing preview...")}
            </div>
          )}
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Popup position")}
            description={t("Where the banner appears on screen.")}
            rgOptions={tOpts(OVERLAY_POSITION_OPTIONS)}
            selectedOption={settings.overlay_position}
            disabled={pendingAction !== null}
            onChange={(selection: { data: OverlayPosition }) =>
              void updateSettings({ overlay_position: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Popup screen size")}
            description={t("Auto is right on the Deck's own screen. On a TV, if popups land in the wrong place, pick the TV's resolution and check it with the frame test below.")}
            rgOptions={tOpts(OVERLAY_SCREEN_OPTIONS)}
            selectedOption={settings.overlay_screen}
            disabled={pendingAction !== null}
            onChange={(selection: { data: OverlayScreen }) =>
              void updateSettings({ overlay_screen: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={pendingAction !== null}
            onClick={() => void call<[string], void>("show_screen_frame", settings.overlay_screen)}
            description={t("Shows a red frame (yellow block = top left) for a few seconds. It should sit exactly on the screen edges. If not, pick another size above.")}
          >
            {t("Show screen frame")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t("Popup size")}
            description={t("0% hides the banner; 50% is the default size.")}
            value={settings.overlay_size_percent}
            min={0}
            max={100}
            step={5}
            notchCount={21}
            showValue
            valueSuffix="%"
            disabled={pendingAction !== null}
            onChange={(value) =>
              void updateSettings({ overlay_size_percent: value })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t("Popup duration")}
            description={t("How long the toast stays on screen before it slides away.")}
            value={settings.duration_seconds}
            min={DURATION_RANGE.min}
            max={DURATION_RANGE.max}
            step={DURATION_RANGE.step}
            notchCount={DURATION_RANGE.max - DURATION_RANGE.min + 1}
            showValue
            valueSuffix="s"
            disabled={pendingAction !== null}
            onChange={(value) =>
              void updateSettings({ duration_seconds: value })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("Show unlock percentage")}
            description={t("Shows what percentage of players have the achievement, e.g. 4.7% of players.")}
            checked={settings.show_percent}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ show_percent: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Percentage badge position")}
            description={t("Top right gives the description the full width, so short descriptions don't end in ... and long ones can use two lines.")}
            rgOptions={tOpts(PERCENT_POSITION_OPTIONS)}
            selectedOption={settings.percent_position}
            disabled={pendingAction !== null}
            onChange={(selection: { data: PercentPosition }) =>
              void updateSettings({ percent_position: selection.data })
            }
          />
        </PanelSectionRow>
        {settings.show_percent && (
          <PanelSectionRow>
            <SliderField
              label={t("Unlock percentage size")}
              description={t("Size of the small '4.7% of players' badge. 100% is the default.")}
              value={settings.percent_size}
              min={PERCENT_SIZE_RANGE.min}
              max={PERCENT_SIZE_RANGE.max}
              step={PERCENT_SIZE_RANGE.step}
              notchCount={(PERCENT_SIZE_RANGE.max - PERCENT_SIZE_RANGE.min) / PERCENT_SIZE_RANGE.step + 1}
              showValue
              valueSuffix="%"
              disabled={pendingAction !== null}
              onChange={(value) => void updateSettings({ percent_size: value })}
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ToggleField
            label={t("Template effects")}
            description={t("Extra touches on some templates: typing text, animated backgrounds, glitches, screws, a game-name header and more. Turn off for the plain look.")}
            checked={settings.template_fx_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ template_fx_enabled: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("Completion popup at 100%")}
            description={t("When you unlock the very last achievement in any game, shows a special emerald completion popup after that achievement's own popup.")}
            checked={settings.completion_toast_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ completion_toast_enabled: value })}
          />
        </PanelSectionRow>
        {settings.completion_toast_enabled && (
          <PanelSectionRow>
            <DropdownItem
              label={t("Completion popup name")}
              description={t("The big text on the 100% completion popup.")}
              rgOptions={tOpts(COMPLETION_TITLE_OPTIONS)}
              selectedOption={settings.completion_title}
              disabled={pendingAction !== null}
              onChange={(selection: { data: CompletionTitle }) =>
                void updateSettings({ completion_title: selection.data })
              }
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <DropdownItem
            label={t("Placeholder icon")}
            description={t("Shown when an achievement has no icon yet (and as the starting icon on Xbox 360 v2).")}
            rgOptions={tOpts(PLACEHOLDER_ICON_OPTIONS)}
            selectedOption={settings.placeholder_icon}
            disabled={pendingAction !== null}
            onChange={(selection: { data: PlaceholderIcon }) =>
              void updateSettings({ placeholder_icon: selection.data })
            }
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Rarity Tiers")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Rarity tiers")}
            description={t("Names each unlock by how few players have it (Uncommon, Rare, Ultra rare) in the popup label. Ultra rare also gets extra sparkles and a longer shine. Rare keeps the gold look and sound.")}
            checked={settings.rarity_tiers_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ rarity_tiers_enabled: value })}
          />
        </PanelSectionRow>
        {settings.rarity_tiers_enabled && (
          <>
            <PanelSectionRow>
              <SliderField
                label={t("Ultra rare: this % or lower")}
                value={settings.tier_ultra_cutoff}
                min={TIER_CUTOFF_RANGES.ultra.min}
                max={TIER_CUTOFF_RANGES.ultra.max}
                step={TIER_CUTOFF_RANGES.ultra.step}
                showValue
                valueSuffix="%"
                disabled={pendingAction !== null}
                onChange={(value) => void updateSettings({ tier_ultra_cutoff: value })}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <SliderField
                label={t("Rare: this % or lower")}
                value={settings.tier_rare_cutoff}
                min={TIER_CUTOFF_RANGES.rare.min}
                max={TIER_CUTOFF_RANGES.rare.max}
                step={TIER_CUTOFF_RANGES.rare.step}
                showValue
                valueSuffix="%"
                disabled={pendingAction !== null}
                onChange={(value) => void updateSettings({ tier_rare_cutoff: value })}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <SliderField
                label={t("Uncommon: this % or lower")}
                value={settings.tier_uncommon_cutoff}
                min={TIER_CUTOFF_RANGES.uncommon.min}
                max={TIER_CUTOFF_RANGES.uncommon.max}
                step={TIER_CUTOFF_RANGES.uncommon.step}
                showValue
                valueSuffix="%"
                disabled={pendingAction !== null}
                onChange={(value) => void updateSettings({ tier_uncommon_cutoff: value })}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                {t("Ultra rare ≤ {ultra}%, Rare ≤ {rare}%, Uncommon ≤ {uncommon}%, anything higher is common (no tier label). The cutoffs stay in order automatically.", { ultra: settings.tier_ultra_cutoff, rare: settings.tier_rare_cutoff, uncommon: settings.tier_uncommon_cutoff })}
              </div>
            </PanelSectionRow>
          </>
        )}
      </PanelSection>
        </>
      )}

      {view === "style" && (
        <>
      <PanelSection title={t("Colors")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Use each template's own colors")}
            description={t("The simple way: every template uses its own built-in palette (for example Xbox green, PlayStation blue, Steam blue). While this is on, all the color options below are greyed out and ignored.")}
            checked={settings.template_colors_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ template_colors_enabled: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("Gradient from icon colors")}
            description={t("Pull the card's background gradient from the achievement icon's own colors instead of the fixed colors below. Works on every template except Paper Light. Falls back to the fixed colors if the icon has no clear dominant colors (or no icon is available).")}
            checked={settings.icon_gradient_enabled}
            disabled={pendingAction !== null || colorsLocked}
            onChange={(value) =>
              void updateSettings(
                value
                  ? { icon_gradient_enabled: true, game_art_gradient_enabled: false }
                  : { icon_gradient_enabled: false },
              )
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("Gradient from game artwork colors")}
            description={t("Pull the gradient from the game's own artwork instead, so every toast in a game shares one palette. Turning this on turns off the icon option above (they're one or the other). Falls back to the icon's colors if the artwork can't be read.")}
            checked={settings.game_art_gradient_enabled}
            disabled={pendingAction !== null || colorsLocked}
            onChange={(value) =>
              void updateSettings(
                value
                  ? { game_art_gradient_enabled: true, icon_gradient_enabled: false }
                  : { game_art_gradient_enabled: false },
              )
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t("Gradient direction")}
            description={t("Direction of the card's background gradient, or a flat solid color.")}
            rgOptions={tOpts(GRADIENT_DIRECTION_OPTIONS)}
            selectedOption={settings.gradient_direction}
            disabled={pendingAction !== null || colorsLocked}
            onChange={(selection: { data: GradientDirection }) =>
              void updateSettings({ gradient_direction: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.normal_gradient_start}, ${settings.normal_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
              opacity: colorsLocked ? 0.35 : 1,
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("normal_gradient_start", "Normal gradient start")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("normal_gradient_end", "Normal gradient end")}
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.rare_gradient_start}, ${settings.rare_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
              opacity: colorsLocked ? 0.35 : 1,
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("rare_gradient_start", "Rare gradient start")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("rare_gradient_end", "Rare gradient end")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("normal_circle_color", "Normal circle color")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("rare_circle_color", "Rare circle color")}
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Glow")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Icon glow")}
            description={t("The soft glow around the icon, and the pulsing glow ring (rare achievements, or normal ones too if enabled below).")}
            checked={settings.icon_glow_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ icon_glow_enabled: value })}
          />
        </PanelSectionRow>
        {settings.icon_glow_enabled && (
          <>
            <PanelSectionRow>
              <SliderField
                label={t("Glow intensity")}
                description={t("50 is the default look; 0 is basically off, 100 doubles it.")}
                value={settings.icon_glow_intensity}
                min={GLOW_INTENSITY_RANGE.min}
                max={GLOW_INTENSITY_RANGE.max}
                step={GLOW_INTENSITY_RANGE.step}
                notchCount={11}
                showValue
                disabled={pendingAction !== null}
                onChange={(value) =>
                  void updateSettings({ icon_glow_intensity: value })
                }
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <SliderField
                label={t("Ring size")}
                description={t("How far the glow rings spread. 50 is the default look; 0 hides them, 100 doubles it.")}
                value={settings.ring_size}
                min={RING_SIZE_RANGE.min}
                max={RING_SIZE_RANGE.max}
                step={RING_SIZE_RANGE.step}
                notchCount={11}
                showValue
                disabled={pendingAction !== null}
                onChange={(value) => void updateSettings({ ring_size: value })}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <ToggleField
                label={t("Glow for normal achievements")}
                description={t("The pulsing glow ring normally only plays for rare unlocks -- turn this on to also play it for regular ones. (The rare corner ribbon and sparkles stay rare-only, since those specifically mean 'this one's rare'.)")}
                checked={settings.glow_normal_enabled}
                disabled={pendingAction !== null}
                onChange={(value) => void updateSettings({ glow_normal_enabled: value })}
              />
            </PanelSectionRow>
          </>
        )}
        <PanelSectionRow>
          <ToggleField
            label={t("Icon frame ring")}
            description={t("The colored ring framing the icon, separate from the glow above. With it off, the icon just sits on a plain dark backing.")}
            checked={settings.icon_frame_ring_enabled}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ icon_frame_ring_enabled: value })}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Text")}>
        <PanelSectionRow>
          <SliderField
            label={t("Title font size")}
            description={t("Font size of the achievement name.")}
            value={settings.title_font_size}
            min={FONT_SIZE_RANGES.title_font_size.min}
            max={FONT_SIZE_RANGES.title_font_size.max}
            step={1}
            showValue
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ title_font_size: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t("Description font size")}
            description={t("Font size of the subtitle/description line.")}
            value={settings.subtitle_font_size}
            min={FONT_SIZE_RANGES.subtitle_font_size.min}
            max={FONT_SIZE_RANGES.subtitle_font_size.max}
            step={1}
            showValue
            disabled={pendingAction !== null}
            onChange={(value) =>
              void updateSettings({ subtitle_font_size: value })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t("Label font size")}
            description={t("Font size of the small eyebrow label above the title.")}
            value={settings.label_font_size}
            min={FONT_SIZE_RANGES.label_font_size.min}
            max={FONT_SIZE_RANGES.label_font_size.max}
            step={1}
            showValue
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ label_font_size: value })}
          />
        </PanelSectionRow>
      </PanelSection>
        </>
      )}

      {view === "sound" && (
        <>
      <PanelSection title={t("Sound")}>
        <PanelSectionRow>
          <SliderField
            label={t("Volume")}
            description={t("50% is the default volume; 0% is silent.")}
            value={settings.volume_percent}
            min={0}
            max={100}
            step={10}
            notchCount={11}
            showValue
            valueSuffix="%"
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ volume_percent: value })}
          />
        </PanelSectionRow>
        {SOUND_SLOT_OPTIONS.map(({ slot, label, description }) => {
          const key = `sound_${slot}` as `sound_${SoundSlot}`;
          return (
            <PanelSectionRow key={slot}>
              <DropdownItem
                label={t(label)}
                description={t(description)}
                rgOptions={soundOptions}
                selectedOption={settings[key]}
                disabled={pendingAction !== null || soundOptions.length === 0}
                onChange={(selection: DropdownSelection) =>
                  void updateSettings({ [key]: selection.data } as Partial<FinallySettings>)
                }
              />
            </PanelSectionRow>
          );
        })}
        <PanelSectionRow>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {t("Your own sounds: put .wav, .flac, .ogg or .mp3 files (10 MB or less, kept short) in {folder}, then press Refresh. They show up with \"(yours)\" after their name, and updating the plugin never deletes them. Use the test buttons below to hear each one.", { folder: soundFolder || t("the Finally Achievement Plugin settings folder, sounds") })}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={pendingAction !== null}
            onClick={() => void refreshSettings()}
          >
            {t("Refresh sound list")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Screenshot")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Screenshot on unlock")}
            description={t("Saves a picture of the game each time you unlock an achievement, to Pictures/Finally Achievements/Screenshots.")}
            checked={settings.screenshot_on_unlock}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ screenshot_on_unlock: value })}
          />
        </PanelSectionRow>
        {settings.screenshot_on_unlock && (
          <PanelSectionRow>
            <ToggleField
              label={t("Include the popup")}
              description={t("Takes the picture a moment later, when the popup is on screen, so it shows in the picture. Off: the game only, at the moment of the unlock.")}
              checked={settings.screenshot_include_popup}
              disabled={pendingAction !== null}
              onChange={(value) => void updateSettings({ screenshot_include_popup: value })}
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={pendingAction !== null}
            onClick={() => void testScreenshot()}
            description={shotMessage ?? t("Takes one screenshot now, to check that saving works.")}
          >
            {t("Test screenshot")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Popup Tests")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Use the running game for tests")}
            description={t("While a game is running, tests show a random achievement from it (even a locked one) with its real icon and the game's artwork. Tests never count as unlocks. With no game running, or this off, tests use a sample.")}
            checked={settings.test_with_game_data}
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ test_with_game_data: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_common")}
            layout="below"
            description={t("A common unlock (above the Uncommon cutoff): no tier label.")}
          >
            {t("Test Common")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_uncommon")}
            layout="below"
            description={t("An uncommon unlock: tier label only.")}
          >
            {t("Test Uncommon")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_rare")}
            layout="below"
            description={t("A rare unlock: gold look, rare sound and glow.")}
          >
            {t("Test Rare")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_ultra_rare")}
            layout="below"
            description={t("An ultra rare unlock: extra sparkles and a longer shine.")}
          >
            {t("Test Ultra Rare")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_completion_popup")}
            layout="below"
            description={t("The special popup for unlocking every achievement in a game, using the running game's name.")}
          >
            {t("Test Completionist")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
        </>
      )}

      {view === "advanced" && (
        <>
      <PanelSection title={t("Popup Not Showing?")}>
        <PanelSectionRow>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {t("If you hear the sound but no popup appears (for example on a different handheld), run this check. It tests the Python packages, graphics libraries, display and window creation the popup needs, and tells you what's missing.")}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={pendingAction !== null}
            onClick={() => void handleOverlayCheck()}
          >
            {pendingAction === "overlay_check" ? t("Checking...") : t("Run overlay check")}
          </ButtonItem>
        </PanelSectionRow>
        {overlayCheck && (
          <>
            <PanelSectionRow>
              <div style={{ fontSize: "13px", fontWeight: 600, color: overlayCheck.ok ? "#5cc35c" : "#ff8a5c" }}>
                {overlayCheck.verdict}
              </div>
            </PanelSectionRow>
            {overlayCheck.checks.map((check, index) => (
              <PanelSectionRow key={`${check.name}-${index}`}>
                <div style={{ fontSize: "12px", display: "flex", gap: 6 }}>
                  <span style={{ color: check.ok ? "#5cc35c" : check.fatal === false ? "#d8c25c" : "#ff8a5c", flexShrink: 0 }}>
                    {check.ok ? "\u2713" : check.fatal === false ? "!" : "\u2717"}
                  </span>
                  <span style={{ opacity: 0.9 }}>
                    <b>{check.name}</b>
                    {check.detail ? ` \u2014 ${check.detail}` : ""}
                  </span>
                </div>
              </PanelSectionRow>
            ))}
            {(overlayCheck.last_status || overlayCheck.last_error) && (
              <PanelSectionRow>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  Last popup: {overlayCheck.last_status || "none yet"}
                  {overlayCheck.last_error ? ` \u2014 ${overlayCheck.last_error}` : ""}
                </div>
              </PanelSectionRow>
            )}
          </>
        )}
      </PanelSection>

      <PanelSection title={t("Achievement Icon Accuracy")}>
        <PanelSectionRow>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
            {t("Toast icons normally come from Steam's local cache, which can occasionally show the wrong (grayscale/locked) icon. Adding a free Steam Web API key makes Finally Achievement Plugin fetch the guaranteed-correct, full-color icon straight from Steam every time. Get one at steamcommunity.com/dev/apikey")}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: 13 }}>
            {apiKeyStatus.configured
              ? t("Key saved (ending in {tail})", { tail: apiKeyStatus.masked?.slice(-4) ?? "????" })
              : t("No API key set -- using the local cache only.")}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label={t("Steam Web API key")}
            value={apiKeyInput}
            onChange={(event) => setApiKeyInput(event.target.value)}
            disabled={apiKeyBusy}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={apiKeyBusy || apiKeyInput.trim().length === 0}
            onClick={() => void handleSaveApiKey()}
          >
            {apiKeyBusy ? t("Saving...") : t("Save key")}
          </ButtonItem>
        </PanelSectionRow>
        {apiKeyStatus.configured && (
          <PanelSectionRow>
            <ButtonItem layout="below" disabled={apiKeyBusy} onClick={() => void handleClearApiKey()}>
              {t("Remove key")}
            </ButtonItem>
          </PanelSectionRow>
        )}
        {apiKeyMessage && (
          <PanelSectionRow>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{apiKeyMessage}</div>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            {t("Last unlock's icon:")} {describeIconResolution(iconDiagnostic)}
            {iconDiagnostic.achievement_id ? ` (${iconDiagnostic.achievement_id})` : ""}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => void refreshIconDiagnostic()}>
            {t("Refresh")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("Watcher Status")}>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void refreshStatus()}
            description={t("Manually refresh backend status.")}
          >
            Refresh Status
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div>
            <div>
              Log watcher: <strong>{status?.watcher_running ? "yes" : "no"}</strong>
            </div>
            <div>
              Cache watcher:{" "}
              <strong>{status?.librarycache_watcher_running ? "yes" : "no"}</strong>
            </div>
            <div>Watcher mode: {status?.watcher_mode ?? "-"}</div>
            <div>
              Inotify app: {status?.last_inotify_event_appid ?? "-"} / latency:{" "}
              {status?.last_queue_latency_ms ?? "-"}ms
            </div>
            <div>
              Inotify events: {status?.processed_inotify_events ?? 0} / fallback scans:{" "}
              {status?.fallback_scan_count ?? 0}
            </div>
            <div>Last inotify path: {status?.last_inotify_event_path ?? "-"}</div>
            <div>Parse retry: {status?.last_parse_retry_error ?? "-"}</div>
            <div>
              Steam API:{" "}
              <strong>
                {status?.steam_api_enabled
                  ? status.steam_api_running
                    ? "running"
                    : "enabled"
                  : "disabled"}
              </strong>
            </div>
            <div>Steam API status: {status?.steam_api_status ?? "-"}</div>
            <div>
              Steam API appids:{" "}
              {status?.steam_api_last_appids?.length
                ? status.steam_api_last_appids.join(", ")
                : "-"}
            </div>
            <div>Steam API error: {status?.steam_api_last_error ?? "-"}</div>
            <div>
              Steamworks:{" "}
              <strong>{status?.steamworks_running ? "running" : "idle"}</strong>
            </div>
            <div>
              Steamworks app: {status?.steamworks_last_appid ?? "-"} / poll:{" "}
              {status?.steamworks_poll_interval_ms ?? "-"}ms
            </div>
            <div>Theme: XBOX Achievement</div>
            <div>
              Sounds: {settings.sound_common} / {settings.sound_rare}
            </div>
            <div>
              Size/volume: {settings.overlay_size_percent}% / {settings.volume_percent}%
            </div>
            <div>Position: {settings.overlay_position}</div>
            <div>Template: {settings.overlay_template}</div>
            <div>
              Fonts: {settings.label_font_size} / {settings.title_font_size} /{" "}
              {settings.subtitle_font_size}
            </div>
            <div>Steamworks status: {status?.steamworks_status ?? "-"}</div>
            <div>Steamworks unlocks: {status?.steamworks_unlock_count ?? 0}</div>
            <div>Steamworks error: {status?.steamworks_last_error ?? "-"}</div>
            <div>Last match: {formatTimestamp(status?.last_match_timestamp ?? null)}</div>
            <div>Last source: {status?.last_match_source ?? "-"}</div>
            <div>
              Duplicate window: {status?.duplicate_window_seconds ?? "?"}s
            </div>
            <div>Log path: {status?.log_path ?? "unknown"}</div>
            <div>Cache files seen: {status?.librarycache_files_seen ?? "?"}</div>
            <div>Cache glob: {status?.librarycache_glob ?? "unknown"}</div>
            <div>Last scanned app: {status?.last_scanned_appid ?? "-"}</div>
            <div>Cache status: {status?.last_cache_status ?? "-"}</div>
            <div>
              Cache mtime:{" "}
              {status?.last_cache_mtime
                ? formatTimestamp(new Date(status.last_cache_mtime * 1000).toISOString())
                : "-"}
            </div>
            <div>
              New IDs:{" "}
              {status?.last_new_unlock_ids?.length
                ? status.last_new_unlock_ids.join(", ")
                : "-"}
            </div>
            <div>Parse note: {status?.last_parse_error ?? "-"}</div>
            <div>Sample: {status?.last_match_sample ?? "-"}</div>
            <div>
              Last event:{" "}
              {lastEvent
                ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                : "none"}
            </div>
            {statusError ? (
              <div style={{ color: "#ff8a80" }}>Status error: {statusError}</div>
            ) : null}
          </div>
        </PanelSectionRow>
      </PanelSection>
        </>
      )}
    </>
  );
}

// Tell the backend how big the screen Steam's UI is drawn on really is. On a
// TV the X display the popup helper sees can be a different size (for example
// 1280x800 while the TV shows 1920x1080), which put the popups in the wrong spot.
function startScreenReporter(): () => void {
  let last = "";
  const report = () => {
    try {
      const w = Math.round(window.screen?.width || 0);
      const h = Math.round(window.screen?.height || 0);
      const key = `${w}x${h}`;
      if (w < 640 || h < 400 || key === last) return;
      last = key;
      void call<[number, number], void>("set_ui_screen", w, h).catch(() => { last = ""; });
    } catch {
      /* best effort */
    }
  };
  report();
  const timer = window.setInterval(report, 5000);
  return () => window.clearInterval(timer);
}

export default definePlugin(() => {
  const stopScreenReporter = startScreenReporter();
  return {
    onDismount() {
      stopScreenReporter();
    },
    name: "Finally Achievement Plugin",
    icon: <FaSteam />,
    alwaysRender: true,
    // One short line: the full plugin name wrapped onto three lines and the taller header covered the "Show" row.
    titleView: (
      <div
        className={staticClasses.Title}
        title="Finally Achievement Plugin"
        style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        Finally Achievements
      </div>
    ),
    content: <StatusPanel />,
  };
});
