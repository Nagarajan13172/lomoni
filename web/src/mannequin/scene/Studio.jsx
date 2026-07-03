import { Suspense, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Grid,
  Environment,
  Lightformer,
  AdaptiveDpr,
  Bounds,
} from "@react-three/drei";
import * as THREE from "three";
import { Mannequin } from "./Mannequin";
import { JointHandles } from "./JointHandles";
import { PoseGizmo } from "./PoseGizmo";
import { PoseTweener } from "./PoseTweener";
import { UrlSync } from "./UrlSync";
import { Props } from "./Props";
import { useStore } from "../store";
import { getTheme } from "./themes";

/** Imperative per-theme scene/renderer bits (no shader recompile). */
function ThemeRig({ theme, thumb }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    // Thumbnail renders keep a transparent background.
    scene.background = thumb ? null : new THREE.Color(theme.bg);
    scene.fog = thumb ? null : new THREE.Fog(theme.bg, theme.fogNear, theme.fogFar);
    gl.toneMappingExposure = theme.exposure; // uniform → free
    gl.shadowMap.needsUpdate = true; // one re-render after the swap
  }, [gl, scene, theme, thumb]);
  return null;
}

/** Theme-driven three-point rig. Only the key light casts shadows. */
function ThemeLights({ theme }) {
  const { key, fill, rim, hemi } = theme;
  const [l, r, t, b] = key.shadowCam;
  return (
    <>
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
    </>
  );
}

/**
 * The hero shadow: a transparent shadow-only catcher plane. Its darkness is a
 * fixed opacity multiply — immune to the room brightening in the light theme,
 * so the cast shadow survives the theme switch (this is the Task-2 fix).
 */
function ShadowCatcher({ theme }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
      <planeGeometry args={[42, 42]} />
      <shadowMaterial
        transparent
        color={theme.catcher.color}
        opacity={theme.catcher.opacity}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Decorative floor layer (the shadow is owned by ShadowCatcher/ContactShadows). */
function Floor({ theme }) {
  const override = useStore((s) => s.floorStyle);
  const style = override === "auto" ? theme.floor : override;
  if (style === "none") return null;
  if (style === "solid") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[24, 72]} />
        <meshStandardMaterial color={theme.solid} roughness={0.96} metalness={0} />
      </mesh>
    );
  }
  // grid
  return (
    <Grid
      position={[0, 0, 0]}
      args={[30, 30]}
      cellSize={0.5}
      cellThickness={0.6}
      cellColor={theme.grid.cellColor}
      sectionSize={2.5}
      sectionThickness={1.1}
      sectionColor={theme.grid.sectionColor}
      fadeDistance={24}
      fadeStrength={1.4}
      infiniteGrid
      followCamera={false}
    />
  );
}

function ThemedEnvironment({ theme }) {
  // Key on theme.id so the offline env map re-bakes once per theme.
  return (
    <Environment key={theme.id} resolution={256} frames={1}>
      {theme.env.map((c, i) => (
        <Lightformer
          key={i}
          intensity={c.intensity}
          position={c.position}
          scale={c.scale}
          color={c.color}
        />
      ))}
    </Environment>
  );
}

/**
 * Auto-frames the camera to fit the current posed figure whenever a pose is
 * applied (frameSeq bumps) — so kneeling/crouching/lying poses stay properly in
 * view instead of dropping off-screen. Keeps the current viewing angle: only
 * the orbit target (figure centre) and distance (fit) change. Instant for
 * thumbnails, smoothly animated in the live studio.
 */
const _dir = new THREE.Vector3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();
const _easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function AutoFrame({ thumb }) {
  const { camera, controls } = useThree();
  const frameSeq = useStore((s) => s.frameSeq);
  const anim = useRef(null);

  // Compute the ideal { target, pos } to fit the current posed figure, keeping
  // the current viewing direction.
  const computeFit = () => {
    const getBounds = useStore.getState().getBounds;
    if (!getBounds || !controls) return null;
    const box = getBounds();
    if (!box || box.isEmpty()) return null;
    box.getCenter(_center);
    box.getSize(_size);
    const vFov = (camera.fov * Math.PI) / 180;
    const aspect = camera.aspect || 1;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const horiz = Math.max(_size.x, _size.z);
    const distV = _size.y / 2 / Math.tan(vFov / 2);
    const distH = horiz / 2 / Math.tan(hFov / 2);
    const margin = thumb ? 1.5 : 1.34;
    let dist = Math.max(distV, distH) * margin;
    dist = Math.max(2.2, Math.min(18, dist));
    _dir.copy(camera.position).sub(controls.target);
    if (_dir.lengthSq() < 1e-6) _dir.set(0.55, 0.42, 0.92);
    _dir.normalize();
    return {
      toT: _center.clone(),
      toP: _center.clone().addScaledVector(_dir, dist),
    };
  };

  // Discrete trigger for the live studio (instant applies, reset/mirror/randomize).
  useEffect(() => {
    if (thumb) return;
    const fit = computeFit();
    if (!fit) return;
    anim.current = {
      fromT: controls.target.clone(),
      toT: fit.toT,
      fromP: camera.position.clone(),
      toP: fit.toP,
      t: 0,
    };
  }, [frameSeq]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    // Thumbnails: fit every frame so the one-shot capture is always framed
    // correctly regardless of load/effect timing.
    if (thumb) {
      const fit = computeFit();
      if (fit) {
        controls.target.copy(fit.toT);
        camera.position.copy(fit.toP);
        controls.update();
      }
      return;
    }
    // Live studio: a single stable animation to the fit computed at pose-end.
    // (No per-frame re-fit — that recomputes the view direction from the moving
    // camera and slowly drifts the angle until the ground leaves the frame.)
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / 0.5);
    const k = _easeIO(a.t);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.update();
    if (a.t >= 1) anim.current = null;
  });

  return null;
}

export function Studio() {
  const select = useStore((s) => s.select);
  const setGL = useStore((s) => s.setGL);
  const themeId = useStore((s) => s.theme);
  const autoRotate = useStore((s) => s.autoRotate);
  const autoRotateSpeed = useStore((s) => s.autoRotateSpeed);
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const [sp] = useSearchParams();
  const thumb = sp.get("thumb") === "1";
  const hideFigure = useStore((s) => s.hideFigure);
  // Prop thumbnails auto-frame the (static) prop with <Bounds>; figure
  // thumbnails use a fixed head-to-toe camera (skinned bounds can't be fit).
  const propThumb = thumb && (hideFigure || sp.get("fit") === "prop");
  // Figure thumbnails: consistent 3/4 angle; AutoFrame fits distance + centre.
  const thumbCam = { position: [2.9, 2.6, 5.2], fov: 30, near: 0.1, far: 100 };
  const thumbTarget = [0, 1.1, 0];

  return (
    <Canvas
      shadows
      dpr={thumb ? 2 : [1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true, // for screenshots
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={thumb ? thumbCam : { position: [3.4, 2.5, 5.6], fov: 38, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        setGL(gl);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap; // constant for the app
      }}
      onPointerMissed={() => select(null)}
    >
      <AdaptiveDpr pixelated />
      <ThemeRig theme={theme} thumb={thumb} />
      <ThemeLights theme={theme} />

      <Suspense fallback={null}>
        <ThemedEnvironment theme={theme} />
        <Mannequin />
        {propThumb ? (
          <Bounds fit clip observe margin={1.15}>
            <Props />
          </Bounds>
        ) : (
          <Props />
        )}
        {!thumb && <JointHandles />}
        {!thumb && <PoseGizmo />}
        <PoseTweener />
        {!propThumb && <AutoFrame thumb={thumb} />}
        <UrlSync />
      </Suspense>

      {/* Grounding contact shadow (kept in thumbnails); cast catcher + floor only in the app */}
      <ContactShadows
        position={[0, 0.004, 0]}
        color={thumb ? "#222833" : theme.contact.color}
        opacity={thumb ? 0.35 : theme.contact.opacity}
        scale={thumb ? 6 : theme.contact.scale}
        blur={thumb ? 2.6 : theme.contact.blur}
        far={thumb ? 3 : theme.contact.far}
        resolution={1024}
      />
      {!thumb && <ShadowCatcher theme={theme} />}
      {!thumb && <Floor theme={theme} />}

      <OrbitControls
        makeDefault
        // Prop thumbnails let <Bounds> drive the camera/target (don't fight it).
        target={propThumb ? [0, 0, 0] : thumb ? thumbTarget : [0, 1.4, 0]}
        enableDamping={!thumb}
        dampingFactor={0.08}
        minDistance={2.5}
        maxDistance={14}
        maxPolarAngle={Math.PI * 0.52}
        autoRotate={autoRotate && !thumb}
        autoRotateSpeed={autoRotateSpeed}
      />
    </Canvas>
  );
}
