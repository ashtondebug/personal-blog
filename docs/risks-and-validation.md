# 风险与待验证事项清单

> **用途**：所有"还没定"和"可能出问题"的集中登记处。开工前先扫一遍，避免在未定事项上做不可逆实现。
> **状态**：Mixed（逐条标注 Confirmed 影响面 / Proposed / Needs Validation）
> **更新**：2026-11-26
> **相关**：[文档地图](./PROJECT_MAP.md) · [需求清单](./product/requirements.md) · [技术债](../plans/tech-debt.md) · [路线图](../plans/active/000-initial-implementation-roadmap.md)

## 0. 怎么用

- **开工前**：查本表是否有阻塞当前任务的事项。
- **定案后**：更新本表状态，并同步改相关文档（需求/架构/ADR）。
- **发现新风险**：追加一行，写清影响面与验证方式；不要只在聊天里说。

优先级：**P0 = 阻塞不可逆决策**（做错要迁移数据或改全部 URL）；**P1 = 阻塞某阶段**；**P2 = 可在实现中顺手解决**。

## 1. P0：必须在动工前定案

| ID | 事项 | 影响面 | 验证/决策方式 | 状态 |
| --- | --- | --- | --- | --- |
| R-01 | 站点名称未定（空间概念方向） | `site`、标题、OG、PWA `name`、logo、仓库名 | 用户决策；代码中走配置项 | Needs Validation |
| R-02 | 仓库名与 `base`：已定 `ashtondebug/personal-blog` → `base = '/personal-blog'` | 全站内链、资源路径、Waline `path`、搜索索引、PWA `start_url` | 已定案（2026-11-26）；日后改名会破坏评论 path 与分享链接 | Confirmed |
| R-03 | 默认语言是否带 URL 前缀：**已定全部带前缀** `/{locale}/...` | 全站 URL、评论 key、canonical、`hreflang` | 已定案（2026-11-26，[ADR-0008](./decisions/0008-url-strategy.md)） | Confirmed |
| R-04 | 仓库可见性：已选 **Public** | Pages 可用性（公开仓库在 Free 计划下可发布） | 已定案（2026-11-26）；改私有需 Pro/Team | Confirmed |
| R-05 | 尾斜杠与 `build.format`：**已定 `always` + `directory`** | 所有内链与评论 key 的一致性 | 已定案（2026-11-26，[ADR-0008](./decisions/0008-url-strategy.md)） | Confirmed |

## 2. P1：阻塞具体阶段

| ID | 事项 | 影响面 | 验证方式 | 状态 |
| --- | --- | --- | --- | --- |
| R-06 | Waline 服务端 + 数据库选型 | 评论可用性、免费额度、境内访问速度 | 按 [验证清单](./integrations/waline.md) 逐项取证 | Needs Validation |
| R-07 | 浏览量方案 | 是否展示浏览数（无条件则不展示） | [分析](./integrations/analytics.md) 门槛 | Needs Validation |
| R-08 | 点赞与 Waline `reaction` 是否等价 | 点赞是否启用或彻底弃用 | 用户确认 | Needs Validation |
| R-09 | 搜索实现（Pagefind 1.6.0 一等候选） | 搜索可用性、体积、构建顺序 | 原型验证 + 体积实测 | Needs Validation |
| R-10 | 中文字体策略（系统栈 / 子集化） | 首屏性能、视觉统一度 | 子集化体积实测 + 观感对比 | Needs Validation |
| R-11 | 高清图外置存储方案 | Gallery 可用性、成本、稳定性 | 候选对比（[媒体存储](./integrations/media-storage.md)） | Needs Validation |
| R-12 | 音乐体积 vs Pages 限制 | 播放器能否实现、是否压缩 | 体积预算实测 | Needs Validation |

## 3. P2：实现期需注意的技术风险

| ID | 事项 | 风险描述 | 缓解 |
| --- | --- | --- | --- |
| R-13 | `base` 前缀遗漏 | 配置 `base` 后任何手写绝对路径都会 404 | 统一走工具函数；发布后冒烟 |
| R-14 | 评论 `path` 漂移 | 改 URL 导致评论"消失" | URL 上线即冻结；变更需迁移方案 |
| R-15 | PWA 缓存旧内容 | 用户长期看到旧页面 | 网络优先 HTML + 版本化缓存名 |
| R-16 | 双向链接悬空 | 指向不存在条目产生死链 | 构建期报错 |
| R-17 | `translationKey` 写错 | 语言切换指向错误页面 | 构建期一致性校验（同组语言不重复） |
| R-18 | schema 与文档不一致 | 字段漂移，内容构建失败 | 改字段必须同批改 [数据模型](./architecture/data-models.md) |
| R-19 | 对比度不达标 | 无障碍缺陷 | 两套主题实测（[配色 §6](./design/color-and-theme.md)） |
| R-20 | 图片 EXIF 泄漏位置 | 隐私风险 | 入库前剥离（[隐私](./security/privacy.md)） |
| R-21 | 构建超时（>10 分钟） | 发布失败 | 监控构建耗时；媒体外置 |
| R-22 | 第三方脚本体积/可用性 | 首屏变慢或页面报错 | 按需加载 + 降级（[集成门槛](./integrations/index.md)） |

## 4. 已被推翻或不再考虑的方向

| 方向 | 结论 |
| --- | --- |
| 自动机器翻译补全语言 | 用户明确禁止（[ADR-0004](./decisions/0004-per-language-articles.md)） |
| SSR / 服务端渲染 | 与 GitHub Pages 冲突（[ADR-0007](./decisions/0007-static-dynamic-service-boundary.md)） |
| 引入 React/Vue | 默认禁止（[ADR-0006](./decisions/0006-no-default-ui-framework.md)） |
| 伪造浏览量/点赞占位 | 用户明确禁止（[需求 §6](./product/requirements.md)） |

## 5. 验证证据要求

标 `Needs Validation` 的项闭环时，必须留下：**官方来源 URL + 核验日期 + 结论**，写在对应文档（[参考资料](./references/index.md)）里。仅口头说"试过了"不算闭环。
