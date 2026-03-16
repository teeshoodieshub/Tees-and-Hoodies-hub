import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export default function AboutPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="container max-w-3xl">
        <motion.div {...fadeInUp}>
          <p className="technical-label mb-2">Our Story</p>
          <h1 className="font-mono text-3xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Built for the<br />Streets of Accra.
          </h1>
        </motion.div>

        <motion.div {...fadeInUp} className="mt-12 space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Tees & Hoodies was born in the creative heart of Accra — Osu. What started as a passion project between friends who couldn't find heavyweight streetwear that matched their style has grown into a movement.
          </p>
          <p>
            Every piece is designed in Accra, for Accra. We source 450–500GSM heavyweight cotton because we believe streetwear should feel as good as it looks. Our oversized silhouettes are engineered for the tropical heat without compromising on the drop-shoulder, relaxed fits that define modern street fashion.
          </p>
          <p>
            We don't chase trends. We study the textures of our city — the concrete walls of Jamestown, the red earth of Madina, the high-sun shadows of Oxford Street — and translate them into garments that tell our story.
          </p>
        </motion.div>

        <motion.div {...fadeInUp} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Founded", value: "2023" },
            { label: "Based in", value: "Accra, Ghana" },
            { label: "Fabric Weight", value: "450–500GSM" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-sm grid-line">
              <p className="technical-label mb-2">{stat.label}</p>
              <p className="font-mono text-xl font-bold uppercase tracking-tight">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeInUp} className="mt-16 p-6 bg-foreground text-background rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/40 mb-4">Our Mission</p>
          <p className="font-mono text-lg md:text-xl font-bold uppercase tracking-tight leading-relaxed">
            "To prove that world-class streetwear can be born anywhere — starting with Accra."
          </p>
        </motion.div>
      </div>
    </main>
  );
}
