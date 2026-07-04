import { useEffect, useRef } from "react";
import { useBuild } from "../buildStore";
import { BASEPLATE, STUD, footprint, worldToCol } from "../bricks";

const SIZE = BASEPLATE * STUD;

/**
 * An invisible ground plane that catches the cursor: on move it snaps to a stud
 * column and updates the ghost; on a click (not an orbit drag) it drops a brick.
 * Press R to rotate. The brick's resting height comes from the store, so hovering
 * over a stack shows the ghost on top.
 */
export function Placer() {
  const setGhost = useBuild((s) => s.setGhost);
  const place = useBuild((s) => s.place);
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
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(e) => setGhost(cellFrom(e.point))}
      onPointerLeave={() => setGhost(null)}
      onPointerDown={(e) =>
        (down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY })
      }
      onPointerUp={(e) => {
        const d = down.current;
        down.current = null;
        if (!d) return;
        const dx = e.nativeEvent.clientX - d.x;
        const dy = e.nativeEvent.clientY - d.y;
        if (dx * dx + dy * dy > 36) return; // dragged to orbit → don't place
        const c = cellFrom(e.point);
        place(c.gx, c.gz);
      }}
    >
      <planeGeometry args={[SIZE, SIZE]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
