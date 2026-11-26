# 数据模型

> **用途**：frontmatter 字段的唯一权威定义。改 schema、加字段、写内容前必读；与 `src/content.config.ts` 必须逐字一致。
> **状态**：Proposed（字段集为 Agent 提议，实现阶段可调整；一经验证并写入 schema 即转 Confirmed）
> **更新**：2026-11-26
> **相关**：[内容架构](./content-architecture.md) · [功能规格](../product/feature-specifications.md) · [路由与 i18n](./routing-and-i18n.md) · [内容集合官方参考](../references/astro.md)

## 1. 设计约束

1. **最小字段集**：能由正文或日期推导的，不设为字段（阅读时间、字数、slug、语言都不写进 frontmatter）。
2. **不在内容里存统计值**：浏览量、点赞数、评论数一律不存在于 frontmatter；它们是运行时/外部服务数据（[ADR-0007](../decisions/0007-static-dynamic-service-boundary.md)）。
3. **字段名用 camelCase**，与 TypeScript 一致；schema 中未声明的字段视为错误（`.strict()`，Proposed）。
4. **必填字段缺失 = 构建失败**，优于运行时 undefined。

## 2. 公共字段（五个集合共用）

| 字段 | 类型 | 必填 | 说明 | 状态 |
| --- | --- | --- | --- | --- |
| `title` | `string` | ✅ | 标题，用于 `<h1>`、`<title>`、列表 | Proposed |
| `description` | `string` | ✅ | 摘要，用于 meta description 与列表摘要；**不得留空** | Proposed |
| `date` | `date` | ✅ | 首次发布日期（ISO `YYYY-MM-DD`），排序与热力图依据 | Proposed |
| `updated` | `date` | ❌ | 最后修改日期，缺省等于 `date`；存在时页面显示"更新于" | Proposed |
| `category` | `string` | ✅ | 分类（自由分类，初始建议值 Tech/Life/Knowledge/Thought） | Proposed |
| `tags` | `string[]` | ❌ | 标签，默认空数组；需经标签词表归一 | Proposed |
| `cover` | `image` | ❌ | 封面；缺省时列表使用文字版式而非裂图 | Proposed |
| `draft` | `boolean` | ❌ | 默认 `false`；`true` 时构建排除 | Proposed |
| `featured` | `boolean` | ❌ | 默认 `false`；首页/杂志视图优先展示 | Proposed |
| `translationKey` | `string` | ❌ | 同一内容的多语言版本共享同一个 key；无 key 视为独立内容 | Proposed |

语言**不是字段**：由内容所在目录（`zh-CN/`、`en/`…）决定，见 [内容架构](./content-architecture.md)。

## 3. `blog` 专属

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `series` | `string` | ❌ | 系列名，用于把多篇文章串成一组 |
| `toc` | `boolean` | ❌ | 默认 `true`；短文章可关 |

正文能力（由渲染器提供，不是字段）：代码高亮、数学公式、图片、表格、脚注。

## 4. `knowledge` 专属

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `section` | `string` | ❌ | 所属层级目录段；缺省时按路径推导 |
| `order` | `number` | ❌ | 同级排序，小者在前；缺省按 `date` 倒序 |
| `aliases` | `string[]` | ❌ | 别名，供 `[[链接]]` 解析与搜索命中（高级标签/词条归一的基础） |
| `related` | `string[]` | ❌ | 人工指定的关联条目 id |

双向链接的书写语法待定（`Needs Validation`），但**反向链接由构建期索引生成，不是字段**。

## 5. `projects` 专属

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `stack` | `string[]` | ✅ | 技术栈标签（用于聚合与展示） |
| `repo` | `url` | ❌ | 代码仓库地址；外链须带安全属性 |
| `demo` | `url` | ❌ | 在线演示地址 |
| `status` | `enum` | ❌ | `active` / `archived` / `wip`，缺省 `active` |
| `screenshots` | `image[]` | ❌ | 截图；与正文图片二选一，避免重复 |
| `startDate` / `endDate` | `date` | ❌ | 项目周期，仅用于展示 |

正文承载：项目介绍、架构说明、开发过程。

## 6. `moments` 专属

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `media` | `object[]` | ❌ | 媒体数组，元素 `{ type: 'image' \| 'video', src, alt?, poster? }` |
| `location` | `string` | ❌ | 地点（**不得精确到住址**，见 [隐私规范](../security/privacy.md)） |

无 `media` 时即为纯文字动态；`id` 即详情页短链标识。

## 7. `gallery` 专属

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `images` | `object[]` | ✅ | `{ src, alt, caption?, meta? }`；`alt` 必填（无障碍） |
| `camera` / `lens` | `string` | ❌ | 拍摄器材 |
| `location` | `string` | ❌ | 拍摄地点，粒度由作者决定 |
| `shotAt` | `date` | ❌ | 拍摄时间（可与发布日期不同） |

EXIF 中的 GPS 信息**不得随图片入库**，见隐私规范。

## 8. 与派生数据的边界

| 数据 | 是否字段 | 来源 |
| --- | --- | --- |
| slug / URL | ❌ | 文件名 + 语言目录 |
| 阅读时间 / 字数 | ❌ | 正文统计 |
| 分类与标签计数 | ❌ | 聚合 |
| 反向链接 | ❌ | 构建期索引 |
| 浏览量 / 点赞数 | ❌ | 外部服务（条件性功能） |
| 评论数 | ❌ | Waline |

## 9. 变更流程

字段增删改必须同批完成：本文 → `src/content.config.ts` 的 zod schema → 受影响内容 → [内容架构](./content-architecture.md) 的派生数据说明 → 本表状态更新。任何一步缺失都视为文档与实现不一致。
