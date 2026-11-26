# 内容架构

> **用途**：定义内容集合的划分、目录布局、构建期索引与聚合的生成方式。新增内容类型、改内容目录、做列表/聚合页前必读。
> **状态**：Confirmed（Markdown + Content Collections）+ Proposed（集合划分与目录布局）
> **更新**：2026-11-26
> **相关**：[数据模型](./data-models.md) · [路由与 i18n](./routing-and-i18n.md) · [功能规格](../product/feature-specifications.md) · [ADR-0003](../decisions/0003-markdown-content-and-github-actions.md) · [媒体存储](../integrations/media-storage.md)

## 1. 内容集合划分

| 集合 | 承载 | 对应页面 | 语言化 |
| --- | --- | --- | --- |
| `blog` | 正式文章 | Blog | 是 |
| `knowledge` | 知识条目（可层级、可互链） | Knowledge | 是 |
| `projects` | 项目详情 | Projects 详情 | 是 |
| `moments` | 短动态（文字/图片/视频） | Moments | 是 |
| `gallery` | 摄影作品/图集 | Gallery | 是 |

不使用集合承载的静态内容：About 页（单文件，四语言各一份）、Guestbook 页（纯页面 + Waline）。Home 页内容来自页面文件 + 各集合的少量聚合查询。

## 2. 目录布局

内容按**语言分目录**，与"一篇文章只属于一种语言"的要求一致：

```text
src/content/
├── blog/
│   ├── zh-CN/2026-11-hello-world.md
│   ├── en/2026-11-hello-world.md
│   └── ...
├── knowledge/{zh-CN,zh-TW,en,ja}/...
├── projects/{zh-CN,...}/...
├── moments/{zh-CN,...}/...
└── gallery/{zh-CN,...}/...
```

- 集合定义在 `src/content.config.ts`（官方约定路径，2026-11-26 核验）。
- 加载器使用 `glob({ pattern, base })`（来自 `astro/loaders`）；`base` 指向集合目录，`pattern` 匹配 `**/*.md`。
- 语言由**所在目录**决定，不在 frontmatter 里重复声明 `lang`（避免两处真相不一致）；若需要显式校验，schema 通过目录无法感知，改为在聚合函数中由 `id` 前缀推导（`zh-CN/2026-11-hello-world` → 语言段 + slug）。

## 3. 构建期派生数据（不手工维护）

以下都由构建期从内容集合计算，**禁止在仓库里维护重复的 JSON/YAML 索引**：

| 派生数据 | 来源 | 用途 |
| --- | --- | --- |
| 分类列表与计数 | `data.category` | 分类聚合页、导航 |
| 标签列表、计数、别名归一 | `data.tags` + 标签词表 | 标签聚合页、关联推荐 |
| 年份/日期分布 | `data.date` | 热力图、时间轴、归档 |
| 反向链接索引 | `knowledge` 正文中的链接 | 双向链接、"被引用"面板 |
| 阅读时间 | 正文长度 | 列表与详情页展示 |
| 关联推荐 | 分类 + 标签交集 | 详情页底部 |
| 可用语言列表 | `translationKey` 分组 | 语言切换器 |
| 搜索索引 | 全部内容（构建产物之后生成） | 全站搜索 |

派生数据必须是**纯函数**（输入内容 → 输出索引），便于在构建日志中定位"某个页面为什么出现/消失"。

## 4. 草稿与发布

- `draft: true` 的内容：构建时排除，不生成页面、不进索引、不进聚合。
- 未来日期（`date` 晚于构建日期）：是否排除 `Needs Validation`（倾向排除，由用户确认）。
- 已删除内容的处理：直接删文件；**不保留"已下线"占位**，历史 URL 若需保留走重定向清单（Proposed）。

## 5. 层级与排序

- `knowledge` 支持层级：用 `section`（或路径段）表达，层级深度上限 `Needs Validation`（倾向 ≤3 级）。
- 显式排序：`order` 字段（数字，小者在前），缺省按 `date` 倒序。混用两种排序时必须有确定的兜底规则，禁止"看运气"。
- `moments` 固定时间倒序；`gallery` 默认按 `date` 倒序，可被人工 `order` 覆盖。

## 6. 内容与媒体的关系

- 小图（≤300 KB）与图标可入库；高清摄影原图倾向外置存储（[媒体存储](../integrations/media-storage.md)）。
- 封面与图集图片在 frontmatter 中以**路径或 URL** 引用，构建期统一解析为可优化的资源；外链图片不得被静默抓取到仓库。
- 音乐文件为本地静态资源（需求确认），放在 `public/` 下的固定子目录，体积预算见媒体存储文档。

## 7. 一致性规则

1. 新增一个内容类型 = 新增一个集合 + 一条路由展开 + 一份列表组件，三者必须同批提交。
2. 任何 frontmatter 字段变更，先改 [数据模型](./data-models.md) 与 `src/content.config.ts`，再改内容；不允许"先写内容后补 schema"。
3. 内容的 `translationKey` 相同才被视为同一篇的不同语言版本；没有 `translationKey` 的内容视为独立内容，不产生任何跨语言链接。
4. 悬空双向链接（指向不存在的 `knowledge` 条目）必须在构建期报错，不得静默降级为纯文本。
