import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import ProductCard, { type ProductData } from "./ProductCard";

const featuredProducts: ProductData[] = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones Pro",
    vendor: "AudioTech Store",
    price: 129,
    originalPrice: 179,
    rating: 4.8,
    reviews: 342,
    category: "Electronics",
    badge: "Best Seller",
    gradient: "from-blue-100 to-indigo-200",
  },
  {
    id: 2,
    name: "Floral Summer Maxi Dress",
    vendor: "StyleHub",
    price: 49,
    rating: 4.6,
    reviews: 218,
    category: "Fashion",
    badge: "New",
    gradient: "from-pink-100 to-rose-200",
  },
  {
    id: 3,
    name: "Scandinavian Desk Lamp",
    vendor: "HomeDecor Co",
    price: 75,
    originalPrice: 99,
    rating: 4.7,
    reviews: 156,
    category: "Home",
    gradient: "from-amber-100 to-yellow-200",
  },
  {
    id: 4,
    name: "Korean Glass Skin Serum Set",
    vendor: "GlowBeauty",
    price: 38,
    rating: 4.9,
    reviews: 504,
    category: "Beauty",
    badge: "🔥 Hot",
    gradient: "from-purple-100 to-pink-200",
  },
  {
    id: 5,
    name: "Smart Watch Series 5 Ultra",
    vendor: "TechWorld",
    price: 249,
    originalPrice: 329,
    rating: 4.7,
    reviews: 891,
    category: "Electronics",
    badge: "Sale",
    gradient: "from-cyan-100 to-blue-200",
  },
  {
    id: 6,
    name: "Leather Chelsea Boots",
    vendor: "FootwearPro",
    price: 95,
    rating: 4.5,
    reviews: 133,
    category: "Fashion",
    gradient: "from-stone-100 to-amber-200",
  },
  {
    id: 7,
    name: "Minimalist Throw Blanket",
    vendor: "CozyLiving",
    price: 45,
    originalPrice: 65,
    rating: 4.8,
    reviews: 267,
    category: "Home",
    gradient: "from-emerald-100 to-teal-200",
  },
  {
    id: 8,
    name: "Diamond Stud Earrings",
    vendor: "LuxeJewels",
    price: 189,
    rating: 4.9,
    reviews: 72,
    category: "Beauty",
    badge: "Premium",
    gradient: "from-violet-100 to-purple-200",
  },
];

export default function FeaturedProducts() {
  return (
    <section
      id="products"
      className="max-w-[1200px] mx-auto px-6 py-12"
      data-ocid="featured.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
            data-ocid="featured.pagination_prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
            data-ocid="featured.pagination_next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featuredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
          >
            <ProductCard
              product={product}
              buttonLabel="View Item"
              index={i + 1}
              scope="featured"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
