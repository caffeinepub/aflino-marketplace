import { createContext, useContext, useState } from "react";

const DEFAULT_WORDS = [
  "spam",
  "scam",
  "idiot",
  "stupid",
  "fool",
  "hate",
  "ugly",
  "liar",
  "cheat",
  "fraud",
  "fake",
  "abuse",
  "worst",
  "terrible",
  "pathetic",
];

function loadWords(): string[] {
  try {
    const stored = localStorage.getItem("aflino_blacklist_words");
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_WORDS;
}

interface BlacklistContextValue {
  blacklistWords: string[];
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  containsProfanity: (text: string) => boolean;
}

const BlacklistContext = createContext<BlacklistContextValue>({
  blacklistWords: DEFAULT_WORDS,
  addWord: () => {},
  removeWord: () => {},
  containsProfanity: () => false,
});

export function BlacklistProvider({ children }: { children: React.ReactNode }) {
  const [blacklistWords, setBlacklistWords] = useState<string[]>(loadWords);

  function addWord(word: string) {
    const normalized = word.trim().toLowerCase();
    if (!normalized || blacklistWords.includes(normalized)) return;
    const updated = [...blacklistWords, normalized];
    setBlacklistWords(updated);
    try {
      localStorage.setItem("aflino_blacklist_words", JSON.stringify(updated));
    } catch {}
  }

  function removeWord(word: string) {
    const updated = blacklistWords.filter((w) => w !== word);
    setBlacklistWords(updated);
    try {
      localStorage.setItem("aflino_blacklist_words", JSON.stringify(updated));
    } catch {}
  }

  function containsProfanity(text: string): boolean {
    const lower = text.toLowerCase();
    return blacklistWords.some((w) => lower.includes(w));
  }

  return (
    <BlacklistContext.Provider
      value={{ blacklistWords, addWord, removeWord, containsProfanity }}
    >
      {children}
    </BlacklistContext.Provider>
  );
}

export function useBlacklist() {
  return useContext(BlacklistContext);
}
