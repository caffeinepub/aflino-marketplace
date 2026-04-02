import {
  Banknote,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Save,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCOD } from "../../context/CODContext";
import { razorpayBackend } from "../../utils/razorpayBackend";

export default function PaymentSettingsTab() {
  const {
    codEnabled,
    setCodEnabled,
    codFee,
    setCodFee,
    codFreeThreshold,
    setCodFreeThreshold,
  } = useCOD();
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentKeyId, setCurrentKeyId] = useState("");
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  useEffect(() => {
    razorpayBackend
      .getRazorpayKeyId()
      .then((id) => setCurrentKeyId(id || ""))
      .catch(() => setCurrentKeyId(""))
      .finally(() => setLoadingCurrent(false));
  }, []);

  async function handleSave() {
    if (!keyId.trim() || !keySecret.trim()) {
      toast.error("Both Key ID and Secret Key are required.");
      return;
    }
    setSaving(true);
    try {
      await razorpayBackend.setRazorpayKeys(keyId.trim(), keySecret.trim());
      setCurrentKeyId(keyId.trim());
      setKeyId("");
      setKeySecret("");
      toast.success("Razorpay keys saved securely.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save keys. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function maskKeyId(id: string) {
    if (!id) return "";
    return id.slice(0, 12) + "*".repeat(Math.max(0, id.length - 12));
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Payment Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your Razorpay integration for live payments.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
        <Info
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: "#006AFF" }}
        />
        <p className="text-sm text-blue-700">
          These keys are stored securely in the canister&apos;s stable memory
          and are <strong>never exposed to customers</strong>. Only the public
          Key ID is sent to the frontend during checkout.
        </p>
      </div>

      {/* Current Key Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4" style={{ color: "#006AFF" }} />
          Current Configuration
        </h3>
        {loadingCurrent ? (
          <div
            className="flex items-center gap-2 text-sm text-gray-400"
            data-ocid="payment_settings.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : currentKeyId ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Active Key ID</p>
            <p className="font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
              {maskKeyId(currentKeyId)}
            </p>
            <p className="text-xs text-gray-400">
              Keys are configured and active.
            </p>
          </div>
        ) : (
          <p
            className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2"
            data-ocid="payment_settings.error_state"
          >
            ⚠️ No Razorpay keys configured. Payments will not work until keys are
            set.
          </p>
        )}
      </div>

      {/* Update Keys Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800">
          {currentKeyId ? "Update Keys" : "Set Up Keys"}
        </h3>

        <div>
          <label
            htmlFor="rzp-key-id"
            className="block text-xs font-medium text-gray-600 mb-1.5"
          >
            Razorpay Key ID
          </label>
          <input
            id="rzp-key-id"
            type="text"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_live_xxxxxxxxxxxx"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none"
            data-ocid="payment_settings.key_id.input"
          />
        </div>

        <div>
          <label
            htmlFor="rzp-secret"
            className="block text-xs font-medium text-gray-600 mb-1.5"
          >
            Razorpay Secret Key
          </label>
          <div className="relative">
            <input
              id="rzp-secret"
              type={showSecret ? "text" : "password"}
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              placeholder="Enter your secret key"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none"
              data-ocid="payment_settings.key_secret.input"
            />
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-ocid="payment_settings.toggle_secret.button"
            >
              {showSecret ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your secret key will never be displayed after saving.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#006AFF" }}
          data-ocid="payment_settings.save_button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Keys Securely"}
        </button>
      </div>
      {/* ── COD Fee Engine ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Banknote className="w-4 h-4" style={{ color: "#006AFF" }} />
          Cash on Delivery Settings
        </h3>

        {/* Master COD Switch */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">Enable COD</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Master switch — disabling removes COD option for all sellers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCodEnabled(!codEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${codEnabled ? "bg-[#006AFF]" : "bg-gray-300"}`}
            data-ocid="admin.cod_master.toggle"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${codEnabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {codEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cod-fee-input"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                COD Handling Fee (₹)
              </label>
              <input
                id="cod-fee-input"
                type="number"
                min={0}
                value={codFee}
                onChange={(e) => setCodFee(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                data-ocid="admin.cod_fee.input"
              />
              <p className="text-xs text-gray-400 mt-1">
                Charged when cart total is below the free threshold
              </p>
            </div>
            <div>
              <label
                htmlFor="cod-threshold-input"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Free COD Threshold (₹)
              </label>
              <input
                id="cod-threshold-input"
                type="number"
                min={0}
                value={codFreeThreshold}
                onChange={(e) => setCodFreeThreshold(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                data-ocid="admin.cod_threshold.input"
              />
              <p className="text-xs text-gray-400 mt-1">
                Orders above this amount get FREE COD
              </p>
            </div>
          </div>
        )}

        {codEnabled && (
          <div className="text-xs bg-blue-50 text-blue-700 rounded-lg px-3 py-2.5 border border-blue-100">
            COD is <strong>FREE</strong> for orders above ₹
            {codFreeThreshold.toLocaleString("en-IN")}. Below that, a ₹{codFee}{" "}
            handling fee is added.
          </div>
        )}
      </div>

      {/* ── Shipping Zones ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Truck className="w-4 h-4" style={{ color: "#006AFF" }} />
          Delivery ETA — Shipping Zones
        </h3>
        <p className="text-xs text-gray-500">
          ETA = Processing Time (1 day) + Zone Transit Time. Sellers can set
          their Warehouse Pincode in their dashboard.
        </p>
        <div className="space-y-2">
          {[
            {
              zone: "Local (Same City)",
              days: "1-2 Days",
              color: "#dcfce7",
              textColor: "#15803d",
              desc: "First 3 digits of pincode match",
            },
            {
              zone: "Zonal (Same State)",
              days: "2-3 Days",
              color: "#dbeafe",
              textColor: "#1d4ed8",
              desc: "Seller and buyer in same state",
            },
            {
              zone: "National (Rest of India)",
              days: "5-7 Days",
              color: "#f3f4f6",
              textColor: "#4b5563",
              desc: "Different state",
            },
          ].map((z) => (
            <div
              key={z.zone}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{z.zone}</p>
                <p className="text-xs text-gray-400">{z.desc}</p>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: z.color, color: z.textColor }}
              >
                {z.days}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
