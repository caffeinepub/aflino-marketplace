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

const LS_BANNERS = "aflino_homepage_banners";
const LS_CATEGORIES = "aflino_homepage_categories";
const LS_BRANDS = "aflino_homepage_brands";

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
  uploadProgress: number;
  addBanner: (file: File, title: string, link: string) => Promise<void>;
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
    async (file: File, title: string, link: string) => {
      const imageUrl = await uploadImage(file);
      setBanners((prev) => {
        const updated = [
          ...prev,
          {
            id: `b_${Date.now()}`,
            imageUrl,
            title,
            redirectLink: link,
            order: prev.length,
          },
        ];
        return updated;
      });
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
    async (file: File): Promise<string> => {
      return uploadImage(file);
    },
    [uploadImage],
  );

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const sortedBrands = [...brands].sort((a, b) => a.order - b.order);

  return (
    <HomepageManagerContext.Provider
      value={{
        banners: sortedBanners,
        categories: sortedCategories,
        brands: sortedBrands,
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
