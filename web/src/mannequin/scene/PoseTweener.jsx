import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";
import { applyBoneCorrection } from "../character/retarget";

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const _e = new THREE.Euler();
const _q = new THREE.Quaternion();

/**
 * Smoothly slerps every bone from its current rotation to a target pose when a
 * transition is queued (library poses, presets). Bones not named in the target
 * ease back to rest, so applying a pose is absolute and clean. On completion it
 * bumps poseVersion (→ ground-snap) and clears the transition.
 */
export function PoseTweener() {
  const transition = useStore((s) => s.transition);
  const tween = useRef(null);

  useEffect(() => {
    // Cancelled (e.g. an instant edit set transition=null): abort the tween so
    // it stops overwriting the bones.
    if (!transition) {
      tween.current = null;
      return;
    }
    const { bones, rest, corrections } = useStore.getState();
    const from = {};
    const to = {};
    for (const name of Object.keys(bones)) {
      from[name] = bones[name].quaternion.clone();
    }
    // targets: named bones -> rest⊗offset (additive) or absolute; others -> rest
    for (const name of Object.keys(bones)) {
      const r = transition.pose[name];
      if (r) {
        _e.set(r[0], r[1], r[2], "XYZ");
        if (transition.additive) {
          // retarget the authored offset onto this character (no-op if native)
          const off = applyBoneCorrection(corrections?.[name], _q.setFromEuler(_e));
          to[name] = rest[name].clone().multiply(off);
        } else {
          to[name] = new THREE.Quaternion().setFromEuler(_e);
        }
      } else {
        to[name] = rest[name].clone();
      }
    }
    tween.current = { from, to, elapsed: 0, dur: transition.duration || 0.4 };
  }, [transition]);

  useFrame((_, dt) => {
    const tw = tween.current;
    if (!tw) return;
    tw.elapsed += dt;
    const t = Math.min(1, tw.elapsed / tw.dur);
    const k = easeInOutCubic(t);
    const s = useStore.getState();
    for (const name in tw.to) {
      const b = s.bones[name];
      if (b) b.quaternion.slerpQuaternions(tw.from[name], tw.to[name], k);
    }
    // Grounding during the slerp is handled by <Mannequin>'s useFrame.
    if (t >= 1) {
      tween.current = null;
      s.bump(); // final ground-snap + DOM sync (also clears transition)
      s.requestFrame(); // re-fit the camera to the settled pose
    }
  });

  return null;
}
