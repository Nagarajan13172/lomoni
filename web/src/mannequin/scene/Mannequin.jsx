import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";
import { getTheme } from "./themes";
import { getMaterial } from "./materials";
import { CHARACTERS_BY_ID, DEFAULT_CHARACTER_ID } from "../character/characters";
import { buildNativeRig, buildRetargetRig, stripJointBalls } from "../character/retarget";

const DEFAULT_MODEL_URL = CHARACTERS_BY_ID[DEFAULT_CHARACTER_ID].url;
const TARGET_HEIGHT = 3; // world units
const D2R = Math.PI / 180;
// Lifts the figure a hair so the sole rests ON the floor instead of the lowest
// JOINT pivot (the mesh surface sits ~this far below the ankle/toe bone). World
// units at figureScale=1; scaled with the figure so the gap stays proportional.
const GROUND_PAD = 0.05;

/**
 * Rigs an already-loaded model (`model`): discovers/remaps the skeleton, wires
 * shadows, applies material/display/theme settings, normalises scale, and
 * re-grounds the figure on every pose change so feet/body never float or clip
 * through the floor. The GLB/FBX loading is done by the thin wrappers below so
 * the (unconditional) loader hook matches the file format.
 */
function CharacterRig({ model, character, ...props }) {
  const isNative = character.source === "native";

  const setRig = useStore((s) => s.setRig);
  const setCorrections = useStore((s) => s.setCorrections);
  const setGroundSnap = useStore((s) => s.setGroundSnap);
  const setGetBounds = useStore((s) => s.setGetBounds);
  const outer = useRef();

  // Discover the skeleton and (for imports) remap it onto this rig's bone names
  // plus per-bone rotation corrections so the authored pose library drives it.
  const rig = useMemo(() => {
    return character.retarget
      ? buildRetargetRig(model, character.retarget)
      : buildNativeRig(model);
  }, [model, character.retarget]);
  const bones = rig.bones;

  // Cache original maps + collect skinned meshes once.
  const meshes = useMemo(() => {
    const arr = [];
    model.traverse((o) => {
      if (o.isMesh) {
        arr.push(o);
        if (!o.userData._orig) {
          const m = o.material;
          o.userData._orig = {
            map: m.map || null,
            normalMap: m.normalMap || null,
            roughnessMap: m.roughnessMap || null,
            metalnessMap: m.metalnessMap || null,
            aoMap: m.aoMap || null,
          };
        }
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false; // skinned bounds are wrong once posed
      }
    });
    return arr;
  }, [model]);

  // Remove selected joint balls (e.g. the knee balls) from a character's ball-
  // joint accent mesh (Mixamo's *Joints* layer), keeping every other joint.
  useLayoutEffect(() => {
    const suffixes = character.removeJointBalls;
    if (!suffixes?.length) return;
    for (const o of meshes) {
      if (o.isSkinnedMesh && /joint/i.test(o.name)) stripJointBalls(o, suffixes);
    }
  }, [meshes, character.removeJointBalls]);

  // Contact points for grounding/framing (from the active rig): joint bones plus
  // "_end" tips (native), or the primary skeleton's bones (imports). Their world
  // matrices are authoritative (they drive the GPU skin), unlike a CPU re-skin of
  // the mesh vertices — which double-applies post-bind ancestor scale and drifts
  // the figure off the floor. Bones can't lie.
  const contacts = rig.contacts;

  // ---- Settings ----
  const themeId = useStore((s) => s.theme);
  const materialId = useStore((s) => s.material);
  const wireframe = useStore((s) => s.wireframe);
  const opacity = useStore((s) => s.opacity);
  const showTexture = useStore((s) => s.showTexture);
  const figureScale = useStore((s) => s.figureScale);
  const poseVersion = useStore((s) => s.poseVersion);
  const hideFigure = useStore((s) => s.hideFigure);

  // Material preset / texture / theme → rebuild maps (needsUpdate only here).
  // Only the native mannequin gets the studio material presets (wood/clay/…);
  // imported characters keep their own PBR textures so a soldier doesn't render
  // as a wooden dummy. They still receive shadows + wireframe/opacity toggles.
  useLayoutEffect(() => {
    if (!isNative) return;
    const theme = getTheme(themeId);
    const preset = getMaterial(materialId);
    const envScale = theme.envMapIntensity / 0.75;
    for (const o of meshes) {
      const orig = o.userData._orig;
      let mat = o.userData._activeMat;
      if (!mat) {
        mat = new THREE.MeshPhysicalMaterial();
        o.userData._activeMat = mat;
        o.material = mat;
      }
      mat.color.set(preset.color);
      mat.roughness = preset.roughness;
      mat.metalness = preset.metalness;
      mat.clearcoat = preset.clearcoat || 0;
      mat.clearcoatRoughness = preset.clearcoatRoughness || 0;
      mat.map = preset.keepMap && showTexture ? orig.map : null;
      mat.normalMap = preset.keepNormal ? orig.normalMap : null;
      if (mat.normalMap) {
        const ns = preset.normalScale ?? 1;
        mat.normalScale.set(ns, ns);
      }
      mat.roughnessMap = preset.keepMap ? orig.roughnessMap : null;
      mat.metalnessMap = preset.keepMap ? orig.metalnessMap : null;
      mat.aoMap = preset.keepMap ? orig.aoMap : null;
      mat.envMapIntensity = preset.env * envScale;
      mat.side = THREE.FrontSide;
      mat.needsUpdate = true; // map/define set may have changed
    }
  }, [meshes, themeId, materialId, showTexture, isNative]);

  // Wireframe / opacity → dynamic params only (no shader recompile). Falls back
  // to the character's own material when there's no studio material (imports).
  useLayoutEffect(() => {
    for (const o of meshes) {
      const mat = o.userData._activeMat || o.material;
      if (!mat) continue;
      mat.wireframe = wireframe;
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.depthWrite = opacity >= 1;
    }
  }, [meshes, wireframe, opacity]);

  // Base scale from rest height (computed once per model). Also measures the
  // ground pad: how far the lowest contact BONE sits above the true mesh sole at
  // bind pose, as a scale-invariant fraction of height. Different rigs place the
  // toe/ankle bone at different heights above the foot mesh, so a fixed pad
  // floats or sinks imported characters — this makes the actual feet rest on the
  // floor. Native rig keeps its tuned GROUND_PAD (null ratio).
  const baseScale = useRef(1);
  const soleRatioRef = useRef(null);
  useLayoutEffect(() => {
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    baseScale.current = TARGET_HEIGHT / (size.y || 1);

    if (isNative) {
      soleRatioRef.current = null;
    } else {
      let lowestBone = Infinity;
      for (const o of contacts) {
        const y = o.matrixWorld.elements[13];
        if (y < lowestBone) lowestBone = y;
      }
      const gap = Number.isFinite(lowestBone) ? lowestBone - box.min.y : 0;
      soleRatioRef.current = Math.max(0, gap / (size.y || 1));
    }
  }, [model, contacts, isNative]);

  // Ground-snap: scale, then drop the lowest posed joint to the floor. Recomputed
  // from scratch every call (position reset to 0 first), so nothing accumulates.
  const figureScaleRef = useRef(figureScale);
  figureScaleRef.current = figureScale;
  const doGroundSnap = useCallback(() => {
    const g = outer.current;
    if (!g) return;
    const fs = figureScaleRef.current;
    g.scale.setScalar(baseScale.current * fs);
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);
    let lowest = Infinity;
    for (const o of contacts) {
      const y = o.matrixWorld.elements[13]; // world Y (matches the rendered skin)
      if (y < lowest) lowest = y;
    }
    // Pad = measured bone→sole gap for imports, else the tuned lay-figure const.
    const pad =
      soleRatioRef.current != null
        ? soleRatioRef.current * TARGET_HEIGHT * fs
        : GROUND_PAD * fs;
    if (Number.isFinite(lowest)) g.position.y = -lowest + pad;
  }, [contacts]);

  // Register the snap for the tweener (keeps grounded through a slerp).
  useEffect(() => {
    setGroundSnap(doGroundSnap);
    return () => setGroundSnap(null);
  }, [doGroundSnap, setGroundSnap]);

  // Register a live posed-bounds getter for the camera auto-frame.
  useEffect(() => {
    const fn = () => {
      const g = outer.current;
      if (!g) return null;
      g.updateWorldMatrix(true, true);
      _box.makeEmpty();
      for (const o of contacts) {
        const e = o.matrixWorld.elements;
        _v.set(e[12], e[13], e[14]);
        _box.expandByPoint(_v);
      }
      return _box.isEmpty() ? null : _box.clone();
    };
    setGetBounds(fn);
    return () => setGetBounds(null);
  }, [contacts, setGetBounds]);

  // Re-ground on pose/scale change.
  useLayoutEffect(() => {
    doGroundSnap();
  }, [model, doGroundSnap, figureScale, poseVersion]);

  // Keep the figure grounded EVERY frame while a slerp transition is running,
  // so it never floats/sinks mid-transition (the store-hook path was unreliable).
  // Also mirror the posed (primary) skeleton onto any secondary skeletons of a
  // multi-mesh import so every part of the character deforms together.
  const syncPairs = rig.sync;
  useFrame(() => {
    if (syncPairs) {
      for (let i = 0; i < syncPairs.length; i++) {
        syncPairs[i][0].quaternion.copy(syncPairs[i][1].quaternion);
      }
    }
    if (useStore.getState().transition) doGroundSnap();
  });

  // Optional whole-model facing correction for imports (e.g. a character that
  // comes in facing away). Reset to 0 for the native rig.
  useLayoutEffect(() => {
    const [rx = 0, ry = 0, rz = 0] = character.retarget?.rootRotationDeg || [0, 0, 0];
    model.rotation.set(rx * D2R, ry * D2R, rz * D2R);
  }, [model, character.retarget]);

  useEffect(() => {
    setRig(bones);
    setCorrections(rig.corrections, rig.report);
    if (rig.report?.missing?.length) {
      console.warn(
        `[character] "${character.name}": unmapped bones →`,
        rig.report.missing.join(", ")
      );
    }
    // Carry a pose across a character swap: re-apply it (retargeted to this new
    // rig) instead of snapping back to rest, then clear it.
    const pending = useStore.getState().pendingPose;
    if (pending) {
      useStore.getState().applyPose(pending, { additive: true });
      useStore.setState({ pendingPose: null });
    }
  }, [bones, rig, setRig, setCorrections, character.name]);

  // Restore the shared/cached scene to its rest pose on unmount so a later
  // remount doesn't start from a stale pose.
  useEffect(() => {
    return () => {
      for (const b of Object.values(bones)) {
        if (b.userData._rest) b.quaternion.copy(b.userData._rest);
      }
    };
  }, [bones]);

  if (hideFigure) return null; // prop-thumbnail renders show the prop alone

  return (
    <group ref={outer} {...props}>
      <primitive object={model} />
    </group>
  );
}

// Scratch objects for the bone-based posed bounding box (ground-snap + framing).
const _v = new THREE.Vector3();
const _box = new THREE.Box3();

// ── Format-specific loaders ────────────────────────────────────────────────
// Hooks can't be called conditionally, so each format has its own tiny wrapper
// that calls the matching loader and hands the loaded object to <CharacterRig>.
function GlbCharacter({ character, ...props }) {
  const { scene } = useGLTF(character.url);
  // The scene is used directly (NOT cloned): cloning a SkinnedMesh doesn't
  // rebind its skeleton to the cloned bones, so posing would silently no-op.
  return <CharacterRig model={scene} character={character} {...props} />;
}

function FbxCharacter({ character, ...props }) {
  const model = useFBX(character.url); // Mixamo FBX (cm units, mixamorig bones)
  return <CharacterRig model={model} character={character} {...props} />;
}

/**
 * Picks the character selected in the store and loads it with the loader that
 * matches its file format (.glb → glTF, .fbx → FBX). Kept inside the scene's
 * <Suspense> so a character swap re-suspends cleanly.
 */
export function Mannequin(props) {
  const characterId = useStore((s) => s.characterId);
  const character =
    CHARACTERS_BY_ID[characterId] || CHARACTERS_BY_ID[DEFAULT_CHARACTER_ID];
  const isFbx = /\.fbx($|\?)/i.test(character.url || "");
  const Loader = isFbx ? FbxCharacter : GlbCharacter;
  return <Loader key={character.id} character={character} {...props} />;
}

useGLTF.preload(DEFAULT_MODEL_URL);
