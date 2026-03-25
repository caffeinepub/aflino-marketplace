import InvoiceButton from "@/components/InvoiceButton";
import { Button } from "@/components/ui/button";
import {
  type OrderStatus,
  useOrderTracking,
} from "@/context/OrderTrackingContext";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import {
  CheckCircle,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] =
  [
    { status: "Order Placed", label: "Order Placed", icon: ShoppingCart },
    { status: "Packed", label: "Packed", icon: Package },
    { status: "Shipped", label: "Shipped", icon: Truck },
    { status: "Out for Delivery", label: "Out for Delivery", icon: MapPin },
    { status: "Delivered", label: "Delivered", icon: CheckCircle },
  ];

const STATUS_ORDER: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function getStepIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status);
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = getStepIndex(status);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-start justify-between gap-1">
        {STEPS.map((step, i) => {
          const isCompleted = i <= activeIndex;
          const isLast = i === STEPS.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 min-w-[52px]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: isCompleted ? "#FF1B8D" : "#F3F4F6",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isCompleted ? "#fff" : "#9CA3AF" }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{
                    color: isCompleted ? "#FF1B8D" : "#9CA3AF",
                    fontWeight: isCompleted ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="h-0.5 flex-1 mx-1 rounded-full transition-all"
                  style={{
                    backgroundColor: i < activeIndex ? "#FF1B8D" : "#E5E7EB",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CustomerDashboard({
  onCheckout,
}: { onCheckout?: () => void }) {
  const { logout } = useRole();
  const { orders } = useOrderTracking();
  const { getSellerByEmail } = useSellerContext();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <span className="text-xl font-bold">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#FF1B8D" }}>INO</span>
          </span>
          <p className="text-xs text-gray-400 mt-1">Customer Portal</p>
        </div>
        <nav className="flex-1 p-4">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-pink-50 font-medium text-sm"
            style={{ color: "#FF1B8D" }}
            data-ocid="customer.my_orders.tab"
          >
            <Package className="w-4 h-4" />
            My Orders
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm mt-1 hover:bg-gray-50 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm mt-1 hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </button>
          {onCheckout && (
            <button
              type="button"
              onClick={onCheckout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white text-sm mt-2 font-semibold transition-colors"
              style={{ background: "#006AFF" }}
              data-ocid="customer.checkout.button"
            >
              <ShoppingCart className="w-4 h-4" />
              Checkout
            </button>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Customer Dashboard
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-sm"
            data-ocid="customer.logout.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h2>
            <p className="text-gray-500 text-sm mb-6">
              Track and manage your recent orders
            </p>

            <div className="space-y-4">
              {orders.map((order, i) => {
                const sellerProfile = getSellerByEmail(order.sellerEmail);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.07 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-xs p-5"
                    data-ocid={`orders.item.${i + 1}`}
                  >
                    {/* Order header row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#FFF0F6" }}
                        >
                          <Truck
                            className="w-5 h-5"
                            style={{ color: "#FF1B8D" }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {order.product}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.id} &middot; {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-semibold text-gray-700 text-sm">
                          {order.amount}
                        </span>
                        <InvoiceButton
                          order={order}
                          sellerProfile={sellerProfile}
                        />
                      </div>
                    </div>

                    {/* Tracking timeline */}
                    <OrderTimeline status={order.status} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
