import * as THREE from "three";

/**
 * Anatomical pose engine for the lay_figure rig.
 *
 * Calibrated conventions (world frame): UP=+Y, model-LEFT=+X, FORWARD=+Z.
 * Rest pose is a T-POSE (arms horizontal). Every helper below is expressed as a
 * rotation about a bone's LOCAL axis, with the sign/axis derived empirically
 * (see _calibrate.mjs / _hinges.mjs). Poses are built by composing per-joint
 * QUATERNIONS (so multi-DOF joints like shoulders/hips are exact, not
 * euler-approximated), then decomposed to euler offsets from rest — which is
 * exactly what the store applies additively (finalQuat = rest ⊗ offset).
 *
 * Degrees throughout. `side` is "l" or "r".
 */

const D = Math.PI / 180;
const AX = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
  Z: new THREE.Vector3(0, 0, 1),
};
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

function makeApi(rot) {
  const api = {
    // ---------------- CORE ----------------
    // body/waist/head local frame: X+ = flex forward, Y+ = twist LEFT, Z+ = side-bend RIGHT.
    /** Bend the chest forward (+) / backward via bendBack. */
    bendForward: (d) => rot("body", "X", +d),
    bendBack: (d) => rot("body", "X", -d),
    /** Tip the whole figure at the waist (root). */
    leanForward: (d) => rot("waist", "X", +d),
    leanBack: (d) => rot("waist", "X", -d),
    /** Axial twist of the torso; + turns chest to the model's LEFT. */
    twist: (d) => rot("body", "Y", +d),
    /** Lateral side-bend of the torso; + leans to the model's LEFT. */
    sideBend: (d) => rot("body", "Z", -d),
    /** Shift/tilt the hips at the waist; + toward LEFT (for contrapposto). */
    hipSway: (d) => rot("waist", "Z", -d),
    /** Turn the whole figure about the vertical axis; + toward LEFT. */
    turnBody: (d) => rot("waist", "Y", +d),

    // ---------------- HEAD ----------------
    headNod: (d) => rot("head", "X", +d), // + chin down
    headTurn: (d) => rot("head", "Y", +d), // + toward LEFT
    headTilt: (d) => rot("head", "Z", -d), // + ear toward LEFT shoulder

    // ---------------- ARMS (T-pose rest) ----------------
    // shoulder local frame: X+ = raise (both sides), Z = fwd/back (mirrored), Y = twist.
    /** Lower a raised (T-pose) arm toward the side. 90 ≈ straight down. */
    lowerArm: (side, d) => rot(side + "_shoulder", "X", -d),
    /** Raise the arm from the side up/overhead. */
    raiseArm: (side, d) => rot(side + "_shoulder", "X", +d),
    /** Swing the arm forward (sagittal flexion, toward the camera). */
    armForward: (side, d) => rot(side + "_shoulder", "Z", side === "l" ? -d : +d),
    /** Swing the arm backward (sagittal extension). */
    armBack: (side, d) => rot(side + "_shoulder", "Z", side === "l" ? +d : -d),
    /** Internal/external twist of the upper arm. */
    armTwist: (side, d) => rot(side + "_shoulder", "Y", side === "l" ? +d : -d),

    /** Bend the elbow; forearm curls forward. 0=straight, ~150=fully bent. */
    elbow: (side, d) => rot(side + "_forearm", "Z", side === "l" ? -d : +d),
    /** Curl the elbow upward instead of forward (alt hinge). */
    elbowUp: (side, d) => rot(side + "_forearm", "X", +d),
    /** Pronate/supinate the forearm. */
    forearmTwist: (side, d) => rot(side + "_forearm", "Y", side === "l" ? +d : -d),

    /** Bend the wrist up(+)/down(-). */
    wrist: (side, d) => rot(side + "_hand", "X", +d),
    /** Deviate the wrist sideways. */
    wristSide: (side, d) => rot(side + "_hand", "Z", side === "l" ? -d : +d),

    // ---------------- LEGS (standing rest) ----------------
    // thigh local frame: X+ = flex forward, Z = abduct/adduct (mirrored), Y = rotate.
    /** Raise the thigh forward (hip flexion — knee comes up/forward). */
    hipFlex: (side, d) => rot(side + "_thigh", "X", +d),
    /** Swing the thigh backward (hip extension). */
    hipExtend: (side, d) => rot(side + "_thigh", "X", -d),
    /** Spread the leg out to the side (abduction). */
    hipAbduct: (side, d) => rot(side + "_thigh", "Z", side === "l" ? +d : -d),
    /** Bring the leg across the midline (adduction). */
    hipAdduct: (side, d) => rot(side + "_thigh", "Z", side === "l" ? -d : +d),
    /** Rotate the thigh about its long axis. */
    hipRotate: (side, d) => rot(side + "_thigh", "Y", side === "l" ? +d : -d),

    /** Bend the knee (heel toward glutes). 0=straight, ~140=deep bend. */
    knee: (side, d) => rot(side + "_shin", "X", -d),

    /** Dorsiflex (+ toe up) / plantarflex (- toe down) the ankle. */
    ankle: (side, d) => rot(side + "_ankle", "X", +d),
    /** Tilt the foot inward/outward. */
    footTilt: (side, d) => rot(side + "_foot", "Z", side === "l" ? +d : -d),

    // ---------------- ESCAPE HATCH ----------------
    /** Raw local-axis rotation for a specific bone (axis: "X"|"Y"|"Z"). */
    raw: (bone, axis, d) => rot(bone, axis, d),

    // ---------------- CONVENIENCE ----------------
    /** Natural relaxed arms at the sides (slight forward + slight elbow). */
    relaxArms: (bend = 12) => {
      api.lowerArm("l", 78); api.lowerArm("r", 78);
      api.armForward("l", 8); api.armForward("r", 8);
      api.elbow("l", bend); api.elbow("r", bend);
    },
    /** Apply a mirrored copy of a callback to both sides. */
    both: (fn) => { fn("l"); fn("r"); },
  };
  return api;
}

/**
 * Build a pose. `fn(api)` issues anatomical calls; returns { bone: [x,y,z] }
 * euler offsets from rest (radians), ready to store as a preset and apply
 * additively via the store.
 */
export function buildPose(fn) {
  const off = {}; // bone -> THREE.Quaternion
  const rot = (bone, axis, deg) => {
    if (!deg) return;
    (off[bone] || (off[bone] = new THREE.Quaternion())).multiply(
      _q.setFromAxisAngle(AX[axis], deg * D)
    );
  };
  fn(makeApi(rot));
  const pose = {};
  for (const b in off) {
    _e.setFromQuaternion(off[b], "XYZ");
    pose[b] = [round(_e.x), round(_e.y), round(_e.z)];
  }
  return pose;
}

const round = (v) => Math.round(v * 10000) / 10000;
