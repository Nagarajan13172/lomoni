const WORDS = ["NID", "NIFT", "UCEED", "CEED", "PORTFOLIO", "SKETCHING", "DESIGN APTITUDE", "MENTORSHIP"];

export default function Marquee() {
  const run = [...WORDS, ...WORDS];
  return (
    <div className="border-y border-ink bg-ink py-4 text-paper">
      <div className="flex overflow-hidden">
        <div className="marquee-track">
          {run.map((w, i) => (
            <span key={i} className="mx-6 inline-flex items-center font-display text-2xl font-bold tracking-tight md:text-3xl">
              {w}
              <span className="ml-12 text-coral">✶</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
