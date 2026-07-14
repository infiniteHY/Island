import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

const SNACKS = [
  { x: -0.19, color: "#dc7354", accent: "#f4d36a" },
  { x: 0.03, color: "#6689aa", accent: "#f2ead8" },
  { x: 0.22, color: "#9a6e9e", accent: "#f0b866" }
];

function CokeCan({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.052, 0.052, 0.24, 24]} />
        <meshStandardMaterial color="#c91524" metalness={0.48} roughness={0.3} />
      </mesh>
      {[-0.118, 0.118].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.047, 0.004, 6, 24]} />
          <meshStandardMaterial color="#c7c9c6" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.121, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.004, 24]} />
        <meshStandardMaterial color="#bfc2bf" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.008, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.012, 0.0025, 5, 14]} />
        <meshStandardMaterial color="#727875" metalness={0.85} roughness={0.26} />
      </mesh>
      <Text
        position={[0, 0, 0.0525]}
        fontSize={0.023}
        lineHeight={0.84}
        color="#fff5e7"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {"COCA\nCOLA"}
      </Text>
      <mesh position={[0, -0.062, 0.053]} rotation={[0, 0, -0.18]}>
        <planeGeometry args={[0.075, 0.009]} />
        <meshBasicMaterial color="#fff5e7" />
      </mesh>
    </group>
  );
}

function BeerBottle({ position, color = "#684127" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.24, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.24} transmission={0.06} thickness={0.08} />
      </mesh>
      <mesh position={[0, 0.153, 0]}>
        <cylinderGeometry args={[0.029, 0.05, 0.066, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.24} transmission={0.06} thickness={0.08} />
      </mesh>
      <mesh position={[0, 0.225, 0]}>
        <cylinderGeometry args={[0.027, 0.029, 0.08, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.24} transmission={0.06} thickness={0.08} />
      </mesh>
      <mesh position={[0, 0.271, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.018, 18]} />
        <meshStandardMaterial color="#d1b45b" metalness={0.62} roughness={0.34} />
      </mesh>
      <mesh position={[0, -0.01, 0.051]}>
        <planeGeometry args={[0.078, 0.1]} />
        <meshStandardMaterial color="#e8d39a" roughness={0.76} />
      </mesh>
      <Text position={[0, -0.005, 0.052]} fontSize={0.018} color="#59452c" anchorX="center" anchorY="middle">
        BEER
      </Text>
      <mesh position={[0, 0.224, 0.029]}>
        <planeGeometry args={[0.046, 0.038]} />
        <meshStandardMaterial color="#d9c78f" roughness={0.75} />
      </mesh>
    </group>
  );
}

export function Fridge() {
  const doorRef = useRef<THREE.Group>(null);
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const open = focus === "fridge";

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    const target = open ? -1.48 : 0;
    doorRef.current.rotation.y = THREE.MathUtils.damp(doorRef.current.rotation.y, target, 5, delta);
  });

  return (
    <group
      position={[3.35, 0, -2.82]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("fridge");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("fridge");
      }}
    >
      {/* 圆角感冰箱箱体与脚垫 */}
      <mesh position={[0, 0.97, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.94, 0.72]} />
        <meshStandardMaterial color="#c9d7cb" roughness={0.55} metalness={0.08} />
      </mesh>
      {[-0.29, 0.29].map((x) => (
        <mesh key={x} position={[x, 0.025, 0.23]}>
          <cylinderGeometry args={[0.045, 0.05, 0.05, 12]} />
          <meshStandardMaterial color="#343b38" roughness={0.7} />
        </mesh>
      ))}

      {/* 冷藏内容只在开门时出现，关门状态不会穿出门板 */}
      {open ? (
        <>
      <mesh position={[0, 1.02, 0.371]}>
        <boxGeometry args={[0.68, 1.68, 0.035]} />
        <meshStandardMaterial color="#e7ece5" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.76, 0.398]}>
        <boxGeometry args={[0.62, 0.03, 0.08]} />
        <meshStandardMaterial color="#abbcb1" roughness={0.6} />
      </mesh>
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} position={[x, 1.02, 0.43]}>
          <boxGeometry args={[0.025, 1.68, 0.3]} />
          <meshStandardMaterial color="#dce6df" roughness={0.68} />
        </mesh>
      ))}
      {[0.67, 1.17].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.42]}>
            <boxGeometry args={[0.64, 0.025, 0.28]} />
            <meshPhysicalMaterial color="#d8e2dc" transparent opacity={0.76} roughness={0.18} transmission={0.1} />
          </mesh>
          <mesh position={[0, y + 0.012, 0.555]}>
            <boxGeometry args={[0.64, 0.028, 0.018]} />
            <meshStandardMaterial color="#aebdb5" metalness={0.22} roughness={0.38} />
          </mesh>
        </group>
      ))}

      {/* 上层：可口可乐罐与啤酒瓶 */}
      <CokeCan position={[-0.23, 1.31, 0.43]} rotation={-0.08} />
      <CokeCan position={[-0.1, 1.31, 0.4]} rotation={0.12} />
      <BeerBottle position={[0.08, 1.3, 0.42]} color="#5c3924" />
      <BeerBottle position={[0.23, 1.3, 0.39]} color="#305b42" />

      {/* 中层零食袋 */}
      {SNACKS.map(({ x, color, accent }, index) => (
        <group key={x} position={[x, 0.88 + (index % 2) * 0.025, 0.42]} rotation={[0, 0, (index - 1) * 0.06]}>
          <mesh>
            <boxGeometry args={[0.17, 0.27, 0.055]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.025, 0.029]}>
            <circleGeometry args={[0.045, 18]} />
            <meshBasicMaterial color={accent} />
          </mesh>
          {[-0.115, 0.115].map((y) => (
            <mesh key={y} position={[0, y, 0.031]}>
              <boxGeometry args={[0.15, 0.012, 0.008]} />
              <meshBasicMaterial color={accent} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 下层水果盒 */}
      <mesh position={[0, 0.39, 0.41]}>
        <boxGeometry args={[0.58, 0.22, 0.25]} />
        <meshStandardMaterial color="#b8cfc5" transparent opacity={0.72} roughness={0.3} />
      </mesh>
      {[-0.18, 0, 0.18].map((x, index) => (
        <mesh key={x} position={[x, 0.5 + (index % 2) * 0.03, 0.44]}>
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshStandardMaterial color={["#e06b52", "#e3b746", "#75a665"][index]} roughness={0.68} />
        </mesh>
      ))}
        </>
      ) : null}

      {/* 左侧铰链门，聚焦时向外打开 */}
      <group ref={doorRef} position={[-0.405, 0, 0.5]}>
        <mesh position={[0.405, 0.98, 0]} castShadow>
          <boxGeometry args={[0.79, 1.9, 0.085]} />
          <meshStandardMaterial color="#d8e1d7" roughness={0.5} metalness={0.06} />
        </mesh>
        <mesh position={[0.405, 1.56, 0.047]}>
          <boxGeometry args={[0.66, 0.012, 0.018]} />
          <meshStandardMaterial color="#aebcb2" roughness={0.55} />
        </mesh>
        <mesh position={[0.7, 1.02, 0.07]}>
          <boxGeometry args={[0.035, 0.72, 0.045]} />
          <meshStandardMaterial color="#78847d" metalness={0.45} roughness={0.38} />
        </mesh>
      </group>

      {open ? <pointLight position={[0, 1.3, 0.7]} intensity={0.85} color="#fff2c9" distance={2.2} /> : null}
      <RoomObjectLabel id="fridge" position={[0, 2.15, 0.15]} />
    </group>
  );
}
