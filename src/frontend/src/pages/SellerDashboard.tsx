import GatepassQR from "@/components/GatepassQR";
import InvoiceButton from "@/components/InvoiceButton";
import {
  type AdvancedFormState,
  ProductAdvancedSections,
  SwatchImageUpload,
  initialAdvancedState,
} from "@/components/ProductAdvancedSections";
import ShippingLabelButton from "@/components/ShippingLabelButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  type OrderStatus,
  useOrderTracking,
} from "@/context/OrderTrackingContext";
import { useProducts } from "@/context/ProductContext";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWallet } from "@/context/WalletContext";
import {
  AlertCircle,
  BarChart3,
  ClipboardList,
  Clock,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { logWhatsApp } from "../utils/communicationLogger";

type Tab = "upload" | "wallet" | "orders";

interface Props {
  sellerEmail?: string;
}

interface VariantRow {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
  sku: string;
  swatchImage: string;
}

function formatRupee(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

const ORDER_STATUSES: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const statusPillStyle: Record<OrderStatus, string> = {
  "Order Placed": "bg-yellow-100 text-yellow-700",
  Packed: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  "Paid & Processing": "bg-blue-100 text-blue-700",
};

function newVariantRow(): VariantRow {
  return {
    id: Math.random().toString(36).slice(2),
    size: "",
    color: "",
    colorHex: "#000000",
    price: "",
    stock: "",
    sku: "",
    swatchImage: "",
  };
}

export default function SellerDashboard({
  sellerEmail = "techzone@aflino.com",
}: Props) {
  const { logout } = useRole();
  const { isApproved, getSellerByEmail, updateSellerType } = useSellerContext();
  const {
    commissionRate,
    walletEntries,
    payoutRequests,
    payoutHistory,
    minPayoutAmount,
    getSellerAvailableBalance,
    getSellerPendingBalance,
    requestPayout,
    getCategoryRate,
  } = useWallet();
  const { orders, updateOrderStatus } = useOrderTracking();
  const { addProduct } = useProducts();

  const approved = isApproved(sellerEmail);
  const sellerProfile = getSellerByEmail(sellerEmail);
  const isLocalSeller = sellerProfile?.sellerType === "enrollmentId";
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [gatepassOrderId, setGatepassOrderId] = useState<string | null>(null);
  const [upgradeGstin, setUpgradeGstin] = useState("");
  const [upgradePan, setUpgradePan] = useState("");

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([
    newVariantRow(),
  ]);
  const [advancedState, setAdvancedState] = useState<AdvancedFormState>(
    initialAdvancedState(),
  );

  const availableBalance = getSellerAvailableBalance(sellerEmail);
  const pendingBalance = getSellerPendingBalance(sellerEmail);
  const sellerOrders = walletEntries.filter(
    (o) => o.sellerEmail === sellerEmail,
  );
  const sellerHistory = payoutHistory.filter(
    (p) => p.sellerEmail === sellerEmail,
  );
  const hasPendingRequest = payoutRequests.some(
    (r) => r.sellerEmail === sellerEmail && r.status === "pending",
  );
  const totalEarned = sellerOrders.reduce((s, e) => s + e.netEarning, 0);
  const totalPaidOut = sellerHistory.reduce((s, h) => s + h.paidAmount, 0);

  function addVariantRow() {
    setVariantRows((prev) => [...prev, newVariantRow()]);
  }

  function removeVariantRow(id: string) {
    setVariantRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateVariantRow(
    id: string,
    field: keyof VariantRow,
    value: string,
  ) {
    setVariantRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  const handleUpload = () => {
    if (productName.length > 110) {
      toast.error("Product title must be 110 characters or less");
      return;
    }
    if (!productName || !category) {
      toast.error("Please fill in Product Title and Category");
      return;
    }
    if (!variantsEnabled && (!price || !stock)) {
      toast.error("Please fill in Price and Stock");
      return;
    }
    if (variantsEnabled && variantRows.length === 0) {
      toast.error("Add at least one variant or disable variants");
      return;
    }
    const variantSummary =
      variantsEnabled && variantRows.length > 0
        ? ` with ${variantRows.length} variant${variantRows.length > 1 ? "s" : ""}`
        : "";
    toast.success(
      `Product "${productName}" uploaded successfully${variantSummary}!`,
    );
    addProduct({
      id: Date.now(),
      title: productName,
      category:
        (
          {
            electronics: "Electronics",
            fashion: "Fashion",
            home: "Home & Kitchen",
            beauty: "Beauty",
            sports: "Sports",
            books: "Books",
          } as Record<string, string>
        )[category] || category,
      price:
        Number.parseFloat(price) ||
        (variantRows[0] ? Number.parseFloat(variantRows[0].price) || 0 : 0),
      description,
      stock: 50,
      rating: 4.0,
      seller: "Seller Store",
      images: [],
      videoUrl: advancedState.videoUrl || undefined,
      weight: Number.parseFloat(advancedState.weight) || undefined,
      weightUnit: advancedState.weightUnit,
      brandName: advancedState.brandName || undefined,
      countryOfOrigin: advancedState.countryOfOrigin || undefined,
      gstRate: advancedState.gstRate
        ? (Number.parseInt(advancedState.gstRate) as 5 | 12 | 18 | 28)
        : undefined,
      hsnCode: advancedState.hsnCode || undefined,
      manufacturerDetails: advancedState.manufacturerDetails || undefined,
      whatInTheBox: advancedState.whatInTheBox,
      variants: variantsEnabled
        ? variantRows.map((r) => ({
            id: r.id,
            label: r.size
              ? `${r.size}${r.color ? ` + ${r.color}` : ""}`
              : r.color,
            size: r.size,
            color: r.color,
            colorHex: r.colorHex,
            price: Number.parseFloat(r.price) || 0,
            stock: Number.parseInt(r.stock) || 0,
            sku: r.sku || undefined,
            swatchImage: r.swatchImage || undefined,
          }))
        : [],
    });
    setProductName("");
    setCategory("");
    setPrice("");
    setStock("");
    setDescription("");
    setVariantsEnabled(false);
    setVariantRows([newVariantRow()]);
    setAdvancedState(initialAdvancedState());
  };

  const handlePayoutRequest = () => {
    if (hasPendingRequest) {
      toast.error("A payout request is already pending review.");
      return;
    }
    if (availableBalance < minPayoutAmount) {
      toast.error(`Minimum payout amount is ${formatRupee(minPayoutAmount)}`);
      return;
    }
    requestPayout(sellerEmail, "TechZone Store");
    toast.success("Payout request submitted successfully!");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <span className="text-xl font-bold">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#FF1B8D" }}>INO</span>
          </span>
          <p className="text-xs text-gray-400 mt-1">Seller Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "upload"
                ? "bg-pink-50 text-pink-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="seller.product_upload.tab"
          >
            <Package className="w-4 h-4" />
            Product Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "wallet"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="seller.wallet.tab"
          >
            <Wallet className="w-4 h-4" />
            Wallet & Earnings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "orders"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="seller.orders.tab"
          >
            <ClipboardList className="w-4 h-4" />
            Orders
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            My Products
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Seller Dashboard
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-sm"
            data-ocid="seller.logout.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <main className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "upload" && (
              <>
                {!approved && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                    data-ocid="seller.pending.panel"
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">
                        Approval Pending
                      </p>
                      <p className="text-xs text-yellow-600 mt-0.5">
                        Your seller account is awaiting admin approval. Product
                        uploads will be enabled once approved.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Product Upload
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Add a new product to your store
                  </p>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="productName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Product Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productName"
                        placeholder="e.g. Wireless Bluetooth Headphones"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        disabled={!approved}
                        maxLength={110}
                        data-ocid="seller.product_name.input"
                      />
                      <p
                        className="text-xs text-right"
                        style={{
                          color:
                            productName.length > 100 ? "#ef4444" : "#9ca3af",
                        }}
                      >
                        {productName.length}/110
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                        disabled={!approved}
                      >
                        <SelectTrigger data-ocid="seller.category.select">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="home">Home & Kitchen</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="price"
                          className={`text-sm font-medium ${
                            variantsEnabled ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Price (₹){" "}
                          {!variantsEnabled && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder={
                            variantsEnabled ? "Set per variant" : "0.00"
                          }
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={!approved || variantsEnabled}
                          className={
                            variantsEnabled ? "bg-gray-50 text-gray-400" : ""
                          }
                          data-ocid="seller.price.input"
                        />
                        {variantsEnabled && (
                          <p className="text-xs text-gray-400">
                            Prices set per variant
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="stock"
                          className={`text-sm font-medium ${
                            variantsEnabled ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Stock (qty){" "}
                          {!variantsEnabled && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          placeholder={
                            variantsEnabled ? "Set per variant" : "e.g. 50"
                          }
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          disabled={!approved || variantsEnabled}
                          className={
                            variantsEnabled ? "bg-gray-50 text-gray-400" : ""
                          }
                          data-ocid="seller.stock.input"
                        />
                        {variantsEnabled && (
                          <p className="text-xs text-gray-400">
                            Stock set per variant
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product…"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!approved}
                        data-ocid="seller.description.textarea"
                      />
                    </div>

                    {/* Variants Section */}
                    <div className="border-t border-gray-100 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Product Variants
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Optional — for products with Size / Color options
                          </p>
                        </div>
                        <Switch
                          id="variants-toggle"
                          checked={variantsEnabled}
                          onCheckedChange={setVariantsEnabled}
                          disabled={!approved}
                          className="data-[state=checked]:bg-[#006AFF]"
                          data-ocid="seller.variants.switch"
                        />
                      </div>

                      {variantsEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {/* Variant Rows */}
                          {variantRows.map((row, i) => (
                            <div
                              key={row.id}
                              className="grid gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                              style={{
                                gridTemplateColumns:
                                  "80px 1fr 32px 36px 70px 90px 80px 32px",
                              }}
                              data-ocid={`seller.variants.item.${i + 1}`}
                            >
                              {/* Size */}
                              <Input
                                placeholder="Size"
                                value={row.size}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "size",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid="seller.variant_size.input"
                              />
                              {/* Color Name */}
                              <Input
                                placeholder="Color name"
                                value={row.color}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "color",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid="seller.variant_color.input"
                              />
                              {/* Color Picker */}
                              <input
                                type="color"
                                value={row.colorHex}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "colorHex",
                                    e.target.value,
                                  )
                                }
                                className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                                title="Pick color"
                              />
                              {/* SKU */}
                              <Input
                                placeholder="SKU"
                                value={row.sku}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "sku",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid="seller.variant_sku.input"
                              />
                              {/* Swatch Image */}
                              <SwatchImageUpload
                                swatchImage={row.swatchImage || undefined}
                                onUpload={(base64) =>
                                  updateVariantRow(
                                    row.id,
                                    "swatchImage",
                                    base64,
                                  )
                                }
                              />
                              {/* Price */}
                              <Input
                                type="number"
                                placeholder="₹ Price"
                                value={row.price}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid="seller.variant_price.input"
                              />
                              {/* Stock */}
                              <Input
                                type="number"
                                placeholder="Stock"
                                value={row.stock}
                                onChange={(e) =>
                                  updateVariantRow(
                                    row.id,
                                    "stock",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid="seller.variant_stock.input"
                              />
                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeVariantRow(row.id)}
                                className="h-8 w-8 flex items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                data-ocid={`seller.variants.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Column Labels */}
                          {variantRows.length > 0 && (
                            <div
                              className="grid gap-2 px-3 -mt-1"
                              style={{
                                gridTemplateColumns:
                                  "80px 1fr 32px 36px 70px 90px 80px 32px",
                              }}
                            >
                              <p className="text-xs text-gray-400">Size</p>
                              <p className="text-xs text-gray-400">Color</p>
                              <p className="text-xs text-gray-400">Hex</p>
                              <p className="text-xs text-gray-400">Swatch</p>
                              <p className="text-xs text-gray-400">SKU</p>
                              <p className="text-xs text-gray-400">Price (₹)</p>
                              <p className="text-xs text-gray-400">Stock</p>
                              <span />
                            </div>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariantRow}
                            className="gap-1.5 text-xs border-dashed"
                            style={{ borderColor: "#006AFF", color: "#006AFF" }}
                            data-ocid="seller.variants.add_button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Variant
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Advanced Sections A-E */}
                    {approved && (
                      <ProductAdvancedSections
                        state={advancedState}
                        onChange={(patch) =>
                          setAdvancedState((prev) => ({ ...prev, ...patch }))
                        }
                        sellingPrice={Number.parseFloat(price) || 0}
                        commissionRate={getCategoryRate(category)}
                        variantMinPrice={
                          variantsEnabled && variantRows.length > 0
                            ? Math.min(
                                ...variantRows
                                  .map((r) => Number.parseFloat(r.price) || 0)
                                  .filter(Boolean),
                              )
                            : undefined
                        }
                      />
                    )}

                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={!approved}
                      className="w-full gap-2 text-white font-semibold"
                      style={{
                        backgroundColor: approved ? "#006AFF" : undefined,
                      }}
                      data-ocid="seller.upload.submit_button"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Product
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Upgrade to GSTIN banner - shown for local sellers in any tab */}
            {isLocalSeller && sellerProfile && (
              <div
                className="mb-4 rounded-xl border-2 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ borderColor: "#006AFF", backgroundColor: "#EEF4FF" }}
                data-ocid="seller.upgrade_gstin.panel"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "#006AFF" }}>
                    🌐 Upgrade to GSTIN for Pan-India Selling
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Currently selling only in {sellerProfile.state}. Add your
                    GSTIN to reach customers across India.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="GSTIN (e.g. 22AAAAA0000A1Z5)"
                      value={upgradeGstin}
                      onChange={(e) =>
                        setUpgradeGstin(e.target.value.toUpperCase())
                      }
                      className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                      data-ocid="seller.upgrade_gstin.input"
                    />
                    <input
                      type="text"
                      placeholder="PAN (e.g. AAAAA0000A)"
                      value={upgradePan}
                      onChange={(e) =>
                        setUpgradePan(e.target.value.toUpperCase())
                      }
                      className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                      data-ocid="seller.upgrade_pan.input"
                    />
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: "#006AFF" }}
                      onClick={() => {
                        if (!upgradeGstin.trim() || !upgradePan.trim()) {
                          toast.error("Please enter both GSTIN and PAN");
                          return;
                        }
                        updateSellerType(sellerProfile.id, "gstin");
                        toast.success(
                          "Successfully upgraded to GSTIN! Your products are now visible Pan-India.",
                        );
                        setUpgradeGstin("");
                        setUpgradePan("");
                      }}
                      data-ocid="seller.upgrade_gstin.submit_button"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Wallet & Earnings
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Viewing as: TechZone Store
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Track your earnings and manage payouts
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Card 1 - Total Earned */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#EBF3FF" }}
                    >
                      <TrendingUp
                        className="w-5 h-5"
                        style={{ color: "#006AFF" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                        Total Earned
                      </p>
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {formatRupee(totalEarned)}
                      </p>
                    </div>
                  </div>
                  {/* Card 2 - Pending Balance */}
                  <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                        Pending
                      </p>
                      <p className="text-lg font-bold text-amber-600 truncate">
                        {formatRupee(pendingBalance)}
                      </p>
                      <p className="text-xs text-gray-400">15-day hold</p>
                    </div>
                  </div>
                  {/* Card 3 - Available Balance */}
                  <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                        Available
                      </p>
                      <p className="text-lg font-bold text-green-600 truncate">
                        {formatRupee(availableBalance)}
                      </p>
                      <p className="text-xs text-gray-400">Ready to withdraw</p>
                    </div>
                  </div>
                  {/* Card 4 - Total Paid Out */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <Wallet className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                        Total Paid Out
                      </p>
                      <p className="text-lg font-bold text-gray-700 truncate">
                        {formatRupee(totalPaidOut)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
                  <span className="font-medium text-gray-600">
                    Platform commission: {commissionRate}%
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-emerald-600">
                    Net rate: {100 - commissionRate}%
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Request Payout
                  </h3>

                  {hasPendingRequest && (
                    <div
                      className="mb-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5"
                      data-ocid="seller.payout.panel"
                    >
                      <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-yellow-700 font-medium">
                        Payout request pending review
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={handlePayoutRequest}
                      disabled={
                        hasPendingRequest || availableBalance < minPayoutAmount
                      }
                      className="gap-2 text-white font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#7C3AED" }}
                      data-ocid="seller.payout.primary_button"
                    >
                      <Wallet className="w-4 h-4" />
                      Request Payout
                    </Button>
                    <span className="text-xs text-gray-400">
                      Minimum payout: {formatRupee(minPayoutAmount)}
                    </span>
                  </div>
                </div>

                {sellerHistory.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-800">
                        Payout History
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">
                              Transaction ID
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Amount
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Payment Method
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sellerHistory.map((h, i) => (
                            <TableRow
                              key={h.id}
                              data-ocid={`seller.payout.item.${i + 1}`}
                            >
                              <TableCell className="text-xs text-gray-500 font-mono">
                                {h.transactionId}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">
                                {formatRupee(h.paidAmount)}
                              </TableCell>
                              <TableCell className="text-gray-600 text-sm">
                                {new Date(h.paidAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </TableCell>
                              <TableCell>
                                <span
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100"
                                  style={{ color: "#006AFF" }}
                                >
                                  {h.paymentMethod}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">
                      Financial Ledger
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      All Transactions
                    </span>
                  </div>
                  {sellerOrders.length === 0 ? (
                    <div
                      className="p-12 text-center"
                      data-ocid="seller.earnings.empty_state"
                    >
                      <p className="text-gray-400 text-sm">
                        No delivered orders yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Order ID
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Product
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Sale Price
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Commission
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Shipping
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Net Earning
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                              Clearance
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // Status logic: sort oldest first, mark as Paid until totalPaidOut exhausted
                            const sorted = [...sellerOrders].sort(
                              (a, b) =>
                                new Date(a.deliveredAt).getTime() -
                                new Date(b.deliveredAt).getTime(),
                            );
                            let paidRemaining = totalPaidOut;
                            const statusMap: Record<
                              string,
                              "Paid" | "Available" | "Pending"
                            > = {};
                            for (const e of sorted) {
                              const now = Date.now();
                              const pastHolding =
                                now - new Date(e.deliveredAt).getTime() >=
                                15 * 24 * 60 * 60 * 1000;
                              if (paidRemaining >= e.netEarning) {
                                statusMap[e.id] = "Paid";
                                paidRemaining -= e.netEarning;
                              } else if (pastHolding) {
                                statusMap[e.id] = "Available";
                              } else {
                                statusMap[e.id] = "Pending";
                              }
                            }
                            return sellerOrders.map((order, i) => {
                              const shipping = order.shippingFee ?? 50;
                              const clearanceDate = new Date(
                                new Date(order.deliveredAt).getTime() +
                                  15 * 24 * 60 * 60 * 1000,
                              );
                              const status = statusMap[order.id] ?? "Pending";
                              return (
                                <TableRow
                                  key={order.id}
                                  data-ocid={`seller.earnings.item.${i + 1}`}
                                >
                                  <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                                    {new Date(
                                      order.deliveredAt,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-500 font-mono whitespace-nowrap">
                                    <span title={order.orderId}>
                                      {order.orderId.slice(0, 8)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="font-medium text-gray-800 max-w-[140px] truncate">
                                    {order.productName}
                                  </TableCell>
                                  <TableCell className="text-gray-800 whitespace-nowrap">
                                    {formatRupee(order.orderAmount)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap font-medium">
                                    {(order.commissionRateApplied ?? 10) ===
                                    0 ? (
                                      <span className="text-green-600">
                                        ₹0 (0%)
                                      </span>
                                    ) : (
                                      <span className="text-red-500">
                                        -{formatRupee(order.commission)} (
                                        {order.commissionRateApplied ??
                                          commissionRate}
                                        %)
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-red-400 whitespace-nowrap">
                                    -{formatRupee(shipping)}
                                  </TableCell>
                                  <TableCell className="font-bold text-green-600 whitespace-nowrap">
                                    {formatRupee(order.netEarning)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {status === "Pending" && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                        Pending
                                      </span>
                                    )}
                                    {status === "Available" && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        Available
                                      </span>
                                    )}
                                    {status === "Paid" && (
                                      <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                        style={{ backgroundColor: "#006AFF" }}
                                      >
                                        Paid
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                    {status === "Pending"
                                      ? clearanceDate.toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          },
                                        )
                                      : "—"}
                                  </TableCell>
                                </TableRow>
                              );
                            });
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Order Management
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Update order statuses for your customers
                </p>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {orders.length === 0 ? (
                    <div
                      className="p-12 text-center"
                      data-ocid="seller.orders.empty_state"
                    >
                      <p className="text-gray-400 text-sm">No orders yet.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">
                            Order ID
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Product
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Current Status
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Update Status
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Invoice
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order, i) => (
                          <TableRow
                            key={order.id}
                            data-ocid={`seller.orders.item.${i + 1}`}
                          >
                            <TableCell className="font-mono text-xs text-gray-500">
                              {order.id}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800 max-w-[200px]">
                              <span className="line-clamp-2">
                                {order.product}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold text-gray-700">
                              {order.amount}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusPillStyle[order.status]
                                }`}
                              >
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(val) => {
                                  updateOrderStatus(
                                    order.id,
                                    val as OrderStatus,
                                  );
                                  if (val === "Out for Delivery") {
                                    logWhatsApp(
                                      "out_for_delivery",
                                      "",
                                      order.id,
                                    );
                                  }
                                  toast.success(
                                    `Order ${order.id} updated to "${val}"`,
                                  );
                                }}
                              >
                                <SelectTrigger
                                  className="w-44 text-xs"
                                  data-ocid={`seller.orders.select.${i + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <InvoiceButton order={order} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(order.status === "Packed" ||
                                  order.status === "Order Placed" ||
                                  order.status === "Paid & Processing") && (
                                  <>
                                    <ShippingLabelButton
                                      order={{
                                        orderId: order.id,
                                        customerName:
                                          order.buyerName ?? "Customer",
                                        customerCity: "Delhi",
                                        customerState:
                                          order.buyerState ?? "Delhi",
                                        customerPincode:
                                          order.buyerPincode ?? "110001",
                                        sellerName: order.sellerName,
                                        sellerCity: "Mumbai",
                                        paymentType: "PREPAID",
                                        items: [
                                          {
                                            name: order.product,
                                            qty: order.quantity ?? 1,
                                            weight: 0.5,
                                          },
                                        ],
                                        totalAmount: order.amountRaw,
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setGatepassOrderId(order.id)
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                                      data-ocid={`seller.orders.gatepass.${i + 1}`}
                                    >
                                      Gatepass
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </main>
        {gatepassOrderId && (
          <GatepassQR
            orderId={gatepassOrderId}
            isOpen={!!gatepassOrderId}
            onClose={() => setGatepassOrderId(null)}
            order={
              orders.find((o) => o.id === gatepassOrderId) ?? {
                id: gatepassOrderId,
                product: "",
                amount: "",
              }
            }
          />
        )}
      </div>
    </div>
  );
}
