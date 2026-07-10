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
      {/* 一体式钢芯与符合手掌弧度的握把 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.042, 0.042, 0.52, 24]} />
        <meshStandardMaterial color="#aeb5bd" roughness={0.24} metalness={0.82} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.052, 0.045, 0.3, 24]} />
        <meshStandardMaterial color="#c4cad0" roughness={0.3} metalness={0.76} />
      </mesh>

      {/* 菱纹握把：密集环纹在微缩尺度下比贴图更稳定 */}
      {Array.from({ length: 17 }, (_, index) => -0.128 + index * 0.016).map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.0525, 0.0025, 5, 12]} />
          <meshStandardMaterial color="#737a82" roughness={0.4} metalness={0.72} />
        </mesh>
      ))}

      {/* 橡胶包覆六角铃头：平面防滚，单侧是一整块而非多片杠铃片 */}
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.145, 0.145, 0.18, 6]} />
          <meshStandardMaterial
            color={item.body}
            roughness={0.82}
            metalness={0.02}
            emissive={active ? item.accent : "#000000"}
            emissiveIntensity={active ? 0.08 : 0}
          />
        </mesh>
      ))}

      {/* 钢制肩环把握把与包胶铃头锁在一起 */}
      {[-0.235, 0.235].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.064, 0.064, 0.04, 20]} />
          <meshStandardMaterial color="#c8ced6" roughness={0.28} metalness={0.78} />
        </mesh>
      ))}

      {/* 端面压印，提供真实器械常见的重量标识层次 */}
      {[-0.432, 0.432].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <mesh>
            <circleGeometry args={[0.087, 6]} />
            <meshStandardMaterial color="#17191c" roughness={0.88} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <torusGeometry args={[0.041, 0.006, 5, 18]} />
            <meshStandardMaterial color="#555b61" roughness={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
