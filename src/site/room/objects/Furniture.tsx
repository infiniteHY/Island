import { useSiteStore } from "../../siteStore";

export function Furniture() {
  const dark = useSiteStore((state) => state.theme === "dark");
  const wood = dark ? "#d8bc91" : "#e2c69b";
  const woodDark = dark ? "#5e5248" : "#6c6258";
  const cabinet = dark ? "#d4cec4" : "#e5ded3";
  const paper = dark ? "#d8c8a8" : "#fff7e8";

  return (
    <group>
      {/* 左侧现代书桌 */}
      <group position={[-1.65, 0, -2.18]}>
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.45, 0.12, 0.74]} />
          <meshStandardMaterial color={wood} roughness={0.72} />
        </mesh>
        {[
          [-1.08, 0.39, -0.28],
          [1.08, 0.39, -0.28],
          [-1.08, 0.39, 0.28],
          [1.08, 0.39, 0.28]
        ].map((pos) => (
          <mesh key={pos.join(",")} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.07, 0.78, 0.07]} />
            <meshStandardMaterial color={woodDark} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.92, 0.38, 0.32]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.76, 0.5]} />
          <meshStandardMaterial color={cabinet} roughness={0.78} />
        </mesh>
        {[0.2, 0.0, -0.2].map((y) => (
          <mesh key={y} position={[0.92, 0.42 + y, 0.58]}>
            <boxGeometry args={[0.42, 0.018, 0.02]} />
            <meshStandardMaterial color={woodDark} roughness={0.72} />
          </mesh>
        ))}
      </group>

      {/* 简化办公椅 */}
      <group position={[-1.28, 0.48, -0.98]} rotation={[0, 0.16, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.52, 0.12, 0.48]} />
          <meshStandardMaterial color="#2f3134" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.54, -0.2]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.56, 0.72, 0.08]} />
          <meshStandardMaterial color="#24282d" roughness={0.88} transparent opacity={0.86} />
        </mesh>
        <mesh position={[0, -0.26, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.56, 12]} />
          <meshStandardMaterial color="#242424" roughness={0.58} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((r) => (
          <group key={r} rotation={[0, r, 0]}>
            <mesh position={[0.24, -0.53, 0]} castShadow>
              <boxGeometry args={[0.45, 0.045, 0.045]} />
              <meshStandardMaterial color="#242424" roughness={0.58} />
            </mesh>
            <mesh position={[0.47, -0.56, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
              <meshStandardMaterial color="#151515" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 左侧墙前书柜 */}
      <group position={[-2.98, 0.9, -1.78]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 1.8, 1.18]} />
          <meshStandardMaterial color={wood} roughness={0.68} />
        </mesh>
        <mesh position={[0.19, 0, 0]} castShadow>
          <boxGeometry args={[0.035, 1.66, 1.06]} />
          <meshStandardMaterial color={dark ? "#3e3329" : "#6a5540"} roughness={0.72} />
        </mesh>
        {[-0.58, -0.18, 0.22, 0.62].map((y) => (
          <mesh key={y} position={[0.21, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.045, 1.08]} />
            <meshStandardMaterial color={dark ? "#b9976c" : "#caa77a"} roughness={0.72} />
          </mesh>
        ))}
        {[-0.48, 0.48].map((z) => (
          <mesh key={z} position={[0.21, 0, z]} castShadow>
            <boxGeometry args={[0.3, 1.68, 0.045]} />
            <meshStandardMaterial color={dark ? "#b9976c" : "#caa77a"} roughness={0.72} />
          </mesh>
        ))}
        {[
          [-0.55, -0.38, "#171717"],
          [-0.55, -0.25, "#25212a"],
          [-0.55, -0.11, "#30302c"],
          [-0.16, -0.42, "#6b2f35"],
          [-0.16, -0.27, "#1d3448"],
          [-0.16, -0.1, "#4f4a38"],
          [0.24, -0.35, "#202020"],
          [0.24, -0.18, "#6a3f2a"],
          [0.24, -0.02, "#314a38"]
        ].map(([y, z, color], i) => (
          <mesh key={i} position={[0.39, y as number, z as number]} rotation={[0, 0, i % 2 ? 0.04 : -0.025]} castShadow>
            <boxGeometry args={[0.13, 0.28, 0.075]} />
            <meshStandardMaterial color={color as string} roughness={0.78} />
          </mesh>
        ))}
        <mesh position={[0.38, 0.55, 0.28]} castShadow>
          <boxGeometry args={[0.12, 0.22, 0.34]} />
          <meshStandardMaterial color="#f1eee6" roughness={0.82} />
        </mesh>
        <mesh position={[0.38, 0.76, 0.28]} castShadow>
          <coneGeometry args={[0.16, 0.32, 7]} />
          <meshStandardMaterial color="#6ba36a" roughness={0.76} />
        </mesh>
      </group>

      {/* 右侧长柜 */}
      <group position={[1.45, 0.36, -2.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.85, 0.72, 0.72]} />
          <meshStandardMaterial color={cabinet} roughness={0.72} />
        </mesh>
        {[-0.48, 0.48].map((x) => (
          <mesh key={x} position={[x, 0, 0.37]}>
            <boxGeometry args={[0.018, 0.62, 0.02]} />
            <meshStandardMaterial color={dark ? "#b8b0a6" : "#cfc7bc"} roughness={0.76} />
          </mesh>
        ))}
        <mesh position={[0, -0.38, 0.37]}>
          <boxGeometry args={[2.7, 0.04, 0.035]} />
          <meshBasicMaterial color="#ffc07a" />
        </mesh>
      </group>

      {/* 右上置物盒 */}
      <group position={[2.02, 2.05, -3.08]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.54, 0.34]} />
          <meshStandardMaterial color={wood} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <boxGeometry args={[0.86, 0.42, 0.03]} />
          <meshBasicMaterial color="#1a1a18" transparent opacity={0.18} />
        </mesh>
        {[-0.32, -0.2, -0.08].map((x, i) => (
          <mesh key={x} position={[x, -0.02, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.34, 0.18]} />
            <meshStandardMaterial color={["#171717", "#25212a", "#30302c"][i]} roughness={0.82} />
          </mesh>
        ))}
        <mesh position={[0.25, -0.08, 0.22]} castShadow>
          <cylinderGeometry args={[0.13, 0.1, 0.18, 12]} />
          <meshStandardMaterial color="#f1eee6" roughness={0.8} />
        </mesh>
        <mesh position={[0.25, 0.12, 0.22]} castShadow>
          <coneGeometry args={[0.16, 0.28, 7]} />
          <meshStandardMaterial color="#70a36b" roughness={0.74} />
        </mesh>
        <pointLight position={[0, 0.24, 0.22]} intensity={0.55} color="#ffc07a" distance={1.2} />
      </group>

      {/* 左墙地图画框 */}
      <group position={[-2.05, 1.92, -3.15]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 0.7, 0.04]} />
          <meshStandardMaterial color="#6c5a4a" roughness={0.64} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.16, 0.56]} />
          <meshStandardMaterial color={paper} roughness={0.8} />
        </mesh>
        {[-0.35, -0.08, 0.18, 0.42].map((x, i) => (
          <mesh key={x} position={[x, 0.05 - i * 0.035, 0.04]}>
            <planeGeometry args={[0.18, 0.04]} />
            <meshBasicMaterial color="#b5a487" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
