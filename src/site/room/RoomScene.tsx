import type { ThreeEvent } from "@react-three/fiber";
import { useRoomStore } from "./roomStore";
import { RoomCamera } from "./RoomCamera";
import { RoomModel } from "./objects/RoomModel";
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
      <fog attach="fog" args={[dark ? "#080d18" : "#f4efe6", 7.5, 13]} />
      <ambientLight intensity={dark ? 0.5 : 0.68} />
      <directionalLight
        position={[-2.6, 4.8, 3.4]}
        intensity={dark ? 1.15 : 1.45}
        color={dark ? "#d7e4ff" : "#fff3dc"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0.1, 0.28, -2.95]} intensity={dark ? 1.8 : 1.25} color="#ffc07a" distance={5.2} />
      <pointLight position={[-1.16, 2.42, -2.82]} intensity={dark ? 1.35 : 1.0} color="#ffb46b" distance={2.6} />
      <pointLight position={[2.08, 2.08, -2.76]} intensity={dark ? 0.9 : 0.62} color="#ffd39b" distance={2.2} />
      <RoomCamera reducedMotion={reducedMotion} />
      <group onClick={clearFocus}>
        <RoomModel reducedMotion={reducedMotion} />
      </group>
    </>
  );
}
