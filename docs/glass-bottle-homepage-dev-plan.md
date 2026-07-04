# 玻璃瓶首页动效开发计划

版本：v1.0  
目标读者：Codex / 前端开发 Agent / 个人维护者  
项目类型：个人主页首屏、3D 玻璃瓶动效、兴趣入口导航  
推荐栈：React + Vite + TypeScript + React Three Fiber + Drei + Rapier + Motion

---

## 0. 一句话定义

把个人主页首屏做成一个「瓶中记忆胶囊」：贝斯、相机、技能树、交易小牌、小世界入口等兴趣物件从页面上方依次落入透明玻璃瓶。物件在瓶中被瓶身曲率轻微折射，瓶身边缘有高光，瓶底有柔和焦散光斑。每个小摆件都是一个可点击入口，连接到对应的个人模块。

这个方案不是普通作品集首页，也不是完整 3D 游戏。它的核心是：

```text
系统感 HUD + 玻璃瓶视觉记忆点 + 兴趣小物件下落 + 可点击模块入口
```

---

## 1. 设计定位

### 1.1 视觉关键词

```text
透明
收藏
标本
系统状态
低噪声
轻物理
可探索
```

页面要像一个安静但有状态的个人控制台，而不是满屏粒子和夸张转场。玻璃瓶是第一视觉记忆点，HUD 和文字排版负责建立「设计工程 + 个人小世界」气质。

### 1.2 参考方向

| 参考 | 借鉴点 | 用法 |
|---|---|---|
| haoqi.design | HUD、时间、鼠标坐标、THEME/SOUND 状态、编辑式大字 | 学结构和状态感，不照抄文案和版式 |
| Codrops glass / transmission 教程 | `MeshTransmissionMaterial`、折射参数、环境光、性能权衡 | 用于瓶身玻璃材质 |
| Maxime Heckel caustics | normal render target、shader、caustic plane | P2 再做真实焦散，MVP 先用假光斑 |
| Bruno Simon 个人站 | 把个人信息做成可探索世界 | 参考「个人站可互动」思路 |

参考链接放在文末。

---

## 2. 首屏信息架构

```text
┌──────────────────────────────────────────────┐
│ HEADER / HUD                                  │
│ ISLAND / BASS / CAMERA / SKILL / MARKET       │
│ THEME[A] SOUND[|]  22:41 GMT+8  0321 X 0884 Y │
├──────────────────────────────────────────────┤
│ HERO COPY                                     │
│ 把喜欢的东西，装进一个透明瓶子里。              │
│ Every object is a path into my small world.   │
├──────────────────────────────────────────────┤
│ THREE CANVAS                                  │
│ 透明玻璃瓶                                    │
│ 贝斯 / 相机 / 技能树 / K 线牌 / 小世界入口下落   │
├──────────────────────────────────────────────┤
│ BOTTOM NAV                                    │
│ BASS  CAMERA  SKILL TREE  MARKET  WORLD       │
└──────────────────────────────────────────────┘
```

### 2.1 动效流程

```text
页面进入
  ↓
HUD 出现，时间和坐标开始更新
  ↓
标题逐词 / 逐行 blur reveal
  ↓
玻璃瓶从轻微 blur 中清晰
  ↓
小摆件按 150-300ms 间隔依次落入瓶中
  ↓
物件与瓶底碰撞，轻微弹跳后停住
  ↓
hover 底部入口或瓶内物件，对应物件高亮并显示标签
  ↓
click 进入对应模块
```

### 2.2 首页文案建议

主标题：

```text
把喜欢的东西，装进一个透明瓶子里。
```

副标题：

```text
贝斯、相机、技能树、交易实验和小世界，会像标本一样落进瓶中。
每个小摆件，都是一条可以继续探索的路径。
```

英文辅助：

```text
Bass, camera, skill tree, market experiments.
Every object is a path into my small world.
```

---

## 3. 技术选型

### 3.1 推荐栈

```text
Frontend: React + Vite + TypeScript
3D Scene: three + @react-three/fiber
Glass Material: @react-three/drei MeshTransmissionMaterial
Physics: @react-three/rapier
Models: GLB + useGLTF / gltfjsx
UI Animation: Motion
Sound: Howler.js 或原生 Audio
Model Optimization: glTF Transform
```

### 3.2 为什么不用纯 CSS

CSS `backdrop-filter` 可以做 HUD、浮层和普通玻璃拟态，但不适合做真正的瓶身曲率折射。这个首页的记忆点来自「小物件透过瓶身被轻微放大、偏移、色散」，需要 WebGL 材质和环境光配合。

CSS 可以保留在这些地方：

```text
HUD 毛玻璃
主题切换
文字入场
移动端低性能降级版瓶子
```

Three.js 负责：

```text
瓶身曲率
玻璃折射
物件空间位置
物理下落和碰撞
光照、阴影、伪焦散
```

### 3.3 依赖安装

```bash
npm i three @react-three/fiber @react-three/drei @react-three/rapier motion
npm i -D @react-three/gltfjsx @gltf-transform/cli
```

如果后续加入声音：

```bash
npm i howler
```

---

## 4. MVP 范围

### 4.1 P0 必须完成

```text
- 首页渲染 R3F Canvas
- 代码生成或加载一个透明玻璃瓶
- 5 个兴趣小摆件从上方依次下落
- Rapier 碰撞体能让物件停在瓶底
- 瓶身有边缘高光和轻微折射
- 瓶底有低成本假焦散光斑
- HUD 显示时间、鼠标坐标、THEME、SOUND 状态
- hover 物件或底部入口显示标签
- click 物件进入对应模块或更新 hash
- 支持移动端基础适配
- 支持 `prefers-reduced-motion`
```

### 4.2 P1 增强

```text
- 用照片贴图生成「亚克力小摆件」
- 替换占位几何体为低模 GLB
- 加入主题：Light / Night / Glass
- 加入落瓶声音和 hover 声
- 物件 hover 时改变瓶内局部光色
- 对接现有小世界模块内容
```

### 4.3 P2 暂缓

```text
- 真实 shader caustics
- Blender 高质量瓶子模型
- AI 图生 3D 全流程
- Rive 复杂状态机动画
- 多瓶子、多场景切换
- 完整 3D 个人世界
```

---

## 5. 组件拆分

建议新增目录：

```text
src/site/glass-bottle/
  BottleHero.tsx              首屏容器
  BottleScene.tsx             Canvas 内 3D 场景
  BottleGlass.tsx             玻璃瓶几何体和材质
  BottlePhysics.tsx           Rapier 瓶底 / 瓶壁 / 背板碰撞体
  BottleItem.tsx              单个兴趣小物件
  BottleHighlights.tsx        高光条、伪焦散、瓶口亮边
  HeroHud.tsx                 时间、坐标、THEME、SOUND
  BottleNav.tsx               底部兴趣入口
  useBottleItems.ts           物件配置和状态
  usePointerHud.ts            rAF 节流鼠标坐标
  useReducedMotion.ts         动效降级
```

公共资产：

```text
public/models/
  bass-toy.glb
  camera-toy.glb
  skill-leaf.glb
  market-sign.glb
  world-key.glb

public/textures/items/
  bass-photo.webp
  camera-photo.webp
  skill-texture.webp
  market-chart.webp

public/sounds/
  bottle-drop-01.mp3
  hover-tick.mp3
  bass-pluck.mp3
```

---

## 6. 数据结构

先用本地配置，不急着接 CMS。

```ts
export type BottleItemConfig = {
  id: "bass" | "camera" | "skill" | "market" | "world";
  label: string;
  subtitle: string;
  route: string;
  model?: string;
  texture?: string;
  startPosition: [number, number, number];
  scale: [number, number, number];
  accent: string;
};

export const BOTTLE_ITEMS: BottleItemConfig[] = [
  {
    id: "bass",
    label: "Bass",
    subtitle: "Music Theory / Jazz Bar",
    route: "/#jazz",
    model: "/models/bass-toy.glb",
    texture: "/textures/items/bass-photo.webp",
    startPosition: [-0.55, 3.4, 0],
    scale: [0.34, 0.22, 0.08],
    accent: "#d9b56f",
  },
  {
    id: "camera",
    label: "Camera",
    subtitle: "Photography / Visual Memory",
    route: "/#gallery",
    model: "/models/camera-toy.glb",
    texture: "/textures/items/camera-photo.webp",
    startPosition: [0.25, 3.9, 0.12],
    scale: [0.3, 0.22, 0.1],
    accent: "#82a6b8",
  },
];
```

---

## 7. 玻璃瓶实现

### 7.1 第一版：LatheGeometry 代码生成

MVP 用 `LatheGeometry` 生成轴对称瓶子，优点是不用等待 Blender 资产。

```tsx
import * as THREE from "three";
import { useMemo } from "react";

export function useBottleLatheGeometry() {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0.72, -2.2),
      new THREE.Vector2(0.86, -1.85),
      new THREE.Vector2(0.95, -0.7),
      new THREE.Vector2(0.9, 0.75),
      new THREE.Vector2(0.62, 1.45),
      new THREE.Vector2(0.3, 1.85),
      new THREE.Vector2(0.34, 2.28),
      new THREE.Vector2(0.45, 2.36),
    ];

    const geometry = new THREE.LatheGeometry(points, 128);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}
```

### 7.2 玻璃材质参数

首版参数：

```tsx
<MeshTransmissionMaterial
  transmission={1}
  thickness={0.65}
  ior={1.42}
  roughness={0.025}
  chromaticAberration={0.025}
  anisotropicBlur={0.06}
  distortion={0.08}
  temporalDistortion={0.015}
  backside
  backsideThickness={0.28}
  samples={6}
  resolution={384}
  color="#ffffff"
/>
```

调参规则：

| 参数 | 作用 | 建议 |
|---|---|---|
| `transmission` | 透射程度 | 固定 1 |
| `thickness` | 光在材质中穿过的厚度 | 0.5-0.8 |
| `ior` | 折射率 | 1.35-1.5，玻璃感不要太夸张 |
| `roughness` | 表面粗糙度 | 0.02 左右，保持清透 |
| `chromaticAberration` | 色散 | 0.02-0.04，只要一点 |
| `distortion` | 扭曲 | 0.06-0.12，避免果冻感 |
| `samples` | 折射采样 | 4-8，先保性能 |
| `resolution` | 折射贴图分辨率 | 256-512 |

### 7.3 第二版：Blender bottle.glb

如果代码瓶子达不到质感，再换 Blender 建模。

模型要求：

```text
外壳 + 内壁，瓶壁厚度 0.03-0.08
瓶口略厚，方便出高光
瓶底略厚，制造凸透镜感
法线平滑
面数控制在首页可接受范围
不需要复杂 UV，主要靠材质和环境光
```

---

## 8. 物理下落实现

### 8.1 碰撞结构

Rapier 碰撞体不需要完全等于瓶子模型，MVP 用简化碰撞体即可。

```text
瓶底：CylinderCollider
左右瓶壁：两个轻微倾斜的 CuboidCollider
背板：CuboidCollider，防止物件飞出相机视野
瓶口：可选 sensor，用于触发「进入瓶口」音效
```

示意：

```tsx
import { RigidBody, CuboidCollider, CylinderCollider } from "@react-three/rapier";

export function BottlePhysics() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CylinderCollider args={[0.12, 0.78]} position={[0, -2.05, 0]} />
      <CuboidCollider args={[0.05, 1.65, 0.75]} position={[-0.86, -0.35, 0]} rotation={[0, 0, -0.08]} />
      <CuboidCollider args={[0.05, 1.65, 0.75]} position={[0.86, -0.35, 0]} rotation={[0, 0, 0.08]} />
      <CuboidCollider args={[0.78, 1.8, 0.05]} position={[0, -0.25, -0.62]} />
    </RigidBody>
  );
}
```

### 8.2 物件刚体参数

```tsx
<RigidBody
  colliders="cuboid"
  restitution={0.22}
  friction={0.9}
  linearDamping={0.35}
  angularDamping={0.45}
>
  <BottleItemMesh item={item} />
</RigidBody>
```

规则：

```text
restitution 不要太高，避免像弹力球
friction 稍高，让物件更快停住
linearDamping / angularDamping 控制晃动收敛
物件落定后允许 sleep，减少后续计算
```

---

## 9. 小摆件资产流程

### 9.1 MVP：占位低模

先用代码几何体代表物件：

```text
贝斯：细长 box + 圆形琴身
相机：box + cylinder 镜头
技能树：叶片 shape / plane
交易：小牌子 + K 线纹理
小世界：钥匙 / 岛屿标签
```

### 9.2 P1：照片亚克力牌

这是最适合首页的「拍照压缩成小摆件」路线。

```text
照片 / 截图
  ↓
去背景导出 PNG / WebP
  ↓
贴到 plane 或 rounded box
  ↓
加厚度、倒角、阴影
  ↓
成为瓶中纪念小牌
```

优点：

```text
加载轻
制作快
用户能认出真实兴趣物
不需要高成本图生 3D
```

### 9.3 P2：低模 GLB

当首页动效稳定后，再把重要物件替换成 GLB。

```bash
npx gltfjsx public/models/bass-toy.glb -o src/site/glass-bottle/models/BassToy.tsx
npx gltfjsx public/models/camera-toy.glb -o src/site/glass-bottle/models/CameraToy.tsx
```

压缩：

```bash
npx gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```

---

## 10. HUD 与交互

### 10.1 HUD 内容

```text
左侧：
ISLAND / BASS / CAMERA / SKILL / MARKET

右侧：
THEME[A] SOUND[|]
22:41 GMT+8  0321 X 0884 Y
```

### 10.2 鼠标坐标

用 `requestAnimationFrame` 节流，不要每个 `pointermove` 都 setState。

```tsx
function formatCoord(value: number) {
  return String(Math.round(value)).padStart(4, "0").slice(-4);
}
```

### 10.3 主题

首版三档：

```text
THEME[A] Light：浅色纸感 + 清透玻璃
THEME[B] Night：近黑背景 + 玻璃边缘更亮
THEME[G] Glass：偏冷的玻璃蓝灰背景
```

### 10.4 声音

声音默认关闭。用户点击 `SOUND[|]` 后才启用。

```text
落瓶：短促玻璃 / 木牌碰撞声
hover：轻微 tick
bass：点击贝斯物件时一声音色柔和的拨弦
```

---

## 11. 响应式与降级

### 11.1 桌面

```text
Canvas 占首屏 55%-65% 宽度
瓶子居中或略偏右
Hero copy 左侧
HUD 完整显示
底部入口横排
```

### 11.2 平板

```text
Canvas 居中
标题在上，瓶子在中
隐藏部分坐标信息
物件数量保持 5 个
```

### 11.3 移动端

```text
Canvas 高度控制在 60vh 内
物件减少到 3-4 个，或缩小模型
隐藏 X/Y 坐标
HUD 只保留时间、主题、声音
底部入口改为横向滚动
```

### 11.4 reduced motion

当用户开启 `prefers-reduced-motion`：

```text
不播放物件长距离下落
物件直接淡入瓶中最终位置
关闭 temporalDistortion
关闭标题 blur reveal
声音默认关闭
```

### 11.5 低性能模式

如果 WebGL 不可用或帧率过低：

```text
显示 CSS/SVG 玻璃瓶
物件用 PNG / WebP 贴图
下落用 Motion 的 y / rotate 动画
不启用 Rapier
```

---

## 12. 性能预算

```text
Canvas DPR: [1, 1.5]，高配最多 [1, 1.8]
MeshTransmissionMaterial samples: 4-8
MeshTransmissionMaterial resolution: 256-512
GLB 单个文件：建议 < 300KB
全部 3D 模型：建议 < 1.5MB
首屏额外图片：建议 < 800KB
物理模拟：只在入场阶段活跃，落定后 sleep
移动端：关闭后处理和真实焦散
```

避免：

```text
多个 MeshTransmissionMaterial 同屏
高分辨率 HDR 环境贴图
高面数图生 3D 模型直接上首页
大面积 Bloom
过强 chromaticAberration
无降级的真实 caustics
```

---

## 13. 开发阶段

### Phase 1：场景与瓶子

目标：R3F 场景可运行，能看到透明瓶子。

任务：

```text
- 新建 BottleHero / BottleScene
- 接入 Canvas、灯光、Environment
- 代码生成 LatheGeometry 瓶子
- 加 MeshTransmissionMaterial
- 加左右高光条和瓶底假焦散
```

验收：

```text
页面 2 秒内可见瓶子
瓶身有透明和折射感
桌面 / 移动端不溢出
```

### Phase 2：物理下落

目标：兴趣物件能自然落进瓶子。

任务：

```text
- 接入 @react-three/rapier
- 加瓶底、瓶壁、背板碰撞体
- 用 5 个占位几何体做物件
- 调整 gravity、friction、restitution、damping
- 碰撞调试通过后关闭 debug
```

验收：

```text
物件不会穿出瓶底
物件不会频繁飞出画面
落定后能 sleep
```

### Phase 3：HUD 与页面动效

目标：首页形成完整系统感。

任务：

```text
- 实现时间和鼠标坐标
- 实现 THEME[A/B/G]
- 实现 SOUND[|] 状态，不自动播放声音
- 标题逐词 / 逐行入场
- 底部入口 hover 联动物件高亮
```

验收：

```text
HUD 状态实时更新
hover 有明确反馈
reduced motion 生效
```

### Phase 4：照片小摆件

目标：把真实兴趣照片转成瓶中纪念物。

任务：

```text
- 准备 bass / camera / chart / skill 等贴图
- 实现 plane / rounded box 贴图物件
- 给物件加厚度、倒角、粗糙度、阴影
- 物件 hover 显示 label
```

验收：

```text
每个物件能被辨认
瓶中层次清楚
不会因为贴图过大拖慢首屏
```

### Phase 5：资产替换与性能收口

目标：替换关键 GLB，做最终调参。

任务：

```text
- 重要物件转低模 GLB
- glTF Transform 压缩
- Playwright / Browser 检查桌面与移动端
- 调整 DPR、samples、resolution
- 增加 WebGL 不可用 fallback
```

验收：

```text
桌面首屏稳定流畅
移动端不卡顿或有合理降级
玻璃瓶、物件、文字不互相遮挡
```

---

## 14. 初始代码骨架

```tsx
// src/site/glass-bottle/BottleHero.tsx
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { BottleScene } from "./BottleScene";
import { HeroHud } from "./HeroHud";
import { BottleNav } from "./BottleNav";

export function BottleHero() {
  return (
    <section className="bottle-hero">
      <HeroHud />

      <div className="bottle-hero__copy">
        <p className="bottle-hero__kicker">PERSONAL WORLD</p>
        <h1>把喜欢的东西，装进一个透明瓶子里。</h1>
        <p>每个小摆件，都是一条可以继续探索的路径。</p>
      </div>

      <Canvas
        className="bottle-hero__canvas"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.35, 7], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <BottleScene />
        </Suspense>
      </Canvas>

      <BottleNav />
    </section>
  );
}
```

```tsx
// src/site/glass-bottle/BottleScene.tsx
import { Environment, Float } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { BottleGlass } from "./BottleGlass";
import { BottlePhysics } from "./BottlePhysics";
import { BottleItem } from "./BottleItem";
import { BottleHighlights } from "./BottleHighlights";
import { BOTTLE_ITEMS } from "./bottleItems";

export function BottleScene() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-3, 1.5, 2]} intensity={0.8} />
      <Environment preset="city" />

      <Physics gravity={[0, -3.2, 0]}>
        <BottlePhysics />
        {BOTTLE_ITEMS.map((item, index) => (
          <BottleItem key={item.id} item={item} delay={index * 0.22} />
        ))}
      </Physics>

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.18}>
        <BottleGlass />
      </Float>

      <BottleHighlights />
    </>
  );
}
```

---

## 15. 验收清单

### 15.1 视觉

```text
- 第一眼能认出玻璃瓶
- 瓶身边缘有高光
- 物件透过瓶身有轻微折射
- 瓶底有柔和光斑
- 页面不是单色主题，背景、物件、HUD 有层次
- 文案不遮挡瓶子，瓶子不遮挡主要入口
```

### 15.2 交互

```text
- hover 物件显示标签
- hover 底部入口能联动物件
- click 物件能进入对应模块
- THEME 能切换
- SOUND 默认关闭，用户启用后才播放
- 键盘可以访问底部入口
```

### 15.3 工程

```text
- 组件边界清楚
- 物件配置集中在一个数据文件
- reduced motion 可用
- WebGL fallback 可用
- 资源文件体积符合预算
- 无未处理的控制台错误
```

### 15.4 性能

```text
- 桌面 Canvas 非空，首屏稳定
- 移动端布局不重叠
- 物理模拟不会持续占用大量 CPU
- GLB / 贴图经过压缩
- MeshTransmissionMaterial 参数不过度
```

---

## 16. 参考资料

- haoqi.design 首页：https://haoqi.design/
- haoqi.design Reunimos 项目页：https://haoqi.design/reunimos
- Codrops：Creating the Effect of Transparent Glass and Plastic in Three.js  
  https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/
- Codrops：Playing with Light and Refraction in Three.js  
  https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/
- Maxime Heckel：Shining a light on Caustics with Shaders and React Three Fiber  
  https://blog.maximeheckel.com/posts/caustics-in-webgl/
- @react-three/rapier 文档：https://pmndrs.github.io/react-three-rapier/
- glTF Transform CLI：https://gltf-transform.dev/cli
- Drei GitHub：https://github.com/pmndrs/drei
- gltfjsx GitHub：https://github.com/pmndrs/gltfjsx

---

## 17. 结论

第一版目标不是做物理级真实玻璃，而是稳定实现这个组合：

```text
瓶身边缘高光
轻微曲率折射
小摆件自然下落
HUD 有实时状态
兴趣入口能点击
移动端有降级
```

只要这六件事成立，首页就已经有明确记忆点。后续再逐步替换 Blender 瓶子、低模 GLB、小摆件照片贴图和真实 shader 焦散。
