# 技术债台账

> **用途**：所有"知道但还没处理"的问题。不写在这里的问题等于不存在。
> **状态**：Confirmed（台账规则）+ 各条状态见表格
> **更新**：2026-11-26
> **相关**：[计划索引](./index.md) · [风险与待验证](../docs/risks-and-validation.md) · [路线图](./active/000-initial-implementation-roadmap.md) · [需求清单](../docs/product/requirements.md)

## 1. 类型约定

| 类型 | 含义 |
| --- | --- |
| 债务 | 已知不足，需要后续补偿 |
| 风险 | 尚未发生但可能出问题 |
| 待验证 | 需要证据才能定案（与 `docs/risks-and-validation.md` 对应） |

## 2. 台账

| ID | 事项 | 类型 | 影响面 | 何时必须解决 | 状态 | 关联 |
| --- | --- | --- | --- | --- | --- | --- |
| TD-01 | 站点名已定 `The Commons`（`src/config/site.ts`） | 待验证 | `site`、标题、OG、PWA `name`、logo | — | Closed（2026-11-26） | [R-01](../docs/risks-and-validation.md) |
| TD-02 | 仓库名已定 `personal-blog`；`base` 尚未写入配置 | 债务 | 全站内链、评论 path、搜索索引、PWA `start_url` | Phase 1 创建配置时落地 | Open | [R-02](../docs/risks-and-validation.md) |
| TD-03 | 默认语言前缀已定（全部带前缀） | 待验证 | 全站 URL、评论 key | Phase 3 前 | Closed（2026-11-26，ADR-0008） | [R-03](../docs/risks-and-validation.md) |
| TD-04 | 仓库可见性已定为 Public（Pages 可用） | 风险 | Pages 是否可用 | Phase 1 | Closed（2026-11-26） | [R-04](../docs/risks-and-validation.md) |
| TD-05 | 尾斜杠策略已定（always + directory） | 待验证 | 内链一致性、评论 key | Phase 3 前 | Closed（2026-11-26，ADR-0008） | [R-05](../docs/risks-and-validation.md) |
| TD-06 | 浏览量方案未验证 | 待验证 | 是否展示浏览数 | Phase 6/8 | Open | [分析](../docs/integrations/analytics.md) |
| TD-07 | 点赞是否等同 Waline `reaction` 未确认 | 待验证 | 点赞实现或彻底弃用 | Phase 7 前 | Open | [R-08](../docs/risks-and-validation.md) |
| TD-08 | Waline 服务端与数据库未选型 | 待验证 | 评论可用性 | Phase 8 | Open | [Waline](../docs/integrations/waline.md) |
| TD-09 | 搜索实现未验证（Pagefind 候选） | 待验证 | 搜索可用性与体积 | Phase 6 | Open | [搜索](../docs/integrations/search.md) |
| TD-10 | 暂用系统字体栈；中文子集化方案仍未定 | 待验证 | 首屏性能、视觉统一 | 想统一各平台观感时 | Open（Phase 2 给了默认方案） | [排版](../docs/design/typography.md) |
| TD-11 | 音乐体积与 Pages 限制冲突 | 风险 | 播放器可行性 | Phase 7 | Open | [媒体存储](../docs/integrations/media-storage.md) |
| TD-12 | 高清摄影图外置存储未定 | 待验证 | Gallery 成本与稳定性 | Phase 5 | Open | [R-11](../docs/risks-and-validation.md) |
| TD-13 | PWA 缓存与内容更新冲突 | 风险 | 用户看到旧内容 | Phase 9 | Open | [PWA](../docs/integrations/pwa.md) |
| TD-14 | `base` 前缀一致性风险 | 风险 | 全站 404 | 持续 | Open | [部署架构](../docs/architecture/deployment-architecture.md) |
| TD-15 | 双向链接语法已定：`[[slug]]` / `[[slug\|别名]]`，同语言匹配 slug 或 aliases，悬空即构建失败 | 待验证 | Knowledge 互链、死链 | 已完成（2026-11-26） | Closed（Phase 4） | [内容架构](../docs/architecture/content-architecture.md) |
| TD-16 | "高级标签系统"语义未确认 | 待验证 | 标签模型与 UI | Phase 4 | Open | [需求 §3](../docs/product/requirements.md) |
| TD-17 | 对比度已实测（两套主题全部 ≥4.5:1），并由 CI 拦截 | 债务 | 可用性与合规 | — | Closed（2026-11-26） | [配色](../docs/design/color-and-theme.md) |
| TD-18 | 文档与实现同步尚无自动校验 | 债务 | 文档漂移 | Phase 12 前 | Open（当前仅链接检查） | [脚本](../scripts/check-docs.mjs) |
| TD-19 | 站内链接检查工具未建立 | 债务 | 发布后 404 | Phase 6 前 | Open | [测试策略](../docs/engineering/testing-strategy.md) |
| TD-20 | 评论数据备份/导出流程未建立 | 风险 | 数据丢失 | Phase 8 | Open | [Waline](../docs/integrations/waline.md) |
| TD-21 | 内容页的语言切换尚未生效（缺 `translationKey` 派生数据） | 待验证 | 多语言文章切换、hreflang 部分存在场景 | Phase 4 | Closed（2026-11-26，`alternatePaths` + `buildTranslations`） | [路由与 i18n](../docs/architecture/routing-and-i18n.md) |
| TD-22 | MDX 未接入（当前仅 `.md`） | 债务 | 文章内嵌组件的能力 | 需要组件化文章时（Phase 5/6） | Open | [内容架构](../docs/architecture/content-architecture.md) |
| TD-23 | 数学公式未接入（需 remark-math + rehype-katex） | 债务 | REQ-CONTENT-03 的公式部分 | Phase 6 | Open | [需求 §3](../docs/product/requirements.md) |
| TD-24 | 未启用 schema `.strict()`，拼错字段会被静默忽略 | 风险 | 内容质量 | 写正式内容前评估 | Open | [数据模型](../docs/architecture/data-models.md) |
| TD-25 | 知识目录仍是「按 section 分组」，未实现多级层级路径 `/knowledge/a/b/` | 债务 | REQ-CONTENT-05 的"层级目录" | 需要多级结构时（Phase 6/12 评估） | Open | [内容架构](../docs/architecture/content-architecture.md) |
| TD-26 | 图集外链/外置存储与 `image()` 只支持本地图片冲突 | 风险 | 高清摄影作品 | 上传真实作品前（Phase 7/12） | Open | [媒体存储](../docs/integrations/media-storage.md) |

## 3. 维护规则

- 新债必须写：**什么、影响什么、何时必须解决**（不要写"以后处理"）。
- 关闭时更新状态并注明解决方式（链接到提交或文档）。
- 每条债务都应能追溯到需求、风险或决策记录；无法追溯的条目视为噪音，应删除。
- 本文与 [风险与待验证](../docs/risks-and-validation.md) 不重复登记同一件事：风险清单负责"分类与优先级"，本台账负责"跟踪与关闭"。
