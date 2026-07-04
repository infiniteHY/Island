import { siteModules } from "./siteContent";
import { ModuleCard } from "./ModuleCard";
import { Scramble } from "./fx/Scramble";

export function Modules() {
  return (
    <section id="modules" className="modules" aria-label="生活模块">
      <div className="section-head">
        <h2 className="section-title">
          <Scramble text="MODULES" step={60} />
        </h2>
        <span className="mono label-3">
          {siteModules.filter((m) => m.open).length}/{siteModules.length} OPEN
        </span>
      </div>
      <div className="module-grid">
        {siteModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
