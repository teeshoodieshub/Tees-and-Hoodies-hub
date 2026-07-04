import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Printer, Shirt, Palette, CheckCircle2, ShieldCheck, Truck, Sparkles, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { listCategories, listHeroImages } from "@/lib/supabaseApi";
import { defaultHeroImageUrls } from "@/lib/heroDefaults";
import SEOHead from "@/components/SEOHead";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const heroContentPresets = [
  {
    label: "Accra Atelier - Premium Streetwear",
    title: "Built For",
    accent: "After Hours.",
    description: "Boxy silhouettes, dense cotton, and clean lines tuned for city nights and everyday rotation.",
    dropName: "Uniform 01",
  },
  {
    label: "Heavyweight Program",
    title: "Weight You",
    accent: "Can Feel.",
    description: "Structured hoodies cut to drape right - warm, substantial, and made for repeat wear.",
    dropName: "Hoodie Focus",
  },
  {
    label: "Limited Color Story",
    title: "Colorways With",
    accent: "Depth.",
    description: "Muted earth tones and deep wine shades engineered to pair cleanly across the entire set.",
    dropName: "Tone Pack",
  },
  {
    label: "Core Essentials",
    title: "Everyday Tees,",
    accent: "Elevated.",
    description: "Soft-hand finish, oversized block, and lasting collars that hold shape beyond the first wash.",
    dropName: "Core Tees",
  },
];

const services = [
  {
    title: "Sale Of Plain Merchs",
    description: "Premium blank tees, hoodies, and sleeveless cuts in clean, wearable colorways.",
    icon: Shirt,
  },
  {
    title: "Custom Print",
    description: "Brand, event, and team printing with quality ink application and durable finish.",
    icon: Printer,
  },
  {
    title: "Design Support",
    description: "Need help with placement, sizing, or mockups? We guide you before production.",
    icon: Palette,
  },
];

const howItWorks = [
  { title: "Send Brief", detail: "Share your quantity, garment type, and artwork (or text idea)." },
  { title: "Approve Mockup", detail: "We confirm layout, color, and placement before production starts." },
  { title: "Production", detail: "Your order is printed and finished with quality checks." },
  { title: "Delivery", detail: "Pickup or delivery with updates from confirmation to completion." },
];

const reasons = [
  { title: "Heavyweight Quality", detail: "450-500 GSM options with reliable structure and fit.", icon: ShieldCheck },
  { title: "Fast Turnaround", detail: "Clear timelines and consistent communication per order.", icon: Truck },
  { title: "Culture-First Design", detail: "Street-led cuts and visuals built for local and global wear.", icon: Sparkles },
];

const testimonials = [
  {
    quote: "Our event merch sold out in two days. Print quality and fit were both on point.",
    name: "Kofi A.",
    role: "Community Organizer",
  },
  {
    quote: "The hoodie blanks feel premium and the finishing is clean. Easy reorder process too.",
    name: "Nana E.",
    role: "Fashion Retailer",
  },
  {
    quote: "From mockup to delivery, everything was smooth. Great support and solid final product.",
    name: "Ama T.",
    role: "Brand Manager",
  },
];

const heroQuickCategories = [
  { label: "Premium Hoodies", to: "/shop?category=hoodies", wide: true },
  { label: "Heavyweight Tees", to: "/shop?category=t-shirts", wide: true },
  { label: "Custom Prints", to: "/custom-prints" },
  { label: "Studio Mockups", to: "/custom-studio" },
  { label: "Shop All", to: "/shop" },
];

export default function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
  const { data: heroImages = [] } = useQuery({
    queryKey: ["hero-images"],
    queryFn: listHeroImages,
    staleTime: 5 * 60 * 1000,
  });
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);
  const [heroApi, setHeroApi] = useState<CarouselApi>();
  const [isCategoryScrollerPaused, setIsCategoryScrollerPaused] = useState(false);
  const heroImageUrls = heroImages.length > 0 ? heroImages.map((image) => image.image_url) : defaultHeroImageUrls;
  const storyImageUrl = heroImageUrls[1] || defaultHeroImageUrls[0];
  const serviceImageUrls = services.map((_, index) => heroImageUrls[index % heroImageUrls.length] || defaultHeroImageUrls[index % defaultHeroImageUrls.length]);
  const heroSlides = heroImageUrls.map((image, index) => ({
    image,
    ...heroContentPresets[index % heroContentPresets.length],
  }));
  const categoryPanels = dbCategories.map((category, index) => {
    const categoryProduct = products.find((product) => product.category === category.id && product.images?.[0]);
    return {
      id: category.id,
      name: category.name,
      image: category.image_url || categoryProduct?.images?.[0] || defaultHeroImageUrls[index % defaultHeroImageUrls.length],
    };
  });
  const loopingCategoryPanels = categoryPanels.length > 1 ? [...categoryPanels, ...categoryPanels] : categoryPanels;

  useEffect(() => {
    const scroller = categoryScrollerRef.current;
    if (!scroller || categoryPanels.length < 2 || isCategoryScrollerPaused) {
      return;
    }

    let frameId = 0;
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const singleLoopWidth = scroller.scrollWidth / 2;

      scroller.scrollLeft += (elapsed * 48) / 1000;

      if (scroller.scrollLeft >= singleLoopWidth) {
        scroller.scrollLeft -= singleLoopWidth;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [categoryPanels.length, isCategoryScrollerPaused]);

  useEffect(() => {
    if (!heroApi) {
      return;
    }

    const interval = window.setInterval(() => {
      heroApi.scrollNext();
    }, 6000);

    return () => window.clearInterval(interval);
  }, [heroApi]);

  return (
    <main>
      <SEOHead
        title="Premium Streetwear from Accra, Ghana"
        description="Shop heavyweight 450-500 GSM tees, hoodies, and custom prints from Accra, Ghana. Culture-first streetwear designed for everyday wear. Free delivery in Accra on orders above GHC 1000."
        canonical="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Tees & Hoodies Hub",
            "url": "https://teesandhoodies.com",
            "logo": "https://teesandhoodies.com/favicon.svg",
            "description": "Premium heavyweight streetwear from Accra, Ghana",
            "contactPoint": { "@type": "ContactPoint", "email": "hello@teesandhoodies.com", "contactType": "customer service" },
            "sameAs": ["https://instagram.com/teesandhoodies"],
            "address": { "@type": "PostalAddress", "addressLocality": "Accra", "addressCountry": "GH" }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Tees & Hoodies Hub",
            "url": "https://teesandhoodies.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://teesandhoodies.com/shop?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[100svh] bg-foreground">
        <Carousel setApi={setHeroApi} opts={{ loop: true }} className="h-full">
          <CarouselContent className="ml-0 h-full">
            {heroSlides.map((slide, index) => (
              <CarouselItem key={`${slide.title}-${index}-${slide.image}`} className="pl-0">
                <div className="relative min-h-[100svh]">
                  <motion.img
                    src={slide.image}
                    alt={`${slide.title} ${slide.accent}`}
                    className="absolute inset-0 h-full w-full scale-105 object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(45,64,51,0.88)_0%,rgba(45,64,51,0.62)_42%,rgba(138,154,91,0.42)_100%)]"
                  />
                  <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_68%_45%,rgba(166,139,92,0.18),transparent_32%),linear-gradient(180deg,rgba(45,64,51,0.12)_0%,rgba(45,64,51,0.08)_36%,rgba(45,64,51,0.56)_100%)]"
                  />
                  <div className="absolute inset-x-0 top-[72px] h-px bg-white/10" />

                  <div className="relative z-10 container min-h-[100svh] pb-8 pt-24 text-white md:pt-28">
                    <div className="flex min-h-[calc(100svh-8rem)] flex-col justify-center">
                      <motion.div {...fadeInUp} className="max-w-[980px]">
                        <h1 className="font-sans text-[2.75rem] font-normal leading-[0.98] tracking-normal sm:text-[3.9rem] md:text-[clamp(4rem,4.8vw,5.35rem)]">
                          Elevate your fit with soft heavyweight essentials.
                        </h1>
                        <p className="mt-5 max-w-[620px] text-lg font-medium leading-snug text-white/92 md:text-2xl">
                          Premium tees, hoodies, and custom prints made to keep your everyday rotation clean.
                        </p>
                      </motion.div>

                      <motion.div
                        {...fadeInUp}
                        className="mt-8 grid max-w-[484px] grid-cols-2 gap-2 md:ml-auto md:mt-10 md:gap-4"
                      >
                        {heroQuickCategories.map((category) => (
                          <Link
                            key={category.label}
                            to={category.to}
                            className={`inline-flex h-10 items-center justify-center rounded-[14px] border border-white/20 bg-white/15 px-4 text-center text-[11px] font-extrabold uppercase leading-tight text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-colors hover:bg-white/25 md:h-12 md:px-5 md:text-sm ${
                              category.wide ? "md:min-w-[238px]" : ""
                            }`}
                          >
                            {category.label}
                          </Link>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <p className="technical-label mb-3">Our Collection</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">Featured Pieces</h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          >
            {featured.map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div {...fadeInUp} className="text-center mt-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-accent border-b border-accent/40 pb-1 hover:border-accent transition-colors link-underline-fx"
            >
              View All Pieces <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      )}

      {/* About strip */}
      <section id="story" className="overflow-hidden bg-secondary text-secondary-foreground">
        <div className="container max-w-6xl py-20 md:py-0">
          <div className="grid gap-10 md:min-h-[560px] md:grid-cols-[0.9fr_1.1fr] md:items-stretch">
            <motion.div {...fadeInUp} className="flex flex-col justify-center text-center md:py-20 md:text-left">
              <p className="technical-label mb-3 text-secondary-foreground/70">Our Story</p>
              <h2 className="font-serif text-3xl md:text-5xl font-medium italic mb-6 text-lift-hover">Crafted in West Africa</h2>
              <p className="text-secondary-foreground/82 leading-relaxed max-w-xl mx-auto md:mx-0">
                Every piece is designed in Accra, for the world. We source 450-500GSM heavyweight cotton because we believe streetwear should feel as good as it looks.
              </p>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-secondary-foreground border-b border-secondary-foreground/45 pb-1 hover:border-secondary-foreground transition-colors link-underline-fx"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 64 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[320px] overflow-hidden md:min-h-full"
            >
              <img
                src={storyImageUrl}
                alt="Tees and Hoodies streetwear from Accra"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="overflow-hidden py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="technical-label mb-3">Our Services</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">Built For Brands And Everyday Wear</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: 120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{ duration: 0.7, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative min-h-[340px] overflow-hidden border border-border bg-foreground text-primary-foreground md:min-h-[470px]"
                >
                  <img
                    src={serviceImageUrls[index]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/35 to-foreground/10" />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/95 via-foreground/70 to-transparent" />
                  <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-6 md:min-h-[470px] md:p-8">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/35 bg-primary-foreground/10 backdrop-blur-sm">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-3xl italic mb-4 md:text-4xl">{service.title}</h3>
                    <p className="text-sm text-primary-foreground/90 leading-relaxed md:text-base">{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Print */}
      <section className="py-20 md:py-28 bg-secondary text-secondary-foreground">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div {...fadeInUp}>
              <p className="technical-label mb-3 text-secondary-foreground/70">Custom Print</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium italic mb-5 text-lift-hover">Your Design, Our Production</h2>
              <p className="text-secondary-foreground/82 leading-relaxed mb-6">
                From one-off drops to bulk runs, we print on premium blanks with clear placement and long-lasting finish.
              </p>
              <Link
                to="/custom-prints"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-secondary-foreground border-b border-secondary-foreground/45 pb-1 hover:border-secondary-foreground transition-colors link-underline-fx"
              >
                Start Custom Order <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div {...fadeInUp} className="border border-border p-6 bg-background/70">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-1 text-accent" />
                  <span className="text-sm text-muted-foreground">Single-color and multi-color print options.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-1 text-accent" />
                  <span className="text-sm text-muted-foreground">Front, back, and sleeve placement support.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-1 text-accent" />
                  <span className="text-sm text-muted-foreground">Quality checks on garments and print finish.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="technical-label mb-3">How It Works</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">Simple Process, Clear Delivery</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div key={step.title} {...fadeInUp} className="border border-border p-5 bg-background/70">
                <p className="text-[11px] uppercase tracking-[0.18em] text-accent mb-3">Step {index + 1}</p>
                <h3 className="font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-foreground text-primary-foreground">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="technical-label text-primary-foreground/75 mb-3">Why Choose Us</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">Made With Intent, Delivered With Care</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} {...fadeInUp} className="border border-primary-foreground/20 p-6 bg-primary-foreground/5">
                  <Icon className="w-5 h-5 text-accent mb-4" />
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-primary-foreground/75 leading-relaxed">{item.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="technical-label mb-3">Testimonials</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">What Customers Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <motion.div key={item.name} {...fadeInUp} className="border border-border p-6 bg-background/70">
                <div className="flex gap-1 text-accent mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm leading-relaxed mb-5">"{item.quote}"</p>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Spotlight */}
      {categoryPanels.length > 0 && (
        <section id="categories" className="py-4 md:py-6">
          <div className="px-2 md:px-4">
            <motion.div {...fadeInUp} className="mb-4 md:mb-5 px-2 md:px-0">
              <p className="technical-label mb-2">Shop By Category</p>
              <h2 className="font-serif text-2xl md:text-4xl font-medium italic text-lift-hover">Find Your Fit</h2>
            </motion.div>
            <motion.div
              ref={categoryScrollerRef}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar"
              onMouseEnter={() => setIsCategoryScrollerPaused(true)}
              onMouseLeave={() => setIsCategoryScrollerPaused(false)}
              onTouchStart={() => setIsCategoryScrollerPaused(true)}
              onTouchEnd={() => setIsCategoryScrollerPaused(false)}
              onFocusCapture={() => setIsCategoryScrollerPaused(true)}
              onBlurCapture={() => setIsCategoryScrollerPaused(false)}
            >
              {loopingCategoryPanels.map((panel, index) => {
                const sourceIndex = index % categoryPanels.length;

                return (
                  <motion.div
                    key={`${panel.id}-${index}`}
                    variants={staggerItem}
                    className={`shrink-0 ${sourceIndex < 2 ? "basis-[82vw] md:basis-[42vw]" : "basis-[58vw] md:basis-[26vw]"}`}
                  >
                    <Link
                      to={`/shop?category=${encodeURIComponent(panel.id)}`}
                      className="relative overflow-hidden group block w-full h-full"
                    >
                      <div className="relative h-[58vh] min-h-[380px] md:h-[68vh]">
                        <img src={panel.image} alt={panel.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex items-center justify-between">
                          <h3 className="text-primary-foreground text-lg md:text-3xl font-medium uppercase tracking-tight">
                            {panel.name}
                          </h3>
                          <span className="text-primary-foreground text-xs md:text-sm uppercase tracking-[0.14em] border-b border-primary-foreground/60 pb-1">
                            Shop Now
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-24 bg-foreground text-primary-foreground">
        <div className="container text-center max-w-3xl">
          <motion.div {...fadeInUp}>
            <p className="technical-label text-primary-foreground/75 mb-3">Ready To Start?</p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium italic mb-5 text-gradient-animated text-glow-soft">Launch Your Next Merch Drop With Us</h2>
            <p className="text-primary-foreground/75 mb-8">
              Shop ready-made pieces or place a custom print order for your team, brand, or event.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-11 px-5 bg-accent text-accent-foreground text-xs uppercase tracking-[0.16em] font-medium hover:opacity-90 transition-opacity"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/custom-prints"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-primary-foreground border-b border-primary-foreground/40 pb-1 hover:border-primary-foreground transition-colors link-underline-fx"
              >
                Start Custom Print
              </Link>
            </div>
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
