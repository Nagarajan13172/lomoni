import { create } from "zustand";
import { SHAPES } from "./shapes";

/**
 * Minimal store for the Shapes sandbox: which single shape is on display, and
 * where the one visible light source sits around it. The user thinks in light
 * angles, so we store top-angle + height + distance and derive the 3D position
 * from those values in the scene.
 */
export const useShapes = create((set) => ({
  shape: SHAPES[0].type, // the one shape on the floor
  azimuth: 40, // top-view angle around the shape
  elevation: 50, // how high the light sits
  radius: 18, // how far the light is from the shape
  guideFrame: null,

  setShape: (shape) => set({ shape }),
  setAzimuth: (azimuth) => set({ azimuth }),
  setElevation: (elevation) => set({ elevation }),
  setRadius: (radius) => set({ radius }),
  setGuideFrame: (guideFrame) => set({ guideFrame }),
}));
