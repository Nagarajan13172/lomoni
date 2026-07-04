import { useStore } from "../store";
import { JointInspector } from "./JointInspector";

/**
 * Direct on-character posing (shown when the Customize mode is active — grab
 * dots are already on). Click a joint on the model (arm, leg, head, knee…) and
 * drag the rings, or fine-tune with the per-axis degree boxes below. "Reset all
 * joints" snaps the whole figure back to rest.
 */
export function Customize() {
  const ready = useStore((s) => s.ready);
  const selected = useStore((s) => s.selected);
  const resetAll = useStore((s) => s.resetAll);

  return (
    <div className="customize">
      <p className="customize__hint">
        Click a joint on the model — arm, leg, head, knee, anything — then drag
        the coloured rings or type exact angles below. Scroll to zoom, drag empty
        space to orbit.
      </p>

      <button
        className="mq-btn customize__reset"
        disabled={!ready}
        onClick={resetAll}
      >
        ↺ Reset all joints
      </button>

      {selected && (
        <>
          <div className="acc-sub" style={{ marginTop: 12 }}>Fine-tune joint</div>
          <JointInspector />
        </>
      )}
    </div>
  );
}
