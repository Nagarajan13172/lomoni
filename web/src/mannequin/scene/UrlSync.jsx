import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useThree } from "@react-three/fiber";
import { useStore } from "../store";

/**
 * Deep-linking + headless-render harness. Reads URL query params and drives the
 * scene, so a pose/view/theme can be shared or screenshotted reproducibly:
 *   ?pose=<base64 JSON offsets>   apply a pose (additive from rest)
 *   ?view=front|back|side|left|3q|top   camera framing
 *   ?theme=light|dark|blueprint   studio theme
 */
export function UrlSync() {
  const [sp] = useSearchParams();
  const ready = useStore((s) => s.ready);
  const applyPose = useStore((s) => s.applyPose);
  const setTheme = useStore((s) => s.setTheme);
  const setShowHandles = useStore((s) => s.setShowHandles);
  const setMaterial = useStore((s) => s.setMaterial);
  const setProp = useStore((s) => s.setProp);
  const setHideFigure = useStore((s) => s.setHideFigure);
  const { camera, controls } = useThree();

  // Clean-render mode: hide the joint dots when chrome is off.
  useEffect(() => {
    if (sp.get("ui") === "0") setShowHandles(false);
  }, [sp, setShowHandles]);

  // Thumbnail render mode: grey clay figure, optional prop, optional no-figure.
  useEffect(() => {
    if (sp.get("thumb") === "1") setMaterial("clay");
    const prop = sp.get("prop");
    if (prop) setProp(prop);
    if (sp.get("hidefigure") === "1") setHideFigure(true);
  }, [sp, setMaterial, setProp, setHideFigure]);

  const queuePose = useStore((s) => s.queuePose);

  // Pose
  useEffect(() => {
    if (!ready) return;
    const p = sp.get("pose");
    if (!p) return;
    try {
      const json = p.trim().startsWith("{") ? p : atob(p);
      const pose = JSON.parse(json);
      // ?tween=1 routes through the smooth transition path (for debugging it);
      // ?dur=<seconds> slows it so a mid-transition frame can be captured.
      if (sp.get("tween") === "1") {
        const dur = parseFloat(sp.get("dur")) || 0.4;
        queuePose(pose, { additive: true, duration: dur });
      } else {
        applyPose(pose, { additive: true });
      }
    } catch (e) {
      /* ignore malformed pose param */
    }
  }, [ready, sp, applyPose]);

  // Theme
  useEffect(() => {
    const t = sp.get("theme");
    if (t) setTheme?.(t);
  }, [sp, setTheme]);

  // Camera view
  useEffect(() => {
    const v = sp.get("view");
    if (!v) return;
    const VIEWS = {
      front: [0, 1.5, 6.2],
      back: [0, 1.5, -6.2],
      side: [6.2, 1.5, 0],
      left: [-6.2, 1.5, 0],
      "3q": [3.4, 2.5, 5.6],
      top: [0.01, 8, 0.01],
    };
    const pos = VIEWS[v];
    if (!pos) return;
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(0, 1.4, 0);
    if (controls) {
      controls.target.set(0, 1.4, 0);
      controls.update?.();
    }
  }, [sp, camera, controls]);

  return null;
}
