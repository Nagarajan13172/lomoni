import { Loader } from "@react-three/drei";
import { Studio } from "../mannequin/scene/Studio";
import { ControlPanel } from "../mannequin/ui/ControlPanel";
import { StudioToolbar } from "../mannequin/ui/StudioToolbar";
import { useStore } from "../mannequin/store";
import "../mannequin/mannequin.css";

/**
 * "Pose Studio" — the wooden-mannequin tool, embedded as a section of the
 * LOMONI site. Styling is scoped under `.mq-root` so it stays isolated from the
 * surrounding Tailwind theme.
 */
export default function PoseStudio() {
  // Hoisted to the root so a locked frame reads on the stage itself, not only on
  // the toolbar button.
  const locked = useStore((s) => s.locked);

  return (
    <div className={"mq-root" + (locked ? " mq-root--locked" : "")} data-ui="light">
      <div className="stage">
        <Studio />
      </div>
      <StudioToolbar />
      <ControlPanel />
      <Loader
        containerStyles={{ background: "rgba(10,12,18,0.9)" }}
        barStyles={{ background: "linear-gradient(90deg,#ff2e88,#ffc23c)" }}
        dataStyles={{
          color: "#e7ecff",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}
        dataInterpolation={(p) => `Carving the mannequin… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
