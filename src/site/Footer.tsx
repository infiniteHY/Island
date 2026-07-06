import { motion } from "motion/react";
import { useSiteStore } from "./siteStore";
import { Scramble } from "./fx/Scramble";

const contact = {
  email: "1277530323@qq.com",
  github: "https://github.com/infiniteHY"
};
const mePhoto = new URL("../../docs/me.jpg", import.meta.url).href;

export function Footer() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);

  return (
    <footer id="contact" className="site-footer">
      <motion.div
        className="footer-inner"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="footer-title mono">
          <Scramble text="LET'S CONNECT" step={48} />
        </h2>
        <div className="footer-links mono">
          <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.email}`}>
            <Scramble text="EMAIL" step={60} />
          </a>
          <a href={contact.github} target="_blank" rel="noreferrer" aria-label="GitHub infiniteHY">
            <Scramble text="GITHUB" step={60} />
          </a>
        </div>
      </motion.div>
      <motion.aside
        className="footer-profile"
        initial={reducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: false, margin: "-60px" }}
        variants={{
          hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              duration: 0.62,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.08
            }
          }
        }}
        aria-label="个人介绍"
      >
        <motion.i
          className="footer-profile-scan"
          aria-hidden="true"
          variants={{
            hidden: { opacity: 0, x: "-120%" },
            show: {
              opacity: [0, 1, 1, 0],
              x: ["-120%", "-20%", "42%", "120%"],
              transition: { duration: 0.9, delay: 0.12, ease: [0.66, 0, 0.01, 1] }
            }
          }}
        />
        <div className="footer-profile-copy">
          <motion.p className="mono label-3" variants={{ hidden: { opacity: 0, x: 12 }, show: { opacity: 1, x: 0 } }}>
            PROFILE.NODE
          </motion.p>
          <motion.strong variants={{ hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0 } }}>
            Computer Vision Engineer
          </motion.strong>
          <motion.span variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0 } }}>
            Building perception systems, playful tools, and personal worlds.
          </motion.span>
        </div>
        <motion.div
          className="footer-avatar"
          variants={{ hidden: { opacity: 0, scale: 0.92, rotate: -2 }, show: { opacity: 1, scale: 1, rotate: 0 } }}
        >
          <img src={mePhoto} alt="Hanya portrait" />
        </motion.div>
      </motion.aside>
    </footer>
  );
}
