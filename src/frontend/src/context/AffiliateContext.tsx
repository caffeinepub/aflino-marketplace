import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AffiliateStatus = "pending" | "approved" | "rejected";
export type AffiliateTier = "normal" | "creator";
export type CommissionStatus = "pending" | "withdrawable" | "paid";

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  socialLinks: { platform: string; url: string }[];
  idProof: {
    name: string;
    sizeKB: number;
    url: string;
    type: "pan" | "aadhaar";
  };
  bankDetails: { accountNo: string; ifsc: string; bankName: string };
  status: AffiliateStatus;
  rejectionReason?: string;
  tier: AffiliateTier;
  apiEnabled: boolean;
  referralCode: string;
  joinedAt: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  orderId: string;
  productName: string;
  category: string;
  saleAmount: number;
  commissionAmount: number;
  status: CommissionStatus;
  orderDate: string;
  releasesAt: string;
}

export interface AffiliateVideo {
  id: string;
  affiliateId: string;
  affiliateName: string;
  url: string;
  platform: "youtube" | "instagram";
  title: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export interface TierCommission {
  category: string;
  normalRate: number;
  creatorRate: number;
}

interface AffiliateContextType {
  affiliates: Affiliate[];
  commissions: AffiliateCommission[];
  videos: AffiliateVideo[];
  tierCommissions: TierCommission[];
  registerAffiliate: (
    data: Omit<
      Affiliate,
      "id" | "status" | "tier" | "apiEnabled" | "referralCode" | "joinedAt"
    >,
  ) => string;
  approveAffiliate: (id: string) => void;
  rejectAffiliate: (id: string, reason: string) => void;
  toggleApiAccess: (id: string) => void;
  setAffiliateTier: (id: string, tier: AffiliateTier) => void;
  addVideo: (
    affiliateId: string,
    url: string,
    title: string,
    platform: "youtube" | "instagram",
  ) => void;
  approveVideo: (id: string) => void;
  rejectVideo: (id: string) => void;
  addCommission: (
    affiliateId: string,
    orderId: string,
    productName: string,
    category: string,
    saleAmount: number,
  ) => void;
  autoTransitionCommissions: () => void;
  markCommissionPaid: (id: string) => void;
  updateTierCommissions: (rates: TierCommission[]) => void;
}

const defaultTierCommissions: TierCommission[] = [
  { category: "Electronics", normalRate: 3, creatorRate: 6 },
  { category: "Fashion", normalRate: 5, creatorRate: 8 },
  { category: "Beauty", normalRate: 4, creatorRate: 7 },
  { category: "Home", normalRate: 2, creatorRate: 4 },
  { category: "Books", normalRate: 3, creatorRate: 5 },
];

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AFF-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const now = new Date();
const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

const DEMO_AFFILIATES: Affiliate[] = [
  {
    id: "aff-001",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543210",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/priyasharma" },
      { platform: "YouTube", url: "https://youtube.com/@priyasharma" },
    ],
    idProof: { name: "pan_priya.jpg", sizeKB: 90, url: "", type: "pan" },
    bankDetails: {
      accountNo: "1234567890",
      ifsc: "HDFC0001234",
      bankName: "HDFC Bank",
    },
    status: "pending",
    tier: "normal",
    apiEnabled: false,
    referralCode: "AFF-PRIYA1",
    joinedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aff-002",
    name: "Rohit Verma",
    email: "rohit@example.com",
    phone: "9812345678",
    socialLinks: [
      { platform: "YouTube", url: "https://youtube.com/@rohitverma" },
      { platform: "Instagram", url: "https://instagram.com/rohitverma" },
    ],
    idProof: {
      name: "aadhaar_rohit.jpg",
      sizeKB: 320,
      url: "",
      type: "aadhaar",
    },
    bankDetails: {
      accountNo: "9876543210",
      ifsc: "ICIC0002345",
      bankName: "ICICI Bank",
    },
    status: "approved",
    tier: "creator",
    apiEnabled: true,
    referralCode: "AFF-ROHIT2",
    joinedAt: fifteenDaysAgo.toISOString(),
  },
  {
    id: "aff-003",
    name: "Meena Patel",
    email: "meena@example.com",
    phone: "9898989898",
    socialLinks: [{ platform: "Blog", url: "https://meenapatel.blog" }],
    idProof: { name: "pan_meena.jpg", sizeKB: 200, url: "", type: "pan" },
    bankDetails: {
      accountNo: "1122334455",
      ifsc: "SBIN0001122",
      bankName: "SBI",
    },
    status: "rejected",
    rejectionReason:
      "Document quality was insufficient. Please re-upload a clear scan.",
    tier: "normal",
    apiEnabled: false,
    referralCode: "AFF-MEENA3",
    joinedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_VIDEOS: AffiliateVideo[] = [
  {
    id: "vid-001",
    affiliateId: "aff-002",
    affiliateName: "Rohit Verma",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    platform: "youtube",
    title: "Top 5 Budget Electronics from AFLINO",
    status: "approved",
    submittedAt: fifteenDaysAgo.toISOString(),
  },
  {
    id: "vid-002",
    affiliateId: "aff-002",
    affiliateName: "Rohit Verma",
    url: "https://www.instagram.com/reel/abc123",
    platform: "instagram",
    title: "AFLINO Fashion Haul 2025",
    status: "approved",
    submittedAt: tenDaysAgo.toISOString(),
  },
];

const DEMO_COMMISSIONS: AffiliateCommission[] = [
  {
    id: "com-001",
    affiliateId: "aff-002",
    orderId: "ORD-78901",
    productName: "Wireless Bluetooth Headphones",
    category: "Electronics",
    saleAmount: 2499,
    commissionAmount: 150,
    status: "withdrawable",
    orderDate: fifteenDaysAgo.toISOString(),
    releasesAt: new Date(
      fifteenDaysAgo.getTime() + 10 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  },
  {
    id: "com-002",
    affiliateId: "aff-002",
    orderId: "ORD-78902",
    productName: "Cotton Kurta Set",
    category: "Fashion",
    saleAmount: 899,
    commissionAmount: 72,
    status: "withdrawable",
    orderDate: tenDaysAgo.toISOString(),
    releasesAt: new Date(
      tenDaysAgo.getTime() + 10 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  },
  {
    id: "com-003",
    affiliateId: "aff-002",
    orderId: "ORD-78903",
    productName: "Face Serum Premium",
    category: "Beauty",
    saleAmount: 1299,
    commissionAmount: 91,
    status: "pending",
    orderDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    releasesAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STORAGE_KEY = "aflino_affiliate_data";

interface StoredData {
  affiliates: Affiliate[];
  commissions: AffiliateCommission[];
  videos: AffiliateVideo[];
  tierCommissions: TierCommission[];
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    affiliates: DEMO_AFFILIATES,
    commissions: DEMO_COMMISSIONS,
    videos: DEMO_VIDEOS,
    tierCommissions: defaultTierCommissions,
  };
}

const AffiliateContext = createContext<AffiliateContextType>({
  affiliates: [],
  commissions: [],
  videos: [],
  tierCommissions: defaultTierCommissions,
  registerAffiliate: () => "",
  approveAffiliate: () => {},
  rejectAffiliate: () => {},
  toggleApiAccess: () => {},
  setAffiliateTier: () => {},
  addVideo: () => {},
  approveVideo: () => {},
  rejectVideo: () => {},
  addCommission: () => {},
  autoTransitionCommissions: () => {},
  markCommissionPaid: () => {},
  updateTierCommissions: () => {},
});

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const initial = loadData();
  const [affiliates, setAffiliates] = useState<Affiliate[]>(initial.affiliates);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>(
    initial.commissions,
  );
  const [videos, setVideos] = useState<AffiliateVideo[]>(initial.videos);
  const [tierCommissions, setTierCommissions] = useState<TierCommission[]>(
    initial.tierCommissions,
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ affiliates, commissions, videos, tierCommissions }),
    );
  }, [affiliates, commissions, videos, tierCommissions]);

  const registerAffiliate = useCallback(
    (
      data: Omit<
        Affiliate,
        "id" | "status" | "tier" | "apiEnabled" | "referralCode" | "joinedAt"
      >,
    ) => {
      const id = `aff-${Date.now()}`;
      const newAffiliate: Affiliate = {
        ...data,
        id,
        status: "pending",
        tier: "normal",
        apiEnabled: false,
        referralCode: generateReferralCode(),
        joinedAt: new Date().toISOString(),
      };
      setAffiliates((prev) => [newAffiliate, ...prev]);
      return id;
    },
    [],
  );

  const approveAffiliate = useCallback((id: string) => {
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as AffiliateStatus } : a,
      ),
    );
  }, []);

  const rejectAffiliate = useCallback((id: string, reason: string) => {
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "rejected" as AffiliateStatus,
              rejectionReason: reason,
            }
          : a,
      ),
    );
  }, []);

  const toggleApiAccess = useCallback((id: string) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, apiEnabled: !a.apiEnabled } : a)),
    );
  }, []);

  const setAffiliateTier = useCallback((id: string, tier: AffiliateTier) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, tier } : a)),
    );
  }, []);

  const addVideo = useCallback(
    (
      affiliateId: string,
      url: string,
      title: string,
      platform: "youtube" | "instagram",
    ) => {
      const affiliate = affiliates.find((a) => a.id === affiliateId);
      const newVideo: AffiliateVideo = {
        id: `vid-${Date.now()}`,
        affiliateId,
        affiliateName: affiliate?.name ?? "Unknown",
        url,
        platform,
        title,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      setVideos((prev) => [newVideo, ...prev]);
    },
    [affiliates],
  );

  const approveVideo = useCallback((id: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "approved" as const } : v,
      ),
    );
  }, []);

  const rejectVideo = useCallback((id: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "rejected" as const } : v,
      ),
    );
  }, []);

  const addCommission = useCallback(
    (
      affiliateId: string,
      orderId: string,
      productName: string,
      category: string,
      saleAmount: number,
    ) => {
      const affiliate = affiliates.find((a) => a.id === affiliateId);
      const tierRates = tierCommissions.find(
        (t) => t.category.toLowerCase() === category.toLowerCase(),
      );
      const rate =
        affiliate?.tier === "creator"
          ? (tierRates?.creatorRate ?? 5)
          : (tierRates?.normalRate ?? 3);
      const commissionAmount = Math.round((saleAmount * rate) / 100);
      const orderDate = new Date().toISOString();
      const releasesAt = new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const newCommission: AffiliateCommission = {
        id: `com-${Date.now()}`,
        affiliateId,
        orderId,
        productName,
        category,
        saleAmount,
        commissionAmount,
        status: "pending",
        orderDate,
        releasesAt,
      };
      setCommissions((prev) => [newCommission, ...prev]);
    },
    [affiliates, tierCommissions],
  );

  const autoTransitionCommissions = useCallback(() => {
    const now = Date.now();
    setCommissions((prev) =>
      prev.map((c) => {
        if (c.status === "pending" && new Date(c.releasesAt).getTime() <= now) {
          return { ...c, status: "withdrawable" as CommissionStatus };
        }
        return c;
      }),
    );
  }, []);

  const markCommissionPaid = useCallback((id: string) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "paid" as CommissionStatus } : c,
      ),
    );
  }, []);

  const updateTierCommissions = useCallback((rates: TierCommission[]) => {
    setTierCommissions(rates);
  }, []);

  return (
    <AffiliateContext.Provider
      value={{
        affiliates,
        commissions,
        videos,
        tierCommissions,
        registerAffiliate,
        approveAffiliate,
        rejectAffiliate,
        toggleApiAccess,
        setAffiliateTier,
        addVideo,
        approveVideo,
        rejectVideo,
        addCommission,
        autoTransitionCommissions,
        markCommissionPaid,
        updateTierCommissions,
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate() {
  return useContext(AffiliateContext);
}
