import { Environment, Float } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BottleGlass } from "./BottleGlass";
import { BottleHighlights } from "./BottleHighlights";
import { BottleItem, StaticBottleItem } from "./BottleItem";
import { BottlePhysics } from "./BottlePhysics";
import { BOTTLE_ITEMS } from "./bottleItems";

type BottleSceneProps = {
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  reducedMotion: boolean;
};

export function BottleScene({ activeId, onActiveChange, reducedMotion }: BottleSceneProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const warmLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const lights = [keyLightRef.current, rimLightRef.current, warmLightRef.current].filter(Boolean);
    if (!lights.length) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lights,
        { intensity: 0 },
        {
          intensity: (index: number) => [2.25, 0.85, 0.34][index] ?? 0.7,
          duration: 1.25,
          stagger: 0.12,
          ease: "power2.out"
        }
      );
      gsap.to(rimLightRef.current?.position ?? {}, {
        x: -2.65,
        duration: 3.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight ref={keyLightRef} position={[3.2, 4.4, 4.2]} intensity={2.25} />
      <pointLight ref={rimLightRef} position={[-3, 1.5, 2]} intensity={0.85} color="#dceeff" />
      <pointLight ref={warmLightRef} position={[2.4, -1.5, 1.6]} intensity={0.34} color="#fff4d0" />
      <Environment preset="city" />

      {reducedMotion ? (
        <group>
          {BOTTLE_ITEMS.map((item) => (
            <StaticBottleItem key={item.id} item={item} activeId={activeId} onActiveChange={onActiveChange} />
          ))}
        </group>
      ) : (
        <Physics gravity={[0, -3.2, 0]}>
          <BottlePhysics />
          {BOTTLE_ITEMS.map((item, index) => (
            <BottleItem
              key={item.id}
              item={item}
              activeId={activeId}
              onActiveChange={onActiveChange}
              reducedMotion={reducedMotion}
              delay={index * 240}
            />
          ))}
        </Physics>
      )}

      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.12}>
        <BottleGlass />
      </Float>
      <BottleHighlights />
    </>
  );
}
