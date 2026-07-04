import { useEffect, useRef, useState } from "react";

let squirclePromise: Promise<typeof import("@wenhaoqi/wasm_design_utils/squircle")> | null =
  null;

function loadSquircle() {
  if (!squirclePromise) {
    squirclePromise = import("@wenhaoqi/wasm_design_utils/squircle");
  }
  return squirclePromise;
}

/**
 * 测量元素尺寸并用 wasm_design_utils 生成 squircle SVG path。
 * WASM 加载失败时返回 null,组件降级为普通 border-radius。
 */
export function useSquircle<T extends HTMLElement>(radius: number) {
  const ref = useRef<T | null>(null);
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let cancelled = false;
    let latest = 0;

    const update = async (width: number, height: number) => {
      const ticket = ++latest;
      try {
        const mod = await loadSquircle();
        const r = Math.min(radius, width / 2, height / 2);
        const d = await mod.getSquircle(Math.round(width), Math.round(height), r);
        if (!cancelled && ticket === latest) setPath(d);
      } catch {
        if (!cancelled) setPath(null);
      }
    };

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        void update(rect.width, rect.height);
      }
    });
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [radius]);

  return { ref, path };
}
