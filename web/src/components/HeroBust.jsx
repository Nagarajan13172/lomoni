import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/paper-bust.glb";
const DRACO_PATH = "/draco/";

function Bust({ src }) {
  const { scene } = useGLTF(src, DRACO_PATH);

  // Centre the model at the origin, size it down, and give it a soft, paper-like
  // (never metallic) response to the environment. Sits still — the user drives
  // all rotation via OrbitControls.
  const model = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    s.position.sub(center);
    s.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = false;
        o.frustumCulled = false;
        const mat = o.material;
        if (mat) {
          mat.envMapIntensity = 0.7;
          mat.metalness = Math.min(mat.metalness ?? 0, 0.15);
        }
      }
    });
    const wrap = new THREE.Group();
    wrap.add(s);
    wrap.scale.setScalar(1.55 / (size.y || 1));
    // Model's face points down +X by default (loads in profile) — turn it to
    // face the camera straight-on for the initial load.
    wrap.rotation.y = -Math.PI / 2;
    return wrap;
  }, [scene]);

  return <primitive object={model} />;
}

/** Local, HDR-free studio environment baked from a few lightformers. */
function StudioEnv() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.2} position={[3, 3, 4]} scale={[7, 7, 1]} color="#ffffff" />
      <Lightformer intensity={1.1} position={[-4, 1, 2]} scale={[6, 6, 1]} color="#ffd9c2" />
      <Lightformer intensity={0.9} position={[0, -3, -4]} scale={[9, 9, 1]} color="#cdd9ff" />
    </Environment>
  );
}

export default function HeroBust({ className = "", src = MODEL_URL }) {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(true);
  // Drag-to-rotate is a mouse interaction; disable on touch so a swipe over the
  // model still scrolls the page instead of getting trapped by the controls.
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    setCanDrag(window.matchMedia("(pointer: fine)").matches);
  }, []);

  // Pause the render loop when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    const onVis = () => setActive(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 3.6], fov: 32, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        style={{
          pointerEvents: canDrag ? "auto" : "none",
          touchAction: "pan-y",
          cursor: canDrag ? "grab" : "auto",
        }}
      >
        <AdaptiveDpr pixelated />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.15} color="#fff5ec" />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#dbe4ff" />
        <Suspense fallback={null}>
          <StudioEnv />
          <Bust src={src} />
        </Suspense>
        {canDrag && (
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.09}
            rotateSpeed={0.9}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
