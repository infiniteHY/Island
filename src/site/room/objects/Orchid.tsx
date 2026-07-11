import { useMemo } from "react";
import * as THREE from "three";

/**
 * 蝴蝶兰盆栽：白瓷釉盆 + 水苔 + 宽厚肉质叶基生莲座 +
 * 两支沿曲线拱起的花剑（TubeGeometry）+ 绿色支撑杆与卡扣 +
 * 白瓣紫芯的蝴蝶兰花朵（3 萼片 / 2 大瓣 / 唇瓣 / 蕊柱）与待放花苞。
 */

const PETAL_WHITE = "#f7f3ec";
const SEPAL_WHITE = "#efe9df";
const LIP_MAGENTA = "#a83a7f";
const COLUMN_YELLOW = "#e3bd5a";
const LEAF_GREEN = "#3f6b3c";
const LEAF_GREEN_LIGHT = "#4d7d47";
const STEM_GREEN = "#5a7a42";

/** 单朵蝴蝶兰（朝 +z），直径约 0.08——花瓣压成薄片贴合真实平展形态 */
function Blossom({
  position,
  rotation,
  scale = 1
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 3 片萼片：上 / 左下 / 右下，窄长薄片、略向后仰 */}
      {[Math.PI / 2, Math.PI / 2 + (Math.PI * 2) / 3, Math.PI / 2 - (Math.PI * 2) / 3].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.028, Math.sin(angle) * 0.028, -0.006]}
          rotation={[-0.15, 0, angle - Math.PI / 2]}
          scale={[0.62, 1.25, 0.14]}
          castShadow
        >
          <sphereGeometry args={[0.021, 10, 8]} />
          <meshStandardMaterial color={SEPAL_WHITE} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* 2 片大花瓣：左右如蝶翼，宽圆薄片、微前倾 */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.031, 0.008, 0]}
          rotation={[0.1, side * -0.18, side * 0.3]}
          scale={[1.35, 1.05, 0.14]}
          castShadow
        >
          <sphereGeometry args={[0.026, 12, 10]} />
          <meshStandardMaterial color={PETAL_WHITE} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* 唇瓣：紫红三裂——中裂片前伸下弯 + 两侧小裂片上翘 */}
      <mesh position={[0, -0.016, 0.01]} rotation={[0.85, 0, 0]} scale={[0.6, 1.1, 0.3]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color={LIP_MAGENTA} roughness={0.45} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.01, -0.011, 0.008]}
          rotation={[0.2, 0, side * 1.0]}
          scale={[0.5, 1, 0.25]}
        >
          <sphereGeometry args={[0.008, 6, 5]} />
          <meshStandardMaterial color={LIP_MAGENTA} roughness={0.45} />
        </mesh>
      ))}
      {/* 蕊柱：中心黄芯 + 唇瓣喉部红斑 */}
      <mesh position={[0, -0.003, 0.012]}>
        <sphereGeometry args={[0.0055, 6, 5]} />
        <meshStandardMaterial color={COLUMN_YELLOW} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.009, 0.011]} scale={[1, 0.6, 0.5]}>
        <sphereGeometry args={[0.004, 6, 5]} />
        <meshStandardMaterial color="#7c2a55" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** 单支花剑：曲线茎 + 沿茎上段分布的花与顶端花苞 */
function FlowerSpike({
  points,
  blossoms,
  buds,
  stake
}: {
  points: [number, number, number][];
  blossoms: { t: number; out: [number, number, number]; face: [number, number, number]; scale?: number }[];
  buds: { t: number; out: [number, number, number] }[];
  stake: { x: number; z: number; height: number; lean: [number, number] };
}) {
  const { tube, curve } = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return { tube: new THREE.TubeGeometry(c, 24, 0.0045, 6, false), curve: c };
  }, [points]);

  return (
    <group>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color={STEM_GREEN} roughness={0.7} />
      </mesh>
      {/* 绿色支撑杆 + 顶端卡扣 */}
      <mesh
        position={[stake.x, stake.height / 2, stake.z]}
        rotation={[stake.lean[0], 0, stake.lean[1]]}
        castShadow
      >
        <cylinderGeometry args={[0.004, 0.004, stake.height, 6]} />
        <meshStandardMaterial color="#4c6b3a" roughness={0.6} />
      </mesh>
      <mesh position={[stake.x + stake.lean[1] * -stake.height * 0.5, stake.height * 0.96, stake.z]}>
        <torusGeometry args={[0.011, 0.004, 6, 10]} />
        <meshStandardMaterial color="#7d9459" roughness={0.6} />
      </mesh>
      {blossoms.map(({ t, out, face, scale }, i) => {
        const p = curve.getPoint(t);
        return (
          <Blossom
            key={i}
            position={[p.x + out[0], p.y + out[1], p.z + out[2]]}
            rotation={face}
            scale={scale ?? 1}
          />
        );
      })}
      {buds.map(({ t, out }, i) => {
        const p = curve.getPoint(t);
        return (
          <mesh key={i} position={[p.x + out[0], p.y + out[1], p.z + out[2]]} castShadow>
            <sphereGeometry args={[0.011 - i * 0.002, 8, 6]} />
            <meshStandardMaterial color="#cfd8b4" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Orchid({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 白瓷釉盆：束腰曲线 + 圆唇口 + 底足 */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.095, 0.26, 22]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.128, 0.012, 10, 24]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.22} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.028, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.105, 0.05, 22]} />
        <meshStandardMaterial color="#e6e1d7" roughness={0.3} />
      </mesh>
      {/* 盆口水苔 */}
      <mesh position={[0, 0.285, 0]}>
        <cylinderGeometry args={[0.118, 0.118, 0.02, 20]} />
        <meshStandardMaterial color="#6b5a3e" roughness={0.95} />
      </mesh>

      {/* 基生宽叶：6 片肉质带状叶低伏散开（压成薄片，尖端下垂，
          贴合真实蝴蝶兰的对生莲座形态） */}
      {[
        { rot: 0.3, tilt: 1.22, len: 0.3, w: 1.0 },
        { rot: 1.35, tilt: 1.1, len: 0.34, w: 1.1 },
        { rot: 2.5, tilt: 1.28, len: 0.28, w: 0.95 },
        { rot: 3.6, tilt: 1.05, len: 0.33, w: 1.05 },
        { rot: 4.7, tilt: 1.25, len: 0.3, w: 1.0 },
        { rot: 5.7, tilt: 1.14, len: 0.26, w: 0.9 }
      ].map(({ rot, tilt, len, w }, i) => (
        <group key={i} rotation={[0, rot, 0]} position={[0, 0.3, 0]}>
          {/* 叶身：压扁的长椭球，沿伸出方向下弯 */}
          <mesh
            position={[len * 0.5, Math.cos(tilt) * len * 0.4, 0]}
            rotation={[0, 0, -(tilt - Math.PI / 2)]}
            scale={[len * 10, 0.32, w * 1.9]}
            castShadow
          >
            <sphereGeometry args={[0.05, 14, 10]} />
            <meshStandardMaterial color={i % 2 ? LEAF_GREEN : LEAF_GREEN_LIGHT} roughness={0.5} />
          </mesh>
          {/* 叶尖：下垂的小薄片，模拟叶端自然垂头 */}
          <mesh
            position={[len * 0.98, Math.cos(tilt) * len * 0.68 - 0.015, 0]}
            rotation={[0, 0, -(tilt - Math.PI / 2) - 0.55]}
            scale={[1.6, 0.28, w * 1.3]}
            castShadow
          >
            <sphereGeometry args={[0.032, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? LEAF_GREEN : LEAF_GREEN_LIGHT} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* 花剑一：向右前方拱起，5 朵盛放 + 2 苞 */}
      <FlowerSpike
        points={[
          [0.01, 0.3, 0.01],
          [0.03, 0.5, 0.03],
          [0.09, 0.68, 0.06],
          [0.19, 0.78, 0.1],
          [0.3, 0.8, 0.14]
        ]}
        blossoms={[
          { t: 0.52, out: [0.02, 0.015, 0.03], face: [0.25, 0.5, 0], scale: 0.92 },
          { t: 0.64, out: [0.03, 0.02, 0.02], face: [0.2, 0.7, 0], scale: 1.0 },
          { t: 0.76, out: [0.025, 0.025, 0.03], face: [0.35, 0.5, 0], scale: 1.05 },
          { t: 0.87, out: [0.02, 0.02, 0.035], face: [0.45, 0.35, 0], scale: 1.0 },
          { t: 0.96, out: [0.015, 0.015, 0.03], face: [0.55, 0.25, 0], scale: 0.9 }
        ]}
        buds={[
          { t: 0.99, out: [0.012, 0.01, 0.012] },
          { t: 1, out: [0.024, 0.004, 0.02] }
        ]}
        stake={{ x: 0.05, z: 0.03, height: 0.62, lean: [0.06, -0.12] }}
      />
      {/* 花剑二：向左后方低一点拱起，3 朵 + 2 苞 */}
      <FlowerSpike
        points={[
          [-0.02, 0.3, -0.01],
          [-0.05, 0.46, -0.04],
          [-0.12, 0.58, -0.08],
          [-0.21, 0.63, -0.11]
        ]}
        blossoms={[
          { t: 0.55, out: [-0.025, 0.02, -0.02], face: [0.25, -2.3, 0], scale: 0.85 },
          { t: 0.72, out: [-0.03, 0.02, -0.025], face: [0.3, -2.5, 0], scale: 0.95 },
          { t: 0.88, out: [-0.025, 0.02, -0.03], face: [0.4, -2.7, 0], scale: 0.9 }
        ]}
        buds={[
          { t: 0.97, out: [-0.012, 0.008, -0.01] },
          { t: 1, out: [-0.022, 0.002, -0.018] }
        ]}
        stake={{ x: -0.04, z: -0.03, height: 0.5, lean: [-0.05, 0.14] }}
      />
    </group>
  );
}
