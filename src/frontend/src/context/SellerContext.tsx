import { createContext, useContext, useState } from "react";

export interface PendingSeller {
  id: string;
  businessName: string;
  gst: string;
  email: string;
  submittedAt: string;
}

interface SellerContextValue {
  pendingSellers: PendingSeller[];
  approvedSellerEmails: string[];
  registerSeller: (data: Omit<PendingSeller, "id" | "submittedAt">) => void;
  approveSeller: (id: string) => void;
  rejectSeller: (id: string) => void;
  isApproved: (email: string) => boolean;
}

const SellerContext = createContext<SellerContextValue>({
  pendingSellers: [],
  approvedSellerEmails: [],
  registerSeller: () => {},
  approveSeller: () => {},
  rejectSeller: () => {},
  isApproved: () => false,
});

const INITIAL_APPROVED = [
  "techzone@aflino.com",
  "fashionhub@aflino.com",
  "homegoods@aflino.com",
  "seller@aflino.com",
];

const INITIAL_PENDING: PendingSeller[] = [
  {
    id: "pending-1",
    businessName: "EcoMarket",
    gst: "27ABCDE1234F1Z5",
    email: "ecomarket@aflino.com",
    submittedAt: "2026-03-20T10:30:00Z",
  },
];

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [pendingSellers, setPendingSellers] =
    useState<PendingSeller[]>(INITIAL_PENDING);
  const [approvedSellerEmails, setApprovedSellerEmails] =
    useState<string[]>(INITIAL_APPROVED);

  const registerSeller = (data: Omit<PendingSeller, "id" | "submittedAt">) => {
    const newSeller: PendingSeller = {
      ...data,
      id: `pending-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setPendingSellers((prev) => [...prev, newSeller]);
  };

  const approveSeller = (id: string) => {
    setPendingSellers((prev) => {
      const seller = prev.find((s) => s.id === id);
      if (seller) {
        setApprovedSellerEmails((emails) => [...emails, seller.email]);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const rejectSeller = (id: string) => {
    setPendingSellers((prev) => prev.filter((s) => s.id !== id));
  };

  const isApproved = (email: string) => approvedSellerEmails.includes(email);

  return (
    <SellerContext.Provider
      value={{
        pendingSellers,
        approvedSellerEmails,
        registerSeller,
        approveSeller,
        rejectSeller,
        isApproved,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSellerContext() {
  return useContext(SellerContext);
}
