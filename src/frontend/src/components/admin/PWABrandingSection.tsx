import { usePWABranding } from "@/context/PWABrandingContext";
import { Smartphone, Upload } from "lucide-react";
import { useRef } from "react";

export default function PWABrandingSection() {
  const { appIconUrl, splashLogoUrl, setPWABranding } = usePWABranding();
  const iconRef = useRef<HTMLInputElement>(null);
  const splashRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File, key: "appIconUrl" | "splashLogoUrl") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPWABranding({ [key]: url });
    };
    reader.readAsDataURL(file);
  }

  return (
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
            Customize the icon that appears on users&#39; home screens when they
            install AFLINO.
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
        Recommended sizes: App Icon <strong>512×512px</strong>, Splash Logo{" "}
        <strong>200×80px</strong>. Changes are saved immediately to
        localStorage.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* App Icon */}
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
              <Upload className="w-4 h-4" />
              Upload Icon
            </button>
            <input
              ref={iconRef}
              id="pwa-icon-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, "appIconUrl");
              }}
            />
          </div>
        </div>

        {/* Splash Logo */}
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
              <Upload className="w-4 h-4" />
              Upload Splash
            </button>
            <input
              ref={splashRef}
              id="pwa-splash-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, "splashLogoUrl");
              }}
            />
          </div>
        </div>
      </div>

      {/* Phone mock preview */}
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
  );
}
