import { useStore } from "../store";
import { JointInspector } from "./JointInspector";

/**
 * Direct on-character posing. Hit "Customize" to reveal a grab-dot on every
 * joint of the model; click a joint (arm, leg, head, knee…) and drag the
 * coloured rings to bend it — no list selection. Once a joint is grabbed, the
 * sliders below fine-tune it.
 */
export function Customize() {
  const ready = useStore((s) => s.ready);
  const showHandles = useStore((s) => s.showHandles);
  const setShowHandles = useStore((s) => s.setShowHandles);
  const selected = useStore((s) => s.selected);
  const select = useStore((s) => s.select);

  const toggle = () => {
    const next = !showHandles;
    setShowHandles(next);
    if (!next) select(null); // leaving customize hides the drag gizmo
  };

  return (
    <div className="customize">
      <button
        className={"customize__btn" + (showHandles ? " customize__btn--on" : "")}
        disabled={!ready}
        onClick={toggle}
      >
        {showHandles ? "✓ Customizing — tap a joint" : "✎ Customize pose"}
      </button>

      {showHandles && (
        <p className="customize__hint">
          Click a joint on the model — arm, leg, head, knee, anything — then drag
          the coloured rings to bend it. Scroll to zoom, drag empty space to orbit.
        </p>
      )}

      {showHandles && selected && (
        <>
          <div className="acc-sub" style={{ marginTop: 12 }}>Fine-tune joint</div>
          <JointInspector />
        </>
      )}
    </div>
  );
}
