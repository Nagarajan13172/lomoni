import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Lighting } from "./scene/Lighting";
import { Floor } from "./scene/Floor";
import { Shape } from "./scene/Shape";
import { ConstructionGuides } from "./scene/ConstructionGuides";

const BG = "#eef0f3";

/** The lighting studio: one shape, one movable light, and a clean shadow floor. */
export function ShapesStudio() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [8, 7, 12], fov: 36, near: 0.1, far: 120 }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color(BG);
        scene.fog = new THREE.Fog(BG, 18, 42);
      }}
    >
      <Lighting />
      <Floor />
      <Shape />
      <ConstructionGuides />

      <OrbitControls
        makeDefault
        target={[0, 1.6, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
