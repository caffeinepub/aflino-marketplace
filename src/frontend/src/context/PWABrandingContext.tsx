import { createContext, useContext, useState } from "react";

const DEFAULT_ICON = "/assets/generated/aflino-icon-512.dim_512x512.png";
const DEFAULT_SPLASH = "/assets/generated/aflino-icon-192.dim_192x192.png";
const STORAGE_KEY = "aflino_pwa_branding";

interface PWABranding {
  appIconUrl: string;
  splashLogoUrl: string;
  setPWABranding: (
    updates: Partial<Omit<PWABranding, "setPWABranding">>,
  ) => void;
}

const PWABrandingContext = createContext<PWABranding>({
  appIconUrl: DEFAULT_ICON,
  splashLogoUrl: DEFAULT_SPLASH,
  setPWABranding: () => {},
});

function loadFromStorage(): { appIconUrl: string; splashLogoUrl: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        appIconUrl: parsed.appIconUrl || DEFAULT_ICON,
        splashLogoUrl: parsed.splashLogoUrl || DEFAULT_SPLASH,
      };
    }
  } catch {}
  return { appIconUrl: DEFAULT_ICON, splashLogoUrl: DEFAULT_SPLASH };
}

export function PWABrandingProvider({
  children,
}: { children: React.ReactNode }) {
  const [state, setState] = useState(loadFromStorage);

  function setPWABranding(
    updates: Partial<Omit<PWABranding, "setPWABranding">>,
  ) {
    setState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <PWABrandingContext.Provider value={{ ...state, setPWABranding }}>
      {children}
    </PWABrandingContext.Provider>
  );
}

export function usePWABranding() {
  return useContext(PWABrandingContext);
}
