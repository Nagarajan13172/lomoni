import { THEME_LIST } from "../scene/themes";
import { PROPS } from "../scene/propRegistry";
import { Thumb } from "./Thumb";
import { useStore } from "../store";

const FLOORS = [
  { id: "auto", label: "Auto" },
  { id: "grid", label: "Grid" },
  { id: "solid", label: "Solid" },
  { id: "none", label: "None" },
];

export function ScenePanel() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const floorStyle = useStore((s) => s.floorStyle);
  const setFloorStyle = useStore((s) => s.setFloorStyle);
  const propId = useStore((s) => s.propId);
  const setProp = useStore((s) => s.setProp);
  const autoRotate = useStore((s) => s.autoRotate);
  const setAutoRotate = useStore((s) => s.setAutoRotate);
  const autoRotateSpeed = useStore((s) => s.autoRotateSpeed);
  const setAutoRotateSpeed = useStore((s) => s.setAutoRotateSpeed);

  return (
    <div className="scenepanel">
      <section className="section">
        <h2 className="section__title">Theme &amp; lighting</h2>
        <div className="segmented">
          {THEME_LIST.map((t) => (
            <button
              key={t.id}
              className={"seg" + (theme === t.id ? " seg--active" : "")}
              onClick={() => setTheme(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Floor</h2>
        <div className="segmented">
          {FLOORS.map((f) => (
            <button
              key={f.id}
              className={"seg" + (floorStyle === f.id ? " seg--active" : "")}
              onClick={() => setFloorStyle(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Props</h2>
        <div className="proplist">
          {PROPS.map((p) => (
            <button
              key={p.id}
              className={"propbtn" + (propId === p.id ? " propbtn--active" : "")}
              onClick={() => setProp(p.id)}
              title={p.name}
            >
              <span className="propbtn__thumb">
                <Thumb
                  src={p.id === "none" ? null : `/thumbs/props/${p.id}.png`}
                  emoji={p.icon}
                  alt={p.name}
                />
              </span>
              <span className="propbtn__name">{p.name}</span>
            </button>
          ))}
        </div>
        <p className="hint-line">
          Props sit near the figure — pick a pose (e.g. Sit) that matches.
        </p>
      </section>

      <section className="section">
        <h2 className="section__title">Turntable</h2>
        <button
          className={"mq-btn" + (autoRotate ? " mq-btn--on" : "")}
          onClick={() => setAutoRotate(!autoRotate)}
          style={{ width: "100%" }}
        >
          {autoRotate ? "◉ Rotating" : "○ Auto-rotate"}
        </button>
        {autoRotate && (
          <div className="slider" style={{ marginTop: 12 }}>
            <div className="slider__top">
              <span className="slider__label">Speed</span>
              <span className="slider__val">{autoRotateSpeed.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={6}
              step={0.2}
              value={autoRotateSpeed}
              onChange={(e) => setAutoRotateSpeed(Number(e.target.value))}
            />
          </div>
        )}
      </section>
    </div>
  );
}
