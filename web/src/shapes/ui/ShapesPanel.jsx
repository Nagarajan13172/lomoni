import { useLayoutEffect, useRef, useState } from "react";
import { useShapes } from "../shapesStore";
import {
  SHAPES,
  LIGHT_HEIGHT,
  LIGHT_DISTANCE,
  OBJECT_RANGE,
  MAX_OBJECTS,
  elevationAngle,
} from "../shapes";

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

/** A small on/off pill. */
function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      className={`shapes-toggle ${checked ? "is-on" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span className="shapes-toggle__dot" />
      {label}
    </button>
  );
}

/**
 * One row of the cast list. The row selects; the dropdown re-shapes it in place;
 * the × removes it. Clicks inside the controls must not fall through to the row,
 * or changing a shape would also re-select its neighbour.
 */
function ObjectRow({ object, selected, onSelect, onType, onRemove, canRemove }) {
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
          </span>
        </span>
        <button
          type="button"
          className="shapes-item__del"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          disabled={!canRemove}
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
 * Top-down map. Seen from directly above, the bulb and the shadow vanishing point
 * sit on the same spot — which is the quickest way to grasp what the vanishing
 * point actually is. Every shape shows here too, so you can read the whole floor
 * at a glance.
 */
function TopViewGuide({ azimuth, distance, objects, selectedId }) {
  const scale = 42 / LIGHT_DISTANCE.max; // % of the radar per world unit
  const place = (x, z) => ({ left: `${50 + x * scale}%`, top: `${50 - z * scale}%` });

  const angle = (azimuth * Math.PI) / 180;
  const light = place(distance * Math.sin(angle), distance * Math.cos(angle));

  return (
    <div className="shapes-guide">
      <div className="shapes-guide__label">Top view</div>
      <div className="shapes-guide__radar">
        <div className="shapes-guide__ring" />
        <div
          className="shapes-guide__beam"
          style={{
            transform: `translate(-50%, -100%) rotate(${azimuth}deg)`,
            height: `${distance * scale}%`,
          }}
        />
        {objects.map((object) => (
          <div
            key={object.id}
            className={`shapes-guide__shape ${object.id === selectedId ? "is-on" : ""}`}
            style={place(object.position[0], object.position[1])}
          />
        ))}
        <div className="shapes-guide__light" style={light} />
        <div className="shapes-guide__sun" style={light}>
          Light / VP
        </div>
      </div>
      <p className="shapes-guide__hint">From above, the bulb and its vanishing point overlap.</p>
    </div>
  );
}

/** The cast of shapes, plus the single light that reveals them. */
export function ShapesPanel() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const autoFit = useShapes((s) => s.autoFit);
  const showGuides = useShapes((s) => s.showGuides);
  const showLabels = useShapes((s) => s.showLabels);
  const setAzimuth = useShapes((s) => s.setAzimuth);
  const setHeight = useShapes((s) => s.setHeight);
  const setDistance = useShapes((s) => s.setDistance);
  const setAutoFit = useShapes((s) => s.setAutoFit);
  const addObject = useShapes((s) => s.addObject);
  const removeObject = useShapes((s) => s.removeObject);
  const selectObject = useShapes((s) => s.selectObject);
  const setObjectType = useShapes((s) => s.setObjectType);
  const centerSelected = useShapes((s) => s.centerSelected);
  const toggleGuides = useShapes((s) => s.toggleGuides);
  const toggleLabels = useShapes((s) => s.toggleLabels);
  const setPanelInset = useShapes((s) => s.setPanelInset);

  const [adding, setAdding] = useState(SHAPES[0].type);
  const full = objects.length >= MAX_OBJECTS;
  const selected = objects.find((o) => o.id === selectedId) ?? null;
  const offset = selected ? Math.hypot(selected.position[0], selected.position[1]) : 0;

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
          Drag a shape in the scene to walk it around the floor. The one you pick gets the full construction; the rest
          keep their shadow outline.
        </p>

        <ul className="shapes-list">
          {objects.map((object) => (
            <ObjectRow
              key={object.id}
              object={object}
              selected={object.id === selectedId}
              canRemove={objects.length > 1}
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
            disabled={full}
          >
            {SHAPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="shapes-btn" onClick={() => addObject(adding)} disabled={full}>
            + Add
          </button>
        </div>

        <div className="shapes-row">
          <button
            type="button"
            className="shapes-btn"
            onClick={centerSelected}
            disabled={!selected || offset < 0.01}
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
          Drag the bulb — or the amber mark on the floor — to swing the light. Rays fan out from the bulb, graze each
          shape and land on the floor. Drop a vertical from the bulb and you get the <b>shadow vanishing point</b>: the
          amber mark every shadow line radiates from.
        </p>
        <TopViewGuide azimuth={azimuth} distance={distance} objects={objects} selectedId={selectedId} />
        <Slider label="Top angle" value={azimuth} min={0} max={360} step={1} onChange={setAzimuth} fmt={(v) => `${v}°`} />
        <Slider
          label="Bulb height"
          value={height}
          min={LIGHT_HEIGHT.min}
          max={LIGHT_HEIGHT.max}
          step={LIGHT_HEIGHT.step}
          onChange={setHeight}
          fmt={(v) => v.toFixed(1)}
        />
        <Slider
          label="Floor distance"
          value={distance}
          min={LIGHT_DISTANCE.min}
          max={LIGHT_DISTANCE.max}
          step={LIGHT_DISTANCE.step}
          onChange={setDistance}
          fmt={(v) => v.toFixed(1)}
        />
        <div className="shapes-readout">
          <span>{`top ${azimuth.toFixed(0)}°`}</span>
          <span>{`high ${height.toFixed(1)}`}</span>
          <span>{`angle ${elevationAngle(height, distance).toFixed(0)}°`}</span>
        </div>
      </section>

      <section className="shapes-stack">
        <h2 className="shapes-sec">View</h2>
        <div className="shapes-toggles">
          <Toggle label="Auto-fit view" checked={autoFit} onChange={() => setAutoFit(!autoFit)} />
          <Toggle label="Construction lines" checked={showGuides} onChange={toggleGuides} />
          <Toggle label="Labels" checked={showLabels} onChange={toggleLabels} />
        </div>
        <p className="shapes-note">
          Auto-fit keeps the bulb, every shape and the whole shadow on screen, clear of this panel. Orbiting or zooming
          hands the camera back to you — switch it on again to re-frame.
        </p>
      </section>

      <footer className="shapes-foot">
        Add a few shapes and spread them out: the near ones cast short shadows, the far ones long — and every one of
        those shadows still points home to the same <b>vanishing point</b>.
      </footer>
    </aside>
  );
}
