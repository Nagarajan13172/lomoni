import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { BASEPLATE, STUD, PLATE, STUD_R, STUD_H } from "../bricks";

const _dummy = new THREE.Object3D();
const PLATE_COLOR = "#4a8a54";

/** The green build board: a flat plate with a full grid of studs on top. */
export function Baseplate() {
  const N = BASEPLATE;
  const size = N * STUD;
  const studs = useRef();

  useLayoutEffect(() => {
    const m = studs.current;
    if (!m) return;
    let i = 0;
    for (let x = 0; x < N; x++)
      for (let z = 0; z < N; z++) {
        _dummy.position.set(
          (x + 0.5) * STUD - size / 2,
          STUD_H / 2,
          (z + 0.5) * STUD - size / 2
        );
        _dummy.updateMatrix();
        m.setMatrixAt(i++, _dummy.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, [N, size]);

  return (
    <group>
      <mesh receiveShadow position={[0, -PLATE / 2, 0]}>
        <boxGeometry args={[size, PLATE, size]} />
        <meshStandardMaterial color={PLATE_COLOR} roughness={0.75} metalness={0} />
      </mesh>
      <instancedMesh ref={studs} args={[undefined, undefined, N * N]} receiveShadow>
        <cylinderGeometry args={[STUD_R, STUD_R, STUD_H, 12]} />
        <meshStandardMaterial color={PLATE_COLOR} roughness={0.75} metalness={0} />
      </instancedMesh>
    </group>
  );
}
