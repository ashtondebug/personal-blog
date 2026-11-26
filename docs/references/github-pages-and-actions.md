# GitHub Pages 与 Actions 参考资料

> **用途**：平台侧的事实依据：限制、计划要求、官方部署 Action 版本、工作流权限。改部署前核对这里。
> **状态**：✅ 已核验（2026-11-26）
> **更新**：2026-11-26
> **相关**：[资料索引](./index.md) · [部署架构](../architecture/deployment-architecture.md) · [ADR-0002](../decisions/0002-github-pages-hosting.md) · [构建与部署](../engineering/build-and-deployment.md)

## 1. 官方链接

| 主题 | 链接 |
| --- | --- |
| Pages 限制 | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits |
| Pages 使用 HTTPS | https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https |
| 配置发布源 | https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site |
| 自定义 404 | https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site |
| 自定义域名 | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site |
| Actions 文档 | https://docs.github.com/en/actions |
| Astro 官方部署指南 | https://docs.astro.build/en/guides/deploy/github/ |

## 2. 计划与可用性

| 结论 | 来源 | 核验日期 | 置信度 |
| --- | --- | --- | --- |
| 公开仓库在 GitHub Free / Free for organizations 下可用 Pages | Pages 限制页 | 2026-11-26 | ✅ 高 |
| 私有仓库发布 Pages 需要 Pro / Team / Enterprise Cloud / Enterprise Server | 同上 | 2026-11-26 | ✅ 高 |
| 每个账号只能创建一个 user/org site | 同上 | 2026-11-26 | ✅ 高 |
| 本站账号当前计划：**未知**（需用户确认） | — | 2026-11-26 | ○ 待核实 |

## 3. 用量限制

| 结论 | 核验日期 | 置信度 |
| --- | --- | --- |
| 源仓库建议上限 1 GB | 2026-11-26 | ✅ |
| 发布站点不得大于 1 GB | 2026-11-26 | ✅ |
| 部署超过 10 分钟视为超时 | 2026-11-26 | ✅ |
| 带宽软限制 100 GB/月 | 2026-11-26 | ✅ |
| 构建软限制 10 次/小时；**使用自定义 GitHub Actions 工作流构建时不适用** | 2026-11-26 | ✅ |
| 触发限流时返回 HTTP 429 | 2026-11-26 | ✅ |
| Pages 不用于商业交易型站点、不用于敏感交易 | 2026-11-26 | ✅ |

## 4. 官方部署形态（来自 Astro 部署指南）

| 项 | 值 | 置信度 |
| --- | --- | --- |
| 工作流文件 | `.github/workflows/deploy.yml` | ✅ |
| 触发 | `push: branches: [main]` + `workflow_dispatch` | ✅ |
| 权限 | `contents: read`、`pages: write`、`id-token: write` | ✅ |
| checkout | `actions/checkout@v7` | ✅ |
| 构建 | `withastro/action@v6`（可选 `path`/`node-version`（默认 24）/`package-manager`/`build-cmd`/`env`） | ✅ |
| 发布 | `actions/deploy-pages@v5`，job 需 `environment: name: github-pages` | ✅ |
| Pages 源 | Settings → Pages → Source = **GitHub Actions** | ✅ |
| `site` 取值 | `https://<username>.github.io` 或组织私有页的随机域名 | ✅ |
| 项目页路径 | `https://<username>.github.io/<repo>/` → 需 `base: '/<repo>'` | ✅ |
| `base` 的副作用 | **所有站内链接必须带 `base` 前缀** | ✅ |
| 自定义域名 | `public/CNAME` + 修改 `site` + **删除 `base`** + 去掉链接前缀 | ✅ |
| lockfile | 官方 Action 依靠 lockfile 探测包管理器，必须入库 | ✅ |

## 5. 易变项（需定期复核）

- 三个 Action 的**主版本号**（历史上升级过多次，`v6`/`v7` 只是当前值）。
- `withastro/action` 的默认 `node-version`。
- Pages 的免费额度与计划边界。
- 自定义域名证书签发时长与 DNS 校验要求。

## 6. 本项目尚未验证的平台能力

| 能力 | 状态 |
| --- | --- |
| 自定义 HTTP 响应头（CSP 等） | ○ 待复核 —— 影响 [安全基线](../security/security-baseline.md) 的 CSP 部分 |
| 单文件大小上限与警告阈值 | ○ 待复核 —— 影响 [媒体存储](../integrations/media-storage.md) |
| 项目页与用户页混用时的路径行为 | ○ 待复核 |
