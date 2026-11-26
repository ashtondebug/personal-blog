# 集成索引

> **用途**：所有"本站依赖的外部服务与跨模块集成"的唯一入口。新增第三方服务前必读。
> **状态**：Confirmed（Waline、PWA、搜索、媒体策略方向）+ Needs Validation（具体选型）
> **更新**：2026-11-26
> **相关**：[系统总览](../architecture/system-overview.md) · [ADR-0007](../decisions/0007-static-dynamic-service-boundary.md) · [Waline](./waline.md) · [分析与统计](./analytics.md) · [PWA](./pwa.md) · [搜索](./search.md) · [媒体存储](./media-storage.md)

## 1. 子文档

| 文档 | 覆盖 | 状态 |
| --- | --- | --- |
| [Waline](./waline.md) | 评论与留言板：路径契约、多语言、服务端选型 | Confirmed + Needs Validation |
| [分析与统计](./analytics.md) | 浏览量（条件性）、点赞（默认弃用） | Needs Validation |
| [PWA](./pwa.md) | Manifest、Service Worker、缓存与更新 | Proposed + Needs Validation |
| [搜索](./search.md) | 构建期索引 + 浏览器查询 | Proposed + Needs Validation |
| [媒体存储](./media-storage.md) | 图片、音乐、视频的体积与存放策略 | Proposed + Needs Validation |

## 2. 统一门槛（任何外部服务都要过）

1. **免费可长期使用**：额度、是否需要信用卡、是否会被停服，必须写清并留证据。
2. **隐私友好**：不跨站追踪，不引入指纹脚本；数据可导出。
3. **可降级**：服务不可用时页面仍可读，相关区块显示说明而不是空白或报错弹窗。
4. **不增加客户端体积负担**：单个第三方脚本 gzip ≤ 50 KB，且按需加载。
5. **密钥只在服务端**：前端不出现任何密钥、令牌、数据库凭据。
6. **有退出路径**：能说明"如果要换掉它，需要改哪些文件、会不会丢数据"。

## 3. 三类外部能力的边界

| 能力 | 归属 | 原因 |
| --- | --- | --- |
| 评论 / 留言 | Waline（外部） | 需要写入与持久化 |
| 浏览量 | 候选：Waline pageview（外部） | 需要服务端计数；无条件则不展示 |
| 搜索 | 本站（构建期 + 浏览器） | 纯静态可完成，不需要外部 |
| 主题/视图/播放状态 | 本站（localStorage） | 仅本机状态 |

判断依据见 [ADR-0007](../decisions/0007-static-dynamic-service-boundary.md)。

## 4. 变更要求

新增或替换任一集成，必须同批更新：本文 → 对应子文档 → [风险清单](../risks-and-validation.md) → 必要时新增 ADR → [技术债](../../plans/tech-debt.md)。
