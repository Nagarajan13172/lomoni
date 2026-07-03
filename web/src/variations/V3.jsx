import { Link } from "react-router-dom";
import { site, home, courseList, whoWeAre } from "../data/site";
import VariationFrame from "./VariationFrame";

/* V3 — NOIR
   Dark monochrome minimalism. Near-black canvas, light text, one warm accent.
   Principles: deep negative space, low-contrast dividers, restrained accent for
   emphasis only, large quiet type, clear single CTA, calm rhythm. */

const BG = "#0b0b0c";
const FG = "#ededed";
const MUTED = "rgba(237,237,237,0.55)";
const LINE = "rgba(237,237,237,0.12)";
const ACCENT = "#ff6a4d";
const disp = { fontFamily: "'Space Grotesk', sans-serif" };

export default function V3() {
  return (
    <VariationFrame current="v3" name="Noir">
      <div
        className="min-h-dvh"
        style={{ background: BG, color: FG, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur"
          style={{ borderColor: LINE, background: "rgba(11,11,12,0.7)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/v3" className="flex items-center gap-2" style={disp}>
              <span className="h-2 w-2 rounded-full" style={{ background: ACCENT }} />
              <span className="text-sm font-bold tracking-wide">LOMONI</span>
            </Link>
            <nav className="hidden gap-8 text-sm md:flex" style={{ color: MUTED }}>
              <a href="#programmes" className="hover:text-white">Programmes</a>
              <a href="#studio" className="hover:text-white">Studio</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </nav>
            <Link
              to="/contact"
              className="rounded-full px-5 py-2 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
              style={{ background: ACCENT }}
            >
              Counselling
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="text-xs uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
            Mentorship · NID / NIFT / IIT alumni
          </div>
          <h1
            className="mt-8 text-[15vw] font-bold leading-[0.9] tracking-[-0.03em] md:text-[8rem]"
            style={disp}
          >
            Road to <br />
            <span style={{ color: ACCENT }}>D-School.</span>
          </h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-lg leading-relaxed" style={{ color: MUTED }}>
              {home.heroSub}
            </p>
            <Link
              to="/courses"
              className="inline-flex w-fit items-center gap-3 border-b pb-1 text-lg font-medium transition-colors hover:text-[#ff6a4d]"
              style={{ borderColor: ACCENT }}
            >
              Explore programmes →
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-px overflow-hidden rounded-2xl" style={{ background: LINE }}>
            {home.stats.map((s) => (
              <div key={s.label} className="px-5 py-7" style={{ background: BG }}>
                <div className="text-2xl font-bold tracking-tight md:text-4xl" style={disp}>{s.value}</div>
                <div className="mt-2 text-xs" style={{ color: MUTED }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Programmes */}
        <section id="programmes" className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 flex items-baseline justify-between border-b pb-5" style={{ borderColor: LINE }}>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl" style={disp}>Programmes</h2>
              <span className="text-sm" style={{ color: MUTED }}>06 tracks</span>
            </div>
            <ul>
              {courseList.map((c, i) => (
                <li key={c.id}>
                  <Link
                    to={`/courses/${c.id}`}
                    className="group grid grid-cols-12 items-center gap-4 border-b py-6 transition-colors"
                    style={{ borderColor: LINE }}
                  >
                    <span className="col-span-1 text-sm" style={{ color: MUTED }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="col-span-8 text-xl font-semibold tracking-tight md:col-span-6 md:text-3xl group-hover:text-[#ff6a4d]" style={disp}>
                      {c.title}
                    </span>
                    <span className="col-span-3 hidden text-sm md:block" style={{ color: MUTED }}>
                      {c.institute}
                    </span>
                    <span className="col-span-3 text-right text-sm md:col-span-2" style={{ color: MUTED }}>
                      {c.degree}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Studio */}
        <section id="studio" className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="text-xs uppercase tracking-[0.28em]" style={{ color: ACCENT }}>Studio</span>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl" style={disp}>
                We were aspirants too.
              </h2>
            </div>
            <div className="md:col-span-7">
              <p className="text-lg leading-relaxed" style={{ color: MUTED }}>{whoWeAre.about}</p>
              <div className="mt-10 grid gap-6 border-t pt-8 sm:grid-cols-3" style={{ borderColor: LINE }}>
                {whoWeAre.team.map((m) => (
                  <div key={m.name}>
                    <div className="font-semibold" style={disp}>{m.name}</div>
                    <div className="mt-1 text-sm" style={{ color: MUTED }}>{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-[9vw] font-bold leading-none tracking-[-0.03em] md:text-7xl" style={disp}>
              Let's <span style={{ color: ACCENT }}>talk.</span>
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-8 inline-block text-xl underline-offset-4 hover:underline"
              style={{ color: ACCENT }}
            >
              {site.email}
            </a>
            <div className="mt-10 grid gap-6 border-t pt-8 text-sm sm:grid-cols-3" style={{ borderColor: LINE }}>
              <div>
                <div className="uppercase tracking-[0.16em]" style={{ color: MUTED }}>Call</div>
                {site.phones.map((p) => (
                  <a key={p.raw} href={`tel:${p.raw}`} className="mt-1 block hover:text-[#ff6a4d]">{p.number}</a>
                ))}
              </div>
              <div>
                <div className="uppercase tracking-[0.16em]" style={{ color: MUTED }}>Studio</div>
                <p className="mt-1" style={{ color: FG }}>{site.address.lines.join(" ")}</p>
              </div>
              <div>
                <div className="uppercase tracking-[0.16em]" style={{ color: MUTED }}>Social</div>
                <a href={site.instagram.url} className="mt-1 block hover:text-[#ff6a4d]">{site.instagram.handle}</a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t" style={{ borderColor: LINE }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm" style={{ color: MUTED }}>
            <span>{site.footerNote}</span>
            <span style={disp}>Variation V3 / Noir</span>
          </div>
        </footer>
      </div>
    </VariationFrame>
  );
}
