import { useEffect, useRef } from "react";
import { useSiteStore } from "../siteStore";

/**
 * 全屏十字准星光标:两条贯穿屏幕的细线 + 中心圆环,
 * 用 transform 移动(无重排),仅精确指针设备启用。
 */
export function Crosshair() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const hRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let x = -100;
    let y = -100;

    const flush = () => {
      raf = 0;
      if (hRef.current) hRef.current.style.transform = `translateY(${y}px)`;
      if (vRef.current) vRef.current.style.transform = `translateX(${x}px)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onOver = (event: PointerEvent) => {
      const interactive = (event.target as Element | null)?.closest(
        "a, button:not(:disabled)"
      );
      document.documentElement.classList.toggle("cursor-lock", Boolean(interactive));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.classList.add("has-crosshair");
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-crosshair", "cursor-lock");
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="crosshair" aria-hidden="true">
      <div ref={hRef} className="crosshair-h" />
      <div ref={vRef} className="crosshair-v" />
      <div ref={ringRef} className="crosshair-ring" />
    </div>
  );
}
