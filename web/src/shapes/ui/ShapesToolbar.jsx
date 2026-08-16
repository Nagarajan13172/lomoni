import { useShapes, guidesVisible, labelsVisible } from "../shapesStore";

function FrameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
      <rect x="8" y="8" width="8" height="8" rx="1" opacity="0.5" />
    </svg>
  );
}

function LockIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" />
      {/* The shackle swings open when nothing is held. */}
      {open ? <path d="M8 10.5V7a4 4 0 0 1 7.7-1.5" /> : <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />}
      <circle cx="12" cy="15.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 20h18" opacity="0.45" />
      <path d="M19 3 5 20" strokeDasharray="3 2.6" />
      <path d="M19 3 14 20" strokeDasharray="3 2.6" opacity="0.7" />
      <circle cx="19" cy="3" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LabelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 11.2V4.6A1.6 1.6 0 0 1 4.6 3h6.6a1.6 1.6 0 0 1 1.14.47l8 8a1.6 1.6 0 0 1 0 2.26l-6.6 6.6a1.6 1.6 0 0 1-2.26 0l-8-8A1.6 1.6 0 0 1 3 11.2Z" />
      <circle cx="7.6" cy="7.6" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H4.6A1.6 1.6 0 0 0 3 4.6V9M15 3h4.4A1.6 1.6 0 0 1 21 4.6V9M21 15v4.4a1.6 1.6 0 0 1-1.6 1.6H15M3 15v4.4A1.6 1.6 0 0 0 4.6 21H9" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function Tool({ icon, label, on, disabled, primary, title, onClick }) {
  return (
    <button
      type="button"
      className={`shapes-tool ${on ? "is-on" : ""} ${primary ? "is-primary" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      title={title}
    >
      <span className="shapes-tool__ico">{icon}</span>
      <span className="shapes-tool__label">{label}</span>
    </button>
  );
}

/**
 * The controls that act on the VIEW rather than on the composition, floated over
 * the scene they affect instead of buried in the side panel.
 *
 * It centres itself in whatever the panel leaves free, using the same measurement
 * the camera framing uses, so it never ends up half-hidden underneath it.
 *
 * The lock is the point of the bar. Frame it how you want, lock it, and draw:
 * the camera, every drag handle, auto-fit and the composition controls all hold
 * still. What is DRAWN on the scene stays free while locked, so you can bring the
 * construction lines back to check your drawing without the view shifting.
 */
export function ShapesToolbar() {
  const panelInset = useShapes((s) => s.panelInset);
  const locked = useShapes((s) => s.locked);
  const frameView = useShapes((s) => s.frameView);
  const autoFit = useShapes((s) => s.autoFit);
  const guides = useShapes(guidesVisible);
  const labels = useShapes(labelsVisible);
  const toggleLock = useShapes((s) => s.toggleLock);
  const setFrameView = useShapes((s) => s.setFrameView);
  const setAutoFit = useShapes((s) => s.setAutoFit);
  const toggleGuides = useShapes((s) => s.toggleGuides);
  const toggleLabels = useShapes((s) => s.toggleLabels);

  return (
    <div
      className={`shapes-toolbar ${locked ? "is-locked" : ""}`}
      style={{ right: panelInset.right, bottom: panelInset.bottom + 18 }}
      role="toolbar"
      aria-label="View controls"
    >
      <Tool
        icon={<FrameIcon />}
        label="Frame view"
        on={frameView}
        primary
        disabled={locked}
        title={
          locked
            ? "Unlock to re-frame"
            : frameView
              ? "Leave practice mode"
              : "Swing to a three-quarter angle and clear the guides"
        }
        onClick={() => setFrameView(!frameView)}
      />
      <Tool
        icon={<LockIcon open={!locked} />}
        label={locked ? "Locked" : "Lock"}
        on={locked}
        primary
        title={locked ? "Unlock and move things again" : "Freeze the frame so nothing shifts while you draw"}
        onClick={toggleLock}
      />

      <span className="shapes-tool__sep" aria-hidden="true" />

      <Tool
        icon={<LinesIcon />}
        label="Lines"
        on={guides}
        title="Show or hide the construction"
        onClick={toggleGuides}
      />
      <Tool icon={<LabelsIcon />} label="Labels" on={labels} title="Show or hide the tags" onClick={toggleLabels} />
      <Tool
        icon={<FitIcon />}
        label="Auto-fit"
        on={autoFit && !locked}
        disabled={locked}
        title={locked ? "Unlock to let the camera re-frame" : "Keep everything in shot"}
        onClick={() => setAutoFit(!autoFit)}
      />
    </div>
  );
}
