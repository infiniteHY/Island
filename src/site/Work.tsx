import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue
} from "motion/react";
import { useSiteStore } from "./siteStore";
import { projectGroups, projectCount, type Project } from "./projects";
import { Scramble } from "./fx/Scramble";

/**
 * haoqi 式滚动形变:根据滚动速度让封面纵向拉伸 + 轻微斜切,
 * 停下后弹簧回弹(拖到边缘急停时回弹感最明显)。
 */
function useScrollDeform(enabled: boolean) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 320, damping: 42, mass: 0.8 });

  const skewY = useTransform(smooth, [-2400, 0, 2400], [4.5, 0, -4.5], {
    clamp: true
  });
  const scaleY = useTransform(smooth, (v) => 1 + Math.min(Math.abs(v) / 16000, 0.12));

  if (!enabled) return null;
  return { skewY, scaleY };
}

type Deform = { skewY: MotionValue<number>; scaleY: MotionValue<number> } | null;

function Cover({ project }: { project: Project }) {
  if (project.cover.type === "image") {
    return <img src={project.cover.src} alt="" loading="lazy" />;
  }
  return (
    <div className="work-cover-fill" style={{ background: project.cover.css }}>
      {project.cover.glyph ? (
        <span className="work-glyph" aria-hidden="true">
          {project.cover.glyph}
        </span>
      ) : null}
    </div>
  );
}

function WorkPanel({
  project,
  index,
  deform
}: {
  project: Project;
  index: number;
  deform: Deform;
}) {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const Tag = project.href ? motion.a : motion.div;
  const delay = 0.08 * (index % 3);

  return (
    <Tag
      className="work-panel"
      data-project-id={project.id}
      {...(project.href
        ? { href: project.href, target: "_blank", rel: "noreferrer" }
        : {})}
      initial={reducedMotion ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="work-chip mono">{project.chip}</span>
      <div className="work-cover">
        <motion.div
          className="work-deform"
          style={deform ? { skewY: deform.skewY, scaleY: deform.scaleY } : undefined}
        >
          <Cover project={project} />
        </motion.div>
        {/* haoqi 式掀开:遮布向上收起,露出封面 */}
        {reducedMotion ? null : (
          <motion.div
            className="work-veil"
            initial={{ y: "0%" }}
            whileInView={{ y: "-101%" }}
            viewport={{ once: false, margin: "-60px" }}
            transition={{
              duration: 0.9,
              delay: delay + 0.15,
              ease: [0.65, 0, 0.35, 1]
            }}
          />
        )}
      </div>
      <div className="work-caption mono">
        <span className="work-title">{project.title}</span>
        <span className="work-meta label-3">
          {project.year}&ensp;{project.category}
          {project.href ? <span aria-hidden="true">↗</span> : null}
        </span>
      </div>
    </Tag>
  );
}

export function Work() {
  const reducedMotion = useSiteStore((state) => state.reducedMotion);
  const deform = useScrollDeform(!reducedMotion);

  return (
    <section id="work" className="work" aria-label="项目作品">
      <div className="section-head">
        <h2 className="section-title">
          <Scramble text="SELECTED WORK" step={50} />
        </h2>
        <span className="mono label-3">{projectCount} PROJECTS</span>
      </div>

      {/* zed 式坐标尺 */}
      <div className="work-ruler" aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className="ruler-num mono">
            {String(i * 10).padStart(3, "0")}
          </span>
        ))}
      </div>

      <div className="work-body">
        {projectGroups.map((group) => (
          <div key={group.id} className="work-group">
            <h3 className="work-group-label mono">
              <span className="group-tick" aria-hidden="true" />
              {group.label}
              <span className="label-3">{group.projects.length}</span>
            </h3>
            <div className="work-grid">
              {group.projects.map((project, i) => (
                <WorkPanel
                  key={project.id}
                  project={project}
                  index={i}
                  deform={deform}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
