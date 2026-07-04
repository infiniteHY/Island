# Ark Island · 我的小世界 · 开发设计文档 v2

> 本文档基于 `docs/design3.png` 全面重写,**取代 v1(`ark-island-spec.md`)的美术与交互设计**。
> 最高准则不变:**稳定 · 易读 · 数据驱动 · 可十年生长**。

---

## 0. 定位

一座飘在天空的**个人数字大陆**。`design3.png` 即**首页界面本身**——不是仪表盘,而是一座可漫游、可进入的低多边形浮空岛。

两种核心交互(本版重点):

1. **直接点击建筑** → 进入该建筑的「小世界」(内部场景 / 详情)。
2. **操控一只白色半透明小鸟**(纪念碑谷风的 avatar)→ 在岛上的街道 / 拱桥 / 阶梯间行走,走到建筑门口进行访问。

---

## 1. 美术基调(本版锁定,推翻 v1 的像素风)

| 维度 | 设定 |
|---|---|
| 风格 | **低多边形 Low-poly + 平面着色 flatShading**,纪念碑谷 / 柔和绘本质感 |
| 色板 | 柔和粉彩:**奶白石材 + 青绿穹顶 + 暖金装饰 + 薄荷草地 + 半透明青水**,低饱和、明亮 |
| 光照 | 明亮白昼为默认,柔和方向光 + 高环境光,阴影柔和 |
| 后处理 | **去掉像素化**;仅保留极轻 SMAA / 柔和 Bloom(发光雕像/水)+ 轻暗角。绝不喧宾夺主 |
| 几何 | 多层台地 + 拱门 + 拱桥 + 阶梯 + 边缘瀑布,营造纪念碑谷的层叠空间 |

> 配色参考值:天空 `#aee0e6→#dff2ee` 渐变;草地 `#b9d68a / #a8c97a`;石材 `#efe6d0 / #e6d9bd`;穹顶 `#6fb6b0`;暖金 `#d8a94a`;水 `#7fc7d6`(半透明);小鸟雕像 `#6fc6e0`;avatar `#ffffff` 50% 透明带青调。

---

## 2. 世界结构(对齐 design3)

中央是**小鸟雕像广场**(世界锚点 / 归位点),九大区域环绕,街道与拱桥相连,外围云海 + 飞艇航线。

```
                 🌳 世界树(后方高台)
        📚 图书馆                    📈 金融交易所
   🏟️ 体育馆          🐦 雕像广场          🎮 游戏厅
        🔧 创意工坊                    🖼️ 展览馆
              ✈ 旅行航线   🎷 爵士酒吧(地下)
        🌫️ 待开发区域
```

### 区域清单(本版新区域集,数据驱动)

| id | 区域 | 外观 | 进入后 |
|---|---|---|---|
| `worldtree` | 🌳 世界树 | 后方高台上的低多边形巨树,随成长度变高 | 世界总览 + 成长动效 |
| `library` | 📚 图书馆 | 青穹顶 + 拱门的米白小楼 | 书单 / 笔记 |
| `exchange` | 📈 金融交易所 | 对称的青穹顶大厅 | 投资记录 / 框架 |
| `stadium` | 🏟️ 体育馆 | 椭圆竞技场,红跑道绿场,旗帜 | 运动 / 健康记录 |
| `arcade` | 🎮 游戏厅 | 圆形建筑,`GAME` 霓虹 | 游戏战绩 |
| `workshop` | 🔧 创意工坊 | 方形工坊小楼 | 作品 / 项目 |
| `gallery` | 🖼️ 展览馆 | 方块展馆,旗幡 | 摄影 / 收藏 |
| `bar` | 🎷 爵士酒吧(地下) | 下沉的拱形 `JAZZ` 入口,夜紫光 | 曲目 / 录音 |
| `fog` | 🌫️ 待开发区域 | 远处未解锁的小立方岛 | 解锁说明 |

> 飞艇 + 旅行航线(`✈ 旅行航线`)是**氛围 + 未来跳转**,非建筑。

---

## 3. 数据结构(一切配置化,绝不写死)

```typescript
// src/config/worldConfig.ts
export type AreaStatus = 'unlocked' | 'fogged';
export type AreaKind =
  | 'worldtree' | 'domed' | 'stadium' | 'arcade'
  | 'workshop' | 'gallery' | 'bar' | 'fog';

export interface Area {
  id: string;
  title: string;
  subtitle: string;          // design3 里每个区域的副标题文案
  icon: string;
  kind: AreaKind;            // 决定渲染哪种风格化建筑
  status: AreaStatus;
  position: [number, number, number];  // 建筑落点
  approach: [number, number, number];  // 小鸟行走的「门口」访问点
  accent?: string;          // 主题色
  cameraWaypoint: { position: [number, number, number]; lookAt: [number, number, number] };
  interior?: string;        // 小世界场景组件名(懒加载,后续阶段)
  unlockCondition?: string;
  links?: string[];
  data?: unknown;
}
```

渲染层只读 config 生成世界;新增区域 = 加一条 config,不动渲染逻辑。

---

## 4. 全局状态(zustand)

```typescript
interface WorldState {
  // 视图
  timeOfDay: number; timeAuto: boolean; season: Season;
  // 交互
  avatarTarget: [number, number] | null;  // 小鸟的行走目标(x,z),点击地面设定
  nearAreaId: string | null;              // 小鸟当前靠近的区域(显示「进入」提示)
  activeAreaId: string | null;            // 已进入的区域(小世界面板/场景打开)
  // actions
  setAvatarTarget / setNearArea / enterArea / exitArea / setTime ...
}
```

- `activeAreaId != null` 时主世界降帧(`frameloop` 切 `never`),省电。

---

## 5. 两种导航(本版核心)

### 5.1 直接点击建筑
- 每栋建筑 mesh 绑 `onClick`(`stopPropagation`)→ `enterArea(id)` → 打开该区域「小世界」。
- 悬停高亮 + 浮出标题标签(drei `<Html>` 或 billboard)。

### 5.2 小鸟 avatar(纪念碑谷风)
- **白色半透明低多边形小鸟**,默认停在雕像广场。
- **点击地面** → `setAvatarTarget(x,z)` → 小鸟沿地面朝目标平滑行走(`maath.damp`),转向朝向移动方向,带轻微上下摆动(走路 bob)。
- **WASD / 方向键** → 直接操控行走。
- 行走限制在岛面 walkable 半径内(软边界)。
- 小鸟靠近某建筑的 `approach` 点 → `nearAreaId` 置位 → 浮出「按 E 进入」提示 → `E` 进入该小世界。
- 相机:等距俯视默认机位;进入区域时 GSAP 补间到 `cameraWaypoint`。

> 移动端:隐藏 WASD,保留「点地走 + 点建筑进入」。

---

## 6. 时间系统(简化)

保留昼夜滑条,但**默认明亮白昼**;粉彩天空用渐变 SkyDome(顶青绿→底奶白),而非写实 Sky。夜晚柔和压暗 + 雕像/水/酒吧发光更明显。季节沿用 v1(植被色 + 粒子)。

---

## 7. 工程目录

```
src/
├── App.tsx                 # Canvas + HUD
├── config/
│   ├── worldConfig.ts      # 九区域数据(核心)
│   └── renderConfig.ts     # 调色板 / 相机 / 周期
├── store/useWorldStore.ts
├── scene/
│   ├── World.tsx
│   ├── Island.tsx          # 低多边形多层台地 + 水道 + 瀑布
│   ├── SkyDome.tsx         # 粉彩渐变天空
│   ├── BirdStatue.tsx      # 中央青色小鸟雕像广场
│   ├── Bird.tsx            # 白色半透明 avatar(可操控)
│   ├── GroundPicker.tsx    # 点击地面设定行走目标
│   ├── areas/
│   │   ├── AreaRenderer.tsx    # 遍历 config 生成建筑 + 点击/悬停
│   │   └── buildings/*.tsx     # domed / stadium / arcade / ...
│   ├── environment/
│   │   ├── DayNightCycle.tsx
│   │   └── Ambient.tsx         # 云 / 飞艇 / 漂浮小岛
│   └── cameras/BrowseCamera.tsx
├── ui/
│   ├── HUD.tsx             # 昼夜滑条 / 操作提示
│   ├── RegionPanel.tsx     # 进入区域后的「小世界」面板
│   └── Hint.tsx            # 「按 E 进入」提示
└── hooks/useKeyboard.ts
```

---

## 8. 性能护栏(沿用 v1)

LOD · InstancedMesh(树/植被)· interior 懒加载 · 进入区域降帧 · raycast 降频 · AdaptiveDpr · 移动端简化。目标 PC 60fps。

---

## 9. 分阶段计划(重置)

- **Phase 1 ✅ 框架**:粉彩低多边形岛 + 中央雕像广场 + 昼夜 + 等距相机 + HUD。
- **Phase 2(本版重点)**:九区域 config 驱动 + 风格化建筑 + **小鸟 avatar 行走(点地/WASD)** + **点建筑/靠近进入** + 区域面板「小世界」+ 飞艇航线 + 云海。
- **Phase 3**:每个建筑的真实 3D 内部场景(懒加载)+ 真实内容(书单/曲目/战绩…)+ 季节。
- **Phase 4**:第一人称 / 跟随小鸟视角 + 解锁机制(迷雾散)+ NPC + 空间音频。
- **Phase 5(可选)**:数据后端同步 + AI 导览 + 世界自动生长。

---

## 10. 关键决策

- **低多边形而非像素**:更贴 design3,跨设备清晰,Claude Code 易生成几何。
- **小鸟点地行走 + 点楼直达 双轨**:既有纪念碑谷的漫游感,又不强迫每次都走。
- **小世界先用面板占位**:Phase 2 可交付;真 3D 内部场景 Phase 3 再上,不阻塞。
- **一切 config 驱动**:十年生长前提。
