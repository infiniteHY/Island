import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MiniProps } from "./BassMini";

/**
 * 桌面地球仪微缩：海洋球体 + 程序化大陆块 + 23.5° 倾斜轴
 * + 弧形支架 + 圆底座；active 时缓慢自转。
 */
export function EarthMini({ item, active }: MiniProps) {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += delta * (active ? 0.9 : 0.12);
  });

  // 简化大陆：贴着球面摆放的一组扁球体块
  const continents = useMemo(
    () =>
      [
        // [经度, 纬度, 尺寸x, 尺寸y]
        [0.3, 0.5, 0.13, 0.1], // 亚欧
        [1.5, 0.15, 0.1, 0.13], // 非洲
        [-1.6, 0.45, 0.09, 0.08], // 北美
        [-1.3, -0.5, 0.06, 0.1], // 南美
        [2.6, -0.55, 0.08, 0.05], // 澳洲
        [0.9, 0.95, 0.07, 0.04] // 北极圈碎块
      ].map(([lon, lat, sx, sy]) => {
        const r = 0.215;
        const x = r * Math.cos(lat) * Math.sin(lon);
        const y = r * Math.sin(lat);
        const z = r * Math.cos(lat) * Math.cos(lon);
        return { position: [x, y, z] as [number, number, number], scale: [sx, sy, 0.03] as [number, number, number] };
      }),
    []
  );

  return (
    <group>
      {/* 倾斜的地球组 */}
      <group rotation={[0, 0, -0.41]} position={[0, 0.08, 0]}>
        <group ref={globeRef}>
          {/* 海洋 */}
          <mesh>
            <sphereGeometry args={[0.215, 28, 20]} />
            <meshStandardMaterial
              color={item.body}
              roughness={0.42}
              metalness={0.05}
              emissive={active ? item.accent : "#000000"}
              emissiveIntensity={active ? 0.12 : 0}
            />
          </mesh>
          {/* 大陆块：法线朝外的扁球 */}
          {continents.map((c, i) => (
            <mesh
              key={i}
              position={c.position}
              scale={c.scale}
              onUpdate={(mesh) => mesh.lookAt(0, 0, 0)}
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#8fbf7a" roughness={0.55} />
            </mesh>
          ))}
        </group>
        {/* 南北极轴杆 */}
        <mesh>
          <cylinderGeometry args={[0.008, 0.008, 0.52, 8]} />
          <meshStandardMaterial color="#b9a06a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* 弧形支架：半圆环 */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.26, 0.012, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#b9a06a" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      {/* 支架立柱 */}
      <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, -0.41]}>
        <cylinderGeometry args={[0.014, 0.02, 0.16, 10]} />
        <meshStandardMaterial color="#b9a06a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 底座 */}
      <mesh position={[0.12, -0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.035, 20]} />
        <meshStandardMaterial color="#5a4632" roughness={0.4} metalness={0.15} />
      </mesh>
    </group>
  );
}
