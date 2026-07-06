import { Html } from "@react-three/drei";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

export function Typewriter() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "typewriter";

  return (
    <group
      position={[0.48, 0.94, -2.28]}
      rotation={[0, -0.12, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("typewriter");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("typewriter");
      }}
    >
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.72, 0.22, 0.46]} />
        <meshStandardMaterial color="#2d302c" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.2, -0.14]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.74, 18]} />
        <meshStandardMaterial color="#151515" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.36, -0.2]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[0.56, 0.46]} />
        <meshStandardMaterial color="#f8f0df" roughness={0.82} side={2} />
      </mesh>
      {[-0.24, -0.12, 0, 0.12, 0.24].map((x, row) =>
        [-0.11, 0.01, 0.13].map((z, col) => (
          <mesh key={`${x}-${z}`} position={[x + col * 0.02, 0.16 + row * 0.015, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.025, 14]} />
            <meshStandardMaterial color="#f0e7d2" roughness={0.68} />
          </mesh>
        ))
      )}
      <mesh position={[0.4, 0.3, -0.14]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.04, 0.32, 0.035]} />
        <meshStandardMaterial color="#c2b89e" roughness={0.42} />
      </mesh>
      {active ? (
        <Html transform position={[0, 0.365, -0.212]} rotation={[-0.18, 0, 0]} distanceFactor={1.08} occlude="blending">
          <div className="room-paper">HELLO, HANYA...</div>
        </Html>
      ) : null}
      <RoomObjectLabel id="typewriter" position={[0, 0.62, 0]} />
    </group>
  );
}
