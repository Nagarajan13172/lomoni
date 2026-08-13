import { create } from "zustand";
import { SHAPES, OBJECT_RANGE, MAX_OBJECTS, clampToDisc, lightFromFloor, nextFreeSpot } from "./shapes";

/**
 * Store for the Shapes sandbox: a cast of shapes standing on the floor, and the
 * one bulb lighting them. The user thinks in the same terms as the construction
 * drawing — a top-view angle, how HIGH the bulb hangs, and how FAR out on the
 * floor it stands — so we store those and derive the 3D position in the scene.
 *
 * There is no drag "mode". Shapes, the bulb and the vanishing-point mark are each
 * their own grab target in the scene, so a drag is never ambiguous and nothing
 * needs arming first.
 */
export const useShapes = create((set) => ({
  objects: [{ id: "shape-1", type: SHAPES[1].type, position: [0, 0] }],
  selectedId: "shape-1",
  nextId: 2,

  azimuth: 40, // top-view angle around the studio centre
  height: 12, // how high the bulb hangs above the floor
  distance: 12, // how far out on the floor the bulb stands

  // Sampled outline points, cached per shape TYPE — the sample is identical for
  // every copy of a shape, so adding a fifth cube costs nothing.
  shapeFrames: {},

  autoFit: true, // keep bulb, shapes, shadows and vanishing point all in frame
  panelInset: { right: 0, bottom: 0 }, // screen space the control panel covers
  showGuides: true, // dotted rays, shadow outline, floor lines
  showLabels: true, // "Light source" / "Shadow vanishing point" tags

  setAzimuth: (azimuth) => set({ azimuth }),
  setHeight: (height) => set({ height }),
  setDistance: (distance) => set({ distance }),
  setAutoFit: (autoFit) => set({ autoFit }),
  toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  // ── The cast ────────────────────────────────────────────────────────────
  addObject: (type) =>
    set((s) => {
      if (s.objects.length >= MAX_OBJECTS) return s;
      const id = `shape-${s.nextId}`;
      const position = nextFreeSpot(s.objects.map((o) => o.position));
      return {
        objects: [...s.objects, { id, type, position }],
        selectedId: id,
        nextId: s.nextId + 1,
      };
    }),

  removeObject: (id) =>
    set((s) => {
      const objects = s.objects.filter((o) => o.id !== id);
      if (objects.length === s.objects.length) return s;
      return {
        objects,
        selectedId: s.selectedId === id ? objects[objects.length - 1]?.id ?? null : s.selectedId,
      };
    }),

  selectObject: (id) => set((s) => (s.selectedId === id ? s : { selectedId: id })),

  setObjectType: (id, type) =>
    set((s) => ({ objects: s.objects.map((o) => (o.id === id ? { ...o, type } : o)) })),

  /** Drop a shape at a floor point, kept within its play area. */
  setObjectPosition: (id, x, z) =>
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === id ? { ...o, position: clampToDisc(x, z, OBJECT_RANGE) } : o,
      ),
    })),

  centerSelected: () =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === s.selectedId ? { ...o, position: [0, 0] } : o)),
    })),

  // First copy of a shape to mount wins; the rest find it already cached.
  setShapeFrame: (type, frame) =>
    set((s) => (s.shapeFrames[type] ? s : { shapeFrames: { ...s.shapeFrames, [type]: frame } })),

  // ── The light ───────────────────────────────────────────────────────────
  /** Swing the bulb to stand over a floor point, keeping its height. */
  setLightFromFloor: (x, z) => set(lightFromFloor(x, z)),

  // Measured from the DOM, so identical measurements must not wake subscribers.
  setPanelInset: (right, bottom) =>
    set((s) =>
      s.panelInset.right === right && s.panelInset.bottom === bottom
        ? s
        : { panelInset: { right, bottom } },
    ),
}));
