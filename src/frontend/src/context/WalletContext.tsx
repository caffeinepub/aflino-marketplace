import { createContext, useContext, useState } from "react";

export interface WalletEntry {
  id: string;
  orderId: string;
  sellerEmail: string;
  sellerName: string;
  productName: string;
  orderAmount: number;
  commission: number;
  netEarning: number;
  deliveredAt: string;
  shippingFee?: number;
  category?: string;
  commissionRateApplied?: number;
}

export interface PayoutRequest {
  id: string;
  sellerEmail: string;
  sellerName: string;
  requestedAmount: number;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PayoutHistory {
  id: string;
  sellerEmail: string;
  sellerName: string;
  paidAmount: number;
  paidAt: string;
  transactionId: string;
  paymentMethod: string;
}

const HOLDING_DAYS = 15;

function isPastHolding(deliveredAt: string): boolean {
  const ms = HOLDING_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(deliveredAt).getTime() >= ms;
}

interface WalletContextValue {
  commissionRate: number;
  minPayoutAmount: number;
  walletEntries: WalletEntry[];
  payoutRequests: PayoutRequest[];
  payoutHistory: PayoutHistory[];
  categoryRates: Record<string, number>;
  setCommissionRate: (rate: number) => void;
  setMinPayoutAmount: (amount: number) => void;
  setCategoryRates: (rates: Record<string, number>) => void;
  getCategoryRate: (category: string) => number;
  addWalletEntry: (
    entry: Omit<WalletEntry, "id" | "commission" | "netEarning">,
  ) => void;
  getSellerPendingBalance: (email: string) => number;
  getSellerAvailableBalance: (email: string) => number;
  getTotalAdminCommission: () => number;
  requestPayout: (sellerEmail: string, sellerName: string) => void;
  approvePayout: (
    requestId: string,
    paidAmount: number,
    paymentMethod: string,
  ) => void;
  rejectPayout: (requestId: string) => void;
}

const WalletContext = createContext<WalletContextValue>({
  commissionRate: 10,
  minPayoutAmount: 500,
  walletEntries: [],
  payoutRequests: [],
  payoutHistory: [],
  categoryRates: {},
  setCommissionRate: () => {},
  setMinPayoutAmount: () => {},
  setCategoryRates: () => {},
  getCategoryRate: () => 10,
  addWalletEntry: () => {},
  getSellerPendingBalance: () => 0,
  getSellerAvailableBalance: () => 0,
  getTotalAdminCommission: () => 0,
  requestPayout: () => {},
  approvePayout: () => {},
  rejectPayout: () => {},
});

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

const INITIAL_WALLET_ENTRIES: WalletEntry[] = [
  {
    id: "we-1",
    orderId: "order-1",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    productName: "Wireless Bluetooth Headphones",
    orderAmount: 2999,
    commission: 299.9,
    netEarning: 2699.1,
    deliveredAt: daysAgo(20),
    shippingFee: 50,
    category: "electronics",
    commissionRateApplied: 10,
  },
  {
    id: "we-2",
    orderId: "order-2",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    productName: "USB-C Fast Charging Hub",
    orderAmount: 1499,
    commission: 149.9,
    netEarning: 1349.1,
    deliveredAt: daysAgo(18),
    shippingFee: 50,
    category: "gadgets",
    commissionRateApplied: 10,
  },
  {
    id: "we-3",
    orderId: "order-3",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    productName: "Floral Summer Dress",
    orderAmount: 1999,
    commission: 199.9,
    netEarning: 1799.1,
    deliveredAt: daysAgo(7),
    shippingFee: 70,
    category: "fashion",
    commissionRateApplied: 10,
  },
  {
    id: "we-4",
    orderId: "order-4",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    productName: "Men's Casual Sneakers",
    orderAmount: 899,
    commission: 89.9,
    netEarning: 809.1,
    deliveredAt: daysAgo(3),
    shippingFee: 50,
    category: "fashion",
    commissionRateApplied: 10,
  },
  {
    id: "we-5",
    orderId: "order-5",
    sellerEmail: "homegoods@aflino.com",
    sellerName: "HomeGoods Co.",
    productName: "Premium Non-Stick Cookware Set",
    orderAmount: 3499,
    commission: 349.9,
    netEarning: 3149.1,
    deliveredAt: daysAgo(5),
    shippingFee: 90,
    category: "home",
    commissionRateApplied: 10,
  },
];

const INITIAL_PAYOUT_HISTORY: PayoutHistory[] = [
  {
    id: "payout-hist-1",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    paidAmount: 2000,
    paidAt: daysAgo(2),
    transactionId: "TXN-2026-03150001",
    paymentMethod: "Bank Transfer",
  },
];

const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: "req-1",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    requestedAmount: 1799.1,
    requestedAt: daysAgo(1),
    status: "pending",
  },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [commissionRate, setCommissionRate] = useState(10);
  const [minPayoutAmount, setMinPayoutAmount] = useState(500);
  const [categoryRates, setCategoryRates] = useState<Record<string, number>>(
    {},
  );
  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>(
    INITIAL_WALLET_ENTRIES,
  );
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(
    INITIAL_PAYOUT_REQUESTS,
  );
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>(
    INITIAL_PAYOUT_HISTORY,
  );

  const getCategoryRate = (category: string): number => {
    if (category && typeof categoryRates[category] === "number") {
      return categoryRates[category];
    }
    return commissionRate;
  };

  const addWalletEntry = (
    entry: Omit<WalletEntry, "id" | "commission" | "netEarning">,
  ) => {
    // Compute rate BEFORE the setState callback to capture in closure correctly
    const rate = getCategoryRate(entry.category ?? "");
    setWalletEntries((prev) => {
      if (prev.some((e) => e.orderId === entry.orderId)) return prev;
      const commission = Number.parseFloat(
        (entry.orderAmount * (rate / 100)).toFixed(2),
      );
      const netEarning = Number.parseFloat(
        (entry.orderAmount - commission).toFixed(2),
      );
      return [
        ...prev,
        {
          ...entry,
          id: `we-${Date.now()}`,
          commission,
          netEarning,
          commissionRateApplied: rate,
        },
      ];
    });
  };

  const getSellerPendingBalance = (email: string): number => {
    return walletEntries
      .filter((e) => e.sellerEmail === email && !isPastHolding(e.deliveredAt))
      .reduce((sum, e) => sum + e.netEarning, 0);
  };

  const getSellerAvailableBalance = (email: string): number => {
    const releasedEarnings = walletEntries
      .filter((e) => e.sellerEmail === email && isPastHolding(e.deliveredAt))
      .reduce((sum, e) => sum + e.netEarning, 0);
    const totalPaid = payoutHistory
      .filter((p) => p.sellerEmail === email)
      .reduce((sum, p) => sum + p.paidAmount, 0);
    return Math.max(0, releasedEarnings - totalPaid);
  };

  const getTotalAdminCommission = (): number => {
    return walletEntries.reduce((sum, e) => sum + e.commission, 0);
  };

  const requestPayout = (sellerEmail: string, sellerName: string) => {
    const amount = getSellerAvailableBalance(sellerEmail);
    setPayoutRequests((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}`,
        sellerEmail,
        sellerName,
        requestedAmount: amount,
        requestedAt: new Date().toISOString(),
        status: "pending",
      },
    ]);
  };

  const approvePayout = (
    requestId: string,
    paidAmount: number,
    paymentMethod: string,
  ) => {
    setPayoutRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "approved" as const } : r,
      ),
    );
    const req = payoutRequests.find((r) => r.id === requestId);
    if (req) {
      setPayoutHistory((prev) => [
        ...prev,
        {
          id: `payout-hist-${Date.now()}`,
          sellerEmail: req.sellerEmail,
          sellerName: req.sellerName,
          paidAmount,
          paidAt: new Date().toISOString(),
          transactionId: `TXN-${Date.now()}`,
          paymentMethod,
        },
      ]);
    }
  };

  const rejectPayout = (requestId: string) => {
    setPayoutRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "rejected" as const } : r,
      ),
    );
  };

  return (
    <WalletContext.Provider
      value={{
        commissionRate,
        minPayoutAmount,
        walletEntries,
        payoutRequests,
        payoutHistory,
        categoryRates,
        setCommissionRate,
        setMinPayoutAmount,
        setCategoryRates,
        getCategoryRate,
        addWalletEntry,
        getSellerPendingBalance,
        getSellerAvailableBalance,
        getTotalAdminCommission,
        requestPayout,
        rejectPayout,
        approvePayout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
