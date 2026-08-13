import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "../data/site";
import { Arrow } from "./ui";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled ? "bg-paper/85 backdrop-blur-md border-b border-ink/10" : "bg-transparent"
        }`}
      >
        <nav className="container-x flex h-[68px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="LOMONI Design Studio — home">
            <img src="/images/logo.png" alt="" className="h-9 w-9 rounded-full" />
            <span className="font-display text-[15px] font-bold leading-none tracking-tight">
              <span className="brandmark">LOMONI</span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-coral">
                ROAD TO D-SCHOOL
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-coral ${
                      isActive ? "text-coral" : "text-ink"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link to="/contact" className="btn btn-primary hidden sm:inline-flex">
              Free counselling <Arrow />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-5 bg-ink transition-all ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-5 bg-ink transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="container-x lg:hidden"
          >
            <div className="mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-paper p-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 font-display font-semibold ${
                      isActive ? "bg-coral text-white" : "hover:bg-paper-deep"
                    }`
                  }
                >
                  {n.label} <Arrow className="h-4 w-4 opacity-60" />
                </NavLink>
              ))}
              <a
                href={`https://wa.me/${site.phones[0].raw}`}
                className="mt-2 flex items-center justify-center rounded-xl bg-ink px-4 py-3 font-display font-semibold text-paper"
              >
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
