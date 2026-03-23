import { createContext, useContext, useState } from "react";

export interface DeliveredOrder {
  id: string;
  sellerEmail: string;
  sellerName: string;
  productName: string;
  orderAmount: number;
  deliveredAt: string;
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
}

interface WalletContextValue {
  commissionRate: number;
  minPayoutAmount: number;
  deliveredOrders: DeliveredOrder[];
  payoutRequests: PayoutRequest[];
  payoutHistory: PayoutHistory[];
  setCommissionRate: (rate: number) => void;
  setMinPayoutAmount: (amount: number) => void;
  getSellerEarnings: (email: string) => number;
  getSellerPendingBalance: (email: string) => number;
  requestPayout: (sellerEmail: string, sellerName: string) => void;
  approvePayout: (requestId: string, paidAmount: number) => void;
  rejectPayout: (requestId: string) => void;
}

const WalletContext = createContext<WalletContextValue>({
  commissionRate: 10,
  minPayoutAmount: 500,
  deliveredOrders: [],
  payoutRequests: [],
  payoutHistory: [],
  setCommissionRate: () => {},
  setMinPayoutAmount: () => {},
  getSellerEarnings: () => 0,
  getSellerPendingBalance: () => 0,
  requestPayout: () => {},
  approvePayout: () => {},
  rejectPayout: () => {},
});

const INITIAL_DELIVERED_ORDERS: DeliveredOrder[] = [
  {
    id: "order-1",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    productName: "Wireless Bluetooth Headphones",
    orderAmount: 2999,
    deliveredAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "order-2",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    productName: "USB-C Fast Charging Hub",
    orderAmount: 1499,
    deliveredAt: "2026-03-14T10:30:00Z",
  },
  {
    id: "order-3",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    productName: "Floral Summer Dress",
    orderAmount: 1999,
    deliveredAt: "2026-03-12T09:15:00Z",
  },
  {
    id: "order-4",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    productName: "Men's Casual Sneakers",
    orderAmount: 899,
    deliveredAt: "2026-03-16T17:45:00Z",
  },
  {
    id: "order-5",
    sellerEmail: "homegoods@aflino.com",
    sellerName: "HomeGoods Co.",
    productName: "Premium Non-Stick Cookware Set",
    orderAmount: 3499,
    deliveredAt: "2026-03-18T12:00:00Z",
  },
];

const INITIAL_PAYOUT_HISTORY: PayoutHistory[] = [
  {
    id: "payout-hist-1",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    paidAmount: 2000,
    paidAt: "2026-03-15T11:00:00Z",
  },
];

const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: "req-1",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    requestedAmount: 2607.3,
    requestedAt: "2026-03-19T08:00:00Z",
    status: "pending",
  },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [commissionRate, setCommissionRate] = useState(10);
  const [minPayoutAmount, setMinPayoutAmount] = useState(500);
  const [deliveredOrders] = useState<DeliveredOrder[]>(
    INITIAL_DELIVERED_ORDERS,
  );
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(
    INITIAL_PAYOUT_REQUESTS,
  );
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>(
    INITIAL_PAYOUT_HISTORY,
  );

  const getSellerEarnings = (email: string) => {
    return deliveredOrders
      .filter((o) => o.sellerEmail === email)
      .reduce((sum, o) => sum + o.orderAmount * (1 - commissionRate / 100), 0);
  };

  const getSellerPendingBalance = (email: string) => {
    const earnings = getSellerEarnings(email);
    const paid = payoutHistory
      .filter((p) => p.sellerEmail === email)
      .reduce((sum, p) => sum + p.paidAmount, 0);
    return Math.max(0, earnings - paid);
  };

  const requestPayout = (sellerEmail: string, sellerName: string) => {
    const amount = getSellerPendingBalance(sellerEmail);
    const newRequest: PayoutRequest = {
      id: `req-${Date.now()}`,
      sellerEmail,
      sellerName,
      requestedAmount: amount,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    setPayoutRequests((prev) => [...prev, newRequest]);
  };

  const approvePayout = (requestId: string, paidAmount: number) => {
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
        deliveredOrders,
        payoutRequests,
        payoutHistory,
        setCommissionRate,
        setMinPayoutAmount,
        getSellerEarnings,
        getSellerPendingBalance,
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
