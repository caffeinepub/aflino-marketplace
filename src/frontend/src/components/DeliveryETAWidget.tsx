import { useDeliveryETA } from "@/context/DeliveryETAContext";
import { MapPin, Truck } from "lucide-react";
import { useState } from "react";

interface Props {
  sellerState?: string;
  sellerPincode?: string;
}

export default function DeliveryETAWidget({
  sellerState,
  sellerPincode,
}: Props) {
  const { userPincode, setUserPincode, getETA } = useDeliveryETA();
  const [inputVal, setInputVal] = useState("");
  const [inputMode, setInputMode] = useState(!userPincode);
  const [justChecked, setJustChecked] = useState(false);

  const eta = getETA(sellerState, sellerPincode);

  function handleCheck() {
    if (inputVal.length !== 6) return;
    setUserPincode(inputVal);
    setInputMode(false);
    setJustChecked(true);
    setTimeout(() => setJustChecked(false), 3000);
  }

  function handleChange() {
    setInputMode(true);
    setInputVal(userPincode);
  }

  // Countdown: hours left till 5pm today
  const now = new Date();
  const fivePm = new Date();
  fivePm.setHours(17, 0, 0, 0);
  const msLeft = fivePm.getTime() - now.getTime();
  const showCountdown = eta && msLeft > 0;
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      className="rounded-xl border border-gray-100 bg-gray-50 p-3.5"
      data-ocid="product.delivery_eta.panel"
    >
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 shrink-0" style={{ color: "#006AFF" }} />
        <span className="text-xs font-semibold text-gray-700">
          Delivery Estimate
        </span>
      </div>

      {inputMode ? (
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 flex-1 border border-gray-200 rounded-lg bg-white px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit pincode"
              value={inputVal}
              onChange={(e) =>
                setInputVal(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              data-ocid="product.delivery_eta.input"
            />
          </div>
          <button
            type="button"
            onClick={handleCheck}
            disabled={inputVal.length !== 6}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#006AFF" }}
            data-ocid="product.delivery_eta.primary_button"
          >
            Check
          </button>
        </div>
      ) : eta ? (
        <div
          className={`space-y-1.5 transition-all duration-300 ${
            justChecked ? "opacity-100 translate-y-0" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-green-600 font-bold text-sm">
                ✓ FREE Delivery by {eta.deliveryDateMin}
              </span>
            </div>
            <button
              type="button"
              onClick={handleChange}
              className="text-xs font-medium underline"
              style={{ color: "#006AFF" }}
              data-ocid="product.delivery_eta.secondary_button"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background:
                  eta.zone === "Local"
                    ? "#dcfce7"
                    : eta.zone === "Zonal"
                      ? "#dbeafe"
                      : "#f3f4f6",
                color:
                  eta.zone === "Local"
                    ? "#15803d"
                    : eta.zone === "Zonal"
                      ? "#1d4ed8"
                      : "#4b5563",
              }}
            >
              {eta.zone} · {eta.label}
            </span>
            <span className="text-[10px] text-gray-400">
              Pincode: {userPincode}
            </span>
          </div>

          {showCountdown && (
            <p className="text-[11px] text-orange-600 font-medium">
              ⚡ Order within {hoursLeft}h {minutesLeft}m for delivery by{" "}
              {eta.deliveryDateMin}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Enter your pincode to check delivery date
        </p>
      )}
    </div>
  );
}
