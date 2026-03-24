import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useState } from "react";

export interface ProductData {
  id: number;
  name: string;
  vendor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  badge?: string;
  gradient: string;
}

interface ProductCardProps {
  product: ProductData;
  buttonLabel?: string;
  index: number;
  scope: string;
}

const emojiMap = ["📱", "👗", "🏠", "💄", "⌚", "👟", "🎧", "💍"];

export default function ProductCard({
  product,
  buttonLabel = "View Item",
  index,
  scope,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const stars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
      data-ocid={`${scope}.item.${index}`}
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${product.gradient} flex items-center justify-center`}
      >
        {product.badge && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
          data-ocid={`${scope}.toggle.${index}`}
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
          />
        </button>
        <div className="text-4xl">{emojiMap[product.id % 8]}</div>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.vendor}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          {stars.map((i) => (
            <Star
              key={`star-${i}`}
              className="w-3.5 h-3.5"
              style={
                i < Math.floor(product.rating)
                  ? { fill: "#006AFF", color: "#006AFF" }
                  : { fill: "none", color: "#e5e7eb" }
              }
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">
            ({product.reviews})
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <Button
          type="button"
          className="w-full rounded-full h-9 text-sm font-semibold text-white"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid={`${scope}.button.${index}`}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
