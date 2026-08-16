import { create } from "zustand";
import {
  SHAPES,
  OBJECT_RANGE,
  MAX_OBJECTS,
  OBJECT_LIFT,
  clampToDisc,
  lightFromFloor,
  lightFromPoint,
  nextFreeSpot,
  normaliseSpin,
  supportTop,
} from "./shapes";


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
  objects: [{ id: "shape-1", type: SHAPES[1].type, position: [0, 0], elevation: 0, rotation: 0 }],
  selectedId: "shape-1",
  nextId: 2,

  azimuth: 40, // top-view angle around the studio centre
  height: 12, // how high the bulb hangs above the floor
  distance: 12, // how far out on the floor the bulb stands

  // Sampled outline points, cached per shape TYPE — the sample is identical for
  // every copy of a shape, so adding a fifth cube costs nothing.
  shapeFrames: {},

  dragging: false, // something in the scene or on the map is being dragged
  locked: false, // composition frozen so you can draw against a still frame
  frameView: false, // practice mode: a clean three-quarter view, nothing drawn on it
  frameToken: 0, // bumped to ask the camera to swing to the framing pose
  autoFit: true, // keep bulb, shapes, shadows and vanishing point all in frame
  panelInset: { right: 0, bottom: 0 }, // screen space the control panel covers
  showGuides: true, // dotted rays, shadow outline, floor lines
  showLabels: true, // "Light source" / "Shadow vanishing point" tags

  setAzimuth: (azimuth) => set({ azimuth }),
  setHeight: (height) => set({ height }),
  setDistance: (distance) => set({ distance }),
  setAutoFit: (autoFit) => set({ autoFit }),

  // Auto-fit must hold still while you drag. If the camera chases the thing in
  // your hand, the floor point under a moving cursor runs the same way the
  // object just went — the object then travels about twice as far as the cursor
  // and slams into the edge of its range.
  setDragging: (dragging) => set((s) => (s.dragging === dragging ? s : { dragging })),
  // The lock freezes everything that could shift the picture — the camera, every
  // drag handle, auto-fit and the composition controls. Only what is DRAWN on top
  // stays free, so you can reveal the construction to check your work without the
  // view moving under you.
  toggleLock: () => set((s) => ({ locked: !s.locked })),

  // Frame view is a mode, not a stored copy of the toggles: it simply forces the
  // drawing off while it is on, so leaving it puts back exactly what you had.
  setFrameView: (frameView) =>
    set((s) =>
      s.frameView === frameView || s.locked // a locked frame does not get re-posed
        ? s
        : { frameView, autoFit: frameView ? true : s.autoFit, frameToken: s.frameToken + 1 },
    ),

  // Asking for the lines back is the same as saying you are done practising.
  toggleGuides: () =>
    set((s) =>
      s.frameView ? { frameView: false, showGuides: true } : { showGuides: !s.showGuides },
    ),
  toggleLabels: () =>
    set((s) => (s.frameView ? { frameView: false, showLabels: true } : { showLabels: !s.showLabels })),

  // ── The cast ────────────────────────────────────────────────────────────
  addObject: (type) =>
    set((s) => {
      if (s.objects.length >= MAX_OBJECTS) return s;
      const id = `shape-${s.nextId}`;
      // Land beside whatever you were last working with, not back at the middle.
      const anchor = s.objects.find((o) => o.id === s.selectedId) ?? s.objects[s.objects.length - 1];
      const position = nextFreeSpot(s.objects.map((o) => o.position), anchor?.position);
      return {
        objects: [...s.objects, { id, type, position, elevation: anchor?.elevation ?? 0, rotation: 0 }],
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

  /** Spin a shape about its own upright axis. */
  setObjectRotation: (id, radians) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, rotation: normaliseSpin(radians) } : o)),
    })),

  /**
   * Lift a shape off the floor. It snaps onto whatever it is standing over, so
   * stacking lands square instead of hovering a hair above or sinking in.
   */
  setObjectElevation: (id, y) =>
    set((s) => {
      const self = s.objects.find((o) => o.id === id);
      if (!self) return s;
      const rest = supportTop(s.objects, s.shapeFrames, self);
      // The ceiling gives way to whatever you are standing on, so a shape can
      // always be stacked onto the one below even when that puts it past the
      // free-floating limit. Safe now only because runaway shadows are trimmed
      // at the floor rather than fenced off by a height rule.
      const ceiling = Math.max(OBJECT_LIFT.max, rest);
      const free = Math.min(Math.max(y, OBJECT_LIFT.min), ceiling);
      const elevation = Math.abs(free - rest) < 0.55 ? rest : free;
      return { objects: s.objects.map((o) => (o.id === id ? { ...o, elevation } : o)) };
    }),

  /** Drop a shape at a floor point, kept within its play area. */
  setObjectPosition: (id, x, z) =>
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === id ? { ...o, position: clampToDisc(x, z, OBJECT_RANGE) } : o,
      ),
    })),

  centerSelected: () =>
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === s.selectedId ? { ...o, position: [0, 0], elevation: 0 } : o,
      ),
    })),

  // First copy of a shape to mount wins; the rest find it already cached.
  setShapeFrame: (type, frame) =>
    set((s) => (s.shapeFrames[type] ? s : { shapeFrames: { ...s.shapeFrames, [type]: frame } })),

  // ── The light ───────────────────────────────────────────────────────────
  /** Swing the bulb to stand over a floor point, keeping its height. */
  setLightFromFloor: (x, z) => set(lightFromFloor(x, z)),

  /** Move the bulb freely in space — floor position and height together. */
  setLightFromPoint: (x, y, z) => set(lightFromPoint(x, y, z)),

  // Measured from the DOM, so identical measurements must not wake subscribers.
  setPanelInset: (right, bottom) =>
    set((s) =>
      s.panelInset.right === right && s.panelInset.bottom === bottom
        ? s
        : { panelInset: { right, bottom } },
    ),
}));

// What the scene actually draws. Frame view wins over both toggles, so practice
// mode cannot be half on.
export const guidesVisible = (s) => s.showGuides && !s.frameView;
export const labelsVisible = (s) => s.showLabels && !s.frameView;
