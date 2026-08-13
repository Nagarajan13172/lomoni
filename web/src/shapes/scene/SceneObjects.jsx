import { createElement, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useShapes } from "../shapesStore";
import { SHAPES } from "../shapes";
import { useFloorDrag } from "./useFloorDrag";

/** Radius of the ring drawn under a shape, from its own footprint. */
function footprint(frame) {
  if (!frame) return 2;
  const { min, max } = frame.bounds;
  return Math.max(Math.hypot(Math.max(-min[0], max[0]), Math.max(-min[2], max[2])) * 1.18, 1.2);
}

/**
 * One shape standing on the floor. On mount we read its bounding box and lift it
 * so the base rests exactly on y = 0, then cache a sample of its vertices for the
 * construction lines.
 *
 * Those samples stay in the SHAPE'S OWN SPACE and are cached per type, so walking
 * a shape around costs one position update rather than re-walking a few hundred
 * vertices, and a second cube reuses the first one's sample.
 */
function SceneShape({ object, selected }) {
  const setShapeFrame = useShapes((s) => s.setShapeFrame);
  const setObjectPosition = useShapes((s) => s.setObjectPosition);
  const selectObject = useShapes((s) => s.selectObject);
  const frame = useShapes((s) => s.shapeFrames[object.type]);
  const def = SHAPES.find((x) => x.type === object.type) ?? SHAPES[0];

  const mesh = useRef();
  const [lift, setLift] = useState(1); // base offset so the shape sits on the floor

  // Grab offset, so a shape does not snap its centre under the cursor.
  const grab = useRef([0, 0]);
  const { handlers, active, hovered } = useFloorDrag({
    enabled: true,
    onStart: (x, z) => {
      selectObject(object.id);
      grab.current = [x - object.position[0], z - object.position[1]];
    },
    onMove: (x, z) => setObjectPosition(object.id, x - grab.current[0], z - grab.current[1]),
  });

  useLayoutEffect(() => {
    const geometry = mesh.current?.geometry;
    if (!geometry) return;
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const nextLift = -min.y;
    setLift(nextLift);

    const pos = geometry.getAttribute("position");
    const stride = Math.max(1, Math.floor(pos.count / 220));
    const seen = new Set();
    const points = [];
    let topPoint = [0, max.y + nextLift, 0];

    for (let i = 0; i < pos.count; i += stride) {
      const point = [pos.getX(i), pos.getY(i) + nextLift, pos.getZ(i)];
      const key = `${point[0].toFixed(3)}|${point[1].toFixed(3)}|${point[2].toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(point);
      if (point[1] > topPoint[1]) topPoint = point;
    }

    setShapeFrame(object.type, {
      points,
      topPoint,
      bounds: { min: [min.x, 0, min.z], max: [max.x, max.y + nextLift, max.z] },
    });
  }, [object.type, setShapeFrame]);

  const ring = footprint(frame);

  return (
    <group position={[object.position[0], 0, object.position[1]]}>
      <mesh ref={mesh} position={[0, lift, 0]} castShadow receiveShadow {...handlers}>
        {createElement(def.geom[0], { args: def.geom[1] })}
        <meshStandardMaterial color={def.color} metalness={0.15} roughness={0.4} />
      </mesh>

      {/* Selection / grab affordance. */}
      {(selected || hovered || active) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={17}>
          <ringGeometry args={[ring, ring + 0.17, 56]} />
          <meshBasicMaterial
            color={selected ? "#2f6f6a" : "#7a8494"}
            transparent
            opacity={active ? 0.9 : selected ? 0.66 : 0.4}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Every shape currently on the floor. */
export function SceneObjects() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);

  return useMemo(
    () => objects.map((object) => <SceneShape key={object.id} object={object} selected={object.id === selectedId} />),
    [objects, selectedId],
  );
}
