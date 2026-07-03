import { useEffect } from "react";
import { Link } from "react-router-dom";

const VARIANTS = [
  {
    id: "v1",
    name: "Grid",
    tagline: "Swiss / International Typographic",
    desc: "Black-on-white, strict 12-column grid, hairline rules, one accent. Type does the work.",
    bg: "#ffffff",
    fg: "#0a0a0a",
    accent: "#ec5a41",
    font: "Inter, sans-serif",
  },
  {
    id: "v2",
    name: "Atelier",
    tagline: "Warm editorial serif",
    desc: "Cream paper, Fraunces serif, gallery whitespace, calm terracotta accent.",
    bg: "#f5f1e8",
    fg: "#211d18",
    accent: "#bf4a2c",
    font: "Fraunces, serif",
  },
  {
    id: "v3",
    name: "Noir",
    tagline: "Dark monochrome",
    desc: "Near-black canvas, deep negative space, a single warm accent for emphasis.",
    bg: "#0b0b0c",
    fg: "#ededed",
    accent: "#ff6a4d",
    font: "'Space Grotesk', sans-serif",
  },
  {
    id: "v4",
    name: "Mono",
    tagline: "Functional / systematic",
    desc: "Monospace spec-sheet, bordered modular blocks, electric blue, label-driven.",
    bg: "#faf9f6",
    fg: "#121212",
    accent: "#1f4bff",
    font: "'Space Mono', monospace",
  },
];

export default function VariationsIndex() {
  useEffect(() => {
    document.title = "Design variations — LOMONI Design Studio";
  }, []);

  return (
    <div className="min-h-dvh bg-[#0b0b0c] text-[#ededed]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="flex items-center justify-between">
          <span className="font-['Space_Mono'] text-xs uppercase tracking-[0.2em] text-[#ff6a4d]">
            LOMONI · minimal redesign
          </span>
          <Link to="/" className="text-sm text-white/55 hover:text-white">Full site ↗</Link>
        </div>

        <h1 className="mt-10 font-['Space_Grotesk'] text-5xl font-bold tracking-tight md:text-7xl">
          Four minimal<br />directions.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/60">
          Same content, four design languages — each built to the same principles
          (hierarchy, whitespace, restraint, contrast, one accent). Pick a direction
          and we'll roll it across the whole site.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {VARIANTS.map((v) => (
            <Link
              key={v.id}
              to={`/${v.id}`}
              className="group overflow-hidden rounded-2xl border border-white/12 transition-transform hover:-translate-y-1"
            >
              {/* Mini preview pane in the variant's own palette */}
              <div className="p-7" style={{ background: v.bg, color: v.fg }}>
                <div className="flex items-center justify-between">
                  <span className="font-['Space_Mono'] text-[11px] uppercase tracking-[0.16em]" style={{ color: v.accent }}>
                    {v.id} · {v.tagline}
                  </span>
                  <span className="h-3 w-3 rounded-full" style={{ background: v.accent }} />
                </div>
                <div className="mt-6 text-4xl font-bold leading-[0.95] tracking-tight md:text-5xl" style={{ fontFamily: v.font }}>
                  Road to <span style={{ color: v.accent }}>D-School</span>
                </div>
                <div className="mt-6 flex gap-2">
                  <span className="rounded-full px-3 py-1 text-[11px]" style={{ background: v.accent, color: v.bg }}>NID</span>
                  <span className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: v.fg }}>NIFT</span>
                  <span className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: v.fg }}>UCEED</span>
                </div>
              </div>
              {/* Caption */}
              <div className="flex items-center justify-between bg-[#111113] px-7 py-5">
                <div>
                  <div className="font-['Space_Grotesk'] text-lg font-bold">{v.name}</div>
                  <div className="text-sm text-white/50">{v.desc}</div>
                </div>
                <span className="text-[#ff6a4d] transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
