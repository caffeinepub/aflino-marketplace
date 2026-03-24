import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariant } from "@/data/products";
import { ShoppingCart, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border-blue-100",
  Fashion: "bg-pink-50 text-pink-700 border-pink-100",
  "Home & Kitchen": "bg-amber-50 text-amber-700 border-amber-100",
  Beauty: "bg-purple-50 text-purple-700 border-purple-100",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-4 h-4"
          fill={s <= Math.round(rating) ? "#006AFF" : "none"}
          stroke={s <= Math.round(rating) ? "#006AFF" : "#d1d5db"}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
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

  if (!product) return null;

  const hasVariants = !!product.variants && product.variants.length > 0;

  const uniqueSizes = hasVariants
    ? [...new Set(product.variants!.map((v) => v.size))]
    : [];

  const colorsForSize: ProductVariant[] =
    hasVariants && selectedSize
      ? product.variants!.filter((v) => v.size === selectedSize)
      : [];

  const uniqueColorsForSize =
    hasVariants && selectedSize
      ? [...new Map(colorsForSize.map((v) => [v.color, v])).values()]
      : [];

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

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
    setSelectedColor(null);
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
        ? `Size: ${selectedVariant.size} · ${selectedVariant.color}`
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden rounded-2xl"
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

        <div className="p-6">
          <DialogHeader className="mb-4 text-left">
            <div className="flex items-start justify-between gap-3">
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

          {/* Variants */}
          {hasVariants && (
            <div className="space-y-5 mb-5">
              {/* Size Selection */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                  Select Size
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  data-ocid="product.size.toggle"
                >
                  {uniqueSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        className="px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150"
                        style={
                          isSelected
                            ? {
                                backgroundColor: "#006AFF",
                                borderColor: "#006AFF",
                                color: "#fff",
                              }
                            : {
                                backgroundColor: "#fff",
                                borderColor: "#d1d5db",
                                color: "#374151",
                              }
                        }
                        data-ocid="product.size.toggle"
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              {selectedSize && uniqueColorsForSize.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                    Select Color
                    {selectedColor && (
                      <span className="ml-2 normal-case font-normal text-gray-700">
                        — {selectedColor}
                      </span>
                    )}
                  </p>
                  <div
                    className="flex flex-wrap gap-3"
                    data-ocid="product.color.toggle"
                  >
                    {uniqueColorsForSize.map((variant) => {
                      const isSelected = selectedColor === variant.color;
                      const isWhite =
                        variant.colorHex.toUpperCase() === "#FFFFFF";
                      return (
                        <button
                          key={variant.color}
                          type="button"
                          onClick={() => setSelectedColor(variant.color)}
                          title={variant.color}
                          className="transition-all duration-150"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: variant.colorHex,
                            border: isSelected
                              ? "2.5px solid #006AFF"
                              : isWhite
                                ? "1.5px solid #d1d5db"
                                : "2px solid transparent",
                            boxShadow: isSelected
                              ? "0 0 0 3px rgba(0,106,255,0.18)"
                              : "none",
                            cursor: "pointer",
                          }}
                          data-ocid="product.color.toggle"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price & Stock */}
          <div className="flex items-center justify-between mb-5">
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
                  Select size &amp; color
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full gap-2 text-white font-semibold h-11 rounded-xl text-base disabled:opacity-50"
            style={{ backgroundColor: canAddToCart ? "#FF1B8D" : undefined }}
            data-ocid="product.add_to_cart.primary_button"
          >
            <ShoppingCart className="w-5 h-5" />
            {hasVariants && !selectedVariant
              ? "Select Options"
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
