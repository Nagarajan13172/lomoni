import { Loader } from "@react-three/drei";
import { ShapesStudio } from "../shapes/ShapesStudio";
import { ShapesPanel } from "../shapes/ui/ShapesPanel";
import "../shapes/shapes.css";

/**
 * "Shapes" — a free-play lighting studio. A gallery of primitive shapes sits on
 * a floor while you drive a single movable sun to watch them shade and cast
 * shadows. Everything is scoped under `.shapes-root`.
 */
export default function Shapes() {
  return (
    <div className="shapes-root">
      <div className="shapes-stage">
        <ShapesStudio />
      </div>
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
