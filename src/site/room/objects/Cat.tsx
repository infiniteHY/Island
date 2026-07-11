import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";

/**
 * 黑猫：程序化建模，绿眼粉鼻。
 * 点击地板任意位置它会走过去——走路时身体起伏、脊背轻摆、
 * 头部随步伐点动、多节尾巴呈波浪摇晃，追求柔软的猫步质感。
 * 点击猫本身它会抬头看你。
 */

/** 可行走范围（避开书桌 / 边柜 / 书柜 / 盆栽落地灯，右侧收窄避开蝴蝶兰） */
const WALK = { minX: -2.35, maxX: 1.85, minZ: -0.55, maxZ: 2.6 };
const SPEED = 0.8;

const BLACK = "#26242a";
const BLACK_SOFT = "#312e36";

/**
 * 尾巴链参数：8 节短段，每个关节处放一颗与截面同径的圆球，
 * 相邻锥形圆柱共享关节球——无论各节怎么旋转都不会露出断口。
 * 静止姿态（restX/restZ）由 useFrame 每帧叠加，摆动只在其上加波浪。
 */
const TAIL_SEG_COUNT = 8;
const TAIL_SEG_LEN = 0.042;
const TAIL_REST_X0 = -1.2;
const TAIL_REST_X = 0.15;
const TAIL_REST_Z0 = 0.18;
const tailRadius = (i: number) => 0.021 - i * 0.0016;
const tailRestX = (i: number) => (i === 0 ? TAIL_REST_X0 : TAIL_REST_X);
const tailRestZ = (i: number) => (i === 0 ? TAIL_REST_Z0 : 0);

/**
 * 递归尾巴段：每段 = 关节球（盖住转轴处的接缝）+ 锥形短柱 + 下一段。
 * 组的原点即关节，沿 +y 长出 TAIL_SEG_LEN 后接下一段。
 */
function TailSegment({
  index,
  segs
}: {
  index: number;
  segs: MutableRefObject<(THREE.Group | null)[]>;
}) {
  const r0 = tailRadius(index);
  const r1 = tailRadius(index + 1);
  const last = index === TAIL_SEG_COUNT - 1;
  return (
    <group
      position={index === 0 ? [0, 0.2, -0.16] : [0, TAIL_SEG_LEN, 0]}
      rotation={[tailRestX(index), 0, tailRestZ(index)]}
      ref={(node) => {
        segs.current[index] = node;
      }}
    >
      {/* 关节球：与上一段末端同径，遮住旋转产生的缝隙 */}
      <mesh castShadow>
        <sphereGeometry args={[r0, 10, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.75} />
      </mesh>
      <mesh position={[0, TAIL_SEG_LEN / 2, 0]} castShadow>
        <cylinderGeometry args={[r1, r0, TAIL_SEG_LEN, 10]} />
        <meshStandardMaterial color={BLACK} roughness={0.75} />
      </mesh>
      {last ? (
        <mesh position={[0, TAIL_SEG_LEN, 0]}>
          <sphereGeometry args={[r1 * 1.15, 10, 8]} />
          <meshStandardMaterial color={BLACK_SOFT} roughness={0.7} />
        </mesh>
      ) : (
        <TailSegment index={index + 1} segs={segs} />
      )}
    </group>
  );
}

export function Cat({ reducedMotion }: { reducedMotion: boolean }) {
  const catRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailSegs = useRef<(THREE.Group | null)[]>([]);
  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const targetRef = useRef(new THREE.Vector3(0.4, 0, 1.35));
  const walkPhase = useRef(0);
  /** 0..1 的行走权重，用于把走路动画淡入淡出（避免起步/停步生硬） */
  const moveBlend = useRef(0);
  const focus = useRoomStore((state) => state.focus);
  const [greeting, setGreeting] = useState(false);
  const [hint, setHint] = useState(true);

  useFrame((state, delta) => {
    const cat = catRef.current;
    if (!cat) return;
    const t = state.clock.elapsedTime;
    const target = targetRef.current;
    const dx = target.x - cat.position.x;
    const dz = target.z - cat.position.z;
    const dist = Math.hypot(dx, dz);
    const moving = dist > 0.06 && !reducedMotion;

    moveBlend.current += ((moving ? 1 : 0) - moveBlend.current) * Math.min(1, delta * 5);
    const blend = moveBlend.current;

    if (moving) {
      const step = Math.min(dist, SPEED * delta);
      cat.position.x += (dx / dist) * step;
      cat.position.z += (dz / dist) * step;
      // 平滑转身朝向行进方向
      const want = Math.atan2(dx, dz);
      let diff = want - cat.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      cat.rotation.y += diff * Math.min(1, delta * 6);
      walkPhase.current += delta * 8;
    }
    const phase = walkPhase.current;

    // 身体：随步伐起伏 + 脊背左右轻摆 + 呼吸
    if (bodyRef.current) {
      const bob = Math.sin(phase * 2) * 0.012 * blend;
      const breathe = Math.sin(t * 2.2) * 0.004 * (1 - blend);
      bodyRef.current.position.y = bob + breathe;
      bodyRef.current.rotation.z = Math.sin(phase) * 0.06 * blend;
      bodyRef.current.rotation.y = Math.sin(phase) * 0.05 * blend;
    }
    // 四腿：对角步态（右前+左后同相，左前+右后反相），摆幅带淡入淡出
    legRefs.current.forEach((leg, i) => {
      if (!leg) return;
      const diagonal = i === 0 || i === 3 ? 0 : Math.PI;
      const want = Math.sin(phase + diagonal) * 0.5 * blend;
      leg.rotation.x += (want - leg.rotation.x) * Math.min(1, delta * 10);
    });
    // 尾巴：静止姿态（根部后伸、逐节上卷）之上叠加从根到梢的行波，
    // 每个关节由圆球衔接，任意摆幅下曲线都连续不断裂
    tailSegs.current.forEach((seg, i) => {
      if (!seg || reducedMotion) return;
      const lazy = Math.sin(t * 1.6 - i * 0.55) * (0.045 + i * 0.014);
      const walk = Math.sin(phase * 1.4 - i * 0.55) * (0.07 + i * 0.02);
      seg.rotation.z = tailRestZ(i) + lazy * (1 - blend) + walk * blend;
      seg.rotation.x = tailRestX(i) + Math.sin(t * 0.8 - i * 0.4) * 0.03 * (1 - blend);
    });
    // 头部：随步伐轻点，被点到时抬头
    if (headRef.current) {
      const nod = Math.sin(phase * 2 + 0.6) * 0.05 * blend;
      const wantTilt = (greeting ? -0.4 : 0) + nod;
      headRef.current.rotation.x += (wantTilt - headRef.current.rotation.x) * Math.min(1, delta * 6);
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.03 * (1 - blend);
    }
  });

  const onFloorClick = (event: ThreeEvent<MouseEvent>) => {
    if (focus) return;
    event.stopPropagation();
    targetRef.current.set(
      THREE.MathUtils.clamp(event.point.x, WALK.minX, WALK.maxX),
      0,
      THREE.MathUtils.clamp(event.point.z, WALK.minZ, WALK.maxZ)
    );
    setHint(false);
  };

  return (
    <group>
      {/* 地板拾取面（全透明，仅在未聚焦时接管点击） */}
      <mesh position={[0.35, 0.002, 0.9]} rotation={[-Math.PI / 2, 0, 0]} onClick={onFloorClick}>
        <planeGeometry args={[5.6, 4.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group
        ref={catRef}
        position={[0.4, 0, 1.35]}
        rotation={[0, 0.8, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          setGreeting(true);
          setHint(false);
          window.setTimeout(() => setGreeting(false), 1400);
        }}
      >
        <group ref={bodyRef}>
          {/* 身体：黑色主体（沿 z 拉长）+ 微亮的肩胛 */}
          <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.2, 6, 14]} />
            <meshStandardMaterial color={BLACK} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.21, 0.07]} scale={[1, 0.65, 1.15]} castShadow>
            <sphereGeometry args={[0.06, 12, 10]} />
            <meshStandardMaterial color={BLACK_SOFT} roughness={0.72} />
          </mesh>
          {/* 臀部微隆起 */}
          <mesh position={[0, 0.19, -0.1]} scale={[1, 0.8, 1.1]} castShadow>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color={BLACK} roughness={0.75} />
          </mesh>

          {/* 头部组 */}
          <group ref={headRef} position={[0, 0.27, 0.16]}>
            <mesh castShadow>
              <sphereGeometry args={[0.078, 14, 12]} />
              <meshStandardMaterial color={BLACK} roughness={0.72} />
            </mesh>
            {/* 耳朵 + 粉色内耳 */}
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.045, 0.075, -0.01]} rotation={[0, 0, side * -0.3]}>
                <mesh castShadow>
                  <coneGeometry args={[0.024, 0.05, 8]} />
                  <meshStandardMaterial color={BLACK} roughness={0.75} />
                </mesh>
                <mesh position={[0, -0.002, 0.01]}>
                  <coneGeometry args={[0.013, 0.032, 8]} />
                  <meshStandardMaterial color="#8a5a5e" roughness={0.7} />
                </mesh>
              </group>
            ))}
            {/* 口鼻：略浅的吻部 + 粉色三角鼻 + 人中与 ω 嘴线 */}
            <mesh position={[0, -0.024, 0.058]} scale={[1.15, 0.72, 0.7]}>
              <sphereGeometry args={[0.034, 12, 10]} />
              <meshStandardMaterial color={BLACK_SOFT} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.005, 0.089]} rotation={[0.25, 0, Math.PI]}>
              <coneGeometry args={[0.0085, 0.01, 3]} />
              <meshStandardMaterial color="#d98a84" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.017, 0.0885]} rotation={[0.12, 0, 0]}>
              <cylinderGeometry args={[0.0008, 0.0008, 0.013, 4]} />
              <meshBasicMaterial color="#111014" />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.0095, -0.0245, 0.0865]}
                rotation={[0.12, 0, side * (Math.PI / 2) + side * 0.35]}
              >
                <torusGeometry args={[0.0085, 0.0008, 6, 12, Math.PI * 0.85]} />
                <meshBasicMaterial color="#111014" />
              </mesh>
            ))}
            {/* 绿眼睛：杏仁眼型 + 竖瞳 + 高光点 */}
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.031, 0.016, 0.063]} rotation={[0, side * 0.32, side * 0.12]}>
                <mesh scale={[1, 1.2, 0.5]}>
                  <sphereGeometry args={[0.0115, 14, 12]} />
                  <meshBasicMaterial color="#7ec850" />
                </mesh>
                <mesh position={[0, 0, 0.0042]} scale={[0.32, 1.1, 0.45]}>
                  <sphereGeometry args={[0.009, 10, 8]} />
                  <meshBasicMaterial color="#101012" />
                </mesh>
                <mesh position={[side * 0.0032, 0.0042, 0.0062]}>
                  <sphereGeometry args={[0.0022, 6, 6]} />
                  <meshBasicMaterial color="#eefbe4" />
                </mesh>
              </group>
            ))}
            {/* 胡须：每侧三根，扇形微垂 */}
            {[-1, 1].map((side) =>
              [0, 1, 2].map((i) => (
                <mesh
                  key={`${side},${i}`}
                  position={[side * 0.06, -0.014 - i * 0.005, 0.058]}
                  rotation={[0, side * 0.5, side * -(Math.PI / 2 - 0.16 + i * 0.16)]}
                >
                  <cylinderGeometry args={[0.0008, 0.0008, 0.08, 3]} />
                  <meshBasicMaterial color="#cfc9c0" transparent opacity={0.85} />
                </mesh>
              ))
            )}
          </group>

          {/* 四条腿（对角摆动） */}
          {[
            { x: 0.05, z: 0.1 },
            { x: -0.05, z: 0.1 },
            { x: 0.05, z: -0.1 },
            { x: -0.05, z: -0.1 }
          ].map(({ x, z }, i) => (
            <group
              key={i}
              position={[x, 0.12, z]}
              ref={(node) => {
                legRefs.current[i] = node;
              }}
            >
              <mesh position={[0, -0.055, 0]} castShadow>
                <cylinderGeometry args={[0.017, 0.02, 0.11, 8]} />
                <meshStandardMaterial color={BLACK} roughness={0.75} />
              </mesh>
              <mesh position={[0, -0.108, 0.006]} scale={[1, 0.6, 1.2]}>
                <sphereGeometry args={[0.02, 8, 6]} />
                <meshStandardMaterial color={BLACK_SOFT} roughness={0.7} />
              </mesh>
            </group>
          ))}

          {/* 尾巴：八节短段链式，每个关节由圆球衔接，摆动时曲线连续不断裂 */}
          <TailSegment index={0} segs={tailSegs} />
        </group>

        {greeting ? (
          <Html position={[0, 0.52, 0]} center distanceFactor={6} className="bottle-label-wrap">
            <div className="bottle-label">
              <strong>喵～</strong>
            </div>
          </Html>
        ) : null}
        {hint && !focus ? (
          <Html position={[0, 0.46, 0]} center distanceFactor={7} className="bottle-label-wrap">
            <div className="bottle-label">
              <span>点地板 让我走过去</span>
            </div>
          </Html>
        ) : null}
      </group>
    </group>
  );
}
