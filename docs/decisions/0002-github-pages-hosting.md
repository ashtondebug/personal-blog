# ADR-0002：用 GitHub Pages 托管静态站

> **用途**：说明托管平台选择与它的硬约束。任何"换托管/加服务端"的提议先读本文。
> **状态**：Confirmed（用户已指定 GitHub Pages）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [部署架构](../architecture/deployment-architecture.md) · [ADR-0007](./0007-static-dynamic-service-boundary.md) · [GitHub Pages 参考](../references/github-pages-and-actions.md)

## 背景

站点是纯静态产物，访问量属于个人博客量级，预算敏感，且希望零运维。域名策略为"先默认域名、未来再挂自定义域名"。

## 决策

使用 **GitHub Pages** 托管，源码与发布同一仓库，通过 GitHub Actions 构建并发布。第一阶段使用默认域名 `https://<user>.github.io/<repo>/`，未来切换自定义域名。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| Vercel / Netlify 免费版 | 可用且体验更好，但引入第二套账号与配额体系；需求已明确 Pages |
| Cloudflare Pages | 同上；且与评论服务（可能也用 Cloudflare）耦合度需再评估 |
| 自建 VPS | 有运维成本与费用，违背"零运维" |
| 对象存储 + CDN | 同样可行，但配置面更大 |

## 选择原因

1. **零成本、零运维**：公开仓库在 GitHub Free 下即可发布（官方核验 2026-11-26）。
2. **与仓库同源**：代码、内容、发布在同一处，符合"仓库即事实来源"。
3. **HTTPS 默认可用**：`*.github.io` 自带 HTTPS，满足 PWA 的安全上下文要求。
4. **Actions 集成直接**：官方 Astro 部署路径（`withastro/action`）配置面很小。

## 影响（约束清单）

- **无服务端**：不能运行评论后端、统计后端、任何数据库逻辑 → 必须外置（[ADR-0007](./0007-static-dynamic-service-boundary.md)）。
- **体积**：源仓库建议 ≤1 GB、发布站点 ≤1 GB；音乐与高清图受此约束（[媒体存储](../integrations/media-storage.md)）。
- **带宽**：软限制 100 GB/月，大媒体被频繁加载会逼近上限。
- **部署**：10 分钟超时；构建不能过重。
- **构建频率**：软限制 10 次/小时，但使用自定义 Actions 工作流时不受该限（本项目走 Actions）。
- **路径**：项目页发布在子路径下，必须配置 `base` 且所有内链带前缀（[部署架构](../architecture/deployment-architecture.md)）。
- **仓库可见性**：免费计划下需公开仓库才能用 Pages；若必须私有，需 Pro/Team 计划 → **`Needs Validation`**（账号计划未知）。
- **自定义域名迁移**：改 `site`、删除 `base`、加 `public/CNAME`，并处理旧链接（一次性迁移，需在技术债中登记）。
