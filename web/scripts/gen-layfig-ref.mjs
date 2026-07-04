// Extracts the lay_figure rig's REST-POSE world orientation for each poseable
// bone, straight from the GLB's node hierarchy. These world quaternions are the
// "source frame" the whole pose library was authored in; the Mixamo retarget
// uses them to re-express each authored local offset into a target skeleton's
// bone frame. Output: web/src/mannequin/scene/layFigureRef.js
import fs from "node:fs";
import * as THREE from "three";

const GLB = "/Users/nagarajan/playground/lomoni/web/public/models/lay_figure.glb";
const OUT = "/Users/nagarajan/playground/lomoni/web/src/mannequin/scene/layFigureRef.js";

const RIG_BONES = [
  "waist", "body", "head",
  "l_shoulder", "l_forearm", "l_hand",
  "r_shoulder", "r_forearm", "r_hand",
  "l_thigh", "l_shin", "l_ankle", "l_foot",
  "r_thigh", "r_shin", "r_ankle", "r_foot",
];

// ── Parse GLB → glTF JSON ──
const buf = fs.readFileSync(GLB);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
const nodes = gltf.nodes || [];

// local matrix for a node (matrix takes precedence over TRS if present)
function localMatrix(n) {
  const m = new THREE.Matrix4();
  if (n.matrix) return m.fromArray(n.matrix);
  const t = n.translation || [0, 0, 0];
  const r = n.rotation || [0, 0, 0, 1];
  const s = n.scale || [1, 1, 1];
  return m.compose(
    new THREE.Vector3(t[0], t[1], t[2]),
    new THREE.Quaternion(r[0], r[1], r[2], r[3]),
    new THREE.Vector3(s[0], s[1], s[2])
  );
}

// world matrix by walking parent chain (build child→parent index once)
const parent = new Array(nodes.length).fill(-1);
nodes.forEach((n, i) => (n.children || []).forEach((c) => (parent[c] = i)));
const byName = new Map();
nodes.forEach((n, i) => { if (n.name) byName.set(n.name, i); });

function worldMatrix(i) {
  const chain = [];
  for (let k = i; k !== -1; k = parent[k]) chain.push(k);
  const m = new THREE.Matrix4();
  for (let c = chain.length - 1; c >= 0; c--) m.multiply(localMatrix(nodes[chain[c]]));
  return m;
}

const ref = {};
const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
let missing = [];
for (const b of RIG_BONES) {
  if (!byName.has(b)) { missing.push(b); continue; }
  worldMatrix(byName.get(b)).decompose(pos, quat, scl);
  ref[b] = [round(quat.x), round(quat.y), round(quat.z), round(quat.w)];
}
if (missing.length) { console.error("Missing bones in GLB:", missing.join(", ")); process.exit(1); }

function round(v) { return Math.round(v * 1e6) / 1e6; }

const body =
`// AUTO-GENERATED from public/models/lay_figure.glb — do not edit by hand.
// Rest-pose WORLD quaternion [x,y,z,w] of each poseable bone in the lay figure
// rig. This is the source frame the entire pose library is authored in; the
// character retarget (character/retarget.js) uses it to map authored local
// offsets onto a differently-oriented skeleton (e.g. Mixamo). Regenerate with
// scripts/gen-layfig-ref.mjs if the base rig ever changes.

export const LAY_FIGURE_REST_WORLD = ${JSON.stringify(ref, null, 2)};
`;

fs.writeFileSync(OUT, body);
console.log(`Wrote ${OUT} with ${Object.keys(ref).length} bone reference quaternions.`);
console.log(ref);
