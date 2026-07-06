import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { MiniProps } from "./BassMini";

export function DumbbellMini({ item, active }: MiniProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += delta * (active ? 1.8 : 0.36);
  });

  return (
    <group ref={groupRef} rotation={[0.45, 0.22, -0.36]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.58, 16]} />
        <meshStandardMaterial color="#9ca3ad" roughness={0.32} metalness={0.75} />
      </mesh>
      {[-0.34, -0.27, 0.27, 0.34].map((x, i) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[i % 2 === 0 ? 0.11 : 0.095, i % 2 === 0 ? 0.11 : 0.095, 0.08, 20]} />
          <meshStandardMaterial
            color={item.body}
            roughness={0.42}
            metalness={0.5}
            emissive={active ? item.accent : "#000000"}
            emissiveIntensity={active ? 0.12 : 0}
          />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.046, 0.005, 8, 20]} />
          <meshStandardMaterial color="#c8ced6" roughness={0.28} metalness={0.78} />
        </mesh>
      ))}
    </group>
  );
}
