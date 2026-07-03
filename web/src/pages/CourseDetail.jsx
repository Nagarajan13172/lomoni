import { useParams, Link, Navigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { courses, courseList } from "../data/site";
import { Reveal, Eyebrow, Arrow } from "../components/ui";
import CTABand from "../components/CTABand";

export default function CourseDetail() {
  const { id } = useParams();
  const reduced = useReducedMotion();
  const course = courses[id];
  if (!course) return <Navigate to="/courses" replace />;

  const others = courseList.filter((c) => c.id !== id).slice(0, 3);

  const steps = [
    {
      title: "Eligibility",
      body: <p className="text-ink-soft">{course.eligibility}</p>,
    },
    {
      title: "Exam pattern",
      body: (
        <ul className="space-y-3">
          {course.pattern.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-ink-soft">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: course.color }}
              >
                {i + 1}
              </span>
              {p}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Programs & campuses",
      body: (
        <ul className="space-y-2.5">
          {course.programs.map((p) => (
            <li key={p} className="flex items-start gap-3 text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: course.color }} />
              {p}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Yearly timeline",
      body: (
        <ol className="relative space-y-5 border-l-2 pl-6" style={{ borderColor: course.color }}>
          {course.timeline.map(([when, what]) => (
            <li key={when} className="relative">
              <span
                className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-paper"
                style={{ background: course.color }}
              />
              <div className="font-display font-bold">{when}</div>
              <div className="text-sm text-ink-soft">{what}</div>
            </li>
          ))}
        </ol>
      ),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="h-2.5 w-full" style={{ background: course.color }} />
        <div className="container-x py-12 md:py-16">
          <Reveal>
            <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-coral">
              <Arrow className="h-4 w-4 rotate-180" /> All courses
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: course.color }}>
                {course.exam}
              </span>
              <span className="rounded-full border border-ink px-3 py-1 text-xs font-semibold">{course.level} · {course.degree}</span>
            </div>
            <h1 className="display-lg mt-6">{course.title}</h1>
            <p className="mt-3 font-display text-lg font-semibold text-ink-soft">{course.institute}</p>
            <p className="mt-6 max-w-3xl text-lg text-ink-soft md:text-xl">{course.intro}</p>
          </Reveal>
        </div>
      </section>

      {/* Linear flow — numbered steps linked by animated connectors */}
      <section className="container-x pb-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          {steps.map((s, i) => (
            <div key={s.title} className="flex w-full flex-col items-center">
              {i > 0 && <Connector color={course.color} reduced={reduced} />}
              <StepNode n={String(i + 1).padStart(2, "0")} color={course.color} reduced={reduced} />
              <Reveal className="w-full">
                <InfoCard title={s.title} color={course.color}>
                  {s.body}
                </InfoCard>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Other tracks */}
      <section className="container-x py-16">
        <Reveal>
          <Eyebrow className="mb-6">Other tracks</Eyebrow>
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map((c) => (
              <Link key={c.id} to={`/courses/${c.id}`} className="card-brutal group flex items-center justify-between p-5">
                <div>
                  <div className="text-xs font-bold" style={{ color: c.color }}>{c.exam}</div>
                  <div className="mt-1 font-display font-bold">{c.title}</div>
                </div>
                <Arrow className="h-5 w-5 text-coral transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <CTABand />
    </>
  );
}

/* Numbered node that sits above each card and anchors the flow line */
function StepNode({ n, color, reduced }) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
      whileInView={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0.4 } : { type: "spring", stiffness: 260, damping: 18 }}
      className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-bold text-white ring-4 ring-paper"
      style={{ background: color }}
    >
      {!reduced && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
          initial={{ opacity: 0.35, scale: 1 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
      <span className="relative">{n}</span>
    </motion.div>
  );
}

/* Animated connector line drawn between two consecutive cards */
function Connector({ color, reduced }) {
  return (
    <div className="flex h-16 w-full items-stretch justify-center md:h-20" aria-hidden="true">
      <div className="relative w-0.5">
        {/* faint track */}
        <div className="absolute inset-0 rounded-full bg-ink/10" />
        {/* colored fill that draws downward on scroll-in */}
        <motion.div
          className="absolute inset-0 origin-top rounded-full"
          style={{ background: color }}
          initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* travelling pulse for a sense of continuous flow */}
        {!reduced && (
          <motion.span
            className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px 1px ${color}` }}
            initial={{ top: "-6%", opacity: 0 }}
            animate={{ top: ["-6%", "106%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
          />
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, color, children }) {
  return (
    <div className="card-brutal w-full p-7 md:p-8">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold md:text-2xl">
        <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: color }} />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}
