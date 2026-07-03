/**
 * Floor-prop registry. Every prop is a <group> of three.js primitive meshes
 * (no external assets) that cast + receive shadows. Props rest with their
 * bottoms on y=0 (or dipping ~2mm below to kill the contact seam). The figure
 * stands at the origin ~3 units tall; default transforms place each prop so it
 * reads sensibly, and the user can nudge them with the move gizmo.
 */
import * as THREE from "three";

const MAT = {
  plaster: { color: "#cdced4", roughness: 0.95, metalness: 0 },
  wood: { color: "#a9743f", roughness: 0.6, metalness: 0 },
  stone: { color: "#9a978f", roughness: 0.9, metalness: 0 },
  accent: { color: "#7c8a72", roughness: 0.7, metalness: 0 },
  rubber: { color: "#c86f5a", roughness: 0.5, metalness: 0, clearcoat: 0.2 },
};

function Box({ args, position, rotation, mat = "plaster" }) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial {...MAT[mat]} />
    </mesh>
  );
}

// ---------- individual props ----------
const Cube = () => <Box args={[0.9, 0.9, 0.9]} position={[0, 0.449, 0]} mat="accent" />;

const Step = () => <Box args={[1.4, 0.3, 0.9]} position={[0, 0.149, 0]} mat="wood" />;

function Chair({ back = true } = {}) {
  const legs = [
    [-0.42, 0.4, -0.42], [0.42, 0.4, -0.42],
    [-0.42, 0.4, 0.42], [0.42, 0.4, 0.42],
  ];
  return (
    <group>
      <Box args={[1.0, 0.09, 1.0]} position={[0, 0.8, 0]} mat="wood" />
      {legs.map((p, i) => (
        <Box key={i} args={[0.09, 0.8, 0.09]} position={p} mat="wood" />
      ))}
      {back && <Box args={[1.0, 0.95, 0.09]} position={[0, 1.28, -0.46]} mat="wood" />}
    </group>
  );
}

const Stool = () => <Chair back={false} />;

function Bench() {
  return (
    <group>
      <Box args={[3.0, 0.1, 0.75]} position={[0, 0.55, 0]} mat="wood" />
      {[-1.3, 1.3].map((x, i) => (
        <Box key={i} args={[0.12, 0.55, 0.7]} position={[x, 0.275, 0]} mat="wood" />
      ))}
    </group>
  );
}

function Stairs({ steps = 5, rise = 0.35, tread = 0.42, width = 1.8 } = {}) {
  return (
    <group>
      {Array.from({ length: steps }).map((_, i) => {
        const h = (i + 1) * rise;
        const z = -i * tread;
        return (
          <Box
            key={i}
            args={[width, h, tread]}
            position={[0, h / 2 - 0.001, z]}
            mat="plaster"
          />
        );
      })}
    </group>
  );
}

const Wall = () => <Box args={[3.2, 3.6, 0.16]} position={[0, 1.8, 0]} mat="plaster" />;

function Pedestal() {
  return (
    <group>
      <Box args={[1.4, 0.14, 1.4]} position={[0, 0.07, 0]} mat="plaster" />
      <Box args={[1.0, 0.78, 1.0]} position={[0, 0.52, 0]} mat="plaster" />
      <Box args={[1.4, 0.12, 1.4]} position={[0, 0.97, 0]} mat="plaster" />
    </group>
  );
}

const Pillar = () => (
  <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
    <cylinderGeometry args={[0.4, 0.42, 3.0, 32]} />
    <meshStandardMaterial {...MAT.stone} />
  </mesh>
);

const Sphere = () => (
  <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
    <sphereGeometry args={[0.7, 40, 32]} />
    <meshStandardMaterial {...MAT.rubber} />
  </mesh>
);

function makeRampShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(2.4, 0);
  s.lineTo(0, 1.3);
  s.lineTo(0, 0);
  return s;
}
function Ramp() {
  // right-triangular prism wedge (~28°)
  return (
    <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]} position={[-0.8, 0, 0.8]}>
      <extrudeGeometry args={[makeRampShape(), { depth: 1.6, bevelEnabled: false }]} />
      <meshStandardMaterial {...MAT.plaster} />
    </mesh>
  );
}

const Disc = () => (
  <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
    <cylinderGeometry args={[1.35, 1.35, 0.16, 64]} />
    <meshStandardMaterial {...MAT.plaster} />
  </mesh>
);

function Beam() {
  return (
    <group>
      <Box args={[4.0, 0.16, 0.24]} position={[0, 0.6, 0]} mat="wood" />
      {[-1.8, 1.8].map((x, i) => (
        <Box key={i} args={[0.16, 0.52, 0.24]} position={[x, 0.26, 0]} mat="wood" />
      ))}
    </group>
  );
}

export const PROPS = [
  { id: "none", name: "None", icon: "⬜", Component: null, defaultTransform: {} },
  { id: "cube", name: "Cube block", icon: "🧊", Component: Cube, defaultTransform: { position: [0.9, 0, 0.2] } },
  { id: "step", name: "Low step", icon: "📦", Component: Step, defaultTransform: { position: [0, 0, 0.6] } },
  { id: "chair", name: "Chair", icon: "🪑", Component: Chair, defaultTransform: { position: [0, 0, -0.15] } },
  { id: "stool", name: "Stool", icon: "🪑", Component: Stool, defaultTransform: { position: [0, 0, 0] } },
  { id: "bench", name: "Bench", icon: "🛋️", Component: Bench, defaultTransform: { position: [0, 0, 0] } },
  { id: "stairs", name: "Stairs", icon: "🪜", Component: Stairs, defaultTransform: { position: [0, 0, -0.6] } },
  { id: "wall", name: "Wall", icon: "🧱", Component: Wall, defaultTransform: { position: [0, 0, -1.1] } },
  { id: "pedestal", name: "Pedestal", icon: "🏛️", Component: Pedestal, defaultTransform: { position: [0, 0, 0] } },
  { id: "pillar", name: "Pillar", icon: "🏛", Component: Pillar, defaultTransform: { position: [1.6, 0, -0.6] } },
  { id: "sphere", name: "Ball", icon: "🔴", Component: Sphere, defaultTransform: { position: [1.0, 0, 0.3] } },
  { id: "ramp", name: "Ramp", icon: "🛝", Component: Ramp, defaultTransform: { position: [0, 0, 0.4] } },
  { id: "disc", name: "Podium disc", icon: "⭕", Component: Disc, defaultTransform: { position: [0, 0, 0] } },
  { id: "beam", name: "Balance beam", icon: "➖", Component: Beam, defaultTransform: { position: [0, 0, 0] } },
];
