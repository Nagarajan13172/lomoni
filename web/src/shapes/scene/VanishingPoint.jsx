import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useShapes } from "../shapesStore";
import { lightPosition, vanishingPoint } from "../shapes";
import { GuideLine } from "./GuideLine";
import { useFloorDrag } from "./useFloorDrag";

const AMBER = "#d8921f";

/**
 * The shadow vanishing point — the floor point straight below the bulb, plus the
 * vertical dropped down to it. This is the anchor of the whole construction: pick
 * any shadow line on the floor, follow it backwards, and it arrives here. Always
 * visible, even with the dotted guides switched off, because without it the scene
 * is just a lamp and a blob.
 */
export function VanishingPoint() {
  const azimuth = useShapes((s) => s.azimuth);
  const height = useShapes((s) => s.height);
  const distance = useShapes((s) => s.distance);
  const showLabels = useShapes((s) => s.showLabels);
  const setLightFromFloor = useShapes((s) => s.setLightFromFloor);

  const light = lightPosition(azimuth, height, distance);
  const vp = vanishingPoint(azimuth, distance);

  // Dragging the mark itself is the most direct way to feel what it is: the bulb
  // rides along above it, and every shadow swings to follow.
  const grab = useRef([0, 0]);
  const { handlers, active } = useFloorDrag({
    enabled: true,
    onStart: (x, z) => {
      grab.current = [x - vp[0], z - vp[2]];
    },
    onMove: (x, z) => setLightFromFloor(x - grab.current[0], z - grab.current[1]),
  });

  // Four short ticks on the floor, crosshairing the point so it reads as a
  // located mark rather than a smudge.
  const tick = 0.85;
  const ticks = [
    [[vp[0] - tick, 0.04, vp[2]], [vp[0] - 0.3, 0.04, vp[2]]],
    [[vp[0] + 0.3, 0.04, vp[2]], [vp[0] + tick, 0.04, vp[2]]],
    [[vp[0], 0.04, vp[2] - tick], [vp[0], 0.04, vp[2] - 0.3]],
    [[vp[0], 0.04, vp[2] + 0.3], [vp[0], 0.04, vp[2] + tick]],
  ];

  return (
    <group>
      {/* The vertical: bulb straight down to the floor. */}
      <GuideLine
        start={light}
        end={[vp[0], 0.04, vp[2]]}
        color={AMBER}
        dashSize={0.36}
        gapSize={0.18}
        opacity={0.98}
        lineWidth={2.4}
        renderOrder={20}
      />

      {/* The mark itself, and its grab area. */}
      <mesh
        {...handlers}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[vp[0], 0.02, vp[2]]}
        visible={false}
      >
        <circleGeometry args={[1.3, 24]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vp[0], 0.022, vp[2]]} renderOrder={19}>
        <circleGeometry args={[0.26, 32]} />
        <meshBasicMaterial color="#8a4a12" toneMapped={false} fog={false} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vp[0], 0.024, vp[2]]} renderOrder={19}>
        <ringGeometry args={[0.5, 0.62, 40]} />
        <meshBasicMaterial color={AMBER} toneMapped={false} fog={false} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vp[0], 0.021, vp[2]]} renderOrder={19}>
        <ringGeometry args={[0.62, 1.15, 40]} />
        <meshBasicMaterial
          color={AMBER}
          transparent
          opacity={active ? 0.4 : 0.18}
          toneMapped={false}
          fog={false}
          depthWrite={false}
        />
      </mesh>
      {ticks.map(([start, end], index) => (
        <GuideLine
          key={`vp-tick-${index}`}
          start={start}
          end={end}
          color={AMBER}
          dashed={false}
          opacity={0.75}
          lineWidth={1.6}
          renderOrder={20}
        />
      ))}

      {showLabels && (
        <Html position={[vp[0], 0.05, vp[2]]} center zIndexRange={[14, 0]} style={{ pointerEvents: "none" }}>
          <div className="shapes-tag shapes-tag--vp">
            <b>Shadow vanishing point</b>
            <span>every shadow line points back here</span>
          </div>
        </Html>
      )}
    </group>
  );
}
