import { bearingGap, directionFromAngles, pickBearing } from "../lib/viewAngles";

// ──────────────────────────────────────────────────────────────────────────
// Shapes playground — a tiny lighting sandbox.
//
// Pick ONE shape, then move the single light around and watch its shadow swing
// across the floor. That's the whole tool. This file holds the shape catalog
// and the helper used to place the visible light from intuitive angle values.
// ──────────────────────────────────────────────────────────────────────────

// Each shape maps to a THREE geometry element. `geom` is [tagName, args] — the
// tag is a lowercase R3F intrinsic (e.g. "torusKnotGeometry") that resolves to
// the matching THREE class, so the scene can render any of them generically.
export const SHAPES = [
  { type: "sphere", label: "Sphere", color: "#ff5a5f", geom: ["sphereGeometry", [1.6, 64, 48]] },
  { type: "box", label: "Cube", color: "#ffb703", geom: ["boxGeometry", [2.6, 2.6, 2.6]] },
  { type: "cone", label: "Cone", color: "#06d6a0", geom: ["coneGeometry", [1.7, 3.2, 64]] },
  { type: "pyramid", label: "Pyramid", color: "#4cc9f0", geom: ["coneGeometry", [1.9, 3, 4]] },
  { type: "cylinder", label: "Cylinder", color: "#f72585", geom: ["cylinderGeometry", [1.3, 1.3, 2.8, 64]] },
  { type: "torus", label: "Torus", color: "#b5179e", geom: ["torusGeometry", [1.2, 0.5, 32, 96]] },
  { type: "knot", label: "Torus Knot", color: "#4361ee", geom: ["torusKnotGeometry", [1.0, 0.36, 200, 32]] },
  { type: "tetra", label: "Tetrahedron", color: "#ff8fab", geom: ["tetrahedronGeometry", [1.8]] },
  { type: "octa", label: "Octahedron", color: "#52b788", geom: ["octahedronGeometry", [1.8]] },
  { type: "icosa", label: "Icosahedron", color: "#ffd166", geom: ["icosahedronGeometry", [1.7]] },
  { type: "dodeca", label: "Dodecahedron", color: "#a78bfa", geom: ["dodecahedronGeometry", [1.6]] },
  { type: "capsule", label: "Capsule", color: "#48cae4", geom: ["capsuleGeometry", [0.95, 1.8, 16, 32]] },
];

// ── Light & shadow geometry ────────────────────────────────────────────────
//
// The light is a LAMP AT A FINITE POINT, not the sun. That single choice is what
// makes this tool teach anything: rays fan OUT from the bulb, so a shadow gets
// longer the closer the bulb comes, and every shadow line traces back to one
// spot on the floor — the point directly under the bulb. That spot is the
// SHADOW VANISHING POINT. Parallel (sun) rays have no such point.
//
// We describe the bulb the way the classic construction drawing does: a top-view
// angle, a HEIGHT above the floor, and a FLOOR DISTANCE out from the shape. The
// height and the floor distance are literally the two legs of the right triangle
// in the drawing — the vertical dropped from the bulb, and the ground line.

/** World position of the bulb from top angle + height + floor distance. */
export function lightPosition(azimuthDeg, height, distance) {
  const az = (azimuthDeg * Math.PI) / 180;
  return [distance * Math.sin(az), height, distance * Math.cos(az)];
}

/**
 * The shadow vanishing point: the floor point straight below the bulb. Every
 * shadow in the scene radiates away from here, so it is the anchor of the whole
 * construction.
 */
export function vanishingPoint(azimuthDeg, distance) {
  const az = (azimuthDeg * Math.PI) / 180;
  return [distance * Math.sin(az), 0, distance * Math.cos(az)];
}

/**
 * Follow the ray that leaves the bulb, grazes `point`, and continues until it
 * hits the floor (y = 0) — the divergent projection the drawing is built on.
 * Returns null when the point sits at or above the bulb, since that ray only
 * ever travels away from the floor.
 */
export function projectFromLight(light, point) {
  const drop = light[1] - point[1];
  if (drop <= 1e-3) return null;
  const t = light[1] / drop; // distance along light→point needed to reach y = 0
  return [
    light[0] + (point[0] - light[0]) * t,
    0,
    light[2] + (point[2] - light[2]) * t,
  ];
}

/** Height angle the bulb makes with the floor — shown as a readout. */
export function elevationAngle(height, distance) {
  return (Math.atan2(height, Math.max(distance, 1e-4)) * 180) / Math.PI;
}

/** Push a point away from `from` by `factor`, staying on the floor. */
export function extendFrom(from, point, factor) {
  return [
    from[0] + (point[0] - from[0]) * factor,
    0,
    from[2] + (point[2] - from[2]) * factor,
  ];
}

// Slider limits. The bulb is free to go anywhere between them — including below
// the top of a shape, or under a lifted one. That is a real lighting situation
// and it should be reachable; the drawing copes with it by clipping at the edge
// of the floor rather than by fencing the bulb in. See `clipToFloor`.
export const LIGHT_HEIGHT = { min: 1.5, max: 26, step: 0.5 };
export const LIGHT_DISTANCE = { min: 3, max: 28, step: 0.5 };

/** How far from the studio centre a shape may be dragged. */
export const OBJECT_RANGE = 15;

/** Kept modest so the floor stays readable and the guides stay untangled. */
export const MAX_OBJECTS = 8;

/** How far off the floor a shape may be lifted — enough for a stack of three. */
export const OBJECT_LIFT = { min: 0, max: 10, step: 0.1 };

/**
 * Floor disc radius. Comfortably past the longest shadow ordinary settings throw
 * (about 63 units), and the edge that `clipToFloor` trims the extreme ones to.
 */
export const FLOOR_RADIUS = 92;

/** Keep a floor position inside a disc of `radius`. */
export function clampToDisc(x, z, radius) {
  const r = Math.hypot(x, z);
  if (r <= radius || r === 0) return [x, z];
  return [(x * radius) / r, (z * radius) / r];
}

/**
 * Shape-local point → world. The shape's sample points are cached in its own
 * space so dragging it around only moves an origin, instead of re-walking the
 * geometry every frame.
 */
export function toWorld([x, y, z], [ox, oz], lift = 0, spin = 0) {
  if (!spin) return [x + ox, y + lift, z + oz];
  // Same Y rotation three applies, so the guides trace the shape you can see.
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  return [x * c + z * s + ox, y + lift, -x * s + z * c + oz];
}

/**
 * How far a shape reaches sideways from its own centre. Measured to the corner
 * of its footprint, so the answer does not change as the shape is spun.
 */
export function footprintRadius(frame) {
  const { min, max } = frame.bounds;
  return Math.hypot(Math.max(-min[0], max[0]), Math.max(-min[2], max[2]));
}

/**
 * Trim a shadow point to the edge of the floor.
 *
 * A bulb level with — or below — the thing it lights is a real situation, and
 * the maths is honest about it: the shadow stretches toward the horizon and, past
 * the bulb's own height, stops landing on the floor at all. Left alone that puts
 * construction lines thousands of units out and sends the camera chasing them.
 *
 * Every shadow point sits on a ray out of the vanishing point — S − VP is always
 * parallel to the point's horizontal offset from the bulb — so trimming ALONG
 * that ray shortens the line without bending it. The picture then reads as a
 * shadow running off the edge of the floor, which is what it is.
 */
export function clipToFloor(vp, point, limit = FLOOR_RADIUS) {
  if (Math.hypot(point[0], point[2]) <= limit) return point;
  const dx = point[0] - vp[0];
  const dz = point[2] - vp[2];
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return point;

  // Where the ray vp + u·d crosses the circle of radius `limit` about the origin.
  const ux = dx / len;
  const uz = dz / len;
  const b = vp[0] * ux + vp[2] * uz;
  const c = vp[0] * vp[0] + vp[2] * vp[2] - limit * limit;
  const u = -b + Math.sqrt(Math.max(b * b - c, 0));
  return [vp[0] + ux * u, 0, vp[2] + uz * u];
}

/** The top of the highest shape standing under `self` — or the floor, at 0. */
export function supportTop(objects, frames, self) {
  let top = 0;
  for (const other of objects) {
    if (other.id === self.id) continue;
    const frame = frames[other.type];
    if (!frame) continue;
    const reach = Math.hypot(other.position[0] - self.position[0], other.position[1] - self.position[1]);
    if (reach > footprintRadius(frame)) continue; // not underneath it
    top = Math.max(top, (other.elevation ?? 0) + frame.bounds.max[1]);
  }
  return top;
}

/** The highest point the bulb has to light, across the whole cast. */
export function tallestTop(objects, frames) {
  let top = 0;
  for (const object of objects) {
    const frame = frames[object.type];
    if (frame) top = Math.max(top, (object.elevation ?? 0) + frame.bounds.max[1]);
  }
  return top;
}

/** Spin, normalised to one turn. */
export function normaliseSpin(radians) {
  const turn = Math.PI * 2;
  return ((radians % turn) + turn) % turn;
}

/**
 * Somewhere to drop a newly added shape: right beside the one you were last
 * working with, rather than back at the middle of the floor. Rings walk outward
 * from that anchor and the first spot that is not crowding anything wins, so a
 * new shape lands within reach of the arrangement you have been building.
 */
export function nextFreeSpot(taken, anchor = [0, 0], range = OBJECT_RANGE, gap = 3.2) {
  if (!taken.length) return [0, 0];

  for (let ring = 1; ring <= 10; ring += 1) {
    const radius = gap * ring;
    const steps = 8 * ring;
    for (let i = 0; i < steps; i += 1) {
      // Offset each ring so successive shapes do not line up in a row.
      const angle = (i / steps) * Math.PI * 2 + ring * 0.65;
      const spot = [anchor[0] + Math.cos(angle) * radius, anchor[1] + Math.sin(angle) * radius];
      if (Math.hypot(spot[0], spot[1]) > range) continue;
      if (taken.every((p) => Math.hypot(p[0] - spot[0], p[1] - spot[1]) >= gap)) return spot;
    }
  }
  // Crowded floor: overlapping beats refusing to place it.
  return clampToDisc(anchor[0] + gap, anchor[1], range);
}

/** Floor position → the top angle and distance that put the bulb over it. */
export function lightFromFloor(x, z) {
  const distance = Math.min(Math.max(Math.hypot(x, z), LIGHT_DISTANCE.min), LIGHT_DISTANCE.max);
  const azimuth = (Math.atan2(x, z) * 180) / Math.PI;
  return { azimuth: azimuth < 0 ? azimuth + 360 : azimuth, distance };
}

export { bearingGap, directionFromAngles } from "../lib/viewAngles";

// ── Frame view ─────────────────────────────────────────────────────────────
//
// The viewpoint you would actually set a still life up from. Four candidate
// bearings, each a classic three-quarter on the axis-aligned shapes — you see
// two faces of a box rather than one flat one. We take whichever of the four
// puts the light roughly across the scene, because a light square behind the
// camera flattens every form and hides the cast shadow behind its own object.
const FRAME_BEARINGS = [35, 125, 215, 305];
const FRAME_ELEVATION = 28;

/** The three-quarter viewpoint to use with the light where it currently is. */
export function frameViewAngles(lightAzimuth, cameraBearing = null) {
  return {
    azimuth: pickBearing(FRAME_BEARINGS, lightAzimuth, cameraBearing),
    elevation: FRAME_ELEVATION,
  };
}

/** Free 3D position → the bulb's three stored values, each kept in range. */
export function lightFromPoint(x, y, z) {
  return {
    ...lightFromFloor(x, z),
    height: Math.min(Math.max(y, LIGHT_HEIGHT.min), LIGHT_HEIGHT.max),
  };
}
