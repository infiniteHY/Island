import type { BuildingId } from "../game/types/world";

export type BuildingContent = {
  kicker: string;
  description: string;
  items: {
    title: string;
    meta: string;
    body: string;
  }[];
};

export const buildingContent: Record<BuildingId, BuildingContent> = {
  library: {
    kicker: "Fragments of Thought",
    description: "书单、读书笔记和长期积累的知识索引会先从这里生长。",
    items: [
      { title: "AI 与产品", meta: "持续阅读", body: "整理模型能力、产品判断和实际应用场景。" },
      { title: "心理与哲学", meta: "摘录", body: "保留能反复回看的段落、问题和思考。" },
      { title: "经济与投资", meta: "笔记", body: "把阅读和交易框架连接起来。" }
    ]
  },
  sports: {
    kicker: "Training Log",
    description: "记录训练、身体状态和阶段性目标，让健康数据有地方沉淀。",
    items: [
      { title: "力量训练", meta: "每周", body: "动作、重量、组数和恢复情况。" },
      { title: "有氧能力", meta: "趋势", body: "跑步、骑行或球类运动的体能曲线。" },
      { title: "身体指标", meta: "复盘", body: "体重、睡眠和状态反馈。" }
    ]
  },
  finance: {
    kicker: "Investment Notes",
    description: "沉淀投资框架、交易纪律、资产配置和复盘记录。",
    items: [
      { title: "持仓逻辑", meta: "框架", body: "为什么买、为什么持有、什么时候退出。" },
      { title: "做 T 笔记", meta: "复盘", body: "记录每次操作背后的判断和偏差。" },
      { title: "资产配置", meta: "长期", body: "把风险、现金流和目标放到同一张图里。" }
    ]
  },
  arcade: {
    kicker: "Projects",
    description: "小游戏、Hackathon 和实验项目会从这里进入可玩的 Demo。",
    items: [
      { title: "Playable Demos", meta: "入口", body: "把可运行的小项目整理成卡片。" },
      { title: "Hackathon", meta: "记录", body: "保留短周期创造的过程和结果。" },
      { title: "Experiments", meta: "原型", body: "收纳还在探索阶段的想法。" }
    ]
  },
  jazz: {
    kicker: "Music Hall",
    description: "贝斯练习、曲目、录音入口和音乐灵感都收进音乐馆。",
    items: [
      { title: "Bass Practice", meta: "练习", body: "音阶、律动、曲目和手感记录。" },
      { title: "Jam Ideas", meta: "片段", body: "保留随手录下的动机与和声想法。" },
      { title: "Listening", meta: "歌单", body: "把喜欢的 Jazz bar 氛围收集起来。" }
    ]
  },
  gallery: {
    kicker: "Gallery",
    description: "摄影、视觉作品和收藏会在下一阶段开放。",
    items: []
  },
  world_tree: {
    kicker: "Growth",
    description: "成长轨迹和技能节点会在下一阶段开放。",
    items: []
  },
  travel: {
    kicker: "Travel",
    description: "旅行地图、航线和照片会在下一阶段开放。",
    items: []
  },
  future: {
    kicker: "Coming Soon",
    description: "待开发区域会随着新内容解锁。",
    items: []
  }
};
