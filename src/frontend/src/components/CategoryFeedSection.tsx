import { useGeoLocation } from "@/context/GeoLocationContext";
import { useProducts } from "@/context/ProductContext";
import { addToHistory } from "@/utils/browsingHistory";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface CategoryFeedSectionProps {
  categoryName: string;
  title: string;
  onViewProduct: (id: number) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="aspect-square w-full bg-gray-200 animate-pulse" />
      <div className="p-2 space-y-2">
        <div className="h-3 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 rounded bg-gray-200 animate-pulse w-3/4" />
        <div className="h-3 rounded bg-gray-200 animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function CategoryFeedSection({
  categoryName,
  title,
  onViewProduct,
}: CategoryFeedSectionProps) {
  const { products } = useProducts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const { customerState } = useGeoLocation();

  const categoryProducts = products
    .filter((p) => {
      if (p.category !== categoryName) return false;
      // Geo-fence: hide local products from other states
      if (!p.sellerType || p.sellerType === "gstin") return true;
      if (customerState && p.sellerState === customerState) return true;
      return false;
    })
    .slice(0, 8);

  if (!loading && categoryProducts.length === 0) return null;

  function handleViewProduct(id: number) {
    addToHistory(id);
    onViewProduct(id);
  }

  return (
    <div
      className="bg-white px-4 py-4 border-b border-gray-100"
      data-ocid={`category_feed.${categoryName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.section`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        <button
          type="button"
          className="text-sm font-semibold"
          style={{ color: "#006AFF" }}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("aflino:filterCategory", {
                detail: categoryName,
              }),
            )
          }
          data-ocid="category_feed.view_all.button"
        >
          View All ›
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : categoryProducts.map((product, index) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: product card with explicit view button for keyboard users
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewProduct(product.id)}
                data-ocid={`category_feed.item.${index + 1}`}
              >
                {/* Image */}
                <div className="aspect-square w-full overflow-hidden bg-gray-50">
                  <img
                    src={
                      product.images?.[0] ||
                      `https://picsum.photos/seed/${product.id}/300/300`
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-2">
                  {/* Category badge */}
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1 inline-block"
                    style={{ backgroundColor: "#EBF3FF", color: "#006AFF" }}
                  >
                    {product.category}
                  </span>

                  {/* Title */}
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 leading-tight">
                    {product.title}
                  </p>

                  {/* Stars */}
                  <div className="mb-1">
                    <StarRating rating={product.rating} />
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] text-gray-400">From</span>
                        <span className="text-sm font-bold text-gray-900">
                          ₹
                          {Math.min(
                            ...product.variants.map((v) => v.price),
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* View button */}
                  <button
                    type="button"
                    className="w-full text-xs font-semibold text-white py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProduct(product.id);
                    }}
                    data-ocid="category_feed.view.button"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
