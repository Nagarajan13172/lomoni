import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useShapes, labelsVisible } from "../shapesStore";
import { lightPosition, elevationAngle } from "../shapes";
import { useFloorDrag, LIGHT_PRIORITY } from "./useFloorDrag";

/**
 * A single movable bulb, hanging at a finite point above the floor.
 *
 * It is a POINT light on purpose. A directionalLight would fire parallel rays,
 * which flattens the whole lesson: parallel rays cast a shadow the same length no
 * matter how close the lamp comes, and they have no vanishing point to converge
 * on. A point light fans its rays out, so the rendered shadow matches the dotted
 * construction exactly — same silhouette, same vanishing point.
 *
 * `decay={0}` keeps brightness even across the floor. Real falloff would darken
 * the far shadow into mush right where we want the construction readable.
 */
export function Lighting() {
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const showLabels = useShapes(labelsVisible);
  const setLightFromFloor = useShapes((s) => s.setLightFromFloor);
  const position = lightPosition(azimuth, height, distance);

  // Everything you can grab moves on the FLOOR — one rule for the whole scene.
  // Height is its own handle on the vertical, so no single drag ever has to mean
  // two things at once.
  const grab = useRef([0, 0]);
  const { handlers, active } = useFloorDrag({
    enabled: true,
    priority: LIGHT_PRIORITY,
    onStart: (x, _y, z) => {
      grab.current = [x - position[0], z - position[2]];
    },
    onMove: (x, _y, z) => setLightFromFloor(x - grab.current[0], z - grab.current[1]),
  });

  return (
    <>
      <pointLight
        position={position}
        color="#fff5d9"
        intensity={2.5}
        decay={0}
        castShadow
        // A point light's shadow is a cube map, and three filters it with a
        // 9-tap kernel spread by shadow.radius. Left at its default of 1 the
        // taps land inside a single texel, so the edge keeps the shadow map's
        // staircase. Widening the kernel is what actually smooths it; the map
        // size just decides how big the steps are underneath.
        shadow-mapSize={[1536, 1536]}
        shadow-radius={4}
        shadow-bias={-0.0009}
        shadow-normalBias={0.03}
        shadow-camera-near={0.8}
        shadow-camera-far={150}
      />

      {/* Soft fill so the unlit side reads as shade rather than a black hole. */}
      <hemisphereLight args={["#eef2f8", "#c3cad4", 0.62]} />
      <ambientLight intensity={0.18} />

      <group position={position}>
        {/* A big, forgiving grab volume. It can safely overlap shapes standing
            under the light, because shapes outrank the light's handles. */}
        <mesh {...handlers} visible={false} userData={{ dragPriority: LIGHT_PRIORITY }}>
          <sphereGeometry args={[1.7, 16, 16]} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshBasicMaterial color="#ffc85c" toneMapped={false} fog={false} />
        </mesh>
        <mesh scale={active ? 2.1 : 1.7}>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshBasicMaterial
            color="#ffd982"
            transparent
            opacity={active ? 0.3 : 0.16}
            toneMapped={false}
            fog={false}
          />
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

      {showLabels && (
        <Html
          position={[position[0], position[1] + 1.35, position[2]]}
          center
          zIndexRange={[16, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="shapes-tag shapes-tag--light">
            <b>Light source</b>
            <span>{`${height.toFixed(1)} high · ${elevationAngle(height, distance).toFixed(0)}°`}</span>
          </div>
        </Html>
      )}
    </>
  );
}
