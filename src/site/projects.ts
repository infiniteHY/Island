export type Project = {
  id: string;
  /** 面板标题 */
  title: string;
  year: string;
  /** 面板右下角分类 meta */
  category: string;
  /** 右上角 accent chip 文案 */
  chip: string;
  /** 外链或站内锚点,可空 */
  href?: string;
  /** 封面:图片路径(public 下)或 CSS 渐变 + 单字符 glyph */
  cover:
    | { type: "image"; src: string }
    | { type: "gradient"; css: string; glyph?: string };
};

export type ProjectGroup = {
  id: string;
  /** 组标签(mono 大写) */
  label: string;
  projects: Project[];
};

/**
 * 作品清单,两大类、每行三个。年份是占位,按实际情况改。
 */
export const projectGroups: ProjectGroup[] = [
  {
    id: "ai-tools",
    label: "AI & TOOLS",
    projects: [
      {
        id: "mira",
        title: "MIRA",
        year: "2026",
        category: "AGENT",
        chip: "IP",
        href: "https://mira-agent.hanya.workers.dev/",
        cover: { type: "image", src: "/assets/works/mira.png" }
      },
      {
        id: "invest-agent",
        title: "Invest Agent",
        year: "2026",
        category: "AGENT",
        chip: "INVEST",
        href: "https://etf-ai-agent.pages.dev/",
        cover: { type: "image", src: "/assets/works/invest-agent.png" }
      },
      {
        id: "skill-weave",
        title: "Skill Weave",
        year: "2026",
        category: "TOOLS",
        chip: "AI Agent",
        href: "https://skillweave.hanya.workers.dev/",
        cover: { type: "image", src: "/assets/works/skill-weave.png" }
      }
    ]
  },
  {
    id: "spaces",
    label: "SPACES & WORKSHOPS",
    projects: [
      {
        id: "white-night",
        title: "WhiteNight",
        year: "2026",
        category: "READING",
        chip: "Website",
        href: "https://white-night-app.vercel.app/dashboard",
        cover: { type: "image", src: "/assets/works/white-night.png" }
      },
      {
        id: "wand-jazz",
        title: "Wand Jazz Bar",
        year: "2026",
        category: "MUSIC",
        chip: "AI Agent",
        href: "https://wandjazzbar.vercel.app/jazz-bar",
        cover: { type: "image", src: "/assets/works/wand-jazz-bar.png" }
      },
      {
        id: "mbti-music",
        title: "MBTI Music Theory",
        year: "2026",
        category: "EDU",
        chip: "AI Agent",
        href: "https://musictheory-6sc.pages.dev/#/",
        cover: { type: "image", src: "/assets/works/music-theory.png" }
      }
    ]
  }
];

export const projectCount = projectGroups.reduce(
  (sum, group) => sum + group.projects.length,
  0
);
