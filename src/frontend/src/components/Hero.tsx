import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Store } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onShopClick: () => void;
}

const tileColors = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-pink-600",
  "from-indigo-400 to-indigo-600",
  "from-purple-400 to-purple-600",
  "from-cyan-400 to-cyan-600",
  "from-rose-400 to-rose-600",
];

export default function Hero({ onShopClick }: HeroProps) {
  return (
    <section id="home" className="pt-[72px]" data-ocid="hero.section">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F2C55 0%, #1F5E9A 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8 px-10 py-14">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center md:text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 bg-white/10 rounded-full px-3 py-1 mb-4">
                🛍️ Multi-Vendor Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Discover Unique Products from
                <span style={{ color: "#FF1B8D" }}> Top Vendors</span>
              </h1>
              <p className="text-blue-100/80 text-base md:text-lg mb-8 max-w-md">
                Shop from thousands of verified sellers. Find the best deals on
                electronics, fashion, home goods, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button
                  type="button"
                  onClick={onShopClick}
                  className="rounded-full px-7 h-11 text-sm font-semibold text-white flex items-center gap-2"
                  style={{ backgroundColor: "#006AFF" }}
                  data-ocid="hero.primary_button"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Start Shopping
                </Button>
                <Button
                  type="button"
                  className="rounded-full px-7 h-11 text-sm font-semibold text-white border-0 flex items-center gap-2"
                  style={{ backgroundColor: "#FF1B8D" }}
                  data-ocid="hero.secondary_button"
                >
                  <Store className="w-4 h-4" />
                  Become a Vendor
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Carousel dots */}
              <div className="flex gap-2 mt-8 justify-center md:justify-start">
                <span className="rounded-full w-6 h-2 bg-white transition-all" />
                <span className="rounded-full w-2 h-2 bg-white/40 transition-all" />
                <span className="rounded-full w-2 h-2 bg-white/40 transition-all" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden md:grid grid-cols-3 gap-3 flex-shrink-0"
            >
              {tileColors.map((gradient) => (
                <div
                  key={gradient}
                  className={`w-20 h-20 rounded-xl bg-gradient-to-br ${gradient} opacity-80`}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
