import { useActor } from "@/hooks/useActor";
import {
  generateAWBPlaceholder,
  getConfiguredCourier,
} from "@/utils/courierMapping";
import {
  type ShippingLabelData,
  generateShippingLabel,
} from "@/utils/generateShippingLabel";
import { encryptTrackingPayload } from "@/utils/qrEncryption";
import { Loader2, Printer } from "lucide-react";
import { useState } from "react";

interface Props {
  order: Omit<
    ShippingLabelData,
    "logoDataUrl" | "encryptedTrackingData" | "courierName" | "awbNumber"
  >;
  isIndiaPost?: boolean;
  customerPhone?: string;
  customerFullAddress?: string;
}

export default function ShippingLabelButton({
  order,
  isIndiaPost,
  customerPhone,
  customerFullAddress,
}: Props) {
  const { actor } = useActor();
  const [generating, setGenerating] = useState(false);

  const handlePrint = async () => {
    setGenerating(true);
    try {
      const logoDataUrl =
        localStorage.getItem("aflino_brand_logo") ?? undefined;

      // Try to get encrypted tracking data
      let encryptedTrackingData: string | undefined;
      if (customerPhone && customerFullAddress && actor) {
        try {
          const actorAny = actor as any;
          if (typeof actorAny.getAesKey === "function") {
            const aesKey: string = await actorAny.getAesKey();
            if (aesKey && aesKey.length === 64) {
              encryptedTrackingData = await encryptTrackingPayload(
                customerPhone,
                customerFullAddress,
                aesKey,
              );
            }
          }
        } catch {
          // Encryption failed — proceed without it
        }
      }

      // Get configured courier
      const courier = getConfiguredCourier();
      const courierName = courier?.name;
      const awbNumber = courier
        ? generateAWBPlaceholder(courier, order.orderId)
        : undefined;

      await generateShippingLabel({
        ...order,
        logoDataUrl,
        encryptedTrackingData,
        courierName,
        awbNumber,
        isIndiaPost,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={generating}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-400 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      data-ocid="seller.orders.print_label"
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Printer className="w-3.5 h-3.5" />
      )}
      {generating ? "Generating..." : "Print Label"}
    </button>
  );
}
