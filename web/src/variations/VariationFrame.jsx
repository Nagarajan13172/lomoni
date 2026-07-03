import { useEffect } from "react";
import { Link } from "react-router-dom";

const VARIANTS = [
  { id: "v1", name: "Grid" },
  { id: "v2", name: "Atelier" },
  { id: "v3", name: "Noir" },
  { id: "v4", name: "Mono" },
];

/* Wraps each variation: scroll-to-top on mount, sets title, renders the
   floating comparison switcher. Each variation owns its own header/footer. */
export default function VariationFrame({ current, name, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${name} — LOMONI design variation ${current.toUpperCase()}`;
    return () => {
      document.title = "LOMONI Design Studio — Road To D-School";
    };
  }, [current, name]);

  return (
    <>
      {children}
      <VariationSwitcher current={current} />
    </>
  );
}

function VariationSwitcher({ current }) {
  return (
    <nav
      aria-label="Design variations"
      className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2"
    >
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/85 p-1.5 text-white shadow-xl backdrop-blur-md">
        <span className="px-2.5 font-['Space_Mono'] text-[10px] uppercase tracking-widest text-white/45">
          Variation
        </span>
        {VARIANTS.map((v) => {
          const active = v.id === current;
          return (
            <Link
              key={v.id}
              to={`/${v.id}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="font-['Space_Mono']">{v.id}</span>
              <span className="ml-1.5 hidden sm:inline">{v.name}</span>
            </Link>
          );
        })}
        <span className="mx-1 h-4 w-px bg-white/15" />
        <Link
          to="/"
          className="rounded-full px-3 py-1.5 text-xs font-medium text-white/55 transition-colors hover:text-white"
        >
          Full site ↗
        </Link>
      </div>
    </nav>
  );
}
