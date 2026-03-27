/**
 * Lightweight i18n utility — 28 languages with RTL support.
 * Provides a React Context-based translation system with localStorage persistence.
 */
import ar from "./locales/ar.json";
import bn from "./locales/bn.json";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

type TranslationMap = Record<string, unknown>;

const resources: Record<string, TranslationMap> = {
  en: en as unknown as TranslationMap,
  hi: hi as unknown as TranslationMap,
  bn: bn as unknown as TranslationMap,
  ar: ar as unknown as TranslationMap,
  // All other 24 languages fall back to English until JSON files are added
};

/** All 28 supported language codes */
export const SUPPORTED_LANGS = [
  "en",
  "hi",
  "bn",
  "ar",
  "fa",
  "ur",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
  "as",
  "ks",
  "sd",
  "ne",
  "mai",
  "kok",
  "sa",
  "doi",
  "mni",
  "sat",
  "bo",
  "bho",
  "awa",
  "raj",
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number];

/** RTL language codes */
export const RTL_LANGS = new Set<string>(["ur", "ar", "fa", "sd", "ks"]);

export function isRTL(code: string): boolean {
  return RTL_LANGS.has(code);
}

/** Apply dir attribute to <html> based on language */
export function applyHtmlDir(code: string) {
  document.documentElement.setAttribute("dir", isRTL(code) ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", code);
}

export function getSavedLang(): LangCode {
  const saved = localStorage.getItem("aflino_lang");
  if (saved && SUPPORTED_LANGS.includes(saved as LangCode))
    return saved as LangCode;
  return "en";
}

export function saveLang(code: LangCode) {
  localStorage.setItem("aflino_lang", code);
  applyHtmlDir(code);
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

/** 28-language definitions with native names, sub-labels, and landmark icon keys */
export const ALL_LANGUAGES: {
  code: string;
  label: string;
  sub: string;
  short: string;
  icon: string;
  region: string;
}[] = [
  {
    code: "en",
    label: "English",
    sub: "English",
    short: "EN",
    icon: "flagpole",
    region: "International",
  },
  {
    code: "hi",
    label: "\u0939\u093f\u0928\u094d\u0926\u0940",
    sub: "Hindi",
    short: "\u0939\u093f",
    icon: "indiagate",
    region: "North India",
  },
  {
    code: "bn",
    label: "\u09ac\u09be\u0982\u09b2\u09be",
    sub: "Bengali",
    short: "\u09ac\u09be",
    icon: "howrah",
    region: "East India",
  },
  {
    code: "ta",
    label: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd",
    sub: "Tamil",
    short: "\u0ba4\u0bae",
    icon: "centralstation",
    region: "South India",
  },
  {
    code: "te",
    label: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41",
    sub: "Telugu",
    short: "\u0c24\u0c46",
    icon: "charminar",
    region: "South India",
  },
  {
    code: "mr",
    label: "\u092e\u0930\u093e\u0920\u0940",
    sub: "Marathi",
    short: "\u092e\u0930",
    icon: "gateway",
    region: "West India",
  },
  {
    code: "gu",
    label: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0",
    sub: "Gujarati",
    short: "\u0a97\u0ac1",
    icon: "sabarmati",
    region: "West India",
  },
  {
    code: "kn",
    label: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1",
    sub: "Kannada",
    short: "\u0c95\u0ca8",
    icon: "vidhana",
    region: "South India",
  },
  {
    code: "ml",
    label: "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02",
    sub: "Malayalam",
    short: "\u0d2e\u0d32",
    icon: "padmanabha",
    region: "South India",
  },
  {
    code: "pa",
    label: "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40",
    sub: "Punjabi",
    short: "\u0a2a\u0a70",
    icon: "goldentemple",
    region: "North India",
  },
  {
    code: "or",
    label: "\u0b13\u0b21\u0b3c\u0b3f\u0b06",
    sub: "Odia",
    short: "\u0b13\u0b21",
    icon: "konark",
    region: "East India",
  },
  {
    code: "as",
    label: "\u0985\u09b8\u09ae\u09c0\u09af\u09bc\u09be",
    sub: "Assamese",
    short: "\u0985\u09b8",
    icon: "kamakhya",
    region: "Northeast India",
  },
  {
    code: "ur",
    label: "\u0627\u0631\u062f\u0648",
    sub: "Urdu",
    short: "\u0627\u0631",
    icon: "charminar",
    region: "RTL",
  },
  {
    code: "ar",
    label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    sub: "Arabic",
    short: "\u0639\u0631",
    icon: "burj",
    region: "RTL",
  },
  {
    code: "fa",
    label: "\u0641\u0627\u0631\u0633\u06cc",
    sub: "Persian",
    short: "\u0641\u0627",
    icon: "azadi",
    region: "RTL",
  },
  {
    code: "ks",
    label: "\u06a9\u0672\u0634\u064f\u0631",
    sub: "Kashmiri",
    short: "\u06a9\u0672",
    icon: "dallake",
    region: "RTL",
  },
  {
    code: "sd",
    label: "\u0633\u0646\u068c\u064a",
    sub: "Sindhi",
    short: "\u0633\u0646",
    icon: "mohenjo",
    region: "RTL",
  },
  {
    code: "ne",
    label: "\u0928\u0947\u092a\u093e\u0932\u0940",
    sub: "Nepali",
    short: "\u0928\u0947",
    icon: "pashupatinath",
    region: "North",
  },
  {
    code: "mai",
    label: "\u092e\u0948\u0925\u093f\u0932\u0940",
    sub: "Maithili",
    short: "\u092e\u0948",
    icon: "vaishno",
    region: "East India",
  },
  {
    code: "kok",
    label: "\u0915\u094b\u0902\u0915\u0923\u0940",
    sub: "Konkani",
    short: "\u0915\u094b",
    icon: "goa",
    region: "West India",
  },
  {
    code: "sa",
    label: "\u0938\u0902\u0938\u094d\u0915\u0943\u0924\u092e\u094d",
    sub: "Sanskrit",
    short: "\u0938\u0902",
    icon: "varanasi",
    region: "Classical",
  },
  {
    code: "doi",
    label: "\u0921\u094b\u0917\u0930\u0940",
    sub: "Dogri",
    short: "\u0921\u094b",
    icon: "vaishno",
    region: "North India",
  },
  {
    code: "mni",
    label: "\u09ae\u09c7\u09a4\u09c7\u09af\u09bc\u09c7\u09b2\u09cb\u09a8",
    sub: "Manipuri",
    short: "\u09ae\u09c7",
    icon: "kangla",
    region: "Northeast India",
  },
  {
    code: "sat",
    label: "\u1c65\u1c5f\u1c71\u1c5f\u1c64\u1c5f\u1c68\u1c5f",
    sub: "Santali",
    short: "\u1c64\u1c5f",
    icon: "deoghar",
    region: "East India",
  },
  {
    code: "bo",
    label: "\u0f56\u0f7c\u0f51\u0f66\u0f90\u0f51",
    sub: "Tibetan",
    short: "\u0f56\u0f7c",
    icon: "potala",
    region: "Northeast",
  },
  {
    code: "bho",
    label: "\u092d\u094b\u091c\u092a\u0941\u0930\u0940",
    sub: "Bhojpuri",
    short: "\u092d\u094b",
    icon: "kashi",
    region: "East India",
  },
  {
    code: "awa",
    label: "\u0905\u0935\u0927\u0940",
    sub: "Awadhi",
    short: "\u0905\u0935",
    icon: "lucknow",
    region: "North India",
  },
  {
    code: "raj",
    label: "\u0930\u093e\u091c\u0938\u094d\u0925\u093e\u0928\u0940",
    sub: "Rajasthani",
    short: "\u0930\u093e",
    icon: "hawamahal",
    region: "North India",
  },
];
