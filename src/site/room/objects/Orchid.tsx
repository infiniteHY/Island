import { createInstances } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const PETAL_WHITE = "#fffaf4";
const SEPAL_WHITE = "#f2ebe4";
const VEIN_PINK = "#d6a7bd";
const LIP_MAGENTA = "#a72f78";
const LIP_DARK = "#6f194f";
const COLUMN_YELLOW = "#efcf72";
const LEAF_DARK = "#28533a";
const LEAF_LIGHT = "#39704b";
const STEM_GREEN = "#557846";

type Point = [number, number, number];

function createPetalGeometry(width: number, length: number, cup: number, curl: number, ruffle = 0) {
  const columns = 16;
  const rows = 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const widthProfile = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.92)), 0.62) * (0.84 + t * 0.16);
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const across = u * 2 - 1;
      const x = across * width * widthProfile;
      const y = length * t;
      const edgeWave = Math.sin(across * Math.PI * 3.5 + t * 5) * ruffle * Math.pow(t, 1.4);
      const z = cup * Math.sin(Math.PI * t) * (1 - across * across) + curl * t * t + edgeWave;
      positions.push(x, y, z);
      uvs.push(u, t);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createLeafGeometry(length: number, width: number, arch: number, droop: number, twist: number) {
  const columns = 14;
  const rows = 20;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const widthProfile = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.55) * (1 - t * 0.13);
    for (let column = 0; column <= columns; column += 1) {
      const across = column / columns * 2 - 1;
      const x = length * t;
      const z = across * width * widthProfile;
      const centerCurve = arch * Math.sin(Math.PI * t) - droop * t * t;
      const centralGroove = -Math.abs(across) * 0.012 * Math.sin(Math.PI * t);
      const y = centerCurve + centralGroove + twist * across * t;
      positions.push(x, y, z);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const WING_PETAL = createPetalGeometry(0.04, 0.07, 0.009, 0.006, 0.0014);
const DORSAL_SEPAL = createPetalGeometry(0.023, 0.062, 0.007, -0.004, 0.0005);
const SIDE_SEPAL = createPetalGeometry(0.021, 0.066, 0.005, -0.007, 0.0004);
const LIP_CENTER = createPetalGeometry(0.014, 0.038, 0.009, 0.018, 0.0018);
const LIP_SIDE = createPetalGeometry(0.01, 0.027, 0.007, 0.005, 0.001);
const VEIN_GEOMETRY = new THREE.SphereGeometry(0.008, 7, 5);

const [WingPetalInstances, WingPetalInstance] = createInstances();
const [DorsalSepalInstances, DorsalSepalInstance] = createInstances();
const [SideSepalInstances, SideSepalInstance] = createInstances();
const [LipSideInstances, LipSideInstance] = createInstances();
const [LipCenterInstances, LipCenterInstance] = createInstances();
const [VeinInstances, VeinInstance] = createInstances();

type PetalKind = "wing" | "dorsal" | "side-sepal" | "lip-side" | "lip-center";

function Petal({
  kind,
  rotation,
  z = 0,
  vein = false
}: {
  kind: PetalKind;
  rotation: Point;
  z?: number;
  vein?: boolean;
}) {
  const instance = (() => {
    switch (kind) {
      case "wing":
        return <WingPetalInstance />;
      case "dorsal":
        return <DorsalSepalInstance />;
      case "side-sepal":
        return <SideSepalInstance />;
      case "lip-side":
        return <LipSideInstance />;
      case "lip-center":
        return <LipCenterInstance />;
    }
  })();

  return (
    <group rotation={rotation} position={[0, 0, z]}>
      {instance}
      {vein ? (
        <VeinInstance position={[0, 0.035, 0.006]} scale={[0.22, 1, 0.18]} />
      ) : null}
    </group>
  );
}

/** 一朵白花红心蝴蝶兰：五片花被、三裂唇瓣、蕊柱、花粉块与后方子房。 */
function Blossom({ position, rotation, scale = 1 }: { position: Point; rotation: Point; scale?: number }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, -0.023]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.006, 0.032, 5, 8]} />
        <meshStandardMaterial color="#76945b" roughness={0.72} />
      </mesh>

      <Petal kind="dorsal" rotation={[0.12, 0, 0]} z={-0.004} />
      <Petal kind="side-sepal" rotation={[-0.08, 0.12, 2.14]} z={-0.006} />
      <Petal kind="side-sepal" rotation={[-0.08, -0.12, -2.14]} z={-0.006} />

      <Petal kind="wing" rotation={[0.04, -0.14, 1.08]} z={0.002} vein />
      <Petal kind="wing" rotation={[0.04, 0.14, -1.08]} z={0.002} vein />

      {/* 唇瓣与花蕊位于花冠正面中央，整体前移，避免从远景看成吊在花底。 */}
      <group position={[0, 0.012, 0.014]}>
        <Petal kind="lip-side" rotation={[0.18, -0.35, 2.38]} z={0.013} />
        <Petal kind="lip-side" rotation={[0.18, 0.35, -2.38]} z={0.013} />
        <Petal kind="lip-center" rotation={[0.42, 0, Math.PI]} z={0.016} />

        <mesh position={[0, 0.002, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.0065, 0.013, 5, 8]} />
          <meshStandardMaterial color={COLUMN_YELLOW} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.007, 0.032]} scale={[1.1, 0.68, 0.55]}>
          <sphereGeometry args={[0.006, 8, 6]} />
          <meshStandardMaterial color={LIP_DARK} roughness={0.55} />
        </mesh>
        {[-0.004, 0.004].map((x) => (
          <mesh key={x} position={[x, 0.009, 0.037]}>
            <sphereGeometry args={[0.0024, 6, 5]} />
            <meshStandardMaterial color="#f0d76f" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Tube({ points, radius, color }: { points: THREE.Vector3[]; radius: number; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, Math.max(6, points.length * 5), radius, 7, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function Pedicel({ from, to }: { from: THREE.Vector3; to: Point }) {
  const points = useMemo(() => {
    const end = new THREE.Vector3(...to);
    const middle = from.clone().lerp(end, 0.55);
    middle.y += 0.008;
    return [from, middle, end];
  }, [from, to]);
  return <Tube points={points} radius={0.0028} color="#6d8a50" />;
}

function Bud({ position, scale = 1, rotation = [0, 0, 0] }: { position: Point; scale?: number; rotation?: Point }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[0.72, 1.15, 0.72]} castShadow>
        <sphereGeometry args={[0.017, 12, 9]} />
        <meshPhysicalMaterial color="#eef0d8" roughness={0.52} sheen={0.2} />
      </mesh>
      {[0, 2.1, 4.2].map((angle) => (
        <mesh key={angle} position={[Math.cos(angle) * 0.008, -0.014, Math.sin(angle) * 0.008]} rotation={[0, angle, 0.35]}>
          <coneGeometry args={[0.008, 0.024, 6]} />
          <meshStandardMaterial color="#78905b" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

type Flower = { t: number; out: Point; face: Point; scale?: number };
type BudData = { t: number; out: Point; scale?: number };

function FlowerSpike({
  points,
  flowers,
  buds,
  stake
}: {
  points: Point[];
  flowers: Flower[];
  buds: BudData[];
  stake: { x: number; z: number; height: number; lean: number };
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  const stemPoints = useMemo(() => Array.from({ length: 18 }, (_, index) => curve.getPoint(index / 17)), [curve]);

  return (
    <group>
      <Tube points={stemPoints} radius={0.0042} color={STEM_GREEN} />
      <mesh position={[stake.x, stake.height / 2 + 0.29, stake.z]} rotation={[0, 0, stake.lean]} castShadow>
        <cylinderGeometry args={[0.0032, 0.0038, stake.height, 7]} />
        <meshStandardMaterial color="#587044" roughness={0.78} />
      </mesh>
      {[0.48, 0.72].map((ratio) => (
        <mesh key={ratio} position={[stake.x - stake.lean * stake.height * (ratio - 0.5), 0.29 + stake.height * ratio, stake.z]}>
          <torusGeometry args={[0.009, 0.0026, 5, 10, Math.PI * 1.55]} />
          <meshStandardMaterial color="#829663" roughness={0.68} />
        </mesh>
      ))}

      {flowers.map(({ t, out, face, scale }, index) => {
        const origin = curve.getPoint(t);
        const target: Point = [origin.x + out[0], origin.y + out[1], origin.z + out[2]];
        return (
          <group key={`flower-${index}`}>
            <Pedicel from={origin} to={target} />
            <Blossom position={target} rotation={face} scale={scale} />
          </group>
        );
      })}

      {buds.map(({ t, out, scale }, index) => {
        const origin = curve.getPoint(t);
        const target: Point = [origin.x + out[0], origin.y + out[1], origin.z + out[2]];
        return (
          <group key={`bud-${index}`}>
            <Pedicel from={origin} to={target} />
            <Bud position={target} scale={scale} rotation={[0.2, 0, -0.55]} />
          </group>
        );
      })}
    </group>
  );
}

function OrchidLeaf({ length, width, rotation, arch, droop, twist, color }: {
  length: number;
  width: number;
  rotation: number;
  arch: number;
  droop: number;
  twist: number;
  color: string;
}) {
  const geometry = useMemo(
    () => createLeafGeometry(length, width, arch, droop, twist),
    [arch, droop, length, twist, width]
  );
  const midribPoints = useMemo(
    () => Array.from({ length: 9 }, (_, index) => {
      const t = index / 8;
      return new THREE.Vector3(length * t, arch * Math.sin(Math.PI * t) - droop * t * t + 0.004, 0);
    }),
    [arch, droop, length]
  );

  return (
    <group position={[0, 0.305, 0]} rotation={[0, rotation, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.16} clearcoatRoughness={0.62} side={THREE.DoubleSide} />
      </mesh>
      <Tube points={midribPoints} radius={0.0018} color="#739063" />
    </group>
  );
}

/** 纯 Three.js 程序化蝴蝶兰盆栽。 */
function OrchidModel({ position }: { position: Point }) {
  const leaves = [
    { rotation: 0.18, length: 0.38, width: 0.065, arch: 0.055, droop: 0.115, twist: 0.012 },
    { rotation: 1.2, length: 0.43, width: 0.072, arch: 0.07, droop: 0.14, twist: -0.012 },
    { rotation: 2.35, length: 0.34, width: 0.062, arch: 0.05, droop: 0.1, twist: 0.015 },
    { rotation: 3.36, length: 0.41, width: 0.07, arch: 0.062, droop: 0.135, twist: -0.01 },
    { rotation: 4.5, length: 0.36, width: 0.064, arch: 0.05, droop: 0.11, twist: 0.012 },
    { rotation: 5.55, length: 0.31, width: 0.056, arch: 0.045, droop: 0.09, twist: -0.008 }
  ];

  return (
    <group position={position}>
      <mesh position={[0, 0.155, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.135, 0.098, 0.27, 32]} />
        <meshPhysicalMaterial color="#f4f0e9" roughness={0.22} clearcoat={0.42} clearcoatRoughness={0.18} />
      </mesh>
      <mesh position={[0, 0.292, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.127, 0.011, 10, 32]} />
        <meshPhysicalMaterial color="#fbf8f2" roughness={0.2} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0.285, 0]}>
        <cylinderGeometry args={[0.118, 0.116, 0.018, 28]} />
        <meshStandardMaterial color="#6a5439" roughness={0.96} />
      </mesh>
      {Array.from({ length: 14 }, (_, index) => {
        const angle = index * 2.399;
        const radius = 0.025 + (index % 4) * 0.021;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, 0.298 + (index % 3) * 0.003, Math.sin(angle) * radius]} rotation={[0, angle, 0]}>
            <dodecahedronGeometry args={[0.013 + (index % 2) * 0.003, 0]} />
            <meshStandardMaterial color={index % 3 === 0 ? "#8b7652" : "#665136"} roughness={1} />
          </mesh>
        );
      })}

      {leaves.map((leaf, index) => (
        <OrchidLeaf key={index} {...leaf} color={index % 2 ? LEAF_DARK : LEAF_LIGHT} />
      ))}

      <FlowerSpike
        points={[
          [0.012, 0.3, 0.01],
          [0.035, 0.56, 0.018],
          [0.085, 0.82, 0.035],
          [0.19, 1.04, 0.065],
          [0.36, 1.17, 0.1]
        ]}
        flowers={[
          { t: 0.38, out: [-0.018, 0.01, 0.04], face: [0.05, -0.1, 0.06], scale: 0.86 },
          { t: 0.5, out: [0.025, 0.005, 0.035], face: [0.08, 0.12, -0.08], scale: 0.95 },
          { t: 0.62, out: [-0.018, 0.018, 0.045], face: [0.04, -0.1, 0.07], scale: 1.04 },
          { t: 0.74, out: [0.018, 0.022, 0.05], face: [0.1, 0.08, -0.04], scale: 1.08 },
          { t: 0.84, out: [-0.012, 0.025, 0.048], face: [0.12, -0.08, 0.08], scale: 1.03 },
          { t: 0.93, out: [0.014, 0.018, 0.042], face: [0.16, 0.05, -0.04], scale: 0.93 }
        ]}
        buds={[
          { t: 0.975, out: [0.012, 0.018, 0.018], scale: 0.86 },
          { t: 1, out: [0.028, 0.012, 0.014], scale: 0.68 }
        ]}
        stake={{ x: 0.045, z: 0.005, height: 0.5, lean: -0.07 }}
      />

      <FlowerSpike
        points={[
          [-0.018, 0.3, -0.012],
          [-0.045, 0.5, -0.02],
          [-0.1, 0.69, -0.015],
          [-0.21, 0.86, 0.01],
          [-0.34, 0.93, 0.04]
        ]}
        flowers={[
          { t: 0.4, out: [0.022, 0.01, 0.04], face: [0.05, 0.1, -0.06], scale: 0.82 },
          { t: 0.55, out: [-0.025, 0.012, 0.04], face: [0.08, -0.08, 0.08], scale: 0.9 },
          { t: 0.7, out: [0.012, 0.02, 0.05], face: [0.05, 0.1, -0.06], scale: 1 },
          { t: 0.83, out: [-0.018, 0.02, 0.048], face: [0.12, -0.1, 0.08], scale: 0.97 },
          { t: 0.93, out: [0.01, 0.015, 0.04], face: [0.15, 0.08, -0.05], scale: 0.84 }
        ]}
        buds={[
          { t: 0.98, out: [-0.012, 0.016, 0.018], scale: 0.76 },
          { t: 1, out: [-0.026, 0.008, 0.012], scale: 0.58 }
        ]}
        stake={{ x: -0.038, z: -0.012, height: 0.4, lean: 0.08 }}
      />
    </group>
  );
}

/**
 * 全株共享六组 InstancedMesh。花瓣仍保留各自的局部姿态，但相同几何与材质
 * 只提交一次绘制，避免每朵花重复创建五套 mesh/material。
 */
export function Orchid({ position }: { position: Point }) {
  return (
    <WingPetalInstances geometry={WING_PETAL} limit={24} frames={2} castShadow frustumCulled={false}>
      <meshPhysicalMaterial
        color={PETAL_WHITE}
        roughness={0.48}
        sheen={0.32}
        sheenColor="#ffffff"
        clearcoat={0.08}
        side={THREE.DoubleSide}
      />
      <DorsalSepalInstances geometry={DORSAL_SEPAL} limit={12} frames={2} castShadow frustumCulled={false}>
        <meshPhysicalMaterial
          color={SEPAL_WHITE}
          roughness={0.48}
          sheen={0.32}
          sheenColor="#ffffff"
          clearcoat={0.08}
          side={THREE.DoubleSide}
        />
        <SideSepalInstances geometry={SIDE_SEPAL} limit={24} frames={2} castShadow frustumCulled={false}>
          <meshPhysicalMaterial
            color={SEPAL_WHITE}
            roughness={0.48}
            sheen={0.32}
            sheenColor="#ffffff"
            clearcoat={0.08}
            side={THREE.DoubleSide}
          />
          <LipSideInstances geometry={LIP_SIDE} limit={24} frames={2} castShadow frustumCulled={false}>
            <meshPhysicalMaterial color={LIP_MAGENTA} roughness={0.48} sheen={0.22} side={THREE.DoubleSide} />
            <LipCenterInstances geometry={LIP_CENTER} limit={12} frames={2} castShadow frustumCulled={false}>
              <meshPhysicalMaterial color={LIP_MAGENTA} roughness={0.48} sheen={0.22} side={THREE.DoubleSide} />
              <VeinInstances geometry={VEIN_GEOMETRY} limit={24} frames={2} frustumCulled={false}>
                <meshStandardMaterial color={VEIN_PINK} transparent opacity={0.38} roughness={0.65} />
                <OrchidModel position={position} />
              </VeinInstances>
            </LipCenterInstances>
          </LipSideInstances>
        </SideSepalInstances>
      </DorsalSepalInstances>
    </WingPetalInstances>
  );
}
