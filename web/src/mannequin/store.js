import { create } from "zustand";
import * as THREE from "three";

/**
 * The lay_figure rig has 17 poseable joints (the "_end" tip bones are not
 * rotated). Order here drives the sidebar list; `group` drives the sections.
 */
export const JOINTS = [
  { name: "waist", label: "Waist", group: "Core", hint: "Whole-body root" },
  { name: "body", label: "Torso", group: "Core", hint: "Bend / twist the chest" },
  { name: "head", label: "Head", group: "Core", hint: "Nod, turn, tilt" },

  { name: "l_shoulder", label: "Upper Arm", group: "Left Arm" },
  { name: "l_forearm", label: "Forearm (elbow)", group: "Left Arm" },
  { name: "l_hand", label: "Hand (wrist)", group: "Left Arm" },

  { name: "r_shoulder", label: "Upper Arm", group: "Right Arm" },
  { name: "r_forearm", label: "Forearm (elbow)", group: "Right Arm" },
  { name: "r_hand", label: "Hand (wrist)", group: "Right Arm" },

  { name: "l_thigh", label: "Thigh (hip)", group: "Left Leg" },
  { name: "l_shin", label: "Shin (knee)", group: "Left Leg" },
  { name: "l_ankle", label: "Ankle", group: "Left Leg" },
  { name: "l_foot", label: "Foot", group: "Left Leg" },

  { name: "r_thigh", label: "Thigh (hip)", group: "Right Leg" },
  { name: "r_shin", label: "Shin (knee)", group: "Right Leg" },
  { name: "r_ankle", label: "Ankle", group: "Right Leg" },
  { name: "r_foot", label: "Foot", group: "Right Leg" },
];

export const JOINT_LABEL = Object.fromEntries(
  JOINTS.map((j) => [j.name, j.label])
);

/** Left<->right pairs, used by Mirror. */
const MIRROR = {};
JOINTS.forEach((j) => {
  if (j.name.startsWith("l_")) MIRROR[j.name] = "r_" + j.name.slice(2);
  if (j.name.startsWith("r_")) MIRROR[j.name] = "l_" + j.name.slice(2);
});

const _euler = new THREE.Euler();

export const useStore = create((set, get) => ({
  bones: {}, // name -> THREE.Bone
  rest: {}, // name -> THREE.Quaternion (rest pose, for reset)
  ready: false,

  selected: null, // joint name currently being edited
  activePoseId: null, // id of the currently-applied library pose (for highlight)
  showHandles: true, // joint dots visible so you can click + pose
  gl: null, // renderer, captured for screenshots
  poseVersion: 0, // bump to notify the DOM that bones moved (presets, reset...)
  theme: "dark", // "dark" | "light" | "blueprint" — see themes.js

  /**
   * Called by <Mannequin> after the skeleton is discovered. The GLB scene is a
   * module-cached singleton whose bones we mutate in place, so on an SPA
   * remount the bones may still be posed. We snapshot the true T-pose rest into
   * each bone's userData the FIRST time it is seen and reuse it forever, so
   * rest never gets corrupted by a remount-after-posing.
   */
  setRig: (bones) => {
    const rest = {};
    for (const [name, bone] of Object.entries(bones)) {
      if (!bone.userData._rest) bone.userData._rest = bone.quaternion.clone();
      rest[name] = bone.userData._rest;
    }
    set({ bones, rest, ready: true });
  },

  /** Ground-snap hook registered by <Mannequin>; called by the tweener. */
  groundSnap: null,
  setGroundSnap: (fn) => set({ groundSnap: fn }),

  /** Returns the figure's live posed bounding Box3 (registered by <Mannequin>). */
  getBounds: null,
  setGetBounds: (fn) => set({ getBounds: fn }),

  /** Bumped whenever the camera should re-fit the figure (a pose was applied). */
  frameSeq: 0,
  requestFrame: () => set((s) => ({ frameSeq: s.frameSeq + 1 })),

  // Scene / render settings
  floorStyle: "auto", // "auto" (follow theme) | "grid" | "solid" | "none"
  autoRotate: false,
  autoRotateSpeed: 1.0,
  propId: "none",

  // Model / material settings
  material: "wood", // material preset id (see materials.js)
  wireframe: false,
  opacity: 1.0,
  showTexture: true,
  figureScale: 1.0,
  hideFigure: false, // used by prop-thumbnail renders

  setGL: (gl) => set({ gl }),
  setActivePose: (id) => set({ activePoseId: id }),
  // Selecting a joint to hand-edit cancels any transition + pose highlight.
  select: (name) => set((s) => ({ selected: name, transition: null, activePoseId: null })),
  toggleHandles: () => set((s) => ({ showHandles: !s.showHandles })),
  setShowHandles: (v) => set({ showHandles: !!v }),
  setTheme: (t) => set({ theme: t }),
  setFloorStyle: (v) => set({ floorStyle: v }),
  setAutoRotate: (v) => set({ autoRotate: !!v }),
  setAutoRotateSpeed: (v) => set({ autoRotateSpeed: v }),
  setProp: (id) => set({ propId: id }),
  setMaterial: (id) => set({ material: id }),
  setWireframe: (v) => set({ wireframe: !!v }),
  setOpacity: (v) => set({ opacity: v }),
  setShowTexture: (v) => set({ showTexture: !!v }),
  setFigureScale: (v) => set({ figureScale: v }),
  setHideFigure: (v) => set({ hideFigure: !!v }),

  // Any instant mutation (reset/mirror/randomize/applyPose/gizmo) bumps and
  // thereby cancels an in-flight slerp transition so the edit isn't overwritten.
  bump: () =>
    set((s) => ({
      poseVersion: s.poseVersion + 1,
      transition: s.transition ? null : s.transition,
    })),

  /** Read the current pose as { name: [x, y, z] } euler radians. */
  getPose: () => {
    const { bones } = get();
    const pose = {};
    for (const j of JOINTS) {
      const b = bones[j.name];
      if (b) pose[j.name] = [b.rotation.x, b.rotation.y, b.rotation.z];
    }
    return pose;
  },

  /** Apply a { name: [x, y, z] } pose. Missing joints are left untouched. */
  applyPose: (pose, { additive = false } = {}) => {
    const { bones, rest } = get();
    for (const j of JOINTS) {
      const b = bones[j.name];
      const r = pose[j.name];
      if (!b) continue;
      if (r) {
        if (additive) {
          // treat the pose value as an offset from rest
          b.quaternion.copy(rest[j.name]);
          _euler.set(r[0], r[1], r[2], "XYZ");
          b.quaternion.multiply(new THREE.Quaternion().setFromEuler(_euler));
        } else {
          b.rotation.set(r[0], r[1], r[2]);
        }
      }
    }
    get().bump();
    get().requestFrame();
  },

  /**
   * Queue a smooth (slerped) transition to an ABSOLUTE pose: bones named in
   * `pose` go to their target; every other bone eases back to rest. `additive`
   * treats pose values as offsets from rest (library/preset convention). The
   * <PoseTweener> in the scene performs the interpolation.
   */
  transition: null,
  queuePose: (pose, { additive = true, duration = 0.4 } = {}) =>
    set({ transition: { pose, additive, duration, seq: (get().transition?.seq || 0) + 1 } }),
  clearTransition: () => set({ transition: null }),

  resetBone: (name) => {
    const { bones, rest } = get();
    if (bones[name] && rest[name]) bones[name].quaternion.copy(rest[name]);
    set({ activePoseId: null });
    get().bump();
  },

  resetAll: () => {
    const { bones, rest } = get();
    for (const name of Object.keys(bones)) {
      if (rest[name]) bones[name].quaternion.copy(rest[name]);
    }
    set({ activePoseId: null });
    get().bump();
    get().requestFrame();
  },

  /** Copy every left-side joint onto its right-side twin (and vice-versa). */
  mirror: (dir = "l2r") => {
    const { bones } = get();
    for (const [from, to] of Object.entries(MIRROR)) {
      const wantSource =
        dir === "l2r" ? from.startsWith("l_") : from.startsWith("r_");
      if (!wantSource) continue;
      const src = bones[from];
      const dst = bones[to];
      if (!src || !dst) continue;
      // Mirror across the body's sagittal plane: keep pitch, flip yaw & roll.
      dst.rotation.set(src.rotation.x, -src.rotation.y, -src.rotation.z);
    }
    set({ activePoseId: null });
    get().bump();
    get().requestFrame();
  },

  /** Gentle random pose — enough to look alive, not enough to explode. */
  randomize: () => {
    const { bones, rest } = get();
    const rand = randSeeded(get().poseVersion + 1);
    const AMT = {
      waist: 0.15, body: 0.25, head: 0.4,
      l_shoulder: 0.9, r_shoulder: 0.9,
      l_forearm: 0.9, r_forearm: 0.9,
      l_hand: 0.4, r_hand: 0.4,
      l_thigh: 0.6, r_thigh: 0.6,
      l_shin: 0.6, r_shin: 0.6,
      l_ankle: 0.3, r_ankle: 0.3,
      l_foot: 0.2, r_foot: 0.2,
    };
    for (const j of JOINTS) {
      const b = bones[j.name];
      if (!b) continue;
      const a = AMT[j.name] ?? 0.3;
      b.quaternion.copy(rest[j.name]);
      _euler.set(
        (rand() - 0.5) * 2 * a,
        (rand() - 0.5) * 2 * a,
        (rand() - 0.5) * 2 * a,
        "XYZ"
      );
      b.quaternion.multiply(new THREE.Quaternion().setFromEuler(_euler));
    }
    set({ activePoseId: null });
    get().bump();
    get().requestFrame();
  },
}));

// Tiny deterministic PRNG so "Randomize" doesn't need Math.random at import time.
function randSeeded(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
