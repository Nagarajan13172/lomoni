import { TransformControls } from "@react-three/drei";
import { useStore } from "../store";

/**
 * A rotation gizmo attached to the currently-selected bone. Drag the coloured
 * rings to bend that joint directly in 3D. drei's TransformControls auto-pauses
 * the default OrbitControls while you drag, so the camera stays put.
 */
export function PoseGizmo() {
  const bones = useStore((s) => s.bones);
  const selected = useStore((s) => s.selected);
  const bump = useStore((s) => s.bump);
  const bone = selected ? bones[selected] : null;

  if (!bone) return null;

  return (
    <TransformControls
      object={bone}
      mode="rotate"
      space="local"
      size={0.75}
      // Re-ground only on release: the mesh deforms live via the render loop and
      // the DOM sliders read the bone directly, so no per-frame bump is needed.
      onMouseUp={() => bump()}
    />
  );
}
