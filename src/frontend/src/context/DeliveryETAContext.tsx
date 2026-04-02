import { useGeoLocation } from "@/context/GeoLocationContext";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface ETAResult {
  minDays: number;
  maxDays: number;
  label: string;
  deliveryDateMin: string;
  deliveryDateMax: string;
  isFree: boolean;
  zone: "Local" | "Zonal" | "National";
}

interface DeliveryETAContextValue {
  userPincode: string;
  setUserPincode: (p: string) => void;
  getETA: (sellerState?: string, sellerPincode?: string) => ETAResult | null;
  customerState: string | null;
}

const DeliveryETAContext = createContext<DeliveryETAContextValue>({
  userPincode: "",
  setUserPincode: () => {},
  getETA: () => null,
  customerState: null,
});

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    // Skip Sundays (0)
    if (result.getDay() !== 0) added++;
  }
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function DeliveryETAProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customerState } = useGeoLocation();
  const [userPincode, setUserPincodeState] = useState<string>(() => {
    return localStorage.getItem("aflino_delivery_pincode") ?? "";
  });

  const setUserPincode = useCallback((p: string) => {
    setUserPincodeState(p);
    if (p) {
      localStorage.setItem("aflino_delivery_pincode", p);
    } else {
      localStorage.removeItem("aflino_delivery_pincode");
    }
  }, []);

  const getETA = useCallback(
    (sellerState?: string, sellerPincode?: string): ETAResult | null => {
      if (!userPincode || userPincode.length < 6) return null;

      let zone: "Local" | "Zonal" | "National" = "National";

      // Zone detection: compare first 3 digits for Local
      if (
        sellerPincode &&
        sellerPincode.length >= 3 &&
        userPincode.substring(0, 3) === sellerPincode.substring(0, 3)
      ) {
        zone = "Local";
      } else if (
        sellerState &&
        customerState &&
        sellerState.toLowerCase() === customerState.toLowerCase()
      ) {
        zone = "Zonal";
      }

      const zoneConfig: Record<
        "Local" | "Zonal" | "National",
        { min: number; max: number; label: string }
      > = {
        Local: { min: 1, max: 2, label: "1-2 Days" },
        Zonal: { min: 2, max: 3, label: "2-3 Days" },
        National: { min: 5, max: 7, label: "5-7 Days" },
      };

      const { min, max, label } = zoneConfig[zone];
      const today = new Date();

      return {
        minDays: min,
        maxDays: max,
        label,
        deliveryDateMin: formatDate(addBusinessDays(today, min)),
        deliveryDateMax: formatDate(addBusinessDays(today, max)),
        isFree: true,
        zone,
      };
    },
    [userPincode, customerState],
  );

  const value = useMemo(
    () => ({ userPincode, setUserPincode, getETA, customerState }),
    [userPincode, setUserPincode, getETA, customerState],
  );

  return (
    <DeliveryETAContext.Provider value={value}>
      {children}
    </DeliveryETAContext.Provider>
  );
}

export function useDeliveryETA() {
  return useContext(DeliveryETAContext);
}
