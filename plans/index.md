# 计划索引

> **用途**：计划板块入口。`docs/` 说"是什么/为什么"，`plans/` 说"什么时候做/做到哪一步"。
> **状态**：Confirmed（目录约定）+ Proposed（当前路线图内容）
> **更新**：2026-11-26
> **相关**：[路线图](./active/000-initial-implementation-roadmap.md) · [技术债](./tech-debt.md) · [文档地图](../docs/PROJECT_MAP.md) · [需求清单](../docs/product/requirements.md)

## 1. 目录约定

```text
plans/
├── index.md                          本文件
├── active/                           进行中的计划
│   └── 000-initial-implementation-roadmap.md
├── completed/                        已完成计划归档
├── completed/                        已完成计划归档
│   └── 000-project-mapping.md        Phase 0：项目知识体系（已完成）
└── tech-debt.md                      技术债 / 风险 / 待验证台账
```

- 文件名格式：`NNN-kebab-case.md`，编号递增不复用。
- 一个计划完成后移入 `completed/`，并在本文登记"已完成 + 完成日期 + 结果链接"。
- 计划内容只做**规划**，不写实现细节；实现细节归 `docs/engineering/`。

## 2. 与 `docs/` 的边界

| 问题 | 去哪 |
| --- | --- |
| 这个功能应该是什么行为？ | `docs/product/` |
| 为什么这样架构？ | `docs/architecture/` + `docs/decisions/` |
| 现在做到哪一步？下一步做什么？ | `plans/` |
| 已知但没修的债？ | `plans/tech-debt.md` |

## 3. 当前状态

| 计划 | 状态 | 说明 |
| --- | --- | --- |
| [初始实施路线图](./active/000-initial-implementation-roadmap.md) | Proposed（待用户确认后进入 Phase 1） | 12 个阶段，只规划未执行 |
| [000 · 项目知识体系](./completed/000-project-mapping.md) | 已完成（2026-11-26） | 本知识库、ADR、路线图、文档检查工具 |
| [001 · 项目初始化](./completed/001-phase-1-initialization.md) | 已完成（2026-11-26） | Astro 骨架、四语言首页、部署工作流 |
| [002 · 设计系统与全局布局](./completed/002-phase-2-design-system.md) | 已完成（2026-11-26） | token、reset、排版基线、Header/Footer、三态主题、对比度检查 |
| [003 · 多语言系统](./completed/003-phase-3-i18n.md) | 已完成（2026-11-26） | hreflang/x-default/og:locale、版块级语言切换、语言感知 404、i18n 产物校验 |
| [004 · 内容模型](./completed/004-phase-4-content-model.md) | 已完成（2026-11-26） | 五集合 schema、派生数据、双向链接、构建期内容门禁、最小 Blog 列表/详情 |
| [005 · 八大页面](./completed/005-phase-5-pages.md) | 已完成（2026-11-26） | 八页齐备、三视图与分页、分类/标签聚合、双向链接与反链、项目/图集/动态 |
| [006 · 搜索与阅读](./completed/006-phase-6-search-reading.md) | 已完成（2026-11-26） | Pagefind 索引、搜索浮层与 `/` 快捷键、TOC、阅读进度、分享 |
| [007 · 交互功能](./completed/007-phase-7-interactions.md) | 已完成（2026-11-26） | 灯箱、年度热力图、时间轴、音乐播放器（配置驱动，待音乐文件）、移动端菜单 |

## 4. 计划的生命周期

1. 立项：写清目标、前置条件、交付物、验收标准、依赖与风险。
2. 执行：状态标 `In Progress`；每周/每阶段同步更新状态列。
3. 收尾：构建通过 + 文档同步 + ADR 更新 + 无死链（阶段门禁）。
4. 归档：移入 `completed/`，本文登记结果。

## 5. 纪律

- 不跳阶段：未经用户确认，不得越过未完成阶段提前开发（[路线图](./active/000-initial-implementation-roadmap.md)）。
- 计划变更必须写原因；不允许悄悄改验收标准。
- 技术债不"口头记账"：全部进 [tech-debt.md](./tech-debt.md)。
