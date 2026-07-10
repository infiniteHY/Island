import { useSiteStore } from "../../siteStore";
import { useMemo } from "react";

/** 开放式两墙房间：从右前方观看时不会被墙体挡住。 */
export function RoomShell() {
  const theme = useSiteStore((state) => state.theme);
  const dark = theme === "dark";
  const stars = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => {
        const x = ((i * 37) % 640) / 100 - 3.2;
        const y = 0.32 + (((i * 53) % 390) / 100);
        const size = 0.008 + ((i * 17) % 4) * 0.004;
        const opacity = 0.34 + ((i * 29) % 60) / 100;
        return { x, y, size, opacity };
      }),
    []
  );
  const sideStars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const z = ((i * 41) % 640) / 100 - 3.1;
        const y = 0.42 + (((i * 47) % 370) / 100);
        const size = 0.007 + ((i * 13) % 4) * 0.003;
        const opacity = 0.25 + ((i * 31) % 50) / 100;
        return { z, y, size, opacity };
      }),
    []
  );
  const nebula = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: -1.95 + i * 0.24,
        y: 2.62 - i * 0.035 + Math.sin(i * 1.7) * 0.08,
        r: 0.18 + ((i * 7) % 5) * 0.045,
        opacity: 0.05 + ((i * 11) % 6) * 0.014,
        color: i % 3 === 0 ? "#ffb7c9" : i % 3 === 1 ? "#bda8ff" : "#f7efff"
      })),
    []
  );

  const wall = dark ? "#10182d" : "#18294a";
  const wallSide = dark ? "#0b1326" : "#14233f";
  const floor = dark ? "#d9d3c8" : "#e4ddd2";
  const floorLine = dark ? "#c5beb2" : "#cbc3b7";
  const light = dark ? "#ffc07a" : "#ffd7a0";

  return (
    <group>
      {/* 地板 */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[6.6, 0.12, 6.6]} />
        <meshStandardMaterial color={floor} roughness={0.68} />
      </mesh>
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <mesh key={x} position={[x, 0.003, 0]}>
          <boxGeometry args={[0.012, 0.004, 6.6]} />
          <meshStandardMaterial color={floorLine} roughness={0.76} />
        </mesh>
      ))}

      {/* 星空后墙 */}
      <mesh position={[0, 2.05, -3.26]} receiveShadow>
        <boxGeometry args={[6.6, 4.32, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[-3.26, 2.05, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.32, 6.6]} />
        <meshStandardMaterial color={wallSide} roughness={0.9} />
      </mesh>
      {/* 程序化银河：用柔和星云斑点避免贴图依赖 */}
      {nebula.map((blob, index) => (
        <mesh key={index} position={[blob.x, blob.y, -3.175]} rotation={[0, 0, -0.28]} scale={[1.8, 0.58, 1]}>
          <circleGeometry args={[blob.r, 24]} />
          <meshBasicMaterial color={blob.color} transparent opacity={blob.opacity} depthWrite={false} />
        </mesh>
      ))}
      {stars.map((star, index) => (
        <mesh key={index} position={[star.x, star.y, -3.17]}>
          <circleGeometry args={[star.size, 8]} />
          <meshBasicMaterial color="#f5f7ff" transparent opacity={star.opacity} depthWrite={false} />
        </mesh>
      ))}
      {sideStars.map((star, index) => (
        <mesh key={index} position={[-3.17, star.y, star.z]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[star.size, 8]} />
          <meshBasicMaterial color="#f5f7ff" transparent opacity={star.opacity} depthWrite={false} />
        </mesh>
      ))}
      {/* 暖色地脚灯带 */}
      <mesh position={[0, 0.075, -3.17]}>
        <boxGeometry args={[6.35, 0.035, 0.028]} />
        <meshBasicMaterial color={light} />
      </mesh>
      <mesh position={[-3.17, 0.075, 0]}>
        <boxGeometry args={[0.028, 0.035, 6.35]} />
        <meshBasicMaterial color={light} />
      </mesh>
      <pointLight position={[0, 0.18, -2.95]} intensity={dark ? 0.9 : 0.7} color={light} distance={4.8} />

      {/* 地毯 */}
      <mesh position={[-0.9, 0.012, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[2.7, 1.75, 0.018]} />
        <meshStandardMaterial color={dark ? "#45464b" : "#b9b8ba"} roughness={0.95} />
      </mesh>
    </group>
  );
}
