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
    shape.moveTo(0, -0.3);
    shape.bezierCurveTo(0.2, -0.3, 0.24, -0.16, 0.2, -0.04);
    shape.bezierCurveTo(0.17, 0.04, 0.17, 0.08, 0.21, 0.13);
    shape.bezierCurveTo(0.24, 0.18, 0.2, 0.24, 0.12, 0.24);
    shape.bezierCurveTo(0.08, 0.24, 0.06, 0.2, 0.03, 0.2);
    shape.bezierCurveTo(0, 0.2, -0.02, 0.24, -0.07, 0.245);
    shape.bezierCurveTo(-0.16, 0.25, -0.22, 0.19, -0.2, 0.12);
    shape.bezierCurveTo(-0.185, 0.07, -0.185, 0.03, -0.21, -0.04);
    shape.bezierCurveTo(-0.25, -0.17, -0.19, -0.3, 0, -0.3);

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
    <group rotation={[0, 0, -0.42]} position={[0, -0.05, 0]}>
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
      <mesh position={[-0.03, -0.26, 0.052]}>
        <cylinderGeometry args={[0.12, 0.12, 0.008, 20]} />
        <meshStandardMaterial color="#17130f" roughness={0.4} />
      </mesh>
      {/* 双拾音器 */}
      {[-0.14, -0.24].map((y) => (
        <mesh key={y} position={[0, y, 0.058]}>
          <boxGeometry args={[0.1, 0.036, 0.018]} />
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
      <mesh position={[0, 0.16, 0.012]}>
        <boxGeometry args={[0.062, 0.62, 0.026]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.5} />
      </mesh>
      {/* 指板 */}
      <mesh position={[0, 0.14, 0.028]}>
        <boxGeometry args={[0.06, 0.56, 0.008]} />
        <meshStandardMaterial color="#2c211a" roughness={0.45} />
      </mesh>
      {/* 品丝 */}
      {frets.map((y) => (
        <mesh key={y} position={[0, y - 0.14, 0.033]}>
          <boxGeometry args={[0.058, 0.006, 0.003]} />
          <meshStandardMaterial color="#b9bcc0" roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
      {/* 4 根弦（从琴桥拉到琴头） */}
      {strings.map((x) => (
        <mesh key={x} position={[x, 0.06, 0.038]}>
          <cylinderGeometry args={[0.0022, 0.0022, 0.78, 5]} />
          <meshStandardMaterial color="#d7d9dc" roughness={0.25} metalness={0.85} />
        </mesh>
      ))}
      {/* 琴头 */}
      <mesh position={[0.012, 0.5, 0.012]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.085, 0.14, 0.02]} />
        <meshStandardMaterial color={item.body} roughness={0.35} />
      </mesh>
      {/* 弦钮 ×4 */}
      {[0.455, 0.49, 0.525, 0.56].map((y, i) => (
        <mesh key={y} position={[i % 2 === 0 ? 0.06 : 0.052, y, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.014, 10]} />
          <meshStandardMaterial color={item.accent} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
