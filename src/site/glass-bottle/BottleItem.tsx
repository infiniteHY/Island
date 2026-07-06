import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { BottleItemConfig } from "./bottleItems";
import { BassMini } from "./items/BassMini";
import { EarthMini } from "./items/EarthMini";
import { CameraMini } from "./items/CameraMini";
import { BirdMini } from "./items/BirdMini";
import { DumbbellMini } from "./items/DumbbellMini";
import { BookMini } from "./items/BookMini";

type BottleItemProps = {
  item: BottleItemConfig;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  reducedMotion: boolean;
  delay: number;
};

type DropPhase = "waiting" | "dropping" | "settled";

export function BottleItem({ item, activeId, onActiveChange, reducedMotion, delay }: BottleItemProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const modelRef = useRef<THREE.Group>(null);
  const dropRef = useRef<THREE.Group>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<DropPhase>(reducedMotion ? "settled" : "waiting");
  const active = activeId === item.id || hovered;
  const finalPosition = useMemo(() => finalPositionFor(item.id), [item.id]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("settled");
      return undefined;
    }

    setPhase("waiting");
    const release = gsap.delayedCall(delay / 1000, () => setPhase("dropping"));
    return () => {
      release.kill();
    };
  }, [delay, reducedMotion]);

  useEffect(() => {
    if (phase !== "dropping") return undefined;

    const group = dropRef.current;
    if (!group) return undefined;

    const [fx, fy, fz] = finalPosition;
    const neckX = item.startPosition[0] * 0.18;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => setPhase("settled")
      });

      timeline
        .set(group.position, { x: item.startPosition[0], y: item.startPosition[1], z: item.startPosition[2] })
        .set(group.scale, { x: item.scale * 0.16, y: item.scale * 0.16, z: item.scale * 0.16 })
        .set(group.rotation, {
          x: item.rotation[0],
          y: item.rotation[1],
          z: item.rotation[2] + item.startPosition[0] * 0.3
        })
        .to(group.scale, { x: item.scale, y: item.scale, z: item.scale, duration: 0.35, ease: "back.out(2)" }, 0)
        .to(group.position, { x: neckX, y: 2.28, z: item.startPosition[2] * 0.5, duration: 0.62, ease: "power2.in" }, 0)
        .to(group.rotation, { z: item.rotation[2] + Math.PI * 0.42, duration: 0.62, ease: "power2.in" }, 0)
        .to(group.position, { x: fx, y: fy, z: fz, duration: 1.05, ease: "bounce.out" })
        .to(group.rotation, { x: item.rotation[0] + 0.2, y: item.rotation[1] - 0.18, z: item.rotation[2] - 0.16, duration: 1.05, ease: "power3.out" }, "<");
    }, group);

    return () => ctx.revert();
  }, [finalPosition, item.rotation, item.scale, item.startPosition, phase]);

  useEffect(() => {
    if (phase !== "settled" || reducedMotion) return undefined;

    const settle = gsap.delayedCall(0.06, () => {
      const body = bodyRef.current;
      const model = modelRef.current;
      if (!body) return;

      body.setGravityScale(0.12, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);

      if (model) {
        gsap.fromTo(
          model.scale,
          { x: item.scale * 0.96, y: item.scale * 0.96, z: item.scale * 0.96 },
          { x: item.scale, y: item.scale, z: item.scale, duration: 0.32, ease: "power2.out" }
        );
      }
    });

    return () => {
      settle.kill();
    };
  }, [item.scale, phase, reducedMotion]);

  useEffect(() => {
    const stopDragging = () => {
      draggingRef.current = false;
      lastPointerRef.current = null;
      bodyRef.current?.setGravityScale(0.12, true);
      if (!hovered) document.body.style.cursor = "";
    };

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [hovered]);

  if (phase === "waiting") return null;

  if (phase === "dropping") {
    return (
      <group ref={dropRef}>
        <ItemMesh item={item} active={false} />
      </group>
    );
  }

  return (
    <RigidBody
      ref={bodyRef}
      type={reducedMotion ? "fixed" : "dynamic"}
      colliders="cuboid"
      position={finalPosition}
      rotation={item.rotation}
      restitution={0.14}
      friction={0.82}
      linearDamping={0.42}
      angularDamping={0.56}
      canSleep
      enabledTranslations={[true, !reducedMotion, true]}
      enabledRotations={[true, true, true]}
    >
      <group
        ref={modelRef}
        scale={item.scale}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          onActiveChange(item.id);
          document.body.style.cursor = "grab";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHovered(false);
          onActiveChange(null);
          if (!draggingRef.current) document.body.style.cursor = "";
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          draggingRef.current = true;
          movedRef.current = false;
          lastPointerRef.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
          document.body.style.cursor = "grabbing";
          bodyRef.current?.wakeUp();
          bodyRef.current?.setGravityScale(0.24, true);
          bodyRef.current?.applyImpulse(
            {
              x: Math.max(-0.18, Math.min(0.18, event.point.x * 0.12)),
              y: 0.08,
              z: 0.04
            },
            true
          );
          bodyRef.current?.applyTorqueImpulse({ x: 0.03, y: 0.02, z: event.point.x * -0.08 }, true);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return;

          event.stopPropagation();
          const last = lastPointerRef.current;
          const current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
          lastPointerRef.current = current;
          if (!last) return;

          const dx = Math.max(-28, Math.min(28, current.x - last.x));
          const dy = Math.max(-28, Math.min(28, current.y - last.y));
          if (Math.abs(dx) + Math.abs(dy) > 2) movedRef.current = true;
          bodyRef.current?.wakeUp();
          bodyRef.current?.applyImpulse({ x: dx * 0.008, y: dy * -0.005, z: 0.015 }, true);
          bodyRef.current?.applyTorqueImpulse({ x: dy * 0.004, y: dx * 0.003, z: dx * -0.006 }, true);
        }}
        onClick={(event) => {
          event.stopPropagation();
          movedRef.current = false;
      }}
    >
        <group renderOrder={20}>
          <ItemMesh item={item} active={active} />
        </group>
        {active ? (
          <Html position={[0, 0.42, 0]} center distanceFactor={7} className="bottle-label-wrap">
            <div className="bottle-label">
              <strong>{item.label}</strong>
              <span>{item.subtitle}</span>
            </div>
          </Html>
        ) : null}
      </group>
    </RigidBody>
  );
}

export function StaticBottleItem({
  item,
  activeId,
  onActiveChange
}: {
  item: BottleItemConfig;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = activeId === item.id || hovered;

  return (
    <group
      position={finalPositionFor(item.id)}
      rotation={item.rotation}
      scale={item.scale}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        onActiveChange(item.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(false);
        onActiveChange(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <group renderOrder={20}>
        <ItemMesh item={item} active={active} />
      </group>
      {active ? (
        <Html position={[0, 0.42, 0]} center distanceFactor={7} className="bottle-label-wrap">
          <div className="bottle-label">
            <strong>{item.label}</strong>
            <span>{item.subtitle}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function finalPositionFor(id: string): [number, number, number] {
  const positions: Record<string, [number, number, number]> = {
    bass: [-0.36, -1.66, 0.04],
    book: [-0.5, -1.52, 0.22],
    earth: [0.44, -1.58, -0.1],
    camera: [0.2, -1.7, 0.12],
    bird: [-0.02, -1.48, 0.2],
    dumbbell: [0.34, -1.6, 0.0]
  };
  return positions[id] ?? [0, -1.4, 0];
}

function ItemMesh({ item, active }: { item: BottleItemConfig; active: boolean }) {
  switch (item.id) {
    case "bass":
      return <BassMini item={item} active={active} />;
    case "earth":
      return <EarthMini item={item} active={active} />;
    case "camera":
      return <CameraMini item={item} active={active} />;
    case "bird":
      return <BirdMini item={item} active={active} />;
    case "dumbbell":
      return <DumbbellMini item={item} active={active} />;
    case "book":
      return <BookMini item={item} active={active} />;
    default:
      return null;
  }
}
