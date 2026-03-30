import { useMemo } from "react";

export type PWAIdentity = "customer" | "seller" | "admin" | "default";

const STORAGE_KEY = "aflino_pwa_identity";

export function usePWAIdentity(): PWAIdentity {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("app") as PWAIdentity | null;
    if (param && ["customer", "seller", "admin"].includes(param)) {
      localStorage.setItem(STORAGE_KEY, param);
      return param;
    }

    const path = window.location.pathname;
    if (path.startsWith("/admin")) {
      localStorage.setItem(STORAGE_KEY, "admin");
      return "admin";
    }
    if (path.startsWith("/seller") || path === "/seller-register") {
      localStorage.setItem(STORAGE_KEY, "seller");
      return "seller";
    }

    const stored = localStorage.getItem(STORAGE_KEY) as PWAIdentity | null;
    if (stored && ["customer", "seller", "admin"].includes(stored)) {
      return stored;
    }

    return "default";
  }, []);
}

export function getPWAIdentity(): PWAIdentity {
  const params = new URLSearchParams(window.location.search);
  const param = params.get("app") as PWAIdentity | null;
  if (param && ["customer", "seller", "admin"].includes(param)) return param;
  const stored = localStorage.getItem(STORAGE_KEY) as PWAIdentity | null;
  if (stored && ["customer", "seller", "admin"].includes(stored)) return stored;
  return "default";
}
