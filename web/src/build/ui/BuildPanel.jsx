import { useRef, useState } from "react";
import { useBuild } from "../buildStore";
import { BRICKS, COLORS, PIECE_CATEGORIES } from "../bricks";
import { encodeShare, toFile, fromFile } from "../persist";

/** Palette + colours + actions for the block builder. */
export function BuildPanel() {
  const type = useBuild((s) => s.type);
  const setType = useBuild((s) => s.setType);
  const [pcat, setPcat] = useState("Bricks");

  // Switching category selects its first piece, so the held piece (and the
  // ghost preview) changes to a plate/tile immediately — not just the list.
  const pickCat = (c) => {
    setPcat(c);
    const first = Object.keys(BRICKS).find((id) => BRICKS[id].cat === c);
    if (first) setType(first);
  };
  const color = useBuild((s) => s.color);
  const setColor = useBuild((s) => s.setColor);
  const rot = useBuild((s) => s.rot);
  const rotate = useBuild((s) => s.rotate);
  const undo = useBuild((s) => s.undo);
  const clear = useBuild((s) => s.clear);
  const count = useBuild((s) => s.blocks.length);
  const mode = useBuild((s) => s.mode);
  const setMode = useBuild((s) => s.setMode);
  const load = useBuild((s) => s.load);

  const fileRef = useRef(null);
  const [note, setNote] = useState("");
  const flash = (m) => {
    setNote(m);
    setTimeout(() => setNote(""), 1800);
  };

  const screenshot = () => {
    const gl = useBuild.getState().gl;
    if (!gl) return;
    const a = document.createElement("a");
    a.href = gl.domElement.toDataURL("image/png");
    a.download = "my-build.png";
    a.click();
  };

  const share = async () => {
    const enc = encodeShare(useBuild.getState().blocks);
    const url = `${location.origin}${location.pathname}#b=${enc}`;
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied!");
    } catch {
      flash("Copy failed");
    }
  };

  const exportFile = () => {
    const blob = new Blob([toFile(useBuild.getState().blocks)], { type: "application/json" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "my-build.json";
    a.click();
    URL.revokeObjectURL(u);
  };

  const onImport = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const blocks = fromFile(r.result);
      if (blocks) {
        load(blocks);
        flash("Loaded!");
      } else flash("Bad file");
    };
    r.readAsText(f);
  };

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
              onClick={() => pickCat(c)}
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

      <section className="build-actions">
        <h2 className="build-sec">Save &amp; share</h2>
        <button className="build-btn" onClick={share}>🔗 Copy share link</button>
        <button className="build-btn" onClick={screenshot}>📷 Screenshot</button>
        <div className="build-row">
          <button className="build-btn" onClick={exportFile}>⬇ Export</button>
          <button className="build-btn" onClick={() => fileRef.current?.click()}>⬆ Import</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onImport}
          style={{ display: "none" }}
        />
        {note && <div className="build-note">{note}</div>}
        <p className="build-hint">Your build auto-saves — it'll be here when you come back.</p>
      </section>

      <footer className="build-foot">
        {mode === "delete"
          ? "Click a brick to remove it · drag to orbit · scroll to zoom"
          : "Click to drop a brick · stacks on top of what you point at · drag to orbit · press R to rotate"}
      </footer>
    </aside>
  );
}
