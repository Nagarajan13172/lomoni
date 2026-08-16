import { useMemo } from "react";
import { useShapes, guidesVisible } from "../shapesStore";
import {
  lightPosition,
  vanishingPoint,
  projectFromLight,
  extendFrom,
  toWorld,
  clipToFloor,
} from "../shapes";
import { GuideLine, liftPoint } from "./GuideLine";

const AMBER = "#d8921f"; // rays out of the bulb
const CORAL = "#c1544a"; // floor lines out of the vanishing point
const SLATE = "#5b6572"; // rays grazing the silhouette
const INK = "#3f4854"; // the finished shadow outline
const TEAL = "#2f6f6a"; // the drop from a lifted shape to the floor

// Lines run PAST the point where they cross, so the crossing reads as a crossing
// — the way you would rule it on paper — instead of as two lines that merely stop
// at the same place.
const GROUND_OVERRUN = 1.4;
const RADIAL_OVERRUN = 1.16;

function hullCross(o, a, b) {
  return (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
}

function convexHull(items) {
  if (items.length <= 2) return items;

  const sorted = items
    .map((item, index) => ({ index, x: item.projected[0], z: item.projected[2] }))
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

function sampleHull(items, count) {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * step)]);
}

/**
 * Fan the rays out from the bulb — one direction per point, `point - light` — so
 * a ray leaves the bulb, grazes the shape and carries straight on to the floor as
 * one unbroken line.
 */
function project(frame, position, elevation, spin, light, vp, rays) {
  const projectedPoints = [];
  for (const local of frame.points) {
    const point = toWorld(local, position, elevation, spin);
    const projected = projectFromLight(light, point);
    // A point at or above the bulb throws its ray upward and never lands; one
    // just below throws it most of the way to the horizon. Both are honest, and
    // both are handled here rather than by fencing the bulb in.
    if (projected) projectedPoints.push({ source: point, projected: clipToFloor(vp, projected) });
  }
  if (projectedPoints.length < 3) return null;

  const hull = convexHull(projectedPoints);
  const topPoint = toWorld(frame.topPoint, position, elevation, spin);
  const topShadow = projectFromLight(light, topPoint);

  return {
    hull,
    raySamples: sampleHull(hull, rays),
    topPoint,
    topProjection: topShadow ? clipToFloor(vp, topShadow) : null,
    // Foot of the shape's high point, ON THE FLOOR even when the shape is
    // floating. It shares a floor line with both the vanishing point and the
    // high point's shadow either way — the collinearity holds for any vertical.
    topBase: [topPoint[0], 0, topPoint[2]],
    // Where a lifted shape's base hangs, so its height off the ground is drawn.
    base: elevation > 0.02 ? [position[0], elevation, position[1]] : null,
  };
}

/**
 * The construction for one shape.
 *
 * The payoff, straight out of the reference sheet: drop a vertical from the
 * shape's high point, run a ground line out of the vanishing point through the
 * foot of that vertical, and fire a ray from the bulb past the high point. Where
 * those two cross is the tip of the shadow — always, because the high point, its
 * foot and the vanishing point all share one floor line.
 */
function Construction({ built, light, vp, focus }) {
  const { hull, raySamples, topPoint, topProjection, topBase, base } = built;
  const k = focus ? 1 : 0.58; // unfocused shapes stay legible but recede

  return (
    <group>
      {topProjection && (
        <>
          {/* Ground line out of the vanishing point, run on past the crossing. */}
          <GuideLine
            start={liftPoint(vp, 0.04)}
            end={liftPoint(clipToFloor(vp, extendFrom(vp, topProjection, GROUND_OVERRUN)), 0.04)}
            color={CORAL}
            dashSize={0.42}
            gapSize={0.24}
            opacity={0.72 * k}
            lineWidth={1.7}
            onFloor
            renderOrder={19}
          />
          {/* Vertical dropped from the shape's high point to its foot. Inside a
              solid shape the depth test hides it, which is correct — on paper it
              would be a hidden construction line. */}
          <GuideLine
            start={topPoint}
            end={liftPoint(topBase, 0.04)}
            color={AMBER}
            dashSize={0.26}
            gapSize={0.16}
            opacity={0.62 * k}
            lineWidth={1.5}
          />
          {/* Bulb → high point → floor, in one unbroken ray. */}
          <GuideLine
            start={light}
            end={liftPoint(topProjection)}
            color={AMBER}
            dashSize={0.34}
            gapSize={0.18}
            opacity={0.95 * k}
            lineWidth={2}
            renderOrder={19}
          />
          {/* The crossing itself: the tip of the shadow. */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[topProjection[0], 0.045, topProjection[2]]}
            renderOrder={20}
          >
            <ringGeometry args={[0.2, 0.3, 28]} />
            <meshBasicMaterial
              color={AMBER}
              transparent
              opacity={0.95 * k}
              toneMapped={false}
              fog={false}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* A lifted shape hangs in the air, so the drop to the floor is the line
          that says how high it is — and it is exactly the vertical the shadow
          construction needs. */}
      {base && (
        <>
          <GuideLine
            start={base}
            end={liftPoint([base[0], 0, base[2]], 0.04)}
            color={TEAL}
            dashSize={0.24}
            gapSize={0.16}
            opacity={0.7 * k}
            lineWidth={1.5}
          />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[base[0], 0.035, base[2]]}
            renderOrder={19}
          >
            <ringGeometry args={[0.22, 0.32, 28]} />
            <meshBasicMaterial
              color={TEAL}
              transparent
              opacity={0.75 * k}
              toneMapped={false}
              fog={false}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Rays grazing the silhouette, each one continuous to the floor. */}
      {raySamples.map((item, index) => (
        <GuideLine
          key={`ray-${index}`}
          start={light}
          end={liftPoint(item.projected)}
          color={SLATE}
          dashSize={0.34}
          gapSize={0.18}
          opacity={0.6 * k}
          lineWidth={1.4}
        />
      ))}

      {/* Floor lines out of the vanishing point, each running past its landing
          point so you can see it cross the ray that made it. */}
      {raySamples.map((item, index) => (
        <GuideLine
          key={`radial-${index}`}
          start={liftPoint(vp, 0.038)}
          end={liftPoint(extendFrom(vp, item.projected, RADIAL_OVERRUN), 0.038)}
          color={CORAL}
          dashSize={0.3}
          gapSize={0.22}
          opacity={0.26 * k}
          lineWidth={1.15}
          onFloor
        />
      ))}

      {/* The shadow the rays just built. */}
      {hull.map((item, index, items) => (
        <GuideLine
          key={`edge-${index}`}
          start={liftPoint(item.projected)}
          end={liftPoint(items[(index + 1) % items.length].projected)}
          color={INK}
          dashed={false}
          opacity={0.66 * k}
          lineWidth={focus ? 1.9 : 1.6}
          onFloor
          renderOrder={19}
        />
      ))}
    </group>
  );
}

/**
 * The construction, live in 3D, for EVERY shape on the floor — the point being
 * that one bulb and one vanishing point govern all of them at once. The selected
 * shape draws at full strength and the rest step back a little, so a crowded
 * floor still has a foreground without any of it going missing.
 */
export function ConstructionGuides() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);
  const shapeFrames = useShapes((s) => s.shapeFrames);
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const showGuides = useShapes(guidesVisible);

  const light = lightPosition(azimuth, height, distance);
  const vp = vanishingPoint(azimuth, distance);

  const built = useMemo(() => {
    if (!showGuides) return [];
    // Thin the rays as the cast grows, so eight shapes stay a drawing rather
    // than a thicket.
    const rays = objects.length > 5 ? 5 : objects.length > 2 ? 7 : 9;
    return objects
      .map((object) => {
        const frame = shapeFrames[object.type];
        if (!frame) return null;
        const projection = project(frame, object.position, object.elevation ?? 0, object.rotation ?? 0, light, vp, rays);
        return projection ? { id: object.id, projection } : null;
      })
      .filter(Boolean);
  }, [objects, shapeFrames, showGuides, light[0], light[1], light[2]]);

  if (!showGuides) return null;

  return (
    <group>
      {built.map(({ id, projection }) => (
        <Construction key={id} built={projection} light={light} vp={vp} focus={id === selectedId} />
      ))}
    </group>
  );
}
