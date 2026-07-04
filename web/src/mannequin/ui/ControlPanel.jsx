import { useState } from "react";
import { AccordionSection } from "./Accordion";
import { Presets } from "./Presets";
import { PoseLibrary } from "./PoseLibrary";
import { CharacterLibrary } from "./CharacterLibrary";
import { Customize } from "./Customize";
import { POSE_LIBRARY } from "../pose/poseLibrary";
import { CHARACTERS } from "../character/characters";
import { useStore } from "../store";

export function ControlPanel() {
  const ready = useStore((s) => s.ready);
  const resetAll = useStore((s) => s.resetAll);
  const mirror = useStore((s) => s.mirror);
  const randomize = useStore((s) => s.randomize);
  const setShowHandles = useStore((s) => s.setShowHandles);
  const select = useStore((s) => s.select);
  const gl = useStore((s) => s.gl);
  const [open, setOpen] = useState(true);
  const [mode, setModeState] = useState("poses"); // "poses" | "customize"

  // The mode toggle IS the on-character grab-dots switch: Customize shows the
  // dots + gizmo; Poses hides them and drops any joint selection.
  const setMode = (m) => {
    setModeState(m);
    setShowHandles(m === "customize");
    if (m !== "customize") select(null);
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
    <>
      {/* Floating re-open button — only shown when the panel is collapsed, so
          there's still a way back once the close (✕) button has slid off with
          the panel. */}
      {!open && (
        <button
          className="panel-toggle panel-toggle--closed"
          onClick={() => setOpen(true)}
          aria-label="Open controls"
        >
          ☰
        </button>
      )}

      <aside className={"panel" + (open ? "" : " panel--closed")}>
        <header className="panel__brand">
          <div className="panel__logo">♛</div>
          <div>
            <h1 className="panel__title">Maniqu Queen</h1>
            <p className="panel__sub">
              {ready ? "Pose studio · React Three Fiber" : "Loading rig…"}
            </p>
          </div>
          <button
            className="panel__close"
            onClick={() => setOpen(false)}
            aria-label="Close controls"
          >
            ✕
          </button>
        </header>

        <div className="panel__scroll">
          <AccordionSection title="Characters" icon="🎭" badge={CHARACTERS.length} defaultOpen>
            <CharacterLibrary />
          </AccordionSection>

          {/* Mode toggle: pick library poses, or customize joints by hand */}
          <div className="modeswitch">
            <button
              className={"modeswitch__btn" + (mode === "poses" ? " modeswitch__btn--on" : "")}
              onClick={() => setMode("poses")}
            >
              🧍 Poses
            </button>
            <button
              className={"modeswitch__btn" + (mode === "customize" ? " modeswitch__btn--on" : "")}
              disabled={!ready}
              onClick={() => setMode("customize")}
            >
              🎯 Customize
            </button>
          </div>

          {mode === "poses" ? (
            <>
              <AccordionSection title="Pose library" icon="🧍" badge={POSE_LIBRARY.length} defaultOpen>
                <PoseLibrary />
              </AccordionSection>

              <AccordionSection title="Quick poses" icon="⚡">
                <Presets />
              </AccordionSection>
            </>
          ) : (
            <AccordionSection title="Customize pose" icon="🎯" defaultOpen>
              <Customize />
            </AccordionSection>
          )}

          <AccordionSection title="Actions" icon="🛠️">
            <div className="toolbar__grid">
              <button className="mq-btn" disabled={!ready} onClick={resetAll}>
                ↺ Reset all
              </button>
              <button className="mq-btn" disabled={!ready} onClick={() => mirror("l2r")}>
                ⇄ Mirror L→R
              </button>
              <button className="mq-btn" disabled={!ready} onClick={randomize}>
                🎲 Randomize
              </button>
              <button className="mq-btn" disabled={!ready} onClick={screenshot}>
                📷 Screenshot
              </button>
            </div>
          </AccordionSection>
        </div>

        <footer className="panel__foot">
          Click a pose, or a dot to bend by hand · scroll to zoom
        </footer>
      </aside>
    </>
  );
}
