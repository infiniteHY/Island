import { motion } from "motion/react";
import type { BuildingConfig } from "../game/types/world";
import { buildingContent } from "../content/buildings";

type BuildingPanelProps = {
  building: BuildingConfig;
  onClose: () => void;
};

export function BuildingPanel({ building, onClose }: BuildingPanelProps) {
  const content = buildingContent[building.id];

  return (
    <motion.aside
      className="building-panel"
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="building-panel-title"
    >
      <button className="panel-close" type="button" onClick={onClose} aria-label="关闭内容面板">
        ×
      </button>
      <p className="panel-kicker">{content.kicker}</p>
      <h2 id="building-panel-title">{building.title}</h2>
      <p className="panel-subtitle">{building.subtitle}</p>
      <p className="panel-description">{content.description}</p>
      <div className="panel-grid">
        {content.items.map((item) => (
          <article className="content-card" key={item.title}>
            <div>
              <h3>{item.title}</h3>
              <span>{item.meta}</span>
            </div>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </motion.aside>
  );
}
