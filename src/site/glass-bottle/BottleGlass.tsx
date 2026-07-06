import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function useBottleGeometry() {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0.1, -2.2),
      new THREE.Vector2(0.52, -2.18),
      new THREE.Vector2(0.72, -2.02),
      new THREE.Vector2(0.86, -1.56),
      new THREE.Vector2(0.92, -0.42),
      new THREE.Vector2(0.86, 0.62),
      new THREE.Vector2(0.68, 1.16),
      new THREE.Vector2(0.42, 1.52),
      new THREE.Vector2(0.3, 1.84),
      new THREE.Vector2(0.29, 2.28)
    ];

    const geometry = new THREE.LatheGeometry(points, 128);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

export function BottleGlass() {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useBottleGeometry();

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        group.scale,
        { x: 0.94, y: 0.88, z: 0.94 },
        { x: 1, y: 1, z: 1, duration: 1.25, ease: "elastic.out(1, 0.7)" }
      );
      gsap.fromTo(group.position, { y: -0.22 }, { y: -0.08, duration: 1.05, ease: "power3.out" });
      gsap.to(group.rotation, {
        z: 0.018,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }, group);

    return () => ctx.revert();
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.08, 0]} renderOrder={1}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          transparent
          opacity={0.38}
          transmission={0.98}
          thickness={0.52}
          ior={1.43}
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.65}
          depthWrite={false}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={3.8}
        />
      </mesh>
      <mesh geometry={geometry} scale={[1.006, 1.002, 1.006]}>
        <meshBasicMaterial
          transparent
          opacity={0.16}
          color="#ffffff"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
