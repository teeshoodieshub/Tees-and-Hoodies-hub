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
      <div className="pt-28 pb-16 container text-center">
        <p className="font-serif text-xl italic">Product not found</p>
        <Link to="/shop" className="technical-label mt-4 inline-block hover:text-foreground">← Back to collection</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 2);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, colorNames[selectedColor] || selectedColor);
    }
  };

  return (
    <main className="pt-24 pb-16">
      <div className="container">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-[4/3] bg-secondary overflow-hidden"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="technical-label mb-3">{product.specs}</p>
            <h1 className="font-serif text-2xl md:text-4xl font-medium italic">{product.name}</h1>
            <p className="text-xl font-semibold mt-4">GH₵{product.price.toLocaleString()}.00</p>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

            {/* Color selector */}
            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Color — {colorNames[selectedColor] || "Select"}</p>
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
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-xs uppercase font-medium transition-colors border ${
                      selectedSize === size
                        ? "bg-foreground text-primary-foreground border-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-border transition-colors hover:border-foreground"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm tabular-nums w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border transition-colors hover:border-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className="w-full h-14 mt-8 bg-foreground text-primary-foreground text-sm uppercase tracking-[0.1em] font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!selectedSize || !selectedColor ? "Select size & color" : "Add to Cart"}
            </button>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <p className="technical-label mb-2">You may also like</p>
              <h2 className="font-serif text-2xl font-medium italic">Related Pieces</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
