import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

export default function NotificationEnableButton() {
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  if (!isSupported) return null;
  if (permission === "granted") return null;

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <BellOff className="w-3.5 h-3.5" />
        Notifications blocked in browser settings
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await requestPermission();
        setLoading(false);
      }}
      data-ocid="notifications.primary_button"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all"
      style={{ backgroundColor: "#006AFF" }}
    >
      <Bell className="w-4 h-4" />
      {loading ? "Enabling…" : "Enable Notifications"}
    </button>
  );
}
