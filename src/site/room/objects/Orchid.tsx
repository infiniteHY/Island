import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * 蝴蝶兰盆栽：Blender 程序化建模（scripts/make_plants.py）导出的 GLB。
 * 白瓷釉盆 + 水苔 + 肉质莲座叶 + 双花剑白瓣紫芯蝴蝶兰 + 支撑杆/气生根。
 * 改模型请改脚本重新导出，别在这里拼几何体。
 */

const ORCHID_URL = "/assets/room/plants/orchid.glb";

export function Orchid({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(ORCHID_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={model} position={position} />;
}

useGLTF.preload(ORCHID_URL);
