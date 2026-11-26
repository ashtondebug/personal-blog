# 010 · 首页二次元主视觉（需求变更）

> **用途**：记录首页改版的设计取舍与验证结果。改首页视觉前先读本文与 [ADR-0011](../../docs/decisions/0011-home-hero-acg-style.md)。
> **状态**：Completed（2026-11-26，背景插画待作者提供）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [ADR-0011](../../docs/decisions/0011-home-hero-acg-style.md) · [设计系统](../../docs/design/design-system.md) · [配色与主题](../../docs/design/color-and-theme.md) · [需求 §7](../../docs/product/requirements.md)

## 1. 背景

用户要求首页符合二次元风格，并同意"首页允许少量强调色"。原方向"简约文艺 + 黑白灰"保持不变，仅首页例外。背景插画由作者最后提供。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `src/components/home/Hero.astro` | 二次元主视觉：粗描边 + 硬投影、漫画网点、斜向速度线、斜切标签、日文副标题、月牙 + 地平线几何占位、双 CTA |
| `src/config/home.ts` | `HERO_IMAGE`（留空则用几何图形）、`HERO_JP_LABEL` |
| `src/styles/tokens.css` | 新增 5 个 token：`--color-accent`、`--color-accent-ink`、`--color-hero-bg`、`--color-hero-text`、`--color-hero-muted` |
| `src/pages/[locale]/index.astro` | 首页改用 Hero 组件；章节标题加一条 3px 强调色竖条；链接悬停下划线改用强调色 |
| `scripts/check-contrast.mjs` | 新增"首页主视觉（不随主题变化）"校验组 |

## 3. 设计说明

- **不依赖插画也能成立**：网点、速度线、斜切标签、月牙与地平线都是纯 CSS，素材到位后自动被 `HERO_IMAGE` 替换。
- **强调色只做三件事**：标签底色、主 CTA、首页章节标题标记。其余仍是灰阶。
- **风格边界**：粗描边 + 偏移硬投影（漫画分格感），不使用渐变卡片、玻璃拟态、圆角胶囊按钮等"科技风"元素。
- **减少动效**：只有 CTA 悬停位移 2px；`prefers-reduced-motion` 下取消。

## 4. 对比度实测（`npm run check:contrast`）

| 组合 | 比值 |
| --- | --- |
| 主视觉文字 / 主视觉底 | 17.16:1 |
| 主视觉次要文字 / 主视觉底 | 9.00:1 |
| 强调色上的文字 / 强调色 | 10.64:1 |
| 强调色 / 主视觉底 | 10.46:1 |

全部 ≥ 4.5:1。原有灰阶组合不受影响（首页之外仍是 5 组灰阶校验）。

## 5. 验证证据

| 检查 | 结果 |
| --- | --- |
| 首页渲染主视觉区块（`hero` / `hero__tag`） | OK |
| 含日文副标题「ザ・コモンズ」 | OK |
| 未提供插画时渲染月牙 + 地平线占位 | OK |
| CTA 指向 `/blog/` 与 `/about/` | OK |
| 强调色 token 进入产物 CSS | OK |
| 网点与速度线样式存在 | OK |
| 首页 `h1` 仍是站点名（SEO 与可访问性不变） | OK |
| 其余页面没有主视觉区块（颜色不扩散） | OK |

## 6. 遗留

- **背景插画待作者提供**（TD-33）：放进 `public/images/` 后在 `src/config/home.ts` 填一行即可。
- **真机视觉核对**：移动端间距、长标题换行需要在浏览器里看，命令行只能验证结构。
- **内页视觉一致性**：内页仍是黑白灰；如果后续想扩展二次元风格到 Blog/Knowledge，必须新写 ADR（ADR-0011 已写明）。
- **日文副标题是装饰文本**：不参与 i18n 词典，也没有语义；如需按语言变化要另做。

## 7. 下一阶段

Phase 10（SEO、隐私、安全）→ Phase 12（最终验收）。Phase 8 服务端收尾待作者选型。
