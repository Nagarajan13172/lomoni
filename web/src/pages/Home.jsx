import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { home, courseList } from "../data/site";
import { Reveal, Eyebrow, Arrow, MaskReveal, stagger, item } from "../components/ui";
import CourseCard from "../components/CourseCard";
import Marquee from "../components/Marquee";
import CTABand from "../components/CTABand";
import HeroBust from "../components/HeroBust";
import Magnetic from "../components/Magnetic";

/** Animated scroll hint pinned to the bottom of the hero. */
function ScrollCue() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.6 }}
    >
      <div className="flex flex-col items-center gap-2 text-ink-soft">
        <span className="eyebrow text-[10px]">Scroll</span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-ink/25">
          <motion.span
            className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral"
            animate={{ y: [0, 10, 0], opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <>
      {/* ---------------- HERO (8-col grid — content left, 3D bust right) ---------------- */}
      <section className="relative -mt-[68px] overflow-hidden pt-[68px]">
        <div className="container-x">
          <div className="grid min-h-[84vh] grid-cols-1 items-center gap-x-8 gap-y-10 md:grid-cols-8 md:gap-y-0">
            {/* LEFT — content: 4 of 8 columns */}
            <div className="relative z-10 flex flex-col justify-center md:col-span-4">
              <Reveal mount>
                <Eyebrow>Mentorship by NID · NIFT · IIT alumni</Eyebrow>
              </Reveal>

              <h1 className="display-xl mt-7">
                <MaskReveal mount>Road</MaskReveal>
                <MaskReveal mount delay={0.09}>
                  to
                </MaskReveal>
                <MaskReveal mount delay={0.18}>
                  <span className="text-coral">D-School</span>
                </MaskReveal>
              </h1>

              <Reveal mount delay={0.34} className="mt-8 max-w-xl">
                <p className="text-lg text-ink-soft md:text-xl">{home.heroSub}</p>
              </Reveal>

              <Reveal mount delay={0.44} className="mt-9">
                <div className="flex flex-wrap gap-4">
                  <Magnetic>
                    <Link to="/courses" className="btn btn-primary">
                      Explore courses <Arrow />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link to="/r-2-d" className="btn btn-ghost">
                      How it works
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>

              <Reveal mount delay={0.54} className="mt-12">
                <dl className="grid max-w-md grid-cols-3 gap-6 border-t border-ink/10 pt-6">
                  {home.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="font-display text-2xl font-bold leading-none md:text-[1.7rem]">{s.value}</dt>
                      <dd className="mt-2 text-xs leading-snug text-ink-soft">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            {/* RIGHT — interactive paper-bust sculpture: 4 of 8 columns */}
            <div className="relative h-[48vh] min-h-[320px] md:col-span-4 md:h-[84vh]">
              {/* soft spotlight behind the sculpture */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 58% 44%, rgba(236,90,65,0.14), transparent 60%)" }}
              />
              <div className="stripes-motif pointer-events-none absolute right-2 top-6 hidden h-[320px] w-[200px] rotate-6 opacity-[0.10] md:block" />
              <HeroBust className="absolute inset-0" src="/models/paper-bust-smooth.glb" />
            </div>
          </div>
        </div>

        <ScrollCue />
      </section>

      <Marquee />

      {/* ---------------- WHAT WE DO ---------------- */}
      <section className="container-x py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <Reveal>
              <Eyebrow className="mb-5">What we do</Eyebrow>
            </Reveal>
            <h2 className="display-lg">
              <MaskReveal>Three exams.</MaskReveal>
              <MaskReveal delay={0.08}>One focused path.</MaskReveal>
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className="text-xl text-ink-soft md:text-2xl md:leading-relaxed">{home.whatWeDo}</p>
            <Link
              to="/who-we-are"
              className="link-underline mt-7 inline-flex items-center gap-2 font-display font-semibold text-coral"
            >
              Meet the mentors <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- COURSE TRACKS ---------------- */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="mb-5">Course tracks</Eyebrow>
              <h2 className="display-lg">Pick your D-School</h2>
            </div>
            <Magnetic>
              <Link to="/courses" className="btn btn-ghost">
                All courses <Arrow />
              </Link>
            </Magnetic>
          </div>
        </Reveal>

        <motion.div
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {courseList.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </motion.div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="container-x py-20 md:py-28">
        <Reveal>
          <Eyebrow className="mb-5">Common questions</Eyebrow>
          <h2 className="display-lg max-w-2xl">Design entrances, demystified</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {home.faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="card-brutal h-full p-7">
                <div className="font-display text-3xl font-bold text-coral">0{i + 1}</div>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug">{f.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
