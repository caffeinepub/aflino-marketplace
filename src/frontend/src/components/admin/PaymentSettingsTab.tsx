import { Eye, EyeOff, Info, KeyRound, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { razorpayBackend } from "../../utils/razorpayBackend";

export default function PaymentSettingsTab() {
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
    </div>
  );
}
