import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { BottleItemConfig } from "./bottleItems";

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
          if (!movedRef.current) window.location.hash = item.route.replace("#", "");
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
        window.location.hash = item.route.replace("#", "");
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
    bass: [-0.28, -1.76, 0.05],
    camera: [0.24, -1.68, 0.12],
    skill: [0.48, -1.62, -0.1],
    market: [-0.02, -1.52, 0.2],
    world: [-0.42, -1.64, -0.16]
  };
  return positions[id] ?? [0, -1.4, 0];
}

function ItemMesh({ item, active }: { item: BottleItemConfig; active: boolean }) {
  switch (item.id) {
    case "bass":
      return <BassToy item={item} active={active} />;
    case "camera":
      return <CameraToy item={item} active={active} />;
    case "skill":
      return <SkillToy item={item} active={active} />;
    case "market":
      return <MarketToy item={item} active={active} />;
    case "world":
      return <WorldToy item={item} active={active} />;
    default:
      return null;
  }
}

function BassToy({ item, active }: { item: BottleItemConfig; active: boolean }) {
  return (
    <group rotation={[0, 0, -0.35]}>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.12, 0.78, 0.08]} />
        <meshStandardMaterial color={item.body} roughness={0.46} metalness={0.15} emissive={active ? item.accent : "#000000"} emissiveIntensity={active ? 0.18 : 0} />
      </mesh>
      <mesh position={[0, -0.43, 0]}>
        <sphereGeometry args={[0.22, 24, 16]} />
        <meshStandardMaterial color={item.accent} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0.02, 0.36, 0.01]}>
        <boxGeometry args={[0.28, 0.08, 0.09]} />
        <meshStandardMaterial color="#efdfbd" roughness={0.4} />
      </mesh>
    </group>
  );
}

function CameraToy({ item, active }: { item: BottleItemConfig; active: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.58, 0.34, 0.16]} />
        <meshStandardMaterial color={item.body} roughness={0.42} metalness={0.2} emissive={active ? item.accent : "#000000"} emissiveIntensity={active ? 0.12 : 0} />
      </mesh>
      <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.17, 0.12, 32]} />
        <meshStandardMaterial color={item.accent} roughness={0.28} metalness={0.35} />
      </mesh>
      <mesh position={[-0.18, 0.21, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.14]} />
        <meshStandardMaterial color="#e8e1d0" roughness={0.45} />
      </mesh>
    </group>
  );
}

function SkillToy({ item, active }: { item: BottleItemConfig; active: boolean }) {
  return (
    <group rotation={[0, 0, 0.25]}>
      <mesh>
        <octahedronGeometry args={[0.27, 1]} />
        <meshStandardMaterial color={item.accent} roughness={0.55} metalness={0.05} emissive={active ? item.accent : "#000000"} emissiveIntensity={active ? 0.2 : 0} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.08, 0.36, 0.08]} />
        <meshStandardMaterial color={item.body} roughness={0.6} />
      </mesh>
    </group>
  );
}

function MarketToy({ item, active }: { item: BottleItemConfig; active: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.54, 0.34, 0.08]} />
        <meshStandardMaterial color={item.body} roughness={0.5} metalness={0.08} emissive={active ? item.accent : "#000000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      {[-0.16, -0.02, 0.12, 0.24].map((x, index) => (
        <mesh key={x} position={[x, -0.08 + index * 0.04, 0.055]}>
          <boxGeometry args={[0.045, 0.12 + index * 0.035, 0.018]} />
          <meshBasicMaterial color={index % 2 === 0 ? item.accent : "#ff6d65"} />
        </mesh>
      ))}
    </group>
  );
}

function WorldToy({ item, active }: { item: BottleItemConfig; active: boolean }) {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.24, 1]} />
        <meshStandardMaterial color={item.body} roughness={0.48} metalness={0.08} emissive={active ? item.accent : "#000000"} emissiveIntensity={active ? 0.2 : 0} />
      </mesh>
      <mesh position={[0.17, 0.1, 0.02]}>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial color={item.accent} roughness={0.4} />
      </mesh>
    </group>
  );
}
