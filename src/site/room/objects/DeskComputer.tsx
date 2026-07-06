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
      position={[-1.12, 0.91, -2.36]}
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
        <boxGeometry args={[0.68, 0.48, 0.52]} />
        <meshStandardMaterial color="#d7d0bd" roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.02, 0.285]}>
        <boxGeometry args={[0.48, 0.28, 0.035]} />
        <meshStandardMaterial color="#101412" emissive={active ? "#c0fe04" : "#284331"} emissiveIntensity={active ? 0.7 : 0.22} roughness={0.36} />
      </mesh>
      <mesh position={[0, -0.33, 0.02]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.28]} />
        <meshStandardMaterial color="#c9c1ac" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.47, 0.18]} castShadow>
        <boxGeometry args={[0.82, 0.08, 0.28]} />
        <meshStandardMaterial color="#b9b19f" roughness={0.76} />
      </mesh>
      <mesh position={[0.55, -0.49, 0.16]} castShadow>
        <boxGeometry args={[0.22, 0.05, 0.16]} />
        <meshStandardMaterial color="#2a2a28" roughness={0.7} />
      </mesh>
      <Html transform position={[0, 0.02, 0.308]} rotation={[0, 0, 0]} distanceFactor={1.15} occlude="blending">
        <div className="room-crt">
          <span>{active ? "SNAKE.EXE" : "PRESS TO PLAY"}</span>
          <i />
        </div>
      </Html>
      <RoomObjectLabel id="computer" position={[0, 0.62, 0.22]} />
    </group>
  );
}
