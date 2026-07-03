import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { home, courseList } from "../data/site";
import { Reveal, Eyebrow, Arrow, stagger, item } from "../components/ui";
import CourseCard from "../components/CourseCard";
import Marquee from "../components/Marquee";
import CTABand from "../components/CTABand";

export default function Home() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="stripes-motif pointer-events-none absolute -right-24 top-10 hidden h-[480px] w-[280px] rotate-6 opacity-[0.12] md:block" />
        <div className="container-x relative pb-16 pt-14 md:pb-24 md:pt-20">
          <Reveal>
            <Eyebrow>Mentorship by NID · NIFT · IIT alumni</Eyebrow>
          </Reveal>

          <motion.h1
            className="display-xl mt-6"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {home.heroHeadline.map((w, i) => (
              <motion.span key={i} variants={item} className="block">
                {i === 2 ? <span className="text-coral">{w}</span> : w}
              </motion.span>
            ))}
          </motion.h1>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <Reveal delay={0.1}>
              <p className="max-w-xl text-lg text-ink-soft md:text-xl">{home.heroSub}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/courses" className="btn btn-primary">
                  Explore courses <Arrow />
                </Link>
                <Link to="/r-2-d" className="btn btn-ghost">
                  How it works
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="grid grid-cols-3 gap-3">
                {home.stats.map((s) => (
                  <div key={s.label} className="card-brutal p-4 text-center">
                    <div className="font-display text-xl font-bold leading-none md:text-2xl">{s.value}</div>
                    <div className="mt-2 text-[11px] leading-tight text-ink-soft">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ---------------- WHAT WE DO ---------------- */}
      <section className="container-x py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <Reveal>
            <Eyebrow className="mb-5">What we do</Eyebrow>
            <h2 className="display-lg">
              Three exams.<br />One focused path.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xl text-ink-soft md:text-2xl md:leading-relaxed">{home.whatWeDo}</p>
            <Link to="/who-we-are" className="mt-7 inline-flex items-center gap-2 font-display font-semibold text-coral">
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
            <Link to="/courses" className="btn btn-ghost">
              All courses <Arrow />
            </Link>
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
