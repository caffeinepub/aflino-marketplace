import { createContext, useContext, useEffect, useState } from "react";

export interface CoinTransaction {
  txId: string;
  userId: string;
  amount: number; // positive = earned, negative = redeemed
  reason: string;
  createdAt: number;
}

interface CustomerCoinContextValue {
  getCoinBalance: (userId: string) => number;
  getCoinHistory: (userId: string) => CoinTransaction[];
  addCoins: (userId: string, amount: number, reason: string) => void;
  redeemCoins: (
    userId: string,
    coinsToRedeem: number,
    orderId: string,
  ) => number; // returns discount in rupees
}

const CustomerCoinContext = createContext<CustomerCoinContextValue>({
  getCoinBalance: () => 0,
  getCoinHistory: () => [],
  addCoins: () => {},
  redeemCoins: () => 0,
});

function loadTransactions(): CoinTransaction[] {
  try {
    const stored = localStorage.getItem("aflino_coins");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    {
      txId: "coin-seed-1",
      userId: "demo-customer",
      amount: 15,
      reason: "Photo review reward (3 photos)",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      txId: "coin-seed-2",
      userId: "demo-customer",
      amount: 5,
      reason: "Photo review reward (1 photo)",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      txId: "coin-seed-3",
      userId: "demo-customer",
      amount: -10,
      reason: "Order Discount (Order ID: #ORD-483920): -10 Coins",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
  ];
}

export function CustomerCoinProvider({
  children,
}: { children: React.ReactNode }) {
  const [transactions, setTransactions] =
    useState<CoinTransaction[]>(loadTransactions);

  useEffect(() => {
    try {
      localStorage.setItem("aflino_coins", JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  function getCoinBalance(userId: string): number {
    return transactions
      .filter((t) => t.userId === userId)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function getCoinHistory(userId: string): CoinTransaction[] {
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function addCoins(userId: string, amount: number, reason: string) {
    const newTx: CoinTransaction = {
      txId: `coin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      amount,
      reason,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }

  function redeemCoins(
    userId: string,
    coinsToRedeem: number,
    orderId: string,
  ): number {
    const balance = getCoinBalance(userId);
    const actual = Math.min(coinsToRedeem, balance);
    if (actual <= 0) return 0;
    const newTx: CoinTransaction = {
      txId: `coin-redeem-${Date.now()}`,
      userId,
      amount: -actual,
      reason: `Order Discount (Order ID: #${orderId}): -${actual} Coins`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return actual; // 1 coin = ₹1
  }

  return (
    <CustomerCoinContext.Provider
      value={{ getCoinBalance, getCoinHistory, addCoins, redeemCoins }}
    >
      {children}
    </CustomerCoinContext.Provider>
  );
}

export function useCustomerCoins() {
  return useContext(CustomerCoinContext);
}
