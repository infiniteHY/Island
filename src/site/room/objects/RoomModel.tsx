import { Cat } from "./Cat";
import { DeskComputer } from "./DeskComputer";
import { Furniture } from "./Furniture";
import { Fridge } from "./Fridge";
import { RecordPlayer } from "./RecordPlayer";
import { RetroConsole } from "./RetroConsole";
import { RoomShell } from "./RoomShell";
import { Typewriter } from "./Typewriter";

export function RoomModel({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoomShell />
      <Furniture />
      <Fridge />
      <DeskComputer />
      <Typewriter />
      <RecordPlayer reducedMotion={reducedMotion} />
      <RetroConsole />
      <Cat reducedMotion={reducedMotion} />
    </group>
  );
}
