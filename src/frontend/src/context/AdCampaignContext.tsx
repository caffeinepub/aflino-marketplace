import { type ReactNode, createContext, useContext, useState } from "react";

export type AdType = "product_boost" | "banner_ad" | "video_spotlight";
export type AdStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paused"
  | "active"
  | "exhausted";
export type AdTarget = "search" | "home" | "all";

export interface AdCampaign {
  id: string;
  sellerEmail: string;
  sellerName: string;
  adType: AdType;
  status: AdStatus;

  // Product Boost specific
  productId?: number;
  productName?: string;

  // Banner Ad specific
  bannerImageUrl?: string;
  bannerTitle?: string;
  bannerCta?: string;

  // Video Spotlight specific
  videoUrl?: string;
  videoTitle?: string;

  // Common
  targeting: AdTarget;
  maxBidCpc: number;
  dailyBudget: number;
  totalBudgetSpent: number;
  todaySpent: number;
  lastResetDate: string;
  clicks: number;
  impressions: number;

  // RTB
  qualityScore: number;
  adRank: number;

  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PlacementConfig {
  searchAdPercent: number;
  homeAdPercent: number;
  accountAdPercent: number;
}

const DEFAULT_PLACEMENT: PlacementConfig = {
  searchAdPercent: 25,
  homeAdPercent: 15,
  accountAdPercent: 10,
};

interface AdCampaignContextType {
  campaigns: AdCampaign[];
  placementConfig: PlacementConfig;
  createCampaign: (
    data: Omit<
      AdCampaign,
      | "id"
      | "status"
      | "clicks"
      | "impressions"
      | "totalBudgetSpent"
      | "todaySpent"
      | "adRank"
      | "qualityScore"
      | "createdAt"
    >,
  ) => void;
  approveCampaign: (id: string) => void;
  rejectCampaign: (id: string, reason: string) => void;
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  updatePlacementConfig: (config: Partial<PlacementConfig>) => void;
  getSponsoredProductIds: (
    placement: "search" | "home",
    count: number,
  ) => number[];
  getApprovedBannerAds: () => AdCampaign[];
  getApprovedVideoSpotlights: () => AdCampaign[];
  recordClick: (id: string) => void;
  recordImpression: (id: string) => void;
  getSellerCampaigns: (sellerEmail: string) => AdCampaign[];
}

const AdCampaignContext = createContext<AdCampaignContextType | null>(null);

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function calcQuality(clicks: number, impressions: number, rating = 4): number {
  const ctr = impressions > 0 ? clicks / impressions : 0;
  return Math.min(10, ctr * 5 + rating);
}

function calcAdRank(bid: number, quality: number): number {
  return bid * quality;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed demo campaigns for first load
const DEMO_CAMPAIGNS: AdCampaign[] = [
  {
    id: "camp_demo_001",
    sellerEmail: "seller@aflino.com",
    sellerName: "TechMart India",
    adType: "product_boost",
    status: "active",
    productId: 1,
    productName: "Sony WH-1000XM5 Headphones",
    targeting: "all",
    maxBidCpc: 8,
    dailyBudget: 500,
    totalBudgetSpent: 148,
    todaySpent: 32,
    lastResetDate: today(),
    clicks: 42,
    impressions: 780,
    qualityScore: 4.3,
    adRank: 34.4,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "camp_demo_002",
    sellerEmail: "seller@aflino.com",
    sellerName: "TechMart India",
    adType: "banner_ad",
    status: "pending",
    bannerTitle: "Monsoon Electronics Sale — Up to 40% Off",
    bannerCta: "Shop Now",
    targeting: "home",
    maxBidCpc: 12,
    dailyBudget: 750,
    totalBudgetSpent: 0,
    todaySpent: 0,
    lastResetDate: today(),
    clicks: 0,
    impressions: 0,
    qualityScore: 4.0,
    adRank: 48,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function AdCampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => {
    const saved = load<AdCampaign[]>("adCampaigns", []);
    return saved.length > 0 ? saved : DEMO_CAMPAIGNS;
  });

  const [placementConfig, setPlacementConfig] = useState<PlacementConfig>(() =>
    load("adPlacementConfig", DEFAULT_PLACEMENT),
  );

  const persist = (updated: AdCampaign[]) => {
    setCampaigns(updated);
    save("adCampaigns", updated);
  };

  const resetDailyBudgetIfNeeded = (c: AdCampaign): AdCampaign => {
    if (c.lastResetDate !== today()) {
      return { ...c, todaySpent: 0, lastResetDate: today() };
    }
    return c;
  };

  const createCampaign = (
    data: Omit<
      AdCampaign,
      | "id"
      | "status"
      | "clicks"
      | "impressions"
      | "totalBudgetSpent"
      | "todaySpent"
      | "adRank"
      | "qualityScore"
      | "createdAt"
    >,
  ) => {
    const quality = calcQuality(0, 0);
    const newCampaign: AdCampaign = {
      ...data,
      id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status: "pending",
      clicks: 0,
      impressions: 0,
      totalBudgetSpent: 0,
      todaySpent: 0,
      qualityScore: quality,
      adRank: calcAdRank(data.maxBidCpc, quality),
      lastResetDate: today(),
      createdAt: new Date().toISOString(),
    };
    persist([...campaigns, newCampaign]);
  };

  const approveCampaign = (id: string) => {
    persist(
      campaigns.map((c) =>
        c.id === id
          ? { ...c, status: "active", approvedAt: new Date().toISOString() }
          : c,
      ),
    );
  };

  const rejectCampaign = (id: string, reason: string) => {
    persist(
      campaigns.map((c) =>
        c.id === id ? { ...c, status: "rejected", rejectionReason: reason } : c,
      ),
    );
  };

  const pauseCampaign = (id: string) => {
    persist(
      campaigns.map((c) =>
        c.id === id && c.status === "active" ? { ...c, status: "paused" } : c,
      ),
    );
  };

  const resumeCampaign = (id: string) => {
    persist(
      campaigns.map((c) =>
        c.id === id && c.status === "paused" ? { ...c, status: "active" } : c,
      ),
    );
  };

  const updatePlacementConfig = (config: Partial<PlacementConfig>) => {
    const updated = { ...placementConfig, ...config };
    setPlacementConfig(updated);
    save("adPlacementConfig", updated);
  };

  const isActive = (c: AdCampaign, placement: "search" | "home") => {
    if (c.status !== "active") return false;
    if (c.adType !== "product_boost") return false;
    if (c.targeting !== "all" && c.targeting !== placement) return false;
    const refreshed = resetDailyBudgetIfNeeded(c);
    if (refreshed.todaySpent >= refreshed.dailyBudget) return false;
    return true;
  };

  const getSponsoredProductIds = (
    placement: "search" | "home",
    count: number,
  ): number[] => {
    const active = campaigns
      .filter((c) => isActive(c, placement))
      .sort((a, b) => b.adRank - a.adRank)
      .slice(0, count);
    return active
      .map((c) => c.productId)
      .filter((id): id is number => id !== undefined);
  };

  const getApprovedBannerAds = (): AdCampaign[] =>
    campaigns.filter((c) => c.adType === "banner_ad" && c.status === "active");

  const getApprovedVideoSpotlights = (): AdCampaign[] =>
    campaigns.filter(
      (c) => c.adType === "video_spotlight" && c.status === "active",
    );

  const recordClick = (id: string) => {
    persist(
      campaigns.map((c) => {
        if (c.id !== id) return c;
        const newClicks = c.clicks + 1;
        const quality = calcQuality(newClicks, c.impressions);
        return {
          ...c,
          clicks: newClicks,
          qualityScore: quality,
          adRank: calcAdRank(c.maxBidCpc, quality),
          todaySpent: c.todaySpent + c.maxBidCpc,
          totalBudgetSpent: c.totalBudgetSpent + c.maxBidCpc,
        };
      }),
    );
  };

  const recordImpression = (id: string) => {
    persist(
      campaigns.map((c) => {
        if (c.id !== id) return c;
        const newImpressions = c.impressions + 1;
        const quality = calcQuality(c.clicks, newImpressions);
        return {
          ...c,
          impressions: newImpressions,
          qualityScore: quality,
          adRank: calcAdRank(c.maxBidCpc, quality),
        };
      }),
    );
  };

  const getSellerCampaigns = (sellerEmail: string): AdCampaign[] =>
    campaigns.filter((c) => c.sellerEmail === sellerEmail);

  return (
    <AdCampaignContext.Provider
      value={{
        campaigns,
        placementConfig,
        createCampaign,
        approveCampaign,
        rejectCampaign,
        pauseCampaign,
        resumeCampaign,
        updatePlacementConfig,
        getSponsoredProductIds,
        getApprovedBannerAds,
        getApprovedVideoSpotlights,
        recordClick,
        recordImpression,
        getSellerCampaigns,
      }}
    >
      {children}
    </AdCampaignContext.Provider>
  );
}

export function useAdCampaign() {
  const ctx = useContext(AdCampaignContext);
  if (!ctx)
    throw new Error("useAdCampaign must be used within AdCampaignProvider");
  return ctx;
}
