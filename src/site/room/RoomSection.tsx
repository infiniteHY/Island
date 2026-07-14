import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { ROOM_OBJECT_META, useRoomStore } from "./roomStore";
import { RoomScene } from "./RoomScene";
import { useScrollLock } from "./useScrollLock";
import { useSiteStore } from "../siteStore";
import { BOOK_NOTES } from "./bookNotes";

export function RoomSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const focus = useRoomStore((state) => state.focus);
  const hovered = useRoomStore((state) => state.hovered);
  const inView = useRoomStore((state) => state.inView);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setInView = useRoomStore((state) => state.setInView);
  const selectedBookId = useRoomStore((state) => state.selectedBookId);
  const closeBook = useRoomStore((state) => state.closeBook);
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const [bookText, setBookText] = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const [compactScene, setCompactScene] = useState(false);
  const active = focus ?? hovered;
  const selectedBook = BOOK_NOTES.find((book) => book.id === selectedBookId);

  useScrollLock(Boolean(focus));

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px), (pointer: coarse)");
    const apply = () => setCompactScene(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

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

  useEffect(() => {
    if (!selectedBook) {
      setBookText("");
      setBookLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setBookLoading(true);
    fetch(selectedBook.source, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${selectedBook.source}`);
        return response.text();
      })
      .then((text) => {
        const body = text.replace(/^\uFEFF?[^\n]*\n?/, "").trim();
        setBookText(body);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBookText("笔记正文暂时无法读取。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookLoading(false);
      });
    return () => controller.abort();
  }, [selectedBook]);

  return (
    <section ref={sectionRef} id="room" className="room-section" aria-labelledby="room-title">
      <div className="section-head room-head">
        <div>
          <p className="section-title">ROOM.LIVE</p>
          <h2 id="room-title" className="room-title">
            一间自己的房间。
          </h2>
        </div>
      </div>

      <div className="room-stage" data-focused={Boolean(focus)} data-compact={compactScene}>
        <Canvas
          className="room-canvas"
          shadows={compactScene ? false : "soft"}
          dpr={compactScene ? 1 : [1, 1.5]}
          camera={{ position: [3.0, 2.08, 3.55], fov: compactScene ? 64 : 50, near: 0.1, far: 40 }}
          frameloop={inView || focus ? "always" : "never"}
          gl={{ antialias: !compactScene, powerPreference: compactScene ? "low-power" : "high-performance" }}
        >
          <Suspense fallback={null}>
            <RoomScene reducedMotion={reducedMotion || compactScene} compact={compactScene} />
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

        {focus === "bookshelf" && selectedBook ? (
          <article className="book-letter" aria-label={`${selectedBook.title}读书笔记`}>
            <div className="book-letter-stamp mono">READING NOTE · {selectedBook.date}</div>
            <button type="button" className="book-letter-close mono" onClick={closeBook} aria-label="收起读书笔记">
              ×
            </button>
            <p className="book-letter-kicker mono">TO MY FUTURE SELF,</p>
            <h3>{selectedBook.title}</h3>
            <p className="book-letter-author">{selectedBook.author}</p>
            <div className="book-letter-body">
              {bookLoading ? "正在展开笔记……" : bookText}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
