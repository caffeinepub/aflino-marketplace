import { Cpu, Home, Shirt, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const categories = [
  {
    label: "Electronics",
    icon: Cpu,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Fashion",
    icon: Shirt,
    bg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    label: "Home & Living",
    icon: Home,
    bg: "bg-blue-50",
    iconColor: "text-indigo-500",
  },
  {
    label: "Beauty",
    icon: Sparkles,
    bg: "bg-pink-50",
    iconColor: "text-rose-500",
  },
];

export default function Categories() {
  return (
    <section
      className="max-w-[1200px] mx-auto px-6 py-12"
      data-ocid="categories.section"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-900 text-center mb-8"
      >
        Popular Categories
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              data-ocid={`categories.item.${i + 1}`}
            >
              <div
                className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center`}
              >
                <Icon className={`w-7 h-7 ${cat.iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
