# ADR-0005：评论使用 Waline 独立服务

> **用途**：说明为什么评论必须外置、为什么选 Waline、以及尚未确定的边界。任何改动评论方案或路径规则的提议先读本文。
> **状态**：Confirmed（用户已指定 Waline）+ Needs Validation（服务端与数据库选型）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [Waline 集成](../integrations/waline.md) · [ADR-0007](./0007-static-dynamic-service-boundary.md) · [Waline 参考](../references/waline.md)

## 背景

评论需要写入并跨用户持久化，而 GitHub Pages 只提供静态文件，**无法运行任何后端**。因此评论能力必须由一个独立的、可免费运行的服务承担。

## 决策

1. 评论系统使用 **Waline**，作为**外部独立服务**部署（不在 Pages 仓库内运行）。
2. 前端只挂载 Waline 客户端，通过 `serverURL` 连接；站点本身不存储任何评论数据。
3. Guestbook 使用**独立固定的 `path`**，与文章评论区隔离。
4. 文章的评论 `path` 与文章规范 URL 强绑定，URL 一旦上线不得随意变更。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| Giscus（基于 GitHub Discussions） | 需要访客登录 GitHub，对普通读者门槛过高 |
| Disqus | 加载重、隐私争议、广告倾向 |
| 自建评论后端（VPS） | 违背零运维定位 |
| 第三方托管评论 SaaS | 多为付费，或免费额度与隐私不明确 |

## 选择原因

- **可自托管且免费**：官方提供多种部署方式（`vercel`/`netlify`/`railway`/`zeabur`/`tidb`/`aliyun-computenest`/`vps`）与多种数据库（MySQL/PostgreSQL/SQLite/MongoDB/TiDB），可按免费额度选型（官方文档核验，2026-11-26）。
- **客户端能力贴合需求**：自带 `pageview`（浏览量）与 `reaction`（表情反应），可复用同一服务减少第三方依赖。
- **多语言**：`lang` 支持 `zh-CN`/`zh-TW`/`en`/`jp`，与本站四语言一致（**注意日语是 `jp` 不是 `ja`**）。
- **深色适配**：`dark` 选项可接受 CSS 选择器，能与本站 `html[data-theme]` 对接。

## 影响

- **多一个需要维护的服务**：域名/服务若停用，评论区失效。必须做降级：不可用时显示说明文案，页面其余部分正常。
- **数据归属与隐私**：评论数据存在第三方数据库，访客的昵称/邮箱/IP 会被存储 → 需在 [隐私规范](../security/privacy.md) 说明。
- **路径契约**：`path` 变更 = 评论"丢失"（数据仍在，但指向新 key）。因此仓库名、`base`、语言前缀策略未定案前**不上线评论**。
- **服务端选型未定**：候选与验证清单见 [Waline 集成](../integrations/waline.md#服务端选型候选)。未完成验证前不得把任一数据库写进部署文档当成定论。
- **密钥**：服务端环境变量（数据库凭据、`JWT_TOKEN` 等）只存在于服务端配置，绝不入库。
