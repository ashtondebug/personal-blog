# 000 · 项目知识体系（Phase 0）

> **用途**：记录 Phase 0 的执行结果与验收证据。想知道"知识库是怎么来的、检查过什么"时读本文。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [项目地图](../../docs/PROJECT_MAP.md) · [风险清单](../../docs/risks-and-validation.md)

## 1. 目标

按项目任务书要求，在**不写任何业务代码**的前提下，把仓库建成"全新 Agent 可独立理解、导航、规划并持续维护"的知识系统。

## 2. 仓库现状调查（执行前）

| 项 | 结论 |
| --- | --- |
| Git 仓库 | **不存在**（`git status` 报 not a repository） |
| 已有代码 | 无（无 `package.json`、无 `src/`） |
| 已有文档 | 仅 `FOR_AGENT.md`（任务输入，不入库） |
| 已有 Git 配置 | 全局 `user.name=AshtonDebug`、`user.email=debug_life@qq.com` |
| 工具链 | Node v24.19.0、pnpm 11.20.0、git 2.56、gh 2.96（已登录 `ashtondebug`） |
| 远程仓库 | 本目录无 remote；账号下无对应的博客仓库 |

结论：仓库为空，从零规划；无需保护既有工作。

## 3. 交付物

| # | 交付物 | 位置 |
| --- | --- | --- |
| 1 | Agent 入口地图（42 行） | `AGENTS.md` |
| 2 | 架构总地图 | `ARCHITECTURE.md` |
| 3 | 人类入口 | `README.md` |
| 4 | 项目地图 | `docs/PROJECT_MAP.md` |
| 5 | 文档索引与板块索引 | `docs/index.md` + 8 个 `*/index.md` |
| 6 | 产品文档（概览/需求/信息架构/功能规格） | `docs/product/` |
| 7 | 设计文档（原则/系统/排版/配色主题/交互） | `docs/design/` |
| 8 | 架构文档（系统/前端/路由 i18n/内容/数据模型/部署） | `docs/architecture/` |
| 9 | 工程文档（规范/结构/测试/构建部署/依赖） | `docs/engineering/` |
| 10 | 集成文档（Waline/统计/PWA/搜索/媒体） | `docs/integrations/` |
| 11 | 安全文档（隐私/安全基线） | `docs/security/` |
| 12 | 决策记录 ADR-0001～0007 | `docs/decisions/` |
| 13 | 参考资料与核验记录 | `docs/references/` |
| 14 | 风险与待验证清单（22 条） | `docs/risks-and-validation.md` |
| 15 | 实施路线图（12 阶段） | `plans/active/000-initial-implementation-roadmap.md` |
| 16 | 技术债台账（20 条） | `plans/tech-debt.md` |
| 17 | 文档一致性检查脚本 + CI | `scripts/check-docs.mjs`、`.github/workflows/docs-check.yml` |

## 4. 验收证据

| 检查项 | 结果 |
| --- | --- |
| 相对链接可达（大小写敏感） | `node scripts/check-docs.mjs` → 56 个 Markdown，0 断链 |
| 根绝对路径（`/...`） | 0 |
| 文档头四行齐备 | 全部通过 |
| `AGENTS.md` 篇幅 | 42 行（上限 100） |
| 业务代码 | 无（无 `package.json`、无 `src/`） |
| `FOR_AGENT.md` 是否入库 | 已被 `.gitignore` 排除 |
| 需求覆盖 | 任务书中每条已确认需求都在 `docs/product/requirements.md` 有对应 REQ 编号 |
| 文档冲突 | 未发现；各文档状态标记一致（Confirmed / Proposed / Needs Validation） |

## 5. 关键技术事实的核验方式

所有外部事实均从官方源取得并记录核验日期（2026-11-26），见 `docs/references/`：

- Astro 版本与 `engines`（npm registry 官方元数据）
- 内容集合与 i18n API（官方文档原文，逐字保留 API 名）
- GitHub Pages 限制与官方部署 Action 版本（GitHub 官方文档 + Astro 部署指南）
- Waline 客户端参数、`pageview`/`reaction`、部署方式与数据库矩阵（Waline 官方文档）
- Pagefind 版本（npm registry）
- PWA/Manifest/Service Worker 基础（MDN / W3C）

未能确认的事项一律标 `Needs Validation`，未伪装成结论。

## 6. 推送与远程

| 项 | 值 |
| --- | --- |
| 远程仓库 | `https://github.com/ashtondebug/personal-blog`（Public，2026-11-26 建立） |
| 提交 | `5960d24 docs: 建立项目知识体系（Phase 0）`，作者邮箱 `debug_life@qq.com` |
| 分支 | `main`（已设置 upstream） |
| CI | 「Docs Check」工作流首次运行：**success**（10s）；后随 Phase 2 增加对比度检查并改名为「Docs & Design Check」 |
| `FOR_AGENT.md` | 未推送（`.gitignore` 排除，远程根目录无此文件） |
| Pages | **未启用**（当前无站点产物；Phase 1 建立 `deploy.yml` 后再启用，Source 选 GitHub Actions） |

## 7. 遗留与下一步

- 未定项集中在 [风险清单](../../docs/risks-and-validation.md) §1（P0）：站点名、仓库名/`base`、默认语言前缀、尾斜杠策略、仓库可见性。
- 下一步是 [路线图](../active/000-initial-implementation-roadmap.md) 的 Phase 1（项目初始化），**需用户确认后开始**。
- 本阶段未创建：`package.json`、`astro.config`、`src/`、部署工作流（`deploy.yml`）、任何页面与样式。
