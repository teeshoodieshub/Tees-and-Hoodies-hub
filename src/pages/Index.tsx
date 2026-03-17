import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-hoodie.jpg";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function HomePage() {
  const featured = products.slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end">
        <img src={heroImg} alt="Model wearing Tees & Hoodies streetwear" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <div className="relative container pb-16 text-primary-foreground z-10">
          <motion.div {...fadeInUp}>
            <h1 className="font-serif font-semibold leading-[1.1] tracking-wide" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Streetwear Born<br />in Accra.
            </h1>
            <p className="mt-4 text-primary-foreground/70 max-w-md text-base leading-relaxed">
              Heavyweight cotton. Oversized fits. Designed for the culture.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-primary-foreground border-b border-primary-foreground/40 pb-1 hover:border-primary-foreground transition-colors"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <p className="technical-label mb-3">Our Collection</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic">Featured Pieces</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <motion.div {...fadeInUp} className="text-center mt-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-accent border-b border-accent/40 pb-1 hover:border-accent transition-colors"
            >
              View All Pieces <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About strip */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container max-w-3xl text-center">
          <motion.div {...fadeInUp}>
            <p className="technical-label mb-3">Our Story</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic mb-6">Crafted in West Africa</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Every piece is designed in Accra, for the world. We source 450–500GSM heavyweight cotton because we believe streetwear should feel as good as it looks.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-accent border-b border-accent/40 pb-1 hover:border-accent transition-colors"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-28">
        <div className="container max-w-lg text-center">
          <motion.div {...fadeInUp}>
            <p className="technical-label mb-3">Stay Updated</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic mb-4">Get Early Access</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Be the first to know when new pieces drop.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 border border-border bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
              />
              <button className="h-12 px-6 bg-foreground text-primary-foreground text-sm uppercase tracking-[0.1em] font-medium transition-opacity hover:opacity-90">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
