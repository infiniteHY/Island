import { useEffect } from "react";

/** focus 态锁定页面滚动（wheel / touchmove / 空格与方向键滚动） */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const blockKeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", blockKeys, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", blockKeys);
    };
  }, [locked]);
}
