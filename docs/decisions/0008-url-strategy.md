# ADR-0008：URL 策略（全语言前缀 + 尾斜杠 always）

> **用途**：定案 URL 形式，避免评论 path 与分享链接在后期漂移。改路由前必读。
> **状态**：Confirmed（2026-11-26 由 Agent 按推荐值定案，用户已指示进入 Phase 1；如需改动应在有内容上线前完成）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [路由与 i18n](../architecture/routing-and-i18n.md) · [部署架构](../architecture/deployment-architecture.md) · [风险 R-03/R-05](../risks-and-validation.md) · [技术债 TD-03/TD-05](../../plans/tech-debt.md)

## 背景

多语言站点有三种 URL 形态可选，且尾斜杠策略会与 GitHub Pages 的目录式发布、评论 `path` 绑定在一起。三者在有内容与评论之后改动成本很高（评论 key 漂移、外链失效），必须在写配置时就定下来。

## 决策

1. **所有语言都带前缀**：`/{locale}/...`，包括默认语言 `/zh-CN/`。
2. **根路径重定向**：`/` → `/zh-CN/`，由 `src/pages/index.astro` 显式生成（不用 `i18n.routing.redirectToDefaultLocale`）。
3. **尾斜杠 always**：`trailingSlash: 'always'`，`build.format: 'directory'`，即 `/zh-CN/blog/`（不是 `/zh-CN/blog`）。
4. **`base`**：`/personal-blog`（项目页），`site` 为 `https://ashtondebug.github.io`。
5. 站内语言路径统一经 `src/i18n/url.ts` 的 `localeUrl()` 生成。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| 默认语言不带前缀（`/blog/` + `/en/blog/`） | 每个页面要处理两种形态；评论 path、搜索索引、canonical 都会出现双形态；重定向规则复杂 |
| 尾斜杠 never（`/zh-CN/blog`） | 与 Pages 的目录式产物（`dir/index.html`）不一致，会依赖服务器重定向，而静态托管的 301 行为不由我们控制 |
| 用语言子域（`en.example.com`） | 需要多个 DNS 与证书，与"第一阶段用默认域名"冲突 |

## 选择原因

1. **单一形态**：任意页面只有一个规范 URL，评论 key、canonical、搜索索引都不需要处理别名。
2. **与静态产物一致**：`/a/` ↔ `a/index.html`，不需要服务器做重写。
3. **可预测**：语言切换只是替换路径首段，`getRelativeLocaleUrl` 可直接生成。

## 影响

- 根路径必须重定向；重定向用 302（`Astro.redirect`），因为 Phase 1 尚无内容、可能调整，正式上线后可改为 301。
- 评论 `path` 将包含语言段（如 `/personal-blog/zh-CN/blog/hello/`），天然按语言隔离。
- `normalizeLocale` 陷阱：`getRelativeLocaleUrl` 默认会把 `zh-CN` 归一化成小写 `zh-cn`，而产物目录是 `zh-CN`（大小写敏感），会 404。因此统一用 `localeUrl()`（内部 `normalizeLocale: false`）——**不要**在页面里直接调用 `getRelativeLocaleUrl`。
- 若日后启用自定义域名：需删除 `base` 并同步改所有链接（[部署架构](../architecture/deployment-architecture.md)），此时 URL 已变，评论 path 需迁移方案。
