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

  const strings = useMemo(() => [-0.024, -0.008, 0.008, 0.024], []);
  const frets = useMemo(
    () => Array.from({ length: 20 }, (_, index) => 0.66 - 0.82 * (1 - 2 ** (-(index + 1) / 12))),
    []
  );
  const dotFrets = useMemo(() => [3, 5, 7, 9, 12, 15, 17, 19], []);

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
      {/* 三层护板，位于琴颈拾音器与控制区之间 */}
      <mesh position={[-0.025, -0.22, 0.052]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.14, 0.23, 0.009]} />
        <meshStandardMaterial color="#f1e5c7" roughness={0.45} />
      </mesh>
      {/* 双拾音器 */}
      {[-0.12, -0.245].map((y, pickupIndex) => (
        <mesh key={y} position={[0, y, 0.058]}>
          <boxGeometry args={[pickupIndex === 0 ? 0.135 : 0.145, 0.035, 0.018]} />
          <meshStandardMaterial color="#0c0a08" roughness={0.5} />
        </mesh>
      ))}
      {/* 每组 Jazz Bass 单线圈的 8 枚磁柱 */}
      {[-0.12, -0.245].flatMap((y) =>
        strings.flatMap((x) =>
          [-0.008, 0.008].map((dy) => (
            <mesh key={`${y}-${x}-${dy}`} position={[x, y + dy, 0.069]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.004, 8]} />
              <meshStandardMaterial color="#c9cdd0" roughness={0.22} metalness={0.86} />
            </mesh>
          ))
        )
      )}
      {/* 琴桥 */}
      <mesh position={[0, -0.34, 0.056]}>
        <boxGeometry args={[0.115, 0.044, 0.014]} />
        <meshStandardMaterial color="#8f8f8f" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 四枚独立桥码对应四根弦 */}
      {strings.map((x) => (
        <mesh key={x} position={[x, -0.333, 0.068]}>
          <boxGeometry args={[0.011, 0.028, 0.009]} />
          <meshStandardMaterial color="#d2d4d5" roughness={0.23} metalness={0.82} />
        </mesh>
      ))}
      {/* 两音量一音色旋钮 */}
      {[
        [0.1, -0.33],
        [0.14, -0.27],
        [0.15, -0.2]
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.058]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
          <meshStandardMaterial color="#c9b47e" roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* 琴颈 */}
      <mesh position={[0, 0.24, 0.012]}>
        <boxGeometry args={[0.064, 0.84, 0.026]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.5} />
      </mesh>
      {/* 指板 */}
      <mesh position={[0, 0.24, 0.028]}>
        <boxGeometry args={[0.06, 0.78, 0.008]} />
        <meshStandardMaterial color="#2c211a" roughness={0.45} />
      </mesh>
      {/* 20 品按十二平均律逐渐收紧 */}
      {frets.map((y) => (
        <mesh key={y} position={[0, y, 0.034]}>
          <boxGeometry args={[0.061, 0.0032, 0.003]} />
          <meshStandardMaterial color="#b9bcc0" roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
      {/* 品位圆点；第 12 品双点 */}
      {dotFrets.flatMap((fret) => {
        const previous = fret === 1 ? 0.66 : frets[fret - 2];
        const current = frets[fret - 1];
        const y = (previous + current) / 2;
        const xs = fret === 12 ? [-0.017, 0.017] : [0];
        return xs.map((x) => (
          <mesh key={`${fret}-${x}`} position={[x, y, 0.036]}>
            <circleGeometry args={[0.006, 10]} />
            <meshStandardMaterial color="#ded8c9" roughness={0.45} />
          </mesh>
        ));
      })}
      {/* 上弦枕 */}
      <mesh position={[0, 0.645, 0.037]}>
        <boxGeometry args={[0.061, 0.012, 0.01]} />
        <meshStandardMaterial color="#e2ddcf" roughness={0.5} />
      </mesh>
      {/* 4 根弦（从琴桥拉到琴头） */}
      {strings.map((x) => (
        <mesh key={x} position={[x, 0.145, 0.038]}>
          <cylinderGeometry args={[0.0022, 0.0022, 1.01, 5]} />
          <meshStandardMaterial color="#d7d9dc" roughness={0.25} metalness={0.85} />
        </mesh>
      ))}
      {/* 琴头 */}
      <mesh position={[0.018, 0.75, 0.012]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.09, 0.22, 0.022]} />
        <meshStandardMaterial color={item.body} roughness={0.35} />
      </mesh>
      {/* Fender 式单边开放齿轮弦钮 */}
      {[0.68, 0.735, 0.79, 0.845].map((y) => (
        <group key={y} position={[0.066, y, 0.028]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.018, 10]} />
            <meshStandardMaterial color="#bfc3c6" roughness={0.28} metalness={0.78} />
          </mesh>
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.038, 0.022, 0.008]} />
            <meshStandardMaterial color={item.accent} roughness={0.3} metalness={0.66} />
          </mesh>
        </group>
      ))}
      {/* 上弦枕之后四根弦扇形走向单边弦钮 */}
      {[0.68, 0.735, 0.79, 0.845].map((targetY, index) => {
        const startX = strings[index];
        const targetX = 0.055;
        const dx = targetX - startX;
        const dy = targetY - 0.645;
        const length = Math.hypot(dx, dy);
        return (
          <mesh
            key={`head-string-${targetY}`}
            position={[(startX + targetX) / 2, (0.645 + targetY) / 2, 0.041]}
            rotation={[0, 0, -Math.atan2(dx, dy)]}
          >
            <cylinderGeometry args={[0.0018, 0.0018, length, 5]} />
            <meshStandardMaterial color="#d7d9dc" roughness={0.25} metalness={0.85} />
          </mesh>
        );
      })}
      {/* 背带钮与侧插孔 */}
      <mesh position={[0, -0.575, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.01, 0.018, 10]} />
        <meshStandardMaterial color="#bec2c5" roughness={0.24} metalness={0.82} />
      </mesh>
      <mesh position={[0.215, -0.28, 0.01]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.012, 12]} />
        <meshStandardMaterial color="#17191b" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}
