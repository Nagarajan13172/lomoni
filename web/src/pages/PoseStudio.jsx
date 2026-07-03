import { Loader } from "@react-three/drei";
import { useSearchParams } from "react-router-dom";
import { Studio } from "../mannequin/scene/Studio";
import { ControlPanel } from "../mannequin/ui/ControlPanel";
import { useStore } from "../mannequin/store";
import { getTheme } from "../mannequin/scene/themes";
import "../mannequin/mannequin.css";

/**
 * "Pose Studio" — the wooden-mannequin tool, embedded as a section of the
 * LOMONI site. All of its styling is scoped under `.mq-root`, so it stays
 * isolated from the surrounding Tailwind theme.
 *
 * `?ui=0` hides the chrome for clean screenshots / deep-linked renders.
 */
export default function PoseStudio() {
  const [sp] = useSearchParams();
  const thumb = sp.get("thumb") === "1";
  const chrome = sp.get("ui") !== "0" && !thumb;
  const themeId = useStore((s) => s.theme);
  const uiSkin = getTheme(themeId).ui;

  return (
    <div className="mq-root" data-ui={uiSkin} data-thumb={thumb ? "1" : undefined}>
      {thumb && (
        // Transparent page + hide the site navbar so thumbnail PNGs are clean.
        <style>{`html,body,#root{background:transparent!important} header{display:none!important} .mq-root[data-thumb="1"]{background:transparent!important;height:100dvh!important}`}</style>
      )}
      <div className="stage">
        <Studio />
      </div>
      {chrome && <ControlPanel />}
      {!thumb && (
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
      )}
    </div>
  );
}
