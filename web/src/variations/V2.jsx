import { Link } from "react-router-dom";
import { site, home, courseList, whoWeAre } from "../data/site";
import VariationFrame from "./VariationFrame";

/* V2 — ATELIER
   Warm editorial minimalism. Cream paper, Fraunces serif display + DM Sans body.
   Principles: gallery whitespace, single warm accent (terracotta), calm hierarchy,
   hairline dividers, centered focal hero, restrained ornament. */

const PAPER = "#f5f1e8";
const INK = "#211d18";
const ACCENT = "#bf4a2c";
const serif = { fontFamily: "Fraunces, serif" };

export default function V2() {
  return (
    <VariationFrame current="v2" name="Atelier">
      <div
        className="min-h-dvh"
        style={{ background: PAPER, color: INK, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <header className="border-b" style={{ borderColor: "rgba(33,29,24,0.12)" }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <Link to="/v2" className="text-xl font-semibold tracking-tight" style={serif}>
              LOMONI<span style={{ color: ACCENT }}>.</span>
            </Link>
            <nav className="hidden gap-8 text-sm md:flex" style={{ color: "rgba(33,29,24,0.65)" }}>
              <a href="#programmes" className="hover:text-[#bf4a2c]">Programmes</a>
              <a href="#studio" className="hover:text-[#bf4a2c]">Studio</a>
              <a href="#contact" className="hover:text-[#bf4a2c]">Contact</a>
            </nav>
            <Link
              to="/contact"
              className="rounded-full border px-5 py-2 text-sm transition-colors hover:bg-[#211d18] hover:text-[#f5f1e8]"
              style={{ borderColor: INK }}
            >
              Counselling
            </Link>
          </div>
        </header>

        {/* Hero — centered focal */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <div
            className="mb-8 inline-block text-xs uppercase tracking-[0.28em]"
            style={{ color: ACCENT }}
          >
            Road to D-School
          </div>
          <h1
            className="text-[13vw] leading-[0.95] tracking-[-0.02em] md:text-[6.5rem]"
            style={serif}
          >
            Bridging students
            <br />
            &amp; <em className="font-normal" style={{ color: ACCENT }}>design education</em>
          </h1>
          <p
            className="mx-auto mt-8 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(33,29,24,0.7)" }}
          >
            {home.heroSub}
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/courses"
              className="rounded-full px-7 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              style={{ background: ACCENT }}
            >
              Explore programmes
            </Link>
            <Link
              to="/r-2-d"
              className="rounded-full border px-7 py-3 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ borderColor: "rgba(33,29,24,0.25)" }}
            >
              How it works
            </Link>
          </div>
        </section>

        {/* Programmes — two-column quiet cards */}
        <section
          id="programmes"
          className="border-t"
          style={{ borderColor: "rgba(33,29,24,0.12)" }}
        >
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mb-12 flex items-baseline justify-between">
              <h2 className="text-4xl tracking-tight md:text-5xl" style={serif}>Programmes</h2>
              <span className="text-sm" style={{ color: "rgba(33,29,24,0.5)" }}>Six tracks · two degrees</span>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border md:grid-cols-2"
              style={{ borderColor: "rgba(33,29,24,0.14)", background: "rgba(33,29,24,0.10)" }}>
              {courseList.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.id}`}
                  className="group flex flex-col bg-[#f5f1e8] p-8 transition-colors hover:bg-[#efe9dc]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
                      {c.exam}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(33,29,24,0.5)" }}>{c.degree}</span>
                  </div>
                  <h3 className="mt-4 text-2xl tracking-tight" style={serif}>{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "rgba(33,29,24,0.6)" }}>
                    {c.institute}
                  </p>
                  <span className="mt-5 text-sm transition-transform group-hover:translate-x-1" style={{ color: ACCENT }}>
                    Read more →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Studio — tribute quote */}
        <section id="studio" className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-2xl leading-relaxed tracking-tight md:text-[2.1rem]" style={serif}>
            “{whoWeAre.tribute}”
          </p>
          <p className="mt-8 text-sm uppercase tracking-[0.22em]" style={{ color: ACCENT }}>
            Mr. Mothilal Loganathan · M.Des, NID
          </p>

          <div className="mt-16 grid gap-8 border-t pt-12 sm:grid-cols-3"
            style={{ borderColor: "rgba(33,29,24,0.12)" }}>
            {whoWeAre.team.map((m) => (
              <div key={m.name}>
                <div className="text-lg" style={serif}>{m.name}</div>
                <div className="mt-1 text-sm" style={{ color: "rgba(33,29,24,0.6)" }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="border-t text-center"
          style={{ borderColor: "rgba(33,29,24,0.12)" }}
        >
          <div className="mx-auto max-w-3xl px-6 py-24">
            <h2 className="text-4xl tracking-tight md:text-6xl" style={serif}>Say hello.</h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-block text-lg underline-offset-4 hover:underline"
              style={{ color: ACCENT }}
            >
              {site.email}
            </a>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm" style={{ color: "rgba(33,29,24,0.65)" }}>
              {site.phones.map((p) => (
                <a key={p.raw} href={`tel:${p.raw}`} className="hover:text-[#bf4a2c]">{p.number}</a>
              ))}
              <a href={site.instagram.url} className="hover:text-[#bf4a2c]">{site.instagram.handle}</a>
            </div>
          </div>
        </section>

        <footer className="border-t" style={{ borderColor: "rgba(33,29,24,0.12)" }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm" style={{ color: "rgba(33,29,24,0.5)" }}>
            <span>{site.footerNote}</span>
            <span style={serif}>Variation V2 / Atelier</span>
          </div>
        </footer>
      </div>
    </VariationFrame>
  );
}
