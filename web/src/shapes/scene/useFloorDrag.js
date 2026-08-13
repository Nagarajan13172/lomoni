import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Drag a scene object across the floor.
 *
 * Two details make this feel right rather than nearly right. Pointer capture
 * keeps the move events coming after the cursor slides off the thing being
 * dragged — without it a fast drag drops the object the moment you outrun it.
 * And OrbitControls is parked for the duration, so the camera does not orbit out
 * from under the drag.
 *
 * `onStart`/`onMove` both receive the floor point under the cursor; the caller
 * keeps the grab offset so the object does not snap its centre to the cursor.
 */
export function useFloorDrag({ enabled, onStart, onMove }) {
  const controls = useThree((s) => s.controls);
  const gl = useThree((s) => s.gl);
  const point = useMemo(() => new THREE.Vector3(), []);
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Leaving the mode mid-drag must not strand the controls disabled.
  useEffect(() => {
    if (enabled) return;
    setHovered(false);
    if (dragging.current) {
      dragging.current = false;
      setActive(false);
      if (controls) controls.enabled = true;
    }
  }, [enabled, controls]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = active ? "grabbing" : hovered ? "grab" : "";
    return () => {
      el.style.cursor = "";
    };
  }, [gl, active, hovered]);

  const floorPoint = (event) => (event.ray.intersectPlane(FLOOR, point) ? point : null);

  const release = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    if (controls) controls.enabled = true;
  };

  const handlers = enabled
    ? {
        onPointerOver: (event) => {
          event.stopPropagation();
          setHovered(true);
        },
        onPointerOut: () => setHovered(false),
        onPointerDown: (event) => {
          event.stopPropagation();
          event.target.setPointerCapture(event.pointerId);
          dragging.current = true;
          setActive(true);
          if (controls) controls.enabled = false;
          const hit = floorPoint(event);
          if (hit) onStart?.(hit.x, hit.z);
        },
        onPointerMove: (event) => {
          if (!dragging.current) return;
          event.stopPropagation();
          const hit = floorPoint(event);
          if (hit) onMove(hit.x, hit.z);
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
