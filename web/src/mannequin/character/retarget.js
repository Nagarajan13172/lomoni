import * as THREE from "three";
import { LAY_FIGURE_REST_WORLD } from "../scene/layFigureRef";

/**
 * Retarget an imported skeleton (e.g. Mixamo) onto this studio's rig so the
 * existing pose library drives it unchanged.
 *
 * Two problems are solved:
 *  1. NAMING — the store poses bones by name (waist, l_shoulder, …). We build a
 *     bone map under THOSE names, pointing at the source skeleton's bone objects
 *     (mixamorig:Hips, mixamorig:LeftArm, …) resolved via the profile.
 *  2. ORIENTATION — a pose value is a LOCAL rotation authored in the lay figure's
 *     bone frame. The source bone's local frame is oriented differently, so we
 *     precompute a per-bone correction  C = Wtarget⁻¹ · Wsource  (from the two
 *     rest-pose WORLD orientations). The store then applies  Δ' = C · Δ · C⁻¹,
 *     which reproduces the SAME world-space limb rotation on the new skeleton.
 *
 * Native characters (retarget === null) return no bone remap and no corrections,
 * so their behaviour is byte-for-byte unchanged.
 */
export function buildRetargetRig(root, profile) {
  root.updateWorldMatrix(true, true);

  // A Mixamo "with skin" export ships the character as multiple skinned meshes
  // (e.g. Beta_Surface + Beta_Joints), EACH with its own copy of the skeleton.
  // Posing bones by name would move only one mesh and freeze the rest. So we
  // pick ONE skeleton to pose (the richest) and make every OTHER skeleton's
  // same-named bone SHARE the primary bone's live quaternion instance — the
  // store mutates rotations in place, so all meshes then deform together.
  const skeletons = [];
  root.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton && !skeletons.includes(o.skeleton)) {
      skeletons.push(o.skeleton);
    }
  });

  const byName = new Map();
  let contacts = [];
  const sync = []; // [secondaryBone, primaryBone] pairs, mirrored every frame
  if (skeletons.length) {
    const primary = skeletons.reduce((a, b) => (b.bones.length > a.bones.length ? b : a));
    for (const b of primary.bones) byName.set(b.name, b);
    contacts = primary.bones.slice();
    // `bone.quaternion` is read-only, so we can't share the instance. Instead
    // record pairs; <CharacterRig> copies primary→secondary rotations per frame
    // so every mesh's skeleton stays in lock-step with the posed one.
    for (const sk of skeletons) {
      if (sk === primary) continue;
      for (const b of sk.bones) {
        const p = byName.get(b.name);
        if (p && b !== p) sync.push([b, p]);
      }
    }
  } else {
    // No skinned mesh (rare): fall back to a plain bone traverse.
    root.traverse((o) => {
      if (o.isBone || o.type === "Bone") { byName.set(o.name, o); contacts.push(o); }
    });
    if (byName.size === 0) root.traverse((o) => byName.get(o.name) || byName.set(o.name, o));
  }

  const resolve = (candidates) => {
    for (const base of candidates) {
      for (const p of profile.prefixes) {
        const hit = byName.get(p + base);
        if (hit) return hit;
      }
    }
    return null;
  };

  const bones = {};
  const corrections = {};
  const matched = [];
  const missing = [];

  const Wsrc = new THREE.Quaternion();
  const Wtgt = new THREE.Quaternion();
  const _p = new THREE.Vector3();
  const _s = new THREE.Vector3();

  for (const [rigBone, candidates] of Object.entries(profile.map)) {
    const bone = resolve(candidates);
    const ref = LAY_FIGURE_REST_WORLD[rigBone];
    if (!bone || !ref) {
      missing.push(rigBone);
      continue;
    }
    bones[rigBone] = bone;
    matched.push(rigBone);

    // Wsource = lay figure rest world orientation (authoring frame).
    Wsrc.set(ref[0], ref[1], ref[2], ref[3]);
    // Wtarget = this bone's rest world orientation in the imported model.
    bone.matrixWorld.decompose(_p, Wtgt, _s);

    // C = Wtgt⁻¹ · Wsrc   (stored; store applies Δ' = C·Δ·C⁻¹)
    const C = Wtgt.clone().invert().multiply(Wsrc);
    corrections[rigBone] = C;
  }

  return {
    bones,
    corrections,
    contacts,
    sync,
    report: { matched, missing, total: Object.keys(profile.map).length },
  };
}

/**
 * Transform a pose offset (authored in the lay figure's bone frame) into the
 * imported bone's frame:  Δ' = C · Δ · C⁻¹.  Returns a NEW quaternion; `C` is
 * the correction from buildRetargetRig. With no correction the offset is used
 * as-is (native rig), so this is a no-op for the wooden mannequin.
 */
export function applyBoneCorrection(C, qOffset) {
  if (!C) return qOffset;
  return C.clone().multiply(qOffset).multiply(C.clone().invert());
}

/**
 * Native path: discover bones straight off the model by their own names
 * (identical to the original <Mannequin> behaviour). No corrections. Contacts
 * are every joint bone plus the "_end" tip nodes (toes/fingertips/head-top),
 * used for grounding + camera framing.
 */
export function buildNativeRig(root) {
  const bones = {};
  const contacts = [];
  root.traverse((o) => {
    if (o.isBone) { bones[o.name] = o; contacts.push(o); }
    else if (o.name && o.name.endsWith("_end")) contacts.push(o);
  });
  return { bones, corrections: null, report: null, contacts };
}

/**
 * Surgically remove the joint-ball geometry weighted to specific bones from a
 * skinned mesh — e.g. drop ONLY the knee balls (LeftLeg/RightLeg) from Mixamo's
 * Beta_Joints accent layer while keeping every other ball. Rebuilds the triangle
 * index, dropping any triangle that touches a vertex whose dominant skin weight
 * is one of `boneSuffixes`. Idempotent (guarded per mesh); leaves the vertex
 * buffers untouched so nothing else is disturbed.
 */
export function stripJointBalls(mesh, boneSuffixes) {
  const geo = mesh.geometry;
  const si = geo?.attributes?.skinIndex;
  const sw = geo?.attributes?.skinWeight;
  if (!si || !sw || !mesh.skeleton || mesh.userData._ballsStripped) return;

  const kill = new Set();
  mesh.skeleton.bones.forEach((b, i) => {
    if (boneSuffixes.some((n) => b.name.endsWith(n))) kill.add(i);
  });
  if (!kill.size) return;

  const dominant = (v) => {
    const idx = [si.getX(v), si.getY(v), si.getZ(v), si.getW(v)];
    const wt = [sw.getX(v), sw.getY(v), sw.getZ(v), sw.getW(v)];
    let b = 0;
    for (let k = 1; k < 4; k++) if (wt[k] > wt[b]) b = k;
    return idx[b];
  };
  const marked = new Uint8Array(si.count);
  for (let v = 0; v < si.count; v++) if (kill.has(dominant(v))) marked[v] = 1;

  const keep = [];
  const index = geo.index;
  if (index) {
    for (let t = 0; t < index.count; t += 3) {
      const a = index.getX(t), b = index.getX(t + 1), c = index.getX(t + 2);
      if (!(marked[a] || marked[b] || marked[c])) keep.push(a, b, c);
    }
  } else {
    for (let v = 0; v < si.count; v += 3) {
      if (!(marked[v] || marked[v + 1] || marked[v + 2])) keep.push(v, v + 1, v + 2);
    }
  }
  geo.setIndex(keep);
  mesh.userData._ballsStripped = true;
}
