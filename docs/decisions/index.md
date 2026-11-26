# 决策记录索引（ADR）

> **用途**：记录"为什么这么做"的关键决定。任何与本文冲突的实现都属于违背决策，必须先改 ADR 再改代码。
> **状态**：Confirmed（其中被用户确认的决策）+ Proposed / Needs Validation（Agent 提议或待验证项）
> **更新**：2026-11-26
> **相关**：[架构索引](../architecture/index.md) · [需求清单](../product/requirements.md) · [风险与待验证](../risks-and-validation.md) · [技术债](../../plans/tech-debt.md)

## 1. 决策清单

| ID | 决策 | 状态 | 日期 |
| --- | --- | --- | --- |
| [0001](./0001-astro-as-site-framework.md) | 采用 Astro 作为站点框架 | Confirmed | 2026-11-26 |
| [0002](./0002-github-pages-hosting.md) | 用 GitHub Pages 托管静态站 | Confirmed | 2026-11-26 |
| [0003](./0003-markdown-content-and-github-actions.md) | 内容用 Markdown + Content Collections，发布用 GitHub Actions | Confirmed | 2026-11-26 |
| [0004](./0004-per-language-articles.md) | 采用独立语言文章策略（不做翻译回退） | Confirmed | 2026-11-26 |
| [0005](./0005-waline-for-comments.md) | 评论使用 Waline 独立服务 | Confirmed + Needs Validation（服务端选型） | 2026-11-26 |
| [0006](./0006-no-default-ui-framework.md) | 默认不引入 React/Vue 等 UI 框架 | Confirmed | 2026-11-26 |
| [0007](./0007-static-dynamic-service-boundary.md) | 静态能力与外部动态服务分离 | Confirmed | 2026-11-26 |
| [0008](./0008-url-strategy.md) | URL 策略：全语言前缀 + 尾斜杠 always + `base=/personal-blog` | Confirmed（Phase 1 定案） | 2026-11-26 |
| [0009](./0009-markdown-pipeline-and-wiki-links.md) | 引入 `@astrojs/markdown-remark` 以支持 `[[双向链接]]` 插件 | Confirmed（Phase 5 定案） | 2026-11-26 |
| [0010](./0010-comments-and-reactions.md) | 评论前端先就绪、服务端待定；点赞用 Waline `reaction`；评论 key 规则 | Confirmed（2026-11-26 用户确认） | 2026-11-26 |
| [0011](./0011-home-hero-acg-style.md) | 首页二次元主视觉与"强调色"例外（仅首页） | Confirmed（2026-11-26 用户要求） | 2026-11-26 |

## 2. 什么情况必须写 ADR

- 引入或移除一个第三方运行时依赖 / 外部服务。
- 改变 URL 结构、语言策略、评论 path 规则。
- 改变构建或发布流程。
- 为某个需求选择一种实现路线，而该选择后续难以回退（数据迁移、SEO、评论丢失）。
- 推翻既有 ADR（**不删除旧 ADR**，新写一条并在内部标注 "Supersedes ADR-000N"）。

## 3. 格式

每份 ADR 固定六段：**背景 / 决策 / 备选方案 / 选择原因 / 影响 / 状态**。文件命名 `NNNN-kebab-case.md`，编号连续不复用。

## 4. 状态语义

| 状态 | 含义 |
| --- | --- |
| `Accepted` / `Confirmed` | 已生效，实现必须遵守 |
| `Proposed` | Agent 提议，等待用户确认，**不得据此开发** |
| `Needs Validation` | 方向已定，但前提（免费额度、接口、政策）未验证 |
| `Superseded` | 已被后续 ADR 取代，保留供追溯 |
| `Deprecated` | 已废弃，相关实现必须移除 |
