import { useState } from "react";
import { useBuild } from "../buildStore";
import { BRICKS, COLORS, PIECE_CATEGORIES } from "../bricks";

/** Palette + colours + actions for the block builder. */
export function BuildPanel() {
  const type = useBuild((s) => s.type);
  const setType = useBuild((s) => s.setType);
  const [pcat, setPcat] = useState("Bricks");
  const color = useBuild((s) => s.color);
  const setColor = useBuild((s) => s.setColor);
  const rot = useBuild((s) => s.rot);
  const rotate = useBuild((s) => s.rotate);
  const undo = useBuild((s) => s.undo);
  const clear = useBuild((s) => s.clear);
  const count = useBuild((s) => s.blocks.length);
  const mode = useBuild((s) => s.mode);
  const setMode = useBuild((s) => s.setMode);

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

      <div className="build-modeswitch">
        <button
          className={"build-mode" + (mode === "place" ? " build-mode--on" : "")}
          onClick={() => setMode("place")}
        >
          🧱 Place
        </button>
        <button
          className={"build-mode" + (mode === "delete" ? " build-mode--on" : "")}
          onClick={() => setMode("delete")}
        >
          🗑 Delete
        </button>
      </div>

      <section style={{ opacity: mode === "delete" ? 0.4 : 1, pointerEvents: mode === "delete" ? "none" : "auto" }}>
        <h2 className="build-sec">Piece</h2>
        <div className="build-cats">
          {PIECE_CATEGORIES.map((c) => (
            <button
              key={c}
              className={"build-cat" + (pcat === c ? " build-cat--on" : "")}
              onClick={() => setPcat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="build-grid">
          {Object.entries(BRICKS)
            .filter(([, b]) => b.cat === pcat)
            .map(([id, b]) => (
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

      <section style={{ opacity: mode === "delete" ? 0.4 : 1, pointerEvents: mode === "delete" ? "none" : "auto" }}>
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
        {mode === "delete"
          ? "Click a brick to remove it · drag to orbit · scroll to zoom"
          : "Click to drop a brick · stacks on top of what you point at · drag to orbit · press R to rotate"}
      </footer>
    </aside>
  );
}
