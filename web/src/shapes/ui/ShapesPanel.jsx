import { useLayoutEffect, useRef, useState } from "react";
import { useShapes } from "../shapesStore";
import { TopViewMap } from "./TopViewMap";
import {
  SHAPES,
  LIGHT_HEIGHT,
  LIGHT_DISTANCE,
  OBJECT_RANGE,
  MAX_OBJECTS,
  elevationAngle,
  tallestTop,
} from "../shapes";

/** A labelled range slider with a live value readout. */
function Slider({ label, value, min, max, step, onChange, fmt, disabled }) {
  return (
    <label className={`shapes-slider ${disabled ? "is-off" : ""}`}>
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
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

/**
 * One row of the cast list. The row selects; the dropdown re-shapes it in place;
 * the × removes it. Clicks inside the controls must not fall through to the row,
 * or changing a shape would also re-select its neighbour.
 */
function ObjectRow({ object, selected, onSelect, onType, onRemove, canRemove, locked }) {
  const def = SHAPES.find((s) => s.type === object.type) ?? SHAPES[0];
  const [x, z] = object.position;

  return (
    <li>
      <div
        className={`shapes-item ${selected ? "is-on" : ""}`}
        onPointerDown={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-pressed={selected}
      >
        <span className="shapes-swatch" style={{ background: def.color }} />
        <span className="shapes-item__body">
          <select
            className="shapes-item__type"
            value={object.type}
            onChange={(e) => onType(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={locked}
            aria-label="Shape"
          >
            {SHAPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="shapes-item__pos">
            {Math.hypot(x, z) < 0.01 ? "at the centre" : `${x.toFixed(1)}, ${z.toFixed(1)}`}
            {object.elevation > 0.02 ? ` · lifted ${object.elevation.toFixed(1)}` : ""}
            {object.rotation > 0.005 ? ` · ${Math.round((object.rotation * 180) / Math.PI)}°` : ""}
          </span>
        </span>
        <button
          type="button"
          className="shapes-item__del"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          disabled={!canRemove || locked}
          aria-label={`Remove ${def.label}`}
          title={canRemove ? `Remove ${def.label}` : "Keep at least one shape"}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

/**
 * How to rule the same construction on paper. The swatches match the colours in
 * the scene, so a step and the lines it describes are the same thing.
 */
function HowTo() {
  const steps = [
    { color: "#d8921f", text: "Mark the bulb, then drop a vertical to the floor. Its foot is the vanishing point." },
    { color: "#c1544a", text: "From that foot, rule a line out through the base of the shape and keep going." },
    { color: "#d8921f", text: "From the bulb, rule a ray past the shape's top corner down to the floor." },
    { color: "#8a5a06", text: "Where the two cross is the tip of the shadow — that is why both lines run past it." },
    { color: "#3f4854", text: "Repeat for each corner, then join the tips. That outline is the shadow." },
  ];

  return (
    <ol className="shapes-howto">
      {steps.map((step, index) => (
        <li key={index}>
          <span className="shapes-howto__dot" style={{ background: step.color }} />
          {step.text}
        </li>
      ))}
    </ol>
  );
}

/** The cast of shapes, plus the single light that reveals them. */
export function ShapesPanel() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);
  const locked = useShapes((s) => s.locked);
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const shapeFrames = useShapes((s) => s.shapeFrames);
  const setAzimuth = useShapes((s) => s.setAzimuth);
  const setHeight = useShapes((s) => s.setHeight);
  const setDistance = useShapes((s) => s.setDistance);
  const addObject = useShapes((s) => s.addObject);
  const removeObject = useShapes((s) => s.removeObject);
  const selectObject = useShapes((s) => s.selectObject);
  const setObjectType = useShapes((s) => s.setObjectType);
  const centerSelected = useShapes((s) => s.centerSelected);
  const setPanelInset = useShapes((s) => s.setPanelInset);

  const [adding, setAdding] = useState(SHAPES[0].type);
  const full = objects.length >= MAX_OBJECTS;
  const selected = objects.find((o) => o.id === selectedId) ?? null;
  const offset = selected ? Math.hypot(selected.position[0], selected.position[1]) : 0;
  // The bulb is free to sit below the shapes. Worth saying when it does, since
  // a ray heading upward simply never reaches the floor.
  const highest = tallestTop(objects, shapeFrames);
  const underLit = height < highest - 0.05;

  // Report the screen space this panel covers, so the scene can frame itself in
  // what is left rather than centring behind us.
  const panel = useRef(null);
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return undefined;

    const measure = () => {
      const box = el.getBoundingClientRect();
      const stacked = window.matchMedia("(max-width: 960px)").matches;
      if (stacked) setPanelInset(0, Math.round(box.height + 24));
      else setPanelInset(Math.round(box.width + 36), 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      setPanelInset(0, 0);
    };
  }, [setPanelInset]);

  return (
    <aside className="shapes-panel" ref={panel}>
      <header className="shapes-panel__head">
        <div className="shapes-panel__logo">🔮</div>
        <div>
          <h1 className="shapes-panel__title">Light &amp; Shadow</h1>
          <p className="shapes-panel__sub">
            One bulb at a real height. Watch every shadow line run back to the vanishing point under it.
          </p>
        </div>
      </header>

      <section className="shapes-stack">
        <h2 className="shapes-sec">
          Shapes
          <span className="shapes-sec__count">
            {objects.length}/{MAX_OBJECTS}
          </span>
        </h2>
        <p className="shapes-note">
          {locked ? (
            <>
              The frame is <b>locked</b> — nothing will shift while you draw. Open the lock in the toolbar to make
              changes again.
            </>
          ) : (
            <>
              Drag a shape to walk it around, or use the <b>top view</b> below for the full circle. The selected shape
              gets a <b>teal collar</b> — drag that to lift it, and it snaps onto whatever it lands on so you can
              stack them.
            </>
          )}
        </p>

        <ul className="shapes-list">
          {objects.map((object) => (
            <ObjectRow
              key={object.id}
              object={object}
              selected={object.id === selectedId}
              canRemove={objects.length > 1}
              locked={locked}
              onSelect={() => selectObject(object.id)}
              onType={(type) => setObjectType(object.id, type)}
              onRemove={() => removeObject(object.id)}
            />
          ))}
        </ul>

        <div className="shapes-add">
          <select
            className="shapes-select"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            aria-label="Shape to add"
            disabled={full || locked}
          >
            {SHAPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="shapes-btn" onClick={() => addObject(adding)} disabled={full || locked}>
            + Add
          </button>
        </div>

        <div className="shapes-row">
          <button
            type="button"
            className="shapes-btn"
            onClick={centerSelected}
            disabled={!selected || offset < 0.01 || locked}
          >
            Centre selected
          </button>
          <span className="shapes-row__note">
            {!selected ? "nothing selected" : offset < 0.01 ? "at the centre" : `${offset.toFixed(1)} of ${OBJECT_RANGE} out`}
          </span>
        </div>
      </section>

      <section className="shapes-stack">
        <h2 className="shapes-sec">Light</h2>
        <p className="shapes-note">
          Drag the <b>bulb</b> or its <b>floor mark</b> to move the light around; drag the <b>amber collar</b> on the
          vertical to raise or lower it. The mark under the bulb is the <b>shadow vanishing point</b> — every shadow
          line radiates from it.
        </p>
        <TopViewMap />
        <Slider label="Top angle" value={azimuth} min={0} max={360} step={1} onChange={setAzimuth} fmt={(v) => `${v}°`} disabled={locked} />
        <Slider
          label="Bulb height"
          value={height}
          min={LIGHT_HEIGHT.min}
          max={LIGHT_HEIGHT.max}
          step={LIGHT_HEIGHT.step}
          onChange={setHeight}
          fmt={(v) => `${v.toFixed(1)} · ${elevationAngle(v, distance).toFixed(0)}°`}
          disabled={locked}
        />
        <Slider
          label="Floor distance"
          value={distance}
          min={LIGHT_DISTANCE.min}
          max={LIGHT_DISTANCE.max}
          step={LIGHT_DISTANCE.step}
          onChange={setDistance}
          fmt={(v) => v.toFixed(1)}
          disabled={locked}
        />
        {underLit && (
          <p className="shapes-note">
            The bulb is <b>below the top</b> of something on the floor. Rays that leave it heading upward never reach
            the ground, so those parts cast no floor shadow — and what does reach it stretches away toward the horizon.
          </p>
        )}
      </section>

      <details className="shapes-details">
        <summary>How the shadow is drawn</summary>
        <HowTo />
      </details>

      <footer className="shapes-foot">
        Add a few shapes and spread them out: the near ones cast short shadows, the far ones long — and every one of
        those shadows still points home to the same <b>vanishing point</b>.
      </footer>
    </aside>
  );
}
