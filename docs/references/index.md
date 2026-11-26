# 参考资料索引

> **用途**：外部权威资料的索引与核验记录。需要"事实依据"时查这里，而不是凭记忆。
> **状态**：Confirmed（已核验项）+ Needs Validation（待复核项）
> **更新**：2026-11-26
> **相关**：[文档地图](../PROJECT_MAP.md) · [Astro](./astro.md) · [GitHub Pages 与 Actions](./github-pages-and-actions.md) · [Waline](./waline.md) · [Web 标准](./web-standards.md) · [风险清单](../risks-and-validation.md)

## 1. 本目录与 `docs/decisions/` 的分工

| 目录 | 内容 |
| --- | --- |
| `docs/references/` | **外部**资料：官方文档链接、结论摘要、核验日期、置信度 |
| `docs/decisions/` | **本项目**的取舍：为什么这样选、备选方案、影响 |

结论来自外部 → 记在 references；项目据此做选择 → 记在 decisions。

## 2. 核验状态图例

| 标记 | 含义 |
| --- | --- |
| ✅ 已核验 | 本次直接从官方源取得原文并记录日期 |
| ◐ 部分核验 | 核心结论来自官方，但细节（参数、额度）未逐条确认 |
| ○ 待复核 | 来自一般性知识，尚未在官方源确认；实现前必须复核 |

## 3. 资料清单

| 文档 | 覆盖 |
| --- | --- |
| [Astro](./astro.md) | 版本与引擎要求、i18n 路由与 `astro:i18n`、Content Collections、`site`/`base` |
| [GitHub Pages 与 Actions](./github-pages-and-actions.md) | Pages 限制与计划要求、默认域名、官方部署 Action 版本、工作流权限 |
| [Waline](./waline.md) | 客户端 props、`pageview`/`reaction`、部署方式、数据库矩阵 |
| [Web 标准](./web-standards.md) | Manifest、Service Worker、`prefers-color-scheme`、`color-scheme`、无障碍 |

## 4. 核验纪律

1. **优先官方源**：框架官方文档、平台官方文档、MDN/W3C 规范。不引用博客与二手教程作为结论依据。
2. **每次记录日期**：本项目所有核验日期以 `2026-11-26` 为基线；升级或变更时重新核验并更新。
3. **区分"标准稳定"与"实现易变"**：标准层面的事实可长期写；版本号、Action 主版本、免费额度属于易变项，必须带日期。
4. **禁止编造 API**：不确定的名称、参数一律标 `待复核`，不得写入实现文档当作事实。

## 5. 复核触发条件

- Astro 大版本升级（参考官方 upgrade guide）。
- GitHub Pages / Actions 政策或限制变化。
- Waline 客户端或服务端大版本更新。
- 任何"按参考实现却发现接口不存在"的情况（说明参考过期）。
