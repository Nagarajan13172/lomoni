import { create } from "zustand";
import { BRICKS, footprint, DEFAULT_TYPE, DEFAULT_COLOR } from "./bricks";
import { initialBlocks, saveLocal } from "./persist";

const ck = (x, y, z) => x + "," + y + "," + z;
const colk = (x, z) => x + "," + z;

let _id = 0;
const nextId = () => "b" + ++_id;
const withIds = (blocks) => blocks.map((b) => ({ ...b, id: nextId() }));

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

// Restore the last build (a shared #b=… link wins, else localStorage).
const _initial = withIds(initialBlocks());
const _initialDerived = derive(_initial);

export const useBuild = create((set, get) => ({
  blocks: _initial,
  occupancy: _initialDerived.occupancy, // occupied plate-cells
  columnTop: _initialDerived.columnTop, // "gx,gz" -> next free plate layer
  history: [], // block-array snapshots for undo

  type: DEFAULT_TYPE,
  color: DEFAULT_COLOR,
  rot: 0,
  ghost: null, // { gx, gz } the placer is hovering, or null
  mode: "place", // "place" | "move" | "delete"
  hoverId: null, // brick under the cursor in delete/move mode
  carried: null, // { type, color, rot, gx0, gy0, gz0 } while moving a brick
  gl: null, // renderer, captured for screenshots

  setType: (type) => set({ type }),
  setColor: (color) => set({ color }),
  // Rotating a carried brick spins IT; otherwise it spins the palette piece.
  rotate: () =>
    set((s) =>
      s.carried
        ? { carried: { ...s.carried, rot: (s.carried.rot + 90) % 360 } }
        : { rot: (s.rot + 90) % 360 }
    ),
  setGhost: (ghost) => set({ ghost }),
  setMode: (mode) => {
    if (get().carried) get().cancelCarry(); // switching modes drops the carry
    set({ mode, ghost: null, hoverId: null });
  },
  setHover: (hoverId) => set({ hoverId }),
  setGL: (gl) => set({ gl }),

  /** Replace the whole build (from an imported file or a shared link). */
  load: (blocks) => {
    const b = withIds(blocks || []);
    set({ blocks: b, history: [], ghost: null, hoverId: null, ...derive(b) });
  },

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

  /** Remove a brick by id and rebuild occupancy/tops from scratch. */
  remove: (id) =>
    set((s) => {
      const blocks = s.blocks.filter((b) => b.id !== id);
      if (blocks.length === s.blocks.length) return {};
      return { blocks, history: [...s.history, s.blocks], hoverId: null, ...derive(blocks) };
    }),

  /** Lift a brick to move it: remember it, remove it, snapshot for one-step undo. */
  pickUp: (id) =>
    set((s) => {
      const b = s.blocks.find((x) => x.id === id);
      if (!b) return {};
      const blocks = s.blocks.filter((x) => x.id !== id);
      return {
        blocks,
        history: [...s.history, s.blocks], // pre-move snapshot (drop won't push again)
        carried: { type: b.type, color: b.color, rot: b.rot, gx0: b.gx, gy0: b.gy, gz0: b.gz },
        hoverId: null,
        ...derive(blocks),
      };
    }),

  /** Drop the carried brick at (gx,gz). No history push — pickUp already did. */
  dropCarried: (gx, gz) =>
    set((s) => {
      const c = s.carried;
      if (!c) return {};
      const gy = get().restingY(gx, gz, c.type, c.rot);
      const block = { id: nextId(), type: c.type, gx, gy, gz, rot: c.rot, color: c.color };
      const blocks = [...s.blocks, block];
      return { blocks, carried: null, ghost: null, ...derive(blocks) };
    }),

  /** Abort a move: put the brick back where it came from, undo the snapshot. */
  cancelCarry: () =>
    set((s) => {
      const c = s.carried;
      if (!c) return {};
      const block = { id: nextId(), type: c.type, gx: c.gx0, gy: c.gy0, gz: c.gz0, rot: c.rot, color: c.color };
      const blocks = [...s.blocks, block];
      return { blocks, carried: null, ghost: null, history: s.history.slice(0, -1), ...derive(blocks) };
    }),

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

// Auto-save to localStorage whenever the set of placed blocks changes, so a
// build survives a page reload without any explicit "save".
let _lastBlocks = useBuild.getState().blocks;
useBuild.subscribe((state) => {
  if (state.blocks !== _lastBlocks) {
    _lastBlocks = state.blocks;
    saveLocal(state.blocks);
  }
});
