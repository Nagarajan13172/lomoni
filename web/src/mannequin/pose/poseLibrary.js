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

/**
 * The full pose library, resolved once at module load into applyable offsets.
 * Shape: { id, name, category, icon, tags, desc, pose:{bone:[x,y,z]} }.
 */
export const POSE_LIBRARY = POSE_DATA.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  icon: p.icon || "🧍",
  tags: p.tags || [],
  desc: p.desc || "",
  pose: poseFromCalls(p.calls),
}));

/** Ordered category list (preserves authoring order). */
export const POSE_CATEGORIES = POSE_LIBRARY.reduce((acc, p) => {
  if (!acc.includes(p.category)) acc.push(p.category);
  return acc;
}, []);

export const POSES_BY_ID = Object.fromEntries(POSE_LIBRARY.map((p) => [p.id, p]));
