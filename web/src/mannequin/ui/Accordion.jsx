import { useState } from "react";

/** A collapsible panel section. Each section opens/closes independently. */
export function AccordionSection({ title, icon, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"acc" + (open ? " acc--open" : "")}>
      <button
        className="acc__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="acc__title">
          {icon && <span className="acc__icon">{icon}</span>}
          {title}
          {badge != null && <span className="acc__badge">{badge}</span>}
        </span>
        <svg className="acc__chevron" viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M8 10l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="acc__body">{children}</div>}
    </div>
  );
}
