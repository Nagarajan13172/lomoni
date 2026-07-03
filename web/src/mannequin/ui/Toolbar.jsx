import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";

const LS_KEY = "maniqu.poses";

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function Toolbar() {
  const ready = useStore((s) => s.ready);
  const resetAll = useStore((s) => s.resetAll);
  const mirror = useStore((s) => s.mirror);
  const randomize = useStore((s) => s.randomize);
  const toggleHandles = useStore((s) => s.toggleHandles);
  const showHandles = useStore((s) => s.showHandles);
  const getPose = useStore((s) => s.getPose);
  const queuePose = useStore((s) => s.queuePose);
  const gl = useStore((s) => s.gl);

  const [saved, setSaved] = useState({});
  const fileRef = useRef();

  useEffect(() => setSaved(loadSaved()), []);

  const persist = (next) => {
    setSaved(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const savePose = () => {
    const name = window.prompt("Name this pose:", "My pose");
    if (!name) return;
    persist({ ...saved, [name]: getPose() });
  };

  const deletePose = (name) => {
    const next = { ...saved };
    delete next[name];
    persist(next);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(getPose(), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "maniqu-pose.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        queuePose(JSON.parse(reader.result), { additive: false });
      } catch {
        alert("That file isn't a valid pose JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const screenshot = () => {
    if (!gl) return;
    const url = gl.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "maniqu-queen.png";
    a.click();
  };

  return (
    <div className="toolbar">
      <div className="toolbar__grid">
        <button className="mq-btn" disabled={!ready} onClick={resetAll}>
          ↺ Reset all
        </button>
        <button className="mq-btn" disabled={!ready} onClick={randomize}>
          🎲 Randomize
        </button>
        <button className="mq-btn" disabled={!ready} onClick={() => mirror("l2r")}>
          ⇄ Mirror L→R
        </button>
        <button className="mq-btn" disabled={!ready} onClick={() => mirror("r2l")}>
          ⇄ Mirror R→L
        </button>
        <button
          className={"mq-btn" + (showHandles ? " mq-btn--on" : "")}
          onClick={toggleHandles}
        >
          {showHandles ? "◉" : "○"} Joint dots
        </button>
        <button className="mq-btn" disabled={!ready} onClick={screenshot}>
          📷 Screenshot
        </button>
      </div>

      <div className="toolbar__grid">
        <button className="mq-btn" disabled={!ready} onClick={savePose}>
          💾 Save pose
        </button>
        <button className="mq-btn" disabled={!ready} onClick={exportJSON}>
          ⬇ Export JSON
        </button>
        <button
          className="mq-btn"
          disabled={!ready}
          onClick={() => fileRef.current?.click()}
        >
          ⬆ Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={importJSON}
        />
      </div>

      {Object.keys(saved).length > 0 && (
        <div className="saved">
          <div className="saved__title">Saved poses</div>
          {Object.keys(saved).map((name) => (
            <div className="saved__row" key={name}>
              <button
                className="saved__load"
                onClick={() => queuePose(saved[name], { additive: false })}
                title="Load this pose"
              >
                {name}
              </button>
              <button
                className="saved__del"
                onClick={() => deletePose(name)}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
