import type { Order } from "@/context/OrderTrackingContext";
import { type InvoiceData, generateInvoicePDF } from "@/utils/generateInvoice";
import { CheckCircle2, Download, Home, Package } from "lucide-react";
import { useEffect } from "react";
import { logEmail } from "../utils/communicationLogger";

interface Props {
  order: Order;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export default function OrderSuccessPage({
  order,
  onViewOrders,
  onContinueShopping,
}: Props) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    logEmail(
      "order_confirmation",
      order.sellerEmail || "customer@aflino.com",
      `Order Confirmed - #${order.id} | AFLINO Local`,
      order.id,
    );
  }, [order.id]);

  function handleDownloadInvoice() {
    const invoiceNum = `INV-${order.date.replace(/[^a-zA-Z0-9]/g, "")}-${order.id.replace("ORD-", "")}`;
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const data: InvoiceData = {
      sellerName: order.sellerName,
      sellerAddress: order.sellerAddress || "AFLINO Marketplace, India",
      sellerState: order.sellerState || "Maharashtra",
      sellerGstin: order.sellerGstin || "27AABCU9603R1ZM",
      sellerPan: order.sellerPan || "AABCU9603R",
      isLocalSeller: false,

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "#E8F8F0" }}
          data-ocid="order_success.success_state"
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: "#16A34A" }} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 text-sm mb-5">
          Thank you for shopping with AFLINO.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-800">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-bold" style={{ color: "#006AFF" }}>
              {order.amount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold text-emerald-600">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-700">{order.date}</span>
          </div>
        </div>

        {/* Download Invoice Button - prominent */}
        <button
          type="button"
          onClick={handleDownloadInvoice}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-md mb-2"
          style={{ background: "#006AFF" }}
          data-ocid="order_success.invoice_button"
        >
          <Download className="w-5 h-5" />
          Download Your GST Invoice
        </button>
        <p className="text-xs text-gray-400 mb-5">
          GST-compliant tax invoice (PDF)
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onViewOrders}
            className="w-full py-3 rounded-2xl font-semibold text-sm border-2 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            style={{ borderColor: "#006AFF", color: "#006AFF" }}
            data-ocid="order_success.view_orders_button"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </button>
          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full py-3 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: "#FF1B8D" }}
            data-ocid="order_success.continue_shopping_button"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        A confirmation is available in My Orders section.
      </p>
    </div>
  );
}
