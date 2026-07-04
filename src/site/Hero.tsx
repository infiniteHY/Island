import { motion } from "motion/react";
import { useSiteStore } from "./siteStore";
import { Scramble } from "./fx/Scramble";
import { HeroParticles } from "./fx/HeroParticles";

const lines = ["我的小世界 —", "Reading, training,", "investing & jazz."];

export function Hero() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);

  return (
    <section className="hero" aria-label="简介">
      <HeroParticles />
      <p className="hero-boot mono label-3" aria-hidden="true">
        <Scramble text="SYS.BOOT // WORLD_v3 ONLINE" step={26} />
      </p>
      <h1 className="hero-title">
        {lines.map((line, i) => (
          <span className="hero-line" key={line}>
            <motion.span
              className="hero-line-inner"
              initial={reducedMotion ? false : { y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.08 * i,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        className="hero-intro"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        把<span className="em-serif">阅读、训练、投资、项目和音乐</span>都记录在同一个地方,
        让每一部分的积累都看得见。<span className="mono label-3">EST. 2026</span>
      </motion.p>
    </section>
  );
}
