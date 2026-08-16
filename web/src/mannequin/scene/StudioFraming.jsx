import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore, spinning } from "../store";
import { pickBearing, directionFromAngles } from "../../lib/viewAngles";
import { getTheme } from "./themes";

// A figure is drawn from the front. Both candidates are a front three-quarter —
// far enough round to see the form turn, not so far that you lose the face —
// and the key light decides which side.
const FRAME_BEARINGS = [35, 325];
const FRAME_ELEVATION = 16;
const FIGURE_RADIUS = 1.55; // half the mannequin's height, plus a little air
const MARGIN = 1.2;
const EASE = 3.2;

const key = getTheme("light").key.position;
const KEY_BEARING = (THREE.MathUtils.radToDeg(Math.atan2(key[0], key[2])) + 360) % 360;

/**
 * Camera behaviour for the pose studio: keep the figure clear of the control
 * panel, swing to a drawing viewpoint on request, and run the turntable.
 *
 * The panel covers real estate on the right, so centring on the canvas centres
 * BEHIND it. `setViewOffset` renders a window out of a larger virtual frame,
 * sliding the optical centre into the clear area. It is purely a projection
 * shift, so orbiting still revolves around the figure rather than swinging it
 * about — which panning the orbit target would do.
 */
export function StudioFraming() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);

  const panelInset = useStore((s) => s.panelInset);
  const frameToken = useStore((s) => s.frameToken);
  const locked = useStore((s) => s.locked);
  const spin = useStore(spinning);
  const spinSpeed = useStore((s) => s.autoRotateSpeed);
  const figureScale = useStore((s) => s.figureScale);

  const tmp = useMemo(() => ({ dir: new THREE.Vector3() }), []);
  const pose = useRef(null);

  const fullWidth = size.width + panelInset.right;
  const fullHeight = size.height + panelInset.bottom;

  useLayoutEffect(() => {
    camera.aspect = fullWidth / fullHeight;
    camera.setViewOffset(fullWidth, fullHeight, panelInset.right, panelInset.bottom, size.width, size.height);
    return () => {
      camera.clearViewOffset();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    };
  }, [camera, fullWidth, fullHeight, panelInset.right, panelInset.bottom, size.width, size.height]);

  // Snapshot the viewpoint when it is asked for, and take the shorter way round.
  useEffect(() => {
    if (!frameToken || !controls) return;
    const { dir } = tmp;
    dir.copy(camera.position).sub(controls.target);
    const from = dir.lengthSq() > 1e-6 ? (THREE.MathUtils.radToDeg(Math.atan2(dir.x, dir.z)) + 360) % 360 : null;
    const bearing = pickBearing(FRAME_BEARINGS, KEY_BEARING, from);
    pose.current = new THREE.Vector3(...directionFromAngles(bearing, FRAME_ELEVATION));
  }, [frameToken, controls, camera, tmp]);

  // Taking the wheel cancels a swing still in flight.
  useEffect(() => {
    if (!controls) return undefined;
    const stepAside = () => {
      pose.current = null;
    };
    controls.addEventListener("start", stepAside);
    return () => controls.removeEventListener("start", stepAside);
  }, [controls]);

  useFrame((_, delta) => {
    // R3F resets aspect on resize; re-assert ours before it shows.
    const want = fullWidth / fullHeight;
    if (Math.abs(camera.aspect - want) > 1e-6) {
      camera.aspect = want;
      camera.setViewOffset(fullWidth, fullHeight, panelInset.right, panelInset.bottom, size.width, size.height);
    }
    if (!controls || locked) return;

    if (pose.current) {
      // The view offset makes the frustum asymmetric, so the room around the
      // figure is set by the panel-free area — which is exactly where it is
      // being centred. Same relation the Shapes studio uses.
      const free = Math.max(Math.min(size.width - panelInset.right, size.height - panelInset.bottom), 1);
      const scale = (Math.tan((camera.fov * Math.PI) / 360) * free) / fullHeight;
      const wanted = THREE.MathUtils.clamp(
        (FIGURE_RADIUS * figureScale * MARGIN) / scale,
        controls.minDistance ?? 1,
        controls.maxDistance ?? Infinity,
      );

      const t = 1 - Math.exp(-delta * EASE);
      const { dir } = tmp;
      dir.copy(camera.position).sub(controls.target);
      const reach = dir.length() || 6;
      dir.normalize().lerp(pose.current, t).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, THREE.MathUtils.lerp(reach, wanted, t));
      controls.update();
      if (dir.angleTo(pose.current) < 0.004 && Math.abs(reach - wanted) < 0.02) pose.current = null;
    } else if (spin) {
      // The turntable. It was a stored setting with nothing driving it.
      const { dir } = tmp;
      dir.copy(camera.position).sub(controls.target);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * spinSpeed * 0.4);
      camera.position.copy(controls.target).add(dir);
      controls.update();
    }
  });

  return null;
}
