import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * 书柜顶的垂蔓绿萝：Blender 程序化建模（scripts/make_plants.py）导出的 GLB。
 * 釉面陶盆 + 表土 + 双层叶冠 + 四条垂蔓心形叶。
 * 改模型请改脚本重新导出，别在这里拼几何体。
 */

const POTHOS_URL = "/assets/room/plants/pothos.glb";

export function PothosPlant({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(POTHOS_URL);
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

useGLTF.preload(POTHOS_URL);
