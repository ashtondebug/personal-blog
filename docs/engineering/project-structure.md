# 项目结构

> **用途**：目标目录结构的约定。创建任何新目录或文件前，先确认它在这个结构里的位置与职责。
> **状态**：Proposed（规划；**当前仓库尚未创建这些目录**）
> **更新**：2026-11-26
> **相关**：[工程索引](./index.md) · [内容架构](../architecture/content-architecture.md) · [前端架构](../architecture/frontend-architecture.md) · [媒体存储](../integrations/media-storage.md)

## 1. 规划结构

```text
/
├── AGENTS.md               Agent 入口地图
├── ARCHITECTURE.md         架构总地图
├── README.md               人类开发者入口
├── astro.config.mjs        站点配置（site / base / i18n）
├── tsconfig.json
├── package.json            Phase 1 才创建
├── docs/                   项目知识库（现状）
├── plans/                  计划与技术债（现状）
├── scripts/                仓库级工具（现状：check-docs.mjs）
├── .github/workflows/      CI（现状：docs-check.yml）
├── public/                 原样拷贝的静态资源
│   ├── music/              本地音乐（体积受限）
│   └── images/             无需构建处理的图片
└── src/
    ├── content/            内容集合（按集合 × 语言分目录）
    │   ├── blog/{zh-CN,zh-TW,en,ja}/
    │   ├── knowledge/...
    │   ├── projects/...
    │   ├── moments/...
    │   └── gallery/...
    ├── content.config.ts   集合定义与 zod schema
    ├── pages/[locale]/     路由入口（按语言展开）
    ├── layouts/            页面骨架
    ├── components/
    │   ├── ui/             原子件
    │   └── blocks/         组合件
    ├── i18n/               词典、语言配置、路径工具
    ├── styles/             token、reset、typography
    ├── scripts/            客户端交互脚本
    └── assets/             需要构建优化的资源（图片等）
```

## 2. 关键约定

| 约定 | 理由 |
| --- | --- |
| 内容放在 `src/content/`，按语言分目录 | 与"一篇文章只属于一种语言"一致；`glob({ base })` 支持自定义目录（[内容架构](../architecture/content-architecture.md)） |
| `public/` 与 `src/assets/` 分开 | 前者原样拷贝（适合音频、favicon），后者参与构建优化（适合需要多尺寸的图片） |
| 页面只做取数与拼装 | 逻辑集中在 `components/` 与 `i18n/`，便于复用与测试 |
| 客户端脚本独立于组件 | 组件保持"无状态渲染"，交互脚本按页加载（[前端架构](../architecture/frontend-architecture.md)） |
| 文档与工具在根目录 | `docs/`、`plans/`、`scripts/` 是项目自身的知识资产，不混入 `src/` |

## 3. 新增文件的判断顺序

1. 是内容？→ `src/content/<集合>/<语言>/`，并确认 schema 已有对应字段。
2. 是文案？→ `src/i18n/` 词典，四种语言同批补齐。
3. 是页面？→ `src/pages/[locale]/...`，用 `getStaticPaths` 展开语言。
4. 是可复用 UI？→ `components/ui`（原子）或 `components/blocks`（组合）。
5. 是交互逻辑？→ `src/scripts/`，并考虑无 JS 降级。
6. 是媒体？→ 按 [媒体存储](../integrations/media-storage.md) 分类与预算决定入库或外置。
7. 是工程工具？→ `scripts/`，并考虑是否加进 CI。

## 4. 不许出现的东西

- `src/pages` 下未经 `[locale]` 参数化的重复页面（会导致四套模板）。
- 内容里手写的分类/标签 JSON 索引（构建期派生，见 [内容架构](../architecture/content-architecture.md)）。
- 组件目录里的业务数据（数据从页面传入）。
- 任何形式的密钥、令牌、数据库连接串。
- 与需求无关的"示例页面""演示组件"。

## 5. 当前状态声明（Phase 1 完成后）

已创建：`package.json`（lockfile 已生成）、`astro.config.mjs`、`tsconfig.json`、`src/config/site.ts`、`src/i18n/{config,ui,url}.ts`、`src/layouts/BaseLayout.astro`、`src/pages/index.astro`（根重定向）、`src/pages/[locale]/index.astro`、`.github/workflows/{docs-check,deploy}.yml`。

尚未创建（按路线图后续阶段）：`src/content/` 与 `content.config.ts`（Phase 4）、`src/components/` 与 `src/styles/`（Phase 2/5）、`public/`（Phase 2/5）、搜索与 PWA 产物（Phase 6/9）。

## 6. 与 Phase 1 实际结构的差异说明

Phase 1 未创建 `src/components/` 与 `src/styles/`：首页骨架只需布局与 i18n，设计系统属于 Phase 2；提前建空目录只会制造噪音。目录在真正需要时创建。
