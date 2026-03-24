import { useCart } from "@/context/CartContext";
import { PRODUCTS, type Product, type ProductVariant } from "@/data/products";
import { addToHistory, getHistory } from "@/utils/browsingHistory";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const AFLINO_BLUE = "#006AFF";
const AFLINO_PINK = "#FF1B8D";

const COMBOS: Record<number, number[]> = {
  11: [11, 3, 2],
  5: [5, 6, 7],
  12: [12, 8, 9],
};

function isSpecSize(size: string): boolean {
  return (
    size.includes("+") ||
    size.toLowerCase().includes("gb") ||
    size.toLowerCase().includes("tb") ||
    size.toLowerCase().includes("inch") ||
    (size.toLowerCase().includes("l") && size.length > 2) ||
    size.includes('"') ||
    size.length > 5
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-4 h-4"
          fill={s <= Math.round(rating) ? AFLINO_BLUE : "none"}
          stroke={s <= Math.round(rating) ? AFLINO_BLUE : "#d1d5db"}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function PillRow({
  labelColor,
  label,
  scrollRef,
  children,
}: {
  labelColor: string;
  label: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  function scroll(dir: "left" | "right") {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += dir === "right" ? 200 : -200;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 50,
        border: `2px solid ${labelColor}`,
        background: "#fff",
        minHeight: 72,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: labelColor,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 88,
          borderRadius: 50,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: 0,
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div
        style={{
          overflow: "hidden",
          flex: 1,
          minWidth: 0,
          borderRadius: "0 50px 50px 0",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            overflowX: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            height: "100%",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch" as never,
            touchAction: "pan-x",
            scrollbarWidth: "none" as never,
          }}
          className="hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ProductMiniCard({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: (id: number) => void;
}) {
  const displayPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;
  const emoji =
    product.category === "Electronics"
      ? "💻"
      : product.category === "Fashion"
        ? "👗"
        : product.category === "Home & Kitchen"
          ? "🏠"
          : product.category === "Beauty"
            ? "✨"
            : "📦";

  return (
    <button
      type="button"
      className="flex-shrink-0 w-40 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden text-left"
      onClick={() => onNavigate(product.id)}
      data-ocid="product.related.card"
    >
      <div
        className="h-28 flex items-center justify-center text-3xl"
        style={{
          background: "linear-gradient(135deg, #f0f6ff 0%, #e8f0ff 100%)",
        }}
      >
        {emoji}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
          {product.title}
        </p>
        <p className="text-sm font-bold" style={{ color: AFLINO_BLUE }}>
          ₹{displayPrice.toLocaleString("en-IN")}
        </p>
        <button
          type="button"
          className="mt-1.5 w-full text-xs font-semibold py-1 rounded-lg text-white"
          style={{ backgroundColor: AFLINO_PINK }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(product.id);
          }}
        >
          View
        </button>
      </div>
    </button>
  );
}

interface Props {
  productId: number;
  onBack: () => void;
  onNavigateToProduct: (id: number) => void;
}

export default function ProductDetailPage({
  productId,
  onBack,
  onNavigateToProduct,
}: Props) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const colorScrollRef = useRef<HTMLDivElement>(null);
  const sizeScrollRef = useRef<HTMLDivElement>(null);
  const mainButtonsRef = useRef<HTMLDivElement>(null);

  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    addToHistory(productId);
    setSelectedSize(null);
    setSelectedColor(null);
    setDescExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    function handleScroll() {
      if (mainButtonsRef.current) {
        const rect = mainButtonsRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Product not found</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-blue-600 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasVariants = !!product.variants && product.variants.length > 0;
  const uniqueSizes = hasVariants
    ? [...new Set(product.variants!.map((v) => v.size))]
    : [];
  const uniqueAllColors: ProductVariant[] = hasVariants
    ? [...new Map(product.variants!.map((v) => [v.color, v])).values()]
    : [];

  const sizesForColor: string[] =
    hasVariants && selectedColor
      ? [
          ...new Set(
            product
              .variants!.filter((v) => v.color === selectedColor)
              .map((v) => v.size),
          ),
        ]
      : uniqueSizes;

  function priceForSize(size: string): number {
    if (!hasVariants) return product!.price;
    const candidates = selectedColor
      ? product!.variants!.filter(
          (v) => v.size === size && v.color === selectedColor,
        )
      : product!.variants!.filter((v) => v.size === size);
    return candidates.length > 0
      ? Math.min(...candidates.map((v) => v.price))
      : product!.price;
  }

  function priceForColor(color: string): number {
    if (!hasVariants) return product!.price;
    const candidates = product!.variants!.filter((v) => v.color === color);
    return candidates.length > 0
      ? Math.min(...candidates.map((v) => v.price))
      : product!.price;
  }

  function sizesHaveDifferentPrices(): boolean {
    if (!hasVariants || uniqueSizes.length === 0) return false;
    const prices = uniqueSizes.map((s) => priceForSize(s));
    return new Set(prices).size > 1;
  }

  const showPriceInSizeBox =
    isSpecSize(uniqueSizes[0] ?? "") || sizesHaveDifferentPrices();

  const selectedVariant: ProductVariant | null =
    hasVariants && selectedSize && selectedColor
      ? (product.variants!.find(
          (v) => v.size === selectedSize && v.color === selectedColor,
        ) ?? null)
      : null;

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : hasVariants
      ? Math.min(...product.variants!.map((v) => v.price))
      : product.price;

  const displayStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
      ? null
      : product.stock;

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const canAddToCart = hasVariants
    ? !!selectedVariant && !isOutOfStock
    : product.stock > 0;

  function handleAddToCart() {
    addToCart({
      productId: product!.id,
      productTitle: product!.title,
      price: displayPrice,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            size: selectedVariant.size,
            color: selectedVariant.color,
            colorHex: selectedVariant.colorHex,
          }
        : undefined,
    });
    toast.success(`"${product!.title}" added to cart!`, {
      description: selectedVariant
        ? `${selectedVariant.size} · ${selectedVariant.color}`
        : undefined,
    });
  }

  const categoryEmoji =
    product.category === "Electronics"
      ? "💻"
      : product.category === "Fashion"
        ? "👗"
        : product.category === "Home & Kitchen"
          ? "🏠"
          : product.category === "Beauty"
            ? "✨"
            : "📦";

  const leftLabel = isOutOfStock
    ? "Out of Stock"
    : hasVariants && !selectedVariant
      ? "Select Options"
      : "Add to Cart";

  // Related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );

  // Browsing history "You might also like"
  const history = getHistory();
  const historyProducts = history
    .filter((id) => id !== product.id)
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 6);

  // Frequently bought together
  const comboIds = COMBOS[product.id] ?? [];
  const comboProducts = comboIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const comboTotal = comboProducts.reduce((sum, p) => {
    const price = p.variants?.length
      ? Math.min(...p.variants.map((v) => v.price))
      : p.price;
    return sum + price;
  }, 0);

  const isElectronics = product.category === "Electronics";
  const isHomeKitchen = product.category === "Home & Kitchen";

  function handleNavigate(id: number) {
    addToHistory(id);
    onNavigateToProduct(id);
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen bg-white"
        data-ocid="product.page"
      >
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-[72px] z-10">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              data-ocid="product.back.button"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <span className="text-gray-300">›</span>
            <span style={{ color: AFLINO_PINK }} className="font-medium">
              {product.category}
            </span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 line-clamp-1 font-medium">
              {product.title}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Image */}
            <div
              className="rounded-2xl flex items-center justify-center text-8xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #f0f6ff 0%, #deeaff 100%)",
                minHeight: 320,
              }}
            >
              {categoryEmoji}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-bold px-5 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
              {hasVariants && (
                <div className="absolute top-3 right-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: AFLINO_BLUE }}
                  >
                    {product.variants!.length} variants
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: "#f0f6ff",
                      color: AFLINO_BLUE,
                      borderColor: "#cce0ff",
                    }}
                  >
                    {product.category}
                  </span>
                  {isElectronics && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      ⚡ Electronics
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-1">
                  {product.title}
                </h1>
                <p className="text-sm text-gray-400">
                  by{" "}
                  <span className="font-medium text-gray-600">
                    {product.seller}
                  </span>
                </p>
              </div>

              <StarRating rating={product.rating} />

              {/* Variant Selectors */}
              {hasVariants && (
                <div className="space-y-3">
                  {/* Colours */}
                  <PillRow
                    labelColor={AFLINO_BLUE}
                    label="Colours"
                    scrollRef={colorScrollRef}
                  >
                    {uniqueAllColors.map((variant) => {
                      const isSelected = selectedColor === variant.color;
                      const isWhite =
                        variant.colorHex.toUpperCase() === "#FFFFFF" ||
                        variant.colorHex.toUpperCase() === "#F5F5F0";
                      const colorPrice = priceForColor(variant.color);
                      return (
                        <button
                          key={variant.color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(variant.color);
                            if (selectedSize) {
                              const available = product.variants!.some(
                                (v) =>
                                  v.color === variant.color &&
                                  v.size === selectedSize,
                              );
                              if (!available) setSelectedSize(null);
                            }
                          }}
                          data-ocid="product.color.toggle"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: isSelected
                              ? `3px solid ${AFLINO_BLUE}`
                              : "1px solid #e5e7eb",
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(0,106,255,0.18)"
                              : "none",
                            background: "#fff",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                            minWidth: 64,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              backgroundColor: variant.colorHex,
                              border: isWhite ? "1.5px solid #d1d5db" : "none",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? AFLINO_BLUE : "#374151",
                              whiteSpace: "nowrap",
                              maxWidth: 64,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              textAlign: "center",
                            }}
                          >
                            {variant.color}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: isSelected ? AFLINO_BLUE : "#374151",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            ₹{colorPrice.toLocaleString("en-IN")}
                          </span>
                        </button>
                      );
                    })}
                  </PillRow>

                  {/* Sizes */}
                  <PillRow
                    labelColor={AFLINO_PINK}
                    label="Sizes"
                    scrollRef={sizeScrollRef}
                  >
                    {sizesForColor.map((size) => {
                      const isSelected = selectedSize === size;
                      const sizePrice = priceForSize(size);
                      const spec = isSpecSize(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          data-ocid="product.size.toggle"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: spec ? 3 : 0,
                            padding: spec ? "10px 14px" : "0",
                            width: spec ? undefined : 52,
                            height: spec ? undefined : 52,
                            minWidth: spec ? 90 : undefined,
                            borderRadius: spec ? 12 : "50%",
                            border: isSelected
                              ? `3px solid ${AFLINO_BLUE}`
                              : "1.5px solid #e5e7eb",
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(0,106,255,0.18)"
                              : "0 1px 3px rgba(0,0,0,0.06)",
                            background: "#fff",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: spec ? 11 : 13,
                              fontWeight: 700,
                              color: isSelected ? AFLINO_BLUE : "#1f2937",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {size}
                          </span>
                          {(spec || showPriceInSizeBox) && (
                            <span
                              style={{
                                fontSize: 10,
                                color: isSelected ? AFLINO_BLUE : "#6b7280",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ₹{sizePrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </PillRow>
                </div>
              )}

              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {hasVariants && !selectedVariant
                      ? "Starting from"
                      : "Price"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  {displayStock !== null ? (
                    <span
                      className={`text-sm font-medium ${
                        displayStock > 10
                          ? "text-emerald-600"
                          : displayStock > 0
                            ? "text-orange-500"
                            : "text-red-500"
                      }`}
                    >
                      {displayStock > 0
                        ? `${displayStock} in stock`
                        : "Out of Stock"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Select size &amp; colour
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3" ref={mainButtonsRef}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  data-ocid="product.add_to_cart.primary_button"
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: canAddToCart ? AFLINO_PINK : "#e5e7eb",
                    color: "#fff",
                    border: "none",
                    cursor: canAddToCart ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: canAddToCart ? 1 : 0.5,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <ShoppingCart size={18} />
                  {leftLabel}
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  data-ocid="product.buy_now.primary_button"
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: canAddToCart ? AFLINO_BLUE : "#e5e7eb",
                    color: "#fff",
                    border: "none",
                    cursor: canAddToCart ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: canAddToCart ? 1 : 0.5,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* ── Smart Description Accordion ── */}
          {product.description && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left group"
                onClick={() => setDescExpanded((v) => !v)}
                data-ocid="product.description.toggle"
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: AFLINO_BLUE }}
                >
                  Product Description
                </h2>
                <ChevronDown
                  className="w-5 h-5 text-gray-400 transition-transform duration-300"
                  style={{
                    transform: descExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <div
                style={{
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                  maxHeight: descExpanded ? "600px" : "80px",
                }}
              >
                <p
                  className="text-gray-600 text-sm leading-relaxed mt-3"
                  style={
                    descExpanded
                      ? { lineHeight: 1.8 }
                      : {
                          lineHeight: 1.8,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }
                  }
                >
                  {product.description}
                </p>
              </div>
              {!descExpanded && (
                <button
                  type="button"
                  onClick={() => setDescExpanded(true)}
                  className="text-xs font-semibold mt-1"
                  style={{ color: AFLINO_BLUE }}
                >
                  Read more…
                </button>
              )}
            </section>
          )}

          {/* ── Product Detail Images ── */}
          <section className="border-t border-gray-100 py-6 mb-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: "#006AFF" }}>
              Product Details
            </h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {[
                { emoji: "📷", label: "Detail View" },
                { emoji: "🔍", label: "Close-up" },
                { emoji: "📐", label: "Measurements" },
                { emoji: "✅", label: "Quality Check" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="w-28 h-28 rounded-xl flex-shrink-0 flex flex-col items-center justify-center gap-1"
                  style={{
                    background:
                      "linear-gradient(135deg, #e8f0ff 0%, #cce0ff 100%)",
                    border: "1px solid #b3ccff",
                  }}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-medium text-blue-700 text-center px-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Customer Reviews ── */}
          {(() => {
            const sampleReviews = [
              {
                id: 1,
                name: "Rahul Sharma",
                rating: 5,
                text: "Excellent product! Quality is outstanding and delivery was super fast. Highly recommended for everyone.",
                date: "15 Mar 2026",
                avatar: "RS",
                images: ["👕", "📦"],
              },
              {
                id: 2,
                name: "Priya Patel",
                rating: 5,
                text: "Loved it! The material is premium and fits perfectly. Will definitely buy again from this seller.",
                date: "10 Mar 2026",
                avatar: "PP",
                images: ["✨", "💯"],
              },
              {
                id: 3,
                name: "Amit Kumar",
                rating: 4,
                text: "Very good product. Exactly as described. Fast shipping and well packaged. Great value for money.",
                date: "5 Mar 2026",
                avatar: "AK",
                images: ["📸"],
              },
              {
                id: 4,
                name: "Sneha Verma",
                rating: 5,
                text: "Amazing quality! I was skeptical at first but this exceeded my expectations. Perfect gift idea too!",
                date: "28 Feb 2026",
                avatar: "SV",
                images: ["🎁", "⭐"],
              },
              {
                id: 5,
                name: "Vikash Singh",
                rating: 4,
                text: "Good product, sturdy build. Minor delay in delivery but overall very satisfied with the purchase.",
                date: "20 Feb 2026",
                avatar: "VS",
                images: ["👍"],
              },
            ];
            const allReviewImages = sampleReviews.flatMap((r) =>
              r.images.map((img) => ({ img, name: r.name })),
            );
            return (
              <section className="border-t border-gray-100 py-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#006AFF" }}
                  >
                    Customer Reviews
                  </h2>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#006AFF" }}
                  >
                    4.6 ★ · 127 reviews
                  </span>
                </div>
                {/* Review photos row */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Customer Photos
                  </p>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {allReviewImages.map((item, i) => (
                      <div
                        key={`${item.name}-${i}`}
                        className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
                        style={{
                          background: `hsl(${(i * 47) % 360}, 70%, 93%)`,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {item.img}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Review list — horizontal scroll carousel */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {sampleReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-gray-100 p-4 bg-white shadow-xs flex-shrink-0"
                      style={{ width: 280 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "#006AFF" }}
                        >
                          {review.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {review.name}
                          </p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="text-sm"
                              style={{
                                color:
                                  star <= review.rating ? "#006AFF" : "#e5e7eb",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* ── Technical Specifications ── */}
          {product.specifications && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                {isHomeKitchen ? "Technical Specifications" : "Specifications"}
              </h2>
              {isHomeKitchen ? (
                // Highlighted grid for home appliances
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl p-3.5 border"
                        style={{
                          backgroundColor: "#f0f6ff",
                          borderColor: "#cce0ff",
                        }}
                      >
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">
                          {key}
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                // Table for electronics & fashion
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {Object.entries(product.specifications).map(
                    ([key, value], idx) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 text-sm"
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#ffffff" : "#f8faff",
                        }}
                      >
                        <div className="px-4 py-3 font-semibold text-gray-600 border-r border-gray-100">
                          {key}
                        </div>
                        <div className="px-4 py-3 text-gray-800">{value}</div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Frequently Bought Together ── */}
          {comboProducts.length > 1 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                Frequently Bought Together
              </h2>
              <div className="flex items-center flex-wrap gap-3 mb-4">
                {comboProducts.map((p, idx) => {
                  const price = p.variants?.length
                    ? Math.min(...p.variants.map((v) => v.price))
                    : p.price;
                  const emoji =
                    p.category === "Electronics"
                      ? "💻"
                      : p.category === "Fashion"
                        ? "👗"
                        : p.category === "Home & Kitchen"
                          ? "🏠"
                          : p.category === "Beauty"
                            ? "✨"
                            : "📦";
                  return (
                    <>
                      {idx > 0 && (
                        <Plus
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          key={`plus-${p.id}`}
                        />
                      )}
                      <button
                        key={p.id}
                        type="button"
                        className="flex flex-col items-center gap-1.5 cursor-pointer group bg-transparent border-0 p-0"
                        onClick={() => handleNavigate(p.id)}
                      >
                        <div
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform"
                          style={{
                            background:
                              "linear-gradient(135deg, #f0f6ff, #deeaff)",
                            border:
                              p.id === product.id
                                ? `2px solid ${AFLINO_BLUE}`
                                : "2px solid transparent",
                          }}
                        >
                          {emoji}
                        </div>
                        <p className="text-xs font-medium text-gray-700 text-center w-20 line-clamp-2 leading-snug">
                          {p.title}
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: AFLINO_BLUE }}
                        >
                          ₹{price.toLocaleString("en-IN")}
                        </p>
                      </button>
                    </>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total for combo</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{comboTotal.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: AFLINO_PINK }}
                  onClick={() => {
                    for (const p of comboProducts) {
                      const price = p.variants?.length
                        ? Math.min(...p.variants.map((v) => v.price))
                        : p.price;
                      addToCart({
                        productId: p.id,
                        productTitle: p.title,
                        price,
                      });
                    }
                    toast.success("Combo added to cart!");
                  }}
                  data-ocid="product.combo.primary_button"
                >
                  <ShoppingCart size={16} />
                  Add All to Cart
                </button>
              </div>
            </section>
          )}

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                Related Products
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {relatedProducts.map((p) => (
                  <ProductMiniCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── You Might Also Like ── */}
          {historyProducts.length > 0 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                You Might Also Like
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {historyProducts.map((p) => (
                  <ProductMiniCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>

      {/* ── Sticky Mobile Bar ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.title}</p>
              <p className="text-base font-bold text-gray-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white flex-shrink-0"
              style={{
                backgroundColor: canAddToCart ? AFLINO_PINK : "#e5e7eb",
              }}
              data-ocid="product.sticky_add_to_cart.button"
            >
              <ShoppingCart size={16} />
              {leftLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
