import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Instagram, Loader2, Mail, MapPin, Send } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { toast } from "@/components/ui/sonner";
import { submitContactMessage } from "@/lib/supabaseApi";
import {
  BRAND_EMAIL,
  BRAND_INSTAGRAM,
  BRAND_SOCIAL_HANDLE,
  BRAND_TIKTOK,
  SITE_NAME,
  SITE_URL,
  createBreadcrumbSchema,
} from "@/lib/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

const contactReasons = [
  "Custom merch and bulk print orders",
  "Sizing, fabric, and product questions",
  "Order support, delivery, and returns",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { name, email, phone, subject, message } = formData;

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Message sent", {
        description: "We received your message and will reply as soon as possible.",
      });
    } catch (error) {
      console.error("Contact notification failed:", error);
      toast.error("Message could not be sent", {
        description: "Please try again or email us directly at tees.hoodies.hub@gmail.com.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pb-20 pt-12">
      <SEOHead
        title="Contact Us"
        description={`Contact ${SITE_NAME} for custom apparel, order support, delivery questions, and product guidance. Based in Accra, Ghana.`}
        canonical="/contact"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": `${SITE_URL}/contact#contact-page`,
            name: `Contact ${SITE_NAME}`,
            url: `${SITE_URL}/contact`,
            about: { "@id": `${SITE_URL}/#organization` },
          },
        ]}
      />

      <section className="container">
        <motion.div {...fadeInUp} className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-start">
          <div>
            <p className="technical-label mb-3">Contact Us</p>
            <h1 className="max-w-3xl font-serif text-4xl font-medium italic leading-tight md:text-6xl">
              Talk to us about apparel, custom merch, or an order.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Send a note and we will help with product questions, custom print guidance, delivery support, or anything else you need before placing an order.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${BRAND_EMAIL}`}
                className="group border border-border bg-background p-5 transition-colors hover:border-foreground"
              >
                <Mail className="mb-5 h-5 w-5 text-accent" />
                <p className="text-sm font-semibold">Email</p>
                <p className="mt-1 break-words text-sm text-muted-foreground">{BRAND_EMAIL}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Send email <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>

              <a
                href={BRAND_INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                className="group border border-border bg-background p-5 transition-colors hover:border-foreground"
              >
                <Instagram className="mb-5 h-5 w-5 text-accent" />
                <p className="text-sm font-semibold">Instagram</p>
                <p className="mt-1 text-sm text-muted-foreground">{BRAND_SOCIAL_HANDLE}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Open profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>

              <a
                href={BRAND_TIKTOK}
                target="_blank"
                rel="noreferrer"
                className="group border border-border bg-background p-5 transition-colors hover:border-foreground"
              >
                <span className="mb-5 flex h-5 w-5 items-center justify-center text-xs font-bold text-accent">TT</span>
                <p className="text-sm font-semibold">TikTok</p>
                <p className="mt-1 text-sm text-muted-foreground">{BRAND_SOCIAL_HANDLE}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Open profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>

              <div className="border border-border bg-secondary/25 p-5">
                <MapPin className="mb-5 h-5 w-5 text-accent" />
                <p className="text-sm font-semibold">Location</p>
                <p className="mt-1 text-sm text-muted-foreground">Accra, Ghana. Serving customers across Ghana.</p>
              </div>

              <div className="border border-border bg-secondary/25 p-5">
                <Clock className="mb-5 h-5 w-5 text-accent" />
                <p className="text-sm font-semibold">Response</p>
                <p className="mt-1 text-sm text-muted-foreground">We reply to order and custom print requests as soon as possible.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border border-border bg-background p-6 md:p-8">
            <div className="mb-8">
              <p className="technical-label mb-3">Send a Message</p>
              <h2 className="font-serif text-3xl font-medium italic">How can we help?</h2>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-12 w-full border border-border bg-transparent px-4 text-sm transition-colors focus:border-foreground focus:outline-none"
                  placeholder="Your name"
                  required
                  maxLength={100}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="h-12 w-full border border-border bg-transparent px-4 text-sm transition-colors focus:border-foreground focus:outline-none"
                  placeholder="you@example.com"
                  required
                  maxLength={255}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Phone</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  className="h-12 w-full border border-border bg-transparent px-4 text-sm transition-colors focus:border-foreground focus:outline-none"
                  placeholder="+233 00 000 0000"
                  maxLength={40}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Subject</span>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                  className="h-12 w-full border border-border bg-transparent px-4 text-sm transition-colors focus:border-foreground focus:outline-none"
                  placeholder="Custom order, delivery, product question..."
                  maxLength={140}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Message</span>
                <textarea
                  value={formData.message}
                  onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  className="min-h-36 w-full resize-none border border-border bg-transparent px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
                  placeholder="Tell us what you need, including product, quantity, timeline, or order reference where relevant."
                  required
                  maxLength={1000}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 bg-foreground px-7 text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  Sending <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Send Message <Send className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Best for</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {contactReasons.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
