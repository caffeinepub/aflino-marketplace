import { createContext, useContext, useEffect, useState } from "react";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export { INDIAN_STATES };

// Rough lat/lng bounding boxes for major Indian states
function latLngToState(lat: number, lng: number): string | null {
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) return "Delhi";
  if (lat >= 18 && lat <= 22.5 && lng >= 72 && lng <= 80.5)
    return "Maharashtra";
  if (lat >= 11.5 && lat <= 18 && lng >= 74 && lng <= 78.5) return "Karnataka";
  if (lat >= 8 && lat <= 13.5 && lng >= 76 && lng <= 80.5) return "Tamil Nadu";
  if (lat >= 20 && lat <= 24.5 && lng >= 68 && lng <= 74.5) return "Gujarat";
  if (lat >= 21 && lat <= 27.5 && lng >= 85 && lng <= 89.5)
    return "West Bengal";
  if (lat >= 23 && lat <= 30.5 && lng >= 69 && lng <= 78) return "Rajasthan";
  if (lat >= 27 && lat <= 31 && lng >= 77 && lng <= 84.5)
    return "Uttar Pradesh";
  if (lat >= 21 && lat <= 26.5 && lng >= 78 && lng <= 84.5)
    return "Madhya Pradesh";
  if (lat >= 17 && lat <= 20.5 && lng >= 80 && lng <= 84.5) return "Telangana";
  if (lat >= 13.5 && lat <= 19 && lng >= 77.5 && lng <= 84)
    return "Andhra Pradesh";
  if (lat >= 19 && lat <= 24.5 && lng >= 81 && lng <= 84.5)
    return "Chhattisgarh";
  if (lat >= 20.5 && lat <= 25 && lng >= 84 && lng <= 87.5) return "Odisha";
  if (lat >= 24.5 && lat <= 28 && lng >= 85 && lng <= 88.5) return "Bihar";
  if (lat >= 29.5 && lat <= 33 && lng >= 73.5 && lng <= 77.5) return "Punjab";
  if (lat >= 29.5 && lat <= 31.5 && lng >= 74.5 && lng <= 77.5)
    return "Haryana";
  if (lat >= 30 && lat <= 33.5 && lng >= 75.5 && lng <= 79.5)
    return "Himachal Pradesh";
  if (lat >= 29.5 && lat <= 32 && lng >= 78.5 && lng <= 81)
    return "Uttarakhand";
  if (lat >= 8 && lat <= 12.5 && lng >= 74.5 && lng <= 77.5) return "Kerala";
  if (lat >= 26.5 && lat <= 29.5 && lng >= 88.5 && lng <= 97) return "Assam";
  return null;
}

interface GeoLocationContextValue {
  customerState: string | null;
  setCustomerState: (s: string | null) => void;
  locationPermission: "prompt" | "granted" | "denied";
  requestLocation: () => void;
  modalShown: boolean;
  dismissModal: () => void;
  indianStates: string[];
}

const GeoLocationContext = createContext<GeoLocationContextValue>({
  customerState: null,
  setCustomerState: () => {},
  locationPermission: "prompt",
  requestLocation: () => {},
  modalShown: false,
  dismissModal: () => {},
  indianStates: INDIAN_STATES,
});

export function GeoLocationProvider({
  children,
}: { children: React.ReactNode }) {
  const [customerState, setCustomerStateRaw] = useState<string | null>(() => {
    return localStorage.getItem("aflino_customer_state") || null;
  });
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [modalShown, setModalShown] = useState(() => {
    const noSavedState = !localStorage.getItem("aflino_customer_state");
    const notSeenBefore = localStorage.getItem("aflino_modal_shown") !== "true";
    return noSavedState && notSeenBefore;
  });

  const setCustomerState = (s: string | null) => {
    setCustomerStateRaw(s);
    if (s) {
      localStorage.setItem("aflino_customer_state", s);
    } else {
      localStorage.removeItem("aflino_customer_state");
    }
  };

  const dismissModal = () => {
    setModalShown(false);
    localStorage.setItem("aflino_modal_shown", "true");
  };

  const tryGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission("granted");
        const state = latLngToState(pos.coords.latitude, pos.coords.longitude);
        if (state) setCustomerState(state);
      },
      () => {
        setLocationPermission("denied");
      },
    );
  };

  const requestLocation = () => {
    tryGeolocate();
  };

  // On mount: try to detect permission state
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          setLocationPermission("granted");
        } else if (result.state === "denied") {
          setLocationPermission("denied");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeoLocationContext.Provider
      value={{
        customerState,
        setCustomerState,
        locationPermission,
        requestLocation,
        modalShown,
        dismissModal,
        indianStates: INDIAN_STATES,
      }}
    >
      {children}
    </GeoLocationContext.Provider>
  );
}

export function useGeoLocation() {
  return useContext(GeoLocationContext);
}
