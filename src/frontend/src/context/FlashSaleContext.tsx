import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "aflino_flash_sales";

export interface FlashSale {
  id: string;
  productId: number;
  productTitle: string;
  originalPrice: number;
  salePrice: number;
  startTime: string | null; // ISO string or null
  endTime: string | null; // ISO string or null (null = "Hot Deal", no timer)
}

interface FlashSaleContextValue {
  flashSales: FlashSale[];
  addFlashSale: (sale: Omit<FlashSale, "id">) => void;
  removeFlashSale: (id: string) => void;
  getActiveSales: () => FlashSale[];
  getProductSale: (productId: number) => FlashSale | undefined;
}

const FlashSaleContext = createContext<FlashSaleContextValue | null>(null);

function loadSales(): FlashSale[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function isSaleActive(sale: FlashSale): boolean {
  const now = Date.now();
  if (sale.startTime && now < new Date(sale.startTime).getTime()) return false;
  if (sale.endTime && now >= new Date(sale.endTime).getTime()) return false;
  return true;
}

export function FlashSaleProvider({ children }: { children: React.ReactNode }) {
  const [flashSales, setFlashSales] = useState<FlashSale[]>(loadSales);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(flashSales));
    } catch {
      /* ignore */
    }
  }, [flashSales]);

  const addFlashSale = useCallback((sale: Omit<FlashSale, "id">) => {
    setFlashSales((prev) => [...prev, { ...sale, id: `fs_${Date.now()}` }]);
  }, []);

  const removeFlashSale = useCallback((id: string) => {
    setFlashSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getActiveSales = useCallback((): FlashSale[] => {
    return flashSales.filter(isSaleActive);
  }, [flashSales]);

  const getProductSale = useCallback(
    (productId: number): FlashSale | undefined => {
      return flashSales.find(
        (s) => s.productId === productId && isSaleActive(s),
      );
    },
    [flashSales],
  );

  return (
    <FlashSaleContext.Provider
      value={{
        flashSales,
        addFlashSale,
        removeFlashSale,
        getActiveSales,
        getProductSale,
      }}
    >
      {children}
    </FlashSaleContext.Provider>
  );
}

export function useFlashSale() {
  const ctx = useContext(FlashSaleContext);
  if (!ctx)
    throw new Error("useFlashSale must be used within FlashSaleProvider");
  return ctx;
}
