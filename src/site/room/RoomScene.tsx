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
      <color attach="background" args={[dark ? "#131514" : "#f6f1e7"]} />
      <ambientLight intensity={dark ? 0.34 : 0.58} />
      <directionalLight
        position={[-3.2, 4.2, -1.6]}
        intensity={dark ? 1.15 : 1.5}
        color={dark ? "#ffb36d" : "#fff0cf"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-0.15, 1.55, -2.25]} intensity={dark ? 1.25 : 0.72} color="#ffc76a" distance={3.2} />
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
