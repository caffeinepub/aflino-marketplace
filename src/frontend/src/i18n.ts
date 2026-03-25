/**
 * Lightweight i18n utility — no external library required.
 * Provides a React Context-based translation system with localStorage persistence.
 */
import bn from "./locales/bn.json";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

type TranslationMap = Record<string, unknown>;

const resources: Record<string, TranslationMap> = {
  en: en as unknown as TranslationMap,
  hi: hi as unknown as TranslationMap,
  bn: bn as unknown as TranslationMap,
};

export const SUPPORTED_LANGS = ["en", "hi", "bn"] as const;
export type LangCode = (typeof SUPPORTED_LANGS)[number];

export function getSavedLang(): LangCode {
  const saved = localStorage.getItem("aflino_lang");
  if (saved && SUPPORTED_LANGS.includes(saved as LangCode))
    return saved as LangCode;
  return "en";
}

export function saveLang(code: LangCode) {
  localStorage.setItem("aflino_lang", code);
}

function resolvePath(obj: TranslationMap, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

export function translate(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const map = resources[lang] ?? resources.en;
  let result = resolvePath(map, key);
  if (result === key) {
    // Fallback to English
    result = resolvePath(resources.en, key);
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
    }
  }
  return result;
}
