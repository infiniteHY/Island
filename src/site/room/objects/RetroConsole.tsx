import { Html } from "@react-three/drei";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

export function RetroConsole() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "console";

  return (
    <group
      position={[1.35, 0.38, 1.45]}
      rotation={[-0.62, 0.08, -0.08]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("console");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("console");
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.9, 0.08]} />
        <meshStandardMaterial color="#d7d0b6" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.18, 0.052]}>
        <boxGeometry args={[0.42, 0.34, 0.025]} />
        <meshStandardMaterial color="#9bbc0f" emissive={active ? "#9bbc0f" : "#223818"} emissiveIntensity={active ? 0.48 : 0.14} roughness={0.5} />
      </mesh>
      <mesh position={[-0.18, -0.18, 0.06]}>
        <boxGeometry args={[0.18, 0.04, 0.025]} />
        <meshStandardMaterial color="#2f3330" roughness={0.64} />
      </mesh>
      <mesh position={[-0.18, -0.18, 0.07]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.18, 0.04, 0.025]} />
        <meshStandardMaterial color="#2f3330" roughness={0.64} />
      </mesh>
      {[0.15, 0.3].map((x) => (
        <mesh key={x} position={[x, -0.2, 0.066]}>
          <cylinderGeometry args={[0.055, 0.055, 0.025, 18]} />
          <meshStandardMaterial color="#b74848" roughness={0.62} />
        </mesh>
      ))}
      <Html transform position={[0, 0.18, 0.072]} distanceFactor={0.86} occlude="blending">
        <div className="room-lcd">{active ? "BREAKOUT" : "READY"}</div>
      </Html>
      <RoomObjectLabel id="console" position={[0, 0.58, 0.1]} />
    </group>
  );
}
