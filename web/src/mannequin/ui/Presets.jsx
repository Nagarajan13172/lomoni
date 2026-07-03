import { PRESETS } from "../pose/presets";
import { useStore } from "../store";

export function Presets() {
  const ready = useStore((s) => s.ready);
  const queuePose = useStore((s) => s.queuePose);
  const resetAll = useStore((s) => s.resetAll);
  const setActivePose = useStore((s) => s.setActivePose);
  const activePoseId = useStore((s) => s.activePoseId);

  const apply = (preset) => {
    // Smooth, absolute transition (unposed joints ease back to rest).
    if (!Object.keys(preset.pose).length) {
      resetAll(); // also clears the highlight
    } else {
      setActivePose("preset:" + preset.id);
      queuePose(preset.pose, { additive: true });
    }
  };

  return (
    <div className="presets">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          className={"preset" + (activePoseId === "preset:" + p.id ? " preset--active" : "")}
          disabled={!ready}
          onClick={() => apply(p)}
          title={`${p.label} pose`}
        >
          <span className="preset__icon">{p.icon}</span>
          <span className="preset__label">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
