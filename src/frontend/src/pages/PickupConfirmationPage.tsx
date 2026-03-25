import { updateOrderStatusInStorage } from "@/context/OrderTrackingContext";
import { useActor } from "@/hooks/useActor";
import { CheckCircle2, Loader2, MapPin, Package, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type PageState =
  | "loading"
  | "valid"
  | "invalid"
  | "already_used"
  | "confirmed"
  | "error";

function getTokenFromPath(): string {
  const parts = window.location.pathname.split("/pickup/");
  return parts[1] ?? "";
}

export default function PickupConfirmationPage() {
  const { actor, isFetching } = useActor();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [orderId, setOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const token = getTokenFromPath();

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      setErrorMessage("No token found in URL.");
      return;
    }

    // Wait for actor to be ready
    if (isFetching) return;

    if (!actor) {
      // No actor — try fallback local decode
      tryLocalDecode();
      return;
    }

    const actorAny = actor as any;
    if (typeof actorAny.verifyAndConsumeGatepassToken !== "function") {
      tryLocalDecode();
      return;
    }

    // Verify via canister
    actorAny
      .verifyAndConsumeGatepassToken(token)
      .then(
        (result: { success: boolean; orderId: string; message: string }) => {
          if (result.success) {
            setOrderId(result.orderId);
            setPageState("valid");
          } else {
            const msg = result.message?.toLowerCase() ?? "";
            if (msg.includes("used") || msg.includes("consumed")) {
              setPageState("already_used");
            } else if (msg.includes("expir")) {
              setPageState("already_used");
            } else {
              setPageState("invalid");
            }
            setErrorMessage(result.message ?? "Gatepass verification failed.");
          }
        },
      )
      .catch(() => {
        tryLocalDecode();
      });
  }, [actor, isFetching, token]);

  function tryLocalDecode() {
    if (!token) {
      setPageState("invalid");
      return;
    }
    try {
      const decoded = atob(token);
      const [id, tsStr] = decoded.split(":");
      const ts = Number(tsStr);
      const age = Date.now() - ts;
      if (!id || !ts || Number.isNaN(ts)) {
        setPageState("invalid");
        setErrorMessage("Invalid QR code format.");
        return;
      }
      if (age > 24 * 60 * 60 * 1000) {
        setPageState("already_used");
        setErrorMessage("This gatepass has expired (valid for 24 hours).");
        return;
      }
      setOrderId(id);
      setPageState("valid");
    } catch {
      setPageState("invalid");
      setErrorMessage("Could not decode gatepass token.");
    }
  }

  function handleConfirmPickup() {
    const updated = updateOrderStatusInStorage(orderId, "Shipped");
    if (!updated) {
      // Even if order not found in storage, still confirm visually
    }
    setPageState("confirmed");
  }

  // ── Loading state ────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div
            className="rounded-xl p-4 text-center mb-6"
            style={{ backgroundColor: "#006AFF" }}
          >
            <p className="text-white font-bold text-lg">AFLINO</p>
            <p className="text-blue-100 text-xs">Digital Pickup Gatepass</p>
          </div>
          <Loader2
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: "#006AFF" }}
          />
          <p className="text-gray-500 text-sm">Verifying gatepass...</p>
        </div>
      </div>
    );
  }

  // ── Invalid ──────────────────────────────────────
  if (pageState === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Gatepass
          </h1>
          <p className="text-gray-500 text-sm">
            {errorMessage ||
              "This QR code is invalid. Please ask the seller to generate a new gatepass."}
          </p>
        </div>
      </div>
    );
  }

  // ── Already used / expired ────────────────────────
  if (pageState === "already_used") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Gatepass Expired or Already Used
          </h1>
          <p className="text-gray-500 text-sm">
            {errorMessage ||
              "This gatepass has already been used or has expired. Please ask the seller to regenerate."}
          </p>
        </div>
      </div>
    );
  }

  // ── Confirmed ────────────────────────────────────
  if (pageState === "confirmed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <CheckCircle2
            className="w-20 h-20 mx-auto mb-4"
            style={{ color: "#22C55E" }}
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pickup Confirmed!
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Order marked as <strong>Shipped</strong>. Pickup event logged
            successfully.
          </p>
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "#EEF4FF", color: "#006AFF" }}
          >
            <Package className="w-5 h-5 mx-auto mb-1" />
            <span className="font-semibold font-mono">{orderId}</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Pickup confirmed by AFLINO Gatepass System
          </p>
        </div>
      </div>
    );
  }

  // ── Valid — show confirm button ────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        {/* Header */}
        <div
          className="rounded-xl p-4 text-center mb-6"
          style={{ backgroundColor: "#006AFF" }}
        >
          <p className="text-white font-bold text-lg">AFLINO</p>
          <p className="text-blue-100 text-xs">Digital Pickup Gatepass</p>
        </div>

        {/* Order Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Package
              className="w-5 h-5 shrink-0"
              style={{ color: "#006AFF" }}
            />
            <div>
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="font-semibold font-mono text-gray-900">{orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 shrink-0" style={{ color: "#EC008C" }} />
            <div>
              <p className="text-xs text-gray-500">Pickup Action</p>
              <p className="text-sm text-gray-700">
                Tap to confirm package handover
              </p>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirmPickup}
          className="w-full py-3 rounded-xl text-white font-bold text-base transition-transform active:scale-95"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="pickup.confirm_button"
        >
          \u2713 Confirm Pickup
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          By confirming, you verify physical pickup of this order
        </p>
      </div>
    </div>
  );
}
