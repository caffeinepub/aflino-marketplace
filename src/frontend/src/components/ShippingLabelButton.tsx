import {
  type ShippingLabelData,
  generateShippingLabel,
} from "@/utils/generateShippingLabel";
import { Printer } from "lucide-react";

interface Props {
  order: Omit<ShippingLabelData, "logoDataUrl">;
}

export default function ShippingLabelButton({ order }: Props) {
  const handlePrint = () => {
    const logoDataUrl = localStorage.getItem("aflino_brand_logo") ?? undefined;
    generateShippingLabel({ ...order, logoDataUrl });
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-400 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors"
      data-ocid="seller.orders.print_label"
    >
      <Printer className="w-3.5 h-3.5" />
      Print Label
    </button>
  );
}
