import { Html } from "@react-three/drei";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

export function DeskComputer() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "computer";

  return (
    <group
      position={[-1.9, 1.49, -2.22]}
      rotation={[0, 0.03, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("computer");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("computer");
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.82, 0.48, 0.08]} />
        <meshStandardMaterial color="#16191e" roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.18, 0.055]}>
        <boxGeometry args={[0.78, 0.08, 0.035]} />
        <meshStandardMaterial color="#d5d0c5" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.03, 0.056]}>
        <boxGeometry args={[0.68, 0.34, 0.025]} />
        <meshStandardMaterial color="#101412" emissive={active ? "#c0fe04" : "#0b1625"} emissiveIntensity={active ? 0.7 : 0.12} roughness={0.36} />
      </mesh>
      <mesh position={[0, -0.42, 0.01]} castShadow>
        <boxGeometry args={[0.24, 0.28, 0.08]} />
        <meshStandardMaterial color="#c9c1ac" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.58, 0.18]} castShadow>
        <boxGeometry args={[0.74, 0.06, 0.22]} />
        <meshStandardMaterial color="#b9b19f" roughness={0.76} />
      </mesh>
      <mesh position={[0.5, -0.58, 0.16]} castShadow>
        <boxGeometry args={[0.18, 0.035, 0.12]} />
        <meshStandardMaterial color="#2a2a28" roughness={0.7} />
      </mesh>
      <Html transform position={[0, 0.03, 0.072]} rotation={[0, 0, 0]} distanceFactor={1.32} occlude="blending">
        <div className="room-crt">
          <span>{active ? "SNAKE.EXE" : "PRESS TO PLAY"}</span>
          <i />
        </div>
      </Html>
      <RoomObjectLabel id="computer" position={[0, 0.58, 0.1]} />
    </group>
  );
}
