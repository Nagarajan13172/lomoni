import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Lighting } from "./scene/Lighting";
import { Floor } from "./scene/Floor";
import { SceneObjects } from "./scene/SceneObjects";
import { VanishingPoint } from "./scene/VanishingPoint";
import { ConstructionGuides } from "./scene/ConstructionGuides";
import { Framing } from "./scene/Framing";

const BG = "#eef0f3";

/** The lighting studio: one shape, one movable bulb, and a clean shadow floor. */
export function ShapesStudio() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [11, 9, 16], fov: 36, near: 0.1, far: 400 }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color(BG);
        // No fog: auto-fit pulls the camera back a long way at the extremes of
        // the sliders, and distance haze there would swallow the construction.
      }}
    >
      <Lighting />
      <Floor />
      <SceneObjects />
      <VanishingPoint />
      <ConstructionGuides />
      <Framing />

      <OrbitControls
        makeDefault
        target={[0, 1.6, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={130}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
