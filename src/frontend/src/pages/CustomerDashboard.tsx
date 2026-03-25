import InvoiceButton from "@/components/InvoiceButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCustomerCoins } from "@/context/CustomerCoinContext";
import {
  type OrderStatus,
  useOrderTracking,
} from "@/context/OrderTrackingContext";
import { useProducts } from "@/context/ProductContext";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Coins,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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

function WishlistPage() {
  const { wishlistIds, priceDroppedIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const wishlistProducts = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as (typeof products)[number][];

  function handleMoveToCart(product: (typeof products)[number]) {
    addToCart({
      productId: product.id,
      productTitle: product.title,
      price: product.price,
    });
    removeFromWishlist(product.id);
  }

  const categoryEmoji = (category: string) => {
    if (category === "Electronics") return "📱";
    if (category === "Fashion") return "👗";
    if (category === "Home & Kitchen") return "🏠";
    if (category === "Beauty") return "✨";
    return "📦";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Wishlist</h2>
          <p className="text-gray-500 text-sm">
            Items you love, saved for later
          </p>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#fff0f8", color: "#EC008C" }}
          data-ocid="wishlist.empty_state"
        >
          {wishlistProducts.length}{" "}
          {wishlistProducts.length === 1 ? "item" : "items"}
        </span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="wishlist.empty_state"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#fdf2f8" }}
          >
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            Save your favorite products here to keep track of things you love.
          </p>
          <Button
            type="button"
            className="text-white font-semibold"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="wishlist.start_shopping.button"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="wishlist.list">
          <AnimatePresence>
            {wishlistProducts.map((product, i) => {
              const hasPriceDrop = priceDroppedIds.has(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex items-center gap-4"
                  data-ocid={`wishlist.item.${i + 1}`}
                >
                  {/* Product image */}
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f6ff 0%, #deeaff 100%)",
                    }}
                  >
                    {categoryEmoji(product.category)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {hasPriceDrop && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                          }}
                        >
                          ↓ Price Drop!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      className="text-white text-sm px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#006AFF" }}
                      data-ocid={`wishlist.move_to_cart.button.${i + 1}`}
                    >
                      Move to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                      title="Remove from wishlist"
                      data-ocid={`wishlist.delete_button.${i + 1}`}
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "#EC008C" }}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function WalletTab() {
  const { getCoinBalance, getCoinHistory } = useCustomerCoins();
  const userId = "demo-customer";
  const balance = getCoinBalance(userId);
  const history = getCoinHistory(userId);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Wallet</h2>
          <p className="text-gray-500 text-sm">Your AFLINO Coins & rewards</p>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: "1.5px solid #fcd34d",
        }}
        data-ocid="wallet.balance.card"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#f59e0b" }}
        >
          <Coins className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
            AFLINO Coins Balance
          </p>
          <p className="text-4xl font-bold" style={{ color: "#d97706" }}>
            {balance.toLocaleString("en-IN")}
            <span className="text-base font-normal text-amber-600 ml-2">
              coins
            </span>
          </p>
          <p className="text-xs text-amber-700 mt-1">
            = ₹{balance.toLocaleString("en-IN")} discount available · 1 Coin =
            ₹1 INR
          </p>
        </div>
      </div>

      {/* How to earn */}
      <div
        className="rounded-xl p-4 mb-6 border border-blue-100"
        style={{ backgroundColor: "#f0f6ff" }}
      >
        <p className="text-xs font-bold text-blue-800 mb-2">
          How to earn AFLINO Coins
        </p>
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          Submit a review with photos →{" "}
          <span className="font-bold">5 coins per photo</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 mt-1">
          <Wallet className="w-3.5 h-3.5 text-blue-500" />
          Redeem coins at checkout →{" "}
          <span className="font-bold">1 coin = ₹1 off</span>
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="text-base font-bold text-gray-800 mb-3">Coin History</h3>
      {history.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="wallet.empty_state"
        >
          <Coins className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm font-medium">No coins yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Submit photo reviews to earn AFLINO Coins!
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="wallet.history.list">
          {history.map((tx, i) => (
            <div
              key={tx.txId}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              data-ocid={`wallet.history.item.${i + 1}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {tx.amount > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {tx.reason}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(tx.createdAt)}
                </p>
              </div>
              <span
                className="text-sm font-bold flex-shrink-0"
                style={{ color: tx.amount > 0 ? "#16a34a" : "#ef4444" }}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount} coins
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function CustomerDashboard({
  onCheckout,
}: { onCheckout?: () => void }) {
  const { logout } = useRole();
  const { orders } = useOrderTracking();
  const { getSellerByEmail } = useSellerContext();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "wallet">(
    "orders",
  );

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
            onClick={() => setActiveTab("orders")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors"
            style={
              activeTab === "orders"
                ? { backgroundColor: "#fff0f8", color: "#FF1B8D" }
                : { color: "#6b7280" }
            }
            data-ocid="customer.my_orders.tab"
          >
            <Package className="w-4 h-4" />
            My Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors"
            style={
              activeTab === "wishlist"
                ? {
                    backgroundColor: "#fff0f8",
                    color: "#EC008C",
                    fontWeight: 600,
                  }
                : { color: "#6b7280" }
            }
            data-ocid="customer.wishlist.tab"
          >
            <Heart
              className="w-4 h-4"
              style={
                activeTab === "wishlist"
                  ? { fill: "#EC008C", color: "#EC008C" }
                  : {}
              }
            />
            My Wishlist
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm mt-1 hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors"
            style={
              activeTab === "wallet"
                ? {
                    backgroundColor: "#fffbeb",
                    color: "#d97706",
                    fontWeight: 600,
                  }
                : { color: "#6b7280" }
            }
            data-ocid="customer.wallet.tab"
          >
            <Coins
              className="w-4 h-4"
              style={activeTab === "wallet" ? { color: "#d97706" } : {}}
            />
            My Wallet
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
          {activeTab === "wallet" ? (
            <WalletTab />
          ) : activeTab === "orders" ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                My Orders
              </h2>
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
          ) : (
            <WishlistPage />
          )}
        </main>
      </div>
    </div>
  );
}
