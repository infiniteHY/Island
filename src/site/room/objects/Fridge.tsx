import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

/** 330ml sleek can：按约 58mm × 146mm 的真实比例缩放。 */
function CocaColaCan({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const red = "#e31d2b";
  const silver = "#c9cdca";

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 铝罐主体与上下收口 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.0465, 0.0465, 0.205, 32]} />
        <meshStandardMaterial color={red} metalness={0.52} roughness={0.27} />
      </mesh>
      <mesh position={[0, 0.1085, 0]}>
        <cylinderGeometry args={[0.0415, 0.0465, 0.012, 32]} />
        <meshStandardMaterial color={red} metalness={0.52} roughness={0.27} />
      </mesh>
      <mesh position={[0, -0.1085, 0]}>
        <cylinderGeometry args={[0.0465, 0.0415, 0.012, 32]} />
        <meshStandardMaterial color={red} metalness={0.52} roughness={0.27} />
      </mesh>

      {/* 银色卷边、顶盖和拉环 */}
      {[-0.116, 0.116].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.0415, 0.0038, 8, 28]} />
          <meshStandardMaterial color={silver} metalness={0.92} roughness={0.18} />
        </mesh>
      ))}
      <mesh position={[0, 0.117, 0]}>
        <cylinderGeometry args={[0.0395, 0.0395, 0.003, 32]} />
        <meshStandardMaterial color="#afb5b2" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[0.006, 0.1195, -0.002]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0115, 0.0022, 6, 18]} />
        <meshStandardMaterial color="#717875" metalness={0.88} roughness={0.25} />
      </mesh>
      <mesh position={[-0.012, 0.1196, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.007, 14]} />
        <meshStandardMaterial color="#626865" metalness={0.82} roughness={0.3} />
      </mesh>

      {/* 正面品牌与经典白色波带 */}
      <Text
        position={[0, 0.02, 0.047]}
        fontSize={0.019}
        fontStyle="italic"
        letterSpacing={-0.06}
        color="#fff8ed"
        anchorX="center"
        anchorY="middle"
      >
        Coca-Cola
      </Text>
      <mesh position={[0, -0.012, 0.0475]} rotation={[0, 0, -0.16]}>
        <planeGeometry args={[0.082, 0.008]} />
        <meshBasicMaterial color="#fff8ed" />
      </mesh>
      <Text position={[0, -0.055, 0.047]} fontSize={0.0065} letterSpacing={0.08} color="#fff8ed" anchorX="center">
        ORIGINAL TASTE
      </Text>
      <Text position={[0, -0.086, 0.047]} fontSize={0.006} color="#fff8ed" anchorX="center">
        330 ml
      </Text>
      {/* 侧面窄高光，强化铝罐弧面 */}
      <mesh position={[-0.034, 0.006, 0.033]} rotation={[0, -0.72, 0]}>
        <planeGeometry args={[0.009, 0.19]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
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
    doorRef.current.rotation.y = THREE.MathUtils.damp(doorRef.current.rotation.y, open ? -1.48 : 0, 5, delta);
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
      {/* 五面箱体壳层：不再用实心盒，形成从前框到后壁的真实纵深。 */}
      <mesh position={[0, 0.97, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.94, 0.08]} />
        <meshStandardMaterial color="#c9d7cb" roughness={0.55} metalness={0.08} />
      </mesh>
      {[-0.385, 0.385].map((x) => (
        <mesh key={x} position={[x, 0.97, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, 1.94, 0.68]} />
          <meshStandardMaterial color="#c9d7cb" roughness={0.55} metalness={0.08} />
        </mesh>
      ))}
      {[0.07, 1.9].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.76, 0.1, 0.68]} />
          <meshStandardMaterial color="#c9d7cb" roughness={0.55} metalness={0.08} />
        </mesh>
      ))}
      {[-0.29, 0.29].map((x) => (
        <mesh key={x} position={[x, 0.025, 0.23]}>
          <cylinderGeometry args={[0.045, 0.05, 0.05, 12]} />
          <meshStandardMaterial color="#343b38" roughness={0.7} />
        </mesh>
      ))}

      {/* 内胆后壁、侧壁、顶底和前框共同围出约 0.6m 的视觉深度。 */}
      {open ? (
        <>
          <mesh position={[0, 0.99, -0.272]}>
            <boxGeometry args={[0.68, 1.7, 0.025]} />
            <meshStandardMaterial color="#e8eee9" roughness={0.68} />
          </mesh>
          {[-0.335, 0.335].map((x) => (
            <mesh key={x} position={[x, 0.99, 0.015]}>
              <boxGeometry args={[0.025, 1.7, 0.58]} />
              <meshStandardMaterial color="#dce6df" roughness={0.64} />
            </mesh>
          ))}
          {[0.15, 1.83].map((y) => (
            <mesh key={y} position={[0, y, 0.015]}>
              <boxGeometry args={[0.68, 0.035, 0.58]} />
              <meshStandardMaterial color="#dfe8e2" roughness={0.62} />
            </mesh>
          ))}

          {/* 三层玻璃层板；只有中层放可乐，其余层保持空置。 */}
          {[0.68, 1.18].map((y) => (
            <group key={y}>
              <mesh position={[0, y, 0.015]}>
                <boxGeometry args={[0.64, 0.018, 0.54]} />
                <meshPhysicalMaterial color="#d9e6e0" transparent opacity={0.58} transmission={0.22} roughness={0.12} />
              </mesh>
              <mesh position={[0, y + 0.012, 0.278]}>
                <boxGeometry args={[0.64, 0.025, 0.018]} />
                <meshStandardMaterial color="#aebdb5" metalness={0.25} roughness={0.35} />
              </mesh>
            </group>
          ))}

          {/* 中层真实比例 Coca-Cola 罐 */}
          <CocaColaCan position={[-0.18, 0.805, 0.02]} rotation={-0.12} />
          <CocaColaCan position={[0, 0.805, 0.075]} rotation={0.08} />
          <CocaColaCan position={[0.18, 0.805, 0.015]} rotation={0.18} />

          {/* 内胆顶灯与柔和冷藏光 */}
          <mesh position={[0, 1.78, 0.1]}>
            <boxGeometry args={[0.24, 0.025, 0.09]} />
            <meshStandardMaterial color="#fff5d6" emissive="#fff0bd" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[0, 1.55, 0.22]} intensity={0.95} color="#fff2cf" distance={2.1} />
        </>
      ) : null}

      {/* 四边内压框强调门洞厚度。 */}
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.99, 0.35]}>
          <boxGeometry args={[0.045, 1.76, 0.055]} />
          <meshStandardMaterial color="#b7c7bd" roughness={0.48} />
        </mesh>
      ))}
      {[0.11, 1.87].map((y) => (
        <mesh key={y} position={[0, y, 0.35]}>
          <boxGeometry args={[0.74, 0.045, 0.055]} />
          <meshStandardMaterial color="#b7c7bd" roughness={0.48} />
        </mesh>
      ))}

      {/* 左侧铰链门 */}
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
        {/* 门封条 */}
        <mesh position={[0.405, 0.98, -0.045]}>
          <boxGeometry args={[0.7, 1.78, 0.018]} />
          <meshStandardMaterial color="#9aa9a0" roughness={0.7} />
        </mesh>
      </group>

      <RoomObjectLabel id="fridge" position={[0, 2.15, 0.15]} />
    </group>
  );
}
