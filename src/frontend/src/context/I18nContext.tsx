import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { type LangCode, getSavedLang, saveLang, translate } from "../i18n";

interface I18nContextValue {
  language: LangCode;
  changeLanguage: (code: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: "en",
  changeLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LangCode>(getSavedLang);

  const changeLanguage = useCallback((code: string) => {
    const safe = (["en", "hi", "bn"].includes(code) ? code : "en") as LangCode;
    saveLang(safe);
    setLanguage(safe);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Drop-in replacement for react-i18next's `useTranslation` hook */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  return {
    t: ctx.t,
    i18n: {
      language: ctx.language,
      changeLanguage: ctx.changeLanguage,
    },
  };
}
