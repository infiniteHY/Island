import type { MiniProps } from "./BassMini";

/**
 * 胶片相机微缩：上银下黑双色机身 + 多段镜头（对焦环刻痕）
 * + 军舰部取景器 + 快门 + 过片扳手 + 背带环。
 */
export function CameraMini({ item, active }: MiniProps) {
  return (
    <group>
      {/* 机身下半：饰皮 */}
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[0.56, 0.21, 0.17]} />
        <meshStandardMaterial
          color={item.body}
          roughness={0.62}
          metalness={0.05}
          emissive={active ? item.accent : "#000000"}
          emissiveIntensity={active ? 0.1 : 0}
        />
      </mesh>
      {/* 机身上半：银色顶盖 */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[0.56, 0.075, 0.17]} />
        <meshStandardMaterial color={item.accent} roughness={0.28} metalness={0.75} />
      </mesh>
      {/* 军舰部（取景器凸起） */}
      <mesh position={[0, 0.155, 0]}>
        <boxGeometry args={[0.17, 0.055, 0.14]} />
        <meshStandardMaterial color={item.accent} roughness={0.28} metalness={0.75} />
      </mesh>
      {/* 取景窗 */}
      <mesh position={[0, 0.155, 0.072]}>
        <boxGeometry args={[0.07, 0.032, 0.006]} />
        <meshStandardMaterial color="#0a0d10" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* 镜头：卡口环 → 对焦环 → 前圈 → 镜片 */}
      <group position={[0, -0.02, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, -0.015, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.03, 24]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <cylinderGeometry args={[0.108, 0.108, 0.055, 24]} />
          <meshStandardMaterial color="#14171a" roughness={0.7} />
        </mesh>
        {/* 对焦环刻痕 */}
        <mesh position={[0, -0.055, 0]}>
          <cylinderGeometry args={[0.112, 0.112, 0.03, 32, 1, true]} />
          <meshStandardMaterial color="#2b2f33" roughness={0.9} wireframe />
        </mesh>
        <mesh position={[0, -0.095, 0]}>
          <cylinderGeometry args={[0.095, 0.1, 0.03, 24]} />
          <meshStandardMaterial color="#101315" roughness={0.4} />
        </mesh>
        {/* 前镜片：微凸深色玻璃 */}
        <mesh position={[0, -0.108, 0]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.08, 20, 12]} />
          <meshStandardMaterial color="#1a2c3d" roughness={0.08} metalness={0.6} />
        </mesh>
      </group>
      {/* 快门按钮 */}
      <mesh position={[0.185, 0.14, 0.02]}>
        <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
        <meshStandardMaterial color="#d8843f" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* 过片扳手 */}
      <mesh position={[0.235, 0.138, -0.02]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.1, 0.012, 0.025]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 回卷轮 */}
      <mesh position={[-0.21, 0.14, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.024, 14]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 背带环 ×2 */}
      {[-0.285, 0.285].map((x) => (
        <mesh key={x} position={[x, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.007, 6, 12]} />
          <meshStandardMaterial color="#8a8f94" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
