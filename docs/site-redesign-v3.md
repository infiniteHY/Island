# 个人网站重设计 · v3「Editorial HUD」

> 状态:**本版为当前实现基准**,取代 v2(`ark-island-spec-v2.md`)作为首页方案。
> v2 的 Phaser 小岛(游戏页)**代码保留、暂不提供入口**,未来作为二级体验恢复。
> 参考对象:[haoqi.design](https://haoqi.design/) —— 编辑式排版 + 仪表 HUD + 克制微动效。

---

## 0. 设计定位

一句话:**把个人主页做成一张"活的杂志内页"**。

- 不是仪表盘,不是游戏,而是一个安静、有排版秩序的单页;
- "活"体现在:实时时钟、指针坐标、主题切换、滚动入场、悬停反馈 —— 全部是**低幅度、高频率**的微动效,绝不喧宾夺主;
- 内容即结构:九个生活模块(阅读 / 训练 / 投资 / 项目 / 音乐 / 展览 / 成长 / 旅行 / 待开发)以卡片网格呈现,数据仍来自 `src/content/buildings.ts`,**内容与视图分离**不变。

### 与参考站的关系(学其骨,不抄其皮)

| 借鉴 | 具体做法 |
|---|---|
| 编辑式大字 Hero | 两行超大标题 + 一句 tagline,左对齐,占据首屏 |
| HUD 仪表感 | 顶栏右侧:实时时钟(GMT+8)+ 指针坐标 `0000 X 0000 Y` + THEME 切换 |
| 等宽字体气质 | 直接使用参考站作者公开发布的 **Inspire Mono** 字体(haoqi.design/inspire_mono 提供下载) |
| 设计工具 | 使用作者开源的 **[@wenhaoqi/wasm_design_utils](https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils)**:`/squircle` 生成平滑圆角卡片 |
| 双主题 | 米白纸感 light / 近黑 dark,CSS variables 一键切换 |
| 微动效曲线 | `cubic-bezier(.66, 0, .01, 1)`(快出缓停)为全站标准曲线 |

不照搬的:参考站的具体文案、栅格比例、声音开关(SOUND 暂不做)、英文内容结构。

---

## 1. 设计令牌(Design Tokens)

全部落在 `:root` / `.dark` 的 CSS variables,组件只引用变量。

### 1.1 色彩

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg-deep` | `251 250 244`(暖纸白) | `15 17 17`(近黑) | 页面底色 |
| `--bg-elevated` | `#efede7` | `#191b1b` | 卡片 / 浮层 |
| `--label-1` | `rgba(0,0,0,1)` | `rgba(255,255,255,1)` | 标题主文字 |
| `--label-2` | `rgba(54,54,48,.6)` | `rgba(230,232,232,.6)` | 正文 |
| `--label-3` | `rgba(54,54,48,.32)` | `rgba(230,232,232,.32)` | 辅助 / kicker |
| `--label-4` | `rgba(54,54,48,.18)` | `rgba(230,232,232,.16)` | 装饰性文字 |
| `--line` | `rgba(54,54,48,.1)` | `rgba(230,232,232,.08)` | 分隔线 / 描边 |
| `--accent` | `#c0fe04`(酸性绿) | 同 | 选区、悬停高亮、状态点 |

原则:**整站几乎无色**,唯一的颜色是酸性绿 accent,只在交互反馈处出现,形成"惊喜点"。

### 1.2 字体

| Token | 字体 | 用途 |
|---|---|---|
| `--font-mono` | **Inspire Mono**(Regular 400 / Bold 700,OTF 自托管于 `public/fonts/`) | HUD、kicker、meta、数字、导航 |
| `--font-sans` | 系统 sans(`-apple-system, "PingFang SC", ...`) | 中文正文、大标题 |

中文大标题用系统黑体加大字重,拉丁与数字统一 Inspire Mono,形成"中文编辑排版 + 英文仪表"的混排质感。

### 1.3 动效

| Token | 值 | 用途 |
|---|---|---|
| `--ease-hud` | `cubic-bezier(.66, 0, .01, 1)` | 主题切换、面板 |
| `--ease-out-quint` | `cubic-bezier(.22, 1, .36, 1)` | 入场、宽度类 |
| 标准时长 | 快 150ms / 中 250ms / 慢 520ms | hover / 淡入 / 结构变化 |

**动效清单**(全部尊重 `prefers-reduced-motion`,并提供 store 级开关):

1. **入场序列**:Hero 标题逐行上移淡入(stagger 80ms),HUD 数字从 `----` 滚动至真实值;
2. **实时 HUD**:时钟每秒刷新;指针坐标 `requestAnimationFrame` 节流跟随,格式 `0421 X 0836 Y`;
3. **卡片悬停**:边框从 `--line` 过渡到 `--label-2`,右上角 `↗` 平移 2px,时长 150ms;
4. **滚动入场**:各 section 进入视口时 `opacity 0→1, y 16→0`(motion 库 `whileInView`,一次性);
5. **主题切换**:整页颜色 300ms 过渡;
6. **选区**:`::selection` 酸性绿底黑字 —— 免费的品牌感。

### 1.4 形状

- 卡片圆角使用 `@wenhaoqi/wasm_design_utils` 的 **squircle** 路径(`clip-path` 或 SVG),大圆角不发尖;
- WASM 加载失败时**优雅降级**为普通 `border-radius`(异步 API,不阻塞首屏)。

---

## 2. 页面结构(单页滚动)

```
┌──────────────────────────────────────────────┐
│ HEADER   HANYA©2026        THEME[A]  22:41   │  sticky,毛玻璃
│                            GMT+8 · 0421X0836Y │
├──────────────────────────────────────────────┤
│ HERO                                          │
│   我的小世界 ——                                │  超大字,两行
│   Reading, training, investing & jazz.        │  Inspire Mono tagline
│   一段自我介绍(来自现有内容)                   │
├──────────────────────────────────────────────┤
│ MODULES  (id="modules")                       │
│   ┌────────┐ ┌────────┐ ┌────────┐            │  3 列网格(桌面)
│   │READING │ │TRAINING│ │INVEST  │            │  kicker + 标题 + 描述
│   │图书馆   │ │体育馆   │ │交易所  │            │  点击展开条目列表
│   └────────┘ └────────┘ └────────┘            │
│   ┌────────┐ ┌────────┐ ┌────────┐            │
│   │PROJECTS│ │JAZZ BAR│ │GALLERY*│            │  * = coming soon,
│   └────────┘ └────────┘ └────────┘            │    降透明度 + 禁点
│   ┌────────┐ ┌────────┐ ┌────────┐            │
│   │GROWTH* │ │TRAVEL* │ │SOON*   │            │
│   └────────┘ └────────┘ └────────┘            │
├──────────────────────────────────────────────┤
│ CTA      保持好奇 · 持续记录                    │  超大字收尾
├──────────────────────────────────────────────┤
│ FOOTER   邮箱 / GitHub / ©2026 / 网站字体致谢   │
└──────────────────────────────────────────────┘
```

### 2.1 模块卡片交互

- 卡片头:`kicker`(Inspire Mono 大写)+ 中文标题 + 年份/状态 meta;
- **点击展开**:卡片原位向下展开 `items` 列表(motion `layout` 动画),再点收起;同屏只展开一张;
- `items` 为空(gallery / world_tree / travel / future)→ 状态标 `SOON`,`--label-3` 色,不可展开;
- 键盘可达:卡片为 `<button>`,`aria-expanded` 同步。

### 2.2 响应式

| 断点 | 布局 |
|---|---|
| ≥1024px | 3 列网格,HUD 完整 |
| 640–1024px | 2 列,隐藏指针坐标 |
| <640px | 1 列,HUD 仅保留时钟 + 主题切换 |

---

## 3. 技术方案

| 项 | 决策 |
|---|---|
| 框架 | 维持 Vite + React 19 + TypeScript,不换 Next |
| 动效 | 已有 `motion`(v12)—— `whileInView` / `layout` / stagger |
| 状态 | `zustand`:theme(持久化 localStorage)+ reducedMotion + 展开卡片 id |
| 新依赖 | `@wenhaoqi/wasm_design_utils`(仅 `/squircle` 模块) |
| 字体 | `public/fonts/InspireMono-{Regular,Bold}.otf` + `@font-face`(`font-display: swap`) |
| Phaser | `src/game/**`、`src/ui/WorldOverlay` 等**全部保留**,只从 `App.tsx` 摘除渲染入口 |

### 3.1 目录变化

```
src/
  App.tsx                 → 渲染新首页 <Site />
  site/
    Site.tsx              页面骨架
    Header.tsx            logo + THEME + HUD(时钟/坐标)
    Hero.tsx              大字 + 简介
    Modules.tsx           卡片网格(读 buildings.ts)
    ModuleCard.tsx        单卡片 + 展开
    Cta.tsx               收尾大字
    Footer.tsx            联系 + 致谢
    siteStore.ts          theme / expanded / reducedMotion
    useClock.ts           每秒时钟 hook
    usePointer.ts         rAF 节流坐标 hook
    useSquircle.ts        wasm squircle → clip-path(带降级)
  styles/globals.css      重写为 token 体系
  content/buildings.ts    不动(数据源)
  game/**                 保留不动
```

### 3.2 验收标准

- [ ] `npm run check`(vitest + tsc + vite build)通过;
- [ ] 明暗主题切换、刷新后记忆;
- [ ] `prefers-reduced-motion` 下无入场动画、坐标 HUD 静态;
- [ ] 卡片展开/收起动画流畅,键盘可操作;
- [ ] squircle 失败时卡片仍有圆角(降级路径);
- [ ] 移动端 375px 宽无横向滚动。

---

## 4. 版权与致谢(页脚需体现)

- 字体 **Inspire Mono** by Haoqi Wen(haoqi.design/inspire_mono,官方提供下载;暂未声明许可证,**个人非商用致谢使用**,若后续声明许可证需复核);
- 工具 **@wenhaoqi/wasm_design_utils** by Haoqi Wen(npm 公开发布);
- 视觉方向受 haoqi.design 启发,布局、文案、代码均为原创实现。
