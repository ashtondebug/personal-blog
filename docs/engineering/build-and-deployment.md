# 构建与部署

> **用途**：构建与发布的执行手册：跑什么、顺序是什么、哪些设置必须一致、出错怎么查。
> **状态**：Confirmed（GitHub Actions + Pages）+ Proposed（工作流细节）
> **更新**：2026-11-26
> **相关**：[工程索引](./index.md) · [部署架构](../architecture/deployment-architecture.md) · [测试策略](./testing-strategy.md) · [ADR-0003](../decisions/0003-markdown-content-and-github-actions.md) · [GitHub Pages 参考](../references/github-pages-and-actions.md)

## 1. 官方事实（核验日期 2026-11-26）

来自 Astro 官方 GitHub Pages 部署指南：

| 项 | 值 |
| --- | --- |
| 工作流路径 | `.github/workflows/deploy.yml` |
| 触发 | `push` 到 `main` + `workflow_dispatch` |
| 权限 | `contents: read`、`pages: write`、`id-token: write` |
| checkout | `actions/checkout@v7` |
| 构建 | `withastro/action@v6`（可选 `path`/`node-version`（默认 24）/`package-manager`/`build-cmd`/`env`） |
| 发布 | `actions/deploy-pages@v5`，job 需 `environment: name: github-pages` |
| Pages 源 | 仓库 Settings → Pages → Source 选 **GitHub Actions** |

`site` 必须是 `https://<user>.github.io` 形式；项目页需 `base: '/<repo>'`，且**所有内链带前缀**。lockfile 必须入库（该 Action 依此探测包管理器）。

## 2. 构建顺序

1. `npm ci`（或等价，依 lockfile）
2. 内容 schema 校验（随 `astro build` 一并发生）
3. `astro build` → 产物目录
4. 搜索索引生成（**必须在 build 之后**）
5. 产物上传 → 发布

第 4 步的缺失会让搜索"构建成功但用不了"，因此发布后必须验证搜索（[测试策略 L4](./testing-strategy.md)）。

## 3. 工作流现状

- **已建立**：`.github/workflows/deploy.yml`（官方形态：`actions/checkout@v7` → `withastro/action@v6` → `actions/deploy-pages@v5`，权限 `contents: read` / `pages: write` / `id-token: write`）。首次部署前需在仓库 Settings → Pages 把 **Source 设为 GitHub Actions**。
- **已建立**：`.github/workflows/docs-check.yml` → `node scripts/check-docs.mjs`（推送与 PR 都跑）。
- **实测（2026-11-26）**：`npm run build` 生成 5 个页面（4 语言 + 根重定向），约 1 秒；`dist/` 目录结构与 `base` 一致。
- **受限环境注意**：Astro 会写用户目录遥测配置，沙箱内需 `ASTRO_TELEMETRY_DISABLED=1`；CI 无此问题。

最小骨架（供核对，实际文件已在仓库中）：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

## 4. 部署前检查清单

- [ ] `site` 与仓库名匹配；`base` 与项目页路径一致（或用户页则无 `base`）。
- [ ] 站内链接全部经基路径/i18n 工具生成。
- [ ] lockfile 已入库，Node 版本与 `engines` 兼容（Astro 要求 Node ≥ 22.23.4）。
- [ ] Pages Source = GitHub Actions。
- [ ] `.gitignore` 排除了构建产物与密钥；`FOR_AGENT.md` 未入库。
- [ ] 搜索索引在构建产物之后生成，且产物内含索引目录。
- [ ] 媒体体积在预算内（[媒体存储](../integrations/media-storage.md)）。
- [ ] 评论 `serverURL` 已配置且服务可用。

## 5. 本地与 CI 的分工

| 场景 | 本地 | CI |
| --- | --- | --- |
| 类型/构建 | 开发时频繁跑 | 每次推送跑 |
| 文档链接 | 提交前跑 `node scripts/check-docs.mjs` | 每次推送跑 |
| 发布 | 不本地发布 | 仅 `main` 分支 |

本地构建用于快速反馈；CI 是唯一发布途径，禁止手工上传产物。

## 6. 故障排查顺序

1. 构建失败 → 先看内容 schema 报错，再看 TS 类型。
2. 部署成功但页面 404 → 查 `base` 与内链前缀。
3. 页面样式丢失 → 查资源路径是否绕过基路径。
4. 搜索无结果 → 查索引是否生成、是否被发布、路径是否可访问。
5. 评论不显示 → 查 `serverURL`、CORS、服务状态、`path` 是否与历史一致。
6. 部署超时（>10 分钟）→ 查图片优化与媒体体积。
7. 页面是旧内容 → 查 Service Worker 与浏览器缓存。

## 7. 回滚

Git 历史即回滚手段：`git revert` 触发一次新构建即可。**不要**手工在 Pages 上改文件（Pages 不提供这样的入口，产物由 Action 产生）。回滚后同样要跑一次发布后冒烟。
