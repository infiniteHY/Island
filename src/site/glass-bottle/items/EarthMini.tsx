import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MiniProps } from "./BassMini";

type LandPatch = {
  lon: number;
  lat: number;
  scale: [number, number, number];
  color?: string;
};

function surfacePoint(lon: number, lat: number, radius: number) {
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

function LandMass({ patch }: { patch: LandPatch }) {
  const radius = 0.264;
  const position = surfacePoint(patch.lon, patch.lat, radius);
  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  return (
    <mesh position={position} quaternion={quaternion} scale={patch.scale} castShadow>
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial color={patch.color ?? "#7fa96b"} roughness={0.7} metalness={0.02} />
    </mesh>
  );
}

/** A palm-size planet miniature: raised land, polar paint, and a glossy clear coat. */
export function EarthMini({ item, active }: MiniProps) {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += delta * (active ? 0.82 : 0.1);
  });

  const land = useMemo<LandPatch[]>(
    () => [
      { lon: -1.95, lat: 0.62, scale: [0.075, 0.045, 0.018] },
      { lon: -1.64, lat: 0.36, scale: [0.064, 0.052, 0.018] },
      { lon: -1.28, lat: -0.36, scale: [0.05, 0.088, 0.017] },
      { lon: -1.0, lat: -0.82, scale: [0.035, 0.052, 0.014] },
      { lon: 0.02, lat: 0.55, scale: [0.118, 0.05, 0.018] },
      { lon: 0.48, lat: 0.44, scale: [0.108, 0.044, 0.018] },
      { lon: 0.73, lat: 0.05, scale: [0.06, 0.088, 0.018] },
      { lon: 1.14, lat: -0.26, scale: [0.045, 0.07, 0.016] },
      { lon: 1.88, lat: 0.1, scale: [0.074, 0.052, 0.017] },
      { lon: 2.54, lat: -0.5, scale: [0.06, 0.034, 0.014], color: "#8eb06c" },
      { lon: 2.85, lat: -0.82, scale: [0.03, 0.022, 0.012], color: "#8eb06c" }
    ],
    []
  );

  return (
    <group ref={globeRef} rotation={[0.18, 0, -0.28]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.258, 48, 32]} />
        <meshPhysicalMaterial
          color={item.body}
          roughness={0.34}
          metalness={0.02}
          clearcoat={0.65}
          clearcoatRoughness={0.18}
          emissive={active ? item.accent : "#000000"}
          emissiveIntensity={active ? 0.08 : 0}
        />
      </mesh>

      {land.map((patch, index) => (
        <LandMass key={index} patch={patch} />
      ))}

      <mesh position={surfacePoint(0, 1.42, 0.266)} scale={[0.065, 0.065, 0.012]}>
        <sphereGeometry args={[1, 18, 10]} />
        <meshStandardMaterial color="#edf8ff" roughness={0.45} />
      </mesh>
      <mesh position={surfacePoint(0, -1.38, 0.266)} scale={[0.075, 0.075, 0.012]}>
        <sphereGeometry args={[1, 18, 10]} />
        <meshStandardMaterial color="#edf8ff" roughness={0.45} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.268, 48, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          depthWrite={false}
        />
      </mesh>

      {active ? (
        <mesh>
          <sphereGeometry args={[0.287, 48, 32]} />
          <meshBasicMaterial color={item.accent} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}
