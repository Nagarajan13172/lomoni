import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShapes } from "../shapesStore";

// Handles overlap in screen space — the bulb's grab volume hangs over shapes
// standing beneath it. Rather than shrinking targets until nothing is easy to
// hit, they are ranked: a shape always wins. A losing handle declines the press
// WITHOUT stopping propagation, so the winner underneath still gets it on the
// same click.
export const LIGHT_PRIORITY = 1;
export const SHAPE_PRIORITY = 2;

/**
 * Drag something across a plane.
 *
 * Two modes, because two different freedoms are wanted:
 *
 * - `"floor"` — the ground plane. Shapes walk around on it, and so does the
 *   vanishing-point mark.
 * - `"facing"` — a vertical plane through the grab point, turned to face the
 *   camera. Up and down on screen becomes up and down in the world, which is how
 *   the bulb and a lifted shape get their height by hand.
 * - `"level"` — horizontal, but at the grab point's own height rather than at the
 *   floor. A spin ring around a lifted shape has to work in the shape's plane, or
 *   the cursor and the ring disagree by however high it is floating.
 *
 * Two details make this feel right rather than nearly right. Pointer capture
 * keeps the move events coming after the cursor slides off the thing being
 * dragged — without it a fast drag drops the object the moment you outrun it.
 * And OrbitControls is parked for the duration, so the camera does not orbit out
 * from under the drag.
 *
 * `onStart`/`onMove` receive the world point under the cursor; the caller keeps
 * the grab offset so nothing snaps its centre to the cursor.
 */
export function useFloorDrag({ enabled: wanted, mode = "floor", anchor, priority = 0, onStart, onMove }) {
  // The lock disarms every handle at once, so no caller can forget it.
  const locked = useShapes((s) => s.locked);
  const enabled = wanted && !locked;
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const setDragging = useShapes((s) => s.setDragging);
  const point = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Losing the mode mid-drag must not strand the controls disabled.
  useEffect(() => {
    if (enabled) return;
    setHovered(false);
    if (dragging.current) {
      dragging.current = false;
      setActive(false);
      setDragging(false);
      // Restore to whatever the lock currently allows — locking mid-drag must
      // not hand orbiting back.
      if (controls) controls.enabled = !locked;
    }
  }, [enabled, controls, setDragging, locked]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = active ? "grabbing" : hovered ? "grab" : "";
    return () => {
      el.style.cursor = "";
    };
  }, [gl, active, hovered]);

  /**
   * Pin the drag plane at grab time. A facing plane recomputed every frame would
   * drift as the camera settles, sliding the thing out from under the cursor.
   */
  const setPlane = () => {
    if (mode === "level" && anchor) {
      plane.set(new THREE.Vector3(0, 1, 0), -anchor[1]);
    } else if (mode === "facing" && anchor) {
      camera.getWorldDirection(normal);
      normal.y = 0;
      if (normal.lengthSq() < 1e-6) normal.set(0, 0, 1); // camera straight down
      normal.normalize();
      plane.setFromNormalAndCoplanarPoint(normal, point.set(anchor[0], anchor[1], anchor[2]));
    } else {
      plane.set(new THREE.Vector3(0, 1, 0), 0);
    }
  };

  /**
   * Where the cursor lands on the plane. A floor ray aimed above the horizon
   * never comes down at all, so rather than freezing, aim far out the way it is
   * heading — dragging past the horizon then pushes the object outward, which is
   * what the gesture looks like it should do.
   */
  const planePoint = (event) => {
    if (event.ray.intersectPlane(plane, point)) return point;
    if (mode !== "floor") return null;
    const { origin, direction } = event.ray;
    const flat = Math.hypot(direction.x, direction.z) || 1;
    return point.set(origin.x + (direction.x / flat) * 1000, 0, origin.z + (direction.z / flat) * 1000);
  };

  const release = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    setDragging(false);
    if (controls) controls.enabled = !locked;
  };

  const handlers = enabled
    ? {
        onPointerOver: (event) => {
          if (event.intersections?.some((hit) => (hit.eventObject?.userData?.dragPriority ?? 0) > priority)) return;
          event.stopPropagation();
          setHovered(true);
        },
        onPointerOut: () => setHovered(false),
        onPointerDown: (event) => {
          // Someone better has a claim on this press — let it through.
          const outranked = event.intersections?.some(
            (hit) => (hit.eventObject?.userData?.dragPriority ?? 0) > priority,
          );
          if (outranked) return;

          event.stopPropagation();
          event.target.setPointerCapture(event.pointerId);
          dragging.current = true;
          setActive(true);
          setDragging(true);
          if (controls) controls.enabled = false;
          setPlane();
          const hit = planePoint(event);
          if (hit) onStart?.(hit.x, hit.y, hit.z);
        },
        onPointerMove: (event) => {
          if (!dragging.current) return;
          event.stopPropagation();
          const hit = planePoint(event);
          if (hit) onMove(hit.x, hit.y, hit.z);
        },
        onPointerUp: (event) => {
          if (!dragging.current) return;
          event.stopPropagation();
          event.target.releasePointerCapture(event.pointerId);
          release();
        },
        // Backstop: a cancelled gesture or a capture lost elsewhere must still
        // hand the camera back.
        onPointerCancel: release,
        onLostPointerCapture: release,
      }
    : {};

  return { handlers, active, hovered };
}
