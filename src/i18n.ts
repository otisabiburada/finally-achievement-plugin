import { LOCALES } from "./locales";

// Languages the plugin is translated into. English is the source text: every
// string in the code is its own English translation key, so a missing
// translation just shows the English text.
export type LangCode = "en" | "tr" | "de" | "fr" | "es" | "pt-BR" | "ru" | "zh-Hans" | "pl";
export type LanguageSetting = "auto" | LangCode;

export const LANGUAGE_OPTIONS: { data: LanguageSetting; label: string }[] = [
  { data: "auto", label: "Auto (Steam language)" },
  { data: "en", label: "English" },
  { data: "tr", label: "Türkçe" },
  { data: "de", label: "Deutsch" },
  { data: "fr", label: "Français" },
  { data: "es", label: "Español" },
  { data: "pt-BR", label: "Português (Brasil)" },
  { data: "ru", label: "Русский" },
  { data: "pl", label: "Polski" },
  { data: "zh-Hans", label: "简体中文" },
];

const SUPPORTED: LangCode[] = ["en", "tr", "de", "fr", "es", "pt-BR", "ru", "zh-Hans", "pl"];

let current: LangCode = "en";

export function setLanguage(code: LangCode): void {
  current = SUPPORTED.includes(code) ? code : "en";
}

export function getLanguage(): LangCode {
  return current;
}

// "4.7" -> "4,7" in the languages that write a decimal comma.
export function formatDecimal(text: string): string {
  return ["tr", "de", "fr", "es", "pt-BR", "ru", "pl"].includes(current) ? text.replace(".", ",") : text;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const table = LOCALES[current];
  let text = (table && table[key]) || key;
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  }
  return text;
}

// Translates the labels of a dropdown's option list (labels without a
// translation, such as template names, stay as they are).
export function tOpts<T extends { label: string }>(options: T[]): T[] {
  return options.map((option) => ({ ...option, label: t(option.label) }));
}

const STEAM_NAMES: Record<string, LangCode> = {
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
  polish: "pl",
};

// "turkish", "tr", "tr-TR", "pt_BR", "zh-CN" ... -> a supported language, or
// null when it isn't one of ours (Traditional Chinese, Japanese, ...).
export function languageFromSteam(raw: unknown): LangCode | null {
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

// Best guess at the Steam client's language from inside Steam's UI. These are
// undocumented Steam objects, so every step is guarded.
export function detectSteamLanguage(): LangCode | null {
  const w = window as unknown as Record<string, any>;
  const sources: Array<() => unknown> = [
    () => w.LocalizationManager?.m_rgLocalesToUse?.[0],
    () => w.LocalizationManager?.m_strLanguage,
    () => navigator.language,
  ];
  for (const read of sources) {
    try {
      const code = languageFromSteam(read());
      if (code) return code;
    } catch {
      // try the next source
    }
  }
  return null;
}
