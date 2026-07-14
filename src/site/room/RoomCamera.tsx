import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useRoomStore, type RoomFocusId } from "./roomStore";

type CameraPose = { position: [number, number, number]; target: [number, number, number] };

const OVERVIEW: CameraPose = { position: [3.34, 2.58, 3.42], target: [-0.22, 1.0, -1.38] };

export const FOCUS_POSES: Record<RoomFocusId, CameraPose> = {
  computer: { position: [-1.93, 1.45, -0.85], target: [-1.95, 1.3, -2.1] },
  typewriter: { position: [0.72, 1.32, -0.55], target: [0.78, 1.02, -1.95] },
  vinyl: { position: [2.35, 1.35, -0.75], target: [2.18, 0.86, -1.98] },
  console: { position: [-0.63, 1.22, -1.28], target: [-0.85, 0.95, -2.0] },
  bookshelf: { position: [-0.52, 1.0, -0.55], target: [-2.98, 1.0, -0.55] },
  fridge: { position: [3.25, 1.38, -0.62], target: [3.35, 1.0, -2.45] },
  map: { position: [2.78, 2.75, -2.0], target: [2.78, 2.75, -3.19] },
  blackboard: { position: [-1.62, 2.08, 1.0], target: [-3.17, 2.08, 1.0] },
  porthole: { position: [0.2, 2.4, -1.25], target: [0.2, 2.4, -3.27] }
};

type RoomCameraProps = {
  reducedMotion: boolean;
};

export function RoomCamera({ reducedMotion }: RoomCameraProps) {
  const camera = useThree((state) => state.camera);
  const focus = useRoomStore((state) => state.focus);
  const targetRef = useRef(new THREE.Vector3(...OVERVIEW.target));
  const parallaxRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const flyingRef = useRef(false);

  // 指针视差（仅 overview 态）
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // focus 切换 → 相机飞行
  useEffect(() => {
    const pose = focus ? FOCUS_POSES[focus] : OVERVIEW;

    if (reducedMotion) {
      camera.position.set(...pose.position);
      targetRef.current.set(...pose.target);
      camera.lookAt(targetRef.current);
      return undefined;
    }

    flyingRef.current = true;
    const ctx = gsap.context(() => {
      gsap.to(camera.position, {
        x: pose.position[0],
        y: pose.position[1],
        z: pose.position[2],
        duration: 0.95,
        ease: "power3.inOut"
      });
      gsap.to(targetRef.current, {
        x: pose.target[0],
        y: pose.target[1],
        z: pose.target[2],
        duration: 0.95,
        ease: "power3.inOut",
        onComplete: () => {
          flyingRef.current = false;
        }
      });
    });
    return () => {
      ctx.revert();
      flyingRef.current = false;
    };
  }, [camera, focus, reducedMotion]);

  useFrame(() => {
    // overview 态视差：目标 ±2°，缓动跟随
    const wantX = focus || reducedMotion ? 0 : pointerRef.current.x * 0.22;
    const wantY = focus || reducedMotion ? 0 : pointerRef.current.y * 0.12;
    parallaxRef.current.x += (wantX - parallaxRef.current.x) * 0.04;
    parallaxRef.current.y += (wantY - parallaxRef.current.y) * 0.04;

    if (!focus && !flyingRef.current) {
      camera.position.x = OVERVIEW.position[0] + parallaxRef.current.x;
      camera.position.y = OVERVIEW.position[1] - parallaxRef.current.y;
    }
    camera.lookAt(targetRef.current);
  });

  return null;
}
