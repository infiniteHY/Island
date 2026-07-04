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
        title: "MIRA 个人IP经纪人",
        year: "2026",
        category: "AGENT",
        chip: "AI PROJECT",
        cover: {
          type: "gradient",
          css: "linear-gradient(140deg, #5e53e3 0%, #c0434c 100%)",
          glyph: "◉"
        }
      },
      {
        id: "etf-agent",
        title: "ETF 智能投资 Agent",
        year: "2026",
        category: "AGENT",
        chip: "AI PROJECT",
        cover: {
          type: "gradient",
          css: "linear-gradient(150deg, #016630 0%, #05df72 100%)",
          glyph: "▲"
        }
      },
      {
        id: "skill-weave",
        title: "Skill Weave 个人技能树",
        year: "2026",
        category: "TOOLS",
        chip: "CODING PROJECT",
        cover: {
          type: "gradient",
          css: "linear-gradient(135deg, #1e69f6 0%, #93ccdc 100%)",
          glyph: "❋"
        }
      }
    ]
  },
  {
    id: "spaces",
    label: "SPACES & WORKSHOPS",
    projects: [
      {
        id: "baiye",
        title: "白夜读书会",
        year: "2025",
        category: "READING",
        chip: "COMMUNITY",
        cover: {
          type: "gradient",
          css: "linear-gradient(160deg, #0f1117 0%, #36364f 60%, #7f7866 100%)",
          glyph: "☾"
        }
      },
      {
        id: "wand-jazz",
        title: "Wand Jazz Bar",
        year: "2025",
        category: "MUSIC",
        chip: "SPACE",
        cover: {
          type: "gradient",
          css: "linear-gradient(145deg, #2b1b4d 0%, #8a3ffc 55%, #ff7eb6 100%)",
          glyph: "♪"
        }
      },
      {
        id: "mbti-music",
        title: "MBTI 乐理学习工坊",
        year: "2025",
        category: "EDU",
        chip: "WORKSHOP",
        cover: {
          type: "gradient",
          css: "linear-gradient(140deg, #a36100 0%, #fac800 100%)",
          glyph: "♭"
        }
      }
    ]
  }
];

export const projectCount = projectGroups.reduce(
  (sum, group) => sum + group.projects.length,
  0
);
