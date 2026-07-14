import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CanvasTextPlane } from "../CanvasTextPlane";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

/** 键位布局：与四排键帽一一对应，用于打字时按下对应键 */
const KEY_ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const PRESS_MS = 150;
const MAX_CHARS = 200;
/** 纸上一行的宽度（字符数）与可见行数（超出后旧行上移出视野） */
const LINE_CHARS = 23;
const VISIBLE_LINES = 6;

/** 只保留打字机能敲出的字符：字母（转大写）、数字、空格与常用标点 */
function sanitize(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 .,!?'":()-]/g, "")
    .slice(0, MAX_CHARS);
}

/**
 * 复古机械打字机：弧顶机身、字锤扇形排 + 色带卷轴、双旋钮滚筒、
 * 纸张、四排带金属圈的圆键帽、回车拨杆、换行棘轮。
 * 聚焦后由一个隐藏的 textarea 承接输入（对 input 事件做增量 diff，
 * 任何输入法下拿到的都是真正上屏的字符），对应键帽跟着按下；
 * 纸上只显示最近几行（旧行上移出视野），写完点「确认寄出」。
 */
export function Typewriter() {
  const focus = useRoomStore((state) => state.focus);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const active = focus === "typewriter";

  const keyRefs = useRef<Map<string, THREE.Group>>(new Map());
  const spaceRef = useRef<THREE.Mesh>(null);
  /** 每个键最近一次按下的时间戳，驱动下沉回弹动画 */
  const pressMap = useRef<Map<string, number>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const typedRef = useRef("");
  const sentTimerRef = useRef(0);
  const [typed, setTyped] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!active) {
      pressMap.current.clear();
      typedRef.current = "";
      setTyped("");
      setSent(false);
      window.clearTimeout(sentTimerRef.current);
      return undefined;
    }
    // Html 挂载是异步的，稍等一拍再聚焦隐藏输入框
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(sentTimerRef.current);
    };
  }, [active]);

  const pressChar = (ch: string) => {
    if (ch === " ") {
      pressMap.current.set("space", performance.now());
      return;
    }
    const lower = ch.toLowerCase();
    for (let row = 0; row < KEY_ROWS.length; row += 1) {
      const col = KEY_ROWS[row].indexOf(lower);
      if (col >= 0) {
        pressMap.current.set(`${row}-${col}`, performance.now());
        return;
      }
    }
  };

  /** 读取 textarea 的真实内容（上屏字符），过滤后与旧值 diff，新增字符触发键帽动画 */
  const applyInput = (el: HTMLTextAreaElement) => {
    if (composingRef.current) return;
    const next = sanitize(el.value);
    if (el.value !== next) el.value = next;
    const prev = typedRef.current;
    if (next.length > prev.length && next.startsWith(prev)) {
      for (const ch of next.slice(prev.length)) pressChar(ch);
    }
    typedRef.current = next;
    setTyped(next);
  };

  const send = () => {
    if (sent || typedRef.current.trim().length === 0) return;
    typedRef.current = "";
    setTyped("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    setSent(true);
    window.clearTimeout(sentTimerRef.current);
    sentTimerRef.current = window.setTimeout(() => setSent(false), 2600);
  };

  // 键帽下沉回弹
  useFrame(() => {
    const now = performance.now();
    pressMap.current.forEach((t0, id) => {
      const t = now - t0;
      const progress = Math.min(1, t / PRESS_MS);
      // 前 40% 快速下沉，之后回弹
      const dip = progress < 0.4 ? progress / 0.4 : 1 - (progress - 0.4) / 0.6;
      const offset = -0.012 * dip;
      if (id === "space") {
        if (spaceRef.current) spaceRef.current.position.y = 0.05 + offset;
      } else {
        const key = keyRefs.current.get(id);
        if (key) key.position.y = offset;
      }
      if (progress >= 1) pressMap.current.delete(id);
    });
  });

  // 打出的字排成行，只显示最后几行（旧行如同纸张上卷移出视野）
  const lines: string[] = [];
  for (let i = 0; i < typed.length; i += LINE_CHARS) lines.push(typed.slice(i, i + LINE_CHARS));
  const visibleLines = lines.slice(-VISIBLE_LINES);
  const paperText = sent
    ? "MESSAGE SENT.\nTHANK YOU :)"
    : typed.length > 0
      ? `${visibleLines.join("\n")}_`
      : "HELLO, HANYA...";

  return (
    <group
      position={[0.78, 0.73, -1.95]}
      rotation={[0, -0.08, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("typewriter");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("typewriter");
      }}
    >
      {/* 机身：下座 + 弧形上盖（横放圆柱切出弧顶） */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.66, 0.14, 0.46]} />
        <meshStandardMaterial color="#39413c" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.14, -0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.62, 20, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#39413c" roughness={0.45} metalness={0.15} />
      </mesh>
      {/* 字锤开口（弧顶前的深色凹槽） */}
      <mesh position={[0, 0.17, 0.05]} rotation={[-0.7, 0, 0]}>
        <planeGeometry args={[0.34, 0.12]} />
        <meshStandardMaterial color="#141614" roughness={0.8} />
      </mesh>
      {/* 字锤扇形排：一圈细金属杆汇向打印点 */}
      {Array.from({ length: 13 }, (_, i) => {
        const spread = (i - 6) * 0.09;
        return (
          <mesh
            key={i}
            position={[Math.sin(spread) * 0.11, 0.185, 0.045 + Math.abs(spread) * 0.012]}
            rotation={[-0.72, 0, spread]}
          >
            <boxGeometry args={[0.006, 0.1, 0.003]} />
            <meshStandardMaterial color="#9a948a" metalness={0.75} roughness={0.3} />
          </mesh>
        );
      })}
      {/* 色带卷轴：左右两个金属轴 + 深红色带盘（坐在弧顶两侧凹槽） */}
      {[-0.21, 0.21].map((x) => (
        <group key={x} position={[x, 0.295, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.022, 20]} />
            <meshStandardMaterial color="#552d28" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.014, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.006, 20]} />
            <meshStandardMaterial color="#3a3b38" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.014, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.006, 20]} />
            <meshStandardMaterial color="#3a3b38" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.022, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.02, 8]} />
            <meshStandardMaterial color="#b8b2a2" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* 两卷轴间的色带 */}
      <mesh position={[0, 0.29, 0.03]} rotation={[0.06, 0, 0]}>
        <planeGeometry args={[0.38, 0.014]} />
        <meshStandardMaterial color="#5e2a24" roughness={0.85} side={2} />
      </mesh>
      {/* 侧面圆形装饰盖 */}
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.14, -0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.015, 18]} />
          <meshStandardMaterial color="#2a302c" roughness={0.4} metalness={0.3} />
        </mesh>
      ))}

      {/* 滚筒：主轴 + 两端旋钮 + 齿纹 */}
      <group position={[0, 0.3, -0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.68, 18]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.4} />
        </mesh>
        {[-0.38, 0.38].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.05, 14]} />
              <meshStandardMaterial color="#454a46" roughness={0.35} metalness={0.4} />
            </mesh>
            {/* 旋钮防滑纹 */}
            <mesh position={[x > 0 ? 0.028 : -0.028, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.028, 0.028, 0.008, 14]} />
              <meshStandardMaterial color="#2b2f2c" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* 压纸杆 */}
        <mesh position={[0, -0.02, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 10]} />
          <meshStandardMaterial color="#8f8a80" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* 纸导轨（滚筒前的横条 + 两个小压轮） */}
        <mesh position={[0, 0.028, 0.055]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.56, 8]} />
          <meshStandardMaterial color="#b8b2a2" metalness={0.65} roughness={0.28} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.028, 0.055]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.024, 10]} />
            <meshStandardMaterial color="#3a3b38" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* 滚筒滑轨（机身与滚筒之间的金属横梁） */}
      <mesh position={[0, 0.235, -0.12]} castShadow>
        <boxGeometry args={[0.72, 0.028, 0.1]} />
        <meshStandardMaterial color="#2e332f" metalness={0.35} roughness={0.4} />
      </mesh>

      {/* 纸张（微弯：上段后仰） */}
      <mesh position={[0, 0.46, -0.14]} rotation={[-0.16, 0, 0]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#f8f2e2" roughness={0.85} side={2} />
      </mesh>

      {/* 四排阶梯圆键帽：金属圈 + 象牙面 + 细键杆（打字时下沉回弹） */}
      {KEY_ROWS.map((chars, row) => {
        const count = chars.length;
        return (
          <group key={row} position={[0, 0.155 - row * 0.028, 0.1 + row * 0.055]}>
            {Array.from({ length: count }, (_, i) => (
              <group
                key={i}
                position={[(i - (count - 1) / 2) * 0.055, 0, 0]}
                ref={(node) => {
                  if (node) keyRefs.current.set(`${row}-${i}`, node);
                  else keyRefs.current.delete(`${row}-${i}`);
                }}
              >
                {/* 键杆 */}
                <mesh position={[0, -0.03, -0.015]} rotation={[0.35, 0, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.06, 6]} />
                  <meshStandardMaterial color="#55584f" metalness={0.6} roughness={0.35} />
                </mesh>
                {/* 金属包圈 */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.021, 0.017, 0.022, 14]} />
                  <meshStandardMaterial color="#8f8a80" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* 象牙键面 */}
                <mesh position={[0, 0.012, 0]}>
                  <cylinderGeometry args={[0.017, 0.017, 0.004, 14]} />
                  <meshStandardMaterial color="#efe7d2" roughness={0.42} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
      {/* 空格键（金属压条） */}
      <mesh ref={spaceRef} position={[0, 0.05, 0.31]} castShadow>
        <boxGeometry args={[0.28, 0.016, 0.04]} />
        <meshStandardMaterial color="#c9c2b2" metalness={0.4} roughness={0.4} />
      </mesh>

      {active ? (
        <CanvasTextPlane
          text={paperText}
          position={[0, 0.465, -0.118]}
          rotation={[-0.16, 0, 0]}
          width={0.42}
          height={0.29}
          fontSize={34}
          lineHeight={1.2}
          fontWeight={1000}
          color="#332f28"
          align="left"
          verticalAlign="top"
          padding={20}
          maxLines={VISIBLE_LINES}
          wrap={false}
        />
      ) : null}

      {/* 隐藏输入框（承接真实上屏字符）+ 确认寄出按钮 */}
      {active ? (
        <Html position={[0.52, 0.3, 0.18]} center distanceFactor={1.6} className="typewriter-ui-wrap">
          <div
            className="typewriter-ui"
            // Html 的 div 与 canvas 同挂在 R3F 事件根上，阻止冒泡以免点按钮触发场景射线（会退出聚焦）
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <textarea
              ref={inputRef}
              className="typewriter-hidden-input"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="打字机输入"
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={(event) => {
                composingRef.current = false;
                applyInput(event.currentTarget);
              }}
              onInput={(event) => applyInput(event.currentTarget)}
              onBlur={(event) => {
                // 点按钮等操作会让输入框失焦，只要还聚焦在打字机就抢回焦点
                const el = event.currentTarget;
                window.setTimeout(() => {
                  if (useRoomStore.getState().focus === "typewriter") el.focus();
                }, 0);
              }}
            />
            <button
              type="button"
              className="typewriter-send"
              disabled={sent || typed.trim().length === 0}
              onClick={send}
            >
              {sent ? "已寄出 ✓" : "确认寄出"}
            </button>
            <span className="typewriter-count">
              {typed.length}/{MAX_CHARS}
            </span>
          </div>
        </Html>
      ) : null}
      <RoomObjectLabel id="typewriter" position={[0, 0.72, 0]} />
    </group>
  );
}
