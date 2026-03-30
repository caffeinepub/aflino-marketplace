import { Share } from "lucide-react";
import { useState } from "react";

const DISMISSED_KEY = "aflino_ios_banner_dismissed";

function isIOS(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator.userAgent.includes("iPhone") ||
      navigator.userAgent.includes("iPad")) &&
    !(
      "standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone
    )
  );
}

export default function IOSInstallBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === "true" || !isIOS(),
  );

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border shadow-lg p-3.5 flex items-start gap-3 bg-white"
      style={{ borderColor: "#006AFF" }}
      data-ocid="ios_install.panel"
    >
      <Share
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: "#006AFF" }}
      />
      <p className="text-sm text-gray-700 flex-1 leading-snug">
        <strong>Install AFLINO:</strong> Tap the{" "}
        <span className="inline-flex items-center">
          <Share className="w-3.5 h-3.5 mx-0.5" style={{ color: "#006AFF" }} />
        </span>{" "}
        share icon, then tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>{" "}
        for the best experience.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, "true");
          setDismissed(true);
        }}
        aria-label="Dismiss"
        data-ocid="ios_install.close_button"
        className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 -mt-0.5"
      >
        ×
      </button>
    </div>
  );
}
