import { Line } from "@react-three/drei";

/**
 * One construction stroke.
 *
 * Guides depth-test honestly, so a line that runs into a shape is hidden by it
 * rather than painted across its face. That is what makes the drawing readable:
 * you see the part of the ray that is in the open, and the shape itself tells you
 * where it stops.
 *
 * `onFloor` is the exception. Lines lying on the ground plane are nudged toward
 * the camera so they cannot z-fight with the floor they are drawn on.
 */
export function GuideLine({
  start,
  end,
  color = "#6f7987",
  dashed = true,
  dashSize = 0.34,
  gapSize = 0.2,
  opacity = 0.55,
  lineWidth = 1.45,
  onFloor = false,
  renderOrder = 18,
}) {
  return (
    <Line
      points={[start, end]}
      color={color}
      dashed={dashed}
      dashSize={dashSize}
      gapSize={gapSize}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthTest
      depthWrite={false}
      polygonOffset={onFloor}
      polygonOffsetFactor={onFloor ? -2 : 0}
      polygonOffsetUnits={onFloor ? -2 : 0}
      toneMapped={false}
      fog={false}
      renderOrder={renderOrder}
    />
  );
}

/** Nudge a floor point up a hair so guides never z-fight with the floor. */
export function liftPoint([x, y, z], amount = 0.035) {
  return [x, y + amount, z];
}
