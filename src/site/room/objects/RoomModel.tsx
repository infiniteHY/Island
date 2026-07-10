import { DeskComputer } from "./DeskComputer";
import { Furniture } from "./Furniture";
import { RecordPlayer } from "./RecordPlayer";
import { RetroConsole } from "./RetroConsole";
import { RoomShell } from "./RoomShell";
import { Typewriter } from "./Typewriter";

export function RoomModel({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoomShell />
      <Furniture />
      <DeskComputer />
      <Typewriter />
      <RecordPlayer reducedMotion={reducedMotion} />
      <RetroConsole />
    </group>
  );
}
