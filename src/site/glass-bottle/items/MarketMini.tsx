import { useMemo } from "react";
import type { MiniProps } from "./BassMini";

// K 线数据（局部坐标）
const CANDLES: Array<{ x: number; low: number; high: number; open: number; close: number }> = [
  { x: -0.16, open: -0.06, close: 0.0, high: 0.04, low: -0.1 },
  { x: -0.08, open: 0.0, close: -0.05, high: 0.03, low: -0.09 },
  { x: 0.0, open: -0.05, close: 0.03, high: 0.07, low: -0.08 },
  { x: 0.08, open: 0.03, close: 0.09, high: 0.13, low: 0.0 },
  { x: 0.16, open: 0.09, close: 0.05, high: 0.12, low: 0.02 }
];

// 均线折点
const MA_POINTS: Array<[number, number]> = [
  [-0.19, -0.07],
  [-0.08, -0.04],
  [0.02, 0.0],
  [0.12, 0.06],
  [0.2, 0.08]
];

/**
 * K 线牌微缩：画架式立牌 + 屏幕面 + 凸出的红绿 K 线柱（带影线）
 * + 一条黄色均线折线。
 */
export function MarketMini({ item, active }: MiniProps) {
  const maSegments = useMemo(() => {
    return MA_POINTS.slice(0, -1).map((p, i) => {
      const [x1, y1] = p;
      const [x2, y2] = MA_POINTS[i + 1];
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      return { cx, cy, length, angle };
    });
  }, []);

  return (
    <group>
      {/* 画架腿 ×3 */}
      {[
        { position: [-0.18, -0.22, 0.05] as const, rotation: [0.12, 0, 0.22] as const },
        { position: [0.18, -0.22, 0.05] as const, rotation: [0.12, 0, -0.22] as const },
        { position: [0, -0.22, -0.1] as const, rotation: [-0.3, 0, 0] as const }
      ].map((leg, i) => (
        <mesh key={i} position={[...leg.position]} rotation={[...leg.rotation]}>
          <boxGeometry args={[0.026, 0.36, 0.026]} />
          <meshStandardMaterial color="#6e5639" roughness={0.55} />
        </mesh>
      ))}
      {/* 屏幕板（微后仰） */}
      <group position={[0, 0.02, 0.02]} rotation={[-0.12, 0, 0]}>
        {/* 外框 */}
        <mesh>
          <boxGeometry args={[0.52, 0.38, 0.03]} />
          <meshStandardMaterial
            color={item.accent}
            roughness={0.4}
            metalness={0.2}
            emissive={active ? item.accent : "#000000"}
            emissiveIntensity={active ? 0.14 : 0}
          />
        </mesh>
        {/* 屏幕面 */}
        <mesh position={[0, 0, 0.017]}>
          <boxGeometry args={[0.47, 0.33, 0.006]} />
          <meshStandardMaterial color={item.body} roughness={0.3} />
        </mesh>
        {/* K 线柱 + 影线 */}
        {CANDLES.map((c) => {
          const up = c.close >= c.open;
          const bodyH = Math.max(Math.abs(c.close - c.open), 0.02);
          const bodyY = (c.open + c.close) / 2;
          const wickH = c.high - c.low;
          const wickY = (c.high + c.low) / 2;
          return (
            <group key={c.x} position={[c.x, 0, 0.026]}>
              <mesh position={[0, wickY, -0.002]}>
                <boxGeometry args={[0.006, wickH, 0.004]} />
                <meshBasicMaterial color={up ? "#3ddc84" : "#ff6d65"} />
              </mesh>
              <mesh position={[0, bodyY, 0]}>
                <boxGeometry args={[0.042, bodyH, 0.012]} />
                <meshBasicMaterial color={up ? "#3ddc84" : "#ff6d65"} />
              </mesh>
            </group>
          );
        })}
        {/* 黄色均线 */}
        {maSegments.map((s, i) => (
          <mesh key={i} position={[s.cx, s.cy, 0.036]} rotation={[0, 0, s.angle]}>
            <boxGeometry args={[s.length, 0.008, 0.004]} />
            <meshBasicMaterial color="#f5c542" />
          </mesh>
        ))}
        {/* 角标：小指数牌 */}
        <mesh position={[-0.17, 0.12, 0.028]}>
          <boxGeometry args={[0.09, 0.032, 0.006]} />
          <meshBasicMaterial color="#2b3442" />
        </mesh>
      </group>
    </group>
  );
}
