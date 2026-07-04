import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Baseplate } from "./scene/Baseplate";
import { Bricks } from "./scene/Bricks";
import { GhostBrick } from "./scene/GhostBrick";
import { Placer } from "./scene/Placer";

const BG = "#e9edf2";

/** The block-builder canvas: lit studio, baseplate, placed bricks + ghost. */
export function BuildStudio() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [16, 17, 22], fov: 40, near: 0.1, far: 200 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color(BG);
        scene.fog = new THREE.Fog(BG, 45, 90);
      }}
    >
      <hemisphereLight args={["#ffffff", "#b9c2cc", 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[14, 22, 10]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      >
        <orthographicCamera attach="shadow-camera" args={[-22, 22, 22, -22, 0.1, 70]} />
      </directionalLight>

      <Placer>
        <Baseplate />
        <Bricks />
      </Placer>
      <GhostBrick />

      <ContactShadows position={[0, -0.02, 0]} opacity={0.3} scale={40} blur={2.2} far={12} />

      <OrbitControls
        makeDefault
        target={[0, 2, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={70}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
