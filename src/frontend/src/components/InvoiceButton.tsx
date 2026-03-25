import type { Order } from "@/context/OrderTrackingContext";
import type { PendingSeller } from "@/context/SellerContext";
import { type InvoiceData, generateInvoicePDF } from "@/utils/generateInvoice";
import { FileDown } from "lucide-react";

interface Props {
  order: Order;
  sellerProfile?: PendingSeller;
}

export default function InvoiceButton({ order, sellerProfile }: Props) {
  const handleDownload = () => {
    const invoiceNum = `INV-${order.date.replace(/[^a-zA-Z0-9]/g, "")}-${order.id.replace("ORD-", "")}`;
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const isLocalSeller = sellerProfile?.sellerType === "enrollmentId";
    const data: InvoiceData = {
      sellerName: sellerProfile?.businessName || order.sellerName,
      sellerAddress:
        order.sellerAddress ||
        sellerProfile?.fullAddress ||
        "Address not available",
      sellerState: order.sellerState || sellerProfile?.state || "Maharashtra",
      sellerGstin: isLocalSeller
        ? sellerProfile?.enrollmentId || "ENR-LOCAL"
        : order.sellerGstin || sellerProfile?.gstin || "27AABCU9603R1ZM",
      sellerPan: order.sellerPan || sellerProfile?.pan || "AABCU9603R",
      isLocalSeller,

      buyerName: order.buyerName || "Customer",
      buyerAddress: order.buyerAddress || "Address not available",
      buyerState: order.buyerState || "Maharashtra",
      buyerPincode: order.buyerPincode || "400001",

      orderId: order.id,
      orderDate: order.date,
      invoiceNumber: invoiceNum,
      invoiceDate: today,

      productName: order.product,
      hsnCode: order.hsnCode || "8517",
      unitPrice: order.unitPrice || order.amountRaw,
      quantity: order.quantity || 1,
      discount: order.discount || 0,
      gstRate: order.gstRate || 18,
    };

    generateInvoicePDF(data);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
      style={{
        color: "#006AFF",
        borderColor: "#006AFF",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "#EEF4FF";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent";
      }}
      data-ocid="invoice.download.button"
      title="Download Invoice PDF"
    >
      <FileDown className="w-3.5 h-3.5" />
      Invoice
    </button>
  );
}
