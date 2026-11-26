# 006 · 搜索与阅读功能（Phase 6）

> **用途**：记录搜索与阅读功能的实现、实测证据与取舍。改搜索、目录、进度、分享前先读本文。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [搜索集成](../../docs/integrations/search.md) · [Pagefind 参考](../../docs/references/pagefind.md) · [交互准则](../../docs/design/interaction-guidelines.md)

## 1. 目标

按 [搜索集成](../../docs/integrations/search.md) 与 [功能规格 §1–§5](../../docs/product/feature-specifications.md) 落地：全站搜索（标题/正文/分类/标签）、`/` 与 `Esc` 快捷键、TOC、阅读进度、分享。

## 2. 交付物

| 项 | 实现 |
| --- | --- |
| 搜索索引 | `npm run build` = `astro build && pagefind --site dist`，产物在 `dist/pagefind/` |
| 索引范围 | 只有内容详情页与 About 带 `data-pagefind-body`；其余页面 `data-pagefind-ignore`（列表页不重复命中） |
| 搜索 UI | `src/components/search/SearchOverlay.astro`：浮层 + `/search/` 页内常驻两种模式，共用一套样式 |
| 搜索逻辑 | `src/scripts/search.ts`：懒加载 `pagefind.js`、`baseUrl` 带 base、`debouncedSearch`、按 `url` 前缀过滤当前语言、最多 8 条、`excerpt` 直接作为 innerHTML（Pagefind 已转义） |
| 快捷键 | `/` 打开（输入框/可编辑区域内不劫持）、`Esc` 关闭、关闭后焦点回到触发元素、浮层内 Tab 循环 |
| 降级 | 无 JS 时头部搜索入口是指向 `/{locale}/search/` 的普通链接；浮层脚本失败时不影响页面其余功能 |
| TOC | `src/components/blog/TableOfContents.astro` + `src/scripts/toc.ts`：取 `render()` 的 `headings`，滚动时高亮当前章节（`aria-current="true"`） |
| 阅读进度 | `src/components/blog/ReadingProgress.astro` + `src/scripts/reading-progress.ts`：以文章元素为基准计算，尊重 `prefers-reduced-motion` |
| 分享 | `src/components/blog/Share.astro` + `src/scripts/share.ts`：复制规范链接，失败时兜底选中并提示手动复制；不引入第三方分享 SDK |
| 阅读时长 | Phase 4 已实现（构建期计算），列表与详情共用 |

## 3. 实测证据（临时内容，测完已删除）

种 6 篇中文文章（其中 1 篇含两个 `h2`）+ 4 个 About 页，构建后逐项断言，**15 项全部通过**：

| 检查 | 结果 |
| --- | --- |
| 详情页有 `data-pagefind-body`，body 未被整体忽略 | OK |
| 列表页 body 带 `data-pagefind-ignore` 且无 `data-pagefind-body` | OK |
| 搜索页含容器与本地化空状态、引用 Pagefind 脚本 | OK |
| 所有页面都有搜索入口与浮层挂载 | OK |
| `dist/pagefind/pagefind.js` 存在 | OK |
| zh-CN 索引页数 = 6 篇文章 + 1 个 About = 7 | OK |
| 四种语言都被索引（en / ja / zh-cn / zh-tw） | OK |
| 详情页渲染 TOC（两个 `h2` 均出现） | OK |
| 详情页有阅读进度条与分享按钮 | OK |
| 列表页不含 TOC 标记 | OK |

清理后重新构建：`Indexed 4 pages`（四语言 About），确认零文章时索引仍能生成。

## 4. 关键决定

1. **单一索引 + 客户端语言过滤**：Pagefind 会按 `<html lang>` 分语言建索引，但一个 bundle 内含全部语言元数据。查询后按 `url.startsWith(BASE + locale + '/')` 过滤，实现简单、无需 filters 配置。代价是首搜会拉多语言元数据，登记为 TD-27。
2. **用 About 页兜底**：Pagefind 在零可索引页面时**直接报错退出**（实测）。About 是常驻内容页，把它标为可索引，保证空站也能构建。
3. **只索引详情页**：列表/聚合页若也进索引，同一篇文章会出现多个结果。
4. **`/search/` 页与浮层共用组件**：无 JS 时头部入口退化为普通链接，页面至少能加载（虽然查询仍依赖 JS）。

## 5. 遗留

- **TOC 只加在 Blog 与 Knowledge 详情页**：Projects / Gallery / Moments 是短页面，没有目录需求；如需要可复用同一组件。
- **搜索索引含四语言数据**（TD-27），后续可按语言拆分 bundle。
- **跨语言搜索未实现**（需求未确认，默认只搜当前语言）。
- **`/` 快捷键在移动端键盘上意义有限**，未做额外处理。
- **Pagefind 排序/过滤/高亮参数**尚未使用（`sort`、`filters`、highlight 参数），等有日期/分类筛选需求再评估。

## 6. 下一阶段

Phase 7（交互功能）：灯箱、年度热力图、时间轴、本地音乐播放器，以及移动端导航抽屉。
