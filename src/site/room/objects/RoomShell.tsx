import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSiteStore } from "../../siteStore";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

/**
 * 开放式两墙房间：实木拼板地板 + 星际飞船圆形舷窗（圈梁螺栓/多层玻璃，
 * 窗外是 2024 年摄于新疆的星空，点击可放大细看）+ 踢脚线、挂钟、真实世界地图挂画、椭圆地毯。
 * 从右前方观看时不会被墙体挡住。
 */

/** 挂钟：时针/分针/秒针按本地真实时间走（每帧读取系统时间） */
function WallClock() {
  const hourRef = useRef<THREE.Group>(null);
  const minuteRef = useRef<THREE.Group>(null);
  const secondRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    // 表盘朝 +z，指针从 12 点位顺时针转（绕 z 取负角）
    if (secondRef.current) secondRef.current.rotation.z = -(s / 60) * Math.PI * 2;
    if (minuteRef.current) minuteRef.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * Math.PI * 2;
  });

  return (
    <group position={[3.05, 3.15, -3.17]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.045, 32]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.024]}>
        <circleGeometry args={[0.145, 32]} />
        <meshStandardMaterial color="#f4efe2" roughness={0.6} />
      </mesh>
      {/* 十二个时点刻度（3/6/9/12 略粗） */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const major = i % 3 === 0;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.122, Math.cos(a) * 0.122, 0.027]}
            rotation={[0, 0, -a]}
          >
            <boxGeometry args={[major ? 0.014 : 0.008, major ? 0.03 : 0.02, 0.004]} />
            <meshBasicMaterial color="#3a3a3a" />
          </mesh>
        );
      })}
      {/* 指针：组内几何上移一半长度，使其绕表心旋转 */}
      <group ref={hourRef} position={[0, 0, 0.03]}>
        <mesh position={[0, 0.033, 0]}>
          <boxGeometry args={[0.013, 0.075, 0.005]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
      </group>
      <group ref={minuteRef} position={[0, 0, 0.033]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.009, 0.108, 0.005]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
      </group>
      <group ref={secondRef} position={[0, 0, 0.036]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.003, 0.12, 0.004]} />
          <meshBasicMaterial color="#b8452a" />
        </mesh>
        <mesh position={[0, -0.024, 0]}>
          <boxGeometry args={[0.005, 0.03, 0.004]} />
          <meshBasicMaterial color="#b8452a" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.039]}>
        <circleGeometry args={[0.012, 12]} />
        <meshBasicMaterial color="#8a5c3a" />
      </mesh>
    </group>
  );
}

/** 真实世界地图挂画：木框 + 卡纸内衬 + NASA Blue Marble 贴图 + 旅行图钉（可点击放大细看） */
function WorldMap({ frameWood }: { frameWood: string }) {
  const map = useTexture("/textures/world-map.jpg");
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);

  return (
    <group
      position={[2.78, 2.12, -3.19]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("map");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("map");
      }}
    >
      {/* 木框 */}
      <mesh castShadow>
        <boxGeometry args={[1.52, 0.84, 0.035]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      {/* 卡纸内衬 */}
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[1.44, 0.76]} />
        <meshStandardMaterial color="#e8e0cc" roughness={0.8} />
      </mesh>
      {/* 地图（NASA Blue Marble，2:1 等距圆柱投影） */}
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[1.38, 0.69]} />
        <meshStandardMaterial map={map} roughness={0.85} />
      </mesh>
      {/* 挂绳 + 墙钉 */}
      <mesh position={[0, 0.51, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.05, 10]} />
        <meshStandardMaterial color="#8f8a80" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.3, 0.47, -0.03]}
          rotation={[0, 0, side * -0.55]}
        >
          <cylinderGeometry args={[0.004, 0.004, 0.24, 6]} />
          <meshStandardMaterial color="#4a3b2a" roughness={0.7} />
        </mesh>
      ))}
      {/* 旅行图钉：等距圆柱投影换算 x=经度/360*1.38, y=纬度/180*0.69
          红=中国（104°E,33°N） 黄=日本（139.7°E,35.7°N） 蓝=菲律宾（121°E,14.6°N） */}
      {[
        { x: 0.399, y: 0.126, color: "#e2493b" },
        { x: 0.535, y: 0.137, color: "#e8b83a" },
        { x: 0.464, y: 0.056, color: "#3a7bd5" }
      ].map(({ x, y, color }) => (
        <group key={color} position={[x, y, 0.03]}>
          <mesh>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color={color} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <RoomObjectLabel id="map" position={[0, -0.62, 0.15]} />
    </group>
  );
}

/**
 * 舷窗外的新疆星空照片。背景板远置（z=-7.5）并放大，与舷窗圈梁形成
 * 视差，看起来是"窗外的星空"而不是贴在窗后的画；画面保持原始 3:2 比例。
 */
function XinjiangView() {
  const map = useTexture("/textures/xinjiang-raf.jpg");
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const watermark = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 160;
    const context = canvas.getContext("2d");
    if (context) {
      context.font = "600 48px 'Courier New', Courier, monospace";
      context.fillStyle = "rgba(232, 181, 83, 0.88)";
      context.shadowColor = "rgba(122, 66, 18, 0.68)";
      context.shadowBlur = 7;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("2024/07/14 xinjiang", 600, 82);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  useEffect(() => () => watermark.dispose(), [watermark]);

  return (
    <group>
      <mesh position={[-0.1, 2.4, -7.5]}>
        <planeGeometry args={[9.6, 6.4]} />
        <meshBasicMaterial map={map} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[0.2, 0.6, -7.42]}>
        <planeGeometry args={[3, 0.4]} />
        <meshBasicMaterial map={watermark} transparent toneMapped={false} fog={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function RoomShell() {
  const dark = useSiteStore((state) => state.theme === "dark");
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);

  const plankTones = dark
    ? ["#8a6d4e", "#816344", "#927556", "#79603f"]
    : ["#c9a06e", "#bf9463", "#d2aa79", "#b68d5c"];

  // 每列地板由两段拼成，接缝位置伪随机，接近真实铺装
  // 地板向右前方多铺一段（x 到 4.4 / z 到 4.6），补满相机右下角视野
  const planks = useMemo(() => {
    const segs: { x: number; z: number; len: number; tone: number }[] = [];
    for (let i = 0; i < 13; i += 1) {
      const x = -3 + i * 0.6;
      const seam = -2.2 + (((i * 137 + 71) % 100) / 100) * 4.4;
      segs.push({ x, z: (seam - 3.3) / 2, len: seam + 3.3 - 0.025, tone: (i * 3) % 4 });
      segs.push({ x, z: (seam + 4.6) / 2, len: 4.6 - seam - 0.025, tone: (i * 5 + 2) % 4 });
    }
    return segs;
  }, []);

  // 舷窗补墙板：与墙同色的矩形板中央开圆形窗孔（Shape 挖孔后挤出），盖住墙上的旧矩形洞口
  const bulkheadGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = 1.5;
    const hh = 1.42;
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(hw, hh);
    shape.lineTo(-hw, hh);
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.1, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false, curveSegments: 48 });
  }, []);

  useEffect(() => () => bulkheadGeo.dispose(), [bulkheadGeo]);

  // 墙面淡蓝色调：白天是雾霭蓝，夜晚是安静的灰蓝，与木质家具冷暖对比
  const wall = dark ? "#33435c" : "#b9cede";
  const wallSide = dark ? "#2a3850" : "#a6bfd3";
  const trim = dark ? "#c7b394" : "#e8d9bd";
  const frameWood = dark ? "#6d543c" : "#7c6248";
  // 舷窗金属件：承压圈梁 / 内压环，冷灰蓝金属与墙面过渡
  const hullRing = dark ? "#5a6270" : "#b7bfcb";
  const hullDark = dark ? "#232830" : "#3c434e";

  return (
    <group>
      {/* 地板基层（板缝间露出的深色底） */}
      <mesh position={[0.55, -0.11, 0.65]} receiveShadow>
        <boxGeometry args={[7.7, 0.12, 7.9]} />
        <meshStandardMaterial color={dark ? "#3a2c1e" : "#4a3826"} roughness={0.9} />
      </mesh>
      {/* 实木拼板 */}
      {planks.map((p, i) => (
        <mesh key={i} position={[p.x, -0.025, p.z]} receiveShadow>
          <boxGeometry args={[0.575, 0.05, Math.max(p.len, 0.1)]} />
          <meshStandardMaterial color={plankTones[p.tone]} roughness={0.55} />
        </mesh>
      ))}

      {/* 后墙：中央开夜景大窗（洞口 x -1.1..1.5, y 1.2..3.5）
          墙体上沿加高到 y≈5.4，避免视差移动时视口上缘露出墙外背景的三角空隙 */}
      <mesh position={[-2.2, 2.64, -3.26]} receiveShadow>
        <boxGeometry args={[2.2, 5.5, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[3.05, 2.64, -3.26]} receiveShadow>
        <boxGeometry args={[3.1, 5.5, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0.2, 0.55, -3.26]} receiveShadow>
        <boxGeometry args={[2.6, 1.3, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0.2, 4.45, -3.26]} receiveShadow>
        <boxGeometry args={[2.6, 1.9, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      {/* 左侧墙（与后墙同步加高） */}
      <mesh position={[-3.26, 2.64, 0]} receiveShadow>
        <boxGeometry args={[0.12, 5.5, 6.6]} />
        <meshStandardMaterial color={wallSide} roughness={0.92} />
      </mesh>

      {/* 舷窗外：2024-07-14 摄于新疆的星空，常驻显示 */}
      <XinjiangView />

      {/* ── 飞船舷窗（参考 ISS 舷窗：圆形观察窗 + 承压圈梁 + 螺栓圈）──
          圆形之外不再用金属舱壁板，改用与墙同色的补板盖住旧矩形窗洞，
          让舷窗像直接嵌在墙上，金属件只保留圆形圈梁部分 */}
      <mesh geometry={bulkheadGeo} position={[0.2, 2.4, -3.338]} receiveShadow>
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      {/* 可点击的舷窗主体：点击放大看新疆星空 */}
      <group
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered("porthole");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHovered(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          setFocus("porthole");
        }}
      >
        {/* 承压圈梁：窗孔外的粗壮金属环（主结构） */}
        <mesh position={[0.2, 2.4, -3.2]} castShadow>
          <torusGeometry args={[1.18, 0.095, 14, 48]} />
          <meshStandardMaterial color={hullRing} metalness={0.6} roughness={0.35} />
        </mesh>
        {/* 螺栓圈：沿圈梁一周的六角螺栓 */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[0.2 + Math.cos(a) * 1.18, 2.4 + Math.sin(a) * 1.18, -3.145]}
              rotation={[Math.PI / 2, 0, a]}
            >
              <cylinderGeometry args={[0.028, 0.028, 0.035, 6]} />
              <meshStandardMaterial color={hullDark} metalness={0.65} roughness={0.3} />
            </mesh>
          );
        })}
        {/* 井壁套筒：从圈梁向外延伸的舱体厚度（内壁可见），舷窗因此有"穿过船壳"的纵深 */}
        <mesh position={[0.2, 2.4, -3.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.55, 48, 1, true]} />
          <meshStandardMaterial color={hullDark} metalness={0.45} roughness={0.55} side={THREE.BackSide} />
        </mesh>
        {/* 套筒外端收口环 */}
        <mesh position={[0.2, 2.4, -3.7]}>
          <torusGeometry args={[1.1, 0.045, 10, 48]} />
          <meshStandardMaterial color={hullDark} metalness={0.5} roughness={0.45} />
        </mesh>
        {/* 内压环：贴玻璃的一圈细环（第二道密封），随玻璃一起深入井内 */}
        <mesh position={[0.2, 2.4, -3.46]}>
          <torusGeometry args={[1.07, 0.04, 12, 44]} />
          <meshStandardMaterial color={hullDark} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* 多层观察玻璃：退到井底，更透明（opacity 0.04），窗外就是宇宙本身 */}
        <mesh position={[0.2, 2.4, -3.5]}>
          <circleGeometry args={[1.1, 48]} />
          <meshStandardMaterial
            color="#a8c2e8"
            transparent
            opacity={0.04}
            roughness={0.05}
            metalness={0.4}
            depthWrite={false}
            side={2}
          />
        </mesh>
        <mesh position={[0.2, 2.4, -3.48]}>
          <torusGeometry args={[0.68, 0.006, 6, 40]} />
          <meshBasicMaterial color="#cfe0ff" transparent opacity={0.08} />
        </mesh>
        <RoomObjectLabel id="porthole" position={[0.2, 1.02, -3.1]} />
      </group>

      {/* 踢脚线 */}
      <mesh position={[0.65, 0.07, -3.185]}>
        <boxGeometry args={[7.9, 0.14, 0.03]} />
        <meshStandardMaterial color={trim} roughness={0.6} />
      </mesh>
      <mesh position={[-3.185, 0.07, 0]}>
        <boxGeometry args={[0.03, 0.14, 6.6]} />
        <meshStandardMaterial color={trim} roughness={0.6} />
      </mesh>

      {/* 世界地图挂画（后墙右段、窗户右侧） */}
      <WorldMap frameWood={frameWood} />

      {/* 挂钟（地图上方偏右，按真实时间走） */}
      <WallClock />

      {/* 椭圆地毯（同心分层） */}
      <group position={[-0.9, 0, 0.55]} scale={[1.32, 1, 1]}>
        <mesh position={[0, 0.008, 0]} receiveShadow>
          <cylinderGeometry args={[1.12, 1.12, 0.014, 44]} />
          <meshStandardMaterial color={dark ? "#4e352c" : "#6e4a3c"} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.017, 0]} receiveShadow>
          <cylinderGeometry args={[0.98, 0.98, 0.014, 44]} />
          <meshStandardMaterial color={dark ? "#7c4536" : "#a05a45"} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.026, 0]} receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.012, 40]} />
          <meshStandardMaterial color={dark ? "#4e352c" : "#6e4a3c"} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.034, 0]} receiveShadow>
          <cylinderGeometry args={[0.56, 0.56, 0.012, 40]} />
          <meshStandardMaterial color={dark ? "#7c4536" : "#a05a45"} roughness={0.95} />
        </mesh>
      </group>

      {/* 舷窗边深空冷点光 */}
      <pointLight position={[0.2, 2.35, -2.85]} intensity={dark ? 0.75 : 0.42} color="#a9bfe8" distance={4.5} />
    </group>
  );
}
