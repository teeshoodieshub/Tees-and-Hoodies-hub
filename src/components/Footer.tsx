import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { BRAND_EMAIL, BRAND_INSTAGRAM, BRAND_SOCIAL_HANDLE, BRAND_TIKTOK } from "@/lib/seo";

const socialLinks = [
  { href: BRAND_INSTAGRAM, label: "Instagram", handle: BRAND_SOCIAL_HANDLE },
  { href: BRAND_TIKTOK, label: "TikTok", handle: BRAND_SOCIAL_HANDLE },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="mb-4 inline-flex transition-opacity hover:opacity-85" aria-label="Tees & Hoodies home">
              <img src="/brand-logo-white.png" alt="Tees & Hoodies" className="h-16 w-16 object-contain" />
            </Link>
            <p className="text-primary-foreground/60 text-sm max-w-xs leading-relaxed">
              Apparel born in Accra. Where modern elegance meets heritage craft.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Collections</p>
            <div className="flex flex-col gap-2">
              {[
                { to: "/shop", label: "Graphic Tees" },
                { to: "/shop", label: "Hoodies" },
                { to: "/shop", label: "Sleeveless" },
              ].map((link) => (
                <Link key={link.label} to={link.to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors link-underline-fx">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Company</p>
            <div className="flex flex-col gap-2">
              {[
                { to: "/about", label: "About Us" },
                { to: "/blog", label: "Blog" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors link-underline-fx">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Get in Touch</p>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-primary-foreground/60">West Africa</p>
              <a href={`mailto:${BRAND_EMAIL}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors link-underline-fx">
                {BRAND_EMAIL}
              </a>
            </div>
            <div className="mt-6">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/40">Socials</p>
              <div className="flex flex-col gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex w-fit items-center gap-2 text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                    aria-label={`Open ${social.label} profile ${social.handle}`}
                  >
                    <span>{social.label}</span>
                    <span className="text-primary-foreground/35">{social.handle}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/30">© 2026 Tees & Hoodies. Designed in Accra, Ghana.</p>
        </div>
      </div>
    </footer>
  );
}
