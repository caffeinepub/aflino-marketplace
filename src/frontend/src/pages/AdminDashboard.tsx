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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/context/RoleContext";
import { useSellerContext } from "@/context/SellerContext";
import { useWallet } from "@/context/WalletContext";
import {
  Building2,
  CheckCircle2,
  LogOut,
  Settings2,
  Shield,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const vendors = [
  {
    id: 1,
    name: "TechZone Store",
    email: "techzone@aflino.com",
    status: "Active",
    products: 42,
  },
  {
    id: 2,
    name: "Fashion Hub",
    email: "fashionhub@aflino.com",
    status: "Active",
    products: 128,
  },
  {
    id: 3,
    name: "HomeGoods Co.",
    email: "homegoods@aflino.com",
    status: "Active",
    products: 17,
  },
  {
    id: 4,
    name: "EcoMarket",
    email: "ecomarket@aflino.com",
    status: "Suspended",
    products: 5,
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Suspended: "bg-red-100 text-red-700",
};

type Tab = "vendors" | "approvals" | "payouts" | "settings";

export default function AdminDashboard() {
  const { logout } = useRole();
  const { pendingSellers, approveSeller, rejectSeller } = useSellerContext();
  const {
    payoutRequests,
    commissionRate,
    minPayoutAmount,
    setCommissionRate,
    setMinPayoutAmount,
    approvePayout,
    rejectPayout,
  } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>("vendors");

  // Settings form state
  const [commissionInput, setCommissionInput] = useState(
    String(commissionRate),
  );
  const [minPayoutInput, setMinPayoutInput] = useState(String(minPayoutAmount));

  // Approve payout dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [payoutAmountInput, setPayoutAmountInput] = useState("");

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
    approvePayout(selectedRequestId, amount);
    setApproveDialogOpen(false);
    setSelectedRequestId(null);
    toast.success(`Payout of ₹${amount.toFixed(2)} approved successfully!`);
  };

  const handleRejectPayout = (requestId: string, sellerName: string) => {
    rejectPayout(requestId);
    toast.error(`Payout request from ${sellerName} rejected.`);
  };

  const handleSaveCommission = () => {
    const val = Number.parseFloat(commissionInput);
    if (Number.isNaN(val) || val < 0 || val > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    setCommissionRate(val);
    toast.success(`Commission rate updated to ${val}%`);
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
                  Review and manage marketplace vendors
                </p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Vendor Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Products
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
                      {vendors.map((v, i) => (
                        <TableRow key={v.id} data-ocid={`vendor.item.${i + 1}`}>
                          <TableCell className="font-medium text-gray-800">
                            {v.name}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {v.email}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {v.products}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status]}`}
                            >
                              {v.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                data-ocid={`vendor.edit_button.${i + 1}`}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                data-ocid={`vendor.delete_button.${i + 1}`}
                              >
                                Remove
                              </Button>
                            </div>
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
                              {seller.gst}
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

                  {/* Commission Rate */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="commissionRate"
                        className="text-sm font-medium text-gray-700"
                      >
                        Platform Commission Rate (%)
                      </Label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Current: {commissionRate}%
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        id="commissionRate"
                        type="number"
                        min={0}
                        max={100}
                        value={commissionInput}
                        onChange={(e) => setCommissionInput(e.target.value)}
                        className="flex-1"
                        data-ocid="settings.commission.input"
                      />
                      <Button
                        type="button"
                        onClick={handleSaveCommission}
                        className="text-white"
                        style={{ backgroundColor: "#006AFF" }}
                        data-ocid="settings.commission.save_button"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Sellers will receive{" "}
                      {100 - Number.parseFloat(commissionInput || "10")}% of
                      each order value after commission.
                    </p>
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
              </div>
            )}
          </motion.div>
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
