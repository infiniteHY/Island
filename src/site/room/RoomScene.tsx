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
    // Html 浮层（如打字机的寄出按钮）上的点击会冒泡到画布容器再被 R3F 射线命中，
    // 只有真正点在 canvas 上才算"点空白处退出"
    if (!(event.nativeEvent.target instanceof HTMLCanvasElement)) return;
    event.stopPropagation();
    setFocus(null);
  };

  return (
    <>
      <color attach="background" args={[dark ? "#0c111c" : "#eef3f6"]} />
      <fog attach="fog" args={[dark ? "#0c111c" : "#eef3f6", 8.5, 15]} />
      <ambientLight intensity={dark ? 0.52 : 0.65} />
      {/* 天光补底：让暗部不至于死黑（淡蓝天光 + 木色地光，配合淡蓝墙面） */}
      <hemisphereLight args={["#8ba3bd", "#5a4632", dark ? 0.5 : 0.4]} />
      {/* 主光：暖色斜射（模拟室内主灯）。4096 阴影贴图 + 收紧到家具范围的
          相机提高纹素密度，加大 normalBias，消除书柜/窗框薄板边沿的
          自阴影闪烁（视差移动时的 shadow acne 抖动） */}
      <directionalLight
        position={[-2.2, 4.6, 3.8]}
        intensity={dark ? 1.0 : 1.35}
        color={dark ? "#d7e4ff" : "#fff3dc"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        shadow-normalBias={0.1}
        shadow-camera-left={-3.9}
        shadow-camera-right={3.9}
        shadow-camera-top={3.9}
        shadow-camera-bottom={-3.9}
        shadow-camera-near={1.5}
        shadow-camera-far={12.5}
      />
      {/* 窗口月光：冷色从窗外斜洒进屋 */}
      <directionalLight position={[0.6, 3.2, -4.4]} intensity={dark ? 0.55 : 0.3} color="#a9bfe8" />
      {/* 书桌区暖色补光 */}
      <pointLight position={[-1.4, 1.6, -1.6]} intensity={dark ? 0.9 : 0.6} color="#ffc07a" distance={4.2} />
      {/* 边柜区暖色补光 */}
      <pointLight position={[1.8, 1.5, -1.5]} intensity={dark ? 0.7 : 0.45} color="#ffd39b" distance={3.6} />
      <RoomCamera reducedMotion={reducedMotion} />
      <group onClick={clearFocus}>
        <RoomModel reducedMotion={reducedMotion} />
      </group>
    </>
  );
}
