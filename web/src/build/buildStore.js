import { create } from "zustand";
import { BRICKS, footprint, DEFAULT_TYPE, DEFAULT_COLOR } from "./bricks";

const ck = (x, y, z) => x + "," + y + "," + z;
const colk = (x, z) => x + "," + z;

let _id = 0;
const nextId = () => "b" + ++_id;

/** Plate-resolution cells a block fills (for exact overlap checks). */
function cellsOf(b) {
  const { fw, fd } = footprint(b.type, b.rot);
  const plates = BRICKS[b.type].plates;
  const out = [];
  for (let x = 0; x < fw; x++)
    for (let z = 0; z < fd; z++)
      for (let y = 0; y < plates; y++) out.push(ck(b.gx + x, b.gy + y, b.gz + z));
  return out;
}

/** Rebuild occupancy + per-column tops from a block list (used by undo/clear). */
function derive(blocks) {
  const occupancy = new Set();
  const columnTop = new Map();
  for (const b of blocks) {
    for (const c of cellsOf(b)) occupancy.add(c);
    const { fw, fd } = footprint(b.type, b.rot);
    const top = b.gy + BRICKS[b.type].plates;
    for (let x = 0; x < fw; x++)
      for (let z = 0; z < fd; z++) {
        const k = colk(b.gx + x, b.gz + z);
        if ((columnTop.get(k) || 0) < top) columnTop.set(k, top);
      }
  }
  return { occupancy, columnTop };
}

export const useBuild = create((set, get) => ({
  blocks: [],
  occupancy: new Set(), // occupied plate-cells
  columnTop: new Map(), // "gx,gz" -> next free plate layer
  history: [], // block-array snapshots for undo

  type: DEFAULT_TYPE,
  color: DEFAULT_COLOR,
  rot: 0,
  ghost: null, // { gx, gz } the placer is hovering, or null

  setType: (type) => set({ type }),
  setColor: (color) => set({ color }),
  rotate: () => set((s) => ({ rot: (s.rot + 90) % 360 })),
  setGhost: (ghost) => set({ ghost }),

  /** Resting plate layer for a footprint at (gx,gz): sits on its tallest column. */
  restingY: (gx, gz, type, rot) => {
    const { fw, fd } = footprint(type, rot);
    const top = get().columnTop;
    let y = 0;
    for (let x = 0; x < fw; x++)
      for (let z = 0; z < fd; z++) y = Math.max(y, top.get(colk(gx + x, gz + z)) || 0);
    return y;
  },

  /** Drop a brick at column (gx,gz); it rests on whatever's already there. */
  place: (gx, gz) => {
    const { type, color, rot } = get();
    const gy = get().restingY(gx, gz, type, rot);
    const block = { id: nextId(), type, gx, gy, gz, rot, color };
    const occupancy = new Set(get().occupancy);
    for (const c of cellsOf(block)) occupancy.add(c);
    const columnTop = new Map(get().columnTop);
    const { fw, fd } = footprint(type, rot);
    const newTop = gy + BRICKS[type].plates;
    for (let x = 0; x < fw; x++)
      for (let z = 0; z < fd; z++) columnTop.set(colk(gx + x, gz + z), newTop);
    set((s) => ({
      history: [...s.history, s.blocks],
      blocks: [...s.blocks, block],
      occupancy,
      columnTop,
    }));
  },

  undo: () =>
    set((s) => {
      if (!s.history.length) return {};
      const blocks = s.history[s.history.length - 1];
      return { blocks, history: s.history.slice(0, -1), ...derive(blocks) };
    }),

  clear: () =>
    set((s) =>
      s.blocks.length
        ? { history: [...s.history, s.blocks], blocks: [], occupancy: new Set(), columnTop: new Map() }
        : {}
    ),
}));
