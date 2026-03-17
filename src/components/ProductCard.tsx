import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Product } from "@/data/products";

const categoryLabels: Record<string, string> = {
  "graphic-tees": "Graphic Tees",
  "hoodies": "Hoodies",
  "sleeveless-hoodies": "Sleeveless",
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div {...fadeInUp}>
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="pt-5 pb-2">
          <p className="technical-label mb-2">{categoryLabels[product.category] || product.category}</p>
          <h3 className="font-serif text-lg md:text-xl font-medium italic">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="price-display text-sm font-semibold">GH₵{product.price.toLocaleString()}.00</span>
            <span className="text-accent text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
