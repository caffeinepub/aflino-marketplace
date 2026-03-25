import InvoiceButton from "@/components/InvoiceButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PINCODE_MAP,
  type SavedAddress,
  useAddresses,
} from "@/context/AddressContext";
import { useCart } from "@/context/CartContext";
import { useCustomerCoins } from "@/context/CustomerCoinContext";
import {
  type OrderStatus,
  useOrderTracking,
} from "@/context/OrderTrackingContext";
import { useProducts } from "@/context/ProductContext";
import { useReviews } from "@/context/ReviewContext";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  CheckCircle2,
  Coins,
  Edit2,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Mini 3-step order stepper ───
const MINI_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getMiniStep(status: OrderStatus): number {
  if (status === "Delivered") return 2;
  if (status === "Shipped" || status === "Out for Delivery") return 1;
  return 0; // Order Placed, Packed, Paid & Processing
}

function MiniStepper({ status }: { status: OrderStatus }) {
  const activeStep = getMiniStep(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {MINI_STEPS.map((step, i) => {
        const isDone = i <= activeStep;
        const isCurrent = i === activeStep;
        const isLast = i === MINI_STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${
                  isCurrent ? "ring-2 ring-offset-1" : ""
                }`}
                style={{
                  backgroundColor: isDone ? "#006AFF" : "#E5E7EB",
                  boxShadow: isCurrent
                    ? "0 0 0 3px rgba(0,106,255,0.2)"
                    : "none",
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className="text-[9px] font-medium whitespace-nowrap"
                style={{ color: isDone ? "#006AFF" : "#9CA3AF" }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className="h-0.5 flex-1 mx-1 rounded-full mb-4"
                style={{
                  backgroundColor: i < activeStep ? "#006AFF" : "#E5E7EB",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getStatusColor(status: OrderStatus): { bg: string; text: string } {
  if (status === "Delivered") return { bg: "#dcfce7", text: "#16a34a" };
  if (status === "Shipped" || status === "Out for Delivery")
    return { bg: "#dbeafe", text: "#2563eb" };
  return { bg: "#fef3c7", text: "#d97706" };
}

// ─── Indian states list ───
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Lakshadweep",
  "Andaman and Nicobar Islands",
];

// ─── Saved Addresses Tab ───
function SavedAddressesTab() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefault } =
    useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SavedAddress, "id">>({
    label: "Home",
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  function openNewForm() {
    setEditId(null);
    setForm({
      label: "Home",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setShowForm(true);
  }

  function openEditForm(addr: SavedAddress) {
    setEditId(addr.id);
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  }

  function handlePincodeChange(pincode: string) {
    setForm((prev) => {
      const lookup = PINCODE_MAP[pincode];
      return {
        ...prev,
        pincode,
        ...(pincode.length === 6 && lookup
          ? { city: lookup.city, state: lookup.state }
          : {}),
      };
    });
  }

  function handleSave() {
    if (
      !form.name ||
      !form.phone ||
      !form.addressLine1 ||
      !form.city ||
      !form.state ||
      !form.pincode
    )
      return;
    if (editId) {
      updateAddress(editId, form);
    } else {
      addAddress(form);
    }
    setShowForm(false);
    setEditId(null);
  }

  const labelColors: Record<string, { bg: string; text: string }> = {
    Home: { bg: "#dbeafe", text: "#1d4ed8" },
    Office: { bg: "#ede9fe", text: "#7c3aed" },
    Other: { bg: "#f3f4f6", text: "#374151" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Saved Addresses
          </h2>
          <p className="text-gray-500 text-sm">
            Manage your delivery addresses
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="addresses.add_new.button"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 mb-5"
            data-ocid="addresses.form.panel"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                {editId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Label */}
              <div>
                <label
                  htmlFor="addr-label"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Label
                </label>
                <select
                  id="addr-label"
                  value={form.label}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      label: e.target.value as SavedAddress["label"],
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.label.select"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Office">🏢 Office</option>
                  <option value="Other">📍 Other</option>
                </select>
              </div>
              {/* Name */}
              <div>
                <label
                  htmlFor="addr-name"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Full Name
                </label>
                <input
                  id="addr-name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Rahul Sharma"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.name.input"
                />
              </div>
              {/* Phone */}
              <div>
                <label
                  htmlFor="addr-phone"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Phone Number
                </label>
                <input
                  id="addr-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="9876543210"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.phone.input"
                />
              </div>
              {/* Pincode */}
              <div>
                <label
                  htmlFor="addr-pincode"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Pincode
                </label>
                <input
                  id="addr-pincode"
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="110001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.pincode.input"
                />
                {form.pincode.length === 6 && PINCODE_MAP[form.pincode] && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Auto-filled from pincode
                  </p>
                )}
              </div>
              {/* Address Line 1 */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="addr-line1"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Address Line 1
                </label>
                <input
                  id="addr-line1"
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, addressLine1: e.target.value }))
                  }
                  placeholder="House No., Street, Area"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.address_line1.input"
                />
              </div>
              {/* Address Line 2 */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="addr-line2"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  Address Line 2 (Optional)
                </label>
                <input
                  id="addr-line2"
                  type="text"
                  value={form.addressLine2}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, addressLine2: e.target.value }))
                  }
                  placeholder="Landmark, Locality"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.address_line2.input"
                />
              </div>
              {/* City */}
              <div>
                <label
                  htmlFor="addr-city"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  City
                </label>
                <input
                  id="addr-city"
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="New Delhi"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.city.input"
                />
              </div>
              {/* State */}
              <div>
                <label
                  htmlFor="addr-state"
                  className="text-xs font-semibold text-gray-600 mb-1 block"
                >
                  State
                </label>
                <select
                  id="addr-state"
                  value={form.state}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, state: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  data-ocid="addresses.state.select"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {/* Set as Default */}
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isDefault: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600"
                  data-ocid="addresses.set_default.checkbox"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default delivery address
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="addresses.save.button"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
                data-ocid="addresses.cancel.button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="addresses.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No saved addresses yet
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-xs">
            Add your first delivery address to get started.
          </p>
          <button
            type="button"
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: "#006AFF" }}
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="addresses.list">
          <AnimatePresence>
            {addresses.map((addr, i) => {
              const lc = labelColors[addr.label] ?? labelColors.Other;
              return (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  data-ocid={`addresses.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: lc.bg, color: lc.text }}
                        >
                          {addr.label === "Home"
                            ? "🏠"
                            : addr.label === "Office"
                              ? "🏢"
                              : "📍"}{" "}
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              backgroundColor: "#dcfce7",
                              color: "#166534",
                            }}
                          >
                            <Star className="w-3 h-3 fill-current" /> DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {addr.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {addr.phone}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      </p>
                      <p className="text-xs text-gray-600">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefault(addr.id)}
                          className="text-xs px-2.5 py-1 rounded-lg border font-semibold text-gray-600 border-gray-200 hover:bg-gray-50 whitespace-nowrap"
                          data-ocid={`addresses.set_default.button.${i + 1}`}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditForm(addr)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        data-ocid={`addresses.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        disabled={addr.isDefault && addresses.length === 1}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                        data-ocid={`addresses.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
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
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f6ff 0%, #deeaff 100%)",
                    }}
                  >
                    {categoryEmoji(product.category)}
                  </div>
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
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-green-50" : "bg-red-50"}`}
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

function MyReviewsTab() {
  const { reviews } = useReviews();
  const { products } = useProducts();
  const userId = "demo-customer";
  const myReviews = reviews.filter((r) => r.userId === userId);

  function getProductName(productId: string): string {
    const p = products.find((pr) => String(pr.id) === productId);
    return p?.title ?? `Product #${productId}`;
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Reviews</h2>
          <p className="text-gray-500 text-sm">
            Your submitted reviews and their moderation status
          </p>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#f0f6ff", color: "#006AFF" }}
        >
          {myReviews.length} {myReviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {myReviews.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="reviews.empty_state"
        >
          <MessageSquare className="w-14 h-14 text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No reviews yet
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            After purchasing a product and it is delivered, you can write a
            review to earn AFLINO Coins.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="reviews.list">
          <AnimatePresence>
            {myReviews.map((review, i) => (
              <motion.div
                key={review.reviewId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-4"
                data-ocid={`reviews.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {getProductName(review.productId)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-3.5 h-3.5"
                          fill={s <= review.rating ? "#006AFF" : "none"}
                          stroke={s <= review.rating ? "#006AFF" : "#d1d5db"}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  {review.status === "scheduled" && (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold animate-pulse flex-shrink-0"
                      style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
                      data-ocid={`reviews.status.${i + 1}`}
                    >
                      ⏳ Analyzing & publishing in ~
                      {review.scheduledAt
                        ? Math.max(
                            1,
                            Math.round(
                              (60 * 60 * 1000 -
                                (Date.now() - review.scheduledAt)) /
                                60000,
                            ),
                          )
                        : 60}{" "}
                      min
                    </span>
                  )}
                  {review.status === "flagged" && (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                      data-ocid={`reviews.status.${i + 1}`}
                    >
                      ⚠️ Under Review — Admin notified
                    </span>
                  )}
                  {review.status === "published" && (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                      data-ocid={`reviews.status.${i + 1}`}
                    >
                      ✅ Published
                    </span>
                  )}
                  {review.status === "pending" && (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                      data-ocid={`reviews.status.${i + 1}`}
                    >
                      ⏸ Pending Review
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {review.reviewText}
                </p>
                {review.photoUrls.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1.5">
                    📷 {review.photoUrls.length} photo
                    {review.photoUrls.length !== 1 ? "s" : ""} attached
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── NAV ITEMS CONFIG ───
type TabKey = "orders" | "wishlist" | "addresses" | "wallet" | "reviews";

const NAV_ITEMS: {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  activeStyle: React.CSSProperties;
}[] = [
  {
    key: "orders",
    label: "My Orders",
    icon: Package,
    activeStyle: { backgroundColor: "#f0f6ff", color: "#006AFF" },
  },
  {
    key: "wishlist",
    label: "My Wishlist",
    icon: Heart,
    activeStyle: { backgroundColor: "#fff0f8", color: "#EC008C" },
  },
  {
    key: "addresses",
    label: "Saved Addresses",
    icon: MapPin,
    activeStyle: { backgroundColor: "#f0fdf4", color: "#16a34a" },
  },
  {
    key: "wallet",
    label: "AFLINO Wallet",
    icon: Coins,
    activeStyle: { backgroundColor: "#fffbeb", color: "#d97706" },
  },
  {
    key: "reviews",
    label: "My Reviews",
    icon: MessageSquare,
    activeStyle: { backgroundColor: "#f0f6ff", color: "#006AFF" },
  },
];

// Parse "Mar 18, 2026" to a timestamp for sorting
function parseDateStr(dateStr: string): number {
  try {
    return new Date(dateStr).getTime();
  } catch {
    return 0;
  }
}

export default function CustomerDashboard({
  onCheckout,
  onTrackOrder,
  onNavigateToProduct,
}: {
  onCheckout?: () => void;
  onTrackOrder?: (orderId: string) => void;
  onNavigateToProduct?: (productId: number) => void;
}) {
  const { logout } = useRole();
  const { orders } = useOrderTracking();
  const { products } = useProducts();
  const { getSellerByEmail } = useSellerContext();
  const [activeTab, setActiveTab] = useState<TabKey>("orders");

  // Sort orders descending by date (latest first)
  const sortedOrders = [...orders].sort(
    (a, b) => parseDateStr(b.date) - parseDateStr(a.date),
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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors"
                style={isActive ? item.activeStyle : { color: "#6b7280" }}
                data-ocid={`customer.${item.key}.tab`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={isActive ? "font-semibold" : ""}>
                  {item.label}
                </span>
              </button>
            );
          })}

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
        <main className="flex-1 p-4 sm:p-8">
          {activeTab === "wallet" ? (
            <WalletTab />
          ) : activeTab === "reviews" ? (
            <MyReviewsTab />
          ) : activeTab === "wishlist" ? (
            <WishlistPage />
          ) : activeTab === "addresses" ? (
            <SavedAddressesTab />
          ) : (
            /* My Orders Tab */
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
                {sortedOrders.map((order, i) => {
                  const sellerProfile = getSellerByEmail(order.sellerEmail);
                  // Match product image by title
                  const matchedProduct = products.find(
                    (p) => p.title === order.product,
                  );
                  const productImage = matchedProduct?.images?.[0];
                  const productId = matchedProduct?.id;
                  const statusColor = getStatusColor(order.status);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5"
                      data-ocid={`orders.item.${i + 1}`}
                    >
                      {/* Order header */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {productImage ? (
                            <button
                              type="button"
                              onClick={() =>
                                productId !== undefined &&
                                onNavigateToProduct?.(productId)
                              }
                              className="block w-14 h-14 rounded-xl overflow-hidden border border-gray-100 hover:ring-2 hover:ring-blue-400 transition-all"
                              title="View product"
                              data-ocid={`orders.product_image.${i + 1}`}
                            >
                              <img
                                src={productImage}
                                alt={order.product}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-100">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              productId !== undefined &&
                              onNavigateToProduct?.(productId)
                            }
                            className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-blue-600 transition-colors text-left"
                            disabled={productId === undefined}
                            data-ocid={`orders.product_title.${i + 1}`}
                          >
                            {order.product}
                          </button>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.id} · {order.date}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="font-bold text-gray-800 text-sm">
                              {order.amount}
                            </span>
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                          <InvoiceButton
                            order={order}
                            sellerProfile={sellerProfile}
                          />
                          <button
                            type="button"
                            onClick={() => onTrackOrder?.(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#006AFF" }}
                            data-ocid={`orders.track_order.button.${i + 1}`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Track
                          </button>
                        </div>
                      </div>

                      {/* Mini 3-step stepper */}
                      <MiniStepper status={order.status} />

                      {/* Delivered actions */}
                      {order.status === "Delivered" && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() =>
                              productId !== undefined &&
                              onNavigateToProduct?.(productId)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-blue-50"
                            style={{ borderColor: "#006AFF", color: "#006AFF" }}
                            data-ocid={`orders.buy_again.button.${i + 1}`}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Buy Again
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-pink-50"
                            style={{ borderColor: "#EC008C", color: "#EC008C" }}
                            data-ocid={`orders.write_review.button.${i + 1}`}
                          >
                            <Star className="w-3 h-3" />
                            Write Review
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
