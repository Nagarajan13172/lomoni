import { createElement, useLayoutEffect, useRef, useState } from "react";
import { useShapes } from "../shapesStore";
import { SHAPES } from "../shapes";

/**
 * The single shape on display, centred on the floor. Its geometry is built
 * generically from the catalog's [tag, args] pair; on mount we read the
 * bounding box and lift it so its base rests exactly on the floor (y=0). Casts
 * and receives shadows so the light actually paints a shadow beneath it.
 */
export function Shape() {
  const type = useShapes((s) => s.shape);
  const def = SHAPES.find((x) => x.type === type) ?? SHAPES[0];

  const mesh = useRef();
  const [lift, setLift] = useState(1); // base offset so the shape sits on the floor

  useLayoutEffect(() => {
    const g = mesh.current?.geometry;
    if (!g) return;
    g.computeBoundingBox();
    setLift(-g.boundingBox.min.y);
  }, [def]);

  return (
    <mesh ref={mesh} position={[0, lift, 0]} castShadow receiveShadow>
      {createElement(def.geom[0], { args: def.geom[1] })}
      <meshStandardMaterial color={def.color} metalness={0.15} roughness={0.4} />
    </mesh>
  );
}
