import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SceneEnv } from "./scene/SceneEnv";
import { Lighting } from "./scene/Lighting";
import { Floor } from "./scene/Floor";
import { ShapeGallery } from "./scene/ShapeGallery";
import { useShapes } from "./shapesStore";

/** The lighting studio: a lit floor, the shape gallery and the movable sun. */
export function ShapesStudio() {
  const setGL = useShapes((s) => s.setGL);
  const select = useShapes((s) => s.select);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true, // needed for screenshot toDataURL
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [2.5, 12.5, 27], fov: 42, near: 0.1, far: 200 }}
      onCreated={({ gl }) => setGL(gl)}
      onPointerMissed={() => select(null)} // click empty space to deselect
    >
      <SceneEnv />
      <Lighting />
      <Floor />
      <ShapeGallery />

      <OrbitControls
        makeDefault
        target={[2.5, 1.3, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={70}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
