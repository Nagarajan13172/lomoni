/** A visible floor plus a shadow-catcher plane so the light change reads clearly. */
export function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[24, 96]} />
        <meshStandardMaterial color="#dde2e8" roughness={0.97} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <shadowMaterial transparent opacity={0.38} />
      </mesh>
    </>
  );
}
