import AuthModal, { type AuthView } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useFlashSale } from "@/context/FlashSaleContext";
import { useRole } from "@/context/RoleContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";

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
  onLoginRequired?: () => void;
}

const emojiMap = [
  "\ud83d\udcf1",
  "\ud83d\udc57",
  "\ud83c\udfe0",
  "\ud83d\udc84",
  "\u231a",
  "\ud83d\udc9f",
  "\ud83c\udfa7",
  "\ud83d\udc8d",
];

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m left`;
  return `${s}s left`;
}

export default function ProductCard({
  product,
  buttonLabel = "View Item",
  index,
  scope,
  onLoginRequired,
}: ProductCardProps) {
  const { role } = useRole();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { getProductSale } = useFlashSale();
  const [authView, setAuthView] = useState<AuthView>(null);
  const [heartAnim, setHeartAnim] = useState(false);
  const [now, setNow] = useState(Date.now());

  const activeSale = getProductSale(product.id);
  const stars = Array.from({ length: 5 }, (_, i) => i);
  const wishlisted = isWishlisted(product.id);
  const isLoggedIn = role !== null;

  // Tick every second only when there's a sale with a timer
  useEffect(() => {
    if (!activeSale?.endTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeSale?.endTime]);

  function handleHeartClick() {
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toggleWishlist(
      product.id,
      isLoggedIn,
      () => {
        if (onLoginRequired) {
          onLoginRequired();
        } else {
          setAuthView("login");
        }
      },
      product.price,
    );
  }

  function handleAffiliateShare(e: React.MouseEvent) {
    e.stopPropagation();
    const affiliateId = localStorage.getItem("aflino_affiliate_id") ?? "aff";
    const link = `${window.location.origin}/product/${product.id}?ref=${affiliateId}`;
    navigator.clipboard.writeText(link).then(() => {
      const el = document.getElementById(`aff-toast-${product.id}`);
      if (el) {
        el.style.opacity = "1";
        setTimeout(() => {
          el.style.opacity = "0";
        }, 2000);
      }
    });
  }

  // Determine badge and price
  const displayPrice = activeSale ? activeSale.salePrice : product.price;
  const displayOriginalPrice = activeSale
    ? activeSale.originalPrice
    : product.originalPrice;

  let badgeEl: React.ReactNode = null;
  if (activeSale) {
    if (activeSale.endTime) {
      // Flash Sale badge
      badgeEl = (
        <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white shadow">
          \ud83d\udd25 Flash Sale
        </span>
      );
    } else {
      // Hot Deal badge
      badgeEl = (
        <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow">
          \ud83d\udd25 Hot Deal
        </span>
      );
    }
  } else if (product.badge) {
    badgeEl = (
      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
        {product.badge}
      </span>
    );
  }

  const endMs = activeSale?.endTime
    ? new Date(activeSale.endTime).getTime() - now
    : null;

  return (
    <>
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        data-ocid={`${scope}.item.${index}`}
      >
        <div
          className={`relative h-44 bg-gradient-to-br ${product.gradient} flex items-center justify-center`}
        >
          {badgeEl}
          {/* Affiliate Share Button */}
          <button
            type="button"
            onClick={handleAffiliateShare}
            className="absolute bottom-2.5 left-2.5 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            title="Copy Affiliate Link"
            data-ocid={`${scope}.secondary_button.${index}`}
          >
            <Share2 className="w-4 h-4" style={{ color: "#9ca3af" }} />
          </button>
          <div
            id={`aff-toast-${product.id}`}
            style={{ opacity: 0, transition: "opacity 0.3s" }}
            className="absolute top-2 left-2 z-20 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg pointer-events-none"
          >
            Link copied!
          </div>
          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute bottom-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            data-ocid={`${scope}.toggle.${index}`}
            style={{
              transform: heartAnim ? "scale(1.35)" : "scale(1)",
              transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <Heart
              className="w-4 h-4"
              style={
                wishlisted
                  ? { fill: "#EC008C", color: "#EC008C" }
                  : { fill: "none", color: "#9ca3af" }
              }
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

          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-base font-bold"
              style={activeSale ? { color: "#006AFF" } : { color: "#111827" }}
            >
              &#8377;{displayPrice.toLocaleString("en-IN")}
            </span>
            {displayOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">
                &#8377;{displayOriginalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Flash sale countdown bar */}
          {activeSale?.endTime && endMs != null && endMs > 0 && (
            <div className="mb-2">
              <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, (endMs / (24 * 3600 * 1000)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-orange-500 font-semibold mt-0.5">
                \u23f1 {formatTimeLeft(endMs)}
              </p>
            </div>
          )}

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

      {authView && (
        <AuthModal
          view={authView}
          onClose={() => setAuthView(null)}
          onSwitchView={(v) => setAuthView(v)}
        />
      )}
    </>
  );
}
