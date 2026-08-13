import { Line } from "@react-three/drei";

/**
 * One construction stroke. Drawn on top of the scene (no depth write, positive
 * render order) so a guide never half-disappears inside the shape it explains.
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
  depthTest = true,
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
      depthTest={depthTest}
      depthWrite={false}
      polygonOffset
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
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
