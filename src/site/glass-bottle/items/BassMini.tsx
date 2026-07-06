import { useMemo } from "react";
import * as THREE from "three";
import type { BottleItemConfig } from "../bottleItems";

export type MiniProps = {
  item: BottleItemConfig;
  active: boolean;
};

/**
 * 电贝斯微缩：双缺角琴身（Extrude 圆角轮廓）+ 琴颈/指板/品丝
 * + 4 根弦 + 琴头弦钮 + 双拾音器 + 音量旋钮。
 */
export function BassMini({ item, active }: MiniProps) {
  const bodyGeometry = useMemo(() => {
    // 双缺角琴身轮廓（单位：局部坐标，y 向上）
    const shape = new THREE.Shape();
    shape.moveTo(0.04, -0.33);
    shape.bezierCurveTo(0.24, -0.31, 0.28, -0.18, 0.21, -0.07);
    shape.bezierCurveTo(0.15, 0.02, 0.17, 0.1, 0.25, 0.18);
    shape.bezierCurveTo(0.14, 0.2, 0.06, 0.17, 0.0, 0.09);
    shape.bezierCurveTo(-0.06, 0.19, -0.17, 0.18, -0.23, 0.1);
    shape.bezierCurveTo(-0.3, 0.0, -0.24, -0.11, -0.15, -0.15);
    shape.bezierCurveTo(-0.26, -0.26, -0.15, -0.35, 0.04, -0.33);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.075,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.014,
      bevelSegments: 2,
      curveSegments: 14
    });
    geometry.center();
    return geometry;
  }, []);

  const strings = useMemo(() => [-0.021, -0.007, 0.007, 0.021], []);
  const frets = useMemo(() => [0.16, 0.26, 0.35, 0.43, 0.5, 0.56], []);

  return (
    <group rotation={[0, 0, -0.28]} position={[0, -0.02, 0]} scale={[0.68, 1.22, 0.9]}>
      {/* 琴身 */}
      <mesh geometry={bodyGeometry} position={[0, -0.22, 0]}>
        <meshStandardMaterial
          color={item.body}
          roughness={0.32}
          metalness={0.08}
          emissive={active ? item.accent : "#000000"}
          emissiveIntensity={active ? 0.16 : 0}
        />
      </mesh>
      {/* 护板 */}
      <mesh position={[-0.02, -0.23, 0.052]}>
        <boxGeometry args={[0.12, 0.2, 0.01]} />
        <meshStandardMaterial color="#f1e5c7" roughness={0.45} />
      </mesh>
      {/* 双拾音器 */}
      {[-0.13, -0.23].map((y) => (
        <mesh key={y} position={[0, y, 0.058]}>
          <boxGeometry args={[0.13, 0.032, 0.018]} />
          <meshStandardMaterial color="#0c0a08" roughness={0.5} />
        </mesh>
      ))}
      {/* 琴桥 */}
      <mesh position={[0, -0.34, 0.056]}>
        <boxGeometry args={[0.09, 0.03, 0.016]} />
        <meshStandardMaterial color="#8f8f8f" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 旋钮 ×2 */}
      {[
        [0.1, -0.33],
        [0.14, -0.27]
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.058]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
          <meshStandardMaterial color="#c9b47e" roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* 琴颈 */}
      <mesh position={[0, 0.24, 0.012]}>
        <boxGeometry args={[0.052, 0.84, 0.026]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.5} />
      </mesh>
      {/* 指板 */}
      <mesh position={[0, 0.24, 0.028]}>
        <boxGeometry args={[0.052, 0.78, 0.008]} />
        <meshStandardMaterial color="#2c211a" roughness={0.45} />
      </mesh>
      {/* 品丝 */}
      {frets.map((y) => (
        <mesh key={y} position={[0, y - 0.04, 0.033]}>
          <boxGeometry args={[0.05, 0.006, 0.003]} />
          <meshStandardMaterial color="#b9bcc0" roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
      {/* 4 根弦（从琴桥拉到琴头） */}
      {strings.map((x) => (
        <mesh key={x} position={[x, 0.1, 0.038]}>
          <cylinderGeometry args={[0.0022, 0.0022, 1.02, 5]} />
          <meshStandardMaterial color="#d7d9dc" roughness={0.25} metalness={0.85} />
        </mesh>
      ))}
      {/* 琴头 */}
      <mesh position={[0.018, 0.72, 0.012]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.075, 0.18, 0.02]} />
        <meshStandardMaterial color={item.body} roughness={0.35} />
      </mesh>
      {/* 弦钮 ×4 */}
      {[0.66, 0.7, 0.74, 0.78].map((y, i) => (
        <mesh key={y} position={[i % 2 === 0 ? 0.058 : -0.052, y, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.014, 10]} />
          <meshStandardMaterial color={item.accent} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
