// ──────────────────────────────────────────────────────────────────────────
// Lego-ish unit system for the block builder.
//
// 1 stud pitch = 1 world unit on X/Z. A brick is 3 plates tall. Everything is
// placed on an INTEGER grid: gx/gz are stud columns, gy is the plate layer of a
// block's bottom. That integer grid is what makes snapping, stacking and
// collision trivial (see buildStore.js).
// ──────────────────────────────────────────────────────────────────────────

export const STUD = 1;            // grid pitch on X/Z (world units)
export const PLATE = 0.4;         // one plate of height (world units)
export const BRICK_PLATES = 3;    // a standard brick = 3 plates tall
export const STUD_R = 0.31;       // stud cylinder radius
export const STUD_H = 0.18;       // stud cylinder height

export const BASEPLATE = 24;      // studs per side of the baseplate

// Brick catalog. w = studs along X, d = studs along Z, plates = height.
export const BRICKS = {
  "1x1": { w: 1, d: 1, plates: 3, label: "1×1" },
  "1x2": { w: 2, d: 1, plates: 3, label: "1×2" },
  "1x4": { w: 4, d: 1, plates: 3, label: "1×4" },
  "2x2": { w: 2, d: 2, plates: 3, label: "2×2" },
  "2x4": { w: 4, d: 2, plates: 3, label: "2×4" },
  "2x6": { w: 6, d: 2, plates: 3, label: "2×6" },
};
export const DEFAULT_TYPE = "2x4";

export const COLORS = [
  "#d01012", // red
  "#0055bf", // blue
  "#f2cd37", // yellow
  "#237841", // green
  "#ffffff", // white
  "#1b2a34", // black
  "#fe8a18", // orange
  "#a0a5a9", // grey
];
export const DEFAULT_COLOR = COLORS[0];

const HALF = (BASEPLATE * STUD) / 2; // baseplate is centred on the origin

/** Footprint after rotation: 0/180 keep w×d, 90/270 swap them. */
export function footprint(type, rot) {
  const b = BRICKS[type];
  return rot % 180 === 0 ? { fw: b.w, fd: b.d } : { fw: b.d, fd: b.w };
}

/** World-space CENTRE [x,y,z] of a placed block. */
export function blockWorld(block) {
  const { fw, fd } = footprint(block.type, block.rot);
  const plates = BRICKS[block.type].plates;
  return [
    (block.gx + fw / 2) * STUD - HALF,
    block.gy * PLATE + (plates * PLATE) / 2,
    (block.gz + fd / 2) * STUD - HALF,
  ];
}

/** World X/Z (baseplate top corner) → fractional stud column under a point. */
export function worldToCol(wx, wz) {
  return { cx: (wx + HALF) / STUD, cz: (wz + HALF) / STUD };
}

export { HALF };
