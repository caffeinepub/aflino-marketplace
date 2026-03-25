import { createContext, useContext, useEffect, useState } from "react";

export interface RewardSettings {
  textPoints: number; // coins for text-only review
  photoPoints: number; // bonus coins for adding at least 1 photo
}

interface RewardSettingsContextValue {
  settings: RewardSettings;
  updateSettings: (s: RewardSettings) => void;
}

const DEFAULT_SETTINGS: RewardSettings = {
  textPoints: 3,
  photoPoints: 2,
};

const RewardSettingsContext = createContext<RewardSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

function loadSettings(): RewardSettings {
  try {
    const stored = localStorage.getItem("aflino_reward_settings");
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function RewardSettingsProvider({
  children,
}: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RewardSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem("aflino_reward_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  function updateSettings(s: RewardSettings) {
    setSettings(s);
  }

  return (
    <RewardSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </RewardSettingsContext.Provider>
  );
}

export function useRewardSettings() {
  return useContext(RewardSettingsContext);
}
