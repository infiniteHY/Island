import { CuboidCollider, CylinderCollider, RoundCuboidCollider, RigidBody } from "@react-three/rapier";

const sideSegments = [
  { y: -1.82, x: 0.72, height: 0.28, angle: 0.26, depth: 0.6 },
  { y: -1.28, x: 0.84, height: 0.42, angle: 0.14, depth: 0.66 },
  { y: -0.44, x: 0.9, height: 0.56, angle: 0.02, depth: 0.7 },
  { y: 0.44, x: 0.82, height: 0.46, angle: -0.18, depth: 0.62 },
  { y: 1.18, x: 0.58, height: 0.32, angle: -0.34, depth: 0.5 },
  { y: 1.72, x: 0.36, height: 0.26, angle: -0.08, depth: 0.34 }
];

export function BottlePhysics() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CylinderCollider args={[0.12, 0.68]} position={[0, -2.11, 0]} friction={0.95} />
      <CuboidCollider args={[0.68, 0.05, 0.64]} position={[0, -2.16, 0]} friction={0.95} />

      {sideSegments.map((segment) => (
        <RoundCuboidCollider
          key={`left-${segment.y}`}
          args={[0.055, segment.height, segment.depth, 0.035]}
          position={[-segment.x, segment.y, 0]}
          rotation={[0, 0, -segment.angle]}
          friction={0.22}
        />
      ))}
      {sideSegments.map((segment) => (
        <RoundCuboidCollider
          key={`right-${segment.y}`}
          args={[0.055, segment.height, segment.depth, 0.035]}
          position={[segment.x, segment.y, 0]}
          rotation={[0, 0, segment.angle]}
          friction={0.22}
        />
      ))}

      <RoundCuboidCollider args={[0.62, 1.72, 0.045, 0.035]} position={[0, -0.46, -0.58]} friction={0.18} />
      <RoundCuboidCollider args={[0.62, 1.72, 0.045, 0.035]} position={[0, -0.46, 0.58]} friction={0.18} />
      <RoundCuboidCollider args={[0.3, 0.58, 0.04, 0.03]} position={[0, 1.58, -0.31]} friction={0.2} />
      <RoundCuboidCollider args={[0.3, 0.58, 0.04, 0.03]} position={[0, 1.58, 0.31]} friction={0.2} />
    </RigidBody>
  );
}
