import CategoryFeedSection from "@/components/CategoryFeedSection";
import FlashSaleSection from "@/components/FlashSaleSection";
import WatchAndShopSection from "@/components/WatchAndShopSection";
import {
  isBannerActive,
  useHomepageManager,
} from "@/context/HomepageManagerContext";
import { PRODUCTS } from "@/data/products";
import { addToHistory } from "@/utils/browsingHistory";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface HeroProps {
  onShopClick: () => void;
  onViewAll?: () => void;
  onViewProduct?: (id: number) => void;
}

// ── Banner Carousel ──────────────────────────────────────────────────────────────────
export function BannerCarousel() {
  const { banners } = useHomepageManager();
  const activeBanners = banners.filter(isBannerActive);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = activeBanners.length;

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % (count || 1)),
    [count],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + (count || 1)) % (count || 1)),
    [count],
  );

  useEffect(() => {
    if (current >= count && count > 0) setCurrent(0);
  }, [count, current]);

  useEffect(() => {
    if (paused || count === 0) return;
    timerRef.current = setInterval(next, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, count]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  if (count === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {activeBanners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full object-cover"
              style={{ height: "clamp(160px, 30vw, 350px)" }}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {activeBanners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            className={`rounded-full transition-all pointer-events-auto ${i === current ? "w-5 h-2" : "w-2 h-2 bg-white/60"}`}
            style={
              i === current
                ? { backgroundColor: "#006AFF", width: 20, height: 8 }
                : {}
            }
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Section renderers ────────────────────────────────────────────────────────────────
function CategoriesBlock({
  categories,
}: { categories: ReturnType<typeof useHomepageManager>["categories"] }) {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            data-ocid="hero.tab"
          >
            <div className="w-[72px] h-[72px] rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
              <img
                src={cat.imageUrl}
                alt={cat.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] text-gray-600 font-medium text-center leading-tight max-w-[72px]">
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function BrandsBlock({
  brands,
}: { brands: ReturnType<typeof useHomepageManager>["brands"] }) {
  const enabledBrands = brands.filter((b) => b.enabled !== false);
  if (enabledBrands.length === 0) return null;
  return (
    <div className="bg-white px-4 py-4 border-b border-gray-100">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Curated Brands</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {enabledBrands.map((brand) => (
          <motion.button
            key={brand.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span
                  className="text-[10px] font-extrabold leading-tight text-center"
                  style={{ color: brand.color }}
                >
                  {brand.abbr}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-medium text-center max-w-[56px] leading-tight">
              {brand.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function FeedsBlock({
  categoryFeeds,
  onViewProduct,
}: {
  categoryFeeds: ReturnType<typeof useHomepageManager>["categoryFeeds"];
  onViewProduct?: (id: number) => void;
}) {
  if (!onViewProduct) return null;
  const enabledFeeds = categoryFeeds.filter((f) => f.enabled);
  if (enabledFeeds.length === 0) return null;
  return (
    <>
      {enabledFeeds.map((feed) => (
        <CategoryFeedSection
          key={feed.id}
          categoryName={feed.categoryName}
          title={feed.title}
          onViewProduct={onViewProduct}
        />
      ))}
    </>
  );
}

function RecentlyViewedBlock({
  displayProducts,
  onShopClick,
  onViewAll,
  onViewProduct,
}: {
  displayProducts: typeof PRODUCTS;
  onShopClick: () => void;
  onViewAll?: () => void;
  onViewProduct?: (id: number) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  return (
    <div
      className="px-4 py-4"
      style={{
        backgroundImage:
          "url('/assets/generated/recently-viewed-bg.dim_1200x400.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white drop-shadow">
          Recently Viewed Products
        </h2>
        <button
          type="button"
          className="text-xs font-semibold text-white drop-shadow hover:underline"
          onClick={onViewAll ?? onShopClick}
          data-ocid="hero.view_all.button"
        >
          View All ›
        </button>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollCarousel("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow rounded-full w-7 h-7 flex items-center justify-center -ml-3"
          data-ocid="hero.pagination_prev"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {displayProducts.map((product, i) => {
            const mrp = Math.round(product.price * 1.3);
            const discountPct = Math.round(((mrp - product.price) / mrp) * 100);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex-shrink-0 w-32 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
                onClick={() => {
                  addToHistory(product.id);
                  if (onViewProduct) onViewProduct(product.id);
                  else onShopClick();
                }}
                data-ocid={`hero.item.${i + 1}`}
              >
                <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={
                      product.images?.[0] ||
                      `https://picsum.photos/seed/${product.id}/200/200`
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
                    {product.title}
                  </p>
                  <p className="text-xs font-bold" style={{ color: "#006AFF" }}>
                    &#8377;{product.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-gray-400 line-through">
                    &#8377;{mrp.toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] font-semibold text-orange-500">
                    {discountPct}% off
                  </span>
                  <button
                    type="button"
                    className="mt-1.5 w-full text-[10px] font-semibold text-white py-1 rounded-lg flex items-center justify-center gap-1"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToHistory(product.id);
                      if (onViewProduct) onViewProduct(product.id);
                      else onShopClick();
                    }}
                    data-ocid="hero.primary_button"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Buy Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollCarousel("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow rounded-full w-7 h-7 flex items-center justify-center -mr-3"
          data-ocid="hero.pagination_next"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

// ── Main Homepage Component ──────────────────────────────────────────────────────────
export default function Hero({
  onShopClick,
  onViewAll,
  onViewProduct,
}: HeroProps) {
  const { categories, brands, categoryFeeds, homepageSections } =
    useHomepageManager();
  const displayProducts = PRODUCTS.slice(0, 6);

  // Render each section by its key, in the order defined by admin
  function renderSection(key: string) {
    switch (key) {
      case "categories":
        return <CategoriesBlock key="categories" categories={categories} />;
      case "banners":
        return <BannerCarousel key="banners" />;
      case "brands":
        return <BrandsBlock key="brands" brands={brands} />;
      case "feeds":
        return (
          <FeedsBlock
            key="feeds"
            categoryFeeds={categoryFeeds}
            onViewProduct={onViewProduct}
          />
        );
      case "recently_viewed":
        return (
          <RecentlyViewedBlock
            key="recently_viewed"
            displayProducts={displayProducts}
            onShopClick={onShopClick}
            onViewAll={onViewAll}
            onViewProduct={onViewProduct}
          />
        );
      case "flash_sale":
        return (
          <FlashSaleSection key="flash_sale" onViewProduct={onViewProduct} />
        );
      default:
        return null;
    }
  }

  return (
    <section id="home" className="w-full" data-ocid="hero.section">
      {homepageSections.map((section) => renderSection(section.key))}
      <WatchAndShopSection />
    </section>
  );
}
