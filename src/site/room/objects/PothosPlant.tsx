import { useMemo } from "react";
import * as THREE from "three";

/**
 * 书柜顶的垂蔓绿萝：釉面陶盆 + 表土 + 顶部丛生叶冠 +
 * 数条沿曲线（CatmullRomCurve3 + TubeGeometry）垂下柜边的藤蔓，
 * 心形叶带叶柄、深浅绿相间、大小与朝向各不相同。
 */

const LEAF_TONES = ["#4e8a4a", "#3c6f3a", "#66a35c"];
const STEM = "#5d7f43";

/** 单片心形叶：压成薄片的叶身 + 前端叶尖 + 细叶柄（贴合真实绿萝叶形） */
function Leaf({
  position,
  rotation,
  scale = 1,
  tone
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  tone: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 叶柄 */}
      <mesh position={[0, 0.012, -0.018]} rotation={[0.9, 0, 0]}>
        <cylinderGeometry args={[0.0022, 0.0028, 0.03, 5]} />
        <meshStandardMaterial color={STEM} roughness={0.7} />
      </mesh>
      {/* 叶身：压扁薄片，基部宽圆（心形上半） */}
      <mesh rotation={[0.35, 0, 0]} scale={[1.1, 0.22, 1.25]} castShadow>
        <sphereGeometry args={[0.026, 12, 9]} />
        <meshStandardMaterial color={tone} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* 叶尖：压扁的尖锥，向前下垂出滴水尖 */}
      <mesh position={[0, -0.012, 0.026]} rotation={[1.05, 0, 0]} scale={[1.15, 1, 0.24]}>
        <coneGeometry args={[0.012, 0.026, 8]} />
        <meshStandardMaterial color={tone} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* 中脉：浅色细条 */}
      <mesh position={[0, 0.0058, 0.004]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.0016, 0.001, 0.038]} />
        <meshStandardMaterial color="#8fbc7a" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** 单条藤蔓：曲线茎管 + 沿茎分布、左右交错的叶片 */
function Vine({
  points,
  leaves
}: {
  points: [number, number, number][];
  leaves: { t: number; yaw: number; tilt: number; scale: number; tone: number }[];
}) {
  const { tube, curve } = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return { tube: new THREE.TubeGeometry(c, 20, 0.0035, 5, false), curve: c };
  }, [points]);

  return (
    <group>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color={STEM} roughness={0.7} />
      </mesh>
      {leaves.map(({ t, yaw, tilt, scale, tone }, i) => {
        const p = curve.getPoint(t);
        return (
          <Leaf
            key={i}
            position={[p.x, p.y + 0.004, p.z]}
            rotation={[tilt, yaw, (i % 2 === 0 ? 1 : -1) * 0.2]}
            scale={scale}
            tone={LEAF_TONES[tone % LEAF_TONES.length]}
          />
        );
      })}
    </group>
  );
}

export function PothosPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 釉面陶盆：束腰身 + 圆唇口 + 表土 */}
      <mesh position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.058, 0.13, 18]} />
        <meshStandardMaterial color="#c17a55" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.128, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.078, 0.008, 8, 20]} />
        <meshStandardMaterial color="#cd8a63" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.014, 16]} />
        <meshStandardMaterial color="#4a3826" roughness={0.95} />
      </mesh>

      {/* 顶部叶冠：一圈朝外微垂的叶 */}
      {[0.2, 1.1, 2.0, 2.9, 3.8, 4.8, 5.6].map((yaw, i) => (
        <Leaf
          key={i}
          position={[Math.sin(yaw) * 0.055, 0.16 + (i % 3) * 0.018, Math.cos(yaw) * 0.055]}
          rotation={[0.55 + (i % 2) * 0.2, yaw, 0]}
          scale={0.85 + (i % 3) * 0.18}
          tone={LEAF_TONES[i % LEAF_TONES.length]}
        />
      ))}

      {/* 藤蔓一：向前（+x）翻过柜沿长垂 */}
      <Vine
        points={[
          [0.02, 0.14, 0.01],
          [0.1, 0.12, 0.04],
          [0.17, 0.02, 0.07],
          [0.2, -0.18, 0.09],
          [0.22, -0.4, 0.06]
        ]}
        leaves={[
          { t: 0.16, yaw: 0.5, tilt: 0.5, scale: 0.9, tone: 0 },
          { t: 0.34, yaw: 1.4, tilt: 0.7, scale: 1.0, tone: 1 },
          { t: 0.52, yaw: 0.2, tilt: 0.9, scale: 0.85, tone: 2 },
          { t: 0.7, yaw: 1.1, tilt: 1.0, scale: 0.95, tone: 0 },
          { t: 0.86, yaw: 0.4, tilt: 1.1, scale: 0.8, tone: 1 },
          { t: 0.98, yaw: 0.9, tilt: 1.2, scale: 0.7, tone: 2 }
        ]}
      />
      {/* 藤蔓二：斜向右前（+x,+z）中长垂 */}
      <Vine
        points={[
          [0.0, 0.13, 0.03],
          [0.06, 0.1, 0.11],
          [0.11, -0.02, 0.17],
          [0.13, -0.22, 0.2]
        ]}
        leaves={[
          { t: 0.2, yaw: 2.2, tilt: 0.6, scale: 0.85, tone: 2 },
          { t: 0.45, yaw: 1.6, tilt: 0.85, scale: 0.95, tone: 0 },
          { t: 0.68, yaw: 2.5, tilt: 1.0, scale: 0.8, tone: 1 },
          { t: 0.92, yaw: 1.9, tilt: 1.15, scale: 0.7, tone: 2 }
        ]}
      />
      {/* 藤蔓三：向左后（-z）短垂 */}
      <Vine
        points={[
          [0.01, 0.13, -0.02],
          [0.05, 0.09, -0.09],
          [0.09, -0.03, -0.15],
          [0.1, -0.16, -0.18]
        ]}
        leaves={[
          { t: 0.25, yaw: -1.8, tilt: 0.6, scale: 0.8, tone: 1 },
          { t: 0.55, yaw: -2.4, tilt: 0.9, scale: 0.9, tone: 2 },
          { t: 0.85, yaw: -2.0, tilt: 1.1, scale: 0.72, tone: 0 }
        ]}
      />
      {/* 藤蔓四：贴着盆沿绕后的短枝 */}
      <Vine
        points={[
          [-0.02, 0.13, 0.0],
          [-0.09, 0.14, 0.03],
          [-0.14, 0.09, 0.06]
        ]}
        leaves={[
          { t: 0.4, yaw: -0.8, tilt: 0.5, scale: 0.85, tone: 0 },
          { t: 0.8, yaw: -1.3, tilt: 0.7, scale: 0.95, tone: 2 }
        ]}
      />
    </group>
  );
}
