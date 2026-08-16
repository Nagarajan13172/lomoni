import { Link } from "react-router-dom";
import { site } from "../data/site";
import { Reveal, Arrow } from "./ui";

export default function CTABand() {
  return (
    <section className="container-x">
      <Reveal>
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-coral px-7 py-14 text-white md:px-16 md:py-20">
          <div className="stripes-motif absolute inset-x-0 bottom-0 h-6 opacity-30" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-white/80">Free 40-minute session</p>
            <h2 className="mt-4 display-lg text-white">
              Not sure where to start your design journey?
            </h2>
            <p className="mt-5 text-lg text-white/85">
              Write any doubt you have about design and design education. We'll set up a free
              counselling call — for students <em>and</em> parents.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact" className="btn border-white bg-white text-ink">
                Book counselling <Arrow />
              </Link>
              <a
                href={`https://wa.me/${site.phones[0].raw}`}
                className="btn border-white bg-transparent text-white hover:bg-white hover:text-ink"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
