import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

const colorNames: Record<string, string> = {
  "#111": "Black",
  "#fff": "White",
  "#8B8B8B": "Ash",
  "#722F37": "Wine",
  "#4B5320": "Army Green",
  "#F5F5DC": "Cream",
};

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <p className="font-mono uppercase tracking-widest">Product not found</p>
        <Link to="/shop" className="technical-label mt-4 inline-block hover:text-foreground">← Back to shop</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, colorNames[selectedColor] || selectedColor);
    }
  };

  return (
    <main className="pt-20 pb-16">
      <div className="container">
        <Link to="/shop" className="inline-flex items-center gap-2 technical-label hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-[3/4] bg-secondary rounded-sm overflow-hidden"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            {product.isNew && (
              <span className="inline-block px-2 py-1 bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm mb-4">
                New Drop
              </span>
            )}
            <p className="technical-label mb-2">{product.specs}</p>
            <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight">{product.name}</h1>
            <p className="price-display text-xl mt-3">GH₵ {product.price}</p>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

            {/* Color selector */}
            <div className="mt-8">
              <p className="technical-label mb-3">Color — {colorNames[selectedColor] || "Select"}</p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)" }}
                    aria-label={colorNames[color]}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mt-8">
              <p className="technical-label mb-3">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 font-mono text-xs font-bold uppercase rounded-sm transition-colors ${
                      selectedSize === size
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="technical-label mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border rounded-sm transition-colors hover:bg-secondary"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm tabular-nums w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border rounded-sm transition-colors hover:bg-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className="w-full h-14 mt-8 bg-foreground text-background font-mono text-sm font-bold uppercase tracking-tight rounded-sm transition-all hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {!selectedSize || !selectedColor ? "Select size & color" : "Add to Cart"}
            </button>

            {/* Technical specs */}
            <div className="mt-10 p-4 bg-secondary rounded-sm" style={{ boxShadow: "var(--shadow-subtle)" }}>
              <p className="technical-label mb-3">Technical Specifications</p>
              <div className="space-y-2 text-sm">
                {product.specs.split(" · ").map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{spec}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Designed in Accra, Ghana</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <p className="technical-label mb-2">You may also like</p>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-8">Related</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
