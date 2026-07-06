import { useSiteStore } from "../../siteStore";

export function Furniture() {
  const dark = useSiteStore((state) => state.theme === "dark");
  const wood = dark ? "#5b4231" : "#b98352";
  const woodDark = dark ? "#35271f" : "#744a2e";
  const paper = dark ? "#d8c8a8" : "#fff7e8";

  return (
    <group>
      {/* 书桌 */}
      <group position={[-0.45, 0, -2.28]}>
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.45, 0.12, 0.82]} />
          <meshStandardMaterial color={wood} roughness={0.72} />
        </mesh>
        {[
          [-1.04, 0.39, -0.3],
          [1.04, 0.39, -0.3],
          [-1.04, 0.39, 0.3],
          [1.04, 0.39, 0.3]
        ].map((pos) => (
          <mesh key={pos.join(",")} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.1, 0.78, 0.1]} />
            <meshStandardMaterial color={woodDark} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 边柜 + 唱片机底座 */}
      <group position={[-2.42, 0.42, 0.38]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.16, 0.84, 0.86]} />
          <meshStandardMaterial color={wood} roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.06, 0.44]}>
          <boxGeometry args={[1.04, 0.04, 0.03]} />
          <meshStandardMaterial color={woodDark} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.22, 0.44]}>
          <boxGeometry args={[1.04, 0.04, 0.03]} />
          <meshStandardMaterial color={woodDark} roughness={0.8} />
        </mesh>
      </group>

      {/* 置物架 */}
      <group position={[1.82, 1.45, -3.12]}>
        {[0, 0.38, 0.76].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <boxGeometry args={[1.28, 0.06, 0.28]} />
            <meshStandardMaterial color={woodDark} roughness={0.72} />
          </mesh>
        ))}
        {[-0.4, -0.24, -0.08, 0.12].map((x, i) => (
          <mesh key={x} position={[x, 0.17, 0.02]} castShadow>
            <boxGeometry args={[0.1, 0.28 + i * 0.02, 0.18]} />
            <meshStandardMaterial color={["#3f72af", "#d94f45", "#e1b84b", "#5f8f68"][i]} roughness={0.82} />
          </mesh>
        ))}
        <mesh position={[0.42, 0.18, 0.02]} castShadow>
          <cylinderGeometry args={[0.13, 0.1, 0.18, 12]} />
          <meshStandardMaterial color="#7c5a3b" roughness={0.8} />
        </mesh>
        <mesh position={[0.42, 0.36, 0.02]} castShadow>
          <coneGeometry args={[0.16, 0.28, 7]} />
          <meshStandardMaterial color="#70a36b" roughness={0.74} />
        </mesh>
      </group>

      {/* 台灯 */}
      <group position={[0.45, 0.88, -2.45]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.42, 10]} />
          <meshStandardMaterial color={woodDark} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <coneGeometry args={[0.22, 0.28, 16, 1, true]} />
          <meshStandardMaterial color={paper} roughness={0.52} emissive={dark ? "#3b2408" : "#ffe6a8"} emissiveIntensity={dark ? 0.55 : 0.18} />
        </mesh>
      </group>

      {/* 挂画 / 杂物 */}
      <mesh position={[0.6, 1.8, -3.18]} castShadow>
        <boxGeometry args={[0.78, 0.5, 0.04]} />
        <meshStandardMaterial color={dark ? "#1f2b2d" : "#d9e4dc"} roughness={0.82} />
      </mesh>
      <mesh position={[0.6, 1.8, -3.145]}>
        <planeGeometry args={[0.58, 0.32]} />
        <meshBasicMaterial color={dark ? "#c0fe04" : "#1e69f6"} />
      </mesh>
      <mesh position={[0.9, 0.9, -2.18]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.16, 16]} />
        <meshStandardMaterial color={dark ? "#ded4bd" : "#f7f0df"} roughness={0.7} />
      </mesh>
    </group>
  );
}
