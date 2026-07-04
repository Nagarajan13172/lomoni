import { useShapes } from "../shapesStore";
import { lightPosition } from "../shapes";

/**
 * A single movable key light. Its position is derived from top angle, height
 * angle, and distance so the user can place it naturally around the shape.
 */
export function Lighting() {
  const azimuth = useShapes((s) => s.azimuth);
  const elevation = useShapes((s) => s.elevation);
  const radius = useShapes((s) => s.radius);
  const position = lightPosition(azimuth, elevation, radius);

  return (
    <>
      <directionalLight
        position={position}
        color="#fff5d9"
        intensity={2.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.015}
        shadow-radius={5}
      >
        <orthographicCamera attach="shadow-camera" args={[-14, 14, 14, -14, 0.5, 60]} />
      </directionalLight>

      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshBasicMaterial color="#ffc85c" toneMapped={false} fog={false} />
        </mesh>
        <mesh scale={1.7}>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshBasicMaterial color="#ffd982" transparent opacity={0.16} toneMapped={false} fog={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.04, 12, 64]} />
          <meshBasicMaterial color="#fff0b8" toneMapped={false} fog={false} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#fff8db" toneMapped={false} fog={false} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.025, position[2]]}>
        <ringGeometry args={[0.58, 0.82, 36]} />
        <meshBasicMaterial color="#ffd476" transparent opacity={0.24} toneMapped={false} fog={false} />
      </mesh>
      <group position={[position[0], 0.03, position[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.08, 20]} />
          <meshBasicMaterial color="#e2aa4a" toneMapped={false} fog={false} />
        </mesh>
      </group>
    </>
  );
}
