import { FLOOR_RADIUS } from "../shapes";

/**
 * A visible floor plus a shadow-catcher plane so the light change reads clearly.
 * The disc is sized to hold the longest shadow the sliders can produce, even with
 * the shape dragged out to the edge of its range.
 */
export function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[FLOOR_RADIUS, 128]} />
        <meshStandardMaterial color="#dde2e8" roughness={0.97} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_RADIUS * 2.4, FLOOR_RADIUS * 2.4]} />
        <shadowMaterial transparent opacity={0.38} />
      </mesh>
    </>
  );
}
