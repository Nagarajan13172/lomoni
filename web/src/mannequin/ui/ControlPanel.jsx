import { useState } from "react";
import { AccordionSection } from "./Accordion";
import { Presets } from "./Presets";
import { PoseLibrary } from "./PoseLibrary";
import { JointList } from "./JointList";
import { JointInspector } from "./JointInspector";
import { POSE_LIBRARY } from "../pose/poseLibrary";
import { useStore } from "../store";

export function ControlPanel() {
  const ready = useStore((s) => s.ready);
  const resetAll = useStore((s) => s.resetAll);
  const mirror = useStore((s) => s.mirror);
  const randomize = useStore((s) => s.randomize);
  const showHandles = useStore((s) => s.showHandles);
  const toggleHandles = useStore((s) => s.toggleHandles);
  const gl = useStore((s) => s.gl);
  const [open, setOpen] = useState(true);

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
      <button
        className={"panel-toggle" + (open ? "" : " panel-toggle--closed")}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle controls"
      >
        {open ? "✕" : "☰"}
      </button>

      <aside className={"panel" + (open ? "" : " panel--closed")}>
        <header className="panel__brand">
          <div className="panel__logo">♛</div>
          <div>
            <h1 className="panel__title">Maniqu Queen</h1>
            <p className="panel__sub">
              {ready ? "Pose studio · React Three Fiber" : "Loading rig…"}
            </p>
          </div>
        </header>

        <div className="panel__scroll">
          <AccordionSection title="Pose library" icon="🧍" badge={POSE_LIBRARY.length} defaultOpen>
            <PoseLibrary />
          </AccordionSection>

          <AccordionSection title="Quick poses" icon="⚡">
            <Presets />
          </AccordionSection>

          <AccordionSection title="Edit joints (bend by hand)" icon="🎯">
            <div className="acc-sub">Joints</div>
            <JointList />
            <div className="acc-sub" style={{ marginTop: 12 }}>Selected joint</div>
            <JointInspector />
          </AccordionSection>

          <AccordionSection title="Actions" icon="🛠️">
            <div className="toolbar__grid">
              <button className="mq-btn" disabled={!ready} onClick={resetAll}>
                ↺ Reset all
              </button>
              <button
                className={"mq-btn" + (showHandles ? " mq-btn--on" : "")}
                onClick={toggleHandles}
              >
                {showHandles ? "◉" : "○"} Joint dots
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
