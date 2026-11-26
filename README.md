# 个人博客

一个**简约文艺风格的多语言个人门户型博客**：文字与摄影为主，静态生成，长期可维护。

仓库：<https://github.com/ashtondebug/personal-blog> · 线上地址：`https://ashtondebug.github.io/personal-blog/`（Phase 1 部署后可用）

- 内容方向：Tech（技术）· Life（生活）· Knowledge（知识）· Thought（思考）
- 页面：Home · Blog · Projects · Knowledge · About · Gallery · Moments · Guestbook
- 语言：简体中文 `zh-CN` · 繁體中文 `zh-TW` · English `en` · 日本語 `ja`
- 技术栈：Astro · TypeScript · Markdown/MDX · Content Collections · Waline（评论）· GitHub Actions · GitHub Pages

## 当前状态

**Phase 1：项目初始化（已完成）**——已有可构建、可部署的骨架：四语言首页、根路径重定向、i18n 词典与路径工具、`base` 前缀正确、部署工作流。**尚无**文章内容、八大页面与设计系统（Phase 2 及以后）。

站点名称仍是占位值 `未命名空间`（集中定义在 `src/config/site.ts`，定名后只改这一处），见 [风险清单](docs/risks-and-validation.md)。

## 常用命令

```bash
npm install          # 安装依赖（lockfile 已入库，CI 用 npm ci）
npm run dev          # 本地开发
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
npm run check:docs   # 文档链接与结构检查（CI 也会跑）
```

构建注意：若在受限环境（如沙箱）运行，Astro 会尝试写用户目录的遥测配置，可设环境变量 `ASTRO_TELEMETRY_DISABLED=1`。

## 从这里开始读

| 你想了解 | 读 |
| --- | --- |
| 项目是什么、做到什么程度算成功 | [docs/product/product-overview.md](docs/product/product-overview.md) |
| 有哪些需求、哪些还没定 | [docs/product/requirements.md](docs/product/requirements.md) |
| 系统怎么分层、什么能静态生成 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 每个领域的权威文档在哪 | [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md) |
| 为什么做这些技术选择 | [docs/decisions/index.md](docs/decisions/index.md) |
| 下一步做什么 | [plans/active/000-initial-implementation-roadmap.md](plans/active/000-initial-implementation-roadmap.md) |

给 AI Agent 的入口是 [AGENTS.md](AGENTS.md)（地图式导航，不复制需求）。

## 仓库结构

```text
AGENTS.md            Agent 入口地图
ARCHITECTURE.md      架构总地图
README.md            本文件（人类入口）
astro.config.mjs     站点配置（site / base / i18n / trailingSlash）
tsconfig.json        TypeScript 严格模式配置
docs/                项目知识库（产品/设计/架构/工程/集成/安全/决策/参考资料）
plans/               路线图、技术债与已完成计划
scripts/check-docs.mjs  文档链接与结构检查
src/
  config/site.ts     站点名与定位（站名占位值的唯一定义处）
  i18n/              语言定义、UI 词典、带 base 的路径工具
  layouts/           页面骨架
  pages/             路由（[locale] 展开四语言 + 根重定向）
.github/workflows/   文档检查 CI + Pages 部署
```

## 约定

- **仓库是唯一事实来源**：需求、决策、字段定义、设计数值都写在仓库里，不依赖聊天记录。
- 文档带状态标记：`Confirmed`（已确认）· `Proposed`（提议）· `Needs Validation`（待验证）· `Deprecated`（已废弃）。
- 改代码必须同批更新文档；改需求必须先获得作者确认。
- 站点不公开真实姓名、学校、班级、住址与私人联系方式（[隐私规范](docs/security/privacy.md)）。

## 尚未确定

站点名称（空间概念方向）；Waline 服务端选型、浏览量方案与点赞是否启用、搜索方案、中文字体策略。完整清单见 [docs/risks-and-validation.md](docs/risks-and-validation.md)。

## 许可

尚未确定（`Needs Validation`）。在明确之前，默认保留所有权利，不视为开源许可。
