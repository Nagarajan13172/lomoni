import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr, OrbitControls, useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

const MODEL_URL = "/models/paper-bust.glb";
const DRACO_PATH = "/draco/";
// Default facing for the paper busts, which load in profile (face down +X).
const DEFAULT_ROTATION = [0, -Math.PI / 2, 0];

// 1×1 transparent PNG. An .fbx can reference an external texture that isn't
// shipped with it (e.g. the Mothi head's base-colour map lives on the artist's
// machine); redirecting those requests here keeps the model from 404-ing on
// load. FBX meshes are re-skinned as matte paper below, so the map is unused.
const BLANK_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Soft, matte paper skin — the shared material language of the site's busts. */
function paperMaterial(name) {
  const m = new THREE.MeshStandardMaterial({ color: 0xe9e3d7, roughness: 0.82, metalness: 0 });
  m.envMapIntensity = 0.75;
  m.name = name || "paper";
  return m;
}

/**
 * Centre a loaded object at the origin, normalise its height to a constant, and
 * turn it to face the camera. Format-agnostic — takes any Object3D (a cloned
 * glTF scene or an FBX group). `rotation` orients the initial load; the user
 * then spins it with OrbitControls.
 */
function frameModel(object, rotation) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(object);
  wrap.scale.setScalar(1.55 / (size.y || 1));
  wrap.rotation.set(rotation[0], rotation[1], rotation[2]);
  return wrap;
}

// glTF busts arrive with their proper baked materials — keep them, just tame any
// metalness and give a soft, paper-like (never mirror) environment response.
function GlbBust({ src, rotation }) {
  const { scene } = useGLTF(src, DRACO_PATH);
  const model = useMemo(() => {
    const s = scene.clone(true);
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
    return frameModel(s, rotation);
  }, [scene, rotation]);

  return <primitive object={model} />;
}

// FBX busts arrive as MeshPhongMaterial (often without their texture), so they
// get re-skinned to the shared paper material to match the .glb busts under the
// PBR studio lighting.
function FbxBust({ src, rotation }) {
  const object = useLoader(FBXLoader, src, (loader) => {
    // Own LoadingManager (no global side effects) that shunts any external
    // texture request to a blank pixel, so a missing map never 404s.
    const mgr = new THREE.LoadingManager();
    mgr.setURLModifier((url) =>
      /\.(png|jpe?g|tga|bmp|gif|dds|webp)(\?|$)/i.test(url) ? BLANK_PNG : url
    );
    loader.manager = mgr;
  });
  const model = useMemo(() => {
    const s = object.clone(true);
    // FBX "scene" exports can bundle their own camera/lights — strip them so the
    // hero's tuned studio lighting (below) is the only thing lighting the bust.
    const strip = [];
    s.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = false;
        o.frustumCulled = false;
        o.material = paperMaterial(o.material?.name);
      } else if (o.isLight || o.isCamera) {
        strip.push(o);
      }
    });
    strip.forEach((o) => o.removeFromParent());
    return frameModel(s, rotation);
  }, [object, rotation]);

  return <primitive object={model} />;
}

// Pick the loader that matches the file format. Hooks can't be called
// conditionally, so each format lives in its own component and we swap between
// them — a src change across formats cleanly re-suspends.
function Bust({ src, rotation }) {
  const isFbx = /\.fbx(\?|$)/i.test(src);
  return isFbx ? (
    <FbxBust src={src} rotation={rotation} />
  ) : (
    <GlbBust src={src} rotation={rotation} />
  );
}

// Cursor-parallax tuning — kept small so the bust "notices" the cursor without
// looking motorised. Yaw/pitch are radians; shift is world units; damp is the
// per-frame easing toward the target.
const P_YAW = 0.16; // ~9°
const P_PITCH = 0.1; // ~6°
const P_SHIFT = 0.04;
const P_DAMP = 0.07;

/**
 * Gently tilts + drifts its children toward the cursor each frame. `pointerRef`
 * carries the normalised cursor position (-1..1) relative to the bust's centre;
 * `draggingRef` lets an active OrbitControls drag switch the effect off so the
 * two don't compound (it eases back to neutral, then resumes on release).
 */
function Parallax({ pointerRef, draggingRef, enabled, children }) {
  const ref = useRef();
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const p = pointerRef.current;
    const k = enabled && !draggingRef.current ? 1 : 0;
    // Head turns toward the cursor (yaw with x, pitch with y).
    g.rotation.y += (p.x * P_YAW * k - g.rotation.y) * P_DAMP;
    g.rotation.x += (p.y * P_PITCH * k - g.rotation.x) * P_DAMP;
    g.position.x += (p.x * P_SHIFT * k - g.position.x) * P_DAMP;
    g.position.y += (-p.y * P_SHIFT * k - g.position.y) * P_DAMP;
  });
  return <group ref={ref}>{children}</group>;
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

export default function HeroBust({ className = "", src = MODEL_URL, rotation = DEFAULT_ROTATION }) {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(true);
  // Drag-to-rotate is a mouse interaction; disable on touch so a swipe over the
  // model still scrolls the page instead of getting trapped by the controls.
  const [canDrag, setCanDrag] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  // Normalised cursor position (-1..1) relative to the bust's centre, and
  // whether an OrbitControls drag is in progress. Refs, not state, so the
  // per-frame parallax reads them without triggering React re-renders.
  const pointerRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const parallaxOn = canDrag && !reduceMotion;

  useEffect(() => {
    setCanDrag(window.matchMedia("(pointer: fine)").matches);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduceMotion(mq.matches);
    onMq();
    mq.addEventListener?.("change", onMq);
    return () => mq.removeEventListener?.("change", onMq);
  }, []);

  // Parallax reacts only while the cursor is over the sculpture itself —
  // normalised to the bust's own bounds (edge = full tilt) — and eases back to
  // centre once the cursor leaves it. So moving over the copy alongside does
  // nothing; only hovering the bust makes it turn.
  useEffect(() => {
    if (!parallaxOn) return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };
    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [parallaxOn]);

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
          cursor: canDrag ? (grabbing ? "grabbing" : "grab") : "auto",
        }}
      >
        <AdaptiveDpr pixelated />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.15} color="#fff5ec" />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#dbe4ff" />
        <Suspense fallback={null}>
          <StudioEnv />
          <Parallax pointerRef={pointerRef} draggingRef={draggingRef} enabled={parallaxOn}>
            <Bust src={src} rotation={rotation} />
          </Parallax>
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
            onStart={() => {
              draggingRef.current = true;
              setGrabbing(true);
            }}
            onEnd={() => {
              draggingRef.current = false;
              setGrabbing(false);
            }}
          />
        )}
      </Canvas>
    </div>
  );
}
