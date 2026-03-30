import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, X } from "lucide-react";
import { useState } from "react";

interface InstallPWAButtonProps {
  /** When true, renders as a full-width card-style button for dashboard use */
  fullWidth?: boolean;
}

export default function InstallPWAButton({
  fullWidth = false,
}: InstallPWAButtonProps) {
  const { canInstall, isIOS, triggerInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!canInstall) return null;

  if (fullWidth) {
    return (
      <>
        <button
          type="button"
          onClick={isIOS ? () => setShowIOSModal(true) : triggerInstall}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="install.primary_button"
        >
          <Smartphone className="w-4 h-4" />
          Install AFLINO App
        </button>
        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={isIOS ? () => setShowIOSModal(true) : triggerInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
        style={{ backgroundColor: "#006AFF" }}
        data-ocid="install.button"
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
}

function IOSInstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        data-ocid="install.modal"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/aflino-icon-192.dim_192x192.png"
              alt="AFLINO"
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h3 className="font-bold text-gray-900">Install AFLINO</h3>
              <p className="text-xs text-gray-500">Add to Home Screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
            data-ocid="install.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            To install AFLINO on your iPhone:
          </p>
          <ol className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ backgroundColor: "#006AFF" }}
              >
                1
              </span>
              Tap the <strong className="text-gray-800">Share button</strong>{" "}
              <span className="text-base">⬜↑</span> at the bottom of Safari
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ backgroundColor: "#006AFF" }}
              >
                2
              </span>
              Scroll down and tap{" "}
              <strong className="text-gray-800">'Add to Home Screen'</strong>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ backgroundColor: "#006AFF" }}
              >
                3
              </span>
              Tap <strong className="text-gray-800">'Add'</strong> in the
              top-right corner
            </li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="install.confirm_button"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
