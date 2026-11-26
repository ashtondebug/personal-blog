# 工程索引

> **用途**：工程约束的入口。写代码、改构建、加依赖前从这里进入。
> **状态**：Proposed（全部为面向实现阶段的约束；当前仓库**尚无** `package.json` 与任何源码）
> **更新**：2026-11-26
> **相关**：[编码规范](./coding-standards.md) · [项目结构](./project-structure.md) · [测试策略](./testing-strategy.md) · [构建与部署](./build-and-deployment.md) · [依赖策略](./dependency-policy.md) · [文档地图](../PROJECT_MAP.md)

## 0. 重要前提

项目已进入 **Phase 1（项目初始化）**：仓库现有 `package.json`、`astro.config.mjs`、`tsconfig.json` 与最小 `src/` 骨架（i18n、布局、四语言首页），构建可跑通。**尚无**内容集合、组件库、样式系统与八大页面——这些属于 Phase 2 及以后。

本板块描述的是**约束**：写代码前按表格找到对应文档，不要因为骨架存在就认为功能已经实现。

## 1. 任务 → 先读哪份

| 我要做的事 | 先读 |
| --- | --- |
| 写页面 / 组件 / 样式 | [编码规范](./coding-standards.md) + [项目结构](./project-structure.md) + [设计系统](../design/design-system.md) |
| 加内容类型 / 改 frontmatter | [数据模型](../architecture/data-models.md) + [内容架构](../architecture/content-architecture.md) |
| 改构建或部署流程 | [构建与部署](./build-and-deployment.md) + [部署架构](../architecture/deployment-architecture.md) |
| 引入一个依赖 | [依赖策略](./dependency-policy.md)（必须登记） |
| 判断是否"做完了" | [测试策略](./testing-strategy.md) + [路线图](../../plans/active/000-initial-implementation-roadmap.md) |
| 改文档 | [AGENTS.md](../../AGENTS.md) 的"文档维护规则" |

## 2. 五条工程底线

1. **仓库即事实来源**：任何只在聊天里说过的约定等于不存在。
2. **构建必须可复现**：lockfile 入库，Node 版本由工作流固定。
3. **不新增客户端运行时**：见 [ADR-0006](../decisions/0006-no-default-ui-framework.md)。
4. **文档与实现同批提交**：改行为必须改对应文档（[AGENTS.md](../../AGENTS.md)）。
5. **失败要显式**：构建期校验失败优于运行时静默降级。
