import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { BRICKS, STUD, PLATE, STUD_R, STUD_H, footprint, blockWorld } from "../bricks";

const _dummy = new THREE.Object3D();

/**
 * One brick: a coloured box with stud cylinders on top (instanced). Rotation is
 * baked into the footprint (fw/fd already swapped), so a plain brick needs no
 * mesh rotation — the studs and box just use the rotated dimensions.
 */
export function Brick({ block, ghost = false, highlight = null }) {
  const { type, rot, color } = block;
  const { fw, fd } = footprint(type, rot);
  const spec = BRICKS[type];
  const plates = spec.plates;
  const hasStuds = spec.studs;
  const w = fw * STUD, d = fd * STUD, h = plates * PLATE;
  const count = fw * fd;
  const pos = blockWorld(block);
  const studs = useRef();

  useLayoutEffect(() => {
    const m = studs.current;
    if (!m) return;
    let i = 0;
    for (let x = 0; x < fw; x++)
      for (let z = 0; z < fd; z++) {
        _dummy.position.set(
          (x - fw / 2 + 0.5) * STUD,
          h / 2 + STUD_H / 2,
          (z - fd / 2 + 0.5) * STUD
        );
        _dummy.updateMatrix();
        m.setMatrixAt(i++, _dummy.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, [fw, fd, h]);

  const opacity = ghost ? 0.45 : 1;
  const matProps = {
    color,
    roughness: 0.5,
    metalness: 0,
    transparent: ghost,
    opacity,
    depthWrite: !ghost,
    // Hover glow: red = will delete, blue = will pick up (move).
    emissive: highlight === "delete" ? "#ff2e4d" : highlight === "move" ? "#3aa0ff" : "#000000",
    emissiveIntensity: highlight ? 0.55 : 0,
  };

  return (
    <group position={pos} userData={{ blockId: block.id }}>
      <mesh castShadow={!ghost} receiveShadow={!ghost}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {hasStuds && (
        <instancedMesh
          key={fw + "x" + fd}
          ref={studs}
          args={[undefined, undefined, count]}
          castShadow={!ghost}
        >
          <cylinderGeometry args={[STUD_R, STUD_R, STUD_H, 16]} />
          <meshStandardMaterial {...matProps} />
        </instancedMesh>
      )}
    </group>
  );
}
