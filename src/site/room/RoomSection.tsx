import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { ROOM_OBJECT_META, useRoomStore } from "./roomStore";
import { RoomScene } from "./RoomScene";
import { useScrollLock } from "./useScrollLock";
import { useSiteStore } from "../siteStore";

export function RoomSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const focus = useRoomStore((state) => state.focus);
  const hovered = useRoomStore((state) => state.hovered);
  const inView = useRoomStore((state) => state.inView);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setInView = useRoomStore((state) => state.setInView);
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const active = focus ?? hovered;

  useScrollLock(Boolean(focus));

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [setInView]);

  useEffect(() => {
    if (!focus) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocus(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, setFocus]);

  return (
    <section ref={sectionRef} id="room" className="room-section" aria-labelledby="room-title">
      <div className="section-head room-head">
        <div>
          <p className="section-title">ROOM.LIVE // 一个可以坐下来的角落</p>
          <h2 id="room-title" className="room-title">
            这里像家。电脑里有游戏，唱片机里有歌，打字机上敲下的字，会寄到我手里。
          </h2>
        </div>
      </div>

      <div className="room-stage" data-focused={Boolean(focus)}>
        <Canvas
          className="room-canvas"
          shadows="soft"
          dpr={[1, 1.5]}
          camera={{ position: [3.0, 2.08, 3.55], fov: 50, near: 0.1, far: 40 }}
          frameloop={inView || focus ? "always" : "demand"}
        >
          <Suspense fallback={null}>
            <RoomScene reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        <div className="room-overlay">
          {focus ? (
            <button type="button" className="room-back mono" onClick={() => setFocus(null)}>
              ← BACK
            </button>
          ) : null}
          <div className="room-hint mono">
            <span>{active ? ROOM_OBJECT_META[active].label : "HINT"}</span>
            <strong>{active ? ROOM_OBJECT_META[active].hint : "点击房间里发光的物件 · ESC 退出"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
