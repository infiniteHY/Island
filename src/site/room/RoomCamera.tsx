import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useRoomStore, type RoomFocusId } from "./roomStore";

type CameraPose = { position: [number, number, number]; target: [number, number, number] };

const OVERVIEW: CameraPose = { position: [3.4, 2.7, 3.9], target: [-0.5, 0.85, -0.5] };

export const FOCUS_POSES: Record<RoomFocusId, CameraPose> = {
  computer: { position: [-1.15, 1.5, -0.85], target: [-1.15, 1.32, -2.32] },
  typewriter: { position: [0.55, 1.85, -1.0], target: [0.55, 1.08, -2.25] },
  vinyl: { position: [-0.9, 1.75, 0.35], target: [-2.55, 1.02, 0.35] },
  console: { position: [1.05, 1.6, 2.35], target: [1.05, 0.12, 0.95] }
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
