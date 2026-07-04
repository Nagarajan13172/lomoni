import { useEffect, useRef, useState } from "react";
import { JOINT_LABEL, useStore } from "../store";

const r2d = (r) => (r * 180) / Math.PI;
const d2r = (d) => (d * Math.PI) / 180;

const AXES = [
  { key: "x", label: "Pitch", tint: "#ff5c7a", desc: "nod / bend forward-back" },
  { key: "y", label: "Yaw", tint: "#5cd6a0", desc: "turn / twist" },
  { key: "z", label: "Roll", tint: "#5c9bff", desc: "tilt / raise sideways" },
];

export function JointInspector() {
  const selected = useStore((s) => s.selected);
  const bones = useStore((s) => s.bones);
  const resetBone = useStore((s) => s.resetBone);
  const bone = selected ? bones[selected] : null;

  const [deg, setDeg] = useState({ x: 0, y: 0, z: 0 });
  const editing = useRef(false);

  // Keep the sliders in sync with the live bone every frame (so dragging the
  // 3D gizmo, presets, mirror, etc. all reflect here too).
  useEffect(() => {
    if (!bone) return;
    // Switching joints must snap the inputs to the NEW joint immediately and
    // cancel any in-progress typing — otherwise the boxes keep the previous
    // joint's angles.
    editing.current = false;
    setDeg({ x: r2d(bone.rotation.x), y: r2d(bone.rotation.y), z: r2d(bone.rotation.z) });
    let raf;
    let last = { x: NaN, y: NaN, z: NaN };
    const tick = () => {
      if (!editing.current) {
        const next = {
          x: r2d(bone.rotation.x),
          y: r2d(bone.rotation.y),
          z: r2d(bone.rotation.z),
        };
        // Only re-render when the bone actually moved (avoid 60fps idle churn).
        if (
          Math.abs(next.x - last.x) > 0.05 ||
          Math.abs(next.y - last.y) > 0.05 ||
          Math.abs(next.z - last.z) > 0.05
        ) {
          last = next;
          setDeg(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [bone]);

  if (!selected) {
    return (
      <div className="inspector inspector--empty">
        <div className="inspector__empty-icon">🎯</div>
        <p>
          Pick a joint — tap a <b>coloured dot</b> on the mannequin or a chip
          above — then drag the rings in 3D or use the sliders below.
        </p>
      </div>
    );
  }

  const setAxis = (axis, val) => {
    if (bone) bone.rotation[axis] = d2r(val);
    setDeg((p) => ({ ...p, [axis]: val }));
  };

  return (
    <div className="inspector">
      <div className="inspector__head">
        <span className="inspector__title">{JOINT_LABEL[selected]}</span>
        <button className="mq-btn mq-btn--ghost mq-btn--sm" onClick={() => resetBone(selected)}>
          Reset joint
        </button>
      </div>

      {AXES.map((ax) => (
        <div className="slider" key={ax.key}>
          <div className="slider__top">
            <span className="slider__label">
              <i className="slider__dot" style={{ background: ax.tint }} />
              {ax.label}
              <em className="slider__desc">{ax.desc}</em>
            </span>
            <span className="slider__num-wrap">
              <input
                type="number"
                className="slider__num"
                min={-180}
                max={180}
                step={1}
                value={Math.round(deg[ax.key])}
                style={{ ["--tint"]: ax.tint }}
                onFocus={() => (editing.current = true)}
                onBlur={() => (editing.current = false)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v))
                    setAxis(ax.key, Math.max(-180, Math.min(180, v)));
                }}
              />
              <span className="slider__num-unit">°</span>
            </span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={Math.round(deg[ax.key])}
            style={{ accentColor: ax.tint }}
            onMouseDown={() => (editing.current = true)}
            onMouseUp={() => (editing.current = false)}
            onTouchStart={() => (editing.current = true)}
            onTouchEnd={() => (editing.current = false)}
            onChange={(e) => setAxis(ax.key, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
