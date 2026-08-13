import { useEffect, useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShapes } from "../shapesStore";
import { lightPosition, vanishingPoint, projectFromLight, toWorld } from "../shapes";

const MARGIN = 1.25; // breathing room around the composition
const EASE = 3.4; // how briskly the camera settles

/**
 * Keeps the whole composition — bulb, shape, shadow and vanishing point — inside
 * the part of the screen the control panel is not sitting on.
 *
 * Two separate jobs:
 *
 * 1. The panel covers real estate, so centring on the canvas centres BEHIND the
 *    panel. `setViewOffset` renders a window out of a larger virtual frame,
 *    which slides the optical centre into the clear area. Unlike panning the
 *    orbit target it is purely a projection shift, so orbiting still revolves
 *    around the composition rather than swinging it around.
 *
 * 2. The bulb roams a long way from the shape, and the shadow reaches further
 *    still. Auto-fit measures what actually has to be visible and eases the
 *    camera to a distance that holds it. Touch the controls and it steps aside;
 *    "Fit view" hands it back.
 */
export function Framing() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);

  const panelInset = useShapes((s) => s.panelInset);
  const autoFit = useShapes((s) => s.autoFit);
  const setAutoFit = useShapes((s) => s.setAutoFit);
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const objects = useShapes((s) => s.objects);
  const shapeFrames = useShapes((s) => s.shapeFrames);

  const tmp = useMemo(
    () => ({ box: new THREE.Box3(), point: new THREE.Vector3(), center: new THREE.Vector3(), dir: new THREE.Vector3() }),
    [],
  );

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

  // Any hand on the controls means the user is framing it themselves now.
  useEffect(() => {
    if (!controls) return undefined;
    const stepAside = () => setAutoFit(false);
    controls.addEventListener("start", stepAside);
    return () => controls.removeEventListener("start", stepAside);
  }, [controls, setAutoFit]);

  useFrame((_, delta) => {
    // R3F resets aspect on resize; re-assert ours before it shows.
    const want = fullWidth / fullHeight;
    if (Math.abs(camera.aspect - want) > 1e-6) {
      camera.aspect = want;
      camera.setViewOffset(fullWidth, fullHeight, panelInset.right, panelInset.bottom, size.width, size.height);
    }

    if (!autoFit || !controls) return;

    const { box, point, center, dir } = tmp;
    const light = lightPosition(azimuth, height, distance);
    const vp = vanishingPoint(azimuth, distance);

    box.makeEmpty();
    box.expandByPoint(point.set(light[0], light[1], light[2]));
    box.expandByPoint(point.set(vp[0], 0, vp[2]));

    for (const object of objects) {
      const frame = shapeFrames[object.type];
      if (!frame) continue;
      const { min, max } = frame.bounds;
      const low = toWorld(min, object.position);
      const high = toWorld(max, object.position);
      box.expandByPoint(point.set(low[0], low[1], low[2]));
      box.expandByPoint(point.set(high[0], high[1], high[2]));

      // The shadow's tip is the far edge of what has to stay on screen.
      const tip = projectFromLight(light, toWorld(frame.topPoint, object.position));
      if (tip) box.expandByPoint(point.set(tip[0], 0, tip[2]));
    }

    box.getCenter(center);
    const radius = Math.max(box.getSize(point).length() * 0.5, 3);

    // The view offset makes the frustum ASYMMETRIC — it pushes one edge in and
    // the opposite edge out — so the room around the composition is set by the
    // near edge, not by half the rendered frame. Working it through three's
    // projection gives a tidy result: the usable half-extent either way is
    // tan(fov/2) · free / fullHeight, where `free` is the panel-free area. Which
    // is only fair, since that is exactly where the composition is centred.
    const free = Math.max(Math.min(size.width - panelInset.right, size.height - panelInset.bottom), 1);
    const scale = (Math.tan((camera.fov * Math.PI) / 360) * free) / fullHeight;
    const wanted = THREE.MathUtils.clamp(
      (radius * MARGIN) / scale,
      controls.minDistance ?? 1,
      controls.maxDistance ?? Infinity,
    );

    const t = 1 - Math.exp(-delta * EASE);
    controls.target.lerp(center, t);
    dir.copy(camera.position).sub(controls.target);
    const current = dir.length();
    if (current < 1e-4) dir.set(0, 0.5, 1);
    dir.normalize();
    camera.position.copy(controls.target).addScaledVector(dir, THREE.MathUtils.lerp(current || wanted, wanted, t));
    controls.update();
  });

  return null;
}
