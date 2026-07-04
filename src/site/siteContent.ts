import type { BuildingId } from "../game/types/world";
import { buildingContent, type BuildingContent } from "../content/buildings";

export type ModuleMeta = {
  id: BuildingId;
  /** 中文标题 */
  title: string;
  /** Inspire Mono 英文标签 */
  label: string;
  /** 序号,HUD 式编号 */
  index: string;
  /** 是否已开放 */
  open: boolean;
};

const meta: Omit<ModuleMeta, "open">[] = [
  { id: "library", title: "图书馆", label: "READING", index: "01" },
  { id: "sports", title: "体育馆", label: "TRAINING", index: "02" },
  { id: "finance", title: "投资理财", label: "INVESTING", index: "03" },
  { id: "arcade", title: "游戏厅", label: "PROJECTS", index: "04" },
  { id: "jazz", title: "音乐馆", label: "MUSIC", index: "05" },
  { id: "gallery", title: "展览馆", label: "GALLERY", index: "06" },
  { id: "world_tree", title: "世界树", label: "GROWTH", index: "07" },
  { id: "travel", title: "旅行", label: "TRAVEL", index: "08" },
  { id: "future", title: "待开发区域", label: "SOON", index: "09" }
];

export type SiteModule = ModuleMeta & BuildingContent;

export const siteModules: SiteModule[] = meta.map((m) => {
  const content = buildingContent[m.id];
  return { ...m, ...content, open: content.items.length > 0 };
});
