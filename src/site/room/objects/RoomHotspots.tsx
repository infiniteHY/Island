import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useRoomStore, type RoomFocusId } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

type Hotspot = {
  id: RoomFocusId;
  position: [number, number, number];
  scale: [number, number, number];
  labelPosition: [number, number, number];
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "computer",
    position: [-1.92, 1.08, -1.98],
    scale: [0.94, 0.72, 0.54],
    labelPosition: [-1.92, 1.52, -1.86]
  },
  {
    id: "typewriter",
    position: [0.58, 0.94, -1.45],
    scale: [0.82, 0.56, 0.58],
    labelPosition: [0.58, 1.36, -1.3]
  },
  {
    id: "vinyl",
    position: [2.24, 0.82, -1.95],
    scale: [0.78, 0.34, 0.64],
    labelPosition: [2.24, 1.13, -1.72]
  },
  {
    id: "console",
    position: [0.56, 0.34, 0.38],
    scale: [0.74, 0.82, 0.42],
    labelPosition: [0.56, 0.96, 0.4]
  }
];

function InteractiveHotspot({ hotspot }: { hotspot: Hotspot }) {
  const focus = useRoomStore((state) => state.focus);
  const hovered = useRoomStore((state) => state.hovered);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === hotspot.id || hovered === hotspot.id;

  const stop = (event: ThreeEvent<MouseEvent | PointerEvent>) => event.stopPropagation();

  return (
    <group>
      <mesh
        position={hotspot.position}
        scale={hotspot.scale}
        onPointerEnter={(event) => {
          stop(event);
          setHovered(hotspot.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          stop(event);
          setHovered(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          stop(event);
          setFocus(hotspot.id);
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#c0fe04" transparent opacity={active ? 0.08 : 0} depthWrite={false} />
      </mesh>
      <RoomObjectLabel id={hotspot.id} position={hotspot.labelPosition} />
    </group>
  );
}

export function RoomHotspots() {
  const focus = useRoomStore((state) => state.focus);

  return (
    <>
      {HOTSPOTS.map((hotspot) => (
        <InteractiveHotspot key={hotspot.id} hotspot={hotspot} />
      ))}

      <Html transform position={[-1.92, 1.1, -1.815]} rotation={[0, 0, 0]} distanceFactor={1.12}>
        <div className="room-crt">
          <span>{focus === "computer" ? "SNAKE.EXE" : "PRESS TO PLAY"}</span>
          <i />
        </div>
      </Html>
      <Html transform position={[0.56, 0.4, 0.46]} rotation={[-0.62, 0.08, -0.12]} distanceFactor={0.74}>
        <div className="room-lcd">{focus === "console" ? "BREAKOUT" : "READY"}</div>
      </Html>
      {focus === "typewriter" ? (
        <Html transform position={[0.58, 1.19, -1.7]} rotation={[-0.16, 0, 0]} distanceFactor={1.0}>
          <div className="room-paper">HELLO, HANYA...</div>
        </Html>
      ) : null}
    </>
  );
}
