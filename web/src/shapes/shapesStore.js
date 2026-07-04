import { create } from "zustand";
import { SHAPES } from "./shapes";

/**
 * Minimal store for the Shapes sandbox: which single shape is on display, and
 * where the one light sits (its direction around the scene + its height). Move
 * those two and the shadow follows. Nothing else to tweak.
 */
export const useShapes = create((set) => ({
  shape: SHAPES[0].type, // the one shape on the floor
  azimuth: 40, // light direction around the scene (degrees)
  elevation: 50, // light height above the horizon (degrees)

  setShape: (shape) => set({ shape }),
  setAzimuth: (azimuth) => set({ azimuth }),
  setElevation: (elevation) => set({ elevation }),
}));
