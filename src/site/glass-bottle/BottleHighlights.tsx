import * as THREE from "three";

function FacingEllipse({
  position,
  scale,
  opacity,
  color = "#ffffff",
  fillOpacity = 0.08
}: {
  position: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  color?: string;
  fillOpacity?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh renderOrder={120}>
        <ringGeometry args={[0.64, 1, 160]} />
        <meshBasicMaterial transparent opacity={opacity * 0.72} color="#5f7f8d" depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh renderOrder={121} scale={[0.98, 0.9, 1]}>
        <ringGeometry args={[0.78, 1, 160]} />
        <meshBasicMaterial transparent opacity={opacity} color={color} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh renderOrder={119} scale={[0.92, 0.62, 1]}>
        <circleGeometry args={[0.82, 160]} />
        <meshBasicMaterial transparent opacity={fillOpacity} color="#5f7f8d" depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function BottleHighlights() {
  return (
    <group position={[0, -0.08, 0]}>
      <mesh position={[-0.5, 0.05, 0.86]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[0.028, 3.1]} />
        <meshBasicMaterial transparent opacity={0.66} color="#ffffff" depthWrite={false} />
      </mesh>
      <mesh position={[0.54, -0.28, 0.87]} rotation={[0, 0, 0.09]}>
        <planeGeometry args={[0.018, 2.25]} />
        <meshBasicMaterial transparent opacity={0.38} color="#dfeeff" depthWrite={false} />
      </mesh>
      <FacingEllipse position={[0, 2.28, 1.02]} scale={[0.56, 0.12, 1]} opacity={0.7} color="#f9fdff" fillOpacity={0.24} />
      <FacingEllipse position={[0, -2.06, 1.02]} scale={[0.8, 0.145, 1]} opacity={0.62} color="#ecfbff" fillOpacity={0.14} />
      <mesh position={[0, -2.035, 0.9]} scale={[1.34, 0.17, 1]} renderOrder={40}>
        <circleGeometry args={[0.5, 96]} />
        <meshBasicMaterial transparent opacity={0.1} color="#8fb6c8" side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -1.93, 0.86]} scale={[1.18, 0.13, 1]}>
        <ringGeometry args={[0.38, 0.5, 96]} />
        <meshBasicMaterial transparent opacity={0.18} color="#dff7ff" side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -2.12, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.82, 96]} />
        <meshBasicMaterial transparent opacity={0.025} color="#ffffff" depthWrite={false} />
      </mesh>
      <mesh position={[0.12, -2.13, 0.04]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <circleGeometry args={[0.38, 64]} />
        <meshBasicMaterial transparent opacity={0.026} color="#b7e7ff" depthWrite={false} />
      </mesh>
    </group>
  );
}
