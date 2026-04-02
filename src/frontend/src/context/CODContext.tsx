import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface CODContextValue {
  codEnabled: boolean;
  setCodEnabled: (v: boolean) => void;
  codFee: number;
  setCodFee: (v: number) => void;
  codFreeThreshold: number;
  setCodFreeThreshold: (v: number) => void;
  sellerCODOptOut: string[];
  toggleSellerCODOptOut: (email: string) => void;
  isCODAvailable: (subtotal: number, sellerEmail?: string) => boolean;
  getCODFee: (subtotal: number) => number;
}

const CODContext = createContext<CODContextValue>({
  codEnabled: true,
  setCodEnabled: () => {},
  codFee: 29,
  setCodFee: () => {},
  codFreeThreshold: 1999,
  setCodFreeThreshold: () => {},
  sellerCODOptOut: [],
  toggleSellerCODOptOut: () => {},
  isCODAvailable: () => true,
  getCODFee: () => 29,
});

export function CODProvider({ children }: { children: React.ReactNode }) {
  const [codEnabled, setCodEnabled] = useState(true);
  const [codFee, setCodFee] = useState(29);
  const [codFreeThreshold, setCodFreeThreshold] = useState(1999);
  const [sellerCODOptOut, setSellerCODOptOut] = useState<string[]>([]);

  const toggleSellerCODOptOut = useCallback((email: string) => {
    setSellerCODOptOut((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  }, []);

  const getCODFee = useCallback(
    (subtotal: number): number => {
      if (!codEnabled) return 0;
      return subtotal < codFreeThreshold ? codFee : 0;
    },
    [codEnabled, codFee, codFreeThreshold],
  );

  const isCODAvailable = useCallback(
    (_subtotal: number, sellerEmail?: string): boolean => {
      if (!codEnabled) return false;
      if (sellerEmail && sellerCODOptOut.includes(sellerEmail)) return false;
      // COD still available even if fee > 0
      return true;
    },
    [codEnabled, sellerCODOptOut],
  );

  const value = useMemo(
    () => ({
      codEnabled,
      setCodEnabled,
      codFee,
      setCodFee,
      codFreeThreshold,
      setCodFreeThreshold,
      sellerCODOptOut,
      toggleSellerCODOptOut,
      isCODAvailable,
      getCODFee,
    }),
    [
      codEnabled,
      codFee,
      codFreeThreshold,
      sellerCODOptOut,
      toggleSellerCODOptOut,
      isCODAvailable,
      getCODFee,
    ],
  );

  return <CODContext.Provider value={value}>{children}</CODContext.Provider>;
}

export function useCOD() {
  return useContext(CODContext);
}
