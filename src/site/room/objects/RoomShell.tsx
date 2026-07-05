import { useSiteStore } from "../../siteStore";

/** 房间壳：地板 / 两面墙 / 踢脚线 / 窗户（暖光）/ 光锥 / 地毯 */
export function RoomShell() {
  const theme = useSiteStore((state) => state.theme);
  const dark = theme === "dark";

  const wall = dark ? "#26271f" : "#efe8da";
  const wallSide = dark ? "#21221b" : "#e6dfcf";
  const floor = dark ? "#5c4a38" : "#c9a87c";
  const skirting = dark ? "#191a15" : "#d8cfbc";

  return (
    <group>
      {/* 地板 */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[6.6, 0.12, 6.6]} />
        <meshStandardMaterial color={floor} roughness={0.72} />
      </mesh>
      {/* 地板条纹（拼木缝） */}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <mesh key={x} position={[x, 0.002, 0]}>
          <boxGeometry args={[0.012, 0.004, 6.6]} />
          <meshStandardMaterial color={dark ? "#4c3d2e" : "#b8946a"} roughness={0.8} />
        </mesh>
      ))}
      {/* 后墙 */}
      <mesh position={[0, 1.5, -3.26]} receiveShadow>
        <boxGeometry args={[6.6, 3.12, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      {/* 左墙 */}
      <mesh position={[-3.26, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3.12, 6.6]} />
        <meshStandardMaterial color={wallSide} roughness={0.9} />
      </mesh>
      {/* 踢脚线 */}
      <mesh position={[0, 0.06, -3.19]}>
        <boxGeometry args={[6.6, 0.12, 0.03]} />
        <meshStandardMaterial color={skirting} roughness={0.7} />
      </mesh>
      <mesh position={[-3.19, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.12, 6.6]} />
        <meshStandardMaterial color={skirting} roughness={0.7} />
      </mesh>

      {/* 窗户（左墙）：框 + 发光的天空面 + 十字格 */}
      <group position={[-3.19, 1.75, -1.35]}>
        <mesh>
          <boxGeometry args={[0.06, 1.3, 1.5]} />
          <meshStandardMaterial color={dark ? "#3a3428" : "#f7f2e6"} roughness={0.6} />
        </mesh>
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.03, 1.14, 1.34]} />
          <meshBasicMaterial color={dark ? "#ff9e54" : "#ffe9bd"} />
        </mesh>
        {/* 窗棂 */}
        <mesh position={[0.045, 0, 0]}>
          <boxGeometry args={[0.02, 1.14, 0.05]} />
          <meshStandardMaterial color={dark ? "#3a3428" : "#e5decf"} roughness={0.6} />
        </mesh>
        <mesh position={[0.045, 0, 0]}>
          <boxGeometry args={[0.02, 0.05, 1.34]} />
          <meshStandardMaterial color={dark ? "#3a3428" : "#e5decf"} roughness={0.6} />
        </mesh>
      </group>
      {/* 窗光锥（假 volumetric：半透明渐变面） */}
      <mesh position={[-2.1, 1.05, -1.35]} rotation={[0, 0, -0.62]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshBasicMaterial
          color={dark ? "#ffb066" : "#fff3cf"}
          transparent
          opacity={dark ? 0.1 : 0.16}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* 地毯 */}
      <mesh position={[0.95, 0.012, 0.95]} rotation={[-Math.PI / 2, 0, 0.16]}>
        <circleGeometry args={[1.25, 36]} />
        <meshStandardMaterial color={dark ? "#37413c" : "#b9c4b1"} roughness={0.95} />
      </mesh>
      <mesh position={[0.95, 0.018, 0.95]} rotation={[-Math.PI / 2, 0, 0.16]}>
        <ringGeometry args={[1.02, 1.12, 36]} />
        <meshStandardMaterial color={dark ? "#2c3531" : "#a5b29c"} roughness={0.95} />
      </mesh>
    </group>
  );
}
