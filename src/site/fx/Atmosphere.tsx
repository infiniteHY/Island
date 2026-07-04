import { useEffect, useRef } from "react";
import { useSiteStore } from "../siteStore";

/**
 * 背景氛围层:点阵网格 + 跟随鼠标的聚光灯 + 扫描线。
 * 全部纯 CSS 渲染,JS 只更新聚光灯坐标(CSS 变量)。
 */
export function Atmosphere() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;

    const flush = () => {
      raf = 0;
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    flush();
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className="atmosphere" aria-hidden="true">
      <div className="atmo-grid" />
      {reducedMotion ? null : (
        <>
          <div className="atmo-spot" />
          <div className="atmo-scanline" />
        </>
      )}
    </div>
  );
}
