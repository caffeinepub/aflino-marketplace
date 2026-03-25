// Admin: update WHATSAPP_SUPPORT_NUMBER in Admin Panel > Settings > Support
const WHATSAPP_SUPPORT_NUMBER = "910000000000";

import { useOrderTracking } from "@/context/OrderTrackingContext";
import type { Order, OrderStatus } from "@/context/OrderTrackingContext";
import {
  CheckCircle,
  ChevronLeft,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  QrCode,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";

const STEPS: {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  {
    status: "Order Placed",
    label: "Order Placed",
    shortLabel: "Placed",
    icon: ShoppingCart,
  },
  { status: "Packed", label: "Packed", shortLabel: "Packed", icon: Package },
  { status: "Shipped", label: "Shipped", shortLabel: "Shipped", icon: Truck },
  {
    status: "Out for Delivery",
    label: "Out for Delivery",
    shortLabel: "Out for Del.",
    icon: MapPin,
  },
  {
    status: "Delivered",
    label: "Delivered",
    shortLabel: "Delivered",
    icon: CheckCircle,
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function getActiveIndex(status: OrderStatus): number {
  if (status === "Paid & Processing") return 0;
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function getCourierTrackUrl(partner: string, awb: string): string {
  const p = partner.toLowerCase();
  if (p.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${awb}`;
  }
  if (p.includes("bluedart") || p.includes("blue dart")) {
    return `https://www.bluedart.com/tracking?trackFor=0&trackNum=${awb}`;
  }
  if (p.includes("shiprocket")) {
    return `https://shiprocket.co/tracking/${awb}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${awb} tracking`)}`;
}

function Stepper({ status }: { status: OrderStatus }) {
  const activeIndex = getActiveIndex(status);

  return (
    <>
      {/* Desktop / tablet horizontal stepper */}
      <div className="hidden sm:flex items-start w-full">
        {STEPS.map((step, i) => {
          const isCompleted = i <= activeIndex;
          const isConnectorDone = i < activeIndex;
          const isLast = i === STEPS.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: isCompleted ? "#006AFF" : "#F3F4F6",
                    boxShadow: isCompleted
                      ? "0 0 0 4px rgba(0,106,255,0.15)"
                      : "none",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isCompleted ? "#fff" : "#9CA3AF" }}
                  />
                </div>
                <span
                  className="text-xs text-center leading-tight px-1"
                  style={{
                    color: isCompleted ? "#006AFF" : "#9CA3AF",
                    fontWeight: isCompleted ? 700 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="h-1 flex-1 mx-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isConnectorDone ? "#006AFF" : "#E5E7EB",
                    marginBottom: "20px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical stepper */}
      <div className="flex sm:hidden flex-col gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i <= activeIndex;
          const isConnectorDone = i < activeIndex;
          const isLast = i === STEPS.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-start gap-4">
              {/* Left: circle + vertical line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isCompleted ? "#006AFF" : "#F3F4F6",
                    boxShadow: isCompleted
                      ? "0 0 0 3px rgba(0,106,255,0.15)"
                      : "none",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isCompleted ? "#fff" : "#9CA3AF" }}
                  />
                </div>
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 my-1 rounded-full"
                    style={{
                      backgroundColor: isConnectorDone ? "#006AFF" : "#E5E7EB",
                      height: "32px",
                    }}
                  />
                )}
              </div>
              {/* Right: label */}
              <div className="pt-2 pb-4">
                <span
                  className="text-sm"
                  style={{
                    color: isCompleted ? "#006AFF" : "#9CA3AF",
                    fontWeight: isCompleted ? 700 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TrackOrderContent({
  order,
  onBack,
}: { order: Order; onBack: () => void }) {
  const isShippedOrLater = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ].includes(order.status);
  const isPacked = order.status === "Packed";
  const hasAwb = Boolean(order.awbNumber);
  const whatsappMsg = encodeURIComponent(
    `Hi AFLINO Support, I need help with my Order ID: ${order.id}.`,
  );
  const whatsappHref = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${whatsappMsg}`;
  const trackHref =
    hasAwb && order.courierPartner
      ? getCourierTrackUrl(order.courierPartner, order.awbNumber!)
      : "#";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
            data-ocid="track_order.back.button"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <span className="text-xl font-black tracking-tight select-none">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#EC008C" }}>INO</span>
          </span>
          <div className="w-16" />
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-2xl mx-auto px-4 py-6 space-y-4"
      >
        {/* Order title card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
          <p
            className="text-base font-bold mt-1"
            style={{ color: "#006AFF" }}
            data-ocid="track_order.order_id"
          >
            #{order.id}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Ordered on {order.date} &middot; {order.amount}
          </p>
        </div>

        {/* 5-Step Stepper */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6"
          data-ocid="track_order.stepper"
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-5">
            Delivery Progress
          </h2>
          <Stepper status={order.status} />
        </div>

        {/* Packed gatepass card */}
        {isPacked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="bg-blue-50 rounded-2xl border border-blue-200 p-4 flex items-start gap-3"
            data-ocid="track_order.gatepass.card"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Secure Digital Gatepass Ready
              </p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                Your secure digital gatepass is ready for the pickup agent. The
                courier will scan this when collecting your package.
              </p>
            </div>
          </motion.div>
        )}

        {/* Logistics card */}
        {isShippedOrLater && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            data-ocid="track_order.logistics.card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-4 h-4" style={{ color: "#006AFF" }} />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Shipment Details
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Courier Partner
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {order.courierPartner ?? "Courier Partner"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  AWB Number
                </p>
                <p
                  className="text-sm font-bold font-mono"
                  style={{ color: "#006AFF" }}
                >
                  {order.awbNumber ?? "Pending"}
                </p>
              </div>
            </div>

            {hasAwb ? (
              <a
                href={trackHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="track_order.external_track.button"
              >
                <ExternalLink className="w-4 h-4" />
                Track on {order.courierPartner ?? "External Site"}
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Tracking link will be active once the order is Shipped."
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                data-ocid="track_order.external_track.button"
              >
                <ExternalLink className="w-4 h-4" />
                Track on External Site
              </button>
            )}
          </motion.div>
        )}

        {/* Item summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          data-ocid="track_order.item_summary.card"
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Order Summary
          </h2>
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #f0f6ff 0%, #deeaff 100%)",
              }}
            >
              📦
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {order.product}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sold by: {order.sellerName}
              </p>
              {order.quantity && order.unitPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  Qty: {order.quantity} &times; ₹
                  {order.unitPrice.toLocaleString("en-IN")}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900 text-base">
                {order.amount}
              </p>
              <span
                className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                data-ocid="track_order.payment_badge"
              >
                PREPAID
              </span>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp support button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.15 }}
        >
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#25D366" }}
            data-ocid="track_order.whatsapp_support.button"
          >
            <MessageCircle className="w-5 h-5" />
            Need Help? Chat on WhatsApp
          </a>
          <p className="text-center text-xs text-gray-400 mt-2">
            Pre-filled with Order ID: {order.id}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function TrackOrderPage({
  orderId,
  onBack,
}: { orderId: string; onBack: () => void }) {
  const { orders } = useOrderTracking();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-800 mb-2">
            Order Not Found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            We couldn't find an order with ID:{" "}
            <span className="font-mono font-semibold text-gray-700">
              {orderId}
            </span>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="track_order.back.button"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <TrackOrderContent order={order} onBack={onBack} />;
}
