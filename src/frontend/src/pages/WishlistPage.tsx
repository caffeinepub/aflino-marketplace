import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/data/products";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

interface WishlistPageProps {
  onBack: () => void;
  onViewProduct: (id: number) => void;
  onLoginRequired: () => void;
}

const GRADIENTS = [
  "from-blue-100 to-blue-200",
  "from-pink-100 to-pink-200",
  "from-purple-100 to-purple-200",
  "from-yellow-100 to-yellow-200",
  "from-green-100 to-green-200",
  "from-orange-100 to-orange-200",
  "from-teal-100 to-teal-200",
  "from-red-100 to-red-200",
];

const EMOJIS = ["📱", "👗", "🏠", "💄", "⌚", "💝", "🎧", "💍"];

export default function WishlistPage({
  onBack,
  onViewProduct,
  // onLoginRequired, // available for future use
}: WishlistPageProps) {
  const { wishlistIds, removeFromWishlist, priceDroppedIds } = useWishlist();
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());

  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  function handleRemove(productId: number) {
    setRemoving(productId);
    setTimeout(() => {
      removeFromWishlist(productId);
      setRemoving(null);
    }, 300);
  }

  function handleMoveToCart(productId: number) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    addToCart({
      productId: product.id,
      productTitle: product.title,
      price: product.discountedPrice ?? product.price,
    });
    setAddedToCart((prev) => new Set([...prev, productId]));
    setTimeout(() => {
      removeFromWishlist(productId);
      setAddedToCart((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Heart
              className="w-5 h-5"
              style={{ fill: "#EC008C", color: "#EC008C" }}
            />
            <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
            {wishlistIds.length > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: "#EC008C" }}
              >
                {wishlistIds.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Empty state */}
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#FFF0F7" }}
            >
              <Heart
                className="w-12 h-12"
                style={{ color: "#EC008C", opacity: 0.4 }}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-gray-500 mb-7 max-w-xs">
              Save products you love by tapping the heart icon. They'll appear
              here for easy access.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#006AFF" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {wishlistProducts.length} item
              {wishlistProducts.length !== 1 ? "s" : ""} saved
            </p>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((product) => {
                const isRemoving = removing === product.id;
                const isMovedToCart = addedToCart.has(product.id);
                const hasPriceDrop = priceDroppedIds.has(product.id);
                const displayPrice = product.discountedPrice ?? product.price;
                const gradClass = GRADIENTS[product.id % 8];
                const emoji = EMOJIS[product.id % 8];
                const discountPct =
                  product.discountedPrice &&
                  product.price > product.discountedPrice
                    ? Math.round(
                        ((product.price - product.discountedPrice) /
                          product.price) *
                          100,
                      )
                    : null;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? "scale(0.95)" : "scale(1)",
                      transition: "opacity 0.3s, transform 0.3s",
                    }}
                  >
                    {/* Image area */}
                    <button
                      type="button"
                      className={`relative h-44 bg-gradient-to-br ${gradClass} flex items-center justify-center w-full`}
                      onClick={() => onViewProduct(product.id)}
                    >
                      {/* Price drop badge */}
                      {hasPriceDrop && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Price Drop!
                        </span>
                      )}

                      {/* Discount % badge */}
                      {discountPct && !hasPriceDrop && (
                        <span
                          className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: "#006AFF" }}
                        >
                          -{discountPct}%
                        </span>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>

                      <div className="text-4xl">{emoji}</div>
                    </button>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[11px] text-gray-400 mb-0.5">
                        {product.seller}
                      </p>
                      <button
                        type="button"
                        onClick={() => onViewProduct(product.id)}
                        className="text-sm font-semibold text-gray-900 line-clamp-2 text-left hover:underline w-full mb-3"
                      >
                        {product.title}
                      </button>

                      {/* Price row */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-base font-bold"
                          style={{
                            color: hasPriceDrop ? "#EF4444" : "#111827",
                          }}
                        >
                          ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {product.discountedPrice &&
                          product.price > product.discountedPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(product.id)}
                          disabled={isMovedToCart}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold text-white transition-all"
                          style={{
                            backgroundColor: isMovedToCart
                              ? "#10B981"
                              : "#006AFF",
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {isMovedToCart ? "Added!" : "Move to Cart"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(product.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue shopping */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#006AFF" }}
              >
                ← Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
