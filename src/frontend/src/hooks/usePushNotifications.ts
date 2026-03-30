import { useCallback, useEffect, useState } from "react";

const SUBSCRIBED_KEY = "aflino_push_subscribed";
const ICON = "/assets/generated/aflino-icon-192.dim_192x192.png";

export function usePushNotifications() {
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "denied",
  );
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem(SUBSCRIBED_KEY) === "true",
  );

  useEffect(() => {
    if (isSupported) setPermission(Notification.permission);
  }, [isSupported]);

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) return "denied";
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        localStorage.setItem(SUBSCRIBED_KEY, "true");
        setIsSubscribed(true);
        new Notification("AFLINO Notifications Enabled", {
          body: "You will now receive real-time alerts for orders, stock, and payouts.",
          icon: ICON,
        });
      }
      return perm;
    }, [isSupported]);

  const sendLocalNotification = useCallback(
    (title: string, body: string, url = "/") => {
      if (!isSupported || Notification.permission !== "granted") return;
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: ICON,
            badge: ICON,
            data: { url },
          });
        })
        .catch(() => {
          new Notification(title, { body, icon: ICON });
        });
    },
    [isSupported],
  );

  const triggerOrderNotification = useCallback(
    (orderId: string) => {
      sendLocalNotification(
        "🛒 New Order Received!",
        `Order ${orderId} has been placed. Prepare for dispatch.`,
        "/seller",
      );
    },
    [sendLocalNotification],
  );

  const triggerLowStockNotification = useCallback(
    (productName: string, count: number) => {
      sendLocalNotification(
        "⚠️ Low Stock Alert",
        `${productName} is running low — only ${count} unit${count === 1 ? "" : "s"} left.`,
        "/seller",
      );
    },
    [sendLocalNotification],
  );

  const triggerPayoutNotification = useCallback(
    (amount: string) => {
      sendLocalNotification(
        "💰 Payout Released!",
        `Your payout of ${amount} has been approved and is on its way.`,
        "/seller",
      );
    },
    [sendLocalNotification],
  );

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    sendLocalNotification,
    triggerOrderNotification,
    triggerLowStockNotification,
    triggerPayoutNotification,
  };
}
