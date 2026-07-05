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
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        aria-label="个人介绍"
      >
        <div className="footer-profile-copy">
          <p className="mono label-3">PROFILE.NODE</p>
          <strong>Computer Vision Engineer</strong>
          <span>Building perception systems, playful tools, and personal worlds.</span>
        </div>
        <img src={mePhoto} alt="Hanya portrait" />
      </motion.aside>
    </footer>
  );
}
