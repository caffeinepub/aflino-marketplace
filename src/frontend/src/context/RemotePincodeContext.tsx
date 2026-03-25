import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "aflino_remote_pincodes";

export interface PincodeRange {
  id: string;
  start: string;
  end: string;
  label?: string;
}

export interface RemotePincodeContextValue {
  ranges: PincodeRange[];
  addRange: (start: string, end: string, label?: string) => void;
  removeRange: (id: string) => void;
  isPincodeRemote: (pincode: string) => boolean;
}

const RemotePincodeContext = createContext<RemotePincodeContextValue | null>(
  null,
);

function loadRanges(): PincodeRange[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRanges(ranges: PincodeRange[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  } catch {
    // ignore
  }
}

export function RemotePincodeProvider({
  children,
}: { children: React.ReactNode }) {
  const [ranges, setRanges] = useState<PincodeRange[]>(loadRanges);

  function addRange(start: string, end: string, label?: string) {
    const newRange: PincodeRange = {
      id: `rng_${Date.now()}`,
      start,
      end,
      label,
    };
    setRanges((prev) => {
      const updated = [...prev, newRange];
      saveRanges(updated);
      return updated;
    });
  }

  function removeRange(id: string) {
    setRanges((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRanges(updated);
      return updated;
    });
  }

  function isPincodeRemote(pincode: string): boolean {
    const num = Number(pincode);
    if (Number.isNaN(num)) return false;
    return ranges.some((r) => {
      const start = Number(r.start);
      const end = Number(r.end);
      return num >= start && num <= end;
    });
  }

  return (
    <RemotePincodeContext.Provider
      value={{ ranges, addRange, removeRange, isPincodeRemote }}
    >
      {children}
    </RemotePincodeContext.Provider>
  );
}

export function useRemotePincode(): RemotePincodeContextValue {
  const ctx = useContext(RemotePincodeContext);
  if (!ctx)
    throw new Error(
      "useRemotePincode must be used within RemotePincodeProvider",
    );
  return ctx;
}
