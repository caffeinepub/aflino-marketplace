import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAdWallet } from "@/context/AdWalletContext";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Loader2,
  Plus,
  Receipt,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  sellerEmail: string;
}

export default function SellerAdWalletTab({ sellerEmail }: Props) {
  const { getWallet, topUp } = useAdWallet();
  const wallet = getWallet(sellerEmail);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const handleTopUp = () => {
    const num = Number.parseFloat(amount);
    if (!num || num < 100) {
      toast.error("Minimum top-up amount is ₹100");
      return;
    }
    setPaying(true);
    // Simulate Razorpay flow
    setTimeout(() => {
      const orderId = `rz_${Date.now()}`;
      topUp(sellerEmail, num, orderId);
      setPaying(false);
      setDialogOpen(false);
      setAmount("");
      toast.success(`₹${num.toLocaleString("en-IN")} added to Ad Wallet!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #006AFF 0%, #0041CC 100%)",
        }}
        data-ocid="seller.ad_wallet.card"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Ad Wallet Balance
              </p>
              <p className="text-4xl font-bold mt-2 tracking-tight">
                ₹
                {wallet.balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                  data-ocid="seller.ad_wallet.add_money.button"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Money
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-sm"
                data-ocid="seller.ad_wallet.topup.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" /> Top-up Ad
                    Wallet
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="topup-amount">Amount (₹)</Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      min={100}
                      placeholder="Min. ₹100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      data-ocid="seller.ad_wallet.topup.input"
                    />
                    <p className="text-xs text-gray-400">
                      Minimum top-up: ₹100
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(String(preset))}
                        className={`text-xs py-2 rounded-lg border font-medium transition-colors ${
                          amount === String(preset)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300 text-gray-600"
                        }`}
                      >
                        ₹{preset.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    className="w-full text-white"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={handleTopUp}
                    disabled={paying}
                    data-ocid="seller.ad_wallet.pay.button"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Razorpay
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-blue-400/30">
            <div>
              <p className="text-blue-200 text-xs">Total Spent</p>
              <p className="text-white font-bold text-lg">
                ₹
                {wallet.totalSpent.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-xs">Transactions</p>
              <p className="text-white font-bold text-lg">
                {wallet.transactions.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: ArrowUpCircle,
            label: "Total Credited",
            value: wallet.transactions
              .filter((t) => t.type === "credit")
              .reduce((s, t) => s + t.amount, 0),
            color: "#10B981",
            bg: "#f0fdf4",
          },
          {
            icon: ArrowDownCircle,
            label: "Total Debited",
            value: wallet.totalSpent,
            color: "#EF4444",
            bg: "#fef2f2",
          },
          {
            icon: TrendingDown,
            label: "Available Balance",
            value: wallet.balance,
            color: "#006AFF",
            bg: "#f0f6ff",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-800">Transaction Statement</h3>
        </div>
        {wallet.transactions.length === 0 ? (
          <div
            className="p-12 text-center"
            data-ocid="seller.ad_wallet.transactions.empty_state"
          >
            <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Add money to start running ad campaigns.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.map((tx, i) => (
                <TableRow
                  key={tx.id}
                  data-ocid={`seller.ad_wallet.transaction.item.${i + 1}`}
                >
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        tx.type === "credit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowUpCircle className="w-3 h-3" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3" />
                      )}
                      {tx.type === "credit" ? "Credit" : "Debit"}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`font-bold text-sm ${
                      tx.type === "credit" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹
                    {tx.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {tx.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
