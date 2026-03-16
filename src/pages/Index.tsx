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

const testimonials = [
  { name: "Kwame A.", text: "Best quality hoodies in Accra. The weight of the fabric is insane.", location: "Osu" },
  { name: "Ama D.", text: "I get compliments every time I wear my tee. Oversized fit is perfect.", location: "East Legon" },
  { name: "Kofi M.", text: "Finally a local brand that competes with international streetwear.", location: "Labone" },
];

export default function HomePage() {
  const featured = products.filter((p) => p.isNew).slice(0, 4);
  const newDrops = products.slice(0, 5);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-end">
        <img src={heroImg} alt="Model wearing Tees & Hoodies streetwear" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="relative container pb-16 md:pb-24 text-background z-10">
          <motion.div {...fadeInUp}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50 mb-4">Streetwear · Accra, Ghana</p>
            <h1 className="font-mono font-bold leading-[0.95] tracking-[-0.05em]" style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}>
              STREETWEAR<br />BORN IN ACCRA.
            </h1>
            <p className="mt-6 text-background/70 max-w-md text-base leading-relaxed">
              450GSM Heavyweight Cotton. Oversized fit. Built for the city.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                to="/shop"
                className="h-12 px-8 bg-background text-foreground font-mono text-sm font-bold uppercase tracking-tight rounded-sm inline-flex items-center gap-2 transition-colors hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="h-12 px-8 border border-background/30 text-background font-mono text-sm font-bold uppercase tracking-tight rounded-sm inline-flex items-center transition-colors hover:bg-background/10"
              >
                New Drops
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promo Marquee */}
      <section className="bg-foreground text-background py-3 overflow-hidden">
        <div className="marquee-track flex gap-12 whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-12">
              <span>Free Delivery in Accra</span>
              <span className="text-primary">●</span>
              <span>New Drops Weekly</span>
              <span className="text-primary">●</span>
              <span>450GSM Heavyweight</span>
              <span className="text-primary">●</span>
            </span>
          ))}
        </div>
      </section>

      {/* New Drops - Horizontal Scroll */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-8">
            <div>
              <p className="technical-label mb-2">Latest</p>
              <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight">New Drops</h2>
            </div>
            <Link to="/shop" className="technical-label hover:text-foreground transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-4 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {newDrops.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <p className="technical-label mb-2">Essentials</p>
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight">Featured</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <p className="technical-label mb-2">Community</p>
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight">What They Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                className="p-6 rounded-sm grid-line"
              >
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">"{t.text}"</p>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-tight">{t.name}</p>
                  <p className="technical-label">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container text-center">
          <motion.div {...fadeInUp}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/40 mb-4">Stay Updated</p>
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">Get Early Access to Drops</h2>
            <p className="text-background/60 text-sm mb-8 max-w-md mx-auto">
              Be the first to know when new pieces drop. No spam, just heat.
            </p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 bg-background/10 border border-background/20 rounded-sm font-mono text-sm placeholder:text-background/30 text-background focus:outline-none focus:border-primary"
              />
              <button className="h-12 px-6 bg-primary text-primary-foreground font-mono text-sm font-bold uppercase tracking-tight rounded-sm transition-transform active:scale-[0.96]">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
