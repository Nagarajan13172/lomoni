import { useState } from "react";
import { Presets } from "./Presets";
import { PoseLibrary } from "./PoseLibrary";
import { JointList } from "./JointList";
import { JointInspector } from "./JointInspector";
import { Toolbar } from "./Toolbar";
import { ModelPanel } from "./ModelPanel";
import { ScenePanel } from "./ScenePanel";
import { useStore } from "../store";

const TABS = [
  { id: "poses", label: "Poses", icon: "🧍" },
  { id: "edit", label: "Edit", icon: "🎯" },
  { id: "model", label: "Model", icon: "🎨" },
  { id: "scene", label: "Scene", icon: "🎬" },
];

export function ControlPanel() {
  const ready = useStore((s) => s.ready);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("poses");

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

        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={"tab" + (tab === t.id ? " tab--active" : "")}
              onClick={() => setTab(t.id)}
            >
              <span className="tab__icon">{t.icon}</span>
              <span className="tab__label">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="panel__scroll">
          {tab === "poses" && (
            <>
              <section className="section">
                <h2 className="section__title">Quick poses</h2>
                <Presets />
              </section>
              <section className="section">
                <h2 className="section__title">Pose library</h2>
                <PoseLibrary />
              </section>
            </>
          )}

          {tab === "edit" && (
            <>
              <section className="section">
                <h2 className="section__title">Joints</h2>
                <JointList />
              </section>
              <section className="section">
                <h2 className="section__title">Selected joint</h2>
                <JointInspector />
              </section>
              <section className="section">
                <h2 className="section__title">Actions</h2>
                <Toolbar />
              </section>
            </>
          )}

          {tab === "model" && <ModelPanel />}
          {tab === "scene" && <ScenePanel />}
        </div>

        <footer className="panel__foot">
          Drag empty space to orbit · scroll to zoom
        </footer>
      </aside>
    </>
  );
}
