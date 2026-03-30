import { usePWABranding } from "@/context/PWABrandingContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Check, Copy, Smartphone, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function PWABrandingSection() {
  const { appIconUrl, splashLogoUrl, setPWABranding } = usePWABranding();
  const { triggerOrderNotification } = usePushNotifications();
  const iconRef = useRef<HTMLInputElement>(null);
  const splashRef = useRef<HTMLInputElement>(null);
  const [vapid, setVapid] = useState(
    () => localStorage.getItem("aflino_vapid_public") || "",
  );
  const [copied, setCopied] = useState<"customer" | "seller" | null>(null);

  function handleFile(file: File, key: "appIconUrl" | "splashLogoUrl") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPWABranding({ [key]: url });
    };
    reader.readAsDataURL(file);
  }

  function saveVapid() {
    localStorage.setItem("aflino_vapid_public", vapid);
    toast.success("VAPID key saved.");
  }

  function copyInstallUrl(app: "customer" | "seller") {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/?app=${app}`);
    setCopied(app);
    setTimeout(() => setCopied(null), 2000);
    toast.success(
      `${app === "customer" ? "Customer" : "Seller"} install link copied!`,
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Upload Section ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: "#006AFF" }}
          >
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              PWA App Branding
            </h3>
            <p className="text-xs text-gray-500">
              Customize icons for both Customer and Seller apps.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          Recommended sizes: App Icon <strong>512×512px</strong>, Splash Logo{" "}
          <strong>200×80px</strong>. Changes saved immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label
              htmlFor="pwa-icon-upload"
              className="text-sm font-medium text-gray-700"
            >
              PWA App Icon (512×512)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={appIconUrl}
                alt="App Icon"
                className="w-16 h-16 rounded-xl border border-gray-200 object-cover flex-shrink-0"
              />
              <button
                type="button"
                onClick={() => iconRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                data-ocid="pwa.icon.upload_button"
              >
                <Upload className="w-4 h-4" /> Upload Icon
              </button>
              <input
                ref={iconRef}
                id="pwa-icon-upload"
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f, "appIconUrl");
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pwa-splash-upload"
              className="text-sm font-medium text-gray-700"
            >
              Splash Screen Logo (200×80)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={splashLogoUrl}
                alt="Splash Logo"
                className="w-16 h-16 rounded-xl border border-gray-200 object-cover flex-shrink-0"
              />
              <button
                type="button"
                onClick={() => splashRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                data-ocid="pwa.splash.upload_button"
              >
                <Upload className="w-4 h-4" /> Upload Splash
              </button>
              <input
                ref={splashRef}
                id="pwa-splash-upload"
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f, "splashLogoUrl");
                }}
              />
            </div>
          </div>
        </div>

        {/* Home Screen Preview */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-xs font-medium text-gray-500 self-start">
            Home Screen Preview
          </p>
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-2"
            style={{ backgroundColor: "#1a1a2e", width: 120 }}
          >
            <img
              src={appIconUrl}
              alt="App Icon Preview"
              className="w-14 h-14 rounded-xl shadow-lg"
            />
            <span className="text-white text-xs font-semibold tracking-tight">
              AFLINO
            </span>
          </div>
        </div>
      </div>

      {/* ── Maskable Icon Preview ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Android Adaptive Icon (Maskable) Preview
        </h3>
        <p className="text-xs text-gray-500">
          Android crops your icon to a circle. Ensure your logo is within the
          blue safe zone (80% of the icon area).
        </p>
        <div className="flex items-center gap-8 flex-wrap">
          {/* Customer */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <img
                src={appIconUrl}
                alt="Customer maskable"
                className="w-20 h-20 rounded-2xl object-cover"
              />
              {/* Safe zone circle overlay */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: "transparent",
                  border: "2px solid #006AFF",
                  borderRadius: "50%",
                  margin: "10%",
                  width: "80%",
                  height: "80%",
                }}
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              Customer App
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
              style={{ backgroundColor: "#006AFF" }}
            >
              Blue
            </span>
          </div>
          {/* Seller */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <img
                src="/assets/generated/aflino-seller-icon-192.dim_192x192.png"
                alt="Seller maskable"
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  border: "2px solid #EC008C",
                  borderRadius: "50%",
                  top: "10%",
                  left: "10%",
                  width: "80%",
                  height: "80%",
                }}
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              Seller App
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
              style={{ backgroundColor: "#EC008C" }}
            >
              Pink
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Blue circle = Android safe zone. Keep your logo centered within it.
        </p>
      </div>

      {/* ── Push Notification Settings ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Push Notification Settings
        </h3>
        <div className="space-y-2">
          <label
            htmlFor="vapid-key"
            className="text-xs font-medium text-gray-700"
          >
            VAPID Public Key (for Web Push)
          </label>
          <div className="flex gap-2">
            <input
              id="vapid-key"
              type="text"
              value={vapid}
              onChange={(e) => setVapid(e.target.value)}
              placeholder="BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA="
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              data-ocid="pwa.vapid.input"
            />
            <button
              type="button"
              onClick={saveVapid}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="pwa.vapid.save_button"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-400">
            For production push notifications, enter your VAPID public key from
            your push server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => triggerOrderNotification("TEST-001")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition"
          data-ocid="pwa.test_notification.primary_button"
        >
          🔔 Send Test Notification
        </button>
      </div>

      {/* ── App Install Identities ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          App Install Identities
        </h3>
        <p className="text-xs text-gray-500">
          Share these links to install the correct app. Each link loads the app
          with its own manifest and icon.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <div
            className="rounded-xl border-2 p-4 space-y-3"
            style={{ borderColor: "#006AFF" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="/assets/generated/aflino-icon-192.dim_192x192.png"
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  AFLINO Customer
                </p>
                <p className="text-xs text-gray-400">Shopping app</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-gray-500">
              <p>
                <span className="font-medium">start_url:</span> /?app=customer
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium">theme:</span>
                <span
                  className="w-4 h-4 rounded-full inline-block border"
                  style={{ backgroundColor: "#006AFF" }}
                />
                <span>#006AFF</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyInstallUrl("customer")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="pwa.customer_install.primary_button"
            >
              {copied === "customer" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied === "customer" ? "Copied!" : "Copy Install Link"}
            </button>
          </div>

          {/* Seller */}
          <div
            className="rounded-xl border-2 p-4 space-y-3"
            style={{ borderColor: "#EC008C" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="/assets/generated/aflino-seller-icon-192.dim_192x192.png"
                  alt="Seller"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  AFLINO Seller
                </p>
                <p className="text-xs text-gray-400">Store management</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-gray-500">
              <p>
                <span className="font-medium">start_url:</span> /?app=seller
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium">theme:</span>
                <span
                  className="w-4 h-4 rounded-full inline-block border"
                  style={{ backgroundColor: "#EC008C" }}
                />
                <span>#EC008C</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyInstallUrl("seller")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition"
              style={{ backgroundColor: "#EC008C" }}
              data-ocid="pwa.seller_install.primary_button"
            >
              {copied === "seller" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied === "seller" ? "Copied!" : "Copy Install Link"}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Tip: Share the Customer link on social media and the Seller link in
          your vendor onboarding emails.
        </p>
      </div>
    </div>
  );
}
