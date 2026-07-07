import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";

const ROOM_MODEL_URL = "/assets/room/room.glb";

export function RoomModel({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(ROOM_MODEL_URL);
  const focus = useRoomStore((state) => state.focus);

  const recordDisc = useMemo(() => scene.getObjectByName("record_disc"), [scene]);

  useEffect(() => {
    scene.traverse((object) => {
      if ("isMesh" in object && object.isMesh) {
        const mesh = object as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.raycast = () => null;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!recordDisc || reducedMotion || focus !== "vinyl") return;
    recordDisc.rotation.z += delta * 2.25;
  });

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(ROOM_MODEL_URL);
