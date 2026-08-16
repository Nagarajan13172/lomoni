import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Grid,
  Environment,
  Lightformer,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { Mannequin } from "./Mannequin";
import { JointHandles } from "./JointHandles";
import { PoseGizmo } from "./PoseGizmo";
import { PoseTweener } from "./PoseTweener";
import { UrlSync } from "./UrlSync";
import { StudioFraming } from "./StudioFraming";
import { useStore } from "../store";
import { getTheme } from "./themes";

// White/light setpose-style studio: light background + soft ground disc.
const theme = getTheme("light");
const BG = "#eef0f3"; // soft white-grey backdrop
const DISC = "#e2e4ea"; // ground disc, slightly deeper than the backdrop

export function Studio() {
  const select = useStore((s) => s.select);
  const locked = useStore((s) => s.locked);
  const setGL = useStore((s) => s.setGL);
  const { key, fill, rim, hemi } = theme;
  const [l, r, t, b] = key.shadowCam;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true, // for screenshots
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [3.4, 2.5, 5.6], fov: 38, near: 0.1, far: 100 }}
      onCreated={({ gl, scene }) => {
        setGL(gl);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMappingExposure = theme.exposure;
        scene.background = new THREE.Color(BG);
        scene.fog = new THREE.Fog(BG, 18, 40);
      }}
      onPointerMissed={() => !useStore.getState().locked && select(null)}
    >
      <AdaptiveDpr pixelated />

      <hemisphereLight args={[hemi.sky, hemi.ground, hemi.intensity]} />
      <ambientLight intensity={theme.ambient} />
      <directionalLight
        castShadow
        position={key.position}
        intensity={key.intensity}
        color={key.color}
        shadow-mapSize={[key.mapSize, key.mapSize]}
        shadow-bias={key.bias}
        shadow-normalBias={key.normalBias}
        shadow-radius={key.radius}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[l, r, t, b, key.shadowNear, key.shadowFar]}
        />
      </directionalLight>
      <directionalLight position={fill.position} intensity={fill.intensity} color={fill.color} />
      <directionalLight position={rim.position} intensity={rim.intensity} color={rim.color} />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          {theme.env.map((c, i) => (
            <Lightformer key={i} intensity={c.intensity} position={c.position} scale={c.scale} color={c.color} />
          ))}
        </Environment>
        <Mannequin />
        <JointHandles />
        <PoseGizmo />
        <PoseTweener />
        <UrlSync />
      </Suspense>

      {/* The white disc (below) receives the real cast shadow; this adds a
          soft contact-AO right at the feet for grounding. */}
      <ContactShadows
        position={[0, 0.004, 0]}
        color="#5b6472"
        opacity={0.35}
        scale={9}
        blur={2.4}
        far={2}
        resolution={1024}
      />
      {/* Soft white ground disc (edges fade into the backdrop via fog) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[26, 96]} />
        <meshStandardMaterial color={DISC} roughness={0.98} metalness={0} />
      </mesh>

      <StudioFraming />

      <OrbitControls
        makeDefault
        enabled={!locked}
        target={[0, 1.4, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.52}
      />
    </Canvas>
  );
}
