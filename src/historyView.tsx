import { addEventListener, call, removeEventListener } from "@decky/api";
import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { EVENT_NAME, type FinallySettings } from "./finallyThemes";
import { formatDecimal, getLanguage, t } from "./i18n";
import { renderShareCard } from "./shareCard";

type HistoryEntry = {
  ts: string;
  appid: number;
  game: string;
  id: string;
  title: string;
  subtitle: string;
  percent: number | null;
  tier: string | null;
  rare: boolean;
};

type ShareResult = { ok: boolean; path?: string; error?: string };

const PAGE = 10;
const NEAR_RANGE = { min: 1, max: 5 };

function locale(): string {
  return getLanguage() || "en";
}

function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.round((then - Date.now()) / 1000);
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

function rarityText(percent: number | null): string {
  if (typeof percent !== "number") return "";
  if (percent < 0.1) return t("<0.1% of players");
  return t("{percent}% of players", { percent: formatDecimal(percent.toFixed(1)) });
}

export function HistoryView({
  settings,
  updateSettings,
  busy,
}: {
  settings: FinallySettings;
  updateSettings: (patch: Partial<FinallySettings>) => Promise<void> | void;
  busy: boolean;
}) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [working, setWorking] = useState<string | null>(null);
  const [card, setCard] = useState<{ url: string; path: string | null; error: string | null } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEntries(await call<[number], HistoryEntry[]>("get_history", 100));
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

  const makeCard = useCallback(async (entry: HistoryEntry) => {
    const key = `${entry.appid}:${entry.id}:${entry.ts}`;
    setWorking(key);
    setCard(null);
    try {
      const assets = await call<[number, string, string], { icon: string | null; art: string | null }>(
        "get_share_assets",
        entry.appid,
        entry.id,
        entry.ts,
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
        art: assets?.art ?? null,
      });
      const saved = await call<[string, string], ShareResult>(
        "save_share_card",
        url,
        `${entry.game}-${entry.title}`,
      );
      setCard({ url, path: saved?.ok ? saved.path ?? null : null, error: saved?.ok ? null : saved?.error ?? "error" });
    } catch (err) {
      setCard({ url: "", path: null, error: String(err) });
    } finally {
      setWorking(null);
    }
  }, []);

  const clear = useCallback(async () => {
    await call<[], boolean>("clear_history");
    setCard(null);
    setShown(PAGE);
    await refresh();
  }, [refresh]);

  const list = entries ?? [];
  return (
    <>
      <PanelSection title={t("Recent Unlocks")}>
        {entries === null && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>{t("Loading...")}</div>
          </PanelSectionRow>
        )}
        {entries !== null && list.length === 0 && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {t("No unlocks recorded yet. Achievements you unlock from now on will appear here.")}
            </div>
          </PanelSectionRow>
        )}
        {list.slice(0, shown).map((entry) => {
          const key = `${entry.appid}:${entry.id}:${entry.ts}`;
          const parts = [entry.game, rarityText(entry.percent), relativeTime(entry.ts)].filter(Boolean);
          return (
            <PanelSectionRow key={key}>
              <ButtonItem
                layout="below"
                disabled={working !== null}
                onClick={() => void makeCard(entry)}
                description={parts.join(" · ")}
              >
                {working === key ? t("Making card...") : entry.title}
              </ButtonItem>
            </PanelSectionRow>
          );
        })}
        {list.length > 0 && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {t("Select an unlock to make a shareable image card.")}
            </div>
          </PanelSectionRow>
        )}
        {list.length > shown && (
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => setShown(shown + PAGE)}>
              {t("Show more")}
            </ButtonItem>
          </PanelSectionRow>
        )}
        {list.length > 0 && (
          <PanelSectionRow>
            <ButtonItem layout="below" disabled={working !== null} onClick={() => void clear()}>
              {t("Clear history")}
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>

      {card && (
        <PanelSection title={t("Share card")}>
          {card.url && (
            <PanelSectionRow>
              <img src={card.url} style={{ width: "100%", borderRadius: "6px" }} />
            </PanelSectionRow>
          )}
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.85, wordBreak: "break-all" }}>
              {card.path
                ? t("Saved to {path}", { path: card.path })
                : t("Could not save the card: {error}", { error: card.error ?? "" })}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      <PanelSection title={t("Milestone popups")}>
        <PanelSectionRow>
          <ToggleField
            label={t("Session summary")}
            description={t("When you close a game, shows how many achievements you unlocked while playing, for example 3 unlocked, 1 rare.")}
            checked={settings.session_summary_enabled}
            disabled={busy}
            onChange={(value) => void updateSettings({ session_summary_enabled: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("Almost there alert")}
            description={t("After an unlock, shows a popup such as Only 2 achievements left when a game is close to 100%.")}
            checked={settings.near_completion_enabled}
            disabled={busy}
            onChange={(value) => void updateSettings({ near_completion_enabled: value })}
          />
        </PanelSectionRow>
        {settings.near_completion_enabled && (
          <PanelSectionRow>
            <SliderField
              label={t("Alert when this many are left")}
              value={settings.near_completion_threshold}
              min={NEAR_RANGE.min}
              max={NEAR_RANGE.max}
              step={1}
              notchCount={NEAR_RANGE.max - NEAR_RANGE.min + 1}
              showValue
              disabled={busy}
              onChange={(value) => void updateSettings({ near_completion_threshold: value })}
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={busy} onClick={() => void call<[], void>("test_session_popup")}>
            {t("Test session summary")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={busy} onClick={() => void call<[], void>("test_near_completion_popup")}>
            {t("Test almost there alert")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}
