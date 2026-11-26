# ADR-0001：采用 Astro 作为站点框架

> **用途**：说明站点框架的选择依据。任何"换框架/引入第二套渲染方案"的提议必须先读本文。
> **状态**：Confirmed（用户已指定 Astro 为核心技术栈）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [系统总览](../architecture/system-overview.md) · [ADR-0006](./0006-no-default-ui-framework.md) · [ADR-0002](./0002-github-pages-hosting.md) · [Astro 参考](../references/astro.md)

## 背景

需求是一个**内容为主、交互为辅**的个人博客：大量 Markdown 文章、摄影图集、若干轻交互（主题、搜索、灯箱、播放器），托管在只能提供静态文件的 GitHub Pages 上。页面数量随内容线性增长，但每个页面的结构高度模板化；需要多语言路由、内容集合校验、构建期派生数据（标签、分类、热力图、反向链接）。

## 决策

使用 **Astro**（当前稳定版 7.4.13，要求 Node ≥ 22.23.4）作为唯一的站点框架：

- 页面用 `.astro` 组件，构建期渲染为静态 HTML。
- 内容用 Astro Content Collections 管理（`src/content.config.ts` + zod schema）。
- 多语言用内置 i18n 路由与 `astro:i18n` 工具，不引第三方 i18n 库。
- 交互用原生 ES Module，不引入 UI 框架（见 [ADR-0006](./0006-no-default-ui-framework.md)）。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| Next.js（静态导出） | 为内容站引入完整 React 运行时与更多构建复杂度；静态导出下多数能力用不到 |
| Nuxt / Vue 静态站 | 同上，运行时与生态偏重 |
| Hugo / Hexo / Jekyll | 构建快，但类型校验、内容集合 schema、组件化与 TS 生态弱，不符合"可被 Agent 长期维护"的目标 |
| Eleventy | 灵活但需要大量自建约定，缺少内置内容 schema 校验 |
| 纯手写 HTML | 多语言与内容聚合会迅速失控 |

## 选择原因

1. **默认零 JS**：静态优先的产物形态与"博客不需要 SPA"的定位一致，直接服务于性能与可访问性。
2. **Content Collections**：frontmatter 用 zod 校验、`getCollection`/`render` 官方 API 稳定，构建期即为质量防线（官方参考，核验 2026-11-26）。
3. **内置 i18n 路由**：`defaultLocale`/`locales`/`routing` 与 `astro:i18n` 工具函数覆盖本项目四语言需求，无需自造前缀逻辑。
4. **官方 GitHub Pages 部署路径成熟**：`withastro/action` 直接对接 Pages，配置面小。
5. **生态可扩展但默认不装**：需要时可加 integration，不需要时不产生运行时负担。

## 影响

- 正面：产物是纯静态文件；构建期完成聚合与校验；页面模板复用度高。
- 负面：**受 Astro 大版本演进影响**（v5 起 `render(entry)` 取代 `entry.render()`，v6 引入 live collections），升级需按官方 upgrade guide 逐步走并复核本文引用的事实。
- 约束：所有内容派生逻辑必须能在构建期表达；任何"必须服务端"的需求自动落入外部服务（[ADR-0007](./0007-static-dynamic-service-boundary.md)）。
- 复核点：大版本升级后重新核验 API 名称与配置字段（记录在 [Astro 参考](../references/astro.md)）。
