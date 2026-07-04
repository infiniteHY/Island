# 《我的小世界》互动个人主页技术方案

版本：v1.0  
目标读者：Codex / 前端开发 Agent / 个人维护者  
项目类型：2.5D 等距视角个人小世界、互动作品集、游戏化个人主页  
推荐栈：React + Vite + TypeScript + Phaser 3 + Tiled + Motion + Cloudflare

---

## 0. 项目一句话定义

开发一个「可游玩的个人主页」：用户进入页面后看到 2.5D 浮空岛，小鸟作为主角站在中央广场；点击图书馆、体育馆、金融交易所、游戏厅、展览馆、爵士酒吧、世界树、旅行航线等建筑，小鸟沿街道自动走到对应入口，触发建筑动画，并打开对应内容面板。

这个项目不是传统博客，也不是完整 3D 游戏。它的核心是：

```text
2.5D 游戏场景 + 小鸟导航 + 建筑入口 + 内容展示 + 轻量动画
```

---

## 1. 技术选型结论

### 1.1 MVP 推荐栈

```text
Frontend: React + Vite + TypeScript
Game Layer: Phaser 3.90.x
Map Authoring: Tiled
UI Animation: Motion
Complex Timeline Animation: GSAP，可选
Bird Advanced Animation: Sprite Sheet 起步；Rive 可选
State: Zustand
Content: 本地 JSON / MDX 起步
Deploy: Cloudflare Workers Static Assets
Future Backend: Cloudflare D1 + R2
```

### 1.2 为什么不用 Godot 作为首版

Godot 可以做，但不适合作为这个项目的首版主栈。原因：

1. 这个项目首先是个人主页，需要 Web 访问、SEO、移动端适配、内容面板和后续维护。
2. 你的视觉稿已经是高完成度 2.5D 插画，不需要重建完整 3D 场景。
3. 小鸟移动是固定街道寻路，不是复杂物理、战斗、关卡编辑。
4. React + Phaser 更容易和个人内容系统、路由、Markdown、图片墙、数据卡片集成。
5. Godot Web 导出、资源包体、WebAssembly、页面 UI 集成成本更高，适合后期做「独立游戏版」。

### 1.3 为什么不用 Three.js / React Three Fiber 作为首版

Three.js 适合真 3D 场景，但本项目首版不需要自由旋转相机、真实 3D 模型和复杂光照。若强行上 Three.js，需要把所有建筑重建为 3D 模型，开发成本会明显增加。

### 1.4 为什么选择 Phaser

Phaser 适合浏览器 2D 游戏和 2.5D 伪等距场景，内置 Scene、Sprite、Animation、Tween、Input、Camera、PathFollower 等能力。  
本项目需要的「点击建筑 → 小鸟沿路径移动 → 到达后触发动画」正好匹配 Phaser 的工作方式。

---

## 2. MVP 范围

### 2.1 首版必须完成

首版目标：实现一个能真正访问建筑的互动个人主页。

```text
P0 必须完成：
- 页面加载后展示完整浮空岛场景
- 小鸟默认站在中央广场
- 点击建筑热点，小鸟沿街道移动到入口
- 小鸟移动时播放走路动画，停止时播放 idle 动画
- 到达建筑入口后触发入场动画
- 打开 React 内容面板
- 至少接入 5 个建筑：
  - 图书馆
  - 体育馆
  - 金融交易所
  - 游戏厅
  - 爵士酒吧
- 支持桌面端和移动端基础适配
- 支持 prefers-reduced-motion 降低动画
```

### 2.2 首版暂缓

```text
P1/P2 再做：
- 真正后台 CMS
- 登录系统
- 访客留言
- 小鸟 AI 对话
- 多角色切换
- Godot / 3D 版本
- 复杂成就系统
```

---

## 3. 用户体验设计

### 3.1 页面结构

```text
进入页面
  ↓
Loading：浮空岛轮廓 + 小鸟眨眼
  ↓
Main World：展示完整岛屿
  ↓
用户 hover / tap 建筑
  ↓
建筑高亮 + 标签浮现
  ↓
用户点击建筑
  ↓
小鸟自动寻路移动
  ↓
抵达入口
  ↓
建筑入场动画
  ↓
打开内容面板
```

### 3.2 场景交互规则

1. 建筑可以点击。
2. 街道不可直接自由点击移动，首版只允许点击建筑目的地。
3. 小鸟只能沿道路节点移动，不允许穿墙、穿建筑、走到岛外。
4. 移动期间再次点击其他建筑，可以：
   - MVP：忽略新点击，直到本次移动结束。
   - P1：中断当前路径，重新寻路。
5. 到达建筑后，更新 URL hash 或 query，例如：

```text
/#library
/#sports
/#finance
/#arcade
/#jazz
```

刷新页面时，如果有 hash，可以直接打开对应内容面板，但小鸟仍从中心初始位置开始。

---

## 4. 建筑与内容映射

| 建筑 ID | 中文名 | 功能定位 | MVP 内容 |
|---|---|---|---|
| library | 图书馆 | 书籍、笔记、知识积累 | 书单卡片、读书笔记 |
| sports | 体育馆 | 运动、健康、训练记录 | 训练日志、身体指标、目标 |
| finance | 金融交易所 | 投资思考、交易纪律、复盘 | 持仓逻辑、做 T 笔记、资产配置 |
| arcade | 游戏厅 | 游戏、Hackathon、小项目 | 项目入口、Demo 卡片 |
| gallery | 展览馆 | 摄影作品、视觉作品 | 照片墙、作品集 |
| jazz | 爵士酒吧 | 贝斯、音乐、Jazz bar 项目 | 练习记录、音频入口 |
| world_tree | 世界树 | 技能树、成长轨迹 | 时间线、技能节点 |
| travel | 旅行航线 | 旅行地图、航线、照片 | 地图点位、旅程卡片 |
| workshop | 创意工坊 | 作品和项目孵化 | 后续可并入游戏厅 |
| future | 待开发区域 | 未解锁区域 | Coming soon |

---

## 5. 资产制作规范

### 5.1 原型图资产输入

当前原型图包括：

```text
design.png：完整小世界概念图
bird.png：白色低多边形小鸟设定图
```

Codex 不需要直接做图像生成，但需要按以下路径读取前端资源：

```text
public/assets/world/
  world-base.webp
  world-foreground.webp
  world-labels.webp
  world-shadow.webp
  world-hit-debug.png，可选

public/assets/bird/
  bird-idle-down.png
  bird-idle-up.png
  bird-idle-left.png
  bird-idle-right.png
  bird-walk-down.png
  bird-walk-up.png
  bird-walk-left.png
  bird-walk-right.png
  bird-shadow.png
```

### 5.2 图层拆分

不要把整张图只作为一张背景图使用。至少拆成以下层级：

```text
Layer 0: sky
  - 天空、云、远景光点

Layer 1: island_base
  - 岛体、底座、桥、主道路、瀑布

Layer 2: buildings_back
  - 后方建筑、世界树、远处结构

Layer 3: character
  - 小鸟

Layer 4: foreground_occluders
  - 前景树、栏杆、门廊、建筑遮挡边

Layer 5: effects
  - 粒子、发光、水流、飞艇

Layer 6: ui_overlay
  - React 面板、建筑标签、按钮
```

首版允许只有：

```text
world-base.webp
world-foreground.webp
bird sprites
```

但代码结构必须预留分层。

### 5.3 建议画布尺寸

```text
设计稿基准尺寸：1920 x 1080
Phaser 逻辑坐标：1920 x 1080
桌面端：contain 缩放
移动端：cover + 拖拽平移 + 重点区域居中
```

### 5.4 图片格式

```text
大场景：WebP，质量 80-90
透明前景层：WebP 或 PNG
图标：SVG
小鸟帧动画：PNG sprite sheet
照片作品：WebP / AVIF
```

---

## 6. 地图与寻路设计

### 6.1 核心原则

不要做自由寻路。  
本项目道路是桥、平台、台阶、廊道组成的固定路径，所以使用「道路节点图」最稳。

```text
建筑点击
  → 找到建筑入口节点
  → 从小鸟当前节点到入口节点做 A* / Dijkstra
  → 得到节点序列
  → 转换成 Phaser Path
  → 小鸟沿路径移动
  → 到达后触发建筑事件
```

### 6.2 坐标系统

使用设计稿像素坐标作为世界坐标：

```text
左上角：0,0
右下角：1920,1080
小鸟中心点：x,y
```

所有节点、建筑入口、热点多边形都使用这个坐标系。

### 6.3 world-map.json

创建：

```text
src/game/data/world-map.json
```

示例：

```json
{
  "meta": {
    "width": 1920,
    "height": 1080,
    "version": 1
  },
  "startNodeId": "center",
  "nodes": [
    { "id": "center", "x": 960, "y": 540 },
    { "id": "library_gate", "x": 720, "y": 360 },
    { "id": "sports_gate", "x": 420, "y": 640 },
    { "id": "finance_gate", "x": 1280, "y": 420 },
    { "id": "arcade_gate", "x": 1260, "y": 690 },
    { "id": "jazz_gate", "x": 1040, "y": 830 },
    { "id": "gallery_gate", "x": 1450, "y": 730 },
    { "id": "tree_gate", "x": 960, "y": 300 },
    { "id": "travel_gate", "x": 1500, "y": 200 }
  ],
  "edges": [
    { "from": "center", "to": "library_gate", "cost": 1 },
    { "from": "center", "to": "sports_gate", "cost": 1.2 },
    { "from": "center", "to": "finance_gate", "cost": 1.1 },
    { "from": "center", "to": "arcade_gate", "cost": 1.3 },
    { "from": "center", "to": "jazz_gate", "cost": 1.4 },
    { "from": "arcade_gate", "to": "gallery_gate", "cost": 0.8 },
    { "from": "library_gate", "to": "tree_gate", "cost": 0.9 },
    { "from": "finance_gate", "to": "travel_gate", "cost": 1.5 }
  ],
  "buildings": [
    {
      "id": "library",
      "name": "图书馆",
      "targetNodeId": "library_gate",
      "title": "图书馆",
      "subtitle": "收藏我读过的书与笔记",
      "route": "/library",
      "hotspot": {
        "type": "polygon",
        "points": [[610, 260], [800, 250], [850, 420], [640, 450]]
      },
      "effects": {
        "hover": "glow",
        "arrival": "book_pages"
      }
    },
    {
      "id": "sports",
      "name": "体育馆",
      "targetNodeId": "sports_gate",
      "title": "体育馆",
      "subtitle": "记录运动与健康",
      "route": "/sports",
      "hotspot": {
        "type": "polygon",
        "points": [[250, 520], [540, 500], [600, 720], [280, 760]]
      },
      "effects": {
        "hover": "pulse",
        "arrival": "heartbeat"
      }
    },
    {
      "id": "finance",
      "name": "金融交易所",
      "targetNodeId": "finance_gate",
      "title": "金融交易所",
      "subtitle": "记录投资与思考",
      "route": "/finance",
      "hotspot": {
        "type": "polygon",
        "points": [[1160, 280], [1410, 300], [1420, 520], [1150, 520]]
      },
      "effects": {
        "hover": "line_chart",
        "arrival": "candles"
      }
    },
    {
      "id": "arcade",
      "name": "游戏厅",
      "targetNodeId": "arcade_gate",
      "title": "游戏厅",
      "subtitle": "小游戏、Hackathon、实验项目",
      "route": "/arcade",
      "hotspot": {
        "type": "polygon",
        "points": [[1160, 570], [1400, 550], [1440, 760], [1160, 780]]
      },
      "effects": {
        "hover": "neon",
        "arrival": "pixel_burst"
      }
    },
    {
      "id": "jazz",
      "name": "爵士酒吧",
      "targetNodeId": "jazz_gate",
      "title": "爵士酒吧",
      "subtitle": "贝斯、音乐与节奏",
      "route": "/jazz",
      "hotspot": {
        "type": "polygon",
        "points": [[900, 720], [1130, 720], [1160, 930], [880, 930]]
      },
      "effects": {
        "hover": "warm_light",
        "arrival": "jazz_door"
      }
    }
  ]
}
```

### 6.4 Tiled 工作流

推荐用 Tiled 辅助标注地图：

```text
1. 新建 1920x1080 地图
2. 导入 world-base.webp 作为 image layer
3. 新建 object layer: road_nodes
4. 用 point object 标记道路节点
5. 新建 object layer: building_hotspots
6. 用 polygon object 标记建筑点击区域
7. 给 object 添加自定义属性：
   - id
   - type
   - targetNodeId
   - route
8. 导出 JSON
9. 编写 scripts/convert-tiled-map.ts 转成 src/game/data/world-map.json
```

首版可以不用 Tiled，直接手写 world-map.json。  
但代码结构要支持未来从 Tiled JSON 转换。

---

## 7. 前端工程结构

### 7.1 推荐目录

```text
my-little-world/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  public/
    assets/
      world/
      bird/
      effects/
      ui/
  src/
    main.tsx
    App.tsx
    styles/
      globals.css
      tokens.css
    game/
      PhaserGame.tsx
      config.ts
      scenes/
        BootScene.ts
        PreloadScene.ts
        WorldScene.ts
      systems/
        PathGraph.ts
        BirdController.ts
        BuildingController.ts
        EffectsManager.ts
        DepthSortSystem.ts
        CameraController.ts
      data/
        world-map.json
      types/
        world.ts
      utils/
        geometry.ts
        eventBus.ts
    ui/
      WorldOverlay.tsx
      BuildingPanel.tsx
      BuildingCard.tsx
      TopBar.tsx
      LoadingScreen.tsx
    content/
      buildings.ts
      library.json
      sports.json
      finance.json
      arcade.json
      jazz.json
    routes/
      HomeRoute.tsx
    workers/
      api.ts，可选
```

### 7.2 依赖安装

```bash
npm create vite@latest my-little-world -- --template react-ts
cd my-little-world

npm install phaser@^3.90.0 zustand motion clsx
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom eslint prettier
```

可选：

```bash
npm install gsap
npm install @rive-app/react-canvas
npm install @mdx-js/react
npm install gray-matter
npm install zod
npm install -D playwright
```

### 7.3 package.json scripts

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "check": "npm run lint && npm run test && npm run build"
  }
}
```

---

## 8. TypeScript 数据类型

创建：

```text
src/game/types/world.ts
```

```ts
export type NodeId = string;
export type BuildingId =
  | "library"
  | "sports"
  | "finance"
  | "arcade"
  | "gallery"
  | "jazz"
  | "world_tree"
  | "travel"
  | "future";

export type WorldNode = {
  id: NodeId;
  x: number;
  y: number;
};

export type WorldEdge = {
  from: NodeId;
  to: NodeId;
  cost?: number;
};

export type PolygonHotspot = {
  type: "polygon";
  points: [number, number][];
};

export type RectHotspot = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BuildingConfig = {
  id: BuildingId;
  name: string;
  title: string;
  subtitle: string;
  targetNodeId: NodeId;
  route: string;
  hotspot: PolygonHotspot | RectHotspot;
  effects?: {
    hover?: string;
    arrival?: string;
  };
};

export type WorldMapConfig = {
  meta: {
    width: number;
    height: number;
    version: number;
  };
  startNodeId: NodeId;
  nodes: WorldNode[];
  edges: WorldEdge[];
  buildings: BuildingConfig[];
};
```

---

## 9. 状态管理

创建：

```text
src/ui/worldStore.ts
```

```ts
import { create } from "zustand";
import type { BuildingConfig, BuildingId, NodeId } from "../game/types/world";

type WorldStore = {
  selectedBuildingId: BuildingId | null;
  activeBuilding: BuildingConfig | null;
  isBirdMoving: boolean;
  currentNodeId: NodeId;
  reducedMotion: boolean;
  openBuilding: (building: BuildingConfig) => void;
  closeBuilding: () => void;
  setBirdMoving: (moving: boolean) => void;
  setCurrentNodeId: (nodeId: NodeId) => void;
  setReducedMotion: (value: boolean) => void;
};

export const useWorldStore = create<WorldStore>((set) => ({
  selectedBuildingId: null,
  activeBuilding: null,
  isBirdMoving: false,
  currentNodeId: "center",
  reducedMotion: false,
  openBuilding: (building) =>
    set({
      selectedBuildingId: building.id,
      activeBuilding: building
    }),
  closeBuilding: () =>
    set({
      selectedBuildingId: null,
      activeBuilding: null
    }),
  setBirdMoving: (moving) => set({ isBirdMoving: moving }),
  setCurrentNodeId: (nodeId) => set({ currentNodeId: nodeId }),
  setReducedMotion: (value) => set({ reducedMotion: value })
}));
```

---

## 10. Game 与 React 通信

### 10.1 EventBus

创建：

```text
src/game/utils/eventBus.ts
```

```ts
import Phaser from "phaser";

export const gameEvents = new Phaser.Events.EventEmitter();

export const GameEvent = {
  BUILDING_CLICKED: "building:clicked",
  BUILDING_ARRIVED: "building:arrived",
  BIRD_MOVE_START: "bird:move_start",
  BIRD_MOVE_END: "bird:move_end",
  PRELOAD_PROGRESS: "preload:progress"
} as const;
```

### 10.2 React 监听 Phaser 事件

在 `WorldOverlay.tsx` 中：

```ts
useEffect(() => {
  const onArrived = (building: BuildingConfig) => {
    useWorldStore.getState().openBuilding(building);
    window.history.replaceState(null, "", `#${building.id}`);
  };

  gameEvents.on(GameEvent.BUILDING_ARRIVED, onArrived);
  return () => {
    gameEvents.off(GameEvent.BUILDING_ARRIVED, onArrived);
  };
}, []);
```

---

## 11. Phaser 场景设计

### 11.1 PhaserGame.tsx

创建：

```text
src/game/PhaserGame.tsx
```

```tsx
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createPhaserConfig } from "./config";

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game(
      createPhaserConfig(containerRef.current)
    );

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="phaser-container" />;
}
```

### 11.2 config.ts

```ts
import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { WorldScene } from "./scenes/WorldScene";

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1920,
    height: 1080,
    backgroundColor: "#0f8b96",
    scene: [BootScene, PreloadScene, WorldScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false
    },
    input: {
      activePointers: 3
    }
  };
}
```

### 11.3 PreloadScene.ts

```ts
import Phaser from "phaser";
import { gameEvents, GameEvent } from "../utils/eventBus";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.on("progress", (value: number) => {
      gameEvents.emit(GameEvent.PRELOAD_PROGRESS, value);
    });

    this.load.image("world-base", "/assets/world/world-base.webp");
    this.load.image("world-foreground", "/assets/world/world-foreground.webp");
    this.load.image("bird-shadow", "/assets/bird/bird-shadow.png");

    this.load.spritesheet("bird-walk-down", "/assets/bird/bird-walk-down.png", {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet("bird-idle-down", "/assets/bird/bird-idle-down.png", {
      frameWidth: 128,
      frameHeight: 128
    });
  }

  create() {
    this.scene.start("WorldScene");
  }
}
```

### 11.4 WorldScene.ts

WorldScene 负责：

```text
- 加载世界背景
- 初始化道路图
- 初始化建筑点击区
- 初始化小鸟
- 管理 hover、click、arrival
- 控制环境动画
```

伪代码：

```ts
import Phaser from "phaser";
import worldMap from "../data/world-map.json";
import { PathGraph } from "../systems/PathGraph";
import { BirdController } from "../systems/BirdController";
import { BuildingController } from "../systems/BuildingController";
import { EffectsManager } from "../systems/EffectsManager";
import { DepthSortSystem } from "../systems/DepthSortSystem";

export class WorldScene extends Phaser.Scene {
  private graph!: PathGraph;
  private bird!: BirdController;
  private buildings!: BuildingController;
  private effects!: EffectsManager;
  private depthSort!: DepthSortSystem;

  constructor() {
    super("WorldScene");
  }

  create() {
    this.add.image(960, 540, "world-base");

    this.graph = new PathGraph(worldMap);
    this.effects = new EffectsManager(this);
    this.bird = new BirdController(this, this.graph, worldMap.startNodeId);
    this.buildings = new BuildingController(this, worldMap, this.bird, this.effects);
    this.depthSort = new DepthSortSystem(this);

    this.add.image(960, 540, "world-foreground").setDepth(1000);

    this.effects.createAmbientEffects();
  }

  update(time: number, delta: number) {
    this.bird.update(time, delta);
    this.depthSort.update();
  }
}
```

---

## 12. PathGraph 寻路系统

创建：

```text
src/game/systems/PathGraph.ts
```

功能：

```text
- 根据 world-map.json 建立邻接表
- 支持 getNode(id)
- 支持 findPath(start, goal)
- 使用 A*，启发式为欧氏距离
```

代码骨架：

```ts
import type { NodeId, WorldMapConfig, WorldNode } from "../types/world";

export class PathGraph {
  private nodes = new Map<NodeId, WorldNode>();
  private edges = new Map<NodeId, { to: NodeId; cost: number }[]>();

  constructor(config: WorldMapConfig) {
    for (const node of config.nodes) {
      this.nodes.set(node.id, node);
      this.edges.set(node.id, []);
    }

    for (const edge of config.edges) {
      const from = this.edges.get(edge.from);
      const to = this.edges.get(edge.to);
      if (!from || !to) continue;

      const a = this.getNode(edge.from);
      const b = this.getNode(edge.to);
      const fallbackCost = Math.hypot(a.x - b.x, a.y - b.y);
      const cost = edge.cost ?? fallbackCost;

      from.push({ to: edge.to, cost });
      to.push({ to: edge.from, cost });
    }
  }

  getNode(id: NodeId): WorldNode {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Missing node: ${id}`);
    return node;
  }

  findPath(start: NodeId, goal: NodeId): WorldNode[] {
    if (start === goal) return [this.getNode(start)];

    const open = new Set<NodeId>([start]);
    const cameFrom = new Map<NodeId, NodeId>();
    const gScore = new Map<NodeId, number>();
    const fScore = new Map<NodeId, number>();

    for (const id of this.nodes.keys()) {
      gScore.set(id, Number.POSITIVE_INFINITY);
      fScore.set(id, Number.POSITIVE_INFINITY);
    }

    gScore.set(start, 0);
    fScore.set(start, this.heuristic(start, goal));

    while (open.size > 0) {
      const current = [...open].reduce((best, id) => {
        return (fScore.get(id) ?? Infinity) < (fScore.get(best) ?? Infinity)
          ? id
          : best;
      });

      if (current === goal) {
        return this.reconstructPath(cameFrom, current);
      }

      open.delete(current);

      for (const edge of this.edges.get(current) ?? []) {
        const tentative = (gScore.get(current) ?? Infinity) + edge.cost;

        if (tentative < (gScore.get(edge.to) ?? Infinity)) {
          cameFrom.set(edge.to, current);
          gScore.set(edge.to, tentative);
          fScore.set(edge.to, tentative + this.heuristic(edge.to, goal));
          open.add(edge.to);
        }
      }
    }

    throw new Error(`No path found from ${start} to ${goal}`);
  }

  private heuristic(aId: NodeId, bId: NodeId) {
    const a = this.getNode(aId);
    const b = this.getNode(bId);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private reconstructPath(cameFrom: Map<NodeId, NodeId>, current: NodeId) {
    const ids = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      ids.unshift(current);
    }
    return ids.map((id) => this.getNode(id));
  }
}
```

---

## 13. 小鸟控制器

### 13.1 行为状态

```ts
type BirdState = "idle" | "walking" | "arriving";
```

### 13.2 BirdController 职责

```text
- 持有当前节点 currentNodeId
- 根据目标节点请求路径
- 把节点序列转换成 Phaser.Curves.Path
- 播放移动 Tween 或 PathFollower
- 根据移动方向切换动画
- 移动完成后更新 currentNodeId
- 对外暴露 moveToNode(targetNodeId)
```

### 13.3 方向判断

```text
dx > 0 且 |dx| > |dy|：walk-right
dx < 0 且 |dx| > |dy|：walk-left
dy > 0：walk-down
dy < 0：walk-up
```

### 13.4 移动速度

```text
默认速度：220 px/s
短路径最小时长：300ms
长路径按距离自动计算
prefers-reduced-motion: true 时，移动时间缩短或直接瞬移
```

### 13.5 代码骨架

```ts
import Phaser from "phaser";
import type { NodeId, WorldNode } from "../types/world";
import { PathGraph } from "./PathGraph";
import { gameEvents, GameEvent } from "../utils/eventBus";

export class BirdController {
  private scene: Phaser.Scene;
  private graph: PathGraph;
  private sprite: Phaser.GameObjects.PathFollower;
  private currentNodeId: NodeId;
  private isMoving = false;
  private speed = 220;

  constructor(scene: Phaser.Scene, graph: PathGraph, startNodeId: NodeId) {
    this.scene = scene;
    this.graph = graph;
    this.currentNodeId = startNodeId;

    const start = graph.getNode(startNodeId);

    this.sprite = scene.add.follower(
      new Phaser.Curves.Path(start.x, start.y),
      start.x,
      start.y,
      "bird-idle-down",
      0
    );

    this.sprite.setDepth(start.y);
    this.sprite.setScale(0.75);

    this.createAnimations();
    this.sprite.anims.play("bird-idle-down");
  }

  getCurrentNodeId() {
    return this.currentNodeId;
  }

  getIsMoving() {
    return this.isMoving;
  }

  async moveToNode(targetNodeId: NodeId): Promise<void> {
    if (this.isMoving) return;
    if (this.currentNodeId === targetNodeId) return;

    const nodes = this.graph.findPath(this.currentNodeId, targetNodeId);
    const distance = this.getPathDistance(nodes);
    const duration = Math.max(300, (distance / this.speed) * 1000);

    const path = new Phaser.Curves.Path(nodes[0].x, nodes[0].y);
    for (const node of nodes.slice(1)) {
      path.lineTo(node.x, node.y);
    }

    this.isMoving = true;
    gameEvents.emit(GameEvent.BIRD_MOVE_START, targetNodeId);

    this.playWalkAnimation(nodes);

    await new Promise<void>((resolve) => {
      this.sprite.setPath(path, {
        duration,
        ease: "Sine.easeInOut",
        rotateToPath: false,
        onUpdate: () => {
          this.sprite.setDepth(this.sprite.y);
        },
        onComplete: () => {
          resolve();
        }
      });

      this.sprite.startFollow();
    });

    this.currentNodeId = targetNodeId;
    this.isMoving = false;
    this.sprite.anims.play("bird-idle-down", true);
    gameEvents.emit(GameEvent.BIRD_MOVE_END, targetNodeId);
  }

  update(_time: number, _delta: number) {
    this.sprite.setDepth(this.sprite.y);
  }

  private createAnimations() {
    const anims = this.scene.anims;

    if (!anims.exists("bird-walk-down")) {
      anims.create({
        key: "bird-walk-down",
        frames: anims.generateFrameNumbers("bird-walk-down", { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!anims.exists("bird-idle-down")) {
      anims.create({
        key: "bird-idle-down",
        frames: anims.generateFrameNumbers("bird-idle-down", { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }
  }

  private playWalkAnimation(nodes: WorldNode[]) {
    if (nodes.length < 2) {
      this.sprite.anims.play("bird-walk-down", true);
      return;
    }

    const a = nodes[0];
    const b = nodes[1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.sprite.anims.play(dx > 0 ? "bird-walk-right" : "bird-walk-left", true);
    } else {
      this.sprite.anims.play(dy > 0 ? "bird-walk-down" : "bird-walk-up", true);
    }
  }

  private getPathDistance(nodes: WorldNode[]) {
    let total = 0;
    for (let i = 1; i < nodes.length; i++) {
      total += Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y);
    }
    return total;
  }
}
```

---

## 14. 建筑点击系统

### 14.1 BuildingController 职责

```text
- 读取 worldMap.buildings
- 为每个建筑创建透明点击热点
- hover 时触发高亮
- click 时调用 bird.moveToNode
- 到达后触发 arrival effect
- 通知 React 打开内容面板
```

### 14.2 多边形热点创建

```ts
function createPolygonHitArea(
  scene: Phaser.Scene,
  points: [number, number][]
): Phaser.GameObjects.Polygon {
  const polygon = new Phaser.Geom.Polygon(points.flat());
  const center = Phaser.Geom.Polygon.GetAABB(polygon).getCenter();

  const gameObject = scene.add.polygon(
    center.x,
    center.y,
    points.map(([x, y]) => new Phaser.Math.Vector2(x - center.x, y - center.y)),
    0xffffff,
    0
  );

  gameObject.setInteractive(
    new Phaser.Geom.Polygon(points.map(([x, y]) => new Phaser.Math.Vector2(x - center.x, y - center.y))),
    Phaser.Geom.Polygon.Contains
  );

  return gameObject;
}
```

### 14.3 点击流程

```ts
hotspot.on("pointerover", () => {
  effects.playHover(building);
});

hotspot.on("pointerout", () => {
  effects.stopHover(building);
});

hotspot.on("pointerup", async () => {
  if (bird.getIsMoving()) return;

  await bird.moveToNode(building.targetNodeId);

  effects.playArrival(building);
  gameEvents.emit(GameEvent.BUILDING_ARRIVED, building);
});
```

---

## 15. 动效系统

### 15.1 环境动效

MVP 需要实现：

```text
- 云缓慢漂浮
- 瀑布循环位移或 alpha 波动
- 中央小鸟/水晶微弱发光
- 建筑 hover 发光
- 游戏厅霓虹闪烁
- 爵士酒吧暖光呼吸
```

### 15.2 建筑入场动效

| 建筑 | arrival effect |
|---|---|
| 图书馆 | 书页粒子飞出 |
| 体育馆 | 心率线跳动 |
| 金融交易所 | K 线闪现 |
| 游戏厅 | 像素粒子爆开 |
| 展览馆 | 相片边框展开 |
| 爵士酒吧 | 门灯亮起、镜头轻微下沉 |
| 世界树 | 叶片光点上升 |
| 旅行航线 | 飞艇沿虚线路径移动 |

### 15.3 EffectsManager 骨架

```ts
import Phaser from "phaser";
import type { BuildingConfig } from "../types/world";

export class EffectsManager {
  constructor(private scene: Phaser.Scene) {}

  createAmbientEffects() {
    this.createFloatingClouds();
    this.createCentralGlow();
  }

  playHover(building: BuildingConfig) {
    switch (building.effects?.hover) {
      case "neon":
        this.playNeonHover(building);
        break;
      case "pulse":
        this.playPulseHover(building);
        break;
      default:
        this.playGenericGlow(building);
    }
  }

  stopHover(_building: BuildingConfig) {
    // stop tweens / hide highlight
  }

  playArrival(building: BuildingConfig) {
    switch (building.effects?.arrival) {
      case "book_pages":
        this.playBookPages();
        break;
      case "heartbeat":
        this.playHeartbeat();
        break;
      case "jazz_door":
        this.playJazzDoor();
        break;
      default:
        this.playSparkle();
    }
  }

  private createFloatingClouds() {}
  private createCentralGlow() {}
  private playGenericGlow(_building: BuildingConfig) {}
  private playNeonHover(_building: BuildingConfig) {}
  private playPulseHover(_building: BuildingConfig) {}
  private playBookPages() {}
  private playHeartbeat() {}
  private playJazzDoor() {}
  private playSparkle() {}
}
```

---

## 16. React UI 设计

### 16.1 App.tsx

```tsx
import { PhaserGame } from "./game/PhaserGame";
import { WorldOverlay } from "./ui/WorldOverlay";
import "./styles/globals.css";

export default function App() {
  return (
    <main className="app-shell">
      <PhaserGame />
      <WorldOverlay />
    </main>
  );
}
```

### 16.2 WorldOverlay.tsx

职责：

```text
- 显示顶部标题：我的小世界
- 显示右上角快捷菜单
- 显示当前建筑面板
- 显示 loading 进度
- 显示移动状态提示
```

```tsx
import { AnimatePresence } from "motion/react";
import { useWorldStore } from "./worldStore";
import { BuildingPanel } from "./BuildingPanel";

export function WorldOverlay() {
  const activeBuilding = useWorldStore((s) => s.activeBuilding);

  return (
    <div className="world-overlay">
      <header className="world-title">
        <h1>我的小世界</h1>
        <p>MY LITTLE WORLD</p>
      </header>

      <AnimatePresence>
        {activeBuilding && (
          <BuildingPanel building={activeBuilding} />
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 16.3 BuildingPanel.tsx

```tsx
import { motion } from "motion/react";
import type { BuildingConfig } from "../game/types/world";
import { useWorldStore } from "./worldStore";
import { getContentByBuildingId } from "../content/buildings";

export function BuildingPanel({ building }: { building: BuildingConfig }) {
  const close = useWorldStore((s) => s.closeBuilding);
  const content = getContentByBuildingId(building.id);

  return (
    <motion.aside
      className="building-panel"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <button className="panel-close" onClick={close}>
        关闭
      </button>

      <h2>{building.title}</h2>
      <p>{building.subtitle}</p>

      <section className="panel-content">
        {content.items.map((item) => (
          <article key={item.id} className="content-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </motion.aside>
  );
}
```

---

## 17. 内容数据格式

### 17.1 content/buildings.ts

```ts
import library from "./library.json";
import sports from "./sports.json";
import finance from "./finance.json";
import arcade from "./arcade.json";
import jazz from "./jazz.json";
import type { BuildingId } from "../game/types/world";

const contentMap = {
  library,
  sports,
  finance,
  arcade,
  jazz
};

export function getContentByBuildingId(id: BuildingId) {
  return contentMap[id as keyof typeof contentMap] ?? {
    title: "待开发",
    items: []
  };
}
```

### 17.2 library.json

```json
{
  "title": "图书馆",
  "items": [
    {
      "id": "book-001",
      "title": "最近读过的书",
      "description": "这里放书名、摘录、读书笔记和个人理解。",
      "tags": ["reading", "notes"],
      "url": ""
    }
  ]
}
```

### 17.3 finance.json

```json
{
  "title": "金融交易所",
  "items": [
    {
      "id": "finance-001",
      "title": "做 T 交易纪律",
      "description": "记录仓位、成本、止盈、止损、复盘，不做无依据交易。",
      "tags": ["trading", "review"],
      "url": ""
    }
  ]
}
```

---

## 18. 样式系统

### 18.1 视觉基调

```text
风格：纪念碑谷式、低多边形、暖白石材、青绿色天空、金色点缀
主色：teal / turquoise
辅色：warm cream / gold
强调：neon purple for arcade, warm amber for jazz
```

### 18.2 CSS tokens

创建：

```text
src/styles/tokens.css
```

```css
:root {
  --color-bg: #0f8b96;
  --color-panel: rgba(255, 248, 226, 0.9);
  --color-panel-border: rgba(255, 255, 255, 0.55);
  --color-text: #fff4d8;
  --color-text-dark: #36515a;
  --color-accent: #f3c96b;
  --color-teal: #38b9bd;
  --shadow-panel: 0 24px 80px rgba(24, 66, 74, 0.32);
  --radius-panel: 24px;
  --font-title: ui-serif, "Songti SC", "Noto Serif CJK SC", serif;
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
}
```

### 18.3 globals.css

```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg);
}

.app-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.phaser-container {
  position: absolute;
  inset: 0;
}

.phaser-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.world-overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 10;
}

.world-title {
  position: absolute;
  top: 32px;
  left: 36px;
  color: var(--color-text);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.world-title h1 {
  margin: 0;
  font-family: var(--font-title);
  font-size: clamp(32px, 5vw, 64px);
  letter-spacing: 0.04em;
}

.world-title p {
  margin: 4px 0 0;
  font-size: 14px;
  letter-spacing: 0.08em;
}

.building-panel {
  pointer-events: auto;
  position: absolute;
  right: 32px;
  top: 96px;
  width: min(420px, calc(100vw - 48px));
  max-height: calc(100vh - 140px);
  overflow: auto;
  padding: 24px;
  color: var(--color-text-dark);
  background: var(--color-panel);
  border: 1px solid var(--color-panel-border);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(18px);
}

.panel-close {
  float: right;
}

.content-card {
  padding: 16px;
  margin-top: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
}
```

---

## 19. 移动端适配

### 19.1 桌面

```text
- Phaser Scale.FIT
- 保持完整岛屿可见
- 面板从右侧进入
```

### 19.2 手机

```text
- 初始镜头聚焦中央广场
- 支持双指缩放，可 P1 实现
- 支持拖拽平移，可 P1 实现
- 建筑点击区需要放大容错
- 内容面板改为底部抽屉
```

CSS：

```css
@media (max-width: 768px) {
  .world-title {
    top: 18px;
    left: 18px;
  }

  .building-panel {
    left: 12px;
    right: 12px;
    top: auto;
    bottom: 12px;
    width: auto;
    max-height: 56vh;
    border-radius: 22px;
  }
}
```

---

## 20. 可访问性与动效降级

### 20.1 prefers-reduced-motion

```ts
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
useWorldStore.getState().setReducedMotion(reduced);
```

当 reducedMotion 为 true：

```text
- 关闭环境粒子
- 小鸟移动时间缩短为 120ms 或直接跳转
- UI 面板只做 fade，不做大位移
- 关闭闪烁、霓虹频闪
```

### 20.2 键盘支持

首版可以支持：

```text
Tab 聚焦建筑快捷菜单
Enter 打开建筑
Esc 关闭内容面板
```

---

## 21. 性能目标

### 21.1 预算

```text
首屏 JS：目标 < 350KB gzip，允许 MVP 临时超出
首屏图片：目标 < 1.5MB
总资源首屏：目标 < 3MB
FPS：桌面 60fps，移动端 >= 30fps
最大纹理：不超过 4096x4096
```

### 21.2 优化策略

```text
- 大图用 WebP
- 懒加载建筑内容图片
- 非首屏作品图不预加载
- 粒子数量控制在 50-150
- 小鸟 sprite sheet 尺寸不要过大
- 调试热点只在 dev 开启
```

---

## 22. Cloudflare 部署设计

### 22.1 MVP：纯静态部署

```text
npm run build
dist/ 上传到 Cloudflare Workers Static Assets 或 Pages
```

### 22.2 wrangler 配置示例

```toml
name = "my-little-world"
main = "src/worker.ts"
compatibility_date = "2026-06-27"

[assets]
directory = "./dist"
binding = "ASSETS"
```

### 22.3 后续扩展

```text
Cloudflare D1:
- 存建筑内容 metadata
- 存书籍、项目、训练记录、旅行点

Cloudflare R2:
- 存摄影作品
- 存音频
- 存大图
- 存可下载作品文件
```

### 22.4 API 预留

```text
GET /api/buildings
GET /api/buildings/:id/items
GET /api/gallery
GET /api/travel
```

MVP 不实现 API，先读本地 JSON。

---

## 23. 测试计划

### 23.1 单元测试

```text
PathGraph:
- 能找到 center -> library_gate
- 找不到路径时抛出明确错误
- edge 是双向的
- start === goal 时返回单节点路径

geometry:
- 点在 polygon 内判断正确
- rect hotspot 判断正确
```

### 23.2 组件测试

```text
BuildingPanel:
- 能显示建筑标题
- close 按钮可以关闭
- content items 渲染正确
```

### 23.3 手动验收

```text
- 页面打开无报错
- 小鸟出现在中央
- 点击图书馆，小鸟走到图书馆入口
- 点击体育馆，小鸟走到体育馆入口
- 到达后出现对应面板
- 关闭面板后仍停留在当前节点
- 移动期间重复点击不会崩溃
- 视口缩放时画面不变形
- 移动端可以点击主要建筑
```

---

## 24. Codex 开发任务拆分

### Task 0：初始化工程

目标：创建 React + Vite + TypeScript 工程，安装依赖，完成基础布局。

要求：

```text
- 创建 src/game、src/ui、src/content、src/styles 目录
- 接入 PhaserGame 组件
- 页面出现 Phaser canvas
- npm run check 通过
```

### Task 1：加载世界背景

目标：在 Phaser 中加载 world-base.webp 和 world-foreground.webp。

要求：

```text
- world-base 居中显示
- world-foreground 覆盖在前景层
- 画布保持 1920x1080 逻辑尺寸
- 浏览器缩放不变形
```

### Task 2：实现地图数据与寻路

目标：实现 world-map.json、WorldMapConfig 类型、PathGraph。

要求：

```text
- A* 可用
- 单元测试覆盖基础路径
- graph 支持无向边
```

### Task 3：实现小鸟控制器

目标：小鸟能从 center 移动到目标节点。

要求：

```text
- 小鸟显示在 center
- moveToNode 可沿路径移动
- 移动中播放 walk 动画
- 到达后 idle
- setDepth 跟随 y 值
```

### Task 4：实现建筑热点

目标：点击建筑热点，小鸟走到入口。

要求：

```text
- 读取 world-map.json buildings
- 创建透明 polygon hotspot
- hover 有反馈
- click 后调用 bird.moveToNode
- 到达后 emit BUILDING_ARRIVED
```

### Task 5：实现 React 内容面板

目标：到达建筑后打开对应内容面板。

要求：

```text
- WorldOverlay 监听 BUILDING_ARRIVED
- BuildingPanel 展示 title/subtitle/items
- close 按钮关闭
- URL hash 更新
```

### Task 6：实现基础环境动效

目标：让画面变得有生命。

要求：

```text
- 云漂浮
- 中央光效呼吸
- 游戏厅霓虹 hover
- 爵士酒吧暖光 hover
- reduced motion 时关闭强动效
```

### Task 7：移动端适配

目标：手机可访问。

要求：

```text
- 面板改底部抽屉
- 标题缩小
- 点击热点不偏移
- 横竖屏都不崩
```

### Task 8：部署

目标：可发布到 Cloudflare。

要求：

```text
- npm run build 成功
- dist 可预览
- 提供 wrangler.toml
- README 写清部署流程
```

---

## 25. 给 Codex 的完整执行提示词

可以把下面这段直接交给 Codex：

```text
你是前端游戏化互动主页开发工程师。请基于当前仓库实现「我的小世界」MVP。

技术栈：
- React + Vite + TypeScript
- Phaser 3.90.x
- Zustand
- Motion
- 本地 JSON 内容
- 目标部署 Cloudflare Static Assets

核心功能：
1. 页面展示 1920x1080 的 2.5D 浮空岛场景。
2. 小鸟默认在 center 节点。
3. 地图数据来自 src/game/data/world-map.json，包含 nodes、edges、buildings。
4. 点击建筑 polygon hotspot 后，小鸟通过 A* 沿道路节点移动到 building.targetNodeId。
5. 小鸟移动时播放 walk 动画，到达后播放 idle 动画。
6. 到达建筑后触发 BUILDING_ARRIVED 事件，React 打开 BuildingPanel。
7. BuildingPanel 根据 building.id 读取 src/content/*.json 内容并显示。
8. 实现 hover 高亮、基础环境动效、移动端底部抽屉样式。
9. 实现 PathGraph 单元测试。
10. 保持代码模块化，避免把所有逻辑写在 WorldScene 一个文件里。

请按以下顺序实现：
- 初始化目录和基础样式
- PhaserGame 和 config
- PreloadScene、WorldScene
- world-map 类型和 JSON
- PathGraph + tests
- BirdController
- BuildingController
- EffectsManager
- React WorldOverlay + BuildingPanel
- content JSON 示例
- README 和运行说明

验收标准：
- npm run check 通过
- npm run dev 后可以看到场景
- 点击至少 5 个建筑，小鸟能移动到入口并打开对应面板
- 不出现穿墙式自由移动
- 移动期间重复点击不报错
- 移动端面板样式正常
```

---

## 26. README 初稿

```md
# My Little World

一个 2.5D 游戏化个人主页。小鸟会沿着浮空岛街道走到不同建筑，访问图书馆、体育馆、金融交易所、游戏厅、爵士酒吧等个人内容模块。

## Tech Stack

- React
- Vite
- TypeScript
- Phaser 3
- Zustand
- Motion
- Cloudflare Static Assets

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`text
src/game     Phaser 场景、寻路、小鸟、建筑热点
src/ui       React UI 面板
src/content  建筑内容数据
src/styles   全局样式
public/assets 静态资源
\`\`\`

## Map Data

地图配置位于：

\`\`\`text
src/game/data/world-map.json
\`\`\`

其中：

- nodes 表示道路节点
- edges 表示可通行道路
- buildings 表示建筑热点和目标入口

## MVP Features

- 点击建筑
- 小鸟沿路移动
- 建筑入场动效
- 内容面板
- 移动端适配
```

---

## 27. 关键风险与处理

### 风险 1：图层没拆，遮挡关系不自然

处理：

```text
首版最少拆出 world-base 和 world-foreground。
小鸟 depth 用 y 值排序。
前景层放在小鸟上方。
```

### 风险 2：坐标标注不准

处理：

```text
开发 debug 模式：
- 显示所有 nodes
- 显示 edges
- 显示 hotspot polygon
- 显示当前小鸟坐标
```

快捷键：

```text
D: toggle debug layer
```

### 风险 3：小鸟动画资源不完整

处理：

```text
没有完整八方向动画时：
- 先只用 idle-down 和 walk-down
- 左右移动通过 scaleX 翻转
- 后续补 walk-up/down/left/right
```

### 风险 4：包体太大

处理：

```text
- 大图压缩为 WebP
- 粒子用 Phaser Graphics 生成
- 内容图片懒加载
- 后期使用 R2 存大图
```

### 风险 5：Phaser 与 React 状态冲突

处理：

```text
- Phaser 不直接操作 React DOM
- React 不直接操作 Phaser 对象
- 双方只通过 gameEvents 和 Zustand 通信
```

---

## 28. 后续路线图

### v0.1

```text
- 静态小世界
- 小鸟可走到 5 个建筑
- 内容面板
```

### v0.2

```text
- 接入全部建筑
- 完成 hover 和 arrival 动效
- 移动端适配
```

### v0.3

```text
- 世界树技能树
- 旅行航线飞行动画
- 展览馆照片墙
```

### v0.4

```text
- D1 内容数据库
- R2 图片和音频资源
- 简易后台
```

### v1.0

```text
- 完整个人小世界主页
- 可公开访问
- 可持续更新内容
- 可作为作品集 / 比赛项目展示
```

---

## 29. 最终开发优先级

请优先保证：

```text
1. 点击建筑 → 小鸟走过去 → 打开内容面板
2. 路径不穿墙
3. 代码结构清晰
4. 资源替换方便
5. 后续能继续加建筑和内容
```

暂时不要追求：

```text
- 复杂 3D
- 完整游戏系统
- 登录权限
- 大而全 CMS
- 过度粒子特效
```

项目成功的关键不是技术炫技，而是让用户一眼看到「这是一个真的能访问、能成长、能记录我的个人世界」。

---

## 30. 调研依据

本方案参考了以下官方文档和技术资料：

- Phaser 官方文档：Scene、Sprite、Animation、PathFollower、Tilemap/Tiled JSON
- Tiled 官方文档：2D level editor、object annotation、JSON map export
- React 官方文档：使用 Vite 等构建工具创建 React 应用
- Vite 官方文档：React + TypeScript 工程初始化
- Motion 官方文档：React UI 动画
- GSAP 官方文档：Tween / Timeline
- Cloudflare Workers Static Assets 官方文档
- Cloudflare D1 官方文档
- Cloudflare R2 官方文档
