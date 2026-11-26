# 002 · 设计系统与全局布局（Phase 2）

> **用途**：记录 Phase 2 的设计系统落地结果、实测对比度与遗留项。做页面/改样式前先读本文的"约定"一节。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [设计系统](../../docs/design/design-system.md) · [配色与主题](../../docs/design/color-and-theme.md) · [字体与排版](../../docs/design/typography.md)

## 1. 目标

把 [设计系统](../../docs/design/design-system.md) 从文档落成可用的样式基础与全局框架：token、reset、排版基线、Header/Footer、语言与三态主题切换，且对比度可实测。

同时定名：**The Commons**（`src/config/site.ts` 唯一处定义）。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `src/styles/tokens.css` | 全部设计 token：灰阶（浅/深两套）、字体族、字号阶梯、间距、圆角、动效、层级、布局宽度；桌面断点覆盖字号与页边距 |
| `src/styles/reset.css` | 最小 reset（只改必要项，保留内容语义；含 `prefers-reduced-motion` 全局降级） |
| `src/styles/base.css` | 排版基线：正文衬线、标题层级、链接下划线、`:focus-visible` 焦点环、`::selection`、少量工具类（`u-container`/`u-sans`/`u-muted`/`u-visually-hidden`/`skip-link`） |
| `src/config/nav.ts` | 主导航与页脚导航配置，带 `enabled` 标志（未建页面渲染为不可点击，避免死链） |
| `src/components/layout/SiteHeader.astro` | 品牌、主导航、语言切换、主题切换；移动端导航横向滚动 |
| `src/components/layout/SiteFooter.astro` | 品牌、一句话定位、页脚导航、版权行 |
| `src/components/ui/LanguageSwitcher.astro` | 四语言切换；当前语言 `aria-current`，其他带 `hreflang`/`lang`；不存在的语言渲染为不可用 |
| `src/components/ui/ThemeToggle.astro` | 三态切换按钮；无 JS 时隐藏（不出现点了没反应的按钮） |
| `src/scripts/theme.ts` | 主题状态机：`light → dark → system` 循环、`localStorage: blog:theme`、监听系统偏好变化、幂等初始化 |
| `src/layouts/BaseLayout.astro` | 引入样式、首屏主题内联脚本、skip link、Header/Footer、主内容区 |
| `src/i18n/ui.ts` | 词典扩展到导航、主题、语言、页脚（四语言） |
| `scripts/check-contrast.mjs` | 从 tokens 读取两套灰阶，按 WCAG 公式计算对比度，接入 CI |

## 3. 主题实现（约定）

- `<html data-theme="light|dark">` 驱动 CSS 变量切换；`<html data-theme-mode="light|dark|system">` 记录用户选择。
- `data-theme` 由 `<head>` 内联脚本在首屏绘制前写入，**因此不会闪烁**；无 JS 时 `tokens.css` 内 `@media (prefers-color-scheme: dark)` 提供系统深色回退。
- 存储键固定 `blog:theme`（与后续视图偏好统一前缀）。
- 切换按钮显示当前模式文案，文案来自词典的 `data-label-*` 属性，脚本不硬编码语言。

## 4. 对比度实测（`npm run check:contrast`）

| 组合 | 浅色 | 深色 | 阈值 |
| --- | --- | --- | --- |
| 正文 / 背景 | 17.40:1 | 16.00:1 | ≥4.5 ✅ |
| 正文 / 次级背景 | 16.25:1 | 14.87:1 | ≥4.5 ✅ |
| 次要文字 / 背景 | 5.33:1 | 7.16:1 | ≥4.5 ✅ |
| 次要文字 / 次级背景 | 4.97:1 | 6.66:1 | ≥4.5 ✅ |
| 反白文字 / 反白底 | 17.40:1 | 16.00:1 | ≥4.5 ✅ |

注：浅色主题的"次要文字 / 次级背景"为 4.97:1，余量最小；后续若调亮 `#6b6b6b` 或调暗 `#f7f7f7` 会跌破阈值，CI 会拦截。

## 5. 构建与产物

| 项 | 结果 |
| --- | --- |
| 构建 | 成功，5 页（四语言 + 根重定向），约 4.3 s |
| CSS | 单文件产物 `dist/_astro/index.*.css`，含两套主题变量 |
| JS | 主题脚本被内联进 HTML（Astro 对小脚本内联），无额外请求 |
| 资源路径 | 无根绝对路径，全部经 `base` |

## 6. 遗留

- **移动端导航**目前是横向滚动，抽屉/汉堡菜单按路线图放到 Phase 5（页面齐了再决定信息密度）。
- **中文字体**用系统字体栈（观感因平台而异）；子集化方案仍待定（TD-10）。
- **未启用页面**在导航中显示为弱化文本（`nav__link--pending`），Phase 5 建页面时把 `src/config/nav.ts` 的 `enabled` 置 `true` 即可。
- 首屏无闪烁是"脚本先于绘制"的推理结论，尚未在多设备实测；正式验收（Phase 12）需真机确认。

## 7. 下一阶段

Phase 3（多语言系统）：补齐页面级文案、语言切换对内容页的判断（`translationKey` 预埋）、`hreflang` 组输出、404 语言感知页。
