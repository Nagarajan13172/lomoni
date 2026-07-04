import { useShapes } from "../shapesStore";
import { SHAPES } from "../shapes";

/** A labelled range slider with a live value readout. */
function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <label className="shapes-slider">
      <span className="shapes-slider__row">
        <span>{label}</span>
        <span className="shapes-slider__val">{fmt ? fmt(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

function TopViewGuide({ azimuth }) {
  const angle = (azimuth * Math.PI) / 180;
  const x = 50 + Math.sin(angle) * 34;
  const y = 50 - Math.cos(angle) * 34;

  return (
    <div className="shapes-guide">
      <div className="shapes-guide__label">Top view</div>
      <div className="shapes-guide__radar">
        <div className="shapes-guide__ring" />
        <div
          className="shapes-guide__beam"
          style={{ transform: `translate(-50%, -100%) rotate(${azimuth}deg)` }}
        />
        <div className="shapes-guide__shape" />
        <div className="shapes-guide__light" style={{ left: `${x}%`, top: `${y}%` }} />
        <div className="shapes-guide__sun" style={{ left: `${x}%`, top: `${y}%` }}>
          Sun
        </div>
      </div>
    </div>
  );
}

/** Minimal controls: one shape picker plus the single visible light. */
export function ShapesPanel() {
  const shape = useShapes((s) => s.shape);
  const azimuth = useShapes((s) => s.azimuth);
  const elevation = useShapes((s) => s.elevation);
  const radius = useShapes((s) => s.radius);
  const setShape = useShapes((s) => s.setShape);
  const setAzimuth = useShapes((s) => s.setAzimuth);
  const setElevation = useShapes((s) => s.setElevation);
  const setRadius = useShapes((s) => s.setRadius);
  const selected = SHAPES.find((item) => item.type === shape) ?? SHAPES[0];

  return (
    <aside className="shapes-panel">
      <header className="shapes-panel__head">
        <div className="shapes-panel__logo">🔮</div>
        <div>
          <h1 className="shapes-panel__title">Shapes</h1>
          <p className="shapes-panel__sub">See the glowing light in the scene, then place it with top angle and height.</p>
        </div>
      </header>

      <section className="shapes-stack">
        <h2 className="shapes-sec">Shape</h2>
        <label className="shapes-field">
          <span className="shapes-field__label">Choose one shape</span>
          <select className="shapes-select" value={shape} onChange={(e) => setShape(e.target.value)}>
            {SHAPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="shapes-stack">
        <h2 className="shapes-sec">Light</h2>
        <p className="shapes-note">The glowing marker is the sun. The dotted guides show the light rays and how the shadow is being built.</p>
        <TopViewGuide azimuth={azimuth} />
        <Slider label="Top angle" value={azimuth} min={0} max={360} step={1} onChange={setAzimuth} fmt={(v) => `${v}°`} />
        <Slider label="Height angle" value={elevation} min={8} max={85} step={1} onChange={setElevation} fmt={(v) => `${v}°`} />
        <Slider label="Distance" value={radius} min={8} max={24} step={0.5} onChange={setRadius} fmt={(v) => v.toFixed(1)} />
        <div className="shapes-readout">
          <span>{`top ${azimuth.toFixed(0)}°`}</span>
          <span>{`height ${elevation.toFixed(0)}°`}</span>
          <span>{`dist ${radius.toFixed(1)}`}</span>
        </div>
      </section>

      <footer className="shapes-foot">
        <b>{selected.label}</b> is on the floor now. Move the <b>sun</b> with <b>Top angle</b>, then tune
        {" "}
        <b>Height angle</b> and <b>Distance</b>. The dotted construction lines and shadow update live.
      </footer>
    </aside>
  );
}
