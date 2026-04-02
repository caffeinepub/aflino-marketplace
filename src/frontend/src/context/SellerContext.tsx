import { createContext, useContext, useState } from "react";

export interface PendingSeller {
  id: string;
  businessName: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  fullAddress: string;
  state: string;
  submittedAt: string;
  sellerType: "gstin" | "enrollmentId";
  enrollmentId?: string;
  warehousePincode?: string;
}

interface SellerContextValue {
  pendingSellers: PendingSeller[];
  approvedSellerEmails: string[];
  approvedSellers: PendingSeller[];
  registerSeller: (data: Omit<PendingSeller, "id" | "submittedAt">) => void;
  approveSeller: (id: string) => void;
  rejectSeller: (id: string) => void;
  isApproved: (email: string) => boolean;
  getSellerByEmail: (email: string) => PendingSeller | undefined;
  updateSellerType: (
    id: string,
    type: "gstin" | "enrollmentId",
    enrollmentId?: string,
  ) => void;
}

const SellerContext = createContext<SellerContextValue>({
  pendingSellers: [],
  approvedSellerEmails: [],
  approvedSellers: [],
  registerSeller: () => {},
  approveSeller: () => {},
  rejectSeller: () => {},
  isApproved: () => false,
  getSellerByEmail: () => undefined,
  updateSellerType: () => {},
});

const INITIAL_APPROVED_EMAILS = [
  "techzone@aflino.com",
  "fashionhub@aflino.com",
  "homegoods@aflino.com",
  "seller@aflino.com",
];

const INITIAL_APPROVED_SELLERS: PendingSeller[] = [
  {
    id: "seller-1",
    businessName: "TechZone Store",
    gstin: "27AABCT1234A1Z5",
    pan: "AABCT1234A",
    email: "techzone@aflino.com",
    phone: "9876543210",
    fullAddress: "Plot 45, MIDC Industrial Area, Andheri East, Mumbai - 400093",
    state: "Maharashtra",
    submittedAt: "2026-01-01T00:00:00Z",
    sellerType: "gstin",
    warehousePincode: "400001",
  },
  {
    id: "seller-2",
    businessName: "Fashion Hub",
    gstin: "29AABCF5678B1Z3",
    pan: "AABCF5678B",
    email: "fashionhub@aflino.com",
    phone: "9845012345",
    fullAddress: "#12, 3rd Cross, Koramangala 5th Block, Bengaluru - 560095",
    state: "Karnataka",
    submittedAt: "2026-01-02T00:00:00Z",
    sellerType: "gstin",
    warehousePincode: "560001",
  },
  {
    id: "seller-3",
    businessName: "HomeGoods Plus",
    gstin: "07AABCH9012C1Z1",
    pan: "AABCH9012C",
    email: "homegoods@aflino.com",
    phone: "9911223344",
    fullAddress: "B-24, Okhla Phase II Industrial Area, New Delhi - 110020",
    state: "Delhi",
    submittedAt: "2026-01-03T00:00:00Z",
    sellerType: "gstin",
    warehousePincode: "110001",
  },
  {
    id: "seller-4",
    businessName: "My Store",
    gstin: "27AABCM3456D1Z9",
    pan: "AABCM3456D",
    email: "seller@aflino.com",
    phone: "9833445566",
    fullAddress: "C-15, Bandra Kurla Complex, Bandra East, Mumbai - 400051",
    state: "Maharashtra",
    submittedAt: "2026-01-04T00:00:00Z",
    sellerType: "gstin",
  },
];

const INITIAL_PENDING: PendingSeller[] = [
  {
    id: "pending-1",
    businessName: "EcoMarket",
    gstin: "27ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    email: "ecomarket@aflino.com",
    phone: "9700011122",
    fullAddress: "A-101, Green Park Society, Vile Parle West, Mumbai - 400056",
    state: "Maharashtra",
    submittedAt: "2026-03-20T10:30:00Z",
    sellerType: "gstin",
  },
];

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [pendingSellers, setPendingSellers] =
    useState<PendingSeller[]>(INITIAL_PENDING);
  const [approvedSellers, setApprovedSellers] = useState<PendingSeller[]>(
    INITIAL_APPROVED_SELLERS,
  );
  const [approvedSellerEmails, setApprovedSellerEmails] = useState<string[]>(
    INITIAL_APPROVED_EMAILS,
  );

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
        setApprovedSellers((sellers) => [...sellers, seller]);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const rejectSeller = (id: string) => {
    setPendingSellers((prev) => prev.filter((s) => s.id !== id));
  };

  const isApproved = (email: string) => approvedSellerEmails.includes(email);

  const getSellerByEmail = (email: string) =>
    approvedSellers.find((s) => s.email === email);

  const updateSellerType = (
    id: string,
    type: "gstin" | "enrollmentId",
    enrollmentId?: string,
  ) => {
    setApprovedSellers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              sellerType: type,
              enrollmentId:
                type === "enrollmentId"
                  ? enrollmentId || s.enrollmentId
                  : undefined,
            }
          : s,
      ),
    );
  };

  return (
    <SellerContext.Provider
      value={{
        pendingSellers,
        approvedSellerEmails,
        approvedSellers,
        registerSeller,
        approveSeller,
        rejectSeller,
        isApproved,
        getSellerByEmail,
        updateSellerType,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSellerContext() {
  return useContext(SellerContext);
}
