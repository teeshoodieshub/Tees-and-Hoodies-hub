import { Outlet } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function PublicLayout() {
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <motion.div
        className="fixed left-0 top-0 z-[70] h-1 w-full origin-left bg-accent"
        style={{ scaleX: progressScale }}
        aria-hidden="true"
      />
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
