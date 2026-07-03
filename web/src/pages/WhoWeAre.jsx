import { whoWeAre } from "../data/site";
import { Reveal, Eyebrow } from "../components/ui";
import CTABand from "../components/CTABand";

export default function WhoWeAre() {
  return (
    <>
      <section className="container-x pb-12 pt-12 md:pt-16">
        <Reveal>
          <Eyebrow>Who we are</Eyebrow>
          <h1 className="display-xl mt-6">
            We were<br />aspirants <span className="text-coral">too.</span>
          </h1>
        </Reveal>
      </section>

      {/* Story */}
      <section className="container-x grid gap-10 pb-8 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <Reveal>
          <p className="text-xl text-ink-soft md:text-2xl md:leading-relaxed">{whoWeAre.about}</p>
          <p className="mt-8 text-lg text-ink-soft">{whoWeAre.closing}</p>
        </Reveal>

        {/* Tribute */}
        <Reveal delay={0.12}>
          <div className="card-brutal h-full overflow-hidden">
            <div className="stripes-motif h-2 w-full" />
            <div className="p-7 md:p-8">
              <Eyebrow className="mb-4">In memory</Eyebrow>
              <p className="text-ink-soft">{whoWeAre.tribute}</p>
              <p className="mt-6 font-display text-lg font-bold">
                Mr. Mothilal Loganathan
                <span className="block text-sm font-medium text-coral">Master of Design, NID</span>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Team */}
      <section className="container-x py-20 md:py-28">
        <Reveal>
          <Eyebrow className="mb-5">Meet the team</Eyebrow>
          <h2 className="display-lg max-w-2xl">Mentors from NID & NIFT</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {whoWeAre.team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="card-brutal h-full p-7">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-bold text-white"
                  style={{ background: m.color }}
                >
                  {m.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{m.name}</h3>
                <p className="mt-1 font-display text-sm font-semibold" style={{ color: m.color }}>
                  {m.role}
                </p>
                <ul className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                  {m.creds.map((c) => (
                    <li key={c} className="text-sm text-ink-soft">{c}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
