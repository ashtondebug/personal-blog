# 005 · 八大页面（Phase 5）

> **用途**：记录八个页面的实现方式、验收证据与遗留。改页面结构或加页面时先读本文。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [信息架构](../../docs/product/information-architecture.md) · [内容架构](../../docs/architecture/content-architecture.md) · [ADR-0009](../../docs/decisions/0009-markdown-pipeline-and-wiki-links.md)

## 1. 目标

补齐八个页面（Home / Blog / Projects / Knowledge / About / Gallery / Moments / Guestbook），并把已经确认的功能（三视图、分页、分类/标签聚合、双向链接、项目详情、图集、动态流）落到可用的静态页面上。

## 2. 交付物

| 页面 | 文件 | 关键能力 |
| --- | --- | --- |
| Home | `src/pages/[locale]/index.astro` | 主视觉 + 最新 4 篇文章 + 版块入口（按导航可用性生成） |
| Blog 列表 | `src/pages/[locale]/blog/index.astro` | 语言过滤、草稿排除、日期倒序、**三视图切换**（列表/网格/杂志，localStorage 持久化） |
| Blog 分页 | `src/pages/[locale]/blog/page/[page].astro` | 每页 6 篇，静态生成第 2 页起 |
| Blog 详情 | `src/pages/[locale]/blog/[slug].astro` | Markdown 渲染、日期/阅读时长/更新时间、多语言切换（`alternatePaths`） |
| 分类聚合 | `src/pages/[locale]/categories/[category].astro` | 自由分类，URL 段经 `taxonomySlug` 归一 |
| 标签聚合 | `src/pages/[locale]/tags/[tag].astro` | 标签经 `normalizeTag` 归一后聚合 |
| Projects | `src/pages/[locale]/projects/{index,[slug]}.astro` | 卡片列表（技术栈 chips）+ 详情（技术栈/仓库/演示/状态/截图） |
| Knowledge | `src/pages/[locale]/knowledge/{index,[slug]}.astro` | 按 `section` 分组的层级目录；详情含**双向链接**、**反向链接面板**与相关条目 |
| Gallery | `src/pages/[locale]/gallery/{index,[slug]}.astro` | 错落网格、caption、作品信息（器材/地点/拍摄时间） |
| Moments | `src/pages/[locale]/moments/{index,[slug]}.astro` | 时间倒序流 + 独立详情页 + 上一条/下一条 |
| Guestbook | `src/pages/[locale]/guestbook.astro` | 页面壳 + 接入位置说明（评论在 Phase 8 挂载） |
| 组件 | `src/components/blog/{Archive,ViewSwitcher}.astro`、`src/components/ui/Pagination.astro` | 三视图与分页复用 |
| 脚本 | `src/scripts/blog-view.ts` | 视图切换（幂等、持久化） |
| 链接插件 | `src/lib/remark-wiki-links.ts` | `[[目标]]` → 相对链接（不用知道 base 与语言） |
| 工具 | `src/lib/blog.ts` | `paginate` / `pagePath` / `taxonomySlug` |

## 3. 验收证据（临时内容，测完已删除）

种了 8 篇中文文章（含 1 篇与英文共享 `translationKey`）、2 个知识条目（互链 + 别名）、1 个项目、1 条动态、1 组图集，构建得到 **55 个页面**，逐项验证：

| 检查 | 结果 |
| --- | --- |
| 列表页有视图切换器与 `data-archive` | OK |
| 第 1 页 6 篇 + 「下一页」链接到 `page/2` | OK |
| 第 2 页 2 篇 + 「上一页」链接 | OK |
| 分类页 `categories/tech` 收录 4 篇 | OK |
| 标签页 `tags/astro` 收录 8 篇 | OK |
| `[[note-b]]` 渲染为 `href="../note-b/"` 且带 `data-wiki-link` | OK |
| `[[note-b\|别名写法]]` 保留显示文本 | OK |
| 目标条目显示反向链接面板并列出引用者 | OK |
| 项目详情渲染技术栈与带 `rel="noopener noreferrer"` 的仓库链接 | OK |
| 图集渲染 `alt` 与 caption | OK |
| 动态详情有上一条/下一条 | OK |
| 首页展示最新文章、不再出现旧占位文案 | OK |

清理后重新构建：**34 个页面**（8 个版块 × 4 语言 + 404 + 根重定向），所有空集合显示空状态。

## 4. 关键实现决定

1. **三视图用 CSS 属性切换**：`data-view="list|grid|magazine"` 落在容器上，脚本只改属性并写 `localStorage: blog:view`；无 JS 时隐藏切换器（避免点了没反应），默认列表视图。
2. **双向链接用相对链接**：`[[目标]]` → `../<目标>/`。文章页在 `.../{locale}/knowledge/{slug}/`，兄弟目录天然带上了 base 与语言前缀，插件完全不需要知道站点根路径。
3. **要装 `@astrojs/markdown-remark`**：Astro 7 默认 Sätteri 处理器，`remarkPlugins` 会直接报错。按 [ADR-0009](../../docs/decisions/0009-markdown-pipeline-and-wiki-links.md) 引入并登记依赖。
4. **列表页用同一个 `Archive` 组件**：Blog 列表、分页、分类、标签四种场景共用，避免四份几乎相同的模板。
5. **分类/标签 URL 段归一**：`taxonomySlug()`（NFKC、小写、空格转连字符），中文标签也能直接作为路径段。

## 5. 遗留

- **灯箱**未实现（Phase 7）：图集目前点击打开原图新标签页；Phase 7 接入键盘可用的灯箱。
- **高清摄影图存放**未定（TD-12）：`gallery` 的 `images[].src` 用 `image()`，只接受本地图片；外置存储需要先改 schema。
- **动态短视频**：schema 支持 `video` 类型，但体积/转码策略未定（[媒体存储](../../docs/integrations/media-storage.md)）。
- **知识目录是「按 section 分组」，不是多级树**：真正的层级路径（`/knowledge/a/b/c/`）待需求确认后再做（TD-16 相关）。
- **Guestbook 只有页面壳**：评论挂载在 Phase 8。
- **项目截图**需要真实图片资源才能展示，当前为空态。

## 6. 下一阶段

Phase 6（搜索与阅读功能）：构建后搜索索引 + 搜索浮层、TOC、阅读进度、社交分享，并把 `Proposed` 的性能预算按实测校准。
