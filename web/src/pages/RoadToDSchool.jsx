import { r2d } from "../data/site";
import { Reveal, Eyebrow } from "../components/ui";
import CTABand from "../components/CTABand";

export default function RoadToDSchool() {
  return (
    <>
      {/* Hero */}
      <section className="container-x pb-14 pt-12 md:pb-20 md:pt-16">
        <Reveal>
          <Eyebrow>R-2-D · Road To D-School</Eyebrow>
          <h1 className="display-xl mt-6">
            Not a coaching<br />
            <span className="text-coral">institute.</span>
          </h1>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-16">
          <Reveal delay={0.1}>
            <p className="text-xl text-ink-soft md:text-2xl md:leading-relaxed">{r2d.intro}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="text-lg text-ink-soft">{r2d.intro2}</p>
          </Reveal>
        </div>
      </section>

      {/* Roadmap image */}
      <section className="container-x">
        <Reveal>
          <figure className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white">
            <img
              src="/images/roadmap.jpg"
              alt="Road To D-School roadmap — mapping class 12 and degrees through NID, NIFT, IIT and private design entrances."
              className="w-full"
              loading="lazy"
            />
          </figure>
          <figcaption className="mt-3 text-center text-sm text-ink-soft">
            The Road To D-School map — from class 12 / graduation to the right design entrance.
          </figcaption>
        </Reveal>
      </section>

      {/* Pillars */}
      <section className="container-x py-20 md:py-28">
        <Reveal>
          <Eyebrow className="mb-5">What's inside</Eyebrow>
          <h2 className="display-lg max-w-2xl">Four pillars of preparation</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {r2d.pillars.map((p, i) => (
            <Reveal key={p.no} delay={(i % 2) * 0.08}>
              <div className="card-brutal h-full overflow-hidden">
                <div className="h-2 w-full" style={{ background: p.color }} />
                <div className="p-7 md:p-8">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-4xl font-bold" style={{ color: p.color }}>
                      {p.no}
                    </span>
                    <h3 className="font-display text-xl font-bold leading-tight md:text-2xl">{p.title}</h3>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-ink-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
