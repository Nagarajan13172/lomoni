import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SmoothScroll from "./SmoothScroll";

export default function Layout() {
  const { pathname } = useLocation();

  // The pose studio is a full-viewport tool — no footer, no page scroll.
  const isStudio = pathname === "/studio";

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Momentum scroll for the whole site (handles scroll-to-top on nav too) */}
      <SmoothScroll disabled={isStudio} />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 pt-[68px]"
      >
        <Outlet />
      </motion.main>
      {!isStudio && <Footer />}
    </div>
  );
}
