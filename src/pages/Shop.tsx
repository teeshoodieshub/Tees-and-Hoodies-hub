import { useState } from "react";
import { motion } from "framer-motion";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <main className="pt-28 pb-16">
      <div className="container">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <p className="technical-label mb-3">Browse</p>
          <h1 className="font-serif text-3xl md:text-5xl font-medium italic">Our Collection</h1>
        </motion.div>

        {/* Category Filter */}
        <motion.div {...fadeInUp} className="flex justify-center gap-6 mb-14">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-[11px] uppercase tracking-[0.2em] pb-1 transition-colors ${
              activeCategory === "all"
                ? "text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[11px] uppercase tracking-[0.2em] pb-1 transition-colors ${
                activeCategory === cat.id
                  ? "text-foreground border-b border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
