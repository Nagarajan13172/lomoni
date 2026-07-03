import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { item } from "./ui";
import { Arrow } from "./ui";

export default function CourseCard({ course }) {
  return (
    <motion.div variants={item}>
      <Link
        to={`/courses/${course.id}`}
        className="card-brutal group flex h-full flex-col p-6 md:p-7"
      >
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ background: course.color }}
          >
            {course.exam}
          </span>
          <span className="font-display text-sm font-semibold text-ink-soft">{course.degree}</span>
        </div>

        <h3 className="mt-5 font-display text-2xl font-bold leading-tight md:text-[1.7rem]">
          {course.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
          {course.institute}
        </p>

        <div className="mt-6 flex items-center gap-2 font-display text-sm font-semibold text-coral">
          Explore track
          <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
