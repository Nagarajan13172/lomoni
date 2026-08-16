import { Link } from "react-router-dom";
import { site } from "../data/site";
import { Reveal, Arrow } from "./ui";

export default function CTABand() {
  return (
    <section className="container-x">
      <Reveal>
        {/* A tinted panel rather than a solid navy slab — the band still
            reads as a distinct call to action, but the page stays light
            all the way down. */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-blue-wash px-7 py-14 md:px-16 md:py-20">
          <div className="stripes-motif absolute inset-x-0 bottom-0 h-6 opacity-40" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-coral">Free 40-minute session</p>
            <h2 className="mt-4 display-lg">
              Not sure where to start your design journey?
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Write any doubt you have about design and design education. We'll set up a free
              counselling call — for students <em>and</em> parents.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/contact" className="btn btn-primary">
                Book counselling <Arrow />
              </Link>
              <a href={`https://wa.me/${site.phones[0].raw}`} className="btn btn-ghost">
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
