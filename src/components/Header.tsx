import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Categories" },
];

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
        isHome
          ? "border-white/10 bg-transparent text-white"
          : "border-border bg-background/95 text-foreground backdrop-blur-sm"
      }`}
    >
      <div className="container relative flex h-[72px] items-center justify-between">
        <Link
          to="/"
          className={`font-sans text-xl md:text-2xl font-semibold tracking-tight text-lift-hover ${
            isHome ? "text-white" : "text-foreground"
          }`}
        >
          <span
            className={`mr-1 rounded-[6px] px-2 py-1 ${
              isHome ? "bg-white/90 text-[#765343]" : "bg-foreground text-background"
            }`}
          >
            TEES
          </span>
          <span className={isHome ? "text-white" : "text-foreground"}>&amp; HOODIES</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.label === "Categories" ? "/shop#categories" : link.to}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                location.pathname === link.to && link.label !== "Categories"
                  ? isHome
                    ? "bg-white/90 text-[#111111]"
                    : "bg-foreground text-background"
                  : isHome
                    ? "border border-white/10 bg-white/10 text-white hover:bg-white/20"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/about"
            className={`hidden h-10 w-10 items-center justify-center rounded-full border md:inline-flex ${
              isHome
                ? "border-white/50 bg-white/10 text-white"
                : "border-border bg-background text-foreground"
            }`}
            aria-label="Account"
          >
            <User className="h-5 w-5" strokeWidth={1.6} />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-75 ${
              isHome
                ? "border-white/50 bg-white/10 text-white"
                : "border-border bg-background text-foreground"
            }`}
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border md:hidden ${
              isHome
                ? "border-white/50 bg-white/10 text-white"
                : "border-border bg-background text-foreground"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`md:hidden overflow-hidden border-t ${
              isHome ? "border-white/10 bg-[#2c231f]/95 text-white" : "border-border bg-background"
            }`}
          >
            <div className="container py-6 flex flex-col items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.label === "Categories" ? "/shop#categories" : link.to}
                  onClick={() => setMobileOpen(false)}
                  className={isHome ? "py-2 text-sm font-medium text-white/80 hover:text-white" : "py-2 text-sm font-medium text-muted-foreground hover:text-foreground"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
