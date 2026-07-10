import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

export function RecordPlayer({ reducedMotion }: { reducedMotion: boolean }) {
  const discRef = useRef<THREE.Group>(null);
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "vinyl";

  useFrame((_, delta) => {
    if (!discRef.current || reducedMotion || !active) return;
    discRef.current.rotation.y += delta * 2.2;
  });

  return (
    <group
      position={[2.22, 0.78, -1.84]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("vinyl");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("vinyl");
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.12, 0.72]} />
        <meshStandardMaterial color="#8a5f3d" roughness={0.7} />
      </mesh>
      <group ref={discRef} position={[-0.16, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.025, 48]} />
          <meshStandardMaterial color="#111" roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 36]} />
          <meshStandardMaterial color={active ? "#c0fe04" : "#e2d25e"} roughness={0.46} />
        </mesh>
      </group>
      <group position={[0.28, 0.14, -0.18]} rotation={[0, active ? -0.52 : -0.18, 0]}>
        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.44, 10]} />
          <meshStandardMaterial color="#d7d1bd" metalness={0.5} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.01, 0.38]}>
          <boxGeometry args={[0.08, 0.035, 0.08]} />
          <meshStandardMaterial color="#272522" roughness={0.62} />
        </mesh>
      </group>
      {[0.28, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.24]}>
          <cylinderGeometry args={[0.045, 0.045, 0.04, 18]} />
          <meshStandardMaterial color="#2b2823" roughness={0.58} />
        </mesh>
      ))}
      <RoomObjectLabel id="vinyl" position={[0, 0.48, 0]} />
    </group>
  );
}
