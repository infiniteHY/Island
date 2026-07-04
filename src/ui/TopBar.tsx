import { useWorldStore } from "./worldStore";

export function TopBar() {
  const isBirdMoving = useWorldStore((state) => state.isBirdMoving);
  const reducedMotion = useWorldStore((state) => state.reducedMotion);

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">MY LITTLE WORLD</p>
        <h1>我的小世界</h1>
      </div>
      <div className="status-pill" aria-live="polite">
        {isBirdMoving ? "小鸟正在前往入口" : "点击建筑访问"}
        {reducedMotion ? " · 低动画" : ""}
      </div>
    </header>
  );
}
