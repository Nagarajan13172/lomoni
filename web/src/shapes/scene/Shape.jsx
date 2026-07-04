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
  const setGuideFrame = useShapes((s) => s.setGuideFrame);
  const def = SHAPES.find((x) => x.type === type) ?? SHAPES[0];

  const mesh = useRef();
  const [lift, setLift] = useState(1); // base offset so the shape sits on the floor

  useLayoutEffect(() => {
    const g = mesh.current?.geometry;
    if (!g) return;
    g.computeBoundingBox();
    const { min, max } = g.boundingBox;
    const nextLift = -min.y;
    const pos = g.getAttribute("position");
    const stride = Math.max(1, Math.floor(pos.count / 220));
    const seen = new Set();
    const points = [];
    let topPoint = [0, max.y + nextLift, 0];

    for (let i = 0; i < pos.count; i += stride) {
      const point = [
        pos.getX(i),
        pos.getY(i) + nextLift,
        pos.getZ(i),
      ];
      const key = `${point[0].toFixed(3)}|${point[1].toFixed(3)}|${point[2].toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(point);
      if (point[1] > topPoint[1]) topPoint = point;
    }

    setLift(nextLift);
    setGuideFrame({
      points,
      center: [0, (max.y + nextLift) * 0.5, 0],
      topPoint,
    });

    return () => setGuideFrame(null);
  }, [def, setGuideFrame]);

  return (
    <mesh ref={mesh} position={[0, lift, 0]} castShadow receiveShadow>
      {createElement(def.geom[0], { args: def.geom[1] })}
      <meshStandardMaterial color={def.color} metalness={0.15} roughness={0.4} />
    </mesh>
  );
}
