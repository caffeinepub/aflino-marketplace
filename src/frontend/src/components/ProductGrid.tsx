import ProductDetailModal from "@/components/ProductDetailModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/context/ProductContext";
import { CATEGORIES, type Product } from "@/data/products";
import { addToHistory } from "@/utils/browsingHistory";
import { PackageX, ShoppingCart, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border-blue-100",
  Fashion: "bg-pink-50 text-pink-700 border-pink-100",
  "Home & Kitchen": "bg-amber-50 text-amber-700 border-amber-100",
  Beauty: "bg-purple-50 text-purple-700 border-purple-100",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const MAX_PRICE = 120000;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-3 h-3"
          fill={s <= Math.round(rating) ? "#006AFF" : "none"}
          stroke={s <= Math.round(rating) ? "#006AFF" : "#d1d5db"}
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

interface Filters {
  priceRange: [number, number];
  categories: string[];
  minRating: number;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  priceRange: [0, MAX_PRICE],
  categories: ["All"],
  minRating: 0,
  inStockOnly: false,
};

function SidebarFilter({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  function toggleCategory(cat: string) {
    if (cat === "All") {
      onChange({ ...filters, categories: ["All"] });
      return;
    }
    let next = filters.categories.filter((c) => c !== "All");
    if (next.includes(cat)) {
      next = next.filter((c) => c !== cat);
    } else {
      next = [...next, cat];
    }
    if (next.length === 0) next = ["All"];
    onChange({ ...filters, categories: next });
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 rounded-2xl p-5 flex flex-col gap-6 self-start sticky top-24">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800 uppercase tracking-widest">
          Filters
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-300 rounded-full px-2.5 py-0.5 transition-colors"
          data-ocid="filter.clear_all.button"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Price Range
        </p>
        <div className="text-sm font-semibold text-gray-800">
          ₹{filters.priceRange[0].toLocaleString("en-IN")} – ₹
          {filters.priceRange[1].toLocaleString("en-IN")}
        </div>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={100}
          value={filters.priceRange}
          onValueChange={(v) =>
            onChange({ ...filters, priceRange: v as [number, number] })
          }
          className="[&_[role=slider]]:border-[#006AFF] [&_[role=slider]]:bg-white [&_.range]:bg-[#006AFF]"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ₹0
          </span>
          <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ₹1,20,000
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Categories
        </p>
        {CATEGORIES.map((cat) => {
          const isAll = cat === "All";
          const checked = isAll
            ? filters.categories.includes("All")
            : filters.categories.includes(cat);
          return (
            <div key={cat} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${cat}`}
                checked={checked}
                onCheckedChange={() => toggleCategory(cat)}
                className="border-gray-300 data-[state=checked]:bg-[#006AFF] data-[state=checked]:border-[#006AFF]"
                data-ocid="filter.category.checkbox"
              />
              <Label
                htmlFor={`cat-${cat}`}
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                {cat}
              </Label>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-gray-200" />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Min Rating
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onChange({ ...filters, minRating: 0 })}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filters.minRating === 0
                ? "text-white border-transparent"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
            style={
              filters.minRating === 0 ? { backgroundColor: "#006AFF" } : {}
            }
            data-ocid="filter.rating.toggle"
          >
            Any
          </button>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange({ ...filters, minRating: star })}
              className={`flex items-center gap-0.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.minRating === star
                  ? "text-white border-transparent"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={
                filters.minRating === star ? { backgroundColor: "#006AFF" } : {}
              }
              data-ocid="filter.rating.toggle"
            >
              {star} <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Availability
        </p>
        <div className="flex items-center gap-3">
          <Switch
            id="instock-toggle"
            checked={filters.inStockOnly}
            onCheckedChange={(v) => onChange({ ...filters, inStockOnly: v })}
            className="data-[state=checked]:bg-[#006AFF]"
            data-ocid="filter.stock.switch"
          />
          <Label
            htmlFor="instock-toggle"
            className="text-sm text-gray-700 cursor-pointer"
          >
            In Stock Only
          </Label>
        </div>
      </div>
    </aside>
  );
}

function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index: number;
  onOpen: (p: Product) => void;
}) {
  const hasVariants = !!product.variants && product.variants.length > 0;
  const displayPrice = hasVariants
    ? Math.min(...product.variants!.map((v) => v.price))
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`products.item.${index + 1}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
      onClick={() => onOpen(product)}
    >
      <div
        className="aspect-square flex items-center justify-center text-3xl relative"
        style={{
          background: "linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)",
        }}
      >
        {product.category === "Electronics" && "💻"}
        {product.category === "Fashion" && "👗"}
        {product.category === "Home & Kitchen" && "🏠"}
        {product.category === "Beauty" && "✨"}
        {product.category === "Sports" && "⚽"}
        {product.stock === 0 && !hasVariants && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {hasVariants && (
          <div className="absolute top-2 right-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#006AFF" }}
            >
              {product.variants!.length} variants
            </span>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-4">
        <div className="mb-1.5 sm:mb-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              CATEGORY_COLORS[product.category] ??
              "bg-gray-50 text-gray-600 border-gray-100"
            }`}
          >
            {product.category}
          </span>
        </div>

        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="hidden sm:block text-xs text-gray-400 mb-1.5">
          by {product.seller}
        </p>
        <div className="mb-2 sm:mb-3">
          <StarRating rating={product.rating} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            {hasVariants && (
              <p className="text-xs text-gray-400 leading-none mb-0.5">From</p>
            )}
            <span className="text-sm sm:text-lg font-bold text-gray-900">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 rounded-full text-xs font-semibold text-white border-0 gap-1"
            style={{ backgroundColor: "#006AFF" }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(product);
            }}
            data-ocid={`products.add_to_cart.button.${index + 1}`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span className="hidden sm:inline">
              {hasVariants ? "Options" : "View"}
            </span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface ProductGridProps {
  onViewProduct?: (id: number) => void;
}

export default function ProductGrid({ onViewProduct }: ProductGridProps) {
  const { products } = useProducts();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Listen for open-filters event dispatched from Header hamburger menu
  useEffect(() => {
    function handleOpenFilters() {
      setMobileSidebarOpen(true);
    }
    window.addEventListener("aflino:openFilters", handleOpenFilters);
    return () =>
      window.removeEventListener("aflino:openFilters", handleOpenFilters);
  }, []);

  // Listen for category filter event from CategoryFeedSection
  useEffect(() => {
    function handleFilterCategory(e: Event) {
      const cat = (e as CustomEvent).detail as string;
      setFilters((prev) => ({ ...prev, categories: [cat] }));
    }
    window.addEventListener("aflino:filterCategory", handleFilterCategory);
    return () =>
      window.removeEventListener("aflino:filterCategory", handleFilterCategory);
  }, []);

  function handleOpen(product: Product) {
    addToHistory(product.id);
    if (onViewProduct) {
      onViewProduct(product.id);
    } else {
      setSelectedProduct(product);
    }
  }

  const filtered = products.filter((p) => {
    const effectivePrice = p.variants?.length
      ? Math.min(...p.variants.map((v) => v.price))
      : p.price;
    const inPrice =
      effectivePrice >= filters.priceRange[0] &&
      effectivePrice <= filters.priceRange[1];
    const inCat =
      filters.categories.includes("All") ||
      filters.categories.includes(p.category);
    const inRating = filters.minRating === 0 || p.rating >= filters.minRating;
    const inStock = !filters.inStockOnly || p.stock > 0;
    return inPrice && inCat && inRating && inStock;
  });

  return (
    <section
      className="py-14 px-4 max-w-[1200px] mx-auto"
      data-ocid="products.section"
    >
      <div className="flex gap-8">
        <div className="hidden md:block">
          <SidebarFilter
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
                data-ocid="products.empty_state"
              >
                <PackageX className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-500">
                  No products found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
              >
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onOpen={handleOpen}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar Overlay — triggered from Header hamburger */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileSidebarOpen(false)}
              data-ocid="filter.modal"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  data-ocid="filter.close_button"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <SidebarFilter
                  filters={filters}
                  onChange={setFilters}
                  onClear={() => {
                    setFilters(DEFAULT_FILTERS);
                    setMobileSidebarOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal — fallback when onViewProduct not provided */}
      {!onViewProduct && (
        <ProductDetailModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
