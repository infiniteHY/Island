import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MiniProps } from "./BassMini";

type GeoPoint = [longitude: number, latitude: number];

type ContinentData = {
  name: string;
  points: GeoPoint[];
  color?: string;
};

function surfacePoint(lon: number, lat: number, radius: number) {
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

/** 将经纬度轮廓细分成贴合球面的三角网格，避免大片陆地切进球体。 */
function createSphericalPolygon(points: GeoPoint[], radius = 0.242) {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];
  const center: GeoPoint = [
    points.reduce((sum, point) => sum + point[0], 0) / points.length,
    points.reduce((sum, point) => sum + point[1], 0) / points.length
  ];
  const divisions = 5;

  points.forEach((point, edgeIndex) => {
    const next = points[(edgeIndex + 1) % points.length];
    const rowStarts: number[] = [];

    for (let i = 0; i <= divisions; i += 1) {
      rowStarts[i] = vertices.length / 3;
      for (let j = 0; j <= divisions - i; j += 1) {
        const lon = center[0] + ((point[0] - center[0]) * i + (next[0] - center[0]) * j) / divisions;
        const lat = center[1] + ((point[1] - center[1]) * i + (next[1] - center[1]) * j) / divisions;
        const vertex = surfacePoint(toRadians(lon), toRadians(lat), radius);
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }

    for (let i = 0; i < divisions; i += 1) {
      for (let j = 0; j < divisions - i; j += 1) {
        const a = rowStarts[i] + j;
        const b = rowStarts[i + 1] + j;
        const c = rowStarts[i] + j + 1;
        indices.push(a, c, b);
        if (j < divisions - i - 1) {
          indices.push(b, c, rowStarts[i + 1] + j + 1);
        }
      }
    }
  });

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function Continent({ data }: { data: ContinentData }) {
  const geometry = useMemo(() => createSphericalPolygon(data.points), [data.points]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={data.color ?? "#7da66b"} roughness={0.76} metalness={0.01} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** 23.4° 倾轴桌面地球仪：球体独立旋转，经圈、轴销和底座保持固定。 */
export function EarthMini({ item, active }: MiniProps) {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += delta * (active ? 0.82 : 0.1);
  });

  const continents = useMemo<ContinentData[]>(
    () => [
      {
        name: "north-america",
        points: [[-168, 72], [-150, 61], [-135, 55], [-128, 48], [-124, 34], [-112, 24], [-98, 18], [-86, 21], [-81, 30], [-70, 45], [-58, 52], [-80, 62], [-105, 70], [-135, 73]]
      },
      {
        name: "south-america",
        points: [[-81, 12], [-70, 10], [-58, 5], [-48, -2], [-35, -8], [-40, -22], [-50, -35], [-63, -55], [-72, -42], [-77, -18]]
      },
      {
        name: "europe",
        points: [[-10, 36], [2, 43], [15, 39], [29, 43], [40, 55], [30, 68], [10, 72], [-5, 58], [-10, 49]],
        color: "#86aa6d"
      },
      {
        name: "asia",
        points: [[28, 40], [45, 56], [62, 70], [95, 78], [130, 70], [168, 60], [150, 45], [132, 34], [120, 20], [105, 5], [90, 8], [76, 24], [60, 30], [44, 35]]
      },
      {
        name: "africa",
        points: [[-17, 35], [5, 37], [25, 32], [40, 15], [48, -2], [38, -18], [25, -35], [10, -35], [-5, -20], [-15, 5]]
      },
      {
        name: "australia",
        points: [[112, -11], [130, -10], [145, -18], [153, -28], [140, -39], [120, -35], [113, -25]],
        color: "#8caf70"
      },
      {
        name: "greenland",
        points: [[-73, 78], [-55, 83], [-20, 80], [-18, 68], [-42, 59], [-60, 64]],
        color: "#dce9e5"
      },
      {
        name: "antarctica-west",
        points: [[-180, -70], [-140, -72], [-100, -71], [-60, -68], [0, -72], [0, -88], [-180, -88]],
        color: "#e3efec"
      },
      {
        name: "antarctica-east",
        points: [[0, -72], [55, -68], [105, -70], [145, -72], [180, -70], [180, -88], [0, -88]],
        color: "#e3efec"
      },
      { name: "madagascar", points: [[47, -13], [51, -17], [49, -26], [44, -24], [44, -17]], color: "#8caf70" },
      { name: "japan", points: [[130, 31], [136, 34], [142, 44], [146, 43], [140, 34]], color: "#8caf70" },
      { name: "new-zealand", points: [[166, -35], [174, -39], [178, -47], [170, -44]], color: "#8caf70" }
    ],
    []
  );

  return (
    <group position={[0, 0.08, 0]}>
      {/* 铸金属圆座和支柱 */}
      <mesh position={[0, -0.39, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.045, 32]} />
        <meshStandardMaterial color="#6d5637" roughness={0.48} metalness={0.48} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.062, 0.12, 0.06, 24]} />
        <meshStandardMaterial color="#9a7849" roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[0.028, 0.042, 0.13, 18]} />
        <meshStandardMaterial color="#b18b50" roughness={0.34} metalness={0.66} />
      </mesh>

      <group rotation={[0, 0, -0.409]}>
        {/* 带刻度感的黄铜子午经圈 */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.272, 0.009, 8, 72]} />
          <meshStandardMaterial color="#c5a15c" roughness={0.3} metalness={0.74} />
        </mesh>
        {Array.from({ length: 12 }, (_, index) => index * (Math.PI / 6)).map((angle) => (
          <mesh key={angle} position={[0, Math.sin(angle) * 0.272, Math.cos(angle) * 0.272]} rotation={[angle, 0, 0]}>
            <boxGeometry args={[0.022, 0.004, 0.012]} />
            <meshStandardMaterial color="#725a35" roughness={0.42} metalness={0.5} />
          </mesh>
        ))}
        {[-0.282, 0.282].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.024, 16]} />
            <meshStandardMaterial color="#d7b66c" roughness={0.25} metalness={0.78} />
          </mesh>
        ))}

        <group ref={globeRef}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.236, 48, 32]} />
            <meshPhysicalMaterial
              color={item.body}
              roughness={0.38}
              metalness={0.01}
              clearcoat={0.46}
              clearcoatRoughness={0.2}
              emissive={active ? item.accent : "#000000"}
              emissiveIntensity={active ? 0.07 : 0}
            />
          </mesh>

          {continents.map((continent) => (
            <Continent key={continent.name} data={continent} />
          ))}

          <mesh position={surfacePoint(0, 1.42, 0.244)} scale={[0.06, 0.06, 0.01]}>
            <sphereGeometry args={[1, 18, 10]} />
            <meshStandardMaterial color="#edf8ff" roughness={0.45} />
          </mesh>
          <mesh position={surfacePoint(0, -1.38, 0.244)} scale={[0.07, 0.07, 0.01]}>
            <sphereGeometry args={[1, 18, 10]} />
            <meshStandardMaterial color="#edf8ff" roughness={0.45} />
          </mesh>

          {/* 纬线与经线印刷层 */}
          {[-0.13, -0.065, 0, 0.065, 0.13].map((y) => {
            const radius = Math.sqrt(0.238 ** 2 - y ** 2);
            return (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.0015, 4, 64]} />
                <meshBasicMaterial color="#b8d1dc" transparent opacity={0.28} />
              </mesh>
            );
          })}
          {[0, Math.PI / 3, (Math.PI * 2) / 3].map((angle) => (
            <mesh key={angle} rotation={[0, angle, 0]}>
              <torusGeometry args={[0.238, 0.0015, 4, 64]} />
              <meshBasicMaterial color="#b8d1dc" transparent opacity={0.22} />
            </mesh>
          ))}

          <mesh>
            <sphereGeometry args={[0.246, 48, 32]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.09} roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.04} depthWrite={false} />
          </mesh>

          {active ? (
            <mesh>
              <sphereGeometry args={[0.258, 48, 32]} />
              <meshBasicMaterial color={item.accent} transparent opacity={0.08} depthWrite={false} />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  );
}
