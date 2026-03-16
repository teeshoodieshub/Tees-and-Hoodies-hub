import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Instagram, Mail, Send } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) return;
    window.location.href = `mailto:hello@teesandhoodies.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(email)}`;
  };

  return (
    <main className="pt-24 pb-16">
      <div className="container max-w-3xl">
        <motion.div {...fadeInUp}>
          <p className="technical-label mb-2">Get in Touch</p>
          <h1 className="font-mono text-3xl md:text-4xl font-bold uppercase tracking-tight">Contact Us</h1>
        </motion.div>

        {/* Quick links */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          <a
            href="https://wa.me/233000000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-5 rounded-sm grid-line transition-all hover:shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-tight">WhatsApp</p>
              <p className="technical-label">Message us directly</p>
            </div>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-5 rounded-sm grid-line transition-all hover:shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-tight">Instagram</p>
              <p className="technical-label">@teesandhoodies</p>
            </div>
          </a>
          <a
            href="mailto:hello@teesandhoodies.com"
            className="flex items-center gap-3 p-5 rounded-sm grid-line transition-all hover:shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-tight">Email</p>
              <p className="technical-label">hello@teesandhoodies.com</p>
            </div>
          </a>
        </motion.div>

        {/* Contact form */}
        <motion.form {...fadeInUp} onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div>
            <label className="technical-label mb-2 block">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 px-4 bg-secondary rounded-sm font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="Your name"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="technical-label mb-2 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 bg-secondary rounded-sm font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="your@email.com"
              required
              maxLength={255}
            />
          </div>
          <div>
            <label className="technical-label mb-2 block">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full h-32 px-4 py-3 bg-secondary rounded-sm font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
              placeholder="What's on your mind?"
              required
              maxLength={1000}
            />
          </div>
          <button
            type="submit"
            className="h-12 px-8 bg-foreground text-background font-mono text-sm font-bold uppercase tracking-tight rounded-sm inline-flex items-center gap-2 transition-colors hover:bg-primary active:scale-[0.98]"
          >
            Send Message <Send className="w-4 h-4" />
          </button>
        </motion.form>
      </div>
    </main>
  );
}
