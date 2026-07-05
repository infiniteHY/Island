import { Canvas } from "@react-three/fiber";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Suspense, useEffect, useState } from "react";
import { useSiteStore } from "../siteStore";
import { BottleScene } from "./BottleScene";
import { BOTTLE_ITEMS } from "./bottleItems";

const titleLines = ["我的世界——", "Reading, Music, Bird."];

export function BottleHero() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compactScene, setCompactScene] = useState(false);
  const staticScene = reducedMotion || compactScene;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const apply = () => setCompactScene(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <section className="hero bottle-hero" aria-label="瓶中记忆胶囊首页">
      <div className="bottle-hero-copy">
        <p className="hero-boot mono label-3" aria-hidden="true">
          MEMORY.CAPSULE // GLASS_BOTTLE ONLINE
        </p>
        <h1 className="hero-title bottle-title">
          {titleLines.map((line, index) => (
            <span className="hero-line" key={line}>
              <motion.span
                className="hero-line-inner"
                initial={reducedMotion ? false : { y: "110%", filter: "blur(10px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.72,
                  delay: 0.08 * index,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="hero-intro bottle-intro"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          贝斯、地球、相机、望远镜里的鸟和交易实验，会像标本一样落进瓶中。
          <span className="mono label-3">EVERY OBJECT IS A PATH</span>
        </motion.p>
      </div>

      <motion.div
        className="bottle-stage"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Canvas
          className="bottle-canvas"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.05, 7.2], fov: 39 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <BottleScene activeId={activeId} onActiveChange={setActiveId} reducedMotion={staticScene} />
          </Suspense>
        </Canvas>
      </motion.div>

      <nav className="bottle-nav mono" aria-label="瓶中兴趣入口">
        {BOTTLE_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.route}
            className={activeId === item.id ? "is-active" : undefined}
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(item.id)}
            onBlur={() => setActiveId(null)}
            style={{ "--item-accent": item.accent } as CSSProperties}
          >
            <span>{item.label}</span>
            <em>{item.subtitle}</em>
          </a>
        ))}
      </nav>
    </section>
  );
}
