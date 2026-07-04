import { Loader } from "@react-three/drei";
import { BuildStudio } from "../build/BuildStudio";
import { BuildPanel } from "../build/ui/BuildPanel";
import "../build/build.css";

/**
 * "Build" — a free-play Lego-style brick builder, embedded as a section of the
 * LOMONI site. Everything is scoped under `.build-root`.
 */
export default function Build() {
  return (
    <div className="build-root">
      <div className="build-stage">
        <BuildStudio />
      </div>
      <BuildPanel />
      <Loader
        containerStyles={{ background: "rgba(10,12,18,0.9)" }}
        barStyles={{ background: "linear-gradient(90deg,#ff2e88,#ffc23c)" }}
        dataStyles={{ color: "#e7ecff", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
        dataInterpolation={(p) => `Snapping bricks… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
