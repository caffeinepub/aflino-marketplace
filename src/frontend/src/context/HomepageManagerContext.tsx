import { ExternalBlob } from "@/backend";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export interface HomepageBanner {
  id: string;
  imageUrl: string;
  title: string;
  redirectLink: string;
  order: number;
  scheduleStart?: string; // ISO datetime string
  scheduleEnd?: string; // ISO datetime string
}

export interface HomepageCategory {
  id: string;
  imageUrl: string;
  label: string;
  order: number;
}

export interface HomepageBrand {
  id: string;
  name: string;
  abbr: string;
  color: string;
  order: number;
  logoUrl?: string;
  enabled: boolean;
}

export interface CategoryFeedConfig {
  id: string;
  categoryName: string;
  title: string;
  enabled: boolean;
  order: number;
}

export interface HomepageSection {
  id: string;
  key:
    | "banners"
    | "categories"
    | "brands"
    | "feeds"
    | "recently_viewed"
    | "flash_sale";
  label: string;
  order: number;
}

/** Returns true if the banner should be shown right now */
export function isBannerActive(banner: HomepageBanner): boolean {
  const now = Date.now();
  if (banner.scheduleStart && now < new Date(banner.scheduleStart).getTime())
    return false;
  if (banner.scheduleEnd && now >= new Date(banner.scheduleEnd).getTime())
    return false;
  return true;
}

const LS_BANNERS = "aflino_homepage_banners";
const LS_CATEGORIES = "aflino_homepage_categories";
const LS_BRANDS = "aflino_homepage_brands";
const LS_FEEDS = "aflino_homepage_feeds";
const LS_SECTIONS = "aflino_homepage_sections";

const DEFAULT_BANNERS: HomepageBanner[] = [
  {
    id: "b1",
    imageUrl: "/assets/generated/hero-banner-mobile.dim_800x350.jpg",
    title: "Smartphones Sale",
    redirectLink: "/mobiles",
    order: 0,
  },
  {
    id: "b2",
    imageUrl: "/assets/generated/hero-banner-tv.dim_800x350.jpg",
    title: "TVs & Appliances",
    redirectLink: "/appliances",
    order: 1,
  },
  {
    id: "b3",
    imageUrl: "/assets/generated/hero-banner-fashion.dim_800x350.jpg",
    title: "Fashion Sale",
    redirectLink: "/fashion",
    order: 2,
  },
  {
    id: "b4",
    imageUrl: "/assets/generated/hero-banner-shoes.dim_800x350.jpg",
    title: "Footwear Sale",
    redirectLink: "/shoes",
    order: 3,
  },
  {
    id: "b5",
    imageUrl: "/assets/generated/hero-banner-tshirt.dim_800x350.jpg",
    title: "T-Shirts Collection",
    redirectLink: "/tshirts",
    order: 4,
  },
];

const DEFAULT_CATEGORIES: HomepageCategory[] = [
  {
    id: "c1",
    imageUrl: "/assets/generated/cat-mobiles.dim_200x200.jpg",
    label: "Mobiles",
    order: 0,
  },
  {
    id: "c2",
    imageUrl: "/assets/generated/cat-fashion.dim_200x200.jpg",
    label: "Fashion",
    order: 1,
  },
  {
    id: "c3",
    imageUrl: "/assets/generated/cat-electronics.dim_200x200.jpg",
    label: "Electronics",
    order: 2,
  },
  {
    id: "c4",
    imageUrl: "/assets/generated/cat-appliances.dim_200x200.jpg",
    label: "Appliances",
    order: 3,
  },
  {
    id: "c5",
    imageUrl: "/assets/generated/cat-shoes.dim_200x200.jpg",
    label: "Shoes",
    order: 4,
  },
  {
    id: "c6",
    imageUrl: "/assets/generated/cat-tools.dim_200x200.jpg",
    label: "Tools & Gadgets",
    order: 5,
  },
  {
    id: "c7",
    imageUrl: "/assets/generated/cat-beauty.dim_200x200.jpg",
    label: "Beauty",
    order: 6,
  },
  {
    id: "c8",
    imageUrl: "/assets/generated/cat-sports.dim_200x200.jpg",
    label: "Sports",
    order: 7,
  },
];

const DEFAULT_BRANDS: HomepageBrand[] = [
  {
    id: "br1",
    name: "Samsung",
    abbr: "SAM",
    color: "#1428A0",
    order: 0,
    enabled: true,
  },
  {
    id: "br2",
    name: "Apple",
    abbr: "APL",
    color: "#555",
    order: 1,
    enabled: true,
  },
  {
    id: "br3",
    name: "Puma",
    abbr: "PUM",
    color: "#E30613",
    order: 2,
    enabled: true,
  },
  {
    id: "br4",
    name: "Adidas",
    abbr: "ADI",
    color: "#000",
    order: 3,
    enabled: true,
  },
  {
    id: "br5",
    name: "HP",
    abbr: "HP",
    color: "#0096D6",
    order: 4,
    enabled: true,
  },
  {
    id: "br6",
    name: "Nike",
    abbr: "NK",
    color: "#111",
    order: 5,
    enabled: true,
  },
  {
    id: "br7",
    name: "Sony",
    abbr: "SNY",
    color: "#003087",
    order: 6,
    enabled: true,
  },
  {
    id: "br8",
    name: "LG",
    abbr: "LG",
    color: "#A50034",
    order: 7,
    enabled: true,
  },
  {
    id: "br9",
    name: "OnePlus",
    abbr: "1+",
    color: "#F5010C",
    order: 8,
    enabled: true,
  },
  {
    id: "br10",
    name: "Realme",
    abbr: "RM",
    color: "#FFA500",
    order: 9,
    enabled: true,
  },
  {
    id: "br11",
    name: "boAt",
    abbr: "boAt",
    color: "#E8001A",
    order: 10,
    enabled: true,
  },
  {
    id: "br12",
    name: "Philips",
    abbr: "PHL",
    color: "#0B4EA2",
    order: 11,
    enabled: true,
  },
  {
    id: "br13",
    name: "Levi's",
    abbr: "LV",
    color: "#C8102E",
    order: 12,
    enabled: true,
  },
  {
    id: "br14",
    name: "H&M",
    abbr: "H&M",
    color: "#E50010",
    order: 13,
    enabled: true,
  },
  {
    id: "br15",
    name: "Zara",
    abbr: "ZAR",
    color: "#111",
    order: 14,
    enabled: true,
  },
  {
    id: "br16",
    name: "Bata",
    abbr: "BAT",
    color: "#E31837",
    order: 15,
    enabled: true,
  },
  {
    id: "br17",
    name: "Titan",
    abbr: "TTN",
    color: "#006AFF",
    order: 16,
    enabled: true,
  },
  {
    id: "br18",
    name: "Fastrack",
    abbr: "FTK",
    color: "#FF1B8D",
    order: 17,
    enabled: true,
  },
  {
    id: "br19",
    name: "Woodland",
    abbr: "WDL",
    color: "#2D6A4F",
    order: 18,
    enabled: true,
  },
  {
    id: "br20",
    name: "Wildcraft",
    abbr: "WLC",
    color: "#E07B1A",
    order: 19,
    enabled: true,
  },
];

const DEFAULT_FEEDS: CategoryFeedConfig[] = [
  {
    id: "f1",
    categoryName: "Electronics",
    title: "Top Picks in Electronics",
    enabled: true,
    order: 0,
  },
  {
    id: "f2",
    categoryName: "Fashion",
    title: "New in Fashion",
    enabled: true,
    order: 1,
  },
  {
    id: "f3",
    categoryName: "Home & Kitchen",
    title: "Top in Home & Kitchen",
    enabled: true,
    order: 2,
  },
  {
    id: "f4",
    categoryName: "Mobiles",
    title: "Latest Mobiles",
    enabled: false,
    order: 3,
  },
  {
    id: "f5",
    categoryName: "Sports",
    title: "Top in Sports",
    enabled: false,
    order: 4,
  },
  {
    id: "f6",
    categoryName: "Beauty",
    title: "Beauty & Wellness",
    enabled: false,
    order: 5,
  },
];

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "s1", key: "categories", label: "Category Circles", order: 0 },
  { id: "s2", key: "banners", label: "Hero Banner Carousel", order: 1 },
  { id: "s3", key: "brands", label: "Curated Brands", order: 2 },
  { id: "s4", key: "feeds", label: "Category Feeds", order: 3 },
  {
    id: "s5",
    key: "recently_viewed",
    label: "Recently Viewed Products",
    order: 4,
  },
  { id: "s6", key: "flash_sale", label: "Flash Sale Section", order: 5 },
];

function loadFromLS<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return defaults;
}

function saveToLS<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

interface HomepageManagerContextValue {
  banners: HomepageBanner[];
  categories: HomepageCategory[];
  brands: HomepageBrand[];
  categoryFeeds: CategoryFeedConfig[];
  homepageSections: HomepageSection[];
  uploadProgress: number;
  addBanner: (
    file: File,
    title: string,
    link: string,
    scheduleStart?: string,
    scheduleEnd?: string,
  ) => Promise<void>;
  updateBanner: (
    id: string,
    fields: Partial<Omit<HomepageBanner, "id">>,
  ) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (newOrder: HomepageBanner[]) => void;
  addCategory: (file: File, label: string) => Promise<void>;
  updateCategory: (
    id: string,
    fields: Partial<Omit<HomepageCategory, "id">>,
  ) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: HomepageCategory[]) => void;
  addBrand: (
    name: string,
    abbr: string,
    color: string,
    logoUrl?: string,
  ) => void;
  updateBrand: (id: string, fields: Partial<Omit<HomepageBrand, "id">>) => void;
  deleteBrand: (id: string) => void;
  reorderBrands: (newOrder: HomepageBrand[]) => void;
  uploadBrandLogo: (file: File) => Promise<string>;
  updateFeed: (
    id: string,
    fields: Partial<Omit<CategoryFeedConfig, "id">>,
  ) => void;
  reorderFeeds: (newOrder: CategoryFeedConfig[]) => void;
  addFeed: (categoryName: string, title: string) => void;
  deleteFeed: (id: string) => void;
  reorderSections: (newOrder: HomepageSection[]) => void;
}

const HomepageManagerContext =
  createContext<HomepageManagerContextValue | null>(null);

export function HomepageManagerProvider({
  children,
}: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<HomepageBanner[]>(() =>
    loadFromLS(LS_BANNERS, DEFAULT_BANNERS),
  );
  const [categories, setCategories] = useState<HomepageCategory[]>(() =>
    loadFromLS(LS_CATEGORIES, DEFAULT_CATEGORIES),
  );
  const [brands, setBrands] = useState<HomepageBrand[]>(() =>
    loadFromLS(LS_BRANDS, DEFAULT_BRANDS),
  );
  const [categoryFeeds, setCategoryFeeds] = useState<CategoryFeedConfig[]>(() =>
    loadFromLS(LS_FEEDS, DEFAULT_FEEDS),
  );
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(
    () => {
      const stored = loadFromLS<HomepageSection>(LS_SECTIONS, DEFAULT_SECTIONS);
      // Ensure flash_sale section exists
      const hasFlashSale = stored.some((s) => s.key === "flash_sale");
      if (!hasFlashSale) {
        return [
          ...stored,
          {
            id: "s6",
            key: "flash_sale",
            label: "Flash Sale Section",
            order: stored.length,
          },
        ];
      }
      return stored;
    },
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    saveToLS(LS_BANNERS, banners);
  }, [banners]);
  useEffect(() => {
    saveToLS(LS_CATEGORIES, categories);
  }, [categories]);
  useEffect(() => {
    saveToLS(LS_BRANDS, brands);
  }, [brands]);
  useEffect(() => {
    saveToLS(LS_FEEDS, categoryFeeds);
  }, [categoryFeeds]);
  useEffect(() => {
    saveToLS(LS_SECTIONS, homepageSections);
  }, [homepageSections]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    try {
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      const url = blob.getDirectURL();
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 800);
      return url;
    } catch {
      toast.warning("Cloud upload failed — using local preview (temporary)");
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 800);
      return URL.createObjectURL(file);
    }
  }, []);

  const addBanner = useCallback(
    async (
      file: File,
      title: string,
      link: string,
      scheduleStart?: string,
      scheduleEnd?: string,
    ) => {
      const imageUrl = await uploadImage(file);
      setBanners((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          imageUrl,
          title,
          redirectLink: link,
          order: prev.length,
          ...(scheduleStart ? { scheduleStart } : {}),
          ...(scheduleEnd ? { scheduleEnd } : {}),
        },
      ]);
      toast.success("Banner added!");
    },
    [uploadImage],
  );

  const updateBanner = useCallback(
    (id: string, fields: Partial<Omit<HomepageBanner, "id">>) => {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...fields } : b)),
      );
    },
    [],
  );

  const deleteBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Banner deleted");
  }, []);

  const reorderBanners = useCallback((newOrder: HomepageBanner[]) => {
    setBanners(newOrder.map((b, i) => ({ ...b, order: i })));
  }, []);

  const addCategory = useCallback(
    async (file: File, label: string) => {
      const imageUrl = await uploadImage(file);
      setCategories((prev) => [
        ...prev,
        { id: `c_${Date.now()}`, imageUrl, label, order: prev.length },
      ]);
      toast.success("Category added!");
    },
    [uploadImage],
  );

  const updateCategory = useCallback(
    (id: string, fields: Partial<Omit<HomepageCategory, "id">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...fields } : c)),
      );
    },
    [],
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted");
  }, []);

  const reorderCategories = useCallback((newOrder: HomepageCategory[]) => {
    setCategories(newOrder.map((c, i) => ({ ...c, order: i })));
  }, []);

  const addBrand = useCallback(
    (name: string, abbr: string, color: string, logoUrl?: string) => {
      setBrands((prev) => [
        ...prev,
        {
          id: `br_${Date.now()}`,
          name,
          abbr,
          color,
          order: prev.length,
          logoUrl,
          enabled: true,
        },
      ]);
      toast.success("Brand added!");
    },
    [],
  );

  const updateBrand = useCallback(
    (id: string, fields: Partial<Omit<HomepageBrand, "id">>) => {
      setBrands((prev) =>
        prev.map((br) => (br.id === id ? { ...br, ...fields } : br)),
      );
    },
    [],
  );

  const deleteBrand = useCallback((id: string) => {
    setBrands((prev) => prev.filter((br) => br.id !== id));
    toast.success("Brand deleted");
  }, []);

  const reorderBrands = useCallback((newOrder: HomepageBrand[]) => {
    setBrands(newOrder.map((br, i) => ({ ...br, order: i })));
  }, []);

  const uploadBrandLogo = useCallback(
    async (file: File): Promise<string> => uploadImage(file),
    [uploadImage],
  );

  const updateFeed = useCallback(
    (id: string, fields: Partial<Omit<CategoryFeedConfig, "id">>) => {
      setCategoryFeeds((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...fields } : f)),
      );
    },
    [],
  );

  const reorderFeeds = useCallback((newOrder: CategoryFeedConfig[]) => {
    setCategoryFeeds(newOrder.map((f, i) => ({ ...f, order: i })));
  }, []);

  const addFeed = useCallback((categoryName: string, title: string) => {
    setCategoryFeeds((prev) => [
      ...prev,
      {
        id: `f_${Date.now()}`,
        categoryName,
        title,
        enabled: true,
        order: prev.length,
      },
    ]);
    toast.success("Feed added!");
  }, []);

  const deleteFeed = useCallback((id: string) => {
    setCategoryFeeds((prev) => prev.filter((f) => f.id !== id));
    toast.success("Feed removed");
  }, []);

  const reorderSections = useCallback((newOrder: HomepageSection[]) => {
    setHomepageSections(newOrder.map((s, i) => ({ ...s, order: i })));
  }, []);

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const sortedBrands = [...brands].sort((a, b) => a.order - b.order);
  const sortedFeeds = [...categoryFeeds].sort((a, b) => a.order - b.order);
  const sortedSections = [...homepageSections].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <HomepageManagerContext.Provider
      value={{
        banners: sortedBanners,
        categories: sortedCategories,
        brands: sortedBrands,
        categoryFeeds: sortedFeeds,
        homepageSections: sortedSections,
        uploadProgress,
        addBanner,
        updateBanner,
        deleteBanner,
        reorderBanners,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addBrand,
        updateBrand,
        deleteBrand,
        reorderBrands,
        uploadBrandLogo,
        updateFeed,
        reorderFeeds,
        addFeed,
        deleteFeed,
        reorderSections,
      }}
    >
      {children}
    </HomepageManagerContext.Provider>
  );
}

export function useHomepageManager() {
  const ctx = useContext(HomepageManagerContext);
  if (!ctx)
    throw new Error(
      "useHomepageManager must be used within HomepageManagerProvider",
    );
  return ctx;
}
