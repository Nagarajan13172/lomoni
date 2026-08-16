import { createElement, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useShapes } from "../shapesStore";
import { SHAPES, OBJECT_LIFT, footprintRadius } from "../shapes";
import { useFloorDrag, SHAPE_PRIORITY } from "./useFloorDrag";

/** Radius of the ring drawn under a shape, from its own footprint. */
function footprint(frame) {
  if (!frame) return 2;
  return Math.max(footprintRadius(frame) * 1.34, 1.2);
}

/**
 * The spin ring: a turntable on the floor around the selected shape.
 *
 * It drags in the shape's OWN horizontal plane, not the floor's — otherwise a
 * lifted shape's ring and your cursor disagree by however high it is floating.
 * The notch on the rim shows which way the shape is facing.
 */
function SpinHandle({ object, radius }) {
  const setObjectRotation = useShapes((s) => s.setObjectRotation);
  const grab = useRef(0);
  const bearing = (x, z) => Math.atan2(x - object.position[0], z - object.position[1]);

  const { handlers, active, hovered } = useFloorDrag({
    enabled: true,
    mode: "level",
    anchor: [object.position[0], object.elevation, object.position[1]],
    priority: SHAPE_PRIORITY,
    onStart: (x, _y, z) => {
      grab.current = bearing(x, z) - object.rotation;
    },
    onMove: (x, _y, z) => setObjectRotation(object.id, bearing(x, z) - grab.current),
  });

  const lit = active || hovered;

  return (
    <group position={[0, 0.04, 0]}>
      {/* Grab area: an annulus, so pressing the shape itself still moves it. */}
      <mesh {...handlers} rotation={[-Math.PI / 2, 0, 0]} visible={false} userData={{ dragPriority: SHAPE_PRIORITY }}>
        <ringGeometry args={[radius - 0.45, radius + 0.45, 40]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={18}>
        <ringGeometry args={[radius, radius + (lit ? 0.14 : 0.09), 64]} />
        <meshBasicMaterial
          color={lit ? "#5fd3c7" : "#3f8a83"}
          transparent
          opacity={lit ? 0.95 : 0.6}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {/* Which way it is facing. */}
      <mesh position={[0, 0.01, radius + 0.34]} renderOrder={19}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color={lit ? "#5fd3c7" : "#3f8a83"} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}

/**
 * The lift handle: a collar above the selected shape that raises and lowers it.
 *
 * Same shape and behaviour as the bulb's height collar, for the same reason —
 * one grab, one job. Dragging the shape itself walks it across the floor; this
 * takes it up, and it snaps onto whatever it is standing over so a stack lands
 * square.
 */
function LiftHandle({ object, top }) {
  const setObjectElevation = useShapes((s) => s.setObjectElevation);
  const anchor = [object.position[0], object.elevation + top + 0.95, object.position[1]];
  const grab = useRef(0);

  const { handlers, active, hovered } = useFloorDrag({
    enabled: true,
    mode: "facing",
    anchor,
    priority: SHAPE_PRIORITY,
    onStart: (_x, y) => {
      grab.current = y - object.elevation;
    },
    onMove: (_x, y) => setObjectElevation(object.id, y - grab.current),
  });

  const lit = active || hovered;

  return (
    <group position={[0, top + 0.95, 0]}>
      <mesh {...handlers} visible={false} userData={{ dragPriority: SHAPE_PRIORITY }}>
        <sphereGeometry args={[0.85, 12, 12]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={20}>
        <torusGeometry args={[0.42, lit ? 0.09 : 0.065, 10, 36]} />
        <meshBasicMaterial color={lit ? "#5fd3c7" : "#2f6f6a"} toneMapped={false} fog={false} />
      </mesh>
      {[0.3, -0.3].map((dy) => (
        <mesh key={dy} position={[0, dy, 0]} renderOrder={20}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshBasicMaterial color={lit ? "#5fd3c7" : "#2f6f6a"} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
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
function SceneShape({ object, selected, frameView, locked }) {
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
    priority: SHAPE_PRIORITY,
    onStart: (x, _y, z) => {
      selectObject(object.id);
      grab.current = [x - object.position[0], z - object.position[1]];
    },
    onMove: (x, _y, z) => setObjectPosition(object.id, x - grab.current[0], z - grab.current[1]),
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

  const top = frame ? frame.bounds.max[1] : 2.6;

  return (
    <group
      position={[object.position[0], object.elevation, object.position[1]]}
      rotation={[0, object.rotation, 0]}
    >
      <mesh
        ref={mesh}
        position={[0, lift, 0]}
        castShadow
        receiveShadow
        userData={{ dragPriority: SHAPE_PRIORITY }}
        {...handlers}
      >
        {createElement(def.geom[0], { args: def.geom[1] })}
        <meshStandardMaterial color={def.color} metalness={0.15} roughness={0.4} />
      </mesh>

      {selected && !frameView && !locked && (
        <>
          <LiftHandle object={object} top={top} />
          <SpinHandle object={object} radius={ring + 0.55} />
        </>
      )}

      {/* Always drawn, so every shape looks grabbable without having to go
          hunting for the one that lights up — except in practice mode, where it
          would be one more thing on a picture meant to be clean. */}
      {(!frameView || active) && (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={17}>
        <ringGeometry args={[ring, ring + (selected ? 0.19 : 0.13), 56]} />
        <meshBasicMaterial
          color={selected ? "#2f6f6a" : "#8b94a2"}
          transparent
          opacity={active ? 0.92 : hovered ? 0.6 : selected ? 0.7 : 0.24}
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
  const frameView = useShapes((s) => s.frameView);
  const locked = useShapes((s) => s.locked);

  return useMemo(
    () =>
      objects.map((object) => (
        <SceneShape
          key={object.id}
          object={object}
          selected={object.id === selectedId}
          frameView={frameView}
          locked={locked}
        />
      )),
    [objects, selectedId, frameView, locked],
  );
}
