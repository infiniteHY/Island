import type { MiniProps } from "./BassMini";

/**
 * 胶片相机微缩：上银下黑双色机身 + 多段镜头（对焦环刻痕）
 * + 军舰部取景器 + 快门 + 过片扳手 + 背带环。
 */
export function CameraMini({ item, active }: MiniProps) {
  return (
    <group rotation={[-0.06, 0.08, 0]}>
      {/* 机身下半：饰皮 */}
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[0.56, 0.22, 0.18]} />
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
      <mesh position={[0, 0.16, -0.005]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.125, 0.125, 0.13]} />
        <meshStandardMaterial color={item.accent} roughness={0.28} metalness={0.75} />
      </mesh>
      {/* 取景窗 */}
      <mesh position={[0, 0.17, 0.068]}>
        <boxGeometry args={[0.068, 0.038, 0.009]} />
        <meshStandardMaterial color="#0a0d10" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* 镜头朝 +z：卡口 → 光圈环 → 对焦环 → 滤镜圈 → 前镜片 */}
      <group position={[0, -0.02, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.036, 32]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.052, 0]}>
          <cylinderGeometry args={[0.108, 0.112, 0.035, 32]} />
          <meshStandardMaterial color="#171a1d" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.091, 0]}>
          <cylinderGeometry args={[0.112, 0.112, 0.052, 32]} />
          <meshStandardMaterial color="#14171a" roughness={0.7} />
        </mesh>
        {/* 对焦环刻痕 */}
        <mesh position={[0, 0.091, 0]}>
          <cylinderGeometry args={[0.114, 0.114, 0.038, 24, 1, true]} />
          <meshStandardMaterial color="#34383c" roughness={0.86} wireframe />
        </mesh>
        <mesh position={[0, 0.132, 0]}>
          <cylinderGeometry args={[0.098, 0.108, 0.034, 32]} />
          <meshStandardMaterial color="#101315" roughness={0.4} />
        </mesh>
        {/* 前镜片：微凸深色玻璃 */}
        <mesh position={[0, 0.151, 0]} scale={[1, 0.28, 1]}>
          <sphereGeometry args={[0.084, 24, 14]} />
          <meshPhysicalMaterial color="#152b3d" roughness={0.04} metalness={0.25} clearcoat={1} clearcoatRoughness={0.02} />
        </mesh>
      </group>
      {/* 镜头释放钮与自拍定时拨杆 */}
      <mesh position={[-0.135, -0.005, 0.098]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.012, 12]} />
        <meshStandardMaterial color="#b9bdc0" roughness={0.26} metalness={0.72} />
      </mesh>
      <mesh position={[0.17, -0.055, 0.098]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.018, 0.075, 0.012]} />
        <meshStandardMaterial color="#c5c8ca" roughness={0.28} metalness={0.68} />
      </mesh>
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
      {/* 快门速度盘、热靴和前饰牌 */}
      <mesh position={[0.11, 0.14, -0.01]}>
        <cylinderGeometry args={[0.043, 0.043, 0.022, 20]} />
        <meshStandardMaterial color="#4d5155" roughness={0.32} metalness={0.72} />
      </mesh>
      <mesh position={[0, 0.226, -0.018]}>
        <boxGeometry args={[0.105, 0.012, 0.075]} />
        <meshStandardMaterial color="#5e6368" roughness={0.34} metalness={0.72} />
      </mesh>
      <mesh position={[-0.16, 0.07, 0.096]}>
        <boxGeometry args={[0.11, 0.035, 0.008]} />
        <meshStandardMaterial color="#d5d7d8" roughness={0.34} metalness={0.55} />
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
