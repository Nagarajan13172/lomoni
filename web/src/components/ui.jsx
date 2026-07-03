import { motion } from "framer-motion";

/* Scroll-reveal wrapper. Pass `mount` for above-the-fold content that must play
   on load (not wait for an intersection). Respects reduced-motion via framer. */
export function Reveal({ children, delay = 0, y = 24, className = "", mount = false }) {
  const trigger = mount
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...trigger}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Line-mask reveal — the child slides up from behind a clipped edge. Ideal for
   headline lines. Wrap each line in its own <MaskReveal> for a staggered rise.
   `mount` plays on load for hero headlines that sit above the fold. */
export function MaskReveal({ children, delay = 0, className = "", mount = false }) {
  const trigger = mount
    ? { animate: { y: "0%" } }
    : { whileInView: { y: "0%" }, viewport: { once: true, margin: "-60px" } };
  return (
    <span className={`block overflow-hidden py-[0.12em] -my-[0.12em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        {...trigger}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Staggered container + item */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
export const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* Small label chip */
export function Chip({ children, color, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1 text-xs font-semibold ${className}`}
      style={color ? { borderColor: color } : undefined}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function Eyebrow({ children, className = "" }) {
  return (
    <div className={`eyebrow flex items-center gap-3 text-coral ${className}`}>
      <span className="h-px w-8 bg-coral" />
      {children}
    </div>
  );
}

/* Section title with a measure of supporting text */
export function SectionHead({ eyebrow, title, intro, className = "" }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      <h2 className="display-lg">{title}</h2>
      {intro && <p className="mt-6 text-lg text-ink-soft md:text-xl">{intro}</p>}
    </div>
  );
}

/* SVG arrow used across CTAs and links */
export function Arrow({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
