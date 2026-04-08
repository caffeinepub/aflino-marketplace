/**
 * useActor stub — returns a minimal actor object for components that need it.
 *
 * The backend canister is currently empty (backendInterface has no methods).
 * All consuming components (GatepassQR, ShippingLabelButton, QRSecuritySection,
 * PickupConfirmationPage) already guard against missing methods via `typeof actor.method === "function"`
 * checks, so returning `null` for actor is safe and triggers their local fallbacks.
 *
 * When the backend gains methods, replace this stub with a proper implementation
 * that calls createActor from src/backend.ts.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface ActorResult {
  actor: null;
  isFetching: boolean;
}

export function useActor(): ActorResult {
  const [isFetching, setIsFetching] = useState(true);
  const mounted = useRef(true);

  const init = useCallback(async () => {
    // Simulate async initialization so consuming components wait one tick
    await Promise.resolve();
    if (mounted.current) setIsFetching(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    init();
    return () => {
      mounted.current = false;
    };
  }, [init]);

  return { actor: null, isFetching };
}
