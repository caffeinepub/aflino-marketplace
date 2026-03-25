import { createContext, useCallback, useContext, useState } from "react";

export interface SavedAddress {
  id: string;
  label: "Home" | "Office" | "Other";
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "560001": { city: "Bangalore", state: "Karnataka" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "800001": { city: "Patna", state: "Bihar" },
  "751001": { city: "Bhubaneswar", state: "Odisha" },
  "682001": { city: "Kochi", state: "Kerala" },
  "462001": { city: "Bhopal", state: "Madhya Pradesh" },
  "440001": { city: "Nagpur", state: "Maharashtra" },
};

const STORAGE_KEY = "aflino_saved_addresses";

function loadAddresses(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAddresses(addresses: SavedAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

interface AddressContextValue {
  addresses: SavedAddress[];
  addAddress: (addr: Omit<SavedAddress, "id">) => void;
  updateAddress: (id: string, addr: Partial<Omit<SavedAddress, "id">>) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

const AddressContext = createContext<AddressContextValue | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(loadAddresses);

  const persist = useCallback((list: SavedAddress[]) => {
    setAddresses(list);
    saveAddresses(list);
  }, []);

  const addAddress = useCallback(
    (addr: Omit<SavedAddress, "id">) => {
      const newAddr: SavedAddress = { ...addr, id: crypto.randomUUID() };
      let next = [...addresses, newAddr];
      if (newAddr.isDefault) {
        next = next.map((a) =>
          a.id === newAddr.id ? a : { ...a, isDefault: false },
        );
      }
      persist(next);
    },
    [addresses, persist],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<Omit<SavedAddress, "id">>) => {
      let next = addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
      if (patch.isDefault) {
        next = next.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
      }
      persist(next);
    },
    [addresses, persist],
  );

  const deleteAddress = useCallback(
    (id: string) => {
      persist(addresses.filter((a) => a.id !== id));
    },
    [addresses, persist],
  );

  const setDefault = useCallback(
    (id: string) => {
      const next = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
      persist(next);
    },
    [addresses, persist],
  );

  return (
    <AddressContext.Provider
      value={{
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefault,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
}
