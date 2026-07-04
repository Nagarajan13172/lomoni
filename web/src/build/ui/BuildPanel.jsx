import { useBuild } from "../buildStore";
import { BRICKS, COLORS } from "../bricks";

/** Palette + colours + actions for the block builder. */
export function BuildPanel() {
  const type = useBuild((s) => s.type);
  const setType = useBuild((s) => s.setType);
  const color = useBuild((s) => s.color);
  const setColor = useBuild((s) => s.setColor);
  const rot = useBuild((s) => s.rot);
  const rotate = useBuild((s) => s.rotate);
  const undo = useBuild((s) => s.undo);
  const clear = useBuild((s) => s.clear);
  const count = useBuild((s) => s.blocks.length);

  return (
    <aside className="build-panel">
      <header className="build-panel__head">
        <div className="build-panel__logo">🧱</div>
        <div>
          <h1 className="build-panel__title">Brick Builder</h1>
          <p className="build-panel__sub">
            {count} brick{count === 1 ? "" : "s"} placed
          </p>
        </div>
      </header>

      <section>
        <h2 className="build-sec">Brick</h2>
        <div className="build-grid">
          {Object.entries(BRICKS).map(([id, b]) => (
            <button
              key={id}
              className={"build-chip" + (type === id ? " build-chip--on" : "")}
              onClick={() => setType(id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="build-sec">Colour</h2>
        <div className="build-swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              className={"build-sw" + (color === c ? " build-sw--on" : "")}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </section>

      <section className="build-actions">
        <button className="build-btn" onClick={rotate}>⟳ Rotate ({rot}°)</button>
        <button className="build-btn" onClick={undo}>↶ Undo</button>
        <button className="build-btn build-btn--danger" onClick={clear}>🗑 Clear all</button>
      </section>

      <footer className="build-foot">
        Click the baseplate to drop a brick · drag to orbit · scroll to zoom · press <b>R</b> to rotate
      </footer>
    </aside>
  );
}
