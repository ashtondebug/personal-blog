# Astro 参考资料

> **用途**：本项目引用的 Astro 官方事实与链接。写任何 Astro 相关实现前先核对这里；与本文件冲突的实现视为错误。
> **状态**：✅ 已核验（2026-11-26），版本敏感项需随升级复核
> **更新**：2026-11-26
> **相关**：[资料索引](./index.md) · [ADR-0001](../decisions/0001-astro-as-site-framework.md) · [路由与 i18n](../architecture/routing-and-i18n.md) · [内容架构](../architecture/content-architecture.md)

## 1. 版本与运行环境

| 结论 | 来源 | 核验日期 | 置信度 |
| --- | --- | --- | --- |
| 当前稳定版 `astro@7.4.13` | https://registry.npmjs.org/astro/latest | 2026-11-26 | ✅ 高 |
| `engines`：`node >= 22.23.4`、`pnpm >= 7.1.0`、`npm >= 9.6.5` | 同上 | 2026-11-26 | ✅ 高 |
| 官方 GitHub Pages 部署文档中 `withastro/action` 的 `node-version` 默认值为 24 | Astro 部署指南（见下） | 2026-11-26 | ✅ 高 |

## 2. 官方链接

| 主题 | 链接 |
| --- | --- |
| 文档首页 | https://docs.astro.build/ |
| 配置参考（`site` / `base` / `i18n` / `trailingSlash` / `build.format`） | https://docs.astro.build/en/reference/configuration-reference/ |
| i18n 路由指南 | https://docs.astro.build/en/guides/internationalization/ |
| `astro:i18n` API 参考 | https://docs.astro.build/en/reference/modules/astro-i18n/ |
| Content Collections 指南 | https://docs.astro.build/en/guides/content-collections/ |
| `astro:content` API 参考 | https://docs.astro.build/en/reference/modules/astro-content/ |
| Content Loader API | https://docs.astro.build/en/reference/content-loader-reference/ |
| GitHub Pages 部署指南 | https://docs.astro.build/en/guides/deploy/github/ |
| 升级指南（大版本迁移） | https://docs.astro.build/en/upgrade-astro/ |

## 3. 内容集合（逐字 API，已核验）

| 结论 | 置信度 |
| --- | --- |
| 集合配置位于 `src/content.config.ts`，导出 `collections` | ✅ |
| `import { defineCollection, getCollection, getEntry, getEntries, render, reference } from 'astro:content'` | ✅ |
| `z` 来自 `astro/zod`；加载器 `glob`、`file` 来自 `astro/loaders` | ✅ |
| 用法形如 `defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/data/blog' }), schema })` | ✅ |
| `render(entry)`（v5 起）返回 `{ Content, headings, remarkPluginFrontmatter }` | ✅ |
| `getCollection(name, filter?)` 返回条目数组；`getEntry(name, id)` 返回单条或 `undefined` | ✅ |
| 条目字段：`id`（glob loader 会 slug 化）、`collection`、`data`、`body`、`filePath` | ✅ |
| `base` 可指向 `src/content` 之外的目录（如 `./src/data/blog`） | ✅ |

## 4. i18n（逐字 API，已核验）

| 结论 | 置信度 |
| --- | --- |
| `astro:i18n` 导出：`getRelativeLocaleUrl`、`getAbsoluteLocaleUrl`、`getRelativeLocaleUrlList`、`getAbsoluteLocaleUrlList`、`getPathByLocale`、`getLocaleByPath`、`redirectToDefaultLocale`、`redirectToFallback`、`notFound`、`middleware`、`requestHasLocale`、`normalizeTheLocale`、`pathHasLocale`、`toCodes`、`toPaths` | ✅ |
| `getRelativeLocaleUrl(locale, path?, { prependWith, normalizeLocale })`；locale 不存在时抛错 | ✅ |
| 当前语言可通过 `Astro.currentLocale` 读取 | ✅ |
| 自定义语言路径用 `locales: [{ path, codes }]` 形式 | ✅ |
| `i18n.routing` 可设为 `"manual"`，此时由中间件接管；`middleware()` 接受 `{ fallbackType: 'redirect' \| 'rewrite', prefixDefaultLocale, redirectToDefaultLocale }` | ✅ |
| 存在 `i18n.fallback` 配置项 | ✅ |
| `routing.prefixDefaultLocale` 的默认值 | ○ 待复核（以配置参考 `#i18n` 当日内容为准） |
| `trailingSlash` 与 `build.format` 的交互细节 | ○ 待复核 |

## 5. 已知的版本敏感点

- `render()` 的位置从 v4 的 `entry.render()` 改为 v5 起的 `render(entry)`；旧写法不要再用。
- v6 起引入 live collections（`defineLiveCollection`、`src/live.config.*`），本项目**不使用**（无运行时数据源）。
- Markdown 处理管线在近期版本有变动（出现 Sätteri / Unified 两种 processor 文档），插件接入方式需在实现阶段按当期文档复核。
- `getEntry` 的 `id` 语义与文件名/目录结构相关，改动目录会改变 `id` → 影响 URL 与评论 `path`。
