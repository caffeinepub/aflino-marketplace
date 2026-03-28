import {
  type AdvancedFormState,
  ProductAdvancedSections,
  SwatchImageUpload,
  initialAdvancedState,
} from "@/components/ProductAdvancedSections";
import AdminCommandCenter from "@/components/admin/AdminCommandCenter";
import AffiliateManagerTab from "@/components/admin/AffiliateManagerTab";
import BrandSettingsTab from "@/components/admin/BrandSettingsTab";
import CommunicationSettings from "@/components/admin/CommunicationSettings";
import CourierSettingsSection from "@/components/admin/CourierSettingsSection";
import GlobalPriceAdjuster from "@/components/admin/GlobalPriceAdjuster";
import HomepageManagerTab from "@/components/admin/HomepageManagerTab";
import LanguageIconManager from "@/components/admin/LanguageIconManager";
import PaymentSettingsTab from "@/components/admin/PaymentSettingsTab";
import QRSecuritySection from "@/components/admin/QRSecuritySection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useBlacklist } from "@/context/BlacklistContext";
import { useOrderTracking } from "@/context/OrderTrackingContext";
import { useProducts } from "@/context/ProductContext";
import { useReviews } from "@/context/ReviewContext";
import { useRewardSettings } from "@/context/RewardSettingsContext";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWallet } from "@/context/WalletContext";
import {
  BarChart2,
  Building2,
  CheckCircle2,
  Coins,
  CreditCard,
  Globe,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Settings2,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Users2,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Tab =
  | "vendors"
  | "approvals"
  | "payouts"
  | "settings"
  | "products"
  | "homepage"
  | "payment"
  | "communication"
  | "brand"
  | "reviews"
  | "analytics"
  | "languages"
  | "affiliates";

interface AdminVariantRow {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
  sku: string;
  swatchImage: string;
}

function newAdminVariantRow(): AdminVariantRow {
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

export default function AdminDashboard() {
  const { logout } = useRole();
  const { orders } = useOrderTracking();
  const { products, addProduct, deleteProduct, updateProductsBulk } =
    useProducts();
  const {
    pendingSellers,
    approveSeller,
    rejectSeller,
    approvedSellers,
    updateSellerType,
  } = useSellerContext();
  const {
    payoutRequests,
    commissionRate,
    minPayoutAmount,
    setCommissionRate,
    setMinPayoutAmount,
    approvePayout,
    rejectPayout,
    walletEntries,
    payoutHistory,
    getTotalAdminCommission,
    categoryRates,
    setCategoryRates,
    getCategoryRate,
  } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>("vendors");
  const {
    getScheduledReviews,
    getFlaggedReviews,
    approveReview,
    rejectReview,
    editReview,
    deleteAndBlockUser,
  } = useReviews();
  const {
    blacklistWords,
    addWord: addBlacklistWord,
    removeWord: removeBlacklistWord,
  } = useBlacklist();
  const { settings: rewardSettings, updateSettings: updateRewardSettings } =
    useRewardSettings();
  const scheduledReviewsList = getScheduledReviews();
  const flaggedReviewsList = getFlaggedReviews();
  const pendingReviewsCount =
    scheduledReviewsList.length + flaggedReviewsList.length;
  const [reviewModeTab, setReviewModeTab] = useState<"scheduled" | "flagged">(
    "scheduled",
  );
  const [newBlacklistWord, setNewBlacklistWord] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Admin product upload state
  const [adminProductName, setAdminProductName] = useState("");
  const [adminCategory, setAdminCategory] = useState("");
  const [adminPrice, setAdminPrice] = useState("");
  const [adminStock, setAdminStock] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminVariantsEnabled, setAdminVariantsEnabled] = useState(false);
  const [adminVariantRows, setAdminVariantRows] = useState<AdminVariantRow[]>([
    newAdminVariantRow(),
  ]);
  const [adminAdvancedState, setAdminAdvancedState] =
    useState<AdvancedFormState>(initialAdvancedState());

  function addAdminVariantRow() {
    setAdminVariantRows((p) => [...p, newAdminVariantRow()]);
  }
  function removeAdminVariantRow(id: string) {
    setAdminVariantRows((p) => p.filter((r) => r.id !== id));
  }
  function updateAdminVariantRow(
    id: string,
    field: keyof AdminVariantRow,
    value: string,
  ) {
    setAdminVariantRows((p) =>
      p.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  const handleAdminUpload = () => {
    if (!adminProductName || !adminCategory) {
      toast.error("Please fill in Product Title and Category");
      return;
    }
    if (!adminVariantsEnabled && (!adminPrice || !adminStock)) {
      toast.error("Please fill in Price and Stock");
      return;
    }
    addProduct({
      id: Date.now(),
      title: adminProductName,
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
        )[adminCategory] || adminCategory,
      price:
        Number.parseFloat(adminPrice) ||
        (adminVariantRows[0]
          ? Number.parseFloat(adminVariantRows[0].price) || 0
          : 0),
      description: adminDescription,
      stock: Number.parseInt(adminStock) || 50,
      rating: 4.0,
      seller: "Admin",
      images: [],
      videoUrl: adminAdvancedState.videoUrl || undefined,
      weight: Number.parseFloat(adminAdvancedState.weight) || undefined,
      weightUnit: adminAdvancedState.weightUnit,
      brandName: adminAdvancedState.brandName || undefined,
      countryOfOrigin: adminAdvancedState.countryOfOrigin || undefined,
      gstRate: adminAdvancedState.gstRate
        ? (Number.parseInt(adminAdvancedState.gstRate) as 5 | 12 | 18 | 28)
        : undefined,
      hsnCode: adminAdvancedState.hsnCode || undefined,
      whatInTheBox: adminAdvancedState.whatInTheBox,
      variants: adminVariantsEnabled
        ? adminVariantRows.map((r) => ({
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
    toast.success(`Product "${adminProductName}" added!`);
    setAdminProductName("");
    setAdminCategory("");
    setAdminPrice("");
    setAdminStock("");
    setAdminDescription("");
    setAdminVariantsEnabled(false);
    setAdminVariantRows([newAdminVariantRow()]);
    setAdminAdvancedState(initialAdvancedState());
  };

  // Settings form state
  const [localCategoryRates, setLocalCategoryRates] =
    useState<Record<string, number>>(categoryRates);
  const [globalRateInput, setGlobalRateInput] = useState(
    String(commissionRate),
  );

  const COMMISSION_CATEGORIES = [
    { key: "mobiles", label: "Mobiles" },
    { key: "electronics", label: "Electronics" },
    { key: "fashion", label: "Fashion" },
    { key: "home", label: "Home & Kitchen" },
    { key: "beauty", label: "Beauty" },
    { key: "sports", label: "Sports" },
    { key: "books", label: "Books" },
    { key: "tools", label: "Tools" },
    { key: "gadgets", label: "Gadgets" },
    { key: "appliances", label: "Home Appliances" },
  ];
  const [minPayoutInput, setMinPayoutInput] = useState(String(minPayoutAmount));

  // Approve payout dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [payoutAmountInput, setPayoutAmountInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const pendingPayouts = payoutRequests.filter((r) => r.status === "pending");

  const handleApprove = (id: string, name: string) => {
    approveSeller(id);
    toast.success(`${name} has been approved!`);
  };

  const handleReject = (id: string, name: string) => {
    rejectSeller(id);
    toast.error(`${name} has been rejected.`);
  };

  const openApproveDialog = (requestId: string, requestedAmount: number) => {
    setSelectedRequestId(requestId);
    setPayoutAmountInput(String(requestedAmount.toFixed(2)));
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequestId) return;
    const amount = Number.parseFloat(payoutAmountInput);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    approvePayout(selectedRequestId, amount, paymentMethod);
    setApproveDialogOpen(false);
    setSelectedRequestId(null);
    toast.success(`Payout of ₹${amount.toFixed(2)} approved successfully!`);
  };

  const handleRejectPayout = (requestId: string, sellerName: string) => {
    rejectPayout(requestId);
    toast.error(`Payout request from ${sellerName} rejected.`);
  };

  const handleSaveMinPayout = () => {
    const val = Number.parseFloat(minPayoutInput);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Minimum payout amount must be a positive number");
      return;
    }
    setMinPayoutAmount(val);
    toast.success(`Minimum payout updated to ₹${val}`);
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
          <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("vendors")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "vendors"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.vendor_management.tab"
          >
            <Building2 className="w-4 h-4" />
            Vendor Management
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "approvals"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.pending_approvals.tab"
          >
            <Users className="w-4 h-4" />
            Pending Approvals
            {pendingSellers.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-white">
                {pendingSellers.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "payouts"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.payout_requests.tab"
          >
            <Wallet className="w-4 h-4" />
            Payout Requests
            {pendingPayouts.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                {pendingPayouts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "settings"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.settings.tab"
          >
            <Settings2 className="w-4 h-4" />
            Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "products"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.products.tab"
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("homepage")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "homepage"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.homepage.tab"
          >
            <LayoutDashboard className="w-4 h-4" />
            Homepage Manager
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "payment"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.payment_settings.tab"
          >
            <CreditCard className="w-4 h-4" />
            Payment Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("communication")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "communication"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.communication.tab"
          >
            <Mail className="w-4 h-4" />
            Communication
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("brand")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "brand"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.brand_settings.tab"
          >
            <Image className="w-4 h-4" />
            Brand Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "reviews"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.reviews.tab"
          >
            <MessageSquare className="w-4 h-4" />
            Reviews
            {pendingReviewsCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] font-bold text-white">
                {pendingReviewsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "analytics"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.analytics.tab"
          >
            <BarChart2 className="w-4 h-4" />
            Command Center
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("languages")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "languages"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.languages.tab"
          >
            <Globe className="w-4 h-4" />
            Languages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("affiliates")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "affiliates"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            data-ocid="admin.affiliates.tab"
          >
            <Users2 className="w-4 h-4" />
            Affiliates
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Permissions
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-sm"
            data-ocid="admin.logout.button"
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
            {activeTab === "vendors" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Vendor Management
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Toggle seller type to control Pan-India (Global GST) vs local
                  state visibility.
                </p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Business Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          State
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Seller Type
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Change Type
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedSellers.map((s, i) => (
                        <TableRow key={s.id} data-ocid={`vendor.item.${i + 1}`}>
                          <TableCell className="font-medium text-gray-800">
                            {s.businessName}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {s.email}
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {s.state}
                          </TableCell>
                          <TableCell>
                            {s.sellerType === "enrollmentId" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                📍 Local (Enrolment ID)
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50"
                                style={{ color: "#006AFF" }}
                              >
                                🌐 Global (GST)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {s.sellerType === "gstin" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                                onClick={() => {
                                  const eid = prompt(
                                    `Change ${s.businessName} to Local seller.\nEnter Enrolment ID (or leave blank):`,
                                  );
                                  if (eid !== null) {
                                    updateSellerType(
                                      s.id,
                                      "enrollmentId",
                                      eid || undefined,
                                    );
                                    toast.success(
                                      `${s.businessName} set to Local. Products show only in ${s.state}.`,
                                    );
                                  }
                                }}
                                data-ocid={`vendor.change_type.button.${i + 1}`}
                              >
                                Set Local
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-blue-300 hover:bg-blue-50"
                                style={{ color: "#006AFF" }}
                                onClick={() => {
                                  updateSellerType(s.id, "gstin");
                                  toast.success(
                                    `${s.businessName} upgraded to Global GST. Products now visible Pan-India.`,
                                  );
                                }}
                                data-ocid={`vendor.change_type.button.${i + 1}`}
                              >
                                Set Global
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {activeTab === "approvals" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Pending Approvals
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Review and approve new seller registrations
                </p>

                {pendingSellers.length === 0 ? (
                  <div
                    className="bg-white rounded-xl border border-gray-200 p-16 text-center"
                    data-ocid="approvals.empty_state"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">All caught up!</p>
                    <p className="text-gray-400 text-sm mt-1">
                      No pending seller registrations.
                    </p>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden"
                    data-ocid="approvals.table"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">
                            Business Name
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            GST
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Email
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Submitted
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingSellers.map((seller, i) => (
                          <TableRow
                            key={seller.id}
                            data-ocid={`approval.item.${i + 1}`}
                          >
                            <TableCell className="font-medium text-gray-800">
                              {seller.businessName}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm font-mono">
                              {seller.gstin}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {seller.email}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(seller.submittedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1 text-white bg-emerald-500 hover:bg-emerald-600 border-0"
                                  onClick={() =>
                                    handleApprove(
                                      seller.id,
                                      seller.businessName,
                                    )
                                  }
                                  data-ocid={`approval.confirm_button.${i + 1}`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() =>
                                    handleReject(seller.id, seller.businessName)
                                  }
                                  data-ocid={`approval.delete_button.${i + 1}`}
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {activeTab === "payouts" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Payout Requests
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Review and process seller payout requests
                </p>

                {/* Platform Earnings Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Total Sales Volume
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: "#006AFF" }}
                    >
                      ₹
                      {walletEntries
                        .reduce((s, e) => s + e.orderAmount, 0)
                        .toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      All delivered orders
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Commission Earned
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      ₹
                      {getTotalAdminCommission().toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      10% of each order
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Pending Payouts
                    </p>
                    <p className="text-xl font-bold text-amber-600">
                      ₹
                      {payoutRequests
                        .filter((r) => r.status === "pending")
                        .reduce((s, r) => s + r.requestedAmount, 0)
                        .toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Awaiting approval
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Paid to Sellers
                    </p>
                    <p className="text-xl font-bold text-gray-700">
                      ₹
                      {payoutHistory
                        .reduce((s, p) => s + p.paidAmount, 0)
                        .toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Total disbursed
                    </p>
                  </div>
                </div>

                {payoutRequests.length === 0 ? (
                  <div
                    className="bg-white rounded-xl border border-gray-200 p-16 text-center"
                    data-ocid="payouts.empty_state"
                  >
                    <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No payout requests yet.
                    </p>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden"
                    data-ocid="payouts.table"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">
                            Seller
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Requested Amount
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payoutRequests.map((req, i) => (
                          <TableRow
                            key={req.id}
                            data-ocid={`payout.item.${i + 1}`}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {req.sellerName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {req.sellerEmail}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-gray-800">
                              ₹
                              {req.requestedAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(req.requestedAt).toLocaleDateString(
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
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  req.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : req.status === "approved"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-600"
                                }`}
                              >
                                {req.status.charAt(0).toUpperCase() +
                                  req.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {req.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-white bg-emerald-500 hover:bg-emerald-600 border-0"
                                    onClick={() =>
                                      openApproveDialog(
                                        req.id,
                                        req.requestedAmount,
                                      )
                                    }
                                    data-ocid={`payout.confirm_button.${i + 1}`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() =>
                                      handleRejectPayout(req.id, req.sellerName)
                                    }
                                    data-ocid={`payout.delete_button.${i + 1}`}
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {activeTab === "products" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Product Management
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Upload new products or manage marketplace listings
                </p>

                <GlobalPriceAdjuster
                  products={products}
                  updateProductsBulk={updateProductsBulk}
                />

                {/* Admin Product Upload Form */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
                    Add New Product
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="adminProductName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Product Title
                      </Label>
                      <Input
                        id="adminProductName"
                        value={adminProductName}
                        onChange={(e) =>
                          setAdminProductName(e.target.value.slice(0, 110))
                        }
                        placeholder="Enter product title (max 110 chars)"
                        data-ocid="admin.product_name.input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Category
                        </Label>
                        <Select
                          value={adminCategory}
                          onValueChange={setAdminCategory}
                        >
                          <SelectTrigger data-ocid="admin.product_category.select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="fashion">Fashion</SelectItem>
                            <SelectItem value="home">
                              Home &amp; Kitchen
                            </SelectItem>
                            <SelectItem value="beauty">Beauty</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="books">Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Price (₹)
                        </Label>
                        <Input
                          type="number"
                          value={adminPrice}
                          onChange={(e) => setAdminPrice(e.target.value)}
                          placeholder="0.00"
                          disabled={adminVariantsEnabled}
                          data-ocid="admin.product_price.input"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        value={adminDescription}
                        onChange={(e) => setAdminDescription(e.target.value)}
                        placeholder="Product description..."
                        rows={3}
                        className="resize-none"
                        data-ocid="admin.product_description.textarea"
                      />
                    </div>
                    {/* Variants Toggle */}
                    <div className="flex items-center gap-3">
                      <Switch
                        id="admin-variants-toggle"
                        checked={adminVariantsEnabled}
                        onCheckedChange={setAdminVariantsEnabled}
                        style={{
                          backgroundColor: adminVariantsEnabled
                            ? "#006AFF"
                            : undefined,
                        }}
                        data-ocid="admin.variants.switch"
                      />
                      <Label
                        htmlFor="admin-variants-toggle"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Enable Variants (Size / Colour)
                      </Label>
                    </div>
                    {adminVariantsEnabled && (
                      <div className="space-y-3">
                        {adminVariantRows.map((row, i) => (
                          <div
                            key={row.id}
                            className="grid gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                            style={{
                              gridTemplateColumns:
                                "80px 1fr 32px 36px 70px 90px 80px 32px",
                            }}
                            data-ocid={`admin.variants.item.${i + 1}`}
                          >
                            <Input
                              placeholder="Size"
                              value={row.size}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "size",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                            <Input
                              placeholder="Color"
                              value={row.color}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "color",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                            <input
                              type="color"
                              value={row.colorHex}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "colorHex",
                                  e.target.value,
                                )
                              }
                              className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                            />
                            <SwatchImageUpload
                              swatchImage={row.swatchImage || undefined}
                              onUpload={(b64) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "swatchImage",
                                  b64,
                                )
                              }
                            />
                            <Input
                              placeholder="SKU"
                              value={row.sku}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "sku",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                            <Input
                              type="number"
                              placeholder="₹ Price"
                              value={row.price}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "price",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                            <Input
                              type="number"
                              placeholder="Stock"
                              value={row.stock}
                              onChange={(e) =>
                                updateAdminVariantRow(
                                  row.id,
                                  "stock",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdminVariantRow(row.id)}
                              className="h-8 w-8 flex items-center justify-center rounded text-red-400 hover:bg-red-50"
                              data-ocid={`admin.variants.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addAdminVariantRow}
                          style={{ borderColor: "#006AFF", color: "#006AFF" }}
                          className="gap-1.5 text-xs border-dashed"
                          data-ocid="admin.variants.add_button"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Variant
                        </Button>
                      </div>
                    )}
                    <ProductAdvancedSections
                      state={adminAdvancedState}
                      onChange={(patch) =>
                        setAdminAdvancedState((prev) => ({ ...prev, ...patch }))
                      }
                      sellingPrice={Number.parseFloat(adminPrice) || 0}
                      variantMinPrice={
                        adminVariantsEnabled && adminVariantRows.length > 0
                          ? Math.min(
                              ...adminVariantRows
                                .map((r) => Number.parseFloat(r.price) || 0)
                                .filter(Boolean),
                            )
                          : undefined
                      }
                      commissionRate={getCategoryRate(adminCategory)}
                    />
                    <Button
                      type="button"
                      onClick={handleAdminUpload}
                      className="w-full gap-2 text-white font-semibold"
                      style={{ backgroundColor: "#006AFF" }}
                      data-ocid="admin.product.submit_button"
                    >
                      <Upload className="w-4 h-4" />
                      Add Product
                    </Button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  All Listings
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Product Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Stock
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Variants
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-12"
                            data-ocid="products.empty_state"
                          >
                            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400">
                              No products available.
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product, i) => (
                          <TableRow
                            key={product.id}
                            data-ocid={`product.item.${i + 1}`}
                          >
                            <TableCell className="font-medium text-gray-800 max-w-xs">
                              <div className="flex items-start gap-2 flex-wrap">
                                <p className="line-clamp-2 leading-snug">
                                  {product.title}
                                </p>
                                {product.stock <=
                                  (product.stockThreshold ?? 5) && (
                                  <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs flex-shrink-0 animate-pulse">
                                    LOW STOCK
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                by {product.seller}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {product.category}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-gray-800">
                              ₹
                              {(product.variants?.length
                                ? Math.min(
                                    ...product.variants.map((v) => v.price),
                                  )
                                : product.price
                              ).toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {product.stock}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {product.variants?.length ? (
                                <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-100">
                                  {product.variants.length} variants
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(`Delete "${product.title}"?`)
                                  )
                                    deleteProduct(product.id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "#dc2626" }}
                                data-ocid={`product.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Payout History Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payout History
                  </h3>
                  {payoutHistory.length === 0 ? (
                    <div
                      className="bg-white rounded-xl border border-gray-200 p-10 text-center"
                      data-ocid="payout_history.empty_state"
                    >
                      <p className="text-gray-400 text-sm">
                        No payout history yet.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                      data-ocid="payout_history.table"
                    >
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-700">
                                Transaction ID
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">
                                Seller
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
                            {payoutHistory.map((ph, i) => (
                              <TableRow
                                key={ph.id}
                                data-ocid={`payout_history.item.${i + 1}`}
                              >
                                <TableCell className="text-xs text-gray-500 font-mono">
                                  {ph.transactionId}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {ph.sellerName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {ph.sellerEmail}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  ₹
                                  {ph.paidAmount.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell className="text-gray-600 text-sm">
                                  {new Date(ph.paidAt).toLocaleDateString(
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
                                    {ph.paymentMethod}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Settings
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Configure commission and payout rules
                </p>

                <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
                  <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
                    Commission & Payout Settings
                  </h3>

                  {/* Category-Wise Commission Panel */}
                  <div className="space-y-5">
                    {/* Default Global Rate */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Default Global Rate (%)
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Applied to any category without a specific rate
                          </p>
                        </div>
                        <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded font-medium">
                          Current: {commissionRate}%
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={globalRateInput}
                          onChange={(e) => setGlobalRateInput(e.target.value)}
                          className="flex-1 h-9"
                          placeholder="e.g. 10"
                          data-ocid="settings.commission.input"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const val = Number.parseFloat(globalRateInput);
                            if (Number.isNaN(val) || val < 0 || val > 100) {
                              toast.error("Rate must be 0–100");
                              return;
                            }
                            setCommissionRate(val);
                            toast.success(`Default rate updated to ${val}%`);
                          }}
                          className="text-white h-9 px-4"
                          style={{ backgroundColor: "#006AFF" }}
                          data-ocid="settings.commission.save_button"
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Per-Category Rates */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Category-Specific Rates
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Leave blank to use Default Global Rate. Enter "0" for
                        zero commission.
                      </p>
                      <div className="space-y-3">
                        {COMMISSION_CATEGORIES.map(({ key, label }) => {
                          const currentVal = localCategoryRates[key];
                          const hasOverride = typeof currentVal === "number";
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <div className="w-36 flex-shrink-0">
                                <span className="text-sm text-gray-700 font-medium">
                                  {label}
                                </span>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={hasOverride ? String(currentVal) : ""}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    const next = { ...localCategoryRates };
                                    delete next[key];
                                    setLocalCategoryRates(next);
                                  } else {
                                    setLocalCategoryRates({
                                      ...localCategoryRates,
                                      [key]: Number.parseFloat(raw),
                                    });
                                  }
                                }}
                                className="h-8 text-sm flex-1"
                                placeholder={`Default (${commissionRate}%)`}
                                data-ocid={`settings.commission.${key}.input`}
                              />
                              {hasOverride && (
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded ${currentVal === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                                >
                                  {currentVal === 0
                                    ? "0% (Free)"
                                    : `${currentVal}%`}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          for (const [k, v] of Object.entries(
                            localCategoryRates,
                          )) {
                            if (Number.isNaN(v) || v < 0 || v > 100) {
                              toast.error(`Invalid rate for category ${k}`);
                              return;
                            }
                          }
                          setCategoryRates(localCategoryRates);
                          toast.success("Category commission rates saved!");
                        }}
                        className="w-full mt-4 text-white font-semibold"
                        style={{ backgroundColor: "#006AFF" }}
                        data-ocid="settings.commission.save_all_button"
                      >
                        Save All Category Rates
                      </Button>
                    </div>
                  </div>

                  {/* Min Payout */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="minPayout"
                        className="text-sm font-medium text-gray-700"
                      >
                        Minimum Payout Amount (₹)
                      </Label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Current: ₹{minPayoutAmount}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        id="minPayout"
                        type="number"
                        min={0}
                        value={minPayoutInput}
                        onChange={(e) => setMinPayoutInput(e.target.value)}
                        className="flex-1"
                        data-ocid="settings.min_payout.input"
                      />
                      <Button
                        type="button"
                        onClick={handleSaveMinPayout}
                        className="text-white"
                        style={{ backgroundColor: "#006AFF" }}
                        data-ocid="settings.min_payout.save_button"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Sellers cannot request a payout below this threshold.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-6">
                  <QRSecuritySection />
                  <CourierSettingsSection />

                  {/* Language Icon Manager */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <LanguageIconManager />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          {activeTab === "homepage" && (
            <motion.div
              key="homepage"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HomepageManagerTab />
            </motion.div>
          )}
          {activeTab === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSettingsTab />
            </motion.div>
          )}
          {activeTab === "communication" && (
            <motion.div
              key="communication"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommunicationSettings />
            </motion.div>
          )}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Reward Settings */}
              <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    Reward Settings
                  </h3>
                  <span className="ml-auto text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                    Live Controls
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Set how many AFLINO Coins customers earn per review. Coins
                  credited only after publish.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Text Review Points
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={rewardSettings.textPoints}
                      onChange={(e) =>
                        updateRewardSettings({
                          ...rewardSettings,
                          textPoints: Math.max(
                            0,
                            Number.parseInt(e.target.value) || 0,
                          ),
                        })
                      }
                      className="text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Coins for writing text (min 10 chars)
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Photo Bonus Points
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={rewardSettings.photoPoints}
                      onChange={(e) =>
                        updateRewardSettings({
                          ...rewardSettings,
                          photoPoints: Math.max(
                            0,
                            Number.parseInt(e.target.value) || 0,
                          ),
                        })
                      }
                      className="text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Bonus coins for adding ≥1 photo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                  <Coins className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Cap per product:</span>{" "}
                    {rewardSettings.textPoints + rewardSettings.photoPoints}{" "}
                    coins. Max 3 review submissions.{" "}
                    <span className="font-semibold text-blue-700">
                      Coins credited only after publish.
                    </span>
                  </div>
                </div>
              </div>

              {/* Blacklist Manager */}
              <div
                className="mb-6 p-5 bg-red-50 border border-red-200 rounded-2xl"
                data-ocid="admin.blacklist.panel"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    Blacklist Manager
                  </h3>
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {blacklistWords.length} words
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Words in this list instantly flag reviews (English, Hindi,
                  Bengali). Flagged reviews are never auto-published — admin
                  must manually approve them.
                </p>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newBlacklistWord}
                    onChange={(e) => setNewBlacklistWord(e.target.value)}
                    placeholder="Type a word to block..."
                    className="text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newBlacklistWord.trim()) {
                          addBlacklistWord(newBlacklistWord.trim());
                          setNewBlacklistWord("");
                          toast.success("Word added to blacklist.");
                        }
                      }
                    }}
                    data-ocid="admin.blacklist.input"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={() => {
                      if (newBlacklistWord.trim()) {
                        addBlacklistWord(newBlacklistWord.trim());
                        setNewBlacklistWord("");
                        toast.success("Word added to blacklist.");
                      }
                    }}
                    data-ocid="admin.blacklist.add_button"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Word
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blacklistWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: "#fff0f0",
                        color: "#b91c1c",
                        borderColor: "#fecaca",
                      }}
                    >
                      {word}
                      <button
                        type="button"
                        onClick={() => {
                          removeBlacklistWord(word);
                          toast.success(`"${word}" removed from blacklist.`);
                        }}
                        className="hover:opacity-70 transition-opacity ml-0.5"
                        aria-label="Remove word"
                      >
                        <XCircle
                          className="w-3.5 h-3.5"
                          style={{ color: "#EC008C" }}
                        />
                      </button>
                    </span>
                  ))}
                  {blacklistWords.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      No words in blacklist yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Review Moderation */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Review Moderation
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Scheduled reviews auto-publish after 1 hour unless you
                      intervene.
                    </p>
                  </div>
                  {pendingReviewsCount > 0 && (
                    <span
                      className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: "#f97316" }}
                    >
                      {pendingReviewsCount} Pending
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setReviewModeTab("scheduled")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={
                      reviewModeTab === "scheduled"
                        ? { backgroundColor: "#006AFF", color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                    data-ocid="admin.reviews.scheduled.tab"
                  >
                    ⏳ Scheduled
                    {scheduledReviewsList.length > 0 && (
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          reviewModeTab === "scheduled"
                            ? {
                                backgroundColor: "rgba(255,255,255,0.3)",
                                color: "#fff",
                              }
                            : { backgroundColor: "#006AFF", color: "#fff" }
                        }
                      >
                        {scheduledReviewsList.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModeTab("flagged")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={
                      reviewModeTab === "flagged"
                        ? { backgroundColor: "#ef4444", color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                    data-ocid="admin.reviews.flagged.tab"
                  >
                    🚫 Flagged
                    {flaggedReviewsList.length > 0 && (
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          reviewModeTab === "flagged"
                            ? {
                                backgroundColor: "rgba(255,255,255,0.3)",
                                color: "#fff",
                              }
                            : { backgroundColor: "#ef4444", color: "#fff" }
                        }
                      >
                        {flaggedReviewsList.length}
                      </span>
                    )}
                  </button>
                </div>

                {reviewModeTab === "scheduled" &&
                  (scheduledReviewsList.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-16 text-center"
                      data-ocid="admin.reviews.empty_state"
                    >
                      <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                      <h3 className="text-base font-semibold text-gray-600 mb-1">
                        No Scheduled Reviews
                      </h3>
                      <p className="text-sm text-gray-400">
                        Reviews pending auto-publish will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4" data-ocid="admin.reviews.list">
                      {scheduledReviewsList.map((review, i) => {
                        const minsLeft = review.scheduledAt
                          ? Math.max(
                              0,
                              Math.round(
                                (60 * 60 * 1000 -
                                  (Date.now() - review.scheduledAt)) /
                                  60000,
                              ),
                            )
                          : 60;
                        return (
                          <div
                            key={review.reviewId}
                            className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs"
                            data-ocid={`admin.reviews.item.${i + 1}`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #006AFF, #EC008C)",
                                  }}
                                >
                                  {review.userName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {review.userName}
                                    </p>
                                    {review.isVerifiedPurchase && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">
                                        ✓ Verified Purchase
                                      </span>
                                    )}
                                    <span
                                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold animate-pulse"
                                      style={{
                                        backgroundColor: "#dbeafe",
                                        color: "#1d4ed8",
                                      }}
                                    >
                                      ⏳ ~{minsLeft} min to auto-publish
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Product ID: {review.productId}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className="w-4 h-4"
                                    fill={
                                      s <= review.rating ? "#006AFF" : "none"
                                    }
                                    stroke={
                                      s <= review.rating ? "#006AFF" : "#d1d5db"
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            {editingReviewId === review.reviewId ? (
                              <div className="mb-4">
                                <Textarea
                                  value={editingText}
                                  onChange={(e) =>
                                    setEditingText(e.target.value)
                                  }
                                  className="text-sm mb-2"
                                  rows={3}
                                  data-ocid="admin.reviews.edit.textarea"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="text-white"
                                    style={{ backgroundColor: "#006AFF" }}
                                    onClick={() => {
                                      editReview(review.reviewId, editingText);
                                      setEditingReviewId(null);
                                      toast.success("Review text updated.");
                                    }}
                                    data-ocid="admin.reviews.edit.save_button"
                                  >
                                    Save Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingReviewId(null)}
                                    data-ocid="admin.reviews.edit.cancel_button"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                {review.reviewText}
                              </p>
                            )}

                            {review.photoUrls.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {review.photoUrls.map((url) => (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 block flex-shrink-0 hover:opacity-90 transition-opacity"
                                  >
                                    <img
                                      src={url}
                                      alt="Review"
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
                              <Button
                                type="button"
                                size="sm"
                                className="text-white font-semibold"
                                style={{ backgroundColor: "#006AFF" }}
                                onClick={() => {
                                  approveReview(review.reviewId);
                                  toast.success(
                                    "Review approved & published! Coins credited to reviewer.",
                                  );
                                }}
                                data-ocid={`admin.reviews.approve.button.${i + 1}`}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve Now
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-gray-600 border-gray-200"
                                onClick={() => {
                                  setEditingReviewId(review.reviewId);
                                  setEditingText(review.reviewText);
                                }}
                                data-ocid={`admin.reviews.edit.button.${i + 1}`}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  rejectReview(review.reviewId);
                                  toast.success("Review flagged.");
                                }}
                                data-ocid={`admin.reviews.flag.button.${i + 1}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Flag It
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                {reviewModeTab === "flagged" &&
                  (flaggedReviewsList.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-16 text-center"
                      data-ocid="admin.reviews.flagged.empty_state"
                    >
                      <Shield className="w-12 h-12 text-gray-200 mb-3" />
                      <h3 className="text-base font-semibold text-gray-600 mb-1">
                        No Flagged Reviews
                      </h3>
                      <p className="text-sm text-gray-400">
                        All clear! No reviews flagged by Smart-Scan.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="space-y-4"
                      data-ocid="admin.reviews.flagged.list"
                    >
                      {flaggedReviewsList.map((review, i) => (
                        <div
                          key={review.reviewId}
                          className="bg-white rounded-2xl border border-red-100 p-5 shadow-xs"
                          data-ocid={`admin.reviews.flagged.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #ef4444, #EC008C)",
                                }}
                              >
                                {review.userName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {review.userName}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Product ID: {review.productId}
                                </p>
                                {review.scanReason && (
                                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200">
                                    ⚠️ {review.scanReason}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className="w-4 h-4"
                                  fill={s <= review.rating ? "#ef4444" : "none"}
                                  stroke={
                                    s <= review.rating ? "#ef4444" : "#d1d5db"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 leading-relaxed mb-4 line-through opacity-60">
                            {review.reviewText}
                          </p>

                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <Button
                              type="button"
                              size="sm"
                              className="text-white font-semibold"
                              style={{ backgroundColor: "#006AFF" }}
                              onClick={() => {
                                approveReview(review.reviewId);
                                toast.success(
                                  "Review approved & published. Coins credited.",
                                );
                              }}
                              data-ocid={`admin.reviews.approve_anyway.button.${i + 1}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve Anyway
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 ml-auto"
                              onClick={() => {
                                deleteAndBlockUser(
                                  review.reviewId,
                                  review.userId,
                                );
                                toast.success(
                                  "Review deleted and user blocked from posting reviews.",
                                );
                              }}
                              data-ocid={`admin.reviews.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete & Block User
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === "brand" && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BrandSettingsTab />
            </motion.div>
          )}

          {activeTab === "languages" && (
            <motion.div
              key="languages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Language & Asset Manager
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload and crop landmark icons for all 28 languages. Manage
                  brand assets (Logo, Banners, Icons).
                </p>
              </div>
              <LanguageIconManager />
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AdminCommandCenter orders={orders} />
            </motion.div>
          )}
          {activeTab === "affiliates" && (
            <motion.div
              key="affiliates"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <AffiliateManagerTab />
            </motion.div>
          )}
        </main>
      </div>

      {/* Approve Payout Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="payout.dialog">
          <DialogHeader>
            <DialogTitle>Approve Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label
              htmlFor="payoutAmount"
              className="text-sm font-medium text-gray-700"
            >
              Enter Payout Amount (₹)
            </Label>
            <Input
              id="payoutAmount"
              type="number"
              min={0}
              value={payoutAmountInput}
              onChange={(e) => setPayoutAmountInput(e.target.value)}
              data-ocid="payout.input"
            />
            <Label
              htmlFor="paymentMethodSelect"
              className="text-sm font-medium text-gray-700"
            >
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethodSelect" data-ocid="payout.select">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="IMPS">IMPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              data-ocid="payout.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="text-white bg-emerald-500 hover:bg-emerald-600"
              onClick={handleConfirmApprove}
              data-ocid="payout.confirm_button"
            >
              Confirm Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
