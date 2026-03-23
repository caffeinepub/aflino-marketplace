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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWallet } from "@/context/WalletContext";
import {
  AlertCircle,
  BarChart3,
  Clock,
  LogOut,
  Package,
  ShoppingBag,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "upload" | "wallet";

interface Props {
  sellerEmail?: string;
}

function formatRupee(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function SellerDashboard({
  sellerEmail = "techzone@aflino.com",
}: Props) {
  const { logout } = useRole();
  const { isApproved } = useSellerContext();
  const {
    commissionRate,
    deliveredOrders,
    payoutRequests,
    payoutHistory,
    minPayoutAmount,
    getSellerEarnings,
    getSellerPendingBalance,
    requestPayout,
  } = useWallet();

  const approved = isApproved(sellerEmail);
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const totalEarnings = getSellerEarnings(sellerEmail);
  const pendingBalance = getSellerPendingBalance(sellerEmail);
  const sellerOrders = deliveredOrders.filter(
    (o) => o.sellerEmail === sellerEmail,
  );
  const sellerHistory = payoutHistory.filter(
    (p) => p.sellerEmail === sellerEmail,
  );
  const hasPendingRequest = payoutRequests.some(
    (r) => r.sellerEmail === sellerEmail && r.status === "pending",
  );

  const handleUpload = () => {
    if (!productName || !category || !price || !stock) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Product "${productName}" uploaded successfully!`);
    setProductName("");
    setCategory("");
    setPrice("");
    setStock("");
    setDescription("");
  };

  const handlePayoutRequest = () => {
    if (hasPendingRequest) {
      toast.error("A payout request is already pending review.");
      return;
    }
    if (pendingBalance < minPayoutAmount) {
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
            {activeTab === "upload" ? (
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

                <div className="max-w-xl">
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
                        data-ocid="seller.product_name.input"
                      />
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

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Price (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={!approved}
                        data-ocid="seller.price.input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="stock"
                        className="text-sm font-medium text-gray-700"
                      >
                        Stock (qty) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="e.g. 50"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        disabled={!approved}
                        data-ocid="seller.stock.input"
                      />
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
            ) : (
              /* Wallet & Earnings Tab */
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

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#EBF3FF" }}
                    >
                      <TrendingUp
                        className="w-5 h-5"
                        style={{ color: "#006AFF" }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatRupee(totalEarnings)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-purple-100">
                      <Wallet className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Pending Balance
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "#7C3AED" }}
                      >
                        {formatRupee(pendingBalance)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Commission Info */}
                <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
                  <span className="font-medium text-gray-600">
                    Platform commission: {commissionRate}%
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-emerald-600">
                    Net rate: {100 - commissionRate}%
                  </span>
                </div>

                {/* Payout Request Section */}
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
                        hasPendingRequest || pendingBalance < minPayoutAmount
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

                {/* Payout History */}
                {sellerHistory.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-800">
                        Payout History
                      </h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Amount Paid
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellerHistory.map((h, i) => (
                          <TableRow
                            key={h.id}
                            data-ocid={`seller.payout.item.${i + 1}`}
                          >
                            <TableCell className="text-gray-600 text-sm">
                              {new Date(h.paidAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-800">
                              {formatRupee(h.paidAmount)}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                Approved
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Earnings Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800">
                      Earnings Breakdown
                    </h3>
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
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">
                            Product
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Order Value
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Commission ({commissionRate}%)
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Net Earned
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellerOrders.map((order, i) => {
                          const commission =
                            order.orderAmount * (commissionRate / 100);
                          const net = order.orderAmount - commission;
                          return (
                            <TableRow
                              key={order.id}
                              className="bg-gray-50/50"
                              data-ocid={`seller.earnings.item.${i + 1}`}
                            >
                              <TableCell className="font-medium text-gray-800">
                                {order.productName}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatRupee(order.orderAmount)}
                              </TableCell>
                              <TableCell className="text-red-500">
                                -{formatRupee(commission)}
                              </TableCell>
                              <TableCell className="font-semibold text-emerald-600">
                                {formatRupee(net)}
                              </TableCell>
                              <TableCell className="text-gray-400 text-sm">
                                {new Date(order.deliveredAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
