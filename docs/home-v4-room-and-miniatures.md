# 首页 v4 ·「写实微缩瓶 + 家的房间」设计开发文档

> 状态：**本版为当前实现基准**，在 v3「Editorial HUD」+ 玻璃瓶首页（`glass-bottle-homepage-dev-plan.md`）之上叠加两块改造：
> ① 瓶中坠落物件全部重做为**写实微缩模型**；
> ② 尾屏（CTA）前新增一屏 **「ROOM · 家」** 3D 房间场景。
>
> 参考对象：[henryheffernan.com](https://henryheffernan.com)（点击电脑进入可操作系统）、[jesse-zhou.com](https://jesse-zhou.com)（氛围感 3D 小屋 + 可交互物件）。
> 学其骨不抄其皮：借鉴「固定视角房间 + 点击物件相机飞入 + 屏幕内真实可玩」的交互结构，视觉走本站已有的低模 + 编辑排版 + 酸性绿 accent 路线，**不做 Blender 烘焙资产**（全程序化几何体，未来可逐件替换 GLB）。


  8 tasks (2 done, 1 in progress, 5 open)
  ◼ 搭建"家"房间 3D 场景骨架（RoomSection/RoomScene/相机聚焦）
  ◻ 电脑 + 贪吃蛇、复古掌机 + 打砖块
  ◻ 唱片机 + 本地音频播放
  ◻ 打字机 + 实时留言（前端）
  ◻ Cloudflare Worker 留言后端代码
   … +1 pending, 2 completed
---

## 0. 一句话定义

```text
首屏：喜欢的东西以「可辨认的微缩标本」落进玻璃瓶 —— 贝斯、地球仪、相机、望远镜、K 线牌。
尾屏前：一个像家一样的低模房间 —— 电脑能玩贪吃蛇，掌机能玩打砖块，
唱片机能放音乐，打字机敲下的每个字实时印在纸上，寄出后成为给我的留言。
```

---

## 1. Part A · 瓶中物件写实微缩化

### 1.1 问题

现有 5 个物件（`src/site/glass-bottle/BottleItem.tsx`）是 2-3 个基础几何体拼的占位模型，
「贝斯」像棒棒糖、「world」是一个二十面体 —— 辨识度不够，不符合「标本 / 收藏」的定位。

### 1.2 新物件清单

物件配置仍集中在 `bottleItems.ts`，id 与造型重定义如下：

| id | 中文 | 造型要点（全部代码几何体） | 路由 |
|---|---|---|---|
| `bass` | 电贝斯 | 双缺角琴身（Lathe/Extrude 圆角轮廓）+ 琴颈 + 指板 + 品丝 + **4 根弦**（细 cylinder）+ 琴头 4 个弦钮 + 双拾音器 + 旋钮 | `#work` |
| `earth` | 地球仪 | 桌面地球仪：球体（程序化大陆配色 or 简化大陆片贴附）+ **倾斜 23.5° 的弧形支架** + 圆形底座；hover 缓慢自转 | `#room` |
| `camera` | 胶片相机 | 机身（上银下黑双色分割）+ 多段镜头（对焦环/光圈环刻痕）+ 军舰部取景器 + 快门按钮 + 过片扳手 + 背带环 | `#work` |
| `bird` | 观鸟 | **双筒望远镜**（两组多段镜筒 + 中轴合页 + 目镜调焦轮）+ 站在镜筒上的**迷你小鸟**（呼应站内 bird 素材：圆身、尖喙、翘尾） | `#room` |
| `market` | K 线牌 | 木质小画架/立牌 + 屏幕面 + 凸出的红绿 K 线柱（带影线）+ 一条黄色均线折线 | `#work` |

原则：

```text
- 每件 15-40 个 mesh，单件三角面 < 3k，五件合计 < 12k，帧率无压力
- 共用 useMemo 缓存 geometry / material，禁止在渲染循环中新建
- 保留现有交互协议不变：hover 高亮（emissive）+ Html 标签、拖拽、点击路由
- 碰撞体仍用 colliders="cuboid"（简化包围盒），物理表现不变
- 配色沿用 token 思路：body 深色 + accent 点缀，酸性绿只留给 bird（站内吉祥物）
```

### 1.3 文件变化

```text
src/site/glass-bottle/
  bottleItems.ts          物件清单更新（id: bass/earth/camera/bird/market）
  BottleItem.tsx          交互壳保留，ItemMesh 改为从 items/ 引入
  items/
    BassMini.tsx
    EarthMini.tsx
    CameraMini.tsx
    BirdMini.tsx
    MarketMini.tsx
```

首屏文案同步微调：`贝斯、相机、技能树…` → `贝斯、地球、相机和望远镜里的鸟…`。

---

## 2. Part B ·「ROOM · 家」新一屏

### 2.1 页面结构变化

```text
<Site>
  Header
  main
    BottleHero      (id=top)     瓶中记忆胶囊
    Work            (id=work)    项目作品
    RoomSection     (id=room)    ★ 新增：家的房间
    Cta                          结语
  Footer            (id=contact)
```

Header 导航加 `Room`（快捷键 `R`），瓶中 `earth`/`bird` 物件点击滚动到 `#room`。

### 2.2 信息架构与交互流程

```text
┌────────────────────────────────────────────────────┐
│ ROOM.LIVE // 一个可以坐下来的角落        section 头  │
│ 这里像家。电脑里有游戏，唱片机里有歌，                │
│ 打字机上敲下的字，会寄到我手里。                      │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │              R3F CANVAS（房间）                  │ │
│ │   墙 + 窗（暖光）      置物架（书/植物/奖杯）      │ │
│ │   书桌: [电脑CRT]  [打字机]                      │ │
│ │   边柜: [唱片机]   地毯上: [复古掌机]             │ │
│ │   台灯 / 挂画 / 散落杂物                          │ │
│ └────────────────────────────────────────────────┘ │
│ HINT: 点击房间里发光的物件 · ESC 退出           mono │
└────────────────────────────────────────────────────┘
```

交互状态机（`roomStore`）：

```text
overview ──click 物件──▶ focus:computer   电脑屏幕内玩贪吃蛇
        │               focus:console    掌机屏幕内玩打砖块
        │               focus:vinyl      唱片机操作（播放/切歌）
        │               focus:typewriter 打字留言
        ◀──ESC / 返回按钮 / 点击空白处──┘

overview 态：
  - 相机固定在斜 45° 俯视机位，指针移动产生 ±2° 视差（lerp 平滑）
  - 可交互物件 hover：轻微上浮 + accent 描边光 + Html 标签（沿用瓶子标签样式）
focus 态：
  - GSAP 相机飞入（position + lookAt 同时补间，0.9s，power3.inOut）
  - 页面滚动锁定（wheel/touchmove preventDefault，仅 focus 时）
  - 显示返回按钮「← BACK」+ 该物件的操作说明
```

### 2.3 房间造型（程序化低模）

```text
房间壳（RoomShell）：
  - L 形两面墙 + 地板 + 踢脚线，暖纸白/深色随主题切换
  - 窗户：墙上开洞 + 窗框 + 半透明「夕阳光」平面 + 一束 volumetric 假光锥（渐变平面）
  - 地毯：圆角矩形 plane，柔和色块

家具（Furniture，纯装饰）：
  - 书桌（桌板 + 四腿）、边柜、置物架（3 层：书堆/小植物/相纸盒）
  - 台灯（发光球 + pointLight）、挂画（用 works 封面图任选其一贴图）
  - 散落：马克杯、耳机、几本书

灯光：
  - ambient 低强度打底
  - 窗光 directionalLight（暖色，投影开启，shadow map 1024）
  - 台灯 pointLight（暖黄，小范围）
  - 主题联动：light 主题偏白天，dark 主题窗光变暖橙、整体压暗，台灯成为主光
```

### 2.4 四个可交互物件

#### A. 电脑（DeskComputer）→ 贪吃蛇

```text
造型：CRT 显示器（外壳/凸面屏/散热格栅）+ 键盘 + 鼠标 + 机箱
屏幕实现：Drei <Html transform occlude="blending"> 把 DOM 精确贴在屏幕平面上
  - overview 态：屏幕显示待机画面（闪烁光标 “PRESS TO PLAY”，CSS 动画）
  - focus 态：进入 RetroOS 界面 → 贪吃蛇
游戏：vanilla canvas 2D（不引 Phaser，避免首页多拉 1MB+）
  - 20×14 格，方向键/WASD 操作，吃食物加速，撞墙撞身重开
  - CRT 风：磷光绿 #c0fe04 on 近黑、扫描线 overlay、轻微 text-shadow 辉光
  - 记录 localStorage 最高分，显示 SCORE/BEST
```

#### B. 复古掌机（RetroConsole）→ 打砖块

```text
造型：Game Boy 式竖版掌机（圆角机身 + 屏幕窗 + 十字键 + A/B 圆钮 + 扬声器斜纹）
     放在地毯上，斜靠一个抱枕
屏幕：同样 Html transform；配色走「灰绿液晶」：#0f380f on #9bbc0f
游戏：打砖块 vanilla canvas
  - 6×5 砖、板子跟随 ←/→ 或鼠标移动、球速随关卡提升、砖块两档血量
  - 通关/失败画面 + 重开
```

#### C. 唱片机（RecordPlayer）→ 音乐

```text
造型：木纹底座 + 转盘 + 黑胶（同心圆沟槽 + 中心标签贴 accent 色）+ 唱臂（可旋转组）+ 两个旋钮
交互：
  - 点击唱片机 = 播放/暂停；focus 态出现操作面板（Html）：曲名、上一首/下一首、进度
  - 播放时：黑胶 useFrame 匀速旋转，唱臂 GSAP 摆到盘面；暂停归位
音频：原生 Audio + 播放列表配置 src/site/room/playlist.ts
  - 音源放 public/audio/*.mp3（先放 README 占位说明，用户后续丢文件进来即可）
  - 切歌淡出淡入 400ms；音量默认 0.6；离开页面/组件卸载即停止
  - 遵守浏览器自动播放策略：永远由点击触发，绝不自动播放
```

#### D. 打字机（Typewriter）→ 实时留言

```text
造型：复古机械打字机（机身 + 三排圆形键帽 + 滚筒 + 压纸杆 + 回车拨杆）
     滚筒上卷一张「纸」（白色 plane，微弯曲）
交互（focus 态）：
  - 隐藏 textarea 捕获输入（自动 focus；移动端点击纸面唤起软键盘）
  - 每敲一个字符：纸面实时渐显该字（等宽排版，模拟油墨浓淡随机 ±10% opacity）
    + 随机一颗键帽下沉 60ms + 滚筒随行进轻微左移，换行时“咔哒”归位
  - 纸面容量 ~280 字，接近上限出现红色余量提示
  - 底部两个按钮：「寄出 SEND」/「撕掉 TEAR」
    - SEND → POST Worker 接口，成功后纸张向上卷出 + 新纸卷入 + “已寄出”提示
    - 失败 → 存 localStorage 待发队列，提示“暂存本地，下次打开自动重寄”
    - TEAR → 纸张揉皱飞走动画（简化：缩放+旋转+落下），清空
```

### 2.5 留言后端（Cloudflare Worker + KV）

前端只依赖一个环境变量 `VITE_GUESTBOOK_API`（未配置时自动降级 localStorage-only，UI 提示「本地模式」）。

```text
worker/guestbook/
  src/index.js       Worker 本体
  wrangler.toml      KV 绑定 GUESTBOOK
  README.md          三步部署说明（wrangler login / kv create / deploy）

接口设计：
  POST /api/messages
    body: { text: string(1..500), from?: string(0..40) }
    校验：长度、去 HTML、每 IP 60s 内最多 3 条（KV 计数，TTL 60s）
    存储：key = msg:{ts}:{random}，value = { text, from, ua, ts }
    响应：{ ok: true }  CORS 仅放行站点域名 + localhost
  GET /api/messages?key=ADMIN_KEY
    校验 ADMIN_KEY（secret），返回全部留言 JSON —— 只有本人能看
```

### 2.6 组件拆分

```text
src/site/room/
  RoomSection.tsx        section 壳：文案 + Canvas + 返回按钮 + 提示条
  RoomScene.tsx          场景装配：灯光/房间壳/家具/四物件
  RoomCamera.tsx         相机 rig：overview 视差 + focus 飞入（GSAP）
  roomStore.ts           zustand：focus 目标、播放状态、hover id
  playlist.ts            唱片机曲目配置
  useGuestbook.ts        留言发送 + localStorage 降级/重寄
  useScrollLock.ts       focus 态锁滚动
  objects/
    RoomShell.tsx        墙/地板/窗/光锥/地毯
    Furniture.tsx        桌/柜/架/灯/杂物（纯装饰）
    DeskComputer.tsx     电脑 + 待机屏
    RetroConsole.tsx     掌机
    RecordPlayer.tsx     唱片机（含旋转/唱臂动画）
    Typewriter.tsx       打字机（含键帽/滚筒/纸动画）
  overlays/
    ScreenSnake.tsx      电脑屏内容（RetroOS + 贪吃蛇）
    ScreenBreakout.tsx   掌机屏内容（打砖块）
    VinylPanel.tsx       唱片机操作面板
    TypewriterPaper.tsx  纸面 + 输入捕获 + 寄出/撕掉
  games/
    snake.ts             纯 TS 游戏逻辑（可单测）
    breakout.ts          纯 TS 游戏逻辑（可单测）
public/audio/README.md   音频放置说明
worker/guestbook/**      见 2.5
```

游戏逻辑与渲染分离：`games/*.ts` 输出 `createGame(ctx, opts)` 纯逻辑 + tick/render，
`overlays/Screen*.tsx` 只负责挂 canvas、转发键盘事件、显示分数 —— 逻辑层可跑 vitest。

### 2.7 响应式与降级

| 条件 | 行为 |
|---|---|
| ≥1024px | 房间 Canvas 高 ~78vh，完整交互 |
| <1024px | Canvas 高 60vh，视差关闭 |
| <640px | 触屏：贪吃蛇加虚拟方向键、打砖块触摸拖动板子；打字机点纸面唤起软键盘 |
| `prefers-reduced-motion` | 相机飞入改瞬切、黑胶不转（音乐照常）、键帽/纸张动画关闭 |
| WebGL 不可用 | 整屏降级为静态卡片列表（四个物件各一张卡，游戏/打字机以纯 DOM 弹层打开）|
| 性能 | Canvas `frameloop="demand"`? 不行——有持续动画；改为 dpr [1,1.5]、无后处理、阴影单光源 1024、`IntersectionObserver` 离屏时暂停渲染循环与音频外的动画 |

### 2.8 性能预算

```text
房间总三角面 < 40k；单 Canvas，无 MeshTransmissionMaterial（玻璃只留给首屏瓶子）
新增 JS：游戏逻辑 + 房间组件预计 < 60KB min；不新增第三方依赖
音频不预加载（preload="none"），点击播放才拉流
Html transform 屏幕仅 focus 时挂载游戏，overview 态只渲染待机 DOM（几乎零成本）
```

---

## 3. 开发阶段与验收

| Phase | 内容 | 验收 |
|---|---|---|
| 1 | Part A 五件微缩物件重做 | 不看标签能认出每件是什么；掉落/拖拽/点击不回归 |
| 2 | 房间骨架：壳/家具/灯光/相机视差/hover/focus 飞入 | 点四个物件相机分别飞入，ESC 返回，滚动锁定正确 |
| 3 | 电脑贪吃蛇 + 掌机打砖块 | 两个游戏可完整玩，键盘不与页面快捷键冲突，最高分持久化 |
| 4 | 唱片机音频 | 播放/暂停/切歌/进度正常，黑胶唱臂动画联动，卸载即停 |
| 5 | 打字机留言 + Worker | 实时逐字上纸；SEND 成功/失败/本地降级三条路径都正确；Worker 本地 `wrangler dev` 验证 |
| 6 | 响应式/降级/收口 | 375px 无横向滚动；reduced-motion 生效；`npm run check` 通过 |

全局验收补充：

```text
- 首屏瓶子性能不因新增一屏受影响（房间离屏时不渲染）
- 主题切换（T 键）房间灯光正确联动
- 快捷键：R 滚到 Room；focus 态内方向键/字母不触发全局快捷键
- 无未处理 console 错误
```

---

## 4. 明确不做（本期）

```text
- Blender 建模 / 烘焙贴图（henryheffernan 质感留给未来资产替换）
- 房间内自由走动 / OrbitControls（固定机位 + 定点飞入，体验更稳）
- 留言公开展示墙（留言只寄给本人；展示墙以后再议）
- 真实焦散、后处理 Bloom
- Phaser 用于房间小游戏（vanilla canvas 足够且更轻）
```
