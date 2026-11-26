# ADR-0003：内容用 Markdown + Content Collections，发布用 GitHub Actions

> **用途**：说明"内容怎么存、怎么被校验、怎么变成站点"。任何改动内容存储方式或发布流程的提议先读本文。
> **状态**：Confirmed（用户已指定 Markdown/MDX、Content Collections、GitHub Actions）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [内容架构](../architecture/content-architecture.md) · [数据模型](../architecture/data-models.md) · [构建与部署](../engineering/build-and-deployment.md)

## 背景

内容需要长期维护、可版本管理、可 diff、可回滚；同时要能被 AI Agent 直接读写而不经过网页后台。发布必须自动、可重复。

## 决策

1. 所有内容以 **Markdown / MDX 文件**保存在仓库内，按集合与语言分目录（[内容架构](../architecture/content-architecture.md)）。
2. 用 **Astro Content Collections** 定义集合与 zod schema（配置文件 `src/content.config.ts`，加载器 `glob({ pattern, base })` 来自 `astro/loaders`）。
3. 页面通过 `getCollection` / `getEntry` / `render(entry)` 取内容（`render` 自 v5 起返回 `{ Content, headings, remarkPluginFrontmatter }`）。
4. 发布通过 **GitHub Actions**：`push` 到 `main` → 构建 → 发布到 Pages。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| Headless CMS（Strapi/Sanity/Contentful） | 引入额外账号、API、配额与网络依赖；内容不再在仓库里，违背"仓库即事实来源" |
| Git-based CMS（Decap 等） | 仍是 Markdown，但多一层需要维护的编辑界面，收益低于成本 |
| 数据库驱动内容 | 与静态托管冲突，且失去 diff 与回滚能力 |
| 手动 `git push` 后本地构建上传 | 不可重复、易出错、无审计记录 |

## 选择原因

- **可 diff、可 review、可回滚**：内容变更与代码变更同一套流程。
- **构建期校验**：schema 错误直接让构建失败，而不是上线后才发现缺字段。
- **派生数据可算**：标签、分类、反向链接、热力图都在构建期从同一份内容算出，不会出现两套真相。
- **零后台**：没有需要维护的服务与登录入口，攻击面更小。

## 影响

- 内容贡献者必须会 Git；这是有意的取舍。
- 构建时间随内容量增长（图片优化是主要成本），需要在 [构建与部署](../engineering/build-and-deployment.md) 监控。
- frontmatter 字段是硬契约：改字段必须同批改 [数据模型](../architecture/data-models.md) 与 schema（[变更流程](../architecture/data-models.md)）。
- lockfile 必须入库（官方 Action 依赖它探测包管理器）。
- 发布失败会阻断内容更新，因此构建必须快且稳定；重型步骤（搜索索引）放在构建产物之后。
