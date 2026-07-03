import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";
import { getTheme } from "./themes";
import { getMaterial } from "./materials";

const MODEL_URL = "/models/lay_figure.glb";
const TARGET_HEIGHT = 3; // world units
// Lifts the figure a hair so the sole rests ON the floor instead of the lowest
// JOINT pivot (the mesh surface sits ~this far below the ankle/toe bone). World
// units at figureScale=1; scaled with the figure so the gap stays proportional.
const GROUND_PAD = 0.05;

/**
 * Loads the rigged wooden mannequin, discovers the skeleton, wires shadows,
 * applies material/display/theme settings, normalises scale, and re-grounds the
 * figure on every pose change so feet/body never float or clip through the floor.
 */
export function Mannequin(props) {
  const { scene } = useGLTF(MODEL_URL);
  const setRig = useStore((s) => s.setRig);
  const setGroundSnap = useStore((s) => s.setGroundSnap);
  const setGetBounds = useStore((s) => s.setGetBounds);
  const outer = useRef();

  // Use the scene directly (NOT scene.clone): cloning a SkinnedMesh does not
  // rebind its skeleton to the cloned bones, so posing would silently no-op.
  const model = scene;

  const bones = useMemo(() => {
    const map = {};
    model.traverse((o) => {
      if (o.isBone) map[o.name] = o;
    });
    return map;
  }, [model]);

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

  // Contact points for grounding/framing: every joint bone plus the "_end" tip
  // objects (toes, fingertips, head-top). Their world matrices are authoritative
  // (they drive the GPU skin), unlike a CPU re-skin of the mesh vertices — which
  // double-applies this GLB's post-bind ancestor scale and drifts the figure off
  // the floor (worse the further a pose moves from rest). Bones can't lie.
  const contacts = useMemo(() => {
    const arr = [];
    model.traverse((o) => {
      if (o.isBone || (o.name && o.name.endsWith("_end"))) arr.push(o);
    });
    return arr;
  }, [model]);

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
  useLayoutEffect(() => {
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
  }, [meshes, themeId, materialId, showTexture]);

  // Wireframe / opacity → dynamic params only (no shader recompile).
  useLayoutEffect(() => {
    for (const o of meshes) {
      const mat = o.userData._activeMat;
      if (!mat) continue;
      mat.wireframe = wireframe;
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.depthWrite = opacity >= 1;
    }
  }, [meshes, wireframe, opacity]);

  // Base scale from rest height (computed once per model).
  const baseScale = useRef(1);
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    baseScale.current = TARGET_HEIGHT / (size.y || 1);
  }, [model]);

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
    if (Number.isFinite(lowest)) g.position.y = -lowest + GROUND_PAD * fs;
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
  useFrame(() => {
    if (useStore.getState().transition) doGroundSnap();
  });

  useEffect(() => {
    setRig(bones);
  }, [bones, setRig]);

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

useGLTF.preload(MODEL_URL);
