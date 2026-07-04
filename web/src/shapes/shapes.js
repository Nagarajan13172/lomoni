// ──────────────────────────────────────────────────────────────────────────
// Shapes playground — a tiny lighting sandbox.
//
// Pick ONE shape, then move the single light around and watch its shadow swing
// across the floor. That's the whole tool. This file holds the shape catalog
// and the sun-position helper; everything else reads from shapesStore.js.
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

/**
 * Convert the light's direction/height (degrees) into a world position on a
 * dome of the given radius. The light always aims at the origin, so this
 * position IS the light direction — moving it moves the shadow.
 */
export function lightPosition(azimuthDeg, elevationDeg, radius = 18) {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  return [
    radius * Math.cos(el) * Math.sin(az),
    radius * Math.sin(el),
    radius * Math.cos(el) * Math.cos(az),
  ];
}
