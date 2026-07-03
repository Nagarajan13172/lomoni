import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

let lenis = null;
export function getLenis() {
  return lenis;
}

/**
 * Momentum smooth-scroll for the whole site (Lusion-style). Native scroll is
 * preserved (framer-motion whileInView / useScroll keep working) — Lenis only
 * smooths the position. Disabled on the full-viewport Pose Studio and whenever
 * the user prefers reduced motion.
 */
export default function SmoothScroll({ disabled = false }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const off = disabled || reduced;

  useEffect(() => {
    if (off) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    let raf = 0;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenis = null;
    };
  }, [off]);

  // Reset to top on every route change (replaces the old window.scrollTo).
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
