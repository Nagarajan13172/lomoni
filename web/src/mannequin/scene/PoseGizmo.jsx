import { useEffect, useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { useStore } from "../store";

/**
 * A rotation gizmo attached to the currently-selected bone. Drag the coloured
 * rings to bend that joint directly in 3D. drei's TransformControls auto-pauses
 * the default OrbitControls while you drag, so the camera stays put.
 *
 * The gizmo is enlarged (size) and its ring lines fattened where the GL allows.
 * Note: WebGL caps gl.lineWidth at 1px on most desktop GPUs, so the main lever
 * for a "thicker" look is the larger size below.
 */
export function PoseGizmo() {
  const bones = useStore((s) => s.bones);
  const selected = useStore((s) => s.selected);
  const bump = useStore((s) => s.bump);
  const bone = selected ? bones[selected] : null;
  const ref = useRef();

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    // The visual gizmo lives on the controls' helper in three ≥ r166 (the
    // controls object itself is not an Object3D there, so guard traverse).
    const helper = controls.getHelper ? controls.getHelper() : controls;
    if (!helper?.traverse) return;
    helper.traverse((o) => {
      const m = o.material;
      if (!m) return;
      if (m.linewidth !== undefined) m.linewidth = 6; // best-effort (GL may cap)
      if (o.type === "Line" && m.opacity !== undefined) m.opacity = 1; // bolder rings
    });
  }, [bone]);

  if (!bone) return null;

  return (
    <TransformControls
      ref={ref}
      object={bone}
      mode="rotate"
      space="local"
      size={1.35}
      // Re-ground only on release: the mesh deforms live via the render loop and
      // the DOM sliders read the bone directly, so no per-frame bump is needed.
      onMouseUp={() => bump()}
    />
  );
}
