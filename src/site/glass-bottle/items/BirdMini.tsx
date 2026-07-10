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
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            {/* 物镜筒（前粗） */}
            <mesh position={[0, 0.085, 0]}>
              <cylinderGeometry args={[0.078, 0.068, 0.18, 24]} />
              <meshStandardMaterial
                color={item.body}
                roughness={0.55}
                metalness={0.1}
                emissive={active ? item.accent : "#000000"}
                emissiveIntensity={active ? 0.12 : 0}
              />
            </mesh>
            {/* 物镜圈 + 镜片 */}
            <mesh position={[0, 0.181, 0]}>
              <cylinderGeometry args={[0.082, 0.082, 0.018, 24]} />
              <meshStandardMaterial color="#1c1e1c" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.192, 0]} scale={[1, 0.25, 1]}>
              <sphereGeometry args={[0.067, 20, 12]} />
              <meshPhysicalMaterial color="#1d3850" roughness={0.04} metalness={0.25} clearcoat={1} clearcoatRoughness={0.02} />
            </mesh>
            {/* 棱镜肩部 */}
            <mesh position={[0, -0.015, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.105, 0.11, 0.105]} />
              <meshStandardMaterial color={item.body} roughness={0.62} metalness={0.08} />
            </mesh>
            {/* 目镜筒（后细） */}
            <mesh position={[0, -0.095, 0]}>
              <cylinderGeometry args={[0.052, 0.062, 0.09, 20]} />
              <meshStandardMaterial color={item.body} roughness={0.55} metalness={0.1} />
            </mesh>
            {/* 眼罩 */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.048, 0.054, 0.034, 20]} />
              <meshStandardMaterial color="#111311" roughness={0.8} />
            </mesh>
            {/* 右目镜屈光度调节环 */}
            {x > 0 ? (
              <mesh position={[0, -0.122, 0]}>
                <cylinderGeometry args={[0.058, 0.058, 0.018, 20, 1, true]} />
                <meshStandardMaterial color="#555a52" roughness={0.86} wireframe />
              </mesh>
            ) : null}
          </group>
        ))}
        {/* 中轴合页 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 16]} />
          <meshStandardMaterial color="#23261f" roughness={0.5} />
        </mesh>
        {/* 调焦轮 */}
        <mesh position={[0, 0.015, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.043, 0.043, 0.035, 20, 1, true]} />
          <meshStandardMaterial color="#5a5f54" roughness={0.78} metalness={0.22} wireframe />
        </mesh>
        {/* 两侧挂绳环 */}
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.015, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.021, 0.006, 6, 12]} />
            <meshStandardMaterial color="#8a8f94" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
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
        {/* 侧生眼睛，符合小型鸣禽头部结构 */}
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 0.095, 0.082]}>
            <sphereGeometry args={[0.012, 10, 8]} />
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
          <boxGeometry args={[0.06, 0.014, 0.12]} />
          <meshStandardMaterial color="#94c40b" roughness={0.6} />
        </mesh>
        {/* 小脚 ×2 */}
        {[-0.028, 0.028].map((x) => (
          <group key={x} position={[x, -0.08, 0.01]}>
            <mesh>
              <cylinderGeometry args={[0.006, 0.006, 0.045, 6]} />
              <meshStandardMaterial color="#e08a2e" roughness={0.5} />
            </mesh>
            {[-0.018, 0, 0.018].map((toeX) => (
              <mesh key={toeX} position={[toeX, -0.025, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.003, 0.003, 0.045, 5]} />
                <meshStandardMaterial color="#e08a2e" roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
