import type { MiniProps } from "./BassMini";

/**
 * 观鸟微缩：双筒望远镜（双镜筒 + 中轴合页 + 调焦轮 + 目镜）
 * + 停在镜筒上的迷你小鸟（呼应站内 bird 世界观，酸性绿点缀）。
 */
export function BirdMini({ item, active }: MiniProps) {
  return (
    <group>
      {/* ── 双筒望远镜（镜筒朝 +z）── */}
      <group position={[0, -0.1, 0]}>
        {[-0.095, 0.095].map((x) => (
          <group key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            {/* 物镜筒（前粗） */}
            <mesh position={[0, -0.07, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.16, 18]} />
              <meshStandardMaterial
                color={item.body}
                roughness={0.55}
                metalness={0.1}
                emissive={active ? item.accent : "#000000"}
                emissiveIntensity={active ? 0.12 : 0}
              />
            </mesh>
            {/* 物镜圈 + 镜片 */}
            <mesh position={[0, -0.155, 0]}>
              <cylinderGeometry args={[0.078, 0.078, 0.014, 18]} />
              <meshStandardMaterial color="#1c1e1c" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.163, 0]} scale={[1, 0.3, 1]}>
              <sphereGeometry args={[0.062, 16, 10]} />
              <meshStandardMaterial color="#25384d" roughness={0.08} metalness={0.55} />
            </mesh>
            {/* 目镜筒（后细） */}
            <mesh position={[0, 0.055, 0]}>
              <cylinderGeometry args={[0.052, 0.065, 0.1, 16]} />
              <meshStandardMaterial color={item.body} roughness={0.55} metalness={0.1} />
            </mesh>
            {/* 眼罩 */}
            <mesh position={[0, 0.115, 0]}>
              <cylinderGeometry args={[0.048, 0.052, 0.03, 14]} />
              <meshStandardMaterial color="#111311" roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* 中轴合页 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.2, 12]} />
          <meshStandardMaterial color="#23261f" roughness={0.5} />
        </mesh>
        {/* 调焦轮 */}
        <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.036, 0.03, 16]} />
          <meshStandardMaterial color="#4d5147" roughness={0.35} metalness={0.4} />
        </mesh>
        {/* 挂绳环 */}
        <mesh position={[0, 0.055, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.02, 0.006, 6, 10]} />
          <meshStandardMaterial color="#8a8f94" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* ── 停在镜筒上的小鸟 ── */}
      <group position={[0.095, 0.06, -0.02]} rotation={[0, -0.5, 0]}>
        {/* 身体 */}
        <mesh scale={[1, 0.88, 1.25]}>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial
            color={item.accent}
            roughness={0.6}
            emissive={active ? item.accent : "#000000"}
            emissiveIntensity={active ? 0.25 : 0}
          />
        </mesh>
        {/* 头 */}
        <mesh position={[0, 0.075, 0.06]}>
          <sphereGeometry args={[0.055, 14, 10]} />
          <meshStandardMaterial color={item.accent} roughness={0.6} />
        </mesh>
        {/* 喙 */}
        <mesh position={[0, 0.07, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.018, 0.05, 8]} />
          <meshStandardMaterial color="#e08a2e" roughness={0.4} />
        </mesh>
        {/* 眼睛 ×2 */}
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.095]}>
            <sphereGeometry args={[0.011, 8, 6]} />
            <meshStandardMaterial color="#101210" roughness={0.2} />
          </mesh>
        ))}
        {/* 翅膀 ×2 */}
        {[-0.075, 0.075].map((x) => (
          <mesh key={x} position={[x, 0.01, -0.01]} rotation={[0.2, 0, x > 0 ? -0.45 : 0.45]} scale={[0.35, 0.7, 1]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#94c40b" roughness={0.6} />
          </mesh>
        ))}
        {/* 翘尾 */}
        <mesh position={[0, 0.035, -0.115]} rotation={[-0.7, 0, 0]}>
          <boxGeometry args={[0.05, 0.014, 0.1]} />
          <meshStandardMaterial color="#94c40b" roughness={0.6} />
        </mesh>
        {/* 小脚 ×2 */}
        {[-0.028, 0.028].map((x) => (
          <mesh key={x} position={[x, -0.08, 0.01]}>
            <cylinderGeometry args={[0.006, 0.006, 0.045, 6]} />
            <meshStandardMaterial color="#e08a2e" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
