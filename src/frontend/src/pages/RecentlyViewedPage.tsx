import { useProducts } from "@/context/ProductContext";
import type { Product } from "@/data/products";
import { clearHistory, getHistory } from "@/utils/browsingHistory";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { useState } from "react";

const AFLINO_BLUE = "#006AFF";
const AFLINO_PINK = "#FF1B8D";

interface Props {
  onBack: () => void;
  onViewProduct: (id: number) => void;
}

function HistoryProductCard({
  product,
  onViewProduct,
}: {
  product: Product;
  onViewProduct: (id: number) => void;
}) {
  const displayPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;
  const mrp = Math.round(displayPrice * 1.25);
  const discount = Math.round(((mrp - displayPrice) / mrp) * 100);

  const categoryEmoji =
    product.category === "Electronics"
      ? "💻"
      : product.category === "Fashion"
        ? "👗"
        : product.category === "Home & Kitchen"
          ? "🏠"
          : "📦";

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onViewProduct(product.id)}
      >
        <div
          className="aspect-square flex items-center justify-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f0f6ff,#deeaff)" }}
        >
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://picsum.photos/seed/${product.id}/200/200`;
              }}
            />
          ) : (
            <span className="text-5xl">{categoryEmoji}</span>
          )}
          {discount > 0 && (
            <span
              className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: AFLINO_PINK }}
            >
              -{discount}%
            </span>
          )}
        </div>
      </button>
      <div className="p-2.5">
        <p
          className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5"
          style={{ minHeight: 32 }}
        >
          {product.title}
        </p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-bold" style={{ color: AFLINO_BLUE }}>
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-gray-400 line-through">
            ₹{mrp.toLocaleString("en-IN")}
          </span>
        </div>
        <button
          type="button"
          className="mt-2 w-full text-xs font-semibold py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: AFLINO_BLUE }}
          onClick={() => onViewProduct(product.id)}
          data-ocid="history.primary_button"
        >
          View Product
        </button>
      </div>
    </article>
  );
}

export default function RecentlyViewedPage({ onBack, onViewProduct }: Props) {
  const { products } = useProducts();
  const [historyIds, setHistoryIds] = useState<number[]>(() => getHistory());

  const historyProducts = historyIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  function handleClearHistory() {
    clearHistory();
    setHistoryIds([]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              data-ocid="history.link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: AFLINO_BLUE }} />
              <h1 className="text-lg font-bold text-gray-900">
                Recently Viewed
              </h1>
              {historyProducts.length > 0 && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: AFLINO_BLUE }}
                >
                  {historyProducts.length}
                </span>
              )}
            </div>
          </div>
          {historyProducts.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: AFLINO_BLUE }}
              data-ocid="history.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {historyProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="history.empty_state"
          >
            <Clock className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-xl font-bold text-gray-400 mb-2">
              No browsing history yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Visit some products and they&apos;ll appear here.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ backgroundColor: AFLINO_BLUE }}
              data-ocid="history.primary_button"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {historyProducts.length} product
              {historyProducts.length !== 1 ? "s" : ""} you&apos;ve recently
              viewed.
            </p>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
              data-ocid="history.list"
            >
              {historyProducts.map((product) => (
                <HistoryProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={onViewProduct}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
