import { useShapes } from "../shapesStore";
import { SHAPES, LIGHT_COLORS, PAINT_COLORS, PRESET_NAMES } from "../shapes";

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

/** One on/off pill in the scene-toggles grid. */
function Toggle({ label, on, onClick }) {
  return (
    <button className={"shapes-toggle" + (on ? " shapes-toggle--on" : "")} onClick={onClick}>
      {label}
    </button>
  );
}

/** Lighting + material + scene controls for the Shapes studio. */
export function ShapesPanel() {
  const s = useShapes();
  const selectedLabel = SHAPES.find((x) => x.type === s.selected)?.label;

  const screenshot = () => {
    const gl = useShapes.getState().gl;
    if (!gl) return;
    const a = document.createElement("a");
    a.href = gl.domElement.toDataURL("image/png");
    a.download = "my-shapes.png";
    a.click();
  };

  return (
    <aside className="shapes-panel">
      <header className="shapes-panel__head">
        <div className="shapes-panel__logo">🔮</div>
        <div>
          <h1 className="shapes-panel__title">Shapes</h1>
          <p className="shapes-panel__sub">
            {selectedLabel ? `Selected: ${selectedLabel}` : `${SHAPES.length} shapes lit by one sun`}
          </p>
        </div>
      </header>

      {/* ---------- Lighting moods ---------- */}
      <section>
        <h2 className="shapes-sec">Lighting mood</h2>
        <div className="shapes-cats">
          {PRESET_NAMES.map((name) => (
            <button
              key={name}
              className={"shapes-cat" + (s.preset === name ? " shapes-cat--on" : "")}
              onClick={() => s.applyPreset(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- The sun ---------- */}
      <section className="shapes-stack">
        <h2 className="shapes-sec">The sun</h2>
        <Slider label="Direction" value={s.azimuth} min={0} max={360} step={1} onChange={s.setAzimuth} fmt={(v) => `${v}°`} />
        <Slider label="Height" value={s.elevation} min={8} max={90} step={1} onChange={s.setElevation} fmt={(v) => `${v}°`} />
        <Slider label="Brightness" value={s.intensity} min={0} max={3} step={0.05} onChange={s.setIntensity} fmt={(v) => v.toFixed(2)} />
        <div className="shapes-swatches shapes-swatches--wide">
          {LIGHT_COLORS.map((c) => (
            <button
              key={c}
              className={"shapes-sw" + (s.lightColor === c ? " shapes-sw--on" : "")}
              style={{ background: c }}
              onClick={() => s.setLightColor(c)}
              aria-label={`light ${c}`}
            />
          ))}
        </div>
      </section>

      {/* ---------- Fill & shadow ---------- */}
      <section className="shapes-stack">
        <h2 className="shapes-sec">Fill &amp; shadow</h2>
        <Slider label="Ambient fill" value={s.ambient} min={0} max={1} step={0.01} onChange={s.setAmbient} fmt={(v) => v.toFixed(2)} />
        <Slider label="Shadow softness" value={s.softness} min={0} max={12} step={0.5} onChange={s.setSoftness} fmt={(v) => v.toFixed(1)} />
      </section>

      {/* ---------- Material ---------- */}
      <section className="shapes-stack">
        <h2 className="shapes-sec">Material</h2>
        <Slider label="Metalness" value={s.metalness} min={0} max={1} step={0.01} onChange={s.setMetalness} fmt={(v) => v.toFixed(2)} />
        <Slider label="Roughness" value={s.roughness} min={0} max={1} step={0.01} onChange={s.setRoughness} fmt={(v) => v.toFixed(2)} />
        <div className="shapes-swatches">
          <button
            className={"shapes-sw shapes-sw--rainbow" + (s.colorMode === "rainbow" ? " shapes-sw--on" : "")}
            onClick={() => s.setColorMode("rainbow")}
            aria-label="rainbow"
          >
            🌈
          </button>
          {PAINT_COLORS.slice(1).map((c) => (
            <button
              key={c}
              className={"shapes-sw" + (s.colorMode === c ? " shapes-sw--on" : "")}
              style={{ background: c }}
              onClick={() => s.setColorMode(c)}
              aria-label={c}
            />
          ))}
        </div>
      </section>

      {/* ---------- Scene toggles ---------- */}
      <section>
        <h2 className="shapes-sec">Scene</h2>
        <div className="shapes-toggles">
          <Toggle label="☀ Animate sun" on={s.animate} onClick={() => s.toggle("animate")} />
          <Toggle label="⟳ Spin shapes" on={s.spin} onClick={() => s.toggle("spin")} />
          <Toggle label="▦ Floor" on={s.showFloor} onClick={() => s.toggle("showFloor")} />
          <Toggle label="◎ Sun marker" on={s.showSun} onClick={() => s.toggle("showSun")} />
        </div>
      </section>

      <section className="shapes-stack">
        <button className="shapes-btn" onClick={screenshot}>📷 Screenshot</button>
      </section>

      <footer className="shapes-foot">
        Drag the sun's <b>Direction</b> &amp; <b>Height</b> to relight the scene · click a shape to
        focus it · drag to orbit · scroll to zoom
      </footer>
    </aside>
  );
}
