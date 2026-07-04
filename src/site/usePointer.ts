import { useEffect, useState } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

/** rAF 节流的指针坐标,格式 "0421 X 0836 Y";reducedMotion 时保持初始值 */
export function usePointer(enabled: boolean): string {
  const [text, setText] = useState("0000 X 0000 Y");

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (pending) {
        setText(`${pad(pending.x)} X ${pad(pending.y)} Y`);
        pending = null;
      }
    };

    const onMove = (event: PointerEvent) => {
      pending = { x: event.clientX, y: event.clientY };
      if (!raf) raf = window.requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return text;
}
