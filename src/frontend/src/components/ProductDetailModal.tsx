import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariant } from "@/data/products";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const AFLINO_BLUE = "#006AFF";
const AFLINO_PINK = "#FF1B8D";

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border-blue-100",
  Fashion: "bg-pink-50 text-pink-700 border-pink-100",
  "Home & Kitchen": "bg-amber-50 text-amber-700 border-amber-100",
  Beauty: "bg-purple-50 text-purple-700 border-purple-100",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function isSpecSize(size: string): boolean {
  return (
    size.includes("+") ||
    size.toLowerCase().includes("gb") ||
    size.toLowerCase().includes("tb") ||
    size.toLowerCase().includes("inch") ||
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

/** Pill-container row shared by both Colours and Sizes */
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
        minHeight: 68,
        width: "100%",
        maxWidth: "100%",
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      {/* Label pill */}
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
            letterSpacing: "0.01em",
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

      {/* Scrollable options — overflow hidden here so the pill border-radius clips correctly */}
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
            msOverflowStyle: "none" as never,
          }}
          className="hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, open, onClose }: Props) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const colorScrollRef = useRef<HTMLDivElement>(null);
  const sizeScrollRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const hasVariants = !!product.variants && product.variants.length > 0;

  const uniqueSizes = hasVariants
    ? [...new Set(product.variants!.map((v) => v.size))]
    : [];

  // All unique colors across all variants (for the colours row)
  const uniqueAllColors: ProductVariant[] = hasVariants
    ? [...new Map(product.variants!.map((v) => [v.color, v])).values()]
    : [];

  // Sizes available for the selected color
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

  // Price preview for a size (cheapest variant of that size among selected color, or across all)
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

  // Price for a color (cheapest variant of that color)
  function priceForColor(color: string): number {
    if (!hasVariants) return product!.price;
    const candidates = product!.variants!.filter((v) => v.color === color);
    return candidates.length > 0
      ? Math.min(...candidates.map((v) => v.price))
      : product!.price;
  }

  // Check if sizes map to different prices (if so, show price in size box for all)
  function sizesHaveDifferentPrices(): boolean {
    if (!hasVariants || uniqueSizes.length === 0) return false;
    const prices = uniqueSizes.map((s) => priceForSize(s));
    return new Set(prices).size > 1;
  }

  // Show price in size box if spec-based OR if sizes have different prices
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

  function handleClose() {
    setSelectedSize(null);
    setSelectedColor(null);
    onClose();
  }

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
    handleClose();
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

  // Left button label
  const leftLabel = isOutOfStock
    ? "Out of Stock"
    : hasVariants && !selectedVariant
      ? "Select Options"
      : "Add to Cart";

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent
          className="max-w-lg w-full p-0 overflow-hidden rounded-2xl"
          data-ocid="product.modal"
        >
          {/* Image strip */}
          <div
            className="h-48 flex items-center justify-center text-6xl relative"
            style={{
              background: "linear-gradient(135deg, #f0f6ff 0%, #e8f0ff 100%)",
            }}
          >
            {categoryEmoji}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="p-5 overflow-hidden">
            <DialogHeader className="mb-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        CATEGORY_COLORS[product.category] ??
                        "bg-gray-50 text-gray-600 border-gray-100"
                      }`}
                    >
                      {product.category}
                    </Badge>
                    {hasVariants && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-100"
                      >
                        Multiple Variants
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-900 leading-snug">
                    {product.title}
                  </DialogTitle>
                  <p className="text-sm text-gray-400 mt-0.5">
                    by {product.seller}
                  </p>
                </div>
              </div>
              <StarRating rating={product.rating} />
            </DialogHeader>

            {/* ── Pill Variant Selectors ── */}
            {hasVariants && (
              <div className="space-y-3 mb-4">
                {/* Colours row */}
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
                          // Reset size if not available for new color
                          if (selectedSize) {
                            const available = product.variants!.some(
                              (v) =>
                                v.color === variant.color &&
                                v.size === selectedSize,
                            );
                            if (!available) setSelectedSize(null);
                          }
                        }}
                        title={variant.color}
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
                        {/* Colored dot */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            backgroundColor: variant.colorHex,
                            border: isWhite ? "1.5px solid #d1d5db" : "none",
                            flexShrink: 0,
                          }}
                        />
                        {/* Color name */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? AFLINO_BLUE : "#374151",
                            whiteSpace: "nowrap",
                            maxWidth: 64,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.2,
                            textAlign: "center",
                          }}
                        >
                          {variant.color}
                        </span>
                        {/* Price below color name */}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isSelected ? AFLINO_BLUE : "#374151",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            textAlign: "center",
                          }}
                        >
                          ₹{colorPrice.toLocaleString("en-IN")}
                        </span>
                      </button>
                    );
                  })}
                </PillRow>

                {/* Sizes row */}
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
                          // Circular for simple sizes, rectangular for spec sizes
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
                            lineHeight: 1.2,
                            textAlign: "center",
                          }}
                        >
                          {size}
                        </span>
                        {/* Show price only for spec sizes */}
                        {(spec || showPriceInSizeBox) && (
                          <span
                            style={{
                              fontSize: 10,
                              color: isSelected ? AFLINO_BLUE : "#6b7280",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              lineHeight: 1.2,
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

            {/* Price & Stock */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {hasVariants && !selectedVariant ? "Starting from" : "Price"}
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

            {/* Dual CTA Buttons */}
            <div className="flex gap-2 w-full">
              {/* Left: Add to Cart — Pink */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                data-ocid="product.add_to_cart.primary_button"
                style={{
                  flex: 1,
                  height: 48,
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
                  transition: "opacity 0.15s ease, background-color 0.15s ease",
                }}
              >
                <ShoppingCart size={18} />
                {leftLabel}
              </button>

              {/* Right: Buy Now — Blue */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                data-ocid="product.buy_now.primary_button"
                style={{
                  flex: 1,
                  height: 48,
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
                  transition: "opacity 0.15s ease, background-color 0.15s ease",
                }}
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
