import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useShapes } from "../shapesStore";
import { lightPosition } from "../shapes";

function DashedSegment({
  start,
  end,
  color = "#6f7987",
  dashSize = 0.34,
  gapSize = 0.2,
  opacity = 0.55,
  lineWidth = 1.45,
  depthTest = true,
}) {
  return (
    <Line
      points={[start, end]}
      color={color}
      dashed
      dashSize={dashSize}
      gapSize={gapSize}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthTest={depthTest}
      depthWrite={false}
      polygonOffset
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
      toneMapped={false}
      renderOrder={18}
    />
  );
}

function projectToFloor(point, direction) {
  const t = -point[1] / direction.y;
  return [
    point[0] + direction.x * t,
    0,
    point[2] + direction.z * t,
  ];
}

function liftPoint([x, y, z], amount = 0.035) {
  return [x, y + amount, z];
}

function hullCross(o, a, b) {
  return (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
}

function convexHull(items) {
  if (items.length <= 2) return items;

  const sorted = items
    .map((item, index) => ({
      index,
      x: item.projected[0],
      z: item.projected[2],
    }))
    .sort((a, b) => (a.x === b.x ? a.z - b.z : a.x - b.x));

  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && hullCross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && hullCross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  return lower
    .slice(0, -1)
    .concat(upper.slice(0, -1))
    .map((point) => items[point.index]);
}

function sampleHull(items, count = 10) {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * step)]);
}

/**
 * Drawing-style construction lines: sun drop, guide rays to the object, and
 * the projected shadow edges on the floor.
 */
export function ConstructionGuides() {
  const guideFrame = useShapes((s) => s.guideFrame);
  const azimuth = useShapes((s) => s.azimuth);
  const elevation = useShapes((s) => s.elevation);
  const radius = useShapes((s) => s.radius);

  const light = lightPosition(azimuth, elevation, radius);
  const floorLight = [light[0], 0, light[2]];
  const rayDirection = useMemo(() => {
    return new THREE.Vector3(-light[0], -light[1], -light[2]).normalize();
  }, [light[0], light[1], light[2]]);

  const guideProjection = useMemo(() => {
    if (!guideFrame) return null;
    const projectedPoints = guideFrame.points.map((point) => ({
      source: point,
      projected: projectToFloor(point, rayDirection),
    }));
    const hull = convexHull(projectedPoints);
    const raySamples = sampleHull(hull, 9);

    return {
      hull,
      raySamples,
      topProjection: projectToFloor(guideFrame.topPoint, rayDirection),
    };
  }, [guideFrame, rayDirection]);

  if (!guideFrame || !guideProjection) return null;

  return (
    <group>
      <DashedSegment
        start={light}
        end={liftPoint(floorLight, 0.04)}
        color="#d8921f"
        dashSize={0.36}
        gapSize={0.18}
        opacity={0.98}
        lineWidth={2.2}
      />
      <DashedSegment
        start={light}
        end={guideFrame.topPoint}
        color="#d8921f"
        dashSize={0.34}
        gapSize={0.18}
        opacity={0.95}
        lineWidth={1.95}
      />
      <DashedSegment
        start={guideFrame.topPoint}
        end={liftPoint(guideProjection.topProjection)}
        color="#d8921f"
        dashSize={0.3}
        gapSize={0.16}
        opacity={0.84}
        lineWidth={1.6}
      />

      {guideProjection.raySamples.map((item, index) => (
        <group key={`ray-${index}`}>
          <DashedSegment
            start={light}
            end={item.source}
            color="#697484"
            dashSize={0.34}
            gapSize={0.18}
            opacity={0.82}
            lineWidth={1.5}
          />
          <DashedSegment
            start={item.source}
            end={liftPoint(item.projected)}
            color="#6d7887"
            dashSize={0.32}
            gapSize={0.18}
            opacity={0.72}
            lineWidth={1.45}
          />
        </group>
      ))}

      {guideProjection.hull.map((item, index, items) => (
        <DashedSegment
          key={`shadow-edge-${index}`}
          start={liftPoint(item.projected)}
          end={liftPoint(items[(index + 1) % items.length].projected)}
          color="#5c6674"
          dashSize={0.3}
          gapSize={0.16}
          opacity={0.68}
          lineWidth={1.55}
        />
      ))}

      {guideProjection.hull.map((item, index) => (
        <DashedSegment
          key={`shape-shadow-${index}`}
          start={item.source}
          end={liftPoint(item.projected)}
          color="#616b79"
          dashSize={0.3}
          gapSize={0.16}
          opacity={0.62}
          lineWidth={1.4}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[floorLight[0], 0.02, floorLight[2]]}>
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshBasicMaterial color="#e2aa4a" transparent opacity={0.88} toneMapped={false} />
      </mesh>
    </group>
  );
}
