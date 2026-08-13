import { useMemo } from "react";
import { useShapes } from "../shapesStore";
import { lightPosition, vanishingPoint, projectFromLight, extendFrom, toWorld } from "../shapes";
import { GuideLine, liftPoint } from "./GuideLine";

const AMBER = "#d8921f"; // the light's own construction
const SLATE = "#5b6572"; // rays grazing the shape
const CORAL = "#c1544a"; // floor lines running out of the vanishing point
const INK = "#3f4854"; // the shadow outline

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
 * Fan the rays out from the bulb — one direction per point, `point - light` — so
 * a ray leaves the bulb, grazes the shape and carries straight on to the floor as
 * one unbroken line.
 */
function project(frame, position, light) {
  const projectedPoints = [];
  for (const local of frame.points) {
    const point = toWorld(local, position);
    const projected = projectFromLight(light, point);
    if (projected) projectedPoints.push({ source: point, projected });
  }
  if (projectedPoints.length < 3) return null;

  const hull = convexHull(projectedPoints);
  const topPoint = toWorld(frame.topPoint, position);

  return {
    hull,
    raySamples: sampleHull(hull, 9),
    topPoint,
    topProjection: projectFromLight(light, topPoint),
    // Foot of the shape's high point. It shares a floor line with both the
    // vanishing point and the high point's shadow.
    topBase: [topPoint[0], 0, topPoint[2]],
  };
}

/** The shadow every shape casts, outlined on the floor. */
function ShadowOutline({ hull, opacity = 0.62, lineWidth = 1.8 }) {
  return hull.map((item, index, items) => (
    <GuideLine
      key={`edge-${index}`}
      start={liftPoint(item.projected)}
      end={liftPoint(items[(index + 1) % items.length].projected)}
      color={INK}
      dashed={false}
      opacity={opacity}
      lineWidth={lineWidth}
      renderOrder={19}
    />
  ));
}

/**
 * The full drawing, for the shape you are working on.
 *
 * The payoff triple, straight out of the reference sheet: drop a vertical from
 * the shape's high point, run a ground line out of the vanishing point through
 * the foot of that vertical, and fire the ray from the bulb past the high point.
 * The ray meets the ground line exactly at the shadow's tip — always, because the
 * high point, its foot and the vanishing point share one floor line.
 */
function FullConstruction({ built, light, vp }) {
  const { hull, raySamples, topPoint, topProjection, topBase } = built;

  return (
    <group>
      {topProjection && (
        <>
          {/* The ground line out of the vanishing point. */}
          <GuideLine
            start={liftPoint(vp, 0.04)}
            end={liftPoint(extendFrom(vp, topProjection, 1.14), 0.04)}
            color={CORAL}
            dashSize={0.42}
            gapSize={0.24}
            opacity={0.7}
            lineWidth={1.7}
            renderOrder={19}
          />
          {/* Vertical dropped from the shape's high point to its foot. */}
          <GuideLine
            start={topPoint}
            end={liftPoint(topBase, 0.04)}
            color={AMBER}
            dashSize={0.26}
            gapSize={0.16}
            opacity={0.6}
            lineWidth={1.5}
          />
          {/* Bulb → high point → floor, in one unbroken ray. */}
          <GuideLine
            start={light}
            end={liftPoint(topProjection)}
            color={AMBER}
            dashSize={0.34}
            gapSize={0.18}
            opacity={0.95}
            lineWidth={2}
            renderOrder={19}
          />
          {/* Where the ray meets the ground line: the shadow's tip. */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[topProjection[0], 0.03, topProjection[2]]}
            renderOrder={19}
          >
            <circleGeometry args={[0.17, 24]} />
            <meshBasicMaterial color={AMBER} toneMapped={false} fog={false} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* Rays grazing the silhouette, each one continuous to the floor. */}
      {raySamples.map((item, index) => (
        <group key={`ray-${index}`}>
          <GuideLine
            start={light}
            end={liftPoint(item.projected)}
            color={SLATE}
            dashSize={0.34}
            gapSize={0.18}
            opacity={0.66}
            lineWidth={1.45}
          />
          <mesh position={item.source} renderOrder={19}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshBasicMaterial color={SLATE} toneMapped={false} fog={false} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* Floor lines radiating out of the vanishing point. */}
      {raySamples
        .filter((_, index) => index % 2 === 0)
        .map((item, index) => (
          <GuideLine
            key={`radial-${index}`}
            start={liftPoint(vp, 0.038)}
            end={liftPoint(extendFrom(vp, item.projected, 1.06), 0.038)}
            color={CORAL}
            dashSize={0.3}
            gapSize={0.22}
            opacity={0.3}
            lineWidth={1.2}
          />
        ))}

      <ShadowOutline hull={hull} />
    </group>
  );
}

/**
 * The construction, live in 3D.
 *
 * With a cast of shapes on the floor, drawing every ray for every one of them is
 * a thicket. So the SELECTED shape gets the full drawing, and the rest get their
 * shadow outline plus a single line home to the vanishing point — enough to show
 * that the same one point governs all of them.
 */
export function ConstructionGuides() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);
  const shapeFrames = useShapes((s) => s.shapeFrames);
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const showGuides = useShapes((s) => s.showGuides);

  const light = lightPosition(azimuth, height, distance);
  const vp = vanishingPoint(azimuth, distance);

  const built = useMemo(() => {
    if (!showGuides) return [];
    return objects
      .map((object) => {
        const frame = shapeFrames[object.type];
        if (!frame) return null;
        const projection = project(frame, object.position, light);
        return projection ? { id: object.id, projection } : null;
      })
      .filter(Boolean);
  }, [objects, shapeFrames, showGuides, light[0], light[1], light[2]]);

  if (!showGuides) return null;

  return (
    <group>
      {built.map(({ id, projection }) =>
        id === selectedId ? (
          <FullConstruction key={id} built={projection} light={light} vp={vp} />
        ) : (
          <group key={id}>
            <ShadowOutline hull={projection.hull} opacity={0.4} lineWidth={1.5} />
            {projection.topProjection && (
              <GuideLine
                start={liftPoint(vp, 0.038)}
                end={liftPoint(extendFrom(vp, projection.topProjection, 1.1), 0.038)}
                color={CORAL}
                dashSize={0.3}
                gapSize={0.24}
                opacity={0.22}
                lineWidth={1.2}
              />
            )}
          </group>
        ),
      )}
    </group>
  );
}
