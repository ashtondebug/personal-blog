# 配色与主题

> **用途**：定义黑白灰灰阶、三态主题的实现方式与深色适配规则。写任何颜色值之前必读。
> **状态**：Confirmed（灰阶已落地为 `src/styles/tokens.css` 并实测对比度）+ Proposed（个别灰值仍可微调）
> **更新**：2026-11-26
> **相关**：[设计索引](./index.md) · [设计系统](./design-system.md) · [字体与排版](./typography.md) · [交互准则](./interaction-guidelines.md) · [Waline 集成](../integrations/waline.md)

## 1. 灰阶（两套值，Proposed）

不用彩色主色。层次来自灰阶与字重。**深色模式不是反相**，而是重新选值。

| Token | 角色 | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- | --- |
| `--color-bg` | 页面背景 | `#FFFFFF` | `#121212` | 全局底色 |
| `--color-surface` | 次级背景 | `#F7F7F7` | `#1A1A1A` | 卡片、代码块、引用块 |
| `--color-line` | 分隔线 | `#E5E5E5` | `#2A2A2A` | 边框、分隔线、表格线 |
| `--color-muted` | 次要文字 | `#6B6B6B` | `#A0A0A0` | 元信息、说明、占位 |
| `--color-text` | 主文字 | `#1A1A1A` | `#EDEDED` | 正文与标题 |
| `--color-invert-bg` | 反白底 | `#1A1A1A` | `#EDEDED` | 强调块、按钮悬停 |
| `--color-invert-text` | 反白字 | `#FFFFFF` | `#121212` | 与上一行配对 |

规则：

- **不用纯黑 `#000` 作正文、不用纯白 `#FFF` 作深色正文**（刺眼且丢失层次）。
- 浅色正文与背景对比度 ≥ 12:1（`#1A1A1A` on `#FFF`），深色正文对比度 ≥ 12:1（`#EDEDED` on `#121212`），留足余量。
- `--color-muted` 用于非关键信息，必须仍满足 ≥ 4.5:1（**需实测**，当前取值在浅色下约 5.3:1，深色下约 6.5:1，`Needs Validation`）。
- 链接与可交互文本**不加彩色**，靠下划线 + 字重/灰度变化表达。

## 2. 三态主题

| 模式 | 行为 |
| --- | --- |
| `light` | 强制浅色 |
| `dark` | 强制深色 |
| `system` | 跟随 `prefers-color-scheme`，系统切换时实时跟随 |

实现要点（Proposed）：

1. `<head>` 内**内联一小段阻塞脚本**，在首屏绘制前读取 `localStorage: blog:theme` 并给 `<html>` 加 `data-theme`。这是避免闪白/闪黑的唯一可靠方式。
2. 未设置时写 `data-theme="system"`，由 CSS `@media (prefers-color-scheme: dark)` 决定变量；`light`/`dark` 时用 `html[data-theme="dark"]` 覆盖变量。
3. 同时设置 CSS `color-scheme`（如 `color-scheme: light dark`）以让表单控件、滚动条跟随主题。
4. 切换按钮三态循环或三选一（实现方式见 [交互准则](./interaction-guidelines.md)），状态持久化，`system` 模式监听系统变化（`matchMedia` 的 change 事件）。

## 3. 深色模式的具体约束

- 图片：深色下不强制反相，但照片外围留白应改为 `--color-bg`，避免出现白框。
- 代码块：使用 `--color-surface`，语法高亮需准备深色主题，不允许"浅色高亮块出现在深色页面"。
- 阴影：深色下阴影不可见，改用 1px 边框或背景差分表达层级。
- 过渡：主题切换时允许 150–200ms 背景/文字色过渡；**必须**遵循 `prefers-reduced-motion` 关闭。

## 4. 第三方组件的深色适配

Waline 客户端有 `dark` 选项，可接受 `true`/`false`/`'auto'` 或 **CSS 选择器**（官方 props 核验 2026-11-26）。本项目应在 `dark` 中传入与本站一致的选择器（如 `html[data-theme="dark"]`），而不是 `'auto'`，否则用户选择"强制浅色"时 Waline 仍会跟随系统变暗。

同时需要用自定义 CSS 变量覆盖 Waline 的配色，使其融入灰阶体系。

## 5. 打印样式

- 打印时强制浅色背景、隐藏导航/播放器/评论/悬浮控件。
- 正文黑色、链接显示 URL（可选，Proposed）。
- 图片不跨页断裂。

## 6. 检查清单

- [ ] 浅色/深色两套下，正文、次要文字、按钮文字均满足对比度要求（用工具实测，不靠目测）。
- [ ] 切换三态后刷新仍保持所选模式。
- [ ] `system` 模式下操作系统切换主题，页面即时跟随。
- [ ] 首屏无颜色闪烁。
- [ ] Waline 评论区在两种主题下都不出现"白底嵌黑块"。
- [ ] 打印预览无背景色块、无控件。

## 7. 实现与实测（2026-11-26，Phase 2）

| 项 | 实现 |
| --- | --- |
| 变量位置 | `src/styles/tokens.css`：`:root` 为浅色，`[data-theme='dark']` 为深色，另有无 JS 的 `@media (prefers-color-scheme: dark)` 回退 |
| 主题属性 | `<html data-theme="light\|dark">` 驱动变量；`data-theme-mode="light\|dark\|system"` 记录用户选择 |
| 首屏无闪烁 | `<head>` 内联脚本在绘制前读取 `localStorage: blog:theme` 并写入 `data-theme` |
| 切换逻辑 | `src/scripts/theme.ts`：三态循环、写存储、`matchMedia` 变化时仅在 system 模式跟随 |
| 对比度检查 | `scripts/check-contrast.mjs`（CI 执行），阈值 4.5:1 |

实测结果（`npm run check:contrast`）：

| 组合 | 浅色 | 深色 |
| --- | --- | --- |
| 正文 / 背景 | 17.40:1 | 16.00:1 |
| 正文 / 次级背景 | 16.25:1 | 14.87:1 |
| 次要文字 / 背景 | 5.33:1 | 7.16:1 |
| 次要文字 / 次级背景 | 4.97:1 | 6.66:1 |
| 反白文字 / 反白底 | 17.40:1 | 16.00:1 |

注意：浅色"次要文字 / 次级背景"余量最小（4.97:1）。调整 `--color-muted` 或 `--color-surface` 会被 CI 拦截。

## 8. 首页强调色例外（ADR-0011）

2026-11-26 起，**仅首页主视觉**允许一个强调色 `#22d3ee`（青），因为用户要求首页呈二次元风格。边界：

- 只出现在首页 Hero（标签底、主 CTA）与首页章节标题的 3px 竖条；内页仍只用灰阶。
- 与主题无关（Hero 始终是深底亮字），因此校验脚本把它单列为"不随主题变化"的一组。
- 内页若要加颜色，属于需求变更：先写新 ADR，再改 token 与校验。
