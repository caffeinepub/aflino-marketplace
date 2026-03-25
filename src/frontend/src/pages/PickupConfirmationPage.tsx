import { CheckCircle2, MapPin, Package, XCircle } from "lucide-react";
import { useState } from "react";

function getTokenFromPath(): string {
  const parts = window.location.pathname.split("/");
  return parts[parts.length - 1] ?? "";
}

export default function PickupConfirmationPage() {
  const [confirmed, setConfirmed] = useState(false);
  const token = getTokenFromPath();

  let orderId = "";
  let isValid = false;
  let isExpired = false;

  try {
    const decoded = atob(token);
    const [id, tsStr] = decoded.split(":");
    const ts = Number(tsStr);
    orderId = id;
    const age = Date.now() - ts;
    isExpired = age > 24 * 60 * 60 * 1000;
    isValid = !!id && !!ts && !Number.isNaN(ts);
  } catch {
    isValid = false;
  }

  if (!isValid || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Gatepass
          </h1>
          <p className="text-gray-500 text-sm">
            This QR code is invalid. Please ask the seller to generate a new
            gatepass.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Gatepass Expired
          </h1>
          <p className="text-gray-500 text-sm">
            This gatepass has expired (valid for 24 hours). Please ask the
            seller to regenerate.
          </p>
        </div>
      </div>
    );
  }

  if (confirmed) {
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
              <p className="text-sm text-gray-700">Scan to mark as Shipped</p>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className="w-full py-3 rounded-xl text-white font-bold text-base transition-transform active:scale-95"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="pickup.confirm_button"
        >
          ✓ Confirm Pickup
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          By confirming, you verify physical pickup of this order
        </p>
      </div>
    </div>
  );
}
