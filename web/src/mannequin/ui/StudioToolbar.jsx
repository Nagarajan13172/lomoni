import { useStore, handlesVisible, spinning } from "../store";

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

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 6.5v5M12 11.5 8 15M12 11.5 16 15" opacity="0.5" />
      <circle cx="12" cy="4.6" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16.6" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16.6" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 12a8.5 8.5 0 1 1-2.9-6.4" />
      <path d="M20.8 3.6v4.6h-4.6" />
    </svg>
  );
}

function ShotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 8.6A1.6 1.6 0 0 1 4.6 7h2.2l1.3-2.2h7.8L17.2 7h2.2A1.6 1.6 0 0 1 21 8.6v9.8a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.4Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

function Tool({ icon, label, on, disabled, primary, title, onClick }) {
  return (
    <button
      type="button"
      className={`mq-tool${on ? " mq-tool--on" : ""}${primary ? " mq-tool--primary" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      title={title}
    >
      <span className="mq-tool__ico">{icon}</span>
      <span className="mq-tool__label">{label}</span>
    </button>
  );
}

/**
 * The controls that act on the VIEW rather than on the pose, floated over the
 * scene they affect instead of buried in the side panel.
 *
 * It centres itself in whatever the panel leaves free, using the same
 * measurement the camera framing uses, so it never ends up half-hidden under it.
 *
 * The lock is the point of the bar. Pose the figure, frame it, lock it, and
 * draw: the camera, the joint handles, the gizmo, the turntable and every pose
 * action all hold still. What is DRAWN on the scene stays free while locked, so
 * the joint dots can come back to check your drawing without the figure moving.
 */
export function StudioToolbar() {
  const ready = useStore((s) => s.ready);
  const panelInset = useStore((s) => s.panelInset);
  const locked = useStore((s) => s.locked);
  const frameView = useStore((s) => s.frameView);
  const dots = useStore(handlesVisible);
  const spin = useStore(spinning);
  const autoRotate = useStore((s) => s.autoRotate);
  const toggleLock = useStore((s) => s.toggleLock);
  const setFrameView = useStore((s) => s.setFrameView);
  const toggleHandles = useStore((s) => s.toggleHandles);
  const setAutoRotate = useStore((s) => s.setAutoRotate);
  const gl = useStore((s) => s.gl);

  const screenshot = () => {
    if (!gl) return;
    const a = document.createElement("a");
    a.href = gl.domElement.toDataURL("image/png");
    a.download = "pose-study.png";
    a.click();
  };

  return (
    <div
      className={`mq-toolbar${locked ? " mq-toolbar--locked" : ""}`}
      style={{ right: panelInset.right, bottom: panelInset.bottom + 18 }}
      role="toolbar"
      aria-label="View controls"
    >
      <Tool
        icon={<FrameIcon />}
        label="Frame view"
        on={frameView}
        primary
        disabled={locked || !ready}
        title={
          locked
            ? "Unlock to re-frame"
            : frameView
              ? "Leave practice mode"
              : "Swing to a three-quarter angle and clear the dots away"
        }
        onClick={() => setFrameView(!frameView)}
      />
      <Tool
        icon={<LockIcon open={!locked} />}
        label={locked ? "Locked" : "Lock"}
        on={locked}
        primary
        title={locked ? "Unlock and move things again" : "Freeze the figure and camera so nothing shifts while you draw"}
        onClick={toggleLock}
      />

      <span className="mq-tool__sep" aria-hidden="true" />

      <Tool
        icon={<DotsIcon />}
        label="Joint dots"
        on={dots}
        disabled={locked || !ready}
        title={locked ? "Unlock to pose by hand" : "Show or hide the joint handles"}
        onClick={toggleHandles}
      />
      <Tool
        icon={<SpinIcon />}
        label="Turntable"
        on={spin}
        disabled={locked || frameView}
        title={locked || frameView ? "Held still for drawing" : "Rotate the view slowly"}
        onClick={() => setAutoRotate(!autoRotate)}
      />
      <Tool
        icon={<ShotIcon />}
        label="Snapshot"
        disabled={!ready}
        title="Save a PNG of the view"
        onClick={screenshot}
      />
    </div>
  );
}
