import { useShapes } from "../shapesStore";

/** The ground the shapes rest on — a neutral plane that catches their shadows. */
export function Floor() {
  const show = useShapes((s) => s.showFloor);
  if (!show) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[90, 90]} />
      <meshStandardMaterial color="#3b4150" roughness={0.95} metalness={0} />
    </mesh>
  );
}
