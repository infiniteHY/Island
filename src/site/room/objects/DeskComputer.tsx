import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";
import { createSnake, stepSnake, turnSnake, type SnakeState } from "../games/snake";

const SCREEN_W = 320;
const SCREEN_H = 240;
const GRID_COLS = 20;
const GRID_ROWS = 14;
/** 网格绘制区（留出边框与顶部记分栏） */
const GRID_X = 10;
const GRID_Y = 28;
const CELL = 15;

const KEY_DIRS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 }
};

/**
 * 键盘 60% 真实配列：每行按 1u 键宽描述，
 * 含双倍宽 Backspace、Tab/Caps/Enter/Shift 与 6.25u 空格，总宽 15u。
 */
const KEY_ROWS: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]
];
/** 1u 键距（米） */
const KEY_U = 0.0385;

function drawScreen(ctx: CanvasRenderingContext2D, game: SnakeState, active: boolean) {
  // 底色 + 顶部扫描线质感
  ctx.fillStyle = "#0a140c";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = "rgba(120, 220, 120, 0.05)";
  for (let y = 0; y < SCREEN_H; y += 4) ctx.fillRect(0, y, SCREEN_W, 1);

  if (!active) {
    ctx.fillStyle = "#9fe870";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SNAKE.EXE", SCREEN_W / 2, 108);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#5f9c4e";
    ctx.fillText("PRESS TO PLAY", SCREEN_W / 2, 140);
    return;
  }

  // 记分栏
  ctx.textAlign = "left";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#9fe870";
  ctx.fillText(`SCORE ${game.score}`, GRID_X, 18);
  ctx.textAlign = "right";
  ctx.fillStyle = "#5f9c4e";
  ctx.fillText("SNAKE.EXE", SCREEN_W - GRID_X, 18);

  // 边框
  ctx.strokeStyle = "#3f6b34";
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X - 3, GRID_Y - 3, GRID_COLS * CELL + 6, GRID_ROWS * CELL + 6);

  // 食物（小圆点）
  ctx.fillStyle = "#ffb454";
  ctx.beginPath();
  ctx.arc(GRID_X + game.food.x * CELL + CELL / 2, GRID_Y + game.food.y * CELL + CELL / 2, CELL * 0.34, 0, Math.PI * 2);
  ctx.fill();

  // 蛇：头亮尾暗
  game.snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#c0fe74" : i % 2 === 0 ? "#7ecb52" : "#6ab946";
    ctx.fillRect(GRID_X + seg.x * CELL + 1, GRID_Y + seg.y * CELL + 1, CELL - 2, CELL - 2);
  });

  ctx.textAlign = "center";
  if (game.status === "ready") {
    ctx.fillStyle = "rgba(10, 20, 12, 0.6)";
    ctx.fillRect(0, 96, SCREEN_W, 56);
    ctx.fillStyle = "#c0fe74";
    ctx.font = "bold 15px monospace";
    ctx.fillText("方向键 / WASD 开始", SCREEN_W / 2, 128);
  } else if (game.status === "over") {
    ctx.fillStyle = "rgba(10, 20, 12, 0.72)";
    ctx.fillRect(0, 84, SCREEN_W, 80);
    ctx.fillStyle = "#ff8a5c";
    ctx.font = "bold 20px monospace";
    ctx.fillText("GAME OVER", SCREEN_W / 2, 116);
    ctx.fillStyle = "#9fe870";
    ctx.font = "13px monospace";
    ctx.fillText("按任意方向键重来", SCREEN_W / 2, 142);
  }
}

/**
 * 复古台式电脑：米色 CRT 显示器（深机身/散热格栅/电源灯）+ 主机键盘 + 鼠标。
 * 聚焦后屏幕上直接运行可玩的贪吃蛇（CanvasTexture + 键盘输入）。
 * 落在书桌台面（y=0.88）上，屏幕中心约在 y≈1.3。
 */
export function DeskComputer() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "computer";

  const gameRef = useRef<SnakeState>(createSnake(GRID_COLS, GRID_ROWS));
  const accumRef = useRef(0);

  const { ctx, texture } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = SCREEN_W;
    cv.height = SCREEN_H;
    const context = cv.getContext("2d");
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return { ctx: context, texture: tex };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  // 聚焦时接管方向键；退出聚焦时重置游戏
  useEffect(() => {
    if (!active) {
      gameRef.current = createSnake(GRID_COLS, GRID_ROWS);
      accumRef.current = 0;
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      const dir = KEY_DIRS[event.code];
      if (!dir) return;
      event.preventDefault();
      if (gameRef.current.status === "over") {
        gameRef.current = createSnake(GRID_COLS, GRID_ROWS);
        accumRef.current = 0;
      }
      turnSnake(gameRef.current, dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // 游戏循环 + 画面刷新
  useFrame((_, delta) => {
    if (!ctx) return;
    const game = gameRef.current;
    if (active && game.status === "running") {
      accumRef.current += delta * 1000;
      while (accumRef.current >= game.stepMs) {
        accumRef.current -= game.stepMs;
        stepSnake(game);
      }
    }
    drawScreen(ctx, game, active);
    texture.needsUpdate = true;
  });

  return (
    <group
      position={[-1.95, 0.88, -2.2]}
      rotation={[0, 0.06, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("computer");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("computer");
      }}
    >
      {/* 显示器底座：双层圆角底盘 + 深色接缝的旋转转盘 + 支撑颈 + 前缘倾角钮 */}
      <mesh position={[0, 0.02, 0.06]} castShadow>
        <boxGeometry args={[0.44, 0.04, 0.36]} />
        <meshStandardMaterial color="#d9d2bf" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.048, 0.05]} castShadow>
        <boxGeometry args={[0.36, 0.022, 0.3]} />
        <meshStandardMaterial color="#cfc8b4" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.064, 0.02]}>
        <cylinderGeometry args={[0.135, 0.145, 0.014, 24]} />
        <meshStandardMaterial color="#8f8875" roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.09, 0.02]}>
        <cylinderGeometry args={[0.1, 0.125, 0.06, 20]} />
        <meshStandardMaterial color="#cfc8b4" roughness={0.62} />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.014, 12]} />
          <meshStandardMaterial color="#a89f88" roughness={0.55} />
        </mesh>
      ))}

      {/* CRT 机身：前壳 + 向后收窄的深机身 */}
      <group position={[0, 0.42, 0]}>
        <mesh position={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[0.64, 0.52, 0.1]} />
          <meshStandardMaterial color="#ddd5c2" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, -0.14]} castShadow>
          <boxGeometry args={[0.54, 0.44, 0.38]} />
          <meshStandardMaterial color="#cfc7b2" roughness={0.62} />
        </mesh>
        {/* 机身散热格栅 */}
        {[-0.08, -0.04, 0, 0.04, 0.08].map((y) => (
          <mesh key={y} position={[0, y + 0.02, -0.335]}>
            <boxGeometry args={[0.4, 0.012, 0.006]} />
            <meshStandardMaterial color="#b5ad98" roughness={0.7} />
          </mesh>
        ))}
        {/* 屏幕内凹槽 + 游戏画面 */}
        <mesh position={[0, 0.015, 0.148]}>
          <boxGeometry args={[0.52, 0.4, 0.012]} />
          <meshStandardMaterial color="#2a2d2a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.015, 0.156]}>
          <planeGeometry args={[0.48, 0.36]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {/* 屏幕微光溢出 */}
        <pointLight position={[0, 0.02, 0.4]} intensity={active ? 0.7 : 0.28} color="#a8e063" distance={1.4} />
        {/* 前面板：电源灯 + 品牌槽 */}
        <mesh position={[0.24, -0.215, 0.152]}>
          <circleGeometry args={[0.012, 10]} />
          <meshBasicMaterial color={active ? "#7CFC00" : "#3f7a2e"} />
        </mesh>
        <mesh position={[-0.18, -0.215, 0.152]}>
          <boxGeometry args={[0.12, 0.016, 0.006]} />
          <meshStandardMaterial color="#8f8a78" roughness={0.6} />
        </mesh>
      </group>

      {/* 键盘：真实 60% 配列——楔形壳（后高前低）+ 五行按 1u 键宽排布的键帽
          （宽 Backspace/Tab/Caps/Enter/Shift、6.25u 空格），键帽上窄下宽微倒角 */}
      <group position={[0.02, 0.028, 0.26]} rotation={[0.055, -0.02, 0]}>
        {/* 壳体：底板 + 后高前低的斜面上盖 */}
        <mesh castShadow>
          <boxGeometry args={[0.615, 0.03, 0.235]} />
          <meshStandardMaterial color="#d5cdb8" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.02, -0.006]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.615, 0.014, 0.223]} />
          <meshStandardMaterial color="#cbc2ab" roughness={0.62} />
        </mesh>
        {/* 键床内凹槽 */}
        <mesh position={[0, 0.027, -0.004]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.59, 0.004, 0.202]} />
          <meshStandardMaterial color="#9a9179" roughness={0.75} />
        </mesh>
        {/* 五行键帽：沿真实配列排布，行随斜面渐低，修饰键深色 */}
        <group position={[0, 0.036, -0.004]} rotation={[0.05, 0, 0]}>
          {KEY_ROWS.map((row, r) => {
            const z = -0.077 + r * KEY_U;
            let cursor = -7.5; // 单位：u，左缘起排
            return row.map((u, k) => {
              const x = (cursor + u / 2) * KEY_U;
              cursor += u;
              const modifier = u > 1.1 && !(r === 4 && u > 3);
              const space = r === 4 && u > 3;
              return (
                <group key={`${r}-${k}`} position={[x, 0, z]}>
                  {/* 键帽：上窄下宽的截锥感（底座 + 略小的顶面） */}
                  <mesh castShadow>
                    <boxGeometry args={[u * KEY_U - 0.005, 0.012, KEY_U - 0.006]} />
                    <meshStandardMaterial color={modifier ? "#a89e84" : space ? "#cfc6ae" : "#ded5bd"} roughness={0.55} />
                  </mesh>
                  <mesh position={[0, 0.0075, -0.0015]}>
                    <boxGeometry args={[u * KEY_U - 0.011, 0.004, KEY_U - 0.013]} />
                    <meshStandardMaterial color={modifier ? "#b3a98e" : space ? "#d8cfb6" : "#e7dec6"} roughness={0.5} />
                  </mesh>
                </group>
              );
            });
          })}
        </group>
        {/* 右上角状态灯 */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.24 + i * 0.02, 0.03, -0.099]}>
            <boxGeometry args={[0.009, 0.004, 0.006]} />
            <meshBasicMaterial color={i === 0 ? "#8fce6a" : "#5a5648"} />
          </mesh>
        ))}
      </group>

      {/* 鼠标：真实轮廓——胶囊压扁成蛋形壳、前端斜削出左右键面、
          中缝嵌滚轮、侧腰内收、底盘贴桌（无线） */}
      <group position={[0.42, 0.012, 0.28]} rotation={[0, -0.35, 0]}>
        {/* 主壳：蛋形（后饱满前收窄压低） */}
        <mesh position={[0, 0.02, 0.005]} scale={[0.62, 0.42, 1]} castShadow>
          <sphereGeometry args={[0.058, 24, 18]} />
          <meshStandardMaterial color="#d9d2bf" roughness={0.42} />
        </mesh>
        {/* 前段键面：微下削的第二层椭球，形成按键斜面 */}
        <mesh position={[0, 0.014, -0.028]} scale={[0.58, 0.32, 0.72]} castShadow>
          <sphereGeometry args={[0.052, 20, 14]} />
          <meshStandardMaterial color="#d4cdb9" roughness={0.45} />
        </mesh>
        {/* 侧腰：两侧深色防滑内收带（藏进壳内，只露出窄条） */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.022, 0.01, 0.008]} scale={[0.26, 0.24, 0.7]}>
            <sphereGeometry args={[0.05, 14, 10]} />
            <meshStandardMaterial color="#aaa28c" roughness={0.7} />
          </mesh>
        ))}
        {/* 左右键中缝（沿前段曲面） */}
        <mesh position={[0, 0.02, -0.045]} rotation={[-0.55, 0, 0]}>
          <boxGeometry args={[0.0016, 0.003, 0.04]} />
          <meshStandardMaterial color="#857e6b" roughness={0.7} />
        </mesh>
        {/* 键尾横缝：左右键与掌托的分界 */}
        <mesh position={[0, 0.0295, -0.008]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.052, 0.0024, 0.0014]} />
          <meshStandardMaterial color="#857e6b" roughness={0.7} />
        </mesh>
        {/* 滚轮：嵌入键面缝隙，只露出窄窄一弧 */}
        <mesh position={[0, 0.0235, -0.032]} rotation={[0.3, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.009, 0.009, 0.006, 16]} />
          <meshStandardMaterial color="#4e4a3f" roughness={0.65} />
        </mesh>
        {/* 底盘 */}
        <mesh position={[0, 0.003, 0.002]} scale={[0.6, 1, 0.96]}>
          <cylinderGeometry args={[0.055, 0.058, 0.006, 20]} />
          <meshStandardMaterial color="#b5ad98" roughness={0.6} />
        </mesh>
      </group>

      <RoomObjectLabel id="computer" position={[0, 0.95, 0.2]} />
    </group>
  );
}
