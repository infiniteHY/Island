import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";
import { createBreakout, launchBreakout, movePaddle, nextLevel, stepBreakout, type BreakoutState } from "../games/breakout";

const SCREEN_W = 320;
const SCREEN_H = 180;
/** 砖块行高（与 breakout.ts 的 h + gap 对应），用于按行取色 */
const BRICK_ROW = 0.057;
const BRICK_COLORS = ["#f0554e", "#ffb454", "#ffe66d", "#7ecb52", "#12b3d6"];
const PADDLE_SPEED = 1.15;

/** 真机配色 */
const NEON_BLUE = "#0ab9e6";
const NEON_RED = "#ff3c28";
const BODY_DARK = "#2d2d2f";
const BUTTON_DARK = "#1f1f22";

function drawScreen(ctx: CanvasRenderingContext2D, game: BreakoutState, active: boolean) {
  ctx.fillStyle = "#0c0f16";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = "rgba(140, 190, 255, 0.04)";
  for (let y = 0; y < SCREEN_H; y += 4) ctx.fillRect(0, y, SCREEN_W, 1);

  if (!active) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#f0554e";
    ctx.font = "bold 24px monospace";
    ctx.fillText("BREAKOUT", SCREEN_W / 2, 84);
    ctx.fillStyle = "#5a80a8";
    ctx.font = "12px monospace";
    ctx.fillText("PRESS TO PLAY", SCREEN_W / 2, 110);
    return;
  }

  // 顶部记分栏
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#9fc6e8";
  ctx.fillText(`SCORE ${game.score}`, 8, 11);
  ctx.textAlign = "center";
  ctx.fillStyle = "#5a80a8";
  ctx.fillText(`LV ${game.level}`, SCREEN_W / 2, 11);
  ctx.textAlign = "right";
  ctx.fillStyle = "#f0554e";
  ctx.fillText("♥".repeat(Math.max(0, game.lives)), SCREEN_W - 8, 11);

  // 砖块（按行取色，双血砖亮红）
  for (const brick of game.bricks) {
    if (brick.hp <= 0) continue;
    const row = Math.round((brick.y - 0.08) / BRICK_ROW);
    ctx.fillStyle = brick.hp >= 2 ? "#f0554e" : BRICK_COLORS[((row % 5) + 5) % 5];
    ctx.fillRect(brick.x * SCREEN_W, brick.y * SCREEN_H, brick.w * SCREEN_W - 1, brick.h * SCREEN_H - 1);
  }

  // 挡板 + 球
  ctx.fillStyle = "#e8e6df";
  const pw = game.paddleW * SCREEN_W;
  ctx.fillRect(game.paddleX * SCREEN_W - pw / 2, 0.94 * SCREEN_H, pw, 5);
  ctx.beginPath();
  ctx.arc(game.ball.x * SCREEN_W, game.ball.y * SCREEN_H, 0.014 * SCREEN_W, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  if (game.status === "ready") {
    ctx.fillStyle = "rgba(12, 15, 22, 0.65)";
    ctx.fillRect(0, 118, SCREEN_W, 34);
    ctx.fillStyle = "#9fc6e8";
    ctx.font = "bold 12px monospace";
    ctx.fillText("← → 发球 · 鼠标移挡板", SCREEN_W / 2, 139);
  } else if (game.status === "over") {
    ctx.fillStyle = "rgba(12, 15, 22, 0.75)";
    ctx.fillRect(0, 62, SCREEN_W, 56);
    ctx.fillStyle = "#f0554e";
    ctx.font = "bold 18px monospace";
    ctx.fillText("GAME OVER", SCREEN_W / 2, 88);
    ctx.fillStyle = "#9fc6e8";
    ctx.font = "11px monospace";
    ctx.fillText("按 ← → 重来", SCREEN_W / 2, 108);
  } else if (game.status === "cleared") {
    ctx.fillStyle = "rgba(12, 15, 22, 0.75)";
    ctx.fillRect(0, 62, SCREEN_W, 56);
    ctx.fillStyle = "#7ecb52";
    ctx.font = "bold 18px monospace";
    ctx.fillText("LEVEL CLEAR!", SCREEN_W / 2, 88);
    ctx.fillStyle = "#9fc6e8";
    ctx.font = "11px monospace";
    ctx.fillText("按 ← → 下一关", SCREEN_W / 2, 108);
  }
}

/** 四角可独立设圆角半径的圆角矩形（中心在原点） */
function roundedRect(w: number, h: number, tl: number, tr: number, br: number, bl: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + bl, y);
  shape.lineTo(x + w - br, y);
  shape.absarc(x + w - br, y + br, br, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - tr);
  shape.absarc(x + w - tr, y + h - tr, tr, 0, Math.PI / 2, false);
  shape.lineTo(x + tl, y + h);
  shape.absarc(x + tl, y + h - tl, tl, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + bl);
  shape.absarc(x + bl, y + bl, bl, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function extrudeCentered(shape: THREE.Shape, depth: number) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 3,
    curveSegments: 20
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/**
 * Nintendo Switch：真机比例（239:102）与电光蓝 / 电光红配色。
 * 圆角挤出成型的平板与 Joy-Con（外缘大圆弧、内缘直边贴合），
 * 玻璃黑边框 + 16:9 屏幕、电源键 / 音量键 / 卡带槽、背面支架。
 * 聚焦后屏幕上直接运行可玩的打砖块（← → / A D 或鼠标控制挡板）。
 */
export function RetroConsole() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "console";

  const gameRef = useRef<BreakoutState>(createBreakout(1));
  const heldRef = useRef({ left: false, right: false });

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

  /** 平板 + 左右 Joy-Con 的挤出几何体（外缘半径≈半宽，内缘近直角） */
  const { tabletGeo, joyLGeo, joyRGeo } = useMemo(() => {
    const tablet = extrudeCentered(roundedRect(0.38, 0.22, 0.014, 0.014, 0.014, 0.014), 0.024);
    const joyL = extrudeCentered(roundedRect(0.082, 0.22, 0.04, 0.008, 0.008, 0.04), 0.028);
    const joyR = extrudeCentered(roundedRect(0.082, 0.22, 0.008, 0.04, 0.04, 0.008), 0.028);
    return { tabletGeo: tablet, joyLGeo: joyL, joyRGeo: joyR };
  }, []);

  useEffect(
    () => () => {
      texture.dispose();
      tabletGeo.dispose();
      joyLGeo.dispose();
      joyRGeo.dispose();
    },
    [texture, tabletGeo, joyLGeo, joyRGeo]
  );

  // 聚焦时接管键盘 + 鼠标；退出聚焦时重置游戏
  useEffect(() => {
    if (!active) {
      gameRef.current = createBreakout(1);
      heldRef.current = { left: false, right: false };
      return undefined;
    }
    const dirOf = (code: string) =>
      code === "ArrowLeft" || code === "KeyA" ? "left" : code === "ArrowRight" || code === "KeyD" ? "right" : null;
    const onKeyDown = (event: KeyboardEvent) => {
      const dir = dirOf(event.code);
      if (!dir) return;
      event.preventDefault();
      const game = gameRef.current;
      if (game.status === "over") gameRef.current = createBreakout(1);
      else if (game.status === "cleared") gameRef.current = nextLevel(game);
      heldRef.current[dir] = true;
      // 轻点一下（keydown/keyup 间可能没有渲染帧）也要能发球
      launchBreakout(gameRef.current);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const dir = dirOf(event.code);
      if (dir) heldRef.current[dir] = false;
    };
    // 鼠标横移映射到挡板（不发球，发球用方向键）
    const onMove = (event: PointerEvent) => {
      const game = gameRef.current;
      if (game.status === "over" || game.status === "cleared") return;
      const nx = (event.clientX / window.innerWidth - 0.5) * 1.8 + 0.5;
      const wasReady = game.status === "ready";
      movePaddle(game, nx);
      if (wasReady) game.status = "ready";
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, [active]);

  // 游戏循环 + 画面刷新
  useFrame((_, delta) => {
    if (!ctx) return;
    const game = gameRef.current;
    if (active) {
      const dir = (heldRef.current.right ? 1 : 0) - (heldRef.current.left ? 1 : 0);
      if (dir !== 0) movePaddle(game, game.paddleX + dir * PADDLE_SPEED * delta);
      stepBreakout(game, Math.min(delta, 0.05));
    }
    drawScreen(ctx, game, active);
    texture.needsUpdate = true;
  });

  return (
    <group
      position={[-0.85, 0.965, -2.0]}
      rotation={[-0.32, 0.22, 0]}
      scale={0.6}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("console");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("console");
      }}
    >
      {/* 中央平板：深灰圆角机身 + 玻璃黑边框 + 16:9 屏幕 */}
      <mesh geometry={tabletGeo} castShadow receiveShadow>
        <meshStandardMaterial color={BODY_DARK} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.0165]}>
        <planeGeometry args={[0.352, 0.198]} />
        <meshStandardMaterial color="#08090c" roughness={0.15} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.0175]}>
        <planeGeometry args={[0.312, 0.1755]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* 屏幕微光溢出 */}
      <pointLight position={[0, 0.05, 0.35]} intensity={active ? 0.55 : 0.18} color="#8fb6e0" distance={1.1} />
      {/* 顶部：电源键（圆柱）+ 音量键（长条）+ 卡带槽盖 + 散热口 */}
      <mesh position={[-0.14, 0.115, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.008, 10]} />
        <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[-0.1, 0.116, 0]}>
        <boxGeometry args={[0.034, 0.006, 0.008]} />
        <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0.12, 0.114, 0.002]}>
        <boxGeometry args={[0.03, 0.005, 0.014]} />
        <meshStandardMaterial color="#232326" roughness={0.55} />
      </mesh>
      {[-0.02, 0, 0.02].map((x) => (
        <mesh key={x} position={[0.04 + x, 0.115, 0]}>
          <boxGeometry args={[0.012, 0.004, 0.01]} />
          <meshStandardMaterial color="#141416" roughness={0.7} />
        </mesh>
      ))}
      {/* 背面可折叠支架（撑起整机） */}
      <mesh position={[0.12, -0.055, -0.055]} rotation={[0.62, 0, 0]} castShadow>
        <boxGeometry args={[0.075, 0.19, 0.005]} />
        <meshStandardMaterial color="#232326" roughness={0.5} />
      </mesh>

      {/* ── 左 Joy-Con（电光蓝）── */}
      <group position={[-0.231, 0, 0]}>
        <mesh geometry={joyLGeo} castShadow receiveShadow>
          <meshStandardMaterial color={NEON_BLUE} roughness={0.46} />
        </mesh>
        {/* 内侧滑轨黑条 */}
        <mesh position={[0.038, 0, -0.002]}>
          <boxGeometry args={[0.007, 0.21, 0.026]} />
          <meshStandardMaterial color={BUTTON_DARK} roughness={0.55} />
        </mesh>
        {/* 顶部 L 肩键（贴合外缘弧线的深色片） */}
        <mesh position={[-0.012, 0.108, -0.004]} rotation={[0, 0, 0.18]} castShadow>
          <boxGeometry args={[0.055, 0.012, 0.02]} />
          <meshStandardMaterial color="#0894ba" roughness={0.45} />
        </mesh>
        {/* 摇杆（上）：环座 + 杆颈 + 凹面帽 */}
        <group position={[-0.003, 0.048, 0.016]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.008, 20]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.011]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.013, 0.016, 14]} />
            <meshStandardMaterial color="#303034" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.023, 0.023, 0.005, 18]} />
            <meshStandardMaterial color="#1a1a1d" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.0228]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.018, 0.0025, 8, 18]} />
            <meshStandardMaterial color="#242428" roughness={0.55} />
          </mesh>
        </group>
        {/* 方向键：四颗独立圆键（带刻印箭头感的浅色点） */}
        {[
          [0, 0.024],
          [0, -0.024],
          [-0.024, 0],
          [0.024, 0]
        ].map(([x, y]) => (
          <mesh key={`${x},${y}`} position={[-0.003 + x, -0.052 + y, 0.017]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.0105, 0.0115, 0.007, 14]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
        ))}
        {/* 减号键 + 截图键（凹陷方框） */}
        <mesh position={[0.026, 0.095, 0.016]}>
          <boxGeometry args={[0.016, 0.004, 0.005]} />
          <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
        </mesh>
        <group position={[0.024, -0.098, 0.016]}>
          <mesh>
            <boxGeometry args={[0.015, 0.015, 0.005]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.002, 10]} />
            <meshStandardMaterial color="#3c3c42" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ── 右 Joy-Con（电光红）── */}
      <group position={[0.231, 0, 0]}>
        <mesh geometry={joyRGeo} castShadow receiveShadow>
          <meshStandardMaterial color={NEON_RED} roughness={0.46} />
        </mesh>
        <mesh position={[-0.038, 0, -0.002]}>
          <boxGeometry args={[0.007, 0.21, 0.026]} />
          <meshStandardMaterial color={BUTTON_DARK} roughness={0.55} />
        </mesh>
        {/* 顶部 R 肩键 */}
        <mesh position={[0.012, 0.108, -0.004]} rotation={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[0.055, 0.012, 0.02]} />
          <meshStandardMaterial color="#cc2f20" roughness={0.45} />
        </mesh>
        {/* ABXY（上）：圆键 + 刻字 */}
        {[
          { x: 0, y: 0.024, ch: "X" },
          { x: 0, y: -0.024, ch: "B" },
          { x: -0.024, y: 0, ch: "Y" },
          { x: 0.024, y: 0, ch: "A" }
        ].map(({ x, y, ch }) => (
          <group key={ch} position={[0.003 + x, 0.052 + y, 0.017]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.0105, 0.0115, 0.007, 14]} />
              <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
            </mesh>
            <Text position={[0, 0, 0.005]} fontSize={0.011} color="#8a8a92" anchorX="center" anchorY="middle">
              {ch}
            </Text>
          </group>
        ))}
        {/* 摇杆（下） */}
        <group position={[0.003, -0.048, 0.016]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.008, 20]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.011]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.013, 0.016, 14]} />
            <meshStandardMaterial color="#303034" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.023, 0.023, 0.005, 18]} />
            <meshStandardMaterial color="#1a1a1d" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.0228]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.018, 0.0025, 8, 18]} />
            <meshStandardMaterial color="#242428" roughness={0.55} />
          </mesh>
        </group>
        {/* 加号键 + Home 键（圆环内亮点） */}
        <group position={[-0.026, 0.095, 0.016]}>
          <mesh>
            <boxGeometry args={[0.016, 0.004, 0.005]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.004, 0.016, 0.005]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
        </group>
        <group position={[-0.024, -0.098, 0.016]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.005, 14]} />
            <meshStandardMaterial color={BUTTON_DARK} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.006, 0.0015, 6, 12]} />
            <meshStandardMaterial color="#55555c" roughness={0.5} />
          </mesh>
        </group>
      </group>

      <RoomObjectLabel id="console" position={[0, 0.32, 0.05]} />
    </group>
  );
}
