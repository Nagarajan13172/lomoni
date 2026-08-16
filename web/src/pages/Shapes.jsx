import { Loader } from "@react-three/drei";
import { ShapesStudio } from "../shapes/ShapesStudio";
import { ShapesPanel } from "../shapes/ui/ShapesPanel";
import { ShapesToolbar } from "../shapes/ui/ShapesToolbar";
import { useShapes } from "../shapes/shapesStore";
import "../shapes/shapes.css";

/**
 * "Shapes" — a free-play lighting studio. A cast of primitive shapes stands on a
 * floor while you drive a single movable bulb to watch them shade and cast
 * shadows. Everything is scoped under `.shapes-root`.
 */
export default function Shapes() {
  // Hoisted to the root so a locked frame can be shown on the stage itself,
  // not only on the toolbar button.
  const locked = useShapes((s) => s.locked);

  return (
    <div className={`shapes-root ${locked ? "is-locked" : ""}`}>
      <div className="shapes-stage">
        <ShapesStudio />
      </div>
      <ShapesToolbar />
      <ShapesPanel />
      <Loader
        containerStyles={{ background: "rgba(10,12,18,0.9)" }}
        barStyles={{ background: "linear-gradient(90deg,#8b5cf6,#22d3ee)" }}
        dataStyles={{ color: "#e7ecff", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
        dataInterpolation={(p) => `Casting light… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
