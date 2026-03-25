import { useFlashSale } from "@/context/FlashSaleContext";
import { useProducts } from "@/context/ProductContext";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(sec).padStart(2, "0"),
  ].join(":");
}

function formatShort(ms: number): string {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m left`;
  return `${s}s left`;
}

interface FlashSaleSectionProps {
  onViewProduct?: (id: number) => void;
}

export default function FlashSaleSection({
  onViewProduct,
}: FlashSaleSectionProps) {
  const { getActiveSales } = useFlashSale();
  const { products } = useProducts();
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSales = getActiveSales();

  // Tick every second for countdown
  useEffect(() => {
    if (activeSales.length === 0) return;
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSales.length]);

  if (activeSales.length === 0) return null;

  // Nearest endTime among all active sales
  const endTimes = activeSales
    .filter((s) => s.endTime != null)
    .map((s) => new Date(s.endTime!).getTime());
  const nearestEnd = endTimes.length > 0 ? Math.min(...endTimes) : null;
  const mainMs = nearestEnd ? nearestEnd - now : null;

  // Map sales to products
  const saleProducts = activeSales
    .map((sale) => {
      const product = products.find((p) => p.id === sale.productId);
      if (!product) return null;
      return { sale, product };
    })
    .filter(Boolean) as {
    sale: (typeof activeSales)[0];
    product: (typeof products)[0];
  }[];

  if (saleProducts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      data-ocid="flash_sale.section"
    >
      {/* Header bar */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="text-white font-extrabold text-base tracking-wide">
            Flash Sale
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mainMs != null && mainMs > 0 ? (
            <>
              <span className="text-white/80 text-xs">Ends in</span>
              <span className="bg-white/20 text-white font-mono font-bold text-sm px-2 py-0.5 rounded-lg">
                {formatCountdown(mainMs)}
              </span>
            </>
          ) : (
            <span className="text-white/80 text-sm font-semibold">
              Hot Deals
            </span>
          )}
        </div>
      </div>

      {/* Scrollable product cards */}
      <div className="bg-orange-50 px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {saleProducts.map(({ sale, product }, i) => {
            const endMs = sale.endTime
              ? new Date(sale.endTime).getTime() - now
              : null;
            const startMs = sale.startTime
              ? new Date(sale.startTime).getTime()
              : 0;
            const totalMs = sale.endTime
              ? new Date(sale.endTime).getTime() -
                (startMs || new Date(sale.endTime).getTime() - 86400000)
              : null;
            const progressPct =
              totalMs && endMs != null
                ? Math.max(0, Math.min(100, (endMs / totalMs) * 100))
                : null;
            const discountPct = Math.round(
              ((sale.originalPrice - sale.salePrice) / sale.originalPrice) *
                100,
            );

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewProduct?.(product.id)}
                data-ocid={`flash_sale.item.${i + 1}`}
              >
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={
                      product.images?.[0] ??
                      `https://picsum.photos/seed/${product.id}/200/200`
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount badge */}
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    -{discountPct}%
                  </span>
                </div>

                <div className="p-2">
                  <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
                    {product.title}
                  </p>

                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: "#006AFF" }}
                    >
                      ₹{sale.salePrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-gray-400 line-through">
                      ₹{sale.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Per-card countdown bar */}
                  {endMs != null && endMs > 0 && progressPct != null && (
                    <div className="mt-1.5">
                      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-orange-500 font-semibold mt-0.5">
                        ⏱ {formatShort(endMs)}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="mt-2 w-full text-[10px] font-semibold text-white py-1 rounded-lg flex items-center justify-center gap-1"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProduct?.(product.id);
                    }}
                    data-ocid={`flash_sale.primary_button.${i + 1}`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Buy Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
