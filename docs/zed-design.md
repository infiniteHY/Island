# zed.dev 设计系统提取 · design.md

> 来源:https://zed.dev/ (2026-07 抓取,token 直接提取自其产线 CSS)
> 用途:与本站 v3「Editorial HUD」融合,融合策略见文末。

---

## 1. 色彩

Zed 的色彩哲学:**纸感底色 + 单一签名蓝**,大面积近乎无色,让代码截图承担颜色。

| Token(原站变量) | 值 | 用途 |
|---|---|---|
| `--cream` | `#7f7866` | 母色:所有中性色由它与黑/白 `color-mix` 派生 |
| 浅色背景 | `color-mix(cream, white 92%)` ≈ `#f5f3ee` | 纸感页面底 |
| 浅色文字 | `color-mix(cream, black 56%)` | 正文 |
| `--offgray` | `#727a89` | 冷灰,暗色系中性 |
| `--nav-bg-color`(dark) | `#121417` | 暗色导航底 |
| `--motif-accent-1` | **`#1e69f6`** | 签名蓝:链接、按钮、装饰线 |
| `--motif-accent-2` | `#93ccdc` | 辅助浅青 |
| `--motif-subtle-1/2`(light) | `#ff5500a6` / `#ffd50059` | 橙黄底纹 motif |
| `--dithering-front/back` | `#0751cf` / `#0751cf80` | 抖动纹理(dithering)装饰 |

## 2. 阴影 —— 最鲜明的签名

不用弥散投影,用**双向硬偏移的蓝色调阴影**(印刷套版错位感):

```css
--sh-default: 5px 5px 0 #3d7df50d, -5px -5px 0 #3a7df80d;
--sh-alt:     5px 5px 0 #3d7df50a;
```

## 3. 字体

| 变量 | 字体 | 角色 |
|---|---|---|
| `--font-writer` | **iA Writer Quattro S**(400/700 + Italic) | 正文,打字机人文感 |
| `--font-zed-mono` | **Lilex**(400) | 代码/等宽 |
| `--font-plexSans` | IBM Plex Sans | 辅助无衬线 |
| `--font-plex-serif` | IBM Plex Serif(可变 300-700 + Italic) | 衬线引语/斜体强调 |

标题字重刻意偏轻(可变字体轴):`--h0/h1-weight: 320`、`--h2/h3/h4-weight: 360` —— 大而轻,不是大而黑。

## 4. 版式与结构

- 内容约束在中央窄栏,图片出血到边;
- **虚线/点线边框**(`dashed`/`dotted`)做分区,像工程图纸;
- 卡片密度高、圆角小,行内嵌 meta 徽章(分支名、`+43 -11` diff 徽章、相对时间 `4m/2h/1d`);
- 抖动纹理(dither)与低透明度 shader 做背景氛围(`--hero-shader-opacity: .15`)。

## 5. 交互签名

- **按钮尾缀快捷键字母**:`Download now[D]`、`Sign up[S]` —— 每个主要动作都有单键快捷键,键盘优先的人格;
- 主 CTA 为胶囊按钮,签名蓝底白字,hover 加深(`blue-600 → blue-700`);
- 视频区块 poster + Play/Expand 悬停示能。

---

## 6. 融合策略(本站 v3.1)

两套语言按主题分治,一站两性格:

| | 本站 Light | 本站 Dark |
|---|---|---|
| 人格 | **Zed 工程图纸**:纸白 + 签名蓝 + 硬偏移阴影 + 虚线 | **HUD 科幻**(保留 v3):近黑 + 酸性绿 + 准星/扫描线 |
| accent | `#1e69f6`(Zed 蓝) | `#c0fe04`(酸性绿) |
| 阴影 | `--sh-default` 蓝色硬偏移 | 无(靠发光) |

主题无关的 Zed 移植件:

1. `--accent` 变为**随主题切换**的变量,全部 fx(准星、角标、聚光灯)自动换色;
2. 卡片 hover 加 `filter: drop-shadow` 硬偏移阴影(drop-shadow 跟随 squircle clip-path 轮廓,普通 box-shadow 会被裁掉);
3. section 分隔线改虚线,交点处放 `+` 十字标记(工程图纸味);
4. **全站单键快捷键**:`T` 切主题、`M` 跳 Modules、`C` 跳 Contact,导航与按钮尾缀 `[T]` 字母提示;
5. 标题字重减轻:超大字从 700 降到 `font-weight: 560~620` 区间(模拟 Zed 的"大而轻");
6. Hero 简介中的强调短语改**衬线斜体**(呼应 Plex Serif Italic 引语)。

不移植:iA Writer Quattro / Lilex(已有 Inspire Mono 作为等宽签名,再引两套字体会稀释个性;Lilex 为 OFL 开源,未来想换随时可以)。
