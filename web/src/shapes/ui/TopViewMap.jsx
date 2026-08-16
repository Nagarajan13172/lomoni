import { useRef } from "react";
import { useShapes } from "../shapesStore";
import { SHAPES, LIGHT_DISTANCE, OBJECT_RANGE } from "../shapes";

const EDGE = 42; // how much of the radar's half-width the outer limit uses
const PICK = 6; // grab tolerance, in the same % units

/**
 * A plan view of the floor you can actually work in.
 *
 * Dragging in the 3D scene can only reach the patch of floor currently on
 * screen, so getting a shape behind the camera means orbiting first. Seen from
 * straight above, every direction is on screen at once — so this map is the tool
 * that genuinely gives you the full 360°. Drag any shape dot to walk it around,
 * drag the amber dot to swing the light, or click bare floor to send the selected
 * shape there.
 *
 * From directly above the bulb and its vanishing point sit on the same spot,
 * which also makes this the quickest way to see what the vanishing point is.
 */
export function TopViewMap() {
  const objects = useShapes((s) => s.objects);
  const selectedId = useShapes((s) => s.selectedId);
  const azimuth = useShapes((s) => s.azimuth);
  const distance = useShapes((s) => s.distance);
  const selectObject = useShapes((s) => s.selectObject);
  const setObjectPosition = useShapes((s) => s.setObjectPosition);
  const setLightFromFloor = useShapes((s) => s.setLightFromFloor);
  const setDragging = useShapes((s) => s.setDragging);
  const locked = useShapes((s) => s.locked);

  const radar = useRef(null);
  const drag = useRef(null); // { kind, id, offset: [dx, dz] }

  const scale = EDGE / LIGHT_DISTANCE.max; // % of the radar per world unit
  const place = (x, z) => ({ left: `${50 + x * scale}%`, top: `${50 - z * scale}%` });

  const angle = (azimuth * Math.PI) / 180;
  const lightXZ = [distance * Math.sin(angle), distance * Math.cos(angle)];

  /** Pointer position → floor coordinates. */
  const toFloor = (event) => {
    const box = radar.current.getBoundingClientRect();
    return [
      (((event.clientX - box.left) / box.width) * 100 - 50) / scale,
      (50 - ((event.clientY - box.top) / box.height) * 100) / scale,
    ];
  };

  const onPointerDown = (event) => {
    if (locked) return;
    const [x, z] = toFloor(event);
    const tolerance = PICK / scale;

    // Nearest grabbable thing wins, so a dot never needs to be hit dead centre.
    // Shapes are considered first and ties go to them: a shape parked under the
    // bulb sits on the same spot as the light dot, and grabbing the light when
    // you meant the shape leaves the shape stuck.
    let best = null;
    const consider = (candidate, px, pz) => {
      const gap = Math.hypot(px - x, pz - z);
      if (gap <= tolerance && (!best || gap < best.gap)) best = { ...candidate, gap, offset: [x - px, z - pz] };
    };
    for (const object of objects) consider({ kind: "object", id: object.id }, object.position[0], object.position[1]);
    consider({ kind: "light" }, lightXZ[0], lightXZ[1]);

    if (best) {
      drag.current = best;
      if (best.kind === "object") selectObject(best.id);
    } else if (selectedId) {
      // Bare floor: send the selected shape there and keep dragging it.
      drag.current = { kind: "object", id: selectedId, offset: [0, 0] };
      setObjectPosition(selectedId, x, z);
    } else {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    const [x, z] = toFloor(event);
    const [dx, dz] = drag.current.offset;
    if (drag.current.kind === "light") setLightFromFloor(x - dx, z - dz);
    else setObjectPosition(drag.current.id, x - dx, z - dz);
  };

  const onPointerUp = (event) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div className="shapes-guide">
      <div className="shapes-guide__label">
        Top view
        <span className="shapes-guide__tag">{locked ? "locked" : "drag to place"}</span>
      </div>
      <div
        className={`shapes-guide__radar ${locked ? "is-locked" : ""}`}
        ref={radar}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onLostPointerCapture={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <div className="shapes-guide__ring" />
        {/* How far a shape is allowed to roam. */}
        <div
          className="shapes-guide__range"
          style={{ inset: `${50 - OBJECT_RANGE * scale}%` }}
          aria-hidden="true"
        />
        <div
          className="shapes-guide__beam"
          style={{
            transform: `translate(-50%, -100%) rotate(${azimuth}deg)`,
            height: `${distance * scale}%`,
          }}
        />
        {objects.map((object) => {
          const def = SHAPES.find((s) => s.type === object.type) ?? SHAPES[0];
          return (
            <div
              key={object.id}
              className={`shapes-guide__shape ${object.id === selectedId ? "is-on" : ""}`}
              style={{ ...place(object.position[0], object.position[1]), background: def.color }}
              title={def.label}
            />
          );
        })}
        <div className="shapes-guide__light" style={place(lightXZ[0], lightXZ[1])} />
        <div className="shapes-guide__sun" style={place(lightXZ[0], lightXZ[1])}>
          Light / VP
        </div>
      </div>
      <p className="shapes-guide__hint">
        {locked
          ? "Frozen while the frame is locked."
          : "Every direction at once — drag a shape anywhere in the full circle. The bulb and its vanishing point overlap from up here."}
      </p>
    </div>
  );
}
