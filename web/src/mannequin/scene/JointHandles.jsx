import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JOINTS, useStore, handlesVisible } from "../store";

const tmp = new THREE.Vector3();

/**
 * A small clickable sphere floating at each editable joint. They render on top
 * of the body (depthTest off) so you can grab even occluded joints, and they
 * track the live bone world-positions every frame so they follow the pose.
 */
export function JointHandles() {
  const bones = useStore((s) => s.bones);
  const selected = useStore((s) => s.selected);
  const show = useStore(handlesVisible);
  const select = useStore((s) => s.select);
  const [hovered, setHovered] = useState(null);

  const items = useMemo(
    () => JOINTS.filter((j) => bones[j.name]),
    [bones]
  );
  const refs = useRef({});

  useFrame(() => {
    for (const j of items) {
      const mesh = refs.current[j.name];
      const bone = bones[j.name];
      if (mesh && bone) {
        bone.getWorldPosition(tmp);
        mesh.position.copy(tmp);
      }
    }
  });

  if (!show) return null;

  return (
    <group>
      {items.map((j) => {
        const isSel = selected === j.name;
        const isHov = hovered === j.name;
        const r = isSel ? 0.1 : 0.07;
        const color = isSel ? "#ff2e88" : isHov ? "#ffffff" : "#ffc23c";
        return (
          <mesh
            key={j.name}
            ref={(el) => (refs.current[j.name] = el)}
            renderOrder={999}
            onPointerDown={(e) => {
              e.stopPropagation();
              select(j.name);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(j.name);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered((h) => (h === j.name ? null : h));
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[r, 20, 20]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isSel ? 1 : 0.9}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
