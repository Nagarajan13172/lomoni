import { motion } from "framer-motion";
import { courseLevels, courses } from "../data/site";
import { Reveal, Eyebrow, stagger } from "../components/ui";
import CourseCard from "../components/CourseCard";
import CTABand from "../components/CTABand";

export default function Courses() {
  return (
    <>
      <section className="container-x pb-12 pt-12 md:pt-16">
        <Reveal>
          <Eyebrow>Courses</Eyebrow>
          <h1 className="display-xl mt-6">
            Six tracks.<br />
            <span className="text-coral">Two degrees.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl text-ink-soft">
            We mentor only for the design entrances that matter — NID, NIFT and the IIT
            exams (UCEED & CEED) — at both bachelor's and master's level.
          </p>
        </Reveal>
      </section>

      {courseLevels.map((lvl, idx) => (
        <section key={lvl.level} className="container-x py-10 md:py-12">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-6">
              <div className="flex items-end gap-4">
                <span className="font-display text-5xl font-bold text-ink/15">0{idx + 1}</span>
                <div>
                  <h2 className="font-display text-3xl font-bold md:text-4xl">{lvl.level}</h2>
                  <p className="mt-1 text-ink-soft">{lvl.blurb}</p>
                </div>
              </div>
              <span className="rounded-full border border-ink px-4 py-1.5 font-display text-sm font-semibold">
                {lvl.degree}
              </span>
            </div>
          </Reveal>

          <motion.div
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {lvl.exams.map((id) => (
              <CourseCard key={id} course={courses[id]} />
            ))}
          </motion.div>
        </section>
      ))}

      <div className="pt-12">
        <CTABand />
      </div>
    </>
  );
}
