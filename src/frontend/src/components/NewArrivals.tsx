import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import ProductCard, { type ProductData } from "./ProductCard";

const newArrivals: ProductData[] = [
  {
    id: 9,
    name: "Bamboo Yoga Set",
    vendor: "ZenFit",
    price: 62,
    rating: 4.7,
    reviews: 89,
    category: "Fashion",
    badge: "New",
    gradient: "from-green-100 to-emerald-200",
  },
  {
    id: 10,
    name: "Portable Espresso Maker",
    vendor: "BrewMaster",
    price: 55,
    originalPrice: 79,
    rating: 4.6,
    reviews: 201,
    category: "Home",
    badge: "New",
    gradient: "from-amber-100 to-orange-200",
  },
  {
    id: 11,
    name: "UV Protection Sunglasses",
    vendor: "OpticStyle",
    price: 72,
    rating: 4.5,
    reviews: 114,
    category: "Fashion",
    badge: "New",
    gradient: "from-sky-100 to-blue-200",
  },
  {
    id: 12,
    name: "Vitamin C Brightening Kit",
    vendor: "PureSkin",
    price: 44,
    rating: 4.8,
    reviews: 330,
    category: "Beauty",
    badge: "New",
    gradient: "from-yellow-100 to-amber-200",
  },
];

export default function NewArrivals() {
  return (
    <section
      className="max-w-[1200px] mx-auto px-6 py-12 pb-16"
      data-ocid="arrivals.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
            data-ocid="arrivals.pagination_prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
            data-ocid="arrivals.pagination_next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {newArrivals.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <ProductCard
              product={product}
              buttonLabel="Shop Now"
              index={i + 1}
              scope="arrivals"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
