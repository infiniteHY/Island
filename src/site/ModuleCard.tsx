import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { useSiteStore } from "./siteStore";
import { useSquircle } from "./useSquircle";
import type { SiteModule } from "./siteContent";

type Props = {
  module: SiteModule;
};

export function ModuleCard({ module }: Props) {
  const expandedId = useSiteStore((state) => state.expandedId);
  const toggleExpanded = useSiteStore((state) => state.toggleExpanded);
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const { ref, path } = useSquircle<HTMLDivElement>(28);
  const regionId = useId();

  const expanded = expandedId === module.id;

  return (
    <motion.div
      id={module.id}
      ref={ref}
      className={`module-card${module.open ? "" : " is-locked"}${expanded ? " is-expanded" : ""}`}
      style={path ? { clipPath: `path("${path}")` } : undefined}
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="module-head"
        onClick={() => module.open && toggleExpanded(module.id)}
        disabled={!module.open}
        aria-expanded={module.open ? expanded : undefined}
        aria-controls={module.open ? regionId : undefined}
      >
        <div className="module-meta mono">
          <span>{module.index}</span>
          <span>{module.open ? module.label : "SOON"}</span>
        </div>
        <h3 className="module-title">{module.title}</h3>
        <p className="module-kicker mono label-3">{module.kicker}</p>
        <p className="module-description">{module.description}</p>
        {module.open ? (
          <span className="module-arrow mono" aria-hidden="true">
            {expanded ? "×" : "+"}
          </span>
        ) : null}
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={regionId}
            className="module-items"
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.66, 0, 0.01, 1] }}
          >
            <ul>
              {module.items.map((item) => (
                <li key={item.title}>
                  <div className="item-row">
                    <h4>{item.title}</h4>
                    <span className="mono label-3">{item.meta}</span>
                  </div>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
