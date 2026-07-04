// ─────────────────────────────────────────────────────────────────────────
// Character registry.  Each entry is a selectable model in the Characters tab.
// A character is either NATIVE (already rigged with this studio's bone names —
// waist/body/head/l_shoulder/…) or a RETARGETED import (a Mixamo/other skeleton
// remapped at load so the 110-pose library drives it — see character/retarget.js).
//
// ── How to add a Mixamo character (legally, with YOUR own license) ──────────
//   1. On mixamo.com, pick a character, choose the T-POSE, and Download as
//      FORMAT = "glTF Binary (.glb)"  (or FBX → convert to .glb).
//   2. Drop the file in  web/public/models/  e.g.  models/mixamo-xbot.glb
//   3. Add an entry below with  retarget: MIXAMO_PROFILE.  Done — it appears in
//      the Characters tab and every pose/preset works on it.
//   Mixamo assets are Adobe-licensed for use in your project; do not commit
//   them to a public repo unless your license allows redistribution.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Retarget profile mapping THIS rig's bone names → the source skeleton's bone
 * names. `aliases` lets one rig bone try several source names (first hit wins),
 * which covers exports that strip the "mixamorig:" prefix or split the spine
 * differently. `prefixes` are tried in front of every name.
 */
export const MIXAMO_PROFILE = {
  id: "mixamo",
  label: "Mixamo skeleton",
  prefixes: ["mixamorig:", "mixamorig", ""],
  // rigBone -> preferred source bone (+ fallbacks)
  map: {
    waist: ["Hips"],
    body: ["Spine", "Spine1", "Spine2"],
    head: ["Head"],

    // NOTE: this rig's "shoulder" bone is the UPPER ARM joint, so it maps to
    // Mixamo's *Arm* (not *Shoulder*, which is the clavicle).
    l_shoulder: ["LeftArm"],
    l_forearm: ["LeftForeArm"],
    l_hand: ["LeftHand"],
    r_shoulder: ["RightArm"],
    r_forearm: ["RightForeArm"],
    r_hand: ["RightHand"],

    l_thigh: ["LeftUpLeg"],
    l_shin: ["LeftLeg"],
    l_ankle: ["LeftFoot"],
    l_foot: ["LeftToeBase", "LeftToe_End"],
    r_thigh: ["RightUpLeg"],
    r_shin: ["RightLeg"],
    r_ankle: ["RightFoot"],
    r_foot: ["RightToeBase", "RightToe_End"],
  },
  // Optional whole-model correction if a character imports facing away / on its
  // side. Euler degrees [x,y,z], applied to the model group. Tune per character.
  rootRotationDeg: [0, 0, 0],
};

export const CHARACTERS = [
  {
    id: "lay_figure",
    name: "Wooden Mannequin",
    blurb: "The native rigged lay figure — the reference rig for every pose.",
    url: "/models/lay_figure.glb",
    icon: "🪵",
    source: "native",
    retarget: null, // native rig — poses apply directly, no correction
  },

  {
    id: "mixamo-character",
    name: "Mixamo Character",
    blurb: "Imported Mixamo character (FBX, with skin). Driven by the full pose library.",
    url: "/models/start-plank-skin.fbx",
    icon: "🧍",
    source: "mixamo",
    retarget: MIXAMO_PROFILE,
  },

  // ── Add more the same way — drop a .glb or .fbx in public/models/ and copy
  //    an entry above. See public/models/README.md.
  // {
  //   id: "mixamo-xbot",
  //   name: "X Bot",
  //   url: "/models/mixamo-xbot.glb",
  //   icon: "🤖",
  //   source: "mixamo",
  //   retarget: MIXAMO_PROFILE,
  // },
];

export const CHARACTERS_BY_ID = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;
