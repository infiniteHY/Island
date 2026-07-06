import { useEffect } from "react";
import { useSiteStore } from "./siteStore";
import { useClock } from "./useClock";
import { usePointer } from "./usePointer";

/** zed 式全站单键快捷键:T 主题 / W 作品 / R 房间 / C 联系 */
function useHotkeys() {
  const toggleTheme = useSiteStore((state) => state.toggleTheme);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      switch (event.key.toLowerCase()) {
        case "t":
          toggleTheme();
          break;
        case "w":
          document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "r":
          document.getElementById("room")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "c":
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTheme]);
}

export function Header() {
  const theme = useSiteStore((state) => state.theme);
  const toggleTheme = useSiteStore((state) => state.toggleTheme);
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const clock = useClock();
  const pointer = usePointer(!reducedMotion);
  useHotkeys();

  return (
    <header className="site-header">
      <a className="site-logo mono" href="#top" aria-label="回到顶部">
        HANYA<span className="label-3">©2026</span>
      </a>

      <nav className="site-nav mono" aria-label="页面导航">
        <a href="#work">
          Work<kbd className="key-hint">W</kbd>
        </a>
        <a href="#room">
          Room<kbd className="key-hint">R</kbd>
        </a>
        <a href="#contact">
          Contact<kbd className="key-hint">C</kbd>
        </a>
      </nav>

      <div className="site-hud mono" aria-hidden="true">
        <span className="hud-pointer">{pointer}</span>
        <span className="hud-clock">
          {clock} <span className="label-3">GMT+8</span>
        </span>
      </div>

      <button
        type="button"
        className="theme-toggle mono"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "切换到深色主题" : "切换到浅色主题"}
      >
        THEME[{theme === "light" ? "A" : "B"}]
        <kbd className="key-hint">T</kbd>
      </button>
    </header>
  );
}
