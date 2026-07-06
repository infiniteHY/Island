import type { ThreeEvent } from "@react-three/fiber";
import { useRoomStore } from "./roomStore";
import { RoomCamera } from "./RoomCamera";
import { RoomShell } from "./objects/RoomShell";
import { Furniture } from "./objects/Furniture";
import { DeskComputer } from "./objects/DeskComputer";
import { RetroConsole } from "./objects/RetroConsole";
import { RecordPlayer } from "./objects/RecordPlayer";
import { Typewriter } from "./objects/Typewriter";
import { useSiteStore } from "../siteStore";

type RoomSceneProps = {
  reducedMotion: boolean;
};

export function RoomScene({ reducedMotion }: RoomSceneProps) {
  const theme = useSiteStore((state) => state.theme);
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const dark = theme === "dark";

  const clearFocus = (event: ThreeEvent<PointerEvent>) => {
    if (!focus) return;
    event.stopPropagation();
    setFocus(null);
  };

  return (
    <>
      <color attach="background" args={[dark ? "#080d18" : "#f4efe6"]} />
      <ambientLight intensity={dark ? 0.46 : 0.62} />
      <directionalLight
        position={[-2.6, 4.8, 3.4]}
        intensity={dark ? 1.05 : 1.35}
        color={dark ? "#d7e4ff" : "#fff3dc"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[1.4, 0.42, -2.05]} intensity={dark ? 1.4 : 0.9} color="#ffc07a" distance={4.2} />
      <pointLight position={[2.0, 2.18, -2.7]} intensity={dark ? 0.8 : 0.55} color="#ffd39b" distance={2.4} />
      <RoomCamera reducedMotion={reducedMotion} />
      <group onClick={clearFocus}>
        <RoomShell />
        <Furniture />
      </group>
      <DeskComputer />
      <Typewriter />
      <RecordPlayer reducedMotion={reducedMotion} />
      <RetroConsole />
    </>
  );
}
