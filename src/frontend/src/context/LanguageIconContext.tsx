import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface LanguageIconData {
  code: string;
  customIcon: string | null; // base64 data URL
}

interface LanguageIconContextValue {
  icons: Record<string, string | null>;
  setIcon: (langCode: string, dataUrl: string | null) => void;
}

const LanguageIconContext = createContext<LanguageIconContextValue>({
  icons: {},
  setIcon: () => {},
});

const STORAGE_KEY = "aflino_lang_icons";

export function LanguageIconProvider({ children }: { children: ReactNode }) {
  const [icons, setIcons] = useState<Record<string, string | null>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  function setIcon(langCode: string, dataUrl: string | null) {
    setIcons((prev) => {
      const next = { ...prev, [langCode]: dataUrl };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <LanguageIconContext.Provider value={{ icons, setIcon }}>
      {children}
    </LanguageIconContext.Provider>
  );
}

export function useLanguageIcons() {
  return useContext(LanguageIconContext);
}
