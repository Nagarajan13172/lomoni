// Extract a static pose from a Mixamo motion FBX and convert it into this
// studio's SOURCE-frame pose format (offsets in the lay figure's bone frame),
// so the resulting pose drives the wooden mannequin directly AND any Mixamo
// character via the runtime retarget.
//
// Usage: node scripts/extract-fbx-pose.mjs "<file.fbx>" [sampleFraction 0..1]
import fs from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { LAY_FIGURE_REST_WORLD } from "../src/mannequin/scene/layFigureRef.js";

const FILE = process.argv[2] || "../Start Plank.fbx";
const FRAC = process.argv[3] != null ? Number(process.argv[3]) : 1.0; // 1 = last frame (settled plank)

// rigBone -> mixamo BASE bone name. FBXLoader strips the ":" so we try several
// prefixes (mixamorig:, mixamorig, none) when resolving — same as MIXAMO_PROFILE.
const MAP = {
  waist: "Hips", body: "Spine", head: "Head",
  l_shoulder: "LeftArm", l_forearm: "LeftForeArm", l_hand: "LeftHand",
  r_shoulder: "RightArm", r_forearm: "RightForeArm", r_hand: "RightHand",
  l_thigh: "LeftUpLeg", l_shin: "LeftLeg", l_ankle: "LeftFoot", l_foot: "LeftToeBase",
  r_thigh: "RightUpLeg", r_shin: "RightLeg", r_ankle: "RightFoot", r_foot: "RightToeBase",
};
const PREFIXES = ["mixamorig:", "mixamorig", ""];
const resolveBone = (bonesMap, base) => {
  for (const p of PREFIXES) { const b = bonesMap.get(p + base); if (b) return b; }
  return null;
};

const buf = fs.readFileSync(FILE);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const root = new FBXLoader().parse(ab, "");

// Index bones by name; capture REST (bind) local + world quaternions BEFORE anim.
root.updateWorldMatrix(true, true);
const bones = new Map();
root.traverse((o) => { if (o.isBone || o.type === "Bone") bones.set(o.name, o); });

const restLocal = new Map();
const restWorld = new Map();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
for (const [rig, base] of Object.entries(MAP)) {
  const b = resolveBone(bones, base);
  if (!b) continue;
  restLocal.set(rig, b.quaternion.clone());
  b.matrixWorld.decompose(_p, _q, _s);
  restWorld.set(rig, _q.clone());
}

// Sample the animation clip.
const clip = root.animations?.[0];
if (!clip) { console.error("No animation clip in FBX."); process.exit(1); }
const mixer = new THREE.AnimationMixer(root);
const action = mixer.clipAction(clip);
action.play();
const t = Math.max(0, Math.min(1, FRAC)) * clip.duration;
mixer.setTime(t);
root.updateWorldMatrix(true, true);
console.error(`Clip "${clip.name}" duration=${clip.duration.toFixed(3)}s, sampling t=${t.toFixed(3)}s`);

// For each mapped bone:  Δ_mixamo = restLocal⁻¹ · animLocal ; C = Wtgt⁻¹·Wsrc ;
// Δ_src = C⁻¹ · Δ_mixamo · C ; store euler XYZ (radians).
const pose = {};
const _e = new THREE.Euler();
const round = (v) => Math.round(v * 10000) / 10000;
for (const [rig, base] of Object.entries(MAP)) {
  const b = resolveBone(bones, base);
  const ref = LAY_FIGURE_REST_WORLD[rig];
  if (!b || !ref || !restLocal.has(rig)) continue;

  const animLocal = b.quaternion.clone();
  const dMix = restLocal.get(rig).clone().invert().multiply(animLocal);

  const Wsrc = new THREE.Quaternion(ref[0], ref[1], ref[2], ref[3]);
  const Wtgt = restWorld.get(rig);
  const C = Wtgt.clone().invert().multiply(Wsrc);
  const Cinv = C.clone().invert();
  const dSrc = Cinv.clone().multiply(dMix).multiply(C); // C⁻¹·Δ·C

  _e.setFromQuaternion(dSrc, "XYZ");
  const arr = [round(_e.x), round(_e.y), round(_e.z)];
  // Drop negligible joints to keep the pose readable.
  if (Math.hypot(...arr) > 0.02) pose[rig] = arr;
}

console.error(`Mapped ${Object.keys(pose).length} joints.`);
console.log(JSON.stringify(pose, null, 1));
