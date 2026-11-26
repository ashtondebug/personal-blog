# 004 · 内容模型与 Markdown 管理（Phase 4）

> **用途**：记录内容集合、派生数据与构建期门禁的实现与实测证据。写内容或改 schema 前先读本文与 [数据模型](../../docs/architecture/data-models.md)。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [数据模型](../../docs/architecture/data-models.md) · [内容架构](../../docs/architecture/content-architecture.md) · [ADR-0003](../../docs/decisions/0003-markdown-content-and-github-actions.md)

## 1. 目标

把 [数据模型](../../docs/architecture/data-models.md) 从文档变成可运行的内容管线：五个集合的 zod schema、语言目录约定、派生数据（排序/阅读时长/标签/多语言版本/双向链接/年度活动），以及"内容有问题就让构建失败"的门禁。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `src/content.config.ts` | 五个集合（blog/knowledge/projects/moments/gallery）+ `glob()` 加载器 + zod schema；公共字段抽成 `commonFields()` |
| `src/lib/content.ts` | 纯函数派生：`entryLocale` / `entrySlug` / `published` / `sortByDateDesc` / `byLocale` / `readingMinutes` / `normalizeTag` / `buildTagIndex` / `buildTranslations` / `availableLocalesFor` / `wikiLinkTargets` / `assertKnowledgeLinks` / `buildBacklinks` / `yearlyActivity` |
| `src/lib/content-integrity.ts` | `assertContentIntegrity()`：构建期门禁（语言目录、translationKey 重复、知识链接），在 `BaseLayout` 调用一次 |
| `src/lib/format.ts` | 按语言格式化日期（UTC 时区）+ ISO 日期 |
| `src/styles/prose.css` | 正文排版（标题、列表、引用、代码、表格、图片），只作用于 `.prose` |
| `src/pages/[locale]/blog/index.astro` | 文章列表：按语言过滤、草稿排除、日期倒序、阅读时长、空状态 |
| `src/pages/[locale]/blog/[slug].astro` | 文章详情：`render(entry)` 渲染 Markdown、日期与阅读时长、多语言切换 |
| `src/content/*/.gitkeep` | 五个集合目录入库（语言子目录在添加内容时创建） |
| 词典 | 新增 blog 相关文案（列表标题、空状态、阅读时长、更新时间、返回列表），四语言齐备 |

> 说明：Phase 4 的验收需要一个"能看见内容"的载体，因此做了最小可用的 Blog 列表与详情页。三视图切换、TOC、分页、分类/标签聚合页仍属 Phase 5。

## 3. 正向验收（临时内容实测后已删除）

用两篇文章 + 两个知识条目做了实测（含同一 `translationKey` 的 zh-CN / en 版本、一篇 `draft: true`），结果：

| 检查 | 结果 |
| --- | --- |
| 新增 Markdown 后列表自动出现 | OK |
| 阅读时长显示（`约 N 分钟`） | OK |
| 草稿不出现在列表 | OK |
| 草稿不生成详情页 | OK |
| 详情页渲染正文（含 `##` 小节） | OK |
| 详情页 canonical 保留大写语言段 `/zh-CN/blog/...` | OK |
| 详情页 `hreflang="en"` 指向 en 版本同文章 | OK |
| 无翻译语言（zh-TW）不生成可点击链接 | OK |
| en 详情页为英文正文 | OK |
| 另一语言列表显示空状态 | OK |
| 知识条目双向链接校验通过 | OK |

## 4. 负向验收（四类内容问题都被拦下）

| 场景 | 构建结果 |
| --- | --- |
| 非法语言目录（`blog/fr/...`） | 失败：`内容 id "fr/neg-locale" 缺少合法语言目录（允许：zh-CN / zh-TW / en / ja）` |
| 悬空的内部链接（`[[note-x]]`） | 失败：`知识条目的内部链接无法解析：zh-cn/note-a → [[note-x]]（语言 zh-CN 下不存在该条目）` |
| `translationKey` 同语言重复 | 失败：`translationKey "tmp-hello" 在语言 zh-CN 下重复` |
| 缺必填字段（删掉 `description`） | 失败：`[InvalidContentEntryDataError] blog → zh-cn/tmp-hello data does not match collection schema. description: Required` |

测试内容已全部删除，仓库保持"零文章"的干净状态（列表页显示空状态）。

## 5. 关键发现

**`glob()` 加载器会整体 slug 化条目 id**：`src/content/blog/zh-CN/tmp-hello.md` 的 id 是 `zh-cn/tmp-hello`（语言段变小写）。第一版按大小写严格匹配目录，导致所有内容被判为"非法语言目录"。修复：`entryLocale()` 做大小写无关映射。已记入 [Astro 参考](../../docs/references/astro.md) 与 [内容架构](../../docs/architecture/content-architecture.md)。

**内容页的语言切换不能只靠一个 path**：不同语言的同一篇文章可以有不同 slug，因此 `BaseLayout` 增加 `alternatePaths`（语言 → 真实路径），Blog 详情页按 `translationKey` 分组生成；`hreflang` 与切换器都用它。

## 6. 遗留

- **MDX 未接入**：当前只支持 `.md`。需要文章里用组件时再引入 `@astrojs/mdx`（按 [依赖策略](../../docs/engineering/dependency-policy.md) 登记）。
- **数学公式未接入**：需要一个 Markdown 插件链（如 remark-math + rehype-katex），属 Phase 6 的"阅读功能"。代码高亮由 Astro 内置（Shiki）提供，已可用。
- **知识/项目/动态/摄影集合没有页面**：schema 已就位，页面在 Phase 5；当前内容完整性门禁已在每次构建运行。
- **未启用 `.strict()`**：拼错字段名会被静默忽略，需要写内容后人工核对（已记录在数据模型文档）。
- **空集合会打印 glob-loader 警告**：属正常现象，不是错误。

## 7. 下一阶段

Phase 5（八大页面）：Projects 详情、Knowledge 目录与条目（含反向链接面板）、Gallery 灯箱、Moments 流、Guestbook 壳、Home 聚合，以及 Blog 的三视图与分页。
