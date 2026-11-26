# 文档索引

> **用途**：`docs/` 的目录页。进入知识库的第一个落点，按"我要做什么"分流到板块。
> **状态**：Confirmed（结构）+ 各文档状态见其自身
> **更新**：2026-11-26
> **相关**：[项目地图](./PROJECT_MAP.md) · [AGENTS.md](../AGENTS.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [计划](../plans/index.md)

## 1. 先读哪份

| 你是谁 / 要做什么 | 读这个 |
| --- | --- |
| 第一次接手这个项目 | [项目地图](./PROJECT_MAP.md) → [产品概览](./product/product-overview.md) |
| 要写代码 | [架构索引](./architecture/index.md) → [工程索引](./engineering/index.md) |
| 要确认某个功能该不该做 | [需求清单](./product/requirements.md) |
| 要改视觉或交互 | [设计索引](./design/index.md) |
| 要接外部服务 | [集成索引](./integrations/index.md) |
| 要判断"现在该做什么" | [路线图](../plans/active/000-initial-implementation-roadmap.md) |
| 想知道哪些事没定 | [风险与待验证](./risks-and-validation.md) |
| 要查官方事实 | [参考资料](./references/index.md) |

## 2. 板块

| 板块 | 入口 | 内容 |
| --- | --- | --- |
| 项目地图 | [PROJECT_MAP.md](./PROJECT_MAP.md) | 总入口：领域、权威文档、关联、起点、未定项 |
| 产品 | [product/index.md](./product/index.md) | 概览、需求、信息架构、功能规格 |
| 设计 | [design/index.md](./design/index.md) | 原则、设计系统、排版、配色主题、交互 |
| 架构 | [architecture/index.md](./architecture/index.md) | 系统、前端、路由 i18n、内容、数据模型、部署 |
| 工程 | [engineering/index.md](./engineering/index.md) | 规范、结构、测试、构建部署、依赖 |
| 集成 | [integrations/index.md](./integrations/index.md) | Waline、统计、PWA、搜索、媒体存储 |
| 安全 | [security/index.md](./security/index.md) | 隐私、安全基线 |
| 决策 | [decisions/index.md](./decisions/index.md) | 7 份 ADR |
| 参考资料 | [references/index.md](./references/index.md) | 官方链接与核验记录 |
| 风险 | [risks-and-validation.md](./risks-and-validation.md) | 全部未定与风险 |

## 3. 约定

- 每份文档开头有 **用途 / 状态 / 更新 / 相关** 四行；状态用 `Confirmed`、`Proposed`、`Needs Validation`、`Deprecated`。
- 链接一律相对路径；改文件名必须全仓更新引用（CI 会检查，见 [脚本](../scripts/check-docs.mjs)）。
- 本文档库的**来源**是一份本地任务书（`FOR_AGENT.md`），该文件**不入库**（已在 `.gitignore` 排除），因此不要引用它。
- 文档之间不允许出现互相矛盾的结论；发现冲突时以 [需求清单](./product/requirements.md) 与 [决策记录](./decisions/index.md) 为准，并修正其他文档。
