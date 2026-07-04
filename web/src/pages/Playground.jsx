import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

/* Posed-figure glyph for the Pose Studio entry. */
function PoseIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M12 6.7v6.1M12 9l-4.2 2.6M12 9l4.2 2.6M12 12.8l-3 7.2M12 12.8l3 7.2" />
    </svg>
  );
}

/* Stacked-bricks glyph for the Build entry. */
function BuildIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="13.5" width="8" height="6.5" rx="1.2" />
      <rect x="13" y="13.5" width="8" height="6.5" rx="1.2" />
      <rect x="8" y="4" width="8" height="6.5" rx="1.2" />
    </svg>
  );
}

/* Overlapping primitives glyph for the Shapes entry. */
function ShapesIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="9" r="4.2" />
      <rect x="11.5" y="11.5" width="8" height="8" rx="1.4" />
      <path d="M15.5 3.5l4 6.8h-8z" />
    </svg>
  );
}

/* Sidebar glyph for the mobile open-drawer button. */
function SidebarIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </svg>
  );
}

const TOOLS = [
  { to: "/playground/studio", label: "Pose Studio", desc: "Pose the wooden mannequin", Icon: PoseIcon },
  { to: "/playground/build", label: "Build", desc: "Snap Lego-style bricks", Icon: BuildIcon },
  { to: "/playground/shapes", label: "Shapes", desc: "Light & shade 3D shapes", Icon: ShapesIcon },
];

/**
 * Playground shell — a full-viewport workspace with a left sidebar that switches
 * between the creative tools (Pose Studio, Build). The sidebar is permanent on
 * desktop; on mobile it collapses to a slide-in drawer with an open/close toggle.
 * The selected tool renders through <Outlet /> and fills the remaining space.
 */
export default function Playground() {
  const [open, setOpen] = useState(false); // mobile drawer state
  const { pathname } = useLocation();

  // Picking a tool (route change) closes the mobile drawer.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative flex h-[calc(100dvh-68px)] w-full overflow-hidden bg-paper">
      {/* ---------- MOBILE: open-drawer button (hidden while open) ---------- */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open tools sidebar"
        className={`fixed left-3 top-[80px] z-30 items-center gap-2 rounded-full border border-ink/15 bg-paper/90 px-3.5 py-2 text-sm font-semibold text-ink shadow-md backdrop-blur md:hidden ${
          open ? "hidden" : "flex"
        }`}
      >
        <SidebarIcon /> Tools
      </button>

      {/* ---------- MOBILE: backdrop ---------- */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-[68px] z-30 bg-ink/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---------- LEFT SIDEBAR (permanent on desktop, drawer on mobile) ---------- */}
      <aside
        className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-64 flex-col border-r border-ink/10 bg-paper-deep transition-transform duration-300 ease-out md:static md:z-auto md:translate-x-0 md:bg-paper-deep/60 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-5 pb-2 pt-6">
          <div>
            <div className="eyebrow flex items-center gap-3 text-coral">
              <span className="h-px w-6 bg-coral" />
              Playground
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              Free-play creative tools — pick one to start.
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close tools sidebar"
            className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1.5 p-3">
          {TOOLS.map(({ to, label, desc, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive ? "bg-coral text-white shadow-sm" : "text-ink hover:bg-paper"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors ${
                      isActive ? "bg-white/20 text-white" : "bg-card text-coral ring-1 ring-ink/10"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-bold leading-tight">{label}</span>
                    <span
                      className={`mt-0.5 block truncate text-[11px] leading-tight ${
                        isActive ? "text-white/80" : "text-ink-soft"
                      }`}
                    >
                      {desc}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ---------- MAIN — the active tool fills the rest ---------- */}
      <main className="relative min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
