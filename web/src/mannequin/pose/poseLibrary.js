import { buildPose } from "./anatomy";
import { POSE_DATA } from "./poseData";

/** Resolve a list of [verb, ...args] anatomy calls into { bone: [x,y,z] }. */
export function poseFromCalls(calls) {
  return buildPose((a) => {
    for (const c of calls || []) {
      const [verb, ...args] = c;
      if (typeof a[verb] === "function") a[verb](...args);
    }
  });
}

// Upright library poses should keep the mannequin's world vertical fixed. Some
// authored poses include a small waist roll to match a reference image's slant,
// but for the studio render we want that tilt removed while keeping the pose.
const ROOT_ROLL_EXEMPT_CATEGORIES = new Set(["Lying & Reclining"]);

function stabilizeVerticalAxis(pose, category) {
  if (!pose?.waist || ROOT_ROLL_EXEMPT_CATEGORIES.has(category)) return pose;
  const [x = 0, y = 0, z = 0] = pose.waist;
  if (Math.abs(z) < 1e-4) return pose;
  return { ...pose, waist: [x, y, 0] };
}

/**
 * The full pose library, resolved once at module load into applyable offsets.
 * Shape: { id, name, category, icon, tags, desc, pose:{bone:[x,y,z]} }.
 */
export const POSE_LIBRARY = POSE_DATA.map((p) => {
  // A pose is authored either as anatomy `calls`, or as a raw `pose` object of
  // {bone:[x,y,z]} offsets (radians) — used by poses imported from motion clips
  // (see scripts/extract-fbx-pose.mjs), which are already in the source frame.
  const pose = p.pose || poseFromCalls(p.calls);
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    icon: p.icon || "🧍",
    tags: p.tags || [],
    desc: p.desc || "",
    pose,
    renderPose: stabilizeVerticalAxis(pose, p.category),
  };
});

/** Ordered category list (preserves authoring order). */
export const POSE_CATEGORIES = POSE_LIBRARY.reduce((acc, p) => {
  if (!acc.includes(p.category)) acc.push(p.category);
  return acc;
}, []);

export const POSES_BY_ID = Object.fromEntries(POSE_LIBRARY.map((p) => [p.id, p]));
