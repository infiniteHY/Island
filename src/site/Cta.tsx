import { motion } from "motion/react";
import { useSiteStore } from "./siteStore";
import { Scramble } from "./fx/Scramble";

const words = ["保持好奇", "持续记录"];

export function Cta() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);

  return (
    <section className="cta" aria-label="结语">
      {words.map((word, i) => (
        <motion.p
          key={word}
          className="cta-line"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
        >
          <Scramble text={word} delay={120 * i} step={140} />
        </motion.p>
      ))}
    </section>
  );
}
