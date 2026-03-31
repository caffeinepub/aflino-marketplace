import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

const POPUP_KEY = "aflino_install_popup_shown";

export default function PWAInstallPopup() {
  const { canInstall, triggerInstall } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!canInstall || dismissed || !visible) return null;

  function handleInstall() {
    triggerInstall();
    localStorage.setItem(POPUP_KEY, "1");
    setDismissed(true);
  }

  function handleLater() {
    localStorage.setItem(POPUP_KEY, "1");
    setDismissed(true);
  }

  return (
    <div
      className="fixed z-50 bottom-6 right-6 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
      data-ocid="pwa_install.dialog"
    >
      {/* Blue accent top bar */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #006AFF, #EC008C)" }}
      />

      <div className="p-5">
        {/* Close button */}
        <button
          type="button"
          onClick={handleLater}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
          data-ocid="pwa_install.close_button"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wordmark */}
        <div className="text-xl font-bold mb-1">
          <span style={{ color: "#006AFF" }}>AFL</span>
          <span style={{ color: "#EC008C" }}>INO</span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Install AFLINO App
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Get a faster, app-like experience. Works offline too!
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="pwa_install.primary_button"
          >
            <Download className="w-4 h-4" />
            Install Now
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            data-ocid="pwa_install.cancel_button"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
