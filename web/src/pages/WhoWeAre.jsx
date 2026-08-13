import { whoWeAre } from "../data/site";
import { Reveal, Eyebrow, MaskReveal } from "../components/ui";
import CTABand from "../components/CTABand";
import HeroBust from "../components/HeroBust";

export default function WhoWeAre() {
  return (
    <>
      {/* Hero — split: intro left, interactive paper-bust right */}
      <section className="relative -mt-[68px] overflow-hidden pt-[68px]">
        <div className="container-x">
          <div className="grid min-h-[78vh] grid-cols-1 items-center gap-x-8 gap-y-10 md:grid-cols-8 md:gap-y-0">
            {/* LEFT — 4 of 8 columns */}
            <div className="relative z-10 md:col-span-4">
              <Reveal mount>
                <Eyebrow>Who we are</Eyebrow>
              </Reveal>

              <h1 className="display-xl mt-6">
                <MaskReveal mount>We were</MaskReveal>
                <MaskReveal mount delay={0.1}>
                  aspirants <span className="text-coral">too.</span>
                </MaskReveal>
              </h1>

              <Reveal mount delay={0.32} className="mt-8 max-w-lg">
                <p className="text-lg text-ink-soft md:text-xl">{whoWeAre.closing}</p>
              </Reveal>
            </div>

            {/* RIGHT — interactive bust: 4 of 8 columns */}
            <div className="relative h-[46vh] min-h-[300px] md:col-span-4 md:h-[74vh]">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 44%, var(--hero-glow), transparent 60%)" }}
              />
              <div className="stripes-motif pointer-events-none absolute right-2 top-6 hidden h-[300px] w-[190px] rotate-6 opacity-[0.10] md:block" />
              <HeroBust className="absolute inset-0" src="/models/luwai_HD_1783280040963.glb" rotation={[0, 0, 0]} />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-x grid gap-10 pb-8 pt-4 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <Reveal>
          <p className="text-xl text-ink-soft md:text-2xl md:leading-relaxed">{whoWeAre.about}</p>
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
