import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useShapes } from "../shapesStore";
import { lightPosition } from "../shapes";

const SUN_RADIUS = 20; // how far out on the dome the sun sits

/**
 * The light rig: a fill (ambient), a subtle sky/ground tint (hemisphere) and
 * the star of the show — one movable directional "sun" that casts shadows. Its
 * position is recomputed every frame from the store's azimuth/elevation so the
 * sliders (and the "animate" orbit) move both the shading and the shadows live.
 * A glowing marker sphere rides along so you can see where the light is.
 */
export function Lighting() {
  const azimuth = useShapes((s) => s.azimuth);
  const elevation = useShapes((s) => s.elevation);
  const intensity = useShapes((s) => s.intensity);
  const color = useShapes((s) => s.lightColor);
  const ambient = useShapes((s) => s.ambient);
  const softness = useShapes((s) => s.softness);
  const animate = useShapes((s) => s.animate);
  const showSun = useShapes((s) => s.showSun);

  const light = useRef();
  const sun = useRef();
  const start = lightPosition(azimuth, elevation, SUN_RADIUS); // avoid a degenerate first frame

  useFrame((state) => {
    const az = animate ? azimuth + state.clock.elapsedTime * 22 : azimuth;
    const [x, y, z] = lightPosition(az, elevation, SUN_RADIUS);
    light.current?.position.set(x, y, z);
    sun.current?.position.set(x, y, z);
  });

  return (
    <>
      <ambientLight intensity={ambient} />
      <hemisphereLight args={["#ffffff", "#1a1d26", 0.25]} />

      <directionalLight
        ref={light}
        position={start}
        color={color}
        intensity={intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={softness}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.5, 90]} />
      </directionalLight>

      {showSun && (
        <mesh ref={sun} position={start}>
          <sphereGeometry args={[0.8, 24, 24]} />
          <meshBasicMaterial color={color} toneMapped={false} fog={false} />
        </mesh>
      )}
    </>
  );
}
