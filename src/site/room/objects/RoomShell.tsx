import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSiteStore } from "../../siteStore";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

/**
 * 开放式两墙房间：实木拼板地板 + 夜景大窗（窗框/玻璃/CanvasTexture 银河星空）
 * + 窗帘、踢脚线、挂钟、真实世界地图挂画、椭圆地毯。从右前方观看时不会被墙体挡住。
 */

const SKY_W = 1120;
const SKY_H = 1040;

/** 确定性伪随机（种子固定，避免主题切换/热更新时星空跳动） */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 近似高斯分布（三次均匀取样求和），用于银河带内的星星聚集 */
function gauss(rand: () => number) {
  return (rand() + rand() + rand()) / 1.5 - 1;
}

const STAR_TINTS = ["#cfe0ff", "#ffffff", "#ffffff", "#fdf6e3", "#ffd9b0"];

/** 束起窗帘的褶皱簇：主幔一根 + 前后左右几根细褶，深浅三色交错 */
const FOLDS = [
  { dx: 0, dz: 0, s: 1, tone: 0 },
  { dx: -0.105, dz: 0.028, s: 0.6, tone: 1 },
  { dx: 0.105, dz: 0.028, s: 0.6, tone: 2 },
  { dx: -0.055, dz: 0.055, s: 0.45, tone: 2 },
  { dx: 0.06, dz: -0.045, s: 0.5, tone: 1 }
];

/**
 * 参考常见 canvas 星空设计（Star Night Sky / Milky Way canvas demos）：
 * 底色垂直渐变 + 斜向银河带（多层椭圆辉光 + 暗尘埃带 + 高密度细星）+
 * 冷暖混色星野 + 按真实相对位置排布的猎户座（含 M42 星云）+
 * 写实满月（真实月海布局 / 环形山 / 第谷辐射纹）。
 */
function paintNightSky(ctx: CanvasRenderingContext2D, dark: boolean) {
  const w = SKY_W;
  const h = SKY_H;
  const rand = mulberry32(20260711);

  // 底色：顶部近黑的深蓝，向地平线略微透出暖蓝
  const base = ctx.createLinearGradient(0, 0, 0, h);
  if (dark) {
    base.addColorStop(0, "#02030a");
    base.addColorStop(0.55, "#050914");
    base.addColorStop(1, "#0a1226");
  } else {
    base.addColorStop(0, "#050a18");
    base.addColorStop(0.55, "#0a1226");
    base.addColorStop(1, "#14224a");
  }
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // ── 银河带：从左下伸向右上（旋转坐标系里画，便于沿带分布） ──
  const bandAngle = -0.52;
  ctx.save();
  ctx.translate(w * 0.4, h * 0.52);
  ctx.rotate(bandAngle);

  // 多层柔和辉光叠出带状云气
  for (let i = 0; i < 70; i += 1) {
    const x = (rand() - 0.5) * w * 1.7;
    const y = gauss(rand) * 85;
    const r = 45 + rand() * 90;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, `rgba(198, 214, 255, ${0.028 + rand() * 0.03})`);
    glow.addColorStop(1, "rgba(198, 214, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 少量粉紫色气辉（发射星云的意象）
  for (let i = 0; i < 16; i += 1) {
    const x = (rand() - 0.5) * w * 1.5;
    const y = gauss(rand) * 70;
    const r = 30 + rand() * 55;
    const tint = i % 2 === 0 ? "255, 183, 201" : "189, 168, 255";
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, `rgba(${tint}, ${0.03 + rand() * 0.035})`);
    glow.addColorStop(1, `rgba(${tint}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 暗尘埃带：沿带中线偏下的一串深色云块，切出银河的"裂缝"
  for (let i = 0; i < 26; i += 1) {
    const x = (rand() - 0.5) * w * 1.6;
    const y = gauss(rand) * 22 + 10;
    const r = 26 + rand() * 46;
    const dust = ctx.createRadialGradient(x, y, 0, x, y, r);
    dust.addColorStop(0, `rgba(4, 6, 14, ${0.1 + rand() * 0.1})`);
    dust.addColorStop(1, "rgba(4, 6, 14, 0)");
    ctx.fillStyle = dust;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 银河里的高密度细星
  for (let i = 0; i < 620; i += 1) {
    const x = (rand() - 0.5) * w * 1.7;
    const y = gauss(rand) * 95;
    const r = 0.4 + rand() * 0.9;
    ctx.fillStyle = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
    ctx.globalAlpha = 0.25 + rand() * 0.55;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── 全天星野：冷暖混色、大小不一 ──
  for (let i = 0; i < 380; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.5 + rand() * 1.4;
    ctx.fillStyle = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
    ctx.globalAlpha = 0.3 + rand() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── 底衬亮星：少量普通亮星（只带光晕不带长芒，衬托猎户座主星） ──
  for (let i = 0; i < 6; i += 1) {
    const x = rand() * w;
    const y = rand() * h * 0.9;
    const r = 1.3 + rand() * 0.9;
    const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    halo.addColorStop(0, "rgba(235, 242, 255, 0.4)");
    halo.addColorStop(1, "rgba(235, 242, 255, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 猎户座：按真实赤经/赤纬相对位置排布（画面左为天球东、上为北）。
  //    参宿四（红超巨星，左上肩）与参宿五（右上肩）、腰带三星
  //    （参宿一/二/三斜排）、参宿六（左下）与蓝白的参宿七（右下脚）、
  //    头部小星，以及腰带下方剑柄处的猎户座大星云 M42 ──
  const drawBrightStar = (x: number, y: number, r: number, core: string, glowRgb: string) => {
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
    halo.addColorStop(0, `rgba(${glowRgb}, 0.5)`);
    halo.addColorStop(1, `rgba(${glowRgb}, 0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
    const spike = r * 7;
    const armH = ctx.createLinearGradient(x - spike, y, x + spike, y);
    armH.addColorStop(0, `rgba(${glowRgb}, 0)`);
    armH.addColorStop(0.5, `rgba(${glowRgb}, 0.6)`);
    armH.addColorStop(1, `rgba(${glowRgb}, 0)`);
    ctx.fillStyle = armH;
    ctx.fillRect(x - spike, y - 0.75, spike * 2, 1.5);
    const armV = ctx.createLinearGradient(x, y - spike, x, y + spike);
    armV.addColorStop(0, `rgba(${glowRgb}, 0)`);
    armV.addColorStop(0.5, `rgba(${glowRgb}, 0.6)`);
    armV.addColorStop(1, `rgba(${glowRgb}, 0)`);
    ctx.fillStyle = armV;
    ctx.fillRect(x - 0.75, y - spike, 1.5, spike * 2);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // 星座中心落在窗洞左中区域（月亮在右上），比例：ORION_S 像素 / 度
  const ORION_CX = w * 0.4;
  const ORION_CY = h * 0.555;
  const ORION_S = 17;
  const orionX = (e: number) => ORION_CX - e * ORION_S;
  const orionY = (d: number) => ORION_CY - d * ORION_S;
  // [东向偏移(度), 赤纬偏移(度), 半径, 核色, 光晕 rgb]
  const orionStars: [number, number, number, string, string][] = [
    [5.0, 7.4, 3.6, "#ffb178", "255, 176, 120"], // 参宿四 Betelgeuse（红橙）
    [-2.5, 6.3, 2.4, "#dce8ff", "205, 222, 255"], // 参宿五 Bellatrix
    [0.0, 9.9, 1.7, "#e4edff", "215, 228, 255"], // 头部 Meissa
    [1.5, -1.9, 2.4, "#d3e2ff", "205, 222, 255"], // 参宿一 Alnitak
    [0.25, -1.2, 2.6, "#d3e2ff", "205, 222, 255"], // 参宿二 Alnilam
    [-1.0, -0.3, 2.2, "#d3e2ff", "205, 222, 255"], // 参宿三 Mintaka
    [3.25, -9.7, 2.2, "#d9e6ff", "210, 226, 255"], // 参宿六 Saiph
    [-5.25, -8.2, 3.3, "#d7ecff", "200, 228, 255"] // 参宿七 Rigel（蓝白）
  ];
  // 猎户座大星云 M42：剑柄处的粉紫色云斑
  const nx = orionX(0.5);
  const ny = orionY(-5.4);
  const neb = ctx.createRadialGradient(nx, ny, 0, nx, ny, 16);
  neb.addColorStop(0, "rgba(255, 190, 205, 0.4)");
  neb.addColorStop(0.5, "rgba(214, 178, 255, 0.22)");
  neb.addColorStop(1, "rgba(214, 178, 255, 0)");
  ctx.fillStyle = neb;
  ctx.fillRect(nx - 16, ny - 16, 32, 32);
  // 剑柄三小星
  for (const [se, sd, sr] of [
    [0.3, -4.6, 1.0],
    [0.5, -5.4, 1.1],
    [0.7, -6.2, 0.9]
  ] as const) {
    ctx.fillStyle = "#e8f0ff";
    ctx.beginPath();
    ctx.arc(orionX(se), orionY(sd), sr, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [e, d, r, core, glow] of orionStars) {
    drawBrightStar(orionX(e), orionY(d), r, core, glow);
  }

  // ── 月亮：贴近真实满月——灰白月面、按真实分布的月海
  //    （雨海/澄海/静海/危海/丰富海/风暴洋/云海）、带亮环的环形山、
  //    第谷环形山的辐射纹与细颗粒斑驳 ──
  const mx = w * 0.67;
  const my = h * 0.427;
  const mr = 56;
  for (const [gr, ga] of [
    [mr * 4.6, 0.04],
    [mr * 2.6, 0.08],
    [mr * 1.4, 0.16]
  ] as const) {
    const halo = ctx.createRadialGradient(mx, my, mr * 0.7, mx, my, gr);
    halo.addColorStop(0, `rgba(230, 232, 226, ${ga})`);
    halo.addColorStop(1, "rgba(230, 232, 226, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(mx - gr, my - gr, gr * 2, gr * 2);
  }
  // 月盘底色：真实月面偏冷灰白，中心亮、临边微暗（limb darkening）
  const disc = ctx.createRadialGradient(mx, my, mr * 0.2, mx, my, mr);
  disc.addColorStop(0, "#e8e6df");
  disc.addColorStop(0.72, "#dedbd2");
  disc.addColorStop(0.93, "#cfccc1");
  disc.addColorStop(1, "#b8b5a9");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.clip();
  /** 软边暗斑（月海用）：中心实、边缘散 */
  const mare = (ox: number, oy: number, rr: number, alpha: number, sx = 1, sy = 1, rot = 0) => {
    ctx.save();
    ctx.translate(mx + ox * mr, my + oy * mr);
    ctx.rotate(rot);
    ctx.scale(sx, sy);
    const spot = ctx.createRadialGradient(0, 0, rr * mr * 0.25, 0, 0, rr * mr);
    spot.addColorStop(0, `rgba(106, 110, 116, ${alpha})`);
    spot.addColorStop(0.75, `rgba(106, 110, 116, ${alpha * 0.55})`);
    spot.addColorStop(1, "rgba(106, 110, 116, 0)");
    ctx.fillStyle = spot;
    ctx.fillRect(-rr * mr, -rr * mr, rr * mr * 2, rr * mr * 2);
    ctx.restore();
  };
  // 真实月海布局（满月正面观）：左上雨海、上中澄海、中偏右静海+丰富海、
  // 右缘危海、左侧大片风暴洋、下方云海/湿海
  mare(-0.28, -0.32, 0.34, 0.34, 1.15, 1, 0.2); // 雨海 Mare Imbrium
  mare(0.08, -0.35, 0.22, 0.32, 1, 1.2, -0.3); // 澄海 Mare Serenitatis
  mare(0.3, -0.1, 0.22, 0.3, 1.1, 1, 0.4); // 静海 Mare Tranquillitatis
  mare(0.52, 0.08, 0.16, 0.28, 1, 1.15, 0); // 丰富海 Mare Fecunditatis
  mare(0.72, -0.28, 0.13, 0.34, 1.2, 1, 0); // 危海 Mare Crisium
  mare(-0.55, -0.02, 0.3, 0.26, 1, 1.5, 0.15); // 风暴洋 Oceanus Procellarum
  mare(-0.2, 0.32, 0.16, 0.24, 1.3, 1, 0); // 云海 Mare Nubium
  mare(-0.42, 0.42, 0.11, 0.24, 1, 1, 0); // 湿海 Mare Humorum
  /** 环形山：暗色山底 + 偏光源侧的亮环边 */
  const crater = (ox: number, oy: number, rr: number, depth: number) => {
    const cx = mx + ox * mr;
    const cy = my + oy * mr;
    const cr = rr * mr;
    const floor = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    floor.addColorStop(0, `rgba(116, 118, 120, ${depth})`);
    floor.addColorStop(0.8, `rgba(116, 118, 120, ${depth * 0.5})`);
    floor.addColorStop(1, "rgba(116, 118, 120, 0)");
    ctx.fillStyle = floor;
    ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
    ctx.strokeStyle = `rgba(248, 247, 240, ${depth * 0.9})`;
    ctx.lineWidth = Math.max(1, cr * 0.16);
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 0.82, -2.6, 0.6);
    ctx.stroke();
  };
  // 第谷环形山（下方偏左）：亮心 + 向四周的辐射纹
  const tx = mx - 0.12 * mr;
  const ty = my + 0.62 * mr;
  ctx.save();
  ctx.strokeStyle = "rgba(240, 240, 232, 0.16)";
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 13; i += 1) {
    const a = (i / 13) * Math.PI * 2 + 0.25;
    const len = mr * (0.45 + rand() * 0.55);
    ctx.beginPath();
    ctx.moveTo(tx + Math.cos(a) * mr * 0.06, ty + Math.sin(a) * mr * 0.06);
    ctx.lineTo(tx + Math.cos(a) * len, ty + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();
  const tycho = ctx.createRadialGradient(tx, ty, 0, tx, ty, mr * 0.1);
  tycho.addColorStop(0, "rgba(250, 250, 244, 0.85)");
  tycho.addColorStop(1, "rgba(250, 250, 244, 0)");
  ctx.fillStyle = tycho;
  ctx.fillRect(tx - mr * 0.1, ty - mr * 0.1, mr * 0.2, mr * 0.2);
  // 哥白尼（风暴洋中的亮点）+ 开普勒 + 若干中小环形山
  crater(-0.38, -0.06, 0.075, 0.3); // Copernicus
  crater(-0.62, 0.1, 0.05, 0.26); // Kepler
  crater(0.1, 0.55, 0.06, 0.24);
  crater(0.4, 0.42, 0.05, 0.22);
  crater(-0.05, -0.68, 0.05, 0.2); // Plato 一带
  crater(0.62, -0.55, 0.045, 0.2);
  crater(-0.72, 0.4, 0.04, 0.2);
  // 高地细颗粒斑驳：细碎明暗噪点让月面不再"光滑塑料"
  for (let i = 0; i < 190; i += 1) {
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * mr * 0.96;
    const px = mx + Math.cos(a) * rr;
    const py = my + Math.sin(a) * rr;
    const pr = 0.7 + rand() * 2.4;
    const lightSpot = rand() > 0.45;
    ctx.fillStyle = lightSpot
      ? `rgba(246, 245, 238, ${0.05 + rand() * 0.08})`
      : `rgba(112, 114, 118, ${0.05 + rand() * 0.07})`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  // 临边整体减光收边，增强球体感
  const rim = ctx.createRadialGradient(mx, my, mr * 0.78, mx, my, mr);
  rim.addColorStop(0, "rgba(30, 34, 48, 0)");
  rim.addColorStop(1, "rgba(30, 34, 48, 0.22)");
  ctx.fillStyle = rim;
  ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  ctx.restore();
}

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
      {/* 旅行图钉：去过 / 想去的地方 */}
      {[
        { x: 0.28, y: 0.13, color: "#e2493b" },
        { x: -0.5, y: 0.11, color: "#e8b83a" },
        { x: 0.02, y: 0.04, color: "#3a7bd5" }
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

export function RoomShell() {
  const dark = useSiteStore((state) => state.theme === "dark");

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

  // 夜空 CanvasTexture：银河带 + 星野 + 亮星衍射芒 + 月亮，随主题重绘
  const skyTexture = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = SKY_W;
    cv.height = SKY_H;
    const ctx = cv.getContext("2d");
    if (ctx) paintNightSky(ctx, dark);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [dark]);

  useEffect(() => () => skyTexture.dispose(), [skyTexture]);

  // 窗帘褶皱的束腰纺锤旋成体：顶部展开 → 腰部（y≈1.62）收紧 → 下摆散开
  const foldGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0.02, 1.02),
      new THREE.Vector2(0.13, 1.12),
      new THREE.Vector2(0.15, 1.4),
      new THREE.Vector2(0.105, 1.62),
      new THREE.Vector2(0.14, 2.0),
      new THREE.Vector2(0.15, 2.6),
      new THREE.Vector2(0.14, 3.1),
      new THREE.Vector2(0.1, 3.3),
      new THREE.Vector2(0.02, 3.36)
    ];
    // y 从底部往上：先建轮廓再旋转成体
    const geo = new THREE.LatheGeometry(pts, 14);
    return geo;
  }, []);

  useEffect(() => () => foldGeo.dispose(), [foldGeo]);

  // 墙面淡蓝色调：白天是雾霭蓝，夜晚是安静的灰蓝，与木质家具冷暖对比
  const wall = dark ? "#33435c" : "#b9cede";
  const wallSide = dark ? "#2a3850" : "#a6bfd3";
  const trim = dark ? "#c7b394" : "#e8d9bd";
  const frameWood = dark ? "#6d543c" : "#7c6248";
  const curtain = dark ? "#5f4436" : "#8a6350";
  const curtainFold = dark ? "#523a2e" : "#7c5846";
  const curtainLight = dark ? "#6e5040" : "#9a715c";
  const curtainBand = dark ? "#8a6a4a" : "#b08a5e";

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

      {/* 后墙：中央开夜景大窗（洞口 x -1.1..1.5, y 1.05..3.15） */}
      <mesh position={[-2.2, 2.05, -3.26]} receiveShadow>
        <boxGeometry args={[2.2, 4.32, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[3.05, 2.05, -3.26]} receiveShadow>
        <boxGeometry args={[3.1, 4.32, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0.2, 0.47, -3.26]} receiveShadow>
        <boxGeometry args={[2.6, 1.16, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0.2, 3.68, -3.26]} receiveShadow>
        <boxGeometry args={[2.6, 1.06, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      {/* 左侧墙 */}
      <mesh position={[-3.26, 2.05, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.32, 6.6]} />
        <meshStandardMaterial color={wallSide} roughness={0.92} />
      </mesh>

      {/* 窗外夜空：一整张手绘 CanvasTexture（银河 / 星野 / 亮星 / 月亮） */}
      <mesh position={[0.2, 2.4, -4.5]}>
        <planeGeometry args={[5.6, 5.2]} />
        <meshBasicMaterial map={skyTexture} toneMapped={false} />
      </mesh>

      {/* 窗框 */}
      <mesh position={[0.2, 3.195, -3.22]} castShadow>
        <boxGeometry args={[2.78, 0.09, 0.1]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 1.005, -3.22]} castShadow>
        <boxGeometry args={[2.78, 0.09, 0.1]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      <mesh position={[-1.145, 2.1, -3.22]} castShadow>
        <boxGeometry args={[0.09, 2.28, 0.1]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      <mesh position={[1.545, 2.1, -3.22]} castShadow>
        <boxGeometry args={[0.09, 2.28, 0.1]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      {/* 窗棂：十字分四格 */}
      <mesh position={[0.2, 2.1, -3.22]}>
        <boxGeometry args={[0.045, 2.1, 0.06]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 2.1, -3.22]}>
        <boxGeometry args={[2.6, 0.045, 0.06]} />
        <meshStandardMaterial color={frameWood} roughness={0.55} />
      </mesh>
      {/* 窗台 */}
      <mesh position={[0.2, 1.0, -3.13]} castShadow receiveShadow>
        <boxGeometry args={[2.95, 0.06, 0.22]} />
        <meshStandardMaterial color={trim} roughness={0.5} />
      </mesh>
      {/* 玻璃 */}
      <mesh position={[0.2, 2.1, -3.255]}>
        <planeGeometry args={[2.58, 2.08]} />
        <meshStandardMaterial
          color="#a8c2e8"
          transparent
          opacity={0.07}
          roughness={0.05}
          metalness={0.4}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* 窗帘杆（带端头球）与两侧束起的窗帘 */}
      <mesh position={[0.2, 3.42, -3.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 3.5, 12]} />
        <meshStandardMaterial color="#3a3126" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1.58, 1.98].map((x) => (
        <mesh key={x} position={[x, 3.42, -3.06]}>
          <sphereGeometry args={[0.045, 14, 12]} />
          <meshStandardMaterial color="#3a3126" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {[-1.36, 1.76].map((cx, side) => (
        <group key={cx} position={[cx, 0, -3.05]}>
          {/* 布幔褶皱：束腰纺锤形（顶部展开、腰部被绑带收紧、下摆散开），深浅交替 */}
          {FOLDS.map(({ dx, dz, s, tone }, i) => (
            <mesh key={i} geometry={foldGeo} position={[dx, 0, dz]} scale={[s, 1, s]} castShadow>
              <meshStandardMaterial color={tone === 0 ? curtain : tone === 1 ? curtainFold : curtainLight} roughness={0.88} />
            </mesh>
          ))}
          {/* 布质绑带（束腰） */}
          <mesh position={[0, 1.62, 0.012]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.135, 0.026, 10, 22]} />
            <meshStandardMaterial color={curtainBand} roughness={0.8} />
          </mesh>
          {/* 挂环：杆上一串金属圆环 */}
          {[-0.16, -0.08, 0, 0.08, 0.16].map((rx) => (
            <mesh key={rx} position={[rx, 3.41, -0.01]} rotation={[0, 0.25, 0]}>
              <torusGeometry args={[0.034, 0.006, 8, 16]} />
              <meshStandardMaterial color="#4a3e2e" metalness={0.55} roughness={0.35} />
            </mesh>
          ))}
          {/* 环与幔之间的褶皱吊头 */}
          {[-0.16, -0.08, 0, 0.08, 0.16].map((rx) => (
            <mesh key={rx} position={[rx, 3.33, 0]} rotation={[0, 0, rx * 0.4]}>
              <coneGeometry args={[0.028, 0.1, 8]} />
              <meshStandardMaterial color={curtainFold} roughness={0.88} />
            </mesh>
          ))}
        </group>
      ))}

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

      {/* 窗边月光冷点光 */}
      <pointLight position={[0.2, 2.35, -2.85]} intensity={dark ? 0.75 : 0.42} color="#a9bfe8" distance={4.5} />
    </group>
  );
}
