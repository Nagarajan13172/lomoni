import { useState } from "react";
import { TransformControls } from "@react-three/drei";
import { useStore } from "../store";
import { PROPS } from "./propRegistry";

/**
 * Renders the currently-selected floor prop, built from three.js primitives
 * (no external assets). When the joint dots are visible (edit mode) the prop
 * gets a translate gizmo so it can be slid into place under/around the figure.
 */
export function Props() {
  const propId = useStore((s) => s.propId);
  const showHandles = useStore((s) => s.showHandles);
  const hideFigure = useStore((s) => s.hideFigure); // true in prop-thumbnail renders
  const [obj, setObj] = useState(null);

  const entry = PROPS.find((p) => p.id === propId);
  if (!entry || !entry.Component) return null;
  const C = entry.Component;
  const t = entry.defaultTransform || {};
  // Center the prop at the origin for a clean thumbnail; use its default
  // placement (near the figure) in the live studio.
  const position = hideFigure ? [0, 0, 0] : t.position || [0, 0, 0];

  return (
    <>
      <group
        key={propId}
        ref={setObj}
        position={position}
        rotation={t.rotation || [0, 0, 0]}
        scale={t.scale ?? 1}
      >
        <C />
      </group>
      {showHandles && obj && !hideFigure && (
        <TransformControls object={obj} mode="translate" showY={false} size={0.7} />
      )}
    </>
  );
}
