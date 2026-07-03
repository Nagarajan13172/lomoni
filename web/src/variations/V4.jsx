import { Link } from "react-router-dom";
import { site, home, courseList, whoWeAre } from "../data/site";
import VariationFrame from "./VariationFrame";

/* V4 — MONO
   Functional / systematic minimalism (a "spec sheet"). Monospace meta + headings,
   bordered modular blocks, electric accent, label-driven hierarchy.
   Principles: rigorous alignment, consistent 1px structure, labelled regions,
   information density without clutter, single accent, high legibility. */

const PAPER = "#faf9f6";
const INK = "#121212";
const LINE = "#121212";
const ACCENT = "#1f4bff";
const mono = { fontFamily: "'Space Mono', monospace" };

function Label({ children }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.12em]" style={{ ...mono, color: ACCENT }}>
      {children}
    </span>
  );
}

export default function V4() {
  return (
    <VariationFrame current="v4" name="Mono">
      <div
        className="min-h-dvh"
        style={{ background: PAPER, color: INK, fontFamily: "Inter, sans-serif" }}
      >
        {/* Header */}
        <header className="border-b" style={{ borderColor: LINE }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
            <Link to="/v4" className="text-sm font-bold" style={mono}>
              LOMONI_DESIGN_STUDIO
            </Link>
            <nav className="hidden gap-6 text-xs md:flex" style={mono}>
              <a href="#programmes" className="hover:text-[#1f4bff]">[programmes]</a>
              <a href="#studio" className="hover:text-[#1f4bff]">[studio]</a>
              <a href="#contact" className="hover:text-[#1f4bff]">[contact]</a>
            </nav>
            <Link
              to="/contact"
              className="border px-4 py-1.5 text-xs font-bold transition-colors hover:bg-[#1f4bff] hover:text-white"
              style={{ ...mono, borderColor: LINE }}
            >
              BOOK →
            </Link>
          </div>
        </header>

        {/* Hero block */}
        <section className="mx-auto max-w-6xl border-x" style={{ borderColor: LINE }}>
          <div className="flex items-center justify-between border-b px-5 py-2" style={{ borderColor: LINE }}>
            <Label>00 / index</Label>
            <span className="text-[11px]" style={{ ...mono, color: "rgba(18,18,18,0.5)" }}>
              salem · tamil nadu · in
            </span>
          </div>
          <div className="px-5 py-16 md:py-24">
            <h1 className="text-[12vw] font-bold leading-[0.95] tracking-tight md:text-8xl" style={mono}>
              ROAD_TO
              <br />
              <span style={{ color: ACCENT }}>D—SCHOOL</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(18,18,18,0.72)" }}>
              {home.heroSub}
            </p>
            <Link
              to="/courses"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ ...mono, background: ACCENT }}
            >
              VIEW_PROGRAMMES →
            </Link>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-3 border-t" style={{ borderColor: LINE }}>
            {home.stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-5 py-6 ${i < 2 ? "border-r" : ""}`}
                style={{ borderColor: LINE }}
              >
                <div className="text-xl font-bold md:text-3xl" style={mono}>{s.value}</div>
                <div className="mt-1.5 text-[11px]" style={{ ...mono, color: "rgba(18,18,18,0.55)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Programmes — spec table */}
        <section id="programmes" className="mx-auto max-w-6xl border-x border-b" style={{ borderColor: LINE }}>
          <div className="flex items-center justify-between border-b px-5 py-2" style={{ borderColor: LINE }}>
            <Label>01 / programmes</Label>
            <span className="text-[11px]" style={{ ...mono, color: "rgba(18,18,18,0.5)" }}>06 tracks</span>
          </div>
          {courseList.map((c, i) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className={`group grid grid-cols-12 items-center gap-3 px-5 py-5 transition-colors hover:bg-[#1f4bff] hover:text-white ${
                i < courseList.length - 1 ? "border-b" : ""
              }`}
              style={{ borderColor: LINE }}
            >
              <span className="col-span-2 text-xs md:col-span-1" style={mono}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-6 text-base font-bold md:col-span-4 md:text-xl" style={mono}>
                {c.exam}
              </span>
              <span className="col-span-4 hidden text-sm md:col-span-5 md:block group-hover:text-white/80" style={{ color: "rgba(18,18,18,0.65)" }}>
                {c.title} — {c.institute}
              </span>
              <span className="col-span-4 text-right text-xs md:col-span-2" style={mono}>
                {c.degree} →
              </span>
            </Link>
          ))}
        </section>

        {/* Studio */}
        <section id="studio" className="mx-auto max-w-6xl border-x border-b" style={{ borderColor: LINE }}>
          <div className="flex items-center justify-between border-b px-5 py-2" style={{ borderColor: LINE }}>
            <Label>02 / studio</Label>
          </div>
          <div className="grid md:grid-cols-12">
            <div className="border-b p-5 md:col-span-5 md:border-b-0 md:border-r md:p-8" style={{ borderColor: LINE }}>
              <h2 className="text-2xl font-bold leading-tight md:text-4xl" style={mono}>
                WE_WERE
                <br />ASPIRANTS_TOO
              </h2>
            </div>
            <div className="p-5 md:col-span-7 md:p-8">
              <p className="leading-relaxed" style={{ color: "rgba(18,18,18,0.75)" }}>{whoWeAre.about}</p>
              <div className="mt-6 grid gap-px overflow-hidden border sm:grid-cols-3" style={{ borderColor: LINE, background: LINE }}>
                {whoWeAre.team.map((m) => (
                  <div key={m.name} className="p-4" style={{ background: PAPER }}>
                    <div className="text-sm font-bold" style={mono}>{m.name}</div>
                    <div className="mt-1 text-xs" style={{ color: "rgba(18,18,18,0.6)" }}>{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl border-x border-b" style={{ borderColor: LINE }}>
          <div className="flex items-center justify-between border-b px-5 py-2" style={{ borderColor: LINE }}>
            <Label>03 / contact</Label>
          </div>
          <div className="grid md:grid-cols-2">
            <div className="border-b p-5 md:border-b-0 md:border-r md:p-8" style={{ borderColor: LINE }}>
              <span className="text-xs" style={{ ...mono, color: "rgba(18,18,18,0.5)" }}>// write any doubt</span>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 block text-xl font-bold hover:text-[#1f4bff] md:text-3xl"
                style={mono}
              >
                {site.email}
              </a>
            </div>
            <div className="p-5 md:p-8" style={mono}>
              {site.phones.map((p) => (
                <a key={p.raw} href={`tel:${p.raw}`} className="flex items-center justify-between border-b py-3 text-sm hover:text-[#1f4bff]" style={{ borderColor: "rgba(18,18,18,0.12)" }}>
                  <span>{p.number}</span>
                  <span style={{ color: "rgba(18,18,18,0.45)" }}>{p.label}</span>
                </a>
              ))}
              <a href={site.instagram.url} className="mt-3 inline-block text-sm hover:text-[#1f4bff]">
                {site.instagram.handle} →
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between px-5 py-5 text-[11px]" style={{ ...mono, color: "rgba(18,18,18,0.5)" }}>
            <span>{site.footerNote}</span>
            <span>VARIATION_V4 / MONO</span>
          </div>
        </footer>
      </div>
    </VariationFrame>
  );
}
