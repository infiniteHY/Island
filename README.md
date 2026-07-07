# Island / My Little World

一个个人网站项目。当前版本不是传统作品集首页，而是一个带 3D 交互的个人世界：首屏是玻璃瓶里的兴趣物件，作品区展示项目，后段是可点击的 3D 房间。

当前线上内容围绕 HANYA 的作品、兴趣、房间物件和联系方式展开。旧版 Phaser 小岛世界仍保留在代码里，但目前没有接入主入口。

## 项目状态

- 当前入口：`src/App.tsx` 渲染 `src/site/Site.tsx`
- 当前主体验：Vite + React + React Three Fiber 单页网站
- 保留体验：`src/game/**` 和 `src/ui/**` 里的 Phaser 小岛代码
- 3D 房间模型：由 Blender 脚本生成 `public/assets/room/room.glb`
- 测试覆盖：主要覆盖旧小岛的路径图算法 `PathGraph`

## 技术栈

- React 19
- TypeScript
- Vite 7
- Three.js / React Three Fiber / Drei
- Rapier physics for glass bottle miniatures
- Phaser 3 for the preserved island prototype
- Zustand for UI state
- Motion and GSAP for animation
- Vitest for tests
- Blender Python for room GLB generation

## 页面结构

```text
src/App.tsx
  -> src/site/Site.tsx
       Header
       BottleHero
       Work
       RoomSection
       Cta
       Footer
```

### Header

`src/site/Header.tsx` 提供站点导航、主题切换、时钟和键盘快捷入口。

### Bottle Hero

`src/site/glass-bottle/**` 是首屏 3D 玻璃瓶体验。瓶中物件代表阅读、音乐、相机、鸟、市场等兴趣入口。

核心文件：

- `BottleHero.tsx`：首屏布局和 Canvas 容器
- `BottleScene.tsx`：3D 场景组合
- `BottlePhysics.tsx`：物理世界
- `bottleItems.ts`：物件配置
- `items/*.tsx`：各个微缩物件模型

### Work

`src/site/Work.tsx` 读取 `src/site/projects.ts` 的项目清单，展示外链作品。

当前作品：

- MIRA: https://mira-agent.hanya.workers.dev/
- Skill Weave: https://skillweave.hanya.workers.dev/
- MBTI Music Theory: https://musictheory-6sc.pages.dev/#/
- Wand Jazz Bar: https://wandjazzbar.vercel.app/jazz-bar
- White Night: https://white-night-app.vercel.app/dashboard
- Invest Agent: https://etf-ai-agent.pages.dev/

### Room

`src/site/room/**` 是当前重点 3D 房间屏。房间里有四个可交互物件：

- 电脑：贴屏 UI，展示复古终端/小游戏入口
- 打字机：聚焦后显示纸张内容
- 唱片机：聚焦后唱片旋转
- 掌机：贴屏显示复古液晶界面

核心文件：

- `RoomSection.tsx`：房间 section、Canvas、提示层、聚焦退出逻辑
- `RoomScene.tsx`：灯光、背景、模型、热点组合
- `RoomCamera.tsx`：overview 和 focus 相机位置
- `objects/RoomModel.tsx`：加载 `room.glb`
- `objects/RoomHotspots.tsx`：透明点击盒、标签、HTML 屏幕
- `roomStore.ts`：当前聚焦物件、hover、inView 状态
- `games/snake.ts` 和 `games/breakout.ts`：保留的小游戏逻辑

房间模型不是手写 JSX 几何体，而是通过 Blender 脚本导出成 GLB：

- 生成脚本：`scripts/generate_room_model.py`
- 输出文件：`public/assets/room/room.glb`
- 使用资产：Kenney Furniture Kit，见 `public/assets/room/vendor/ATTRIBUTIONS.md`

### CTA / Footer

`src/site/Cta.tsx` 和 `src/site/Footer.tsx` 负责收尾文案、GitHub、邮箱和致谢信息。

## 保留的 Phaser 小岛

`src/game/**` 是旧版小岛世界，当前没有在 `App.tsx` 中渲染。

它包括：

- `PhaserGame.tsx`：Phaser 容器组件
- `scenes/BootScene.ts` / `PreloadScene.ts` / `WorldScene.ts`
- `systems/BirdController.ts`：小鸟移动控制
- `systems/BuildingController.ts`：建筑点击和面板联动
- `systems/PathGraph.ts`：路径图和寻路
- `data/world-map.json`：节点、边、建筑位置

对应的内容数据仍在 `src/content/buildings.ts`，也被新版站点的模块信息复用。

## 目录说明

```text
src/
  App.tsx                    当前 React 入口
  main.tsx                   Vite mount 入口
  site/                      当前个人站
    glass-bottle/            首屏玻璃瓶 3D 体验
    room/                    3D 房间体验
    fx/                      背景、光标、文字效果
    projects.ts              作品清单
    siteStore.ts             主题、动效偏好等状态
  game/                      保留的 Phaser 小岛
  ui/                        保留的小岛 UI
  content/                   模块/建筑内容数据
  styles/                    全局样式
public/
  assets/works/              作品封面
  assets/world/              小岛素材
  assets/bird/               小鸟素材
  assets/room/               房间 GLB 和外部资产
  fonts/                     Inspire Mono 字体
docs/                        设计文档、素材参考、历史方案
scripts/
  generate_room_model.py     Blender 房间导出脚本
  download_room_assets.mjs   Sketchfab 下载探索脚本
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认 Vite 会监听 `0.0.0.0`，终端会输出本地访问地址。

构建生产版本：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

运行测试：

```bash
npm run test
```

完整检查：

```bash
npm run check
```

## 生成房间模型

房间 GLB 由 Blender 生成。需要本机已安装 Blender，并且 Kenney Furniture Kit 已解压到：

```text
public/assets/room/vendor/kenney_furniture-kit/
```

重新导出：

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/generate_room_model.py
```

导出后会覆盖：

```text
public/assets/room/room.glb
```

注意：`RoomModel.tsx` 会把 GLB 作为静态文件从 `/assets/room/room.glb` 加载。如果调整 Blender 坐标，通常也要同步更新：

- `src/site/room/objects/RoomHotspots.tsx`
- `src/site/room/RoomCamera.tsx`

## 资产和版权

- Kenney Furniture Kit: CC0，用于房间家具和道具。详情见 `public/assets/room/vendor/ATTRIBUTIONS.md`
- Inspire Mono 字体位于 `public/fonts/`
- 作品封面位于 `public/assets/works/`
- Sketchfab 下载脚本目前只是探索用途，公开下载接口需要认证 token，不能直接无授权批量拉取

## 配置和数据入口

常改内容：

- 作品卡片：`src/site/projects.ts`
- 模块内容：`src/content/buildings.ts`
- 房间热点：`src/site/room/objects/RoomHotspots.tsx`
- 房间相机：`src/site/room/RoomCamera.tsx`
- 玻璃瓶物件：`src/site/glass-bottle/bottleItems.ts`
- 全局视觉：`src/styles/globals.css`

## 已知注意点

- `npm run build` 会提示 JS chunk 较大，主要来自 Three.js / R3F / Phaser 等 3D 和游戏依赖；当前不影响运行。
- Phaser 小岛代码还在仓库中，但当前首页不加载它。
- 房间里的贴屏 UI 使用 Drei `Html transform`，模型坐标、热点坐标和相机焦点需要一起维护。
- 如果未来恢复留言后端，`src/site/room/useGuestbook.ts` 需要接入真实 API 或 Cloudflare Worker。

## 联系

- GitHub: https://github.com/infiniteHY
- Email: 1277530323@qq.com
