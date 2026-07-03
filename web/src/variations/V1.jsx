import { Link } from "react-router-dom";
import { site, home, courseList, whoWeAre } from "../data/site";
import VariationFrame from "./VariationFrame";

/* V1 — GRID
   Swiss / International Typographic minimalism.
   Principles: strict 12-col grid, hairline rules, one accent (coral),
   bold modular type scale, left-aligned, generous margins, high contrast. */

const ACCENT = "#ec5a41";

export default function V1() {
  return (
    <VariationFrame current="v1" name="Grid">
      <div
        className="min-h-dvh bg-white text-[#0a0a0a]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
            <Link to="/v1" className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold tracking-tight">LOMONI</span>
              <span className="text-[11px] text-black/45">(Road to D-School)</span>
            </Link>
            <nav className="hidden gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] md:flex">
              <a href="#programmes" className="hover:text-[#ec5a41]">Programmes</a>
              <a href="#studio" className="hover:text-[#ec5a41]">Studio</a>
              <a href="#contact" className="hover:text-[#ec5a41]">Contact</a>
            </nav>
            <Link
              to="/contact"
              className="border border-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-black hover:text-white"
            >
              Counselling
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-10 border-b border-black/10 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-8">
              <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
                <span style={{ color: ACCENT }}>01</span> Design Education Studio
              </div>
              <h1 className="text-[15vw] font-extrabold leading-[0.85] tracking-[-0.04em] md:text-[8.5rem]">
                Road to
                <br />
                <span style={{ color: ACCENT }}>D-School</span>
              </h1>
            </div>
            <div className="flex flex-col justify-end md:col-span-4">
              <p className="text-lg leading-relaxed text-black/70">{home.heroSub}</p>
              <Link
                to="/courses"
                className="mt-8 inline-flex w-fit items-center gap-3 bg-black px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5"
              >
                View programmes →
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-black/10 border-b border-black/10">
            {home.stats.map((s) => (
              <div key={s.label} className="px-2 py-8 first:pl-0">
                <div className="text-2xl font-extrabold tracking-tight md:text-4xl">{s.value}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-black/45">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Programmes — typographic list */}
        <section id="programmes" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-end justify-between border-b border-black/10 pb-4">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Programmes</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
              02 — Six tracks
            </span>
          </div>
          <ul>
            {courseList.map((c, i) => (
              <li key={c.id}>
                <Link
                  to={`/courses/${c.id}`}
                  className="group grid grid-cols-12 items-center gap-4 border-b border-black/10 py-6 transition-colors hover:bg-[#fafafa]"
                >
                  <span className="col-span-1 text-[11px] font-semibold text-black/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-7 text-xl font-bold tracking-tight md:col-span-6 md:text-3xl">
                    {c.title}
                  </span>
                  <span className="col-span-3 hidden text-sm text-black/55 md:col-span-3 md:block">
                    {c.institute}
                  </span>
                  <span className="col-span-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] md:col-span-1">
                    {c.degree}
                  </span>
                  <span
                    className="col-span-1 text-right text-lg opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: ACCENT }}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Studio / ethos */}
        <section id="studio" className="border-y border-black/10 bg-[#fafafa]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <div className="md:col-span-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
                03 — Studio
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                We were aspirants too.
              </h2>
            </div>
            <div className="md:col-span-7">
              <p className="text-lg leading-relaxed text-black/70">{whoWeAre.about}</p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/10 pt-6">
                {whoWeAre.team.map((m) => (
                  <div key={m.name} className="text-sm">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-black/45"> — {m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
            04 — Contact
          </span>
          <a
            href={`mailto:${site.email}`}
            className="mt-5 block text-[8vw] font-extrabold leading-none tracking-[-0.04em] hover:text-[#ec5a41] md:text-7xl"
          >
            {site.email}
          </a>
          <div className="mt-12 grid gap-6 border-t border-black/10 pt-8 text-sm md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-black/45">Call</div>
              {site.phones.map((p) => (
                <a key={p.raw} href={`tel:${p.raw}`} className="mt-1 block font-semibold hover:text-[#ec5a41]">
                  {p.number}
                </a>
              ))}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-black/45">Studio</div>
              <p className="mt-1 text-black/70">{site.address.lines.join(" ")}</p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-black/45">Social</div>
              <a href={site.instagram.url} className="mt-1 block font-semibold hover:text-[#ec5a41]">
                {site.instagram.handle}
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-[11px] uppercase tracking-[0.14em] text-black/45 md:px-8">
            <span>{site.footerNote}</span>
            <span>Variation V1 / Grid</span>
          </div>
        </footer>
      </div>
    </VariationFrame>
  );
}
