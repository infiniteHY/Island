import { Html } from "@react-three/drei";
import { ROOM_OBJECT_META, useRoomStore, type RoomFocusId } from "./roomStore";

export function RoomObjectLabel({ id, position }: { id: RoomFocusId; position: [number, number, number] }) {
  const hovered = useRoomStore((state) => state.hovered);
  const focus = useRoomStore((state) => state.focus);
  if (focus || hovered !== id) return null;
  const meta = ROOM_OBJECT_META[id];
  return (
    <Html position={position} center distanceFactor={7} className="bottle-label-wrap">
      <div className="bottle-label">
        <strong>{meta.label}</strong>
        <span>{meta.subtitle}</span>
      </div>
    </Html>
  );
}
