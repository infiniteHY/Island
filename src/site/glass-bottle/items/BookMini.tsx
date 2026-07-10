import type { MiniProps } from "./BassMini";

const foreEdgeLines = [-0.19, -0.14, -0.09, -0.04, 0.01, 0.06, 0.11, 0.16];
const pageLayers = [-0.032, -0.016, 0, 0.016, 0.032];

export function BookMini({ item, active }: MiniProps) {
  return (
    <group rotation={[0.2, -0.38, 0.18]}>
      {/* 竖版书芯：长边沿 y，短边沿 x。 */}
      <mesh position={[0.008, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.48, 0.09]} />
        <meshStandardMaterial color="#f1e7d2" roughness={0.78} />
      </mesh>

      {/* 前后封面略大于书芯，形成精装书三边飘口。 */}
      {[0.057, -0.057].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.52, 0.024]} />
          <meshStandardMaterial
            color={z > 0 ? item.body : "#4f2328"}
            roughness={0.56}
            emissive={active && z > 0 ? item.accent : "#000000"}
            emissiveIntensity={active && z > 0 ? 0.08 : 0}
          />
        </mesh>
      ))}

      {/* 唯一书脊：只沿左侧长边设置。 */}
      <mesh position={[-0.195, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.52, 0.138]} />
        <meshStandardMaterial color="#3f1b22" roughness={0.6} />
      </mesh>

      {/* 右侧书口，仅表现纸页，不使用封面或书脊材质。 */}
      <mesh position={[0.184, 0, 0]}>
        <boxGeometry args={[0.018, 0.46, 0.086]} />
        <meshStandardMaterial color="#e7d9bf" roughness={0.84} />
      </mesh>
      {foreEdgeLines.map((y) => (
        <mesh key={y} position={[0.194, y, 0]}>
          <boxGeometry args={[0.003, 0.012, 0.078]} />
          <meshStandardMaterial color="#bba98d" roughness={0.8} />
        </mesh>
      ))}
      {pageLayers.map((z) => (
        <mesh key={z} position={[0.194, 0, z]}>
          <boxGeometry args={[0.003, 0.45, 0.002]} />
          <meshStandardMaterial color="#c9b99d" roughness={0.86} />
        </mesh>
      ))}

      {/* 上下短边都是书页切口，不再出现第二、第三个“书脊”。 */}
      {[0.245, -0.245].map((y) => (
        <mesh key={y} position={[0.008, y, 0]}>
          <boxGeometry args={[0.34, 0.014, 0.086]} />
          <meshStandardMaterial color="#e7d9bf" roughness={0.84} />
        </mesh>
      ))}

      {/* 书脊上下端的小型堵头布。 */}
      {[0.242, -0.242].map((y) => (
        <mesh key={y} position={[-0.166, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.095, 10]} />
          <meshStandardMaterial color="#d7b76e" roughness={0.64} />
        </mesh>
      ))}

      {/* 封面烫印与简洁图形。 */}
      <mesh position={[0.035, 0.11, 0.071]}>
        <boxGeometry args={[0.22, 0.012, 0.005]} />
        <meshStandardMaterial color={item.accent} roughness={0.5} />
      </mesh>
      <mesh position={[0.07, -0.035, 0.072]}>
        <boxGeometry args={[0.09, 0.13, 0.005]} />
        <meshStandardMaterial color="#2f151a" roughness={0.62} />
      </mesh>
      <mesh position={[0.04, -0.035, 0.076]}>
        <boxGeometry args={[0.016, 0.25, 0.003]} />
        <meshStandardMaterial color="#c43737" roughness={0.46} />
      </mesh>

      {/* 从下书口伸出的织带书签。 */}
      <mesh position={[-0.07, -0.31, 0.01]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.024, 0.14, 0.005]} />
        <meshStandardMaterial color="#b52f36" roughness={0.72} />
      </mesh>
    </group>
  );
}
