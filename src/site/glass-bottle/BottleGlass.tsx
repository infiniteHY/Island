import { useMemo } from "react";
import * as THREE from "three";

function useBottleGeometry() {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0.08, -2.22),
      new THREE.Vector2(0.6, -2.22),
      new THREE.Vector2(0.78, -2.08),
      new THREE.Vector2(0.9, -1.55),
      new THREE.Vector2(0.94, -0.46),
      new THREE.Vector2(0.88, 0.68),
      new THREE.Vector2(0.64, 1.28),
      new THREE.Vector2(0.36, 1.78),
      new THREE.Vector2(0.32, 2.17),
      new THREE.Vector2(0.43, 2.32),
      new THREE.Vector2(0.49, 2.37)
    ];

    const geometry = new THREE.LatheGeometry(points, 128);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

export function BottleGlass() {
  const geometry = useBottleGeometry();

  return (
    <group position={[0, -0.08, 0]} renderOrder={1}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          transparent
          opacity={0.34}
          transmission={0.96}
          thickness={0.42}
          ior={1.43}
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.65}
          depthWrite={false}
          color="#eaf8ff"
        />
      </mesh>
      <mesh geometry={geometry} scale={[1.006, 1.002, 1.006]}>
        <meshBasicMaterial transparent opacity={0.16} color="#7ea5b8" depthWrite={false} />
      </mesh>
    </group>
  );
}
