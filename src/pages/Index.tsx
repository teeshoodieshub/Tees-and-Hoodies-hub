import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Printer, Shirt, Palette, CheckCircle2, ShieldCheck, Truck, Sparkles, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { listCategories, listHeroImages } from "@/lib/supabaseApi";
import { defaultHeroImageUrls } from "@/lib/heroDefaults";
import SEOHead from "@/components/SEOHead";
import {
  createFaqSchema,
  createLocalBusinessSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from "@/lib/seo";

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

const scrollRevealItem = {
  initial: { opacity: 0, y: 34, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
};

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

const answerEngineFaqs = [
  {
    question: "Where can I buy heavyweight hoodies and tees in Accra?",
    answer:
      "Tees & Hoodies Hub sells heavyweight tees, hoodies, sleeveless tops, and custom printed apparel from Accra, Ghana through teesandhoodies.com.",
  },
  {
    question: "Does Tees & Hoodies Hub make custom merch for brands and events?",
    answer:
      "Yes. Customers can order custom printed tees, hoodies, polos, and sleeveless tops for brands, teams, events, and merch drops, with mockup support before production.",
  },
  {
    question: "What fabric weight does Tees & Hoodies Hub use?",
    answer:
      "The brand focuses on premium heavyweight garments, including 450-500 GSM cotton options for structured apparel pieces.",
  },
];

const heroSlides = [
  {
    videoUrl: "/hero/magnific_animate-start-image_dIWwgSgXSL.mp4",
    title: "Buy plain Hoodies, Sweatshirts and Tees",
    description: "",
    label: "Essentials",
  },
  {
    videoUrl: "/hero/magnific_animate-start-image-and-m_SOkuBbCUb8.mp4",
    title: "Customize all your merch with us",
    description: "",
    label: "Studio",
  },
];

const serviceImageOverrides = ["/services/plain-merch-fashion-portrait.png"];

function TypewriterHeroTitle({
  text,
  reducedMotion,
}: {
  text: string;
  reducedMotion: boolean;
}) {
  const [typedText, setTypedText] = useState(reducedMotion ? text : "");

  useEffect(() => {
    if (reducedMotion) {
      setTypedText(text);
      return;
    }

    setTypedText("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 80);

    return () => window.clearInterval(interval);
  }, [text, reducedMotion]);

  return (
    <h1
      className="font-sans text-[2.75rem] font-normal leading-[0.98] tracking-normal sm:text-[3.9rem] md:text-[clamp(4rem,4.8vw,5.35rem)]"
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span className="relative block" aria-hidden="true">
        <span className="invisible">{text}</span>
        <span className="absolute inset-0">
          {typedText}
          {!reducedMotion && (
            <span
              className="ml-2 inline-block h-[0.82em] w-[0.08em] translate-y-[0.08em] animate-pulse rounded-full bg-secondary"
              aria-hidden="true"
            />
          )}
        </span>
      </span>
    </h1>
  );
}

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
  const heroRef = useRef<HTMLElement | null>(null);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isCategoryScrollerPaused, setIsCategoryScrollerPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroVideoY = useTransform(heroScrollProgress, [0, 1], ["0%", "14%"]);
  const heroContentY = useTransform(heroScrollProgress, [0, 1], ["0%", "-9%"]);
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.75], [1, 0.82]);
  const heroImageUrls = heroImages.length > 0 ? heroImages.map((image) => image.image_url) : defaultHeroImageUrls;
  const activeHero = heroSlides[activeHeroSlide];
  const storyImageUrl = heroImageUrls[1] || defaultHeroImageUrls[0];
  const serviceImageUrls = services.map((_, index) => serviceImageOverrides[index] || heroImageUrls[index % heroImageUrls.length] || defaultHeroImageUrls[index % defaultHeroImageUrls.length]);
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
    if (heroSlides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 8500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main>
      <SEOHead
        title="Premium Apparel from Accra, Ghana"
        description="Shop heavyweight 450-500 GSM tees, hoodies, and custom prints from Accra, Ghana. Culture-first apparel designed for everyday wear. Free delivery in Accra on orders above GHC 1000."
        canonical="/"
        jsonLd={[
          createOrganizationSchema(),
          createWebsiteSchema(),
          createLocalBusinessSchema(),
          createFaqSchema(answerEngineFaqs),
        ]}
      />
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[100svh] bg-foreground">
        {heroSlides.map((slide, index) => (
          <motion.video
            key={slide.videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            style={prefersReducedMotion ? undefined : { y: heroVideoY }}
            initial={false}
            animate={{
              opacity: activeHeroSlide === index ? 1 : 0,
              scale: activeHeroSlide === index ? 1.05 : 1.09,
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            autoPlay
            loop
            muted
            playsInline
            preload={index === 0 ? "auto" : "metadata"}
            poster={defaultHeroImageUrls[index] || defaultHeroImageUrls[0]}
            aria-hidden={activeHeroSlide !== index}
          >
            <source src={slide.videoUrl} type="video/mp4" />
          </motion.video>
        ))}
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(45,64,51,0.88)_0%,rgba(45,64,51,0.62)_42%,rgba(138,154,91,0.42)_100%)]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_68%_45%,rgba(166,139,92,0.18),transparent_32%),linear-gradient(180deg,rgba(45,64,51,0.12)_0%,rgba(45,64,51,0.08)_36%,rgba(45,64,51,0.56)_100%)]"
        />
        <div className="absolute inset-x-0 top-[72px] h-px bg-white/10" />

        <motion.div
          className="relative z-10 container min-h-[100svh] pb-8 pt-24 text-white md:pt-28"
          style={prefersReducedMotion ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
        >
          <div className="flex min-h-[calc(100svh-8rem)] flex-col justify-center">
            <motion.div
              key={activeHero.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[980px]"
            >
              <TypewriterHeroTitle text={activeHero.title} reducedMotion={Boolean(prefersReducedMotion)} />
              {activeHero.description && (
                <p className="mt-5 max-w-[620px] text-lg font-medium leading-snug text-white/92 md:text-2xl">
                  {activeHero.description}
                </p>
              )}
            </motion.div>

            <motion.div {...fadeInUp} className="mt-8">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-secondary px-7 text-sm font-bold uppercase tracking-[0.14em] text-secondary-foreground shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 hover:bg-secondary/90"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-8 z-20 md:bottom-10">
          <div className="container flex items-center gap-3">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => setActiveHeroSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeHeroSlide === index ? "w-12 bg-background" : "w-2.5 bg-background/45 hover:bg-background/70"
                }`}
                aria-label={`Show ${slide.label} hero video`}
                aria-current={activeHeroSlide === index}
              />
            ))}
          </div>
        </div>
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
        <div className="grid md:min-h-[560px] md:grid-cols-2 md:items-stretch">
          <motion.div
            {...fadeInUp}
            className="flex flex-col justify-center px-6 py-20 text-center md:ml-auto md:w-full md:max-w-[640px] md:px-12 md:py-20 md:pr-16 md:text-left"
          >
            <p className="technical-label mb-3 text-secondary-foreground/70">Our Story</p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium italic mb-6 text-lift-hover">Crafted in Ghana</h2>
            <p className="text-secondary-foreground/82 leading-relaxed max-w-xl mx-auto md:mx-0">
              Every piece is designed in Accra, for the world. We source 450-500GSM heavyweight cotton because we believe apparel should feel as good as it looks.
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
              alt="Tees and Hoodies apparel from Accra"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
          </motion.div>
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
              <motion.div
                key={step.title}
                {...scrollRevealItem}
                transition={{ ...scrollRevealItem.transition, delay: index * 0.08 }}
                className="border border-border p-5 bg-background/70"
              >
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
            {reasons.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  {...scrollRevealItem}
                  transition={{ ...scrollRevealItem.transition, delay: index * 0.1 }}
                  className="border border-primary-foreground/20 p-6 bg-primary-foreground/5"
                >
                  <Icon className="w-5 h-5 text-accent mb-4" />
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-primary-foreground/75 leading-relaxed">{item.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Answer Engine Content */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <p className="technical-label mb-3">Quick Answers</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic text-lift-hover">Tees & Hoodies Hub At A Glance</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {answerEngineFaqs.map((item, index) => (
              <motion.article
                key={item.question}
                {...scrollRevealItem}
                transition={{ ...scrollRevealItem.transition, delay: index * 0.08 }}
                className="border border-border bg-background/70 p-6"
              >
                <h3 className="font-serif text-lg font-medium italic leading-snug">{item.question}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </motion.article>
            ))}
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
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                {...scrollRevealItem}
                transition={{ ...scrollRevealItem.transition, delay: index * 0.1 }}
                className="border border-border p-6 bg-background/70"
              >
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
