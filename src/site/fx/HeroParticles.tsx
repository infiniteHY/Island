import { useEffect, useRef } from "react";
import { useSiteStore } from "../siteStore";

/**
 * Hero 光粒子 + 漂浮物(相机/贝斯/书)canvas 层。
 * - 光粒子:accent 色小点,缓慢上浮、微闪烁
 * - 漂浮物:emoji 字形,呼吸式浮动 + 轻微摇摆
 * - 鼠标互动:靠近时被推开,松开后弹簧回位
 * (查过 haoqi 的 wasm_design_utils,只有 color/extract-colors/squircle,
 *  粒子系统属自绘;squircle 已用在别处)
 */

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  tw: number; // twinkle 相位
};

type Floater = {
  glyph: string;
  hx: number; // home 位置(相对 0-1)
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bobPhase: number;
  bobAmp: number;
  rotPhase: number;
};

const GLYPHS = ["📷", "🎸", "📚", "♪"];

export function HeroParticles() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let running = true;

    const mouse = { x: -9999, y: -9999 };

    const dots: Dot[] = [];
    const floaters: Floater[] = [];

    const seed = () => {
      dots.length = 0;
      const count = Math.round(Math.min(56, (width * height) / 26000));
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.12 - Math.random() * 0.25,
          r: 0.8 + Math.random() * 1.8,
          tw: Math.random() * Math.PI * 2
        });
      }

      floaters.length = 0;
      // 漂浮物落在右侧留白区,避开左侧大字
      const homes: [number, number][] = [
        [0.68, 0.24],
        [0.84, 0.46],
        [0.7, 0.72],
        [0.9, 0.16]
      ];
      GLYPHS.forEach((glyph, i) => {
        const [hx, hy] = homes[i % homes.length];
        floaters.push({
          glyph,
          hx,
          hy,
          x: hx * width,
          y: hy * height,
          vx: 0,
          vy: 0,
          size: glyph === "♪" ? 26 : 34 + Math.random() * 8,
          bobPhase: Math.random() * Math.PI * 2,
          bobAmp: 8 + Math.random() * 6,
          rotPhase: Math.random() * Math.PI * 2
        });
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });

    let accent = "192, 254, 4";
    let lastAccentRead = 0;

    const readAccent = (now: number) => {
      if (now - lastAccentRead < 500) return;
      lastAccentRead = now;
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-rgb")
        .trim();
      if (v) accent = v;
    };

    let last = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;
      readAccent(now);

      ctx.clearRect(0, 0, width, height);

      // --- 光粒子 ---
      for (const d of dots) {
        // 鼠标斥力
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 120 * 120 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const f = ((120 - dist) / 120) * 0.6;
          d.vx += (dx / dist) * f * dt;
          d.vy += (dy / dist) * f * dt;
        }
        d.vx *= 0.96;
        d.vy = d.vy * 0.96 - 0.008 * dt; // 保持轻微上升
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.tw += 0.03 * dt;

        // 出界回收
        if (d.y < -8) {
          d.y = height + 8;
          d.x = Math.random() * width;
          d.vy = -0.12 - Math.random() * 0.25;
        }
        if (d.x < -8) d.x = width + 8;
        if (d.x > width + 8) d.x = -8;

        const alpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, ${alpha})`;
        ctx.shadowColor = `rgba(${accent}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- 漂浮物 ---
      for (const f of floaters) {
        f.bobPhase += 0.012 * dt;
        f.rotPhase += 0.008 * dt;

        const homeX = f.hx * width;
        const homeY = f.hy * height + Math.sin(f.bobPhase) * f.bobAmp;

        // 弹簧回家
        f.vx += (homeX - f.x) * 0.004 * dt;
        f.vy += (homeY - f.y) * 0.004 * dt;

        // 鼠标斥力(比粒子更"重",推得动但缓慢)
        const dx = f.x - mouse.x;
        const dy = f.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 150 * 150 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const push = ((150 - dist) / 150) * 1.4;
          f.vx += (dx / dist) * push * dt;
          f.vy += (dy / dist) * push * dt;
        }

        f.vx *= 0.92;
        f.vy *= 0.92;
        f.x += f.vx * dt;
        f.y += f.vy * dt;

        const rot = Math.sin(f.rotPhase) * 0.14;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(rot);
        if (f.glyph === "♪") {
          ctx.font = `${f.size}px ${getComputedStyle(document.body).getPropertyValue("--font-mono")}`;
          ctx.fillStyle = `rgba(${accent}, 0.9)`;
        } else {
          ctx.font = `${f.size}px serif`;
          ctx.fillStyle = "#000";
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.92;
        ctx.fillText(f.glyph, 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    // 页面不可见时暂停
    const onVis = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}
