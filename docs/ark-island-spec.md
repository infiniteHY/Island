# Ark Island · 个人数字世界 · 最终开发设计方案

> **交付对象:Claude Code。** 这是一份工程规格 + 产品设计文档。最高准则:**稳定、易读、数据驱动、可十年生长**。任何"酷"的特性都不得拖累"能不能跑起来、好不好维护"。

---

## 0. 这是什么(定位)

不是 Portfolio,是一座**会生长的个人数字大陆(Personal Digital Homeland)**。

把你的人生沉淀——读过的书、做过的项目、学到的技能、投资框架、爵士乐、习惯——映射成一座飘在天空的岛。访客可以**俯视漫游**,也可以**第一人称飞行**进入每栋建筑。世界有**昼夜与季节**,中心立着一棵**世界树**,随你的成长不断长出新岛屿、新建筑、驱散迷雾。

首页不是仪表盘,是一句:
> **Welcome back. Your world has grown.**

**美术基调(已锁定):** Stylized 2.5D,吉卜力 + 纪念碑谷 + 复古科幻绘本(参考图那种钴蓝天 / 铁锈橙地 / 像素颗粒)。低饱和有限色板,不写实。理由:生命周期长、浏览器性能好、Claude Code 易生成、扩展不用推翻。

---

## 1. 技术选型(锁定,不建议改)

> 这一节是和常见"堆库"方案的关键分歧点,每个选择都为"稳定易读"服务。

### 框架与构建
| 选择 | 理由 |
|---|---|
| **Vite + React 18 + TypeScript** | 纯客户端 3D 体验,**不用 Next.js**。无 SSR 需求,避免水合摩擦与不必要复杂度。Vite 更轻、HMR 更快、Claude Code 心智负担最小。 |
| **TypeScript 严格模式** | 类型即文档,Claude Code 续开发安全。 |
| **Tailwind CSS** | 2D UI 层(HUD / 面板 / 模式切换)。 |

> **SEO 兜底**:用 `vite-plugin-html` 注入静态首屏 meta + 一个隐藏的纯文本快照(书单标题、项目名),保证分享卡片和搜索可读,而不引入整个 Next.js。

### 3D 核心
| 库 | 用途 |
|---|---|
| `three` | 底层引擎 |
| `@react-three/fiber` | three 的 React 渲染器,项目主框架 |
| `@react-three/drei` | 现成组件:Sky / PointerLockControls / useGLTF / Html / Environment / AdaptiveDpr / Instances / Loader |
| `@react-three/postprocessing` + `postprocessing` | 像素化 / posterize / bloom / vignette |

### 动画 / 状态(刻意精简)
| 库 | 用途 | 说明 |
|---|---|---|
| `gsap` | 相机机位补间 | 浏览模式"飞到地块"的核心 |
| `maath` | `damp` 阻尼平滑 | 飞行/相机的顺滑,不引入额外动画库 |
| `zustand` | 全局状态 | 极轻,R3F 官方推荐 |
| `leva` | 开发期调参 | 发布时关闭 |

> **明确不引入**(避免过度工程):Theatre.js、React Spring、Framer Motion 不全上——GSAP + maath 已覆盖需求。物理引擎(rapier/cannon)不用——飞行无重力,自写控制器更可控。**初版无后端**——Supabase/Notion 降级为 Phase 3+ 可选项,国内网络摩擦不进核心路径。

### 资产管线
GLTF/GLB · Draco 压缩 · Meshopt · KTX2 纹理压缩 · Blender 烘焙 AO/光照。
美术流程:Midjourney/Flux 概念图 → Hunyuan3D 生成 → Blender 减面+烘焙 → GLB → R3F。(社区主流流程,兼顾效率与性能。)

### 部署(结合国内可达)
纯静态产物。海外:Cloudflare Pages / Vercel。国内可达:**Zeabur HK** 或 **腾讯云 COS + CDN**。无需任何特殊 HTTP 头。

---

## 2. 世界地图结构

一座主大陆,中心是世界树,六大区域环绕,外围是迷雾(待开发)。

```
                    ☀ / 🌙
            云层 · 飞鸟 · 飞艇

          ┌──────────────────┐
          │     技能森林       │
   ┌──────┘                  └──────┐
  图书馆        🌳 世界树          交易所
   │          (中央广场)            │
  酒吧            湖泊            创意工坊
   └──────┐                  ┌──────┘
          │      菜园         │
          └──────────────────┘

        ▒▒▒ 迷雾 · 待开发 · Coming Soon ▒▒▒
```

**世界树是中心**——天然的成长象征,也是默认相机的视觉锚点和"返回首页"的归位点。

---

## 3. 六大区域(兴趣 → 建筑映射)

| 区域 | 外观 | 进入后 | 数据 |
|---|---|---|---|
| 🌳 **世界树** | 中央巨树,随总成长度变高 | 世界总览 + "你的世界长大了"动效 | 聚合统计 |
| 📚 **图书馆** | 米白多层小楼,书架高度=阅读量 | 按楼层分类(文学/AI/心理/哲学/经济),每本书=封面→笔记→Highlights→关联技能 | 书单 |
| 🎷 **爵士酒吧** | 地下 Jazz Club,**夜晚才亮灯营业** | Lo-fi 播放、练习记录、墙上曲目(Bass/Jam/Improv),可接入播放器 | 曲目/录音 |
| 🌲 **技能森林** | 一片树林,每棵树=一项技能,**树越大=越熟练**,藤蔓连接相关技能 | 点树展开详情;交叉技能(如 AI×Music)长出新树苗 | 技能图谱 |
| 📈 **交易所** | 证券大厅,屏幕滚动 ETF/收益/回撤/持仓 | 投资框架、组合可视化、投资记录 | 持仓/框架 |
| 🎨 **创意工坊** | 桌上摆满模型(比赛/Demo/论文/Side Project) | 点模型展开项目详情 | 项目集 |
| 🌱 **菜园** | 田垄,每种作物=一个习惯,坚持则长高、断更则枯萎 | 习惯打卡可视化 | 习惯记录 |
| 🌫️ **迷雾区** | 半透明蓝图/雾,`Coming Soon` | 完成里程碑→迷雾散→新建筑长出 | 解锁条件 |

---

## 4. 数据结构(内容驱动的核心 —— 一切配置化)

> **铁律:绝不写死。** 渲染层只读 config 生成世界;你后续维护只碰 config,不动渲染逻辑。

```typescript
// src/config/worldConfig.ts

export type AreaStatus = 'unlocked' | 'fogged' | 'placeholder';
export type AreaType = 'building' | 'forest' | 'garden' | 'tree' | 'plaza';

export interface Area {
  id: string;                    // 'library' | 'bar' | ...
  title: string;                 // 显示名:图书馆
  type: AreaType;
  status: AreaStatus;
  position: [number, number, number];
  model: string;                 // glb 路径或内置 primitive 标识
  icon: string;                  // HUD 小地图图标
  cameraWaypoint: {              // 浏览模式机位
    position: [number, number, number];
    lookAt: [number, number, number];
  };
  interior?: string;             // 进入建筑加载的独立 Scene 组件名(懒加载)
  unlockCondition?: string;      // fogged 区域的解锁说明
  data?: unknown;                // 该区域内容(书单/曲目/技能/持仓…)
  links?: string[];              // 知识图谱:关联到的其他 area/技能 id
}

export const WORLD: { seasonAuto: boolean; areas: Area[] } = {
  seasonAuto: true,
  areas: [
    {
      id: 'library', title: '图书馆', type: 'building', status: 'unlocked',
      position: [-12, 0, -4], model: '/models/library.glb', icon: '📚',
      cameraWaypoint: { position: [-8, 5, 2], lookAt: [-12, 1, -4] },
      interior: 'LibraryInterior',
      data: { floors: [{ name: 'AI', books: [{ title: '...', note: '...', highlights: [], skills: ['ai'] }] }] },
      links: ['skill:ai', 'skill:design'],
    },
    // bar / skillforest / exchange / workshop / garden / worldtree / fog...
  ],
};
```

```typescript
// src/config/skillTree.ts —— 技能森林是图,不是树状菜单
export interface SkillNode {
  id: string;            // 'ai' | 'design' | 'ai-music'
  name: string;
  level: number;         // 0–100 → 决定树的高度/茂密度
  branch: string;        // 'ML' | 'Quant' | 'Frontend' | 'Music'...
  links: string[];       // 与其他技能的藤蔓连接(交叉→新树苗)
  description: string;
  emergent?: boolean;    // 是否由交叉技能涌现而来(如 AI×Music)
}
```

> **知识图谱关联**:`links` 字段把世界连成网——读了设计书,图书馆该书 `skills:['design']`,渲染时高亮技能森林的设计树。这是"一切都有关联"的实现基础,初版可只做高亮,Phase 4 再做动态生长。

---

## 5. 全局状态(zustand)

```typescript
interface WorldState {
  mode: 'browse' | 'fly';              // 浏览 / 第一人称飞行
  role: 'visitor' | 'owner';           // 游客 / 主人(主人可编辑布局、上传)
  activeAreaId: string | null;
  interiorOpen: boolean;               // 是否进入了某建筑内部 Scene
  panelOpen: boolean;                  // 内容面板(打开时降帧)
  timeOfDay: number;                   // 0..1 昼夜
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  // actions: setMode / setRole / focusArea / enterInterior / setTime / setSeason ...
}
```

状态原则:
- `panelOpen || interiorOpen` 时把 R3F `frameloop` 切 `'never'`/降帧,主世界停渲染省电。
- 模式切换走集中 action,避免相机/控制器打架。
- **游客 vs 主人**:游客只能浏览查看;主人(你,通过简单口令/本地标志)可飞行、编辑布局、上传内容。初版主人模式先只开"飞行 + 调参",编辑布局放 Phase 4。

---

## 6. 两种导航(对应你的"普通浏览 + 第一人称飞行")

### 6.1 浏览模式(默认,稳不晕)
- `OrthographicCamera`,固定等距俯角(约 33–45°)。
- HUD 小地图/区域按钮 → 点击 → GSAP 把相机 `position`+`target` 补间到该区域 `cameraWaypoint`(`~1.2s, power2.inOut`)→ 到位弹面板。
- 滚轮轻缩放、小角度拖拽环视(限幅,防迷失)。世界树是默认归位点。

### 6.2 第一人称飞行(按 F 进入)
- 切 `PerspectiveCamera` + drei `<PointerLockControls>`(原生鼠标视角)。
- **自写无重力飞行控制器**(`useFrame`):
  - `W/S` 视线前后,`A/D` 平移,`Space/Shift` 升降,鼠标转视角。
  - `maath.damp` 做速度阻尼,顺滑;**软边界**到岛外逐渐减速 + 提示,防飞丢。
  - 体感参照 Zelda 的轻盈漫游,不是 GTA。
- 走近建筑显示 `Press E` → 进入该建筑**独立 Scene**(懒加载,性能最优)。
- `ESC` 退 PointerLock,回浏览。

```tsx
// 飞行控制器骨架
useFrame((_, dt) => {
  const dir = new THREE.Vector3();
  if (keys.w) dir.z -= 1; if (keys.s) dir.z += 1;
  if (keys.a) dir.x -= 1; if (keys.d) dir.x += 1;
  if (keys.space) dir.y += 1; if (keys.shift) dir.y -= 1;
  dir.normalize().applyEuler(camera.rotation).multiplyScalar(SPEED * dt);
  velocity.current.lerp(dir, 0.15);
  camera.position.add(velocity.current);
  clampToSoftBounds(camera.position);
});
```

> **移动端兜底**:第一人称对手机不友好。移动端默认只给浏览模式 + 触摸点选;桌面端才暴露"按 F 起飞"。

### 6.3 进入建筑(性能关键)
走近 → `Press E` → 加载独立 interior Scene(`interior` 字段指定组件,`React.lazy` + `Suspense`)→ 主世界停渲染。退出卸载 interior。**这是把大世界拆小、保持帧率的核心策略。**

---

## 7. 时间与季节系统

### 昼夜(`timeOfDay ∈ [0,1]`)
0=午夜 → 0.25=日出 → 0.5=正午 → 0.75=日落 → 1=午夜。
- 自动:`timeOfDay = (timeOfDay + dt / CYCLE_SECONDS) % 1`(一圈 120–180s)。
- `sunPosition = f(timeOfDay)` 喂 drei `<Sky>`;同步插值天空色、方向光颜色/强度、雾色、环境光。
- **不同时间不同体验**:夜晚酒吧亮灯、图书馆关门、萤火虫、星空、月亮、偶发流星;白天飞艇、鸟、云、阳光。
- HUD 给一个昼夜手动滑条(拖动即时预览,展示很讨喜)。

### 季节(`season`,可按真实月份自动)
春开花 / 夏浓绿 / 秋黄叶 / 冬落雪。主要通过植被材质色 LUT + 粒子(花瓣/落叶/雪)切换,**复用同一套模型只换贴图与粒子**,低成本。

---

## 8. 工程目录结构(脚手架)

```
src/
├── main.tsx
├── App.tsx                       # Canvas + HUD,模式/角色路由
├── config/
│   ├── worldConfig.ts            # 区域数据(核心)
│   ├── skillTree.ts              # 技能图谱
│   └── renderConfig.ts           # 像素粒度/色阶/昼夜周期/季节等可调参数
├── store/
│   └── useWorldStore.ts          # zustand
├── scene/
│   ├── World.tsx                 # 场景根:灯光/天空/雾/后处理
│   ├── Island.tsx                # 浮空岛主体(baked)
│   ├── WorldTree.tsx             # 中央世界树(随成长度缩放)
│   ├── environment/
│   │   ├── DayNightCycle.tsx
│   │   ├── Season.tsx
│   │   └── Ambient.tsx           # 云/鸟/飞艇/萤火虫/流星
│   ├── postprocessing/Effects.tsx
│   ├── areas/
│   │   ├── AreaRenderer.tsx       # 遍历 worldConfig 生成所有区域
│   │   ├── SkillForest.tsx        # InstancedMesh 生成树,藤蔓连接
│   │   ├── Garden.tsx
│   │   └── FogArea.tsx            # 迷雾占位 + 解锁
│   ├── interiors/                 # 各建筑独立 Scene(懒加载)
│   │   ├── LibraryInterior.tsx
│   │   ├── BarInterior.tsx
│   │   └── ExchangeInterior.tsx
│   └── cameras/
│       ├── BrowseCamera.tsx       # 正交 + 机位补间
│       └── FlyController.tsx      # 第一人称飞行
├── ui/
│   ├── HUD.tsx                    # 模式切换/小地图/昼夜滑条/角色标志
│   ├── MiniMap.tsx
│   ├── WelcomeBanner.tsx          # "Your world has grown."
│   └── panels/                    # 各区域内容面板
├── hooks/
│   ├── useKeyboard.ts
│   └── useRaycastThrottle.ts      # 30fps 降频拾取
├── content/                       # 可热更内容(md/json):书单/曲目/技能/项目
└── styles/ (tailwind)

public/
├── models/    *.glb (Draco + Meshopt)
├── textures/  *.ktx2
└── hdri/
```

---

## 9. 性能与稳定性护栏(必须实现,写进验收)

> 浏览器大型 3D 场景的成熟实践,直接列为硬性要求,防止默认实现出一个发烫的页面。

1. **LOD**:远低模、近高模(drei `<Detailed>`)。
2. **Instancing**:技能森林、菜园、植被用 `InstancedMesh`,绝不几千个独立 mesh。
3. **Lazy Load**:建筑 interior 进去才加载(`React.lazy`+`Suspense`+`<Loader>`)。
4. **压缩**:模型 Draco + Meshopt,纹理 KTX2。
5. **Occlusion / 视锥剔除**:被挡建筑停渲染。
6. **Shadow 烘焙**:静态阴影烘进贴图,不实时算。
7. **按需渲染**:`frameloop="demand"`;`panelOpen`/`interiorOpen` 时切 `'never'`。
8. **raycast 降频到 30fps**(`useRaycastThrottle`)。
9. drei `<AdaptiveDpr>` + `<AdaptiveEvents>`:低端机自动降级;后处理可降级(只保 toon)。
10. **移动端**:禁用第一人称,只浏览。
11. **目标帧率**:PC 60fps;MacBook Air ~50fps。
12. **中文优先**:内容主要中文,确保字体与排版可读。

---

## 10. 分阶段开发计划(给 Claude Code 的里程碑)

> 不一次做完整世界,按里程碑推进,每阶段都能跑、可验收。

**Phase 1 · 世界框架(能跑起来)**
浮空岛 + drei Sky + 昼夜循环 + 云层 + 世界树 + 正交浏览相机 + HUD 模式切换占位 + zustand。
*验收:打开看到飘着的岛和中央世界树,昼夜滑条能改天色。*

**Phase 2 · 六大区域 + 浏览导航**
`worldConfig` 驱动 `AreaRenderer`,六区域先用占位几何体;点区域→GSAP 机位补间→弹面板(假数据);迷雾区占位。
*验收:点小地图任一区域,相机平滑飞过去弹面板。*

**Phase 3 · 风格 + 内容填充**
像素后处理链(pixelation+posterize+bloom+vignette)对齐参考图;季节系统;接入真实内容(书单/曲目/技能/持仓,本地 md/json);技能森林 InstancedMesh 按数据生成 + 藤蔓连接;建筑 interior 独立 Scene 懒加载。
*验收:有参考图复古绘本味;每个区域点进去是真内容。*

**Phase 4 · 沉浸 + 第一人称**
PointerLock 飞行控制器 + 软边界 + `Press E` 进建筑;游客/主人模式;NPC(猫/机器人/飞鸟);空间音频;成就/解锁机制(完成里程碑→迷雾散→新建筑长出)。
*验收:能起飞绕岛、进建筑;达成条件能解锁新区域。*

**Phase 5 · 数据驱动 + AI 世界(增强,可选)**
可选后端(Supabase/Notion)同步;知识图谱动态生长(读设计书→设计树长大);AI 导游介绍经历;AI 按学习/投资/创作记录生成新建筑提案。
*验收:世界能随真实记录自动演化。*

> Phase 1–4 是**核心可交付**;Phase 5 是愿景增强,不阻塞前四阶段上线。

---

## 11. 给 Claude Code 的开场提示词(可直接粘)

> 用 Vite + React 18 + TypeScript + React Three Fiber + drei + @react-three/postprocessing + zustand + gsap + tailwind,按附带的 `ark-island-spec.md` 实现一座 2.5D 等距风格的"个人数字世界"浮空岛。先完成 Phase 1:Vite+TS 脚手架;渲染一座 drei Sky 下的浮空岛 + 中央世界树(正交等距相机,约 33° 俯角);接入 zustand 状态和一个能改 `timeOfDay` 的昼夜滑条 HUD。严格按规格目录结构组织,世界内容全部由 `src/config/worldConfig.ts` 驱动,渲染与内容解耦。最高优先级是可读性与稳定性:默认 `frameloop="demand"`,不引入物理引擎、不引入 Next.js、不引入多余动画库。完成后告诉我如何 `npm run dev`。

---

## 12. 关键设计决策备忘(为什么这样而不那样)

- **Vite 而非 Next.js**:纯客户端 3D,无 SSR 需求,避免水合摩擦;SEO 用静态首屏注入解决。
- **动画库收敛到 GSAP + maath**:避免 Theatre.js/React Spring/Framer 四库并存的过度工程。
- **初版无后端**:Supabase/Notion 降级为 Phase 5 可选,规避国内网络摩擦,保证"稳定"。
- **建筑独立 Scene 懒加载**:把大世界拆小,是帧率护栏的核心。
- **一切 config 驱动**:十年生长的前提是内容与代码解耦——新增区域只加一条 config。
- **移动端只浏览**:第一人称不适配手机,双轨保证 iPhone 也能打开看。

---

*本方案以"稳定 · 易读 · 数据驱动 · 可十年生长"为最高准则。世界观吸收了"会生长的数字生命体"愿景,工程上做了精简与防过度设计的收敛。按 Phase 1→5 推进,前四阶段即为完整可上线产品。*
