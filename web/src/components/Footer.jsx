import { Link } from "react-router-dom";
import { nav, site } from "../data/site";
import { Arrow } from "./ui";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-paper">
      <div className="stripes-motif h-2 w-full opacity-90" />

      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + CTA */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="" className="h-11 w-11 rounded-full bg-paper" />
              <div className="font-display text-lg font-bold leading-tight">
                <span className="brandmark">LOMONI</span>
                <span className="block text-[11px] font-semibold tracking-[0.2em] text-coral">
                  ROAD TO D-SCHOOL
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-lg text-paper/70">{site.mission}</p>
            <Link
              to="/contact"
              className="btn mt-7 border-paper bg-coral text-white"
            >
              Book free counselling <Arrow />
            </Link>
          </div>

          {/* Nav */}
          <div>
            <p className="eyebrow text-coral">Explore</p>
            <ul className="mt-5 space-y-3">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-paper/75 transition-colors hover:text-coral">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="eyebrow text-coral">Reach us</p>
            <ul className="mt-5 space-y-3 text-paper/75">
              <li>
                <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>
              </li>
              {site.phones.map((p) => (
                <li key={p.raw}>
                  <a href={`tel:${p.raw}`} className="hover:text-coral">{p.number}</a>
                  <span className="ml-2 text-xs text-paper/40">{p.label}</span>
                </li>
              ))}
              <li>
                <a href={site.instagram.url} className="link-underline">{site.instagram.handle}</a>
              </li>
              <li className="pt-2 text-sm text-paper/55">
                {site.address.lines.join(" ")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-6 text-sm text-paper/45 sm:flex-row sm:items-center">
          <p>{site.footerNote}</p>
          <Link to="/variations" className="text-paper/55 transition-colors hover:text-coral">
            Explore design variations →
          </Link>
        </div>
      </div>
    </footer>
  );
}
