import { type ReactNode, createContext, useContext, useState } from "react";

export interface AdWalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  timestamp: string;
  orderId?: string;
}

export interface AdWallet {
  sellerEmail: string;
  balance: number;
  totalSpent: number;
  transactions: AdWalletTransaction[];
}

interface AdWalletContextType {
  wallets: AdWallet[];
  getWallet: (sellerEmail: string) => AdWallet;
  topUp: (sellerEmail: string, amount: number, razorpayOrderId: string) => void;
  deductClick: (
    sellerEmail: string,
    campaignId: string,
    productName: string,
    bidAmount: number,
  ) => boolean;
  adminCredit: (sellerEmail: string, amount: number, reason: string) => void;
  adminDebit: (sellerEmail: string, amount: number, reason: string) => void;
  getTotalEscrow: () => number;
}

const AdWalletContext = createContext<AdWalletContextType | null>(null);

function loadWallets(): AdWallet[] {
  try {
    return JSON.parse(localStorage.getItem("adWallets") || "[]");
  } catch {
    return [];
  }
}

function saveWallets(wallets: AdWallet[]) {
  localStorage.setItem("adWallets", JSON.stringify(wallets));
}

export function AdWalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<AdWallet[]>(loadWallets);

  const getWallet = (sellerEmail: string): AdWallet => {
    return (
      wallets.find((w) => w.sellerEmail === sellerEmail) ?? {
        sellerEmail,
        balance: 0,
        totalSpent: 0,
        transactions: [],
      }
    );
  };

  const updateWallets = (updated: AdWallet[]) => {
    setWallets(updated);
    saveWallets(updated);
  };

  const upsertWallet = (updated: AdWallet) => {
    setWallets((prev) => {
      const exists = prev.find((w) => w.sellerEmail === updated.sellerEmail);
      const next = exists
        ? prev.map((w) => (w.sellerEmail === updated.sellerEmail ? updated : w))
        : [...prev, updated];
      saveWallets(next);
      return next;
    });
  };

  const topUp = (
    sellerEmail: string,
    amount: number,
    razorpayOrderId: string,
  ) => {
    const wallet = getWallet(sellerEmail);
    const tx: AdWalletTransaction = {
      id: `txn_${Date.now()}`,
      type: "credit",
      amount,
      description: "Top-up via Razorpay",
      timestamp: new Date().toISOString(),
      orderId: razorpayOrderId,
    };
    upsertWallet({
      ...wallet,
      balance: wallet.balance + amount,
      transactions: [tx, ...wallet.transactions],
    });
  };

  const deductClick = (
    sellerEmail: string,
    campaignId: string,
    productName: string,
    bidAmount: number,
  ): boolean => {
    const wallet = getWallet(sellerEmail);
    if (wallet.balance < bidAmount) return false;
    const tx: AdWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: "debit",
      amount: bidAmount,
      description: `Click: ${productName} (Campaign ${campaignId.slice(0, 6)})`,
      timestamp: new Date().toISOString(),
    };
    upsertWallet({
      ...wallet,
      balance: wallet.balance - bidAmount,
      totalSpent: wallet.totalSpent + bidAmount,
      transactions: [tx, ...wallet.transactions],
    });
    return true;
  };

  const adminCredit = (sellerEmail: string, amount: number, reason: string) => {
    const wallet = getWallet(sellerEmail);
    const tx: AdWalletTransaction = {
      id: `txn_${Date.now()}`,
      type: "credit",
      amount,
      description: `Admin Credit: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    upsertWallet({
      ...wallet,
      balance: wallet.balance + amount,
      transactions: [tx, ...wallet.transactions],
    });
  };

  const adminDebit = (sellerEmail: string, amount: number, reason: string) => {
    const wallet = getWallet(sellerEmail);
    const tx: AdWalletTransaction = {
      id: `txn_${Date.now()}`,
      type: "debit",
      amount,
      description: `Admin Debit: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    upsertWallet({
      ...wallet,
      balance: Math.max(0, wallet.balance - amount),
      totalSpent: wallet.totalSpent + amount,
      transactions: [tx, ...wallet.transactions],
    });
  };

  const getTotalEscrow = (): number => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  };

  // Suppress TS warning on updateWallets being unused after refactor
  void updateWallets;

  return (
    <AdWalletContext.Provider
      value={{
        wallets,
        getWallet,
        topUp,
        deductClick,
        adminCredit,
        adminDebit,
        getTotalEscrow,
      }}
    >
      {children}
    </AdWalletContext.Provider>
  );
}

export function useAdWallet() {
  const ctx = useContext(AdWalletContext);
  if (!ctx) throw new Error("useAdWallet must be used within AdWalletProvider");
  return ctx;
}
