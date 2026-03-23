import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import { Heart, LogOut, Package, ShoppingBag, Truck } from "lucide-react";
import { motion } from "motion/react";

const orders = [
  {
    id: "ORD-10482",
    product: "Wireless Bluetooth Headphones",
    date: "Mar 18, 2026",
    status: "Delivered",
    amount: "₹2,499",
  },
  {
    id: "ORD-10391",
    product: "Men's Running Shoes – Size 42",
    date: "Mar 12, 2026",
    status: "In Transit",
    amount: "₹3,199",
  },
  {
    id: "ORD-10267",
    product: "Stainless Steel Water Bottle 1L",
    date: "Mar 5, 2026",
    status: "Processing",
    amount: "₹649",
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  Delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
  },
  "In Transit": { label: "In Transit", className: "bg-blue-100 text-blue-700" },
  Processing: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-700",
  },
};

export default function CustomerDashboard() {
  const { logout } = useRole();

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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm"
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
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center justify-between gap-4"
                  data-ocid={`orders.item.${i + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-gray-400" />
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
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-semibold text-gray-700 text-sm">
                      {order.amount}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusConfig[order.status].className
                      }`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
