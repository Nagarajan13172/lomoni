import { useEffect, useRef } from "react";
import { useBuild } from "../buildStore";
import { BASEPLATE, footprint, worldToCol } from "../bricks";

/** Walk up from a hit object to the brick group carrying a blockId. */
function blockIdOf(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.blockId) return o.userData.blockId;
    o = o.parent;
  }
  return null;
}

/**
 * Wraps the interactive scene (baseplate + bricks). R3F events bubble from the
 * hit mesh up to this group, so `e.point` sits on the ACTUAL surface under the
 * cursor — the top of the brick you're pointing at, not a flat ground plane.
 * That makes stacking pixel-accurate at any camera angle.
 *
 * Place mode: click drops a brick (resting on whatever's under the cursor).
 * Delete mode: hover highlights a brick, click removes it. A drag (orbit) never
 * places/deletes thanks to the pointer-move threshold.
 */
export function Placer({ children }) {
  const setGhost = useBuild((s) => s.setGhost);
  const setHover = useBuild((s) => s.setHover);
  const place = useBuild((s) => s.place);
  const remove = useBuild((s) => s.remove);
  const rotate = useBuild((s) => s.rotate);
  const down = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "r" || e.key === "R") rotate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotate]);

  const cellFrom = (point) => {
    const { type, rot } = useBuild.getState();
    const { fw, fd } = footprint(type, rot);
    const { cx, cz } = worldToCol(point.x, point.z);
    const gx = Math.max(0, Math.min(BASEPLATE - fw, Math.round(cx - fw / 2)));
    const gz = Math.max(0, Math.min(BASEPLATE - fd, Math.round(cz - fd / 2)));
    return { gx, gz };
  };

  return (
    <group
      onPointerMove={(e) => {
        e.stopPropagation();
        if (useBuild.getState().mode === "delete") {
          setHover(blockIdOf(e.object));
          setGhost(null);
        } else {
          setGhost(cellFrom(e.point));
        }
      }}
      onPointerLeave={() => {
        setGhost(null);
        setHover(null);
      }}
      onPointerDown={(e) =>
        (down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY })
      }
      onPointerUp={(e) => {
        const d = down.current;
        down.current = null;
        if (!d) return;
        const dx = e.nativeEvent.clientX - d.x;
        const dy = e.nativeEvent.clientY - d.y;
        if (dx * dx + dy * dy > 36) return; // dragged to orbit → ignore
        if (useBuild.getState().mode === "delete") {
          const id = blockIdOf(e.object);
          if (id) remove(id);
        } else {
          const c = cellFrom(e.point);
          place(c.gx, c.gz);
        }
      }}
    >
      {children}
    </group>
  );
}
