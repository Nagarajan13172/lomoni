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

// Slider limits. The floor of LIGHT_HEIGHT matters: as the bulb sinks toward the
// top of a shape the shadow races off to infinity (correctly — that is what a
// finite light does), so we keep the bulb clear of the tallest shape.
export const LIGHT_HEIGHT = { min: 7, max: 26, step: 0.5 };
export const LIGHT_DISTANCE = { min: 3, max: 24, step: 0.5 };

/** How far from the studio centre a shape may be dragged. */
export const OBJECT_RANGE = 8;

/** Kept modest so the floor stays readable and the guides stay untangled. */
export const MAX_OBJECTS = 8;

/**
 * Floor disc radius. Sized from the worst case the sliders allow — the lowest
 * bulb, at full distance, over the tallest shape pushed to the far edge of its
 * range — so a shadow never runs off the end of the world.
 */
export const FLOOR_RADIUS = 46;

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
export function toWorld([x, y, z], [ox, oz]) {
  return [x + ox, y, z + oz];
}

/**
 * Somewhere to drop a newly added shape: walk a golden-angle spiral out from the
 * centre and take the first spot that is not crowding anything already standing
 * there. The golden angle is what stops successive shapes landing in a line.
 */
export function nextFreeSpot(taken, range = OBJECT_RANGE, gap = 3.2) {
  if (!taken.length) return [0, 0];
  let last = [0, 0];
  for (let i = 1; i <= 240; i += 1) {
    const angle = i * 2.399963229728653;
    const radius = Math.min(2.6 + Math.sqrt(i) * 1.1, range);
    last = [Math.cos(angle) * radius, Math.sin(angle) * radius];
    if (taken.every((p) => Math.hypot(p[0] - last[0], p[1] - last[1]) >= gap)) return last;
  }
  return last; // crowded floor: overlap beats refusing to place it
}

/** Floor position → the top angle and distance that put the bulb over it. */
export function lightFromFloor(x, z) {
  const distance = Math.min(Math.max(Math.hypot(x, z), LIGHT_DISTANCE.min), LIGHT_DISTANCE.max);
  const azimuth = (Math.atan2(x, z) * 180) / Math.PI;
  return { azimuth: azimuth < 0 ? azimuth + 360 : azimuth, distance };
}
