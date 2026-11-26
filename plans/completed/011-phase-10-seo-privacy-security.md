# 011 · SEO、隐私、安全（Phase 10）

> **用途**：记录 SEO 收尾、隐私/安全检查与依赖审计结果。**其中包含一个会阻塞评论上线的漏洞结论。**
> **状态**：Completed（2026-11-26）；评论启用被 ADR-0010 之外的新增条件阻塞（见 §5）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [安全基线](../../docs/security/security-baseline.md) · [隐私规范](../../docs/security/privacy.md) · [需求 §10](../../docs/product/requirements.md) · [依赖策略](../../docs/engineering/dependency-policy.md)

## 1. 目标

补齐基础 SEO（不扩展成复杂系统）、把隐私与安全清单落成可执行检查、并做一次依赖审计。

## 2. 交付物

| 项 | 实现 |
| --- | --- |
| `meta keywords` | `BaseLayout` 新增 `keywords` 属性；内容详情页传「分类 + 标签/技术栈」 |
| OG / Twitter 卡片 | `og:url`、`og:image`、`twitter:card=summary_large_image` + 标题/描述/图 |
| 默认分享图 | `scripts/generate-og.mjs` 生成 1200×630 的 `public/og-default.png`（深底 + 月牙 + 地平线 + 网点 + 强调色条） |
| `robots.txt` | `src/pages/robots.txt.ts`：允许抓取，指向 sitemap（搜索页用页面级 noindex，不 Disallow） |
| `sitemap.xml` | `src/pages/sitemap.xml.ts`：站点级页面四语言互为 alternate；内容页按 `translationKey` 组 alternate 并带 `lastmod`；**不含**搜索页与分类/标签聚合页 |
| 搜索页 noindex | 避免薄内容进索引 |
| 安全检查脚本 | `scripts/check-security.mjs`：外链 `rel="noopener"`、`http://` 混合内容、内联事件处理器、第三方 `<script src>`、manifest/sw 是否存在；已接入 CI |
| 依赖审计 | `npm audit --registry=https://registry.npmjs.org`（默认镜像不支持审计接口） |

## 3. 验证证据

| 检查 | 结果 |
| --- | --- |
| 详情页 `<meta name="keywords">` = 分类 + 标签 | OK |
| 详情页/首页均有 `og:image`（绝对地址，带 base） | OK |
| 详情页有 `og:url`、`twitter:card` | OK |
| 搜索页 `noindex` | OK |
| sitemap 四语言 alternate、内容页 `lastmod`、不含 `/search/` | OK |
| robots 指向 sitemap 且 `Allow: /` | OK |
| 安全脚本：38 个 HTML 全通过 | OK |
| 其余检查（docs / i18n / contrast） | OK |

## 4. sitemap 的范围决定

只放两类 URL：站点级页面与内容详情页。**分类/标签聚合页故意不放进 sitemap**——它们能由列表页与内容页发现，放进去只会让 sitemap 膨胀；搜索页是 noindex，也不放。这不是"复杂 SEO"，是让 sitemap 保持可读。

## 5. 依赖审计：一个会阻塞评论的 critical 漏洞

```
npm audit --omit=dev --registry=https://registry.npmjs.org
→ 1 critical severity vulnerability
@waline/client vulnerable to stored XSS through unsanitized comment edit previews
```

| 项 | 值 |
| --- | --- |
| 编号 | GHSA-crj3-q72p-ggqm（GitHub Advisory） |
| 严重度 | critical（CWE-79 / CWE-116） |
| 公布日期 | 2026-11-25 |
| 影响范围 | `@waline/client <= 3.16.2`（即当前 latest） |
| 修复版本 | **无**（advisory 中 `first_patched_version` 为空） |

### 影响与结论

- **当前不受影响**：评论服务端未配置，评论区根本不渲染，Waline 客户端不会加载。
- **启用评论前必须先解决**：漏洞是"评论编辑预览的存储型 XSS"，属于第三方客户端渲染问题，本站无法通过配置规避。
- 可选路径（需要作者决定，不能由 Agent 单方面选）：
  1. 等上游发布修复版本后升级；
  2. 暂缓启用评论；
  3. 换评论系统（需要新 ADR，并重新评估 [ADR-0005](../../docs/decisions/0005-waline-for-comments.md)）。
- 已登记 TD-35，并在 [安全基线](../../docs/security/security-baseline.md) 与 [风险清单](../../docs/risks-and-validation.md) 中标注为阻塞项。

### 审计命令的坑

本机 npm 配置的镜像（registry.npmmirror.com）**未实现 `/-/npm/v1/security/*` 接口**，直接 `npm audit` 会报 `[NOT_IMPLEMENTED]`。需要显式指定官方 registry。这条已写进 [依赖策略](../../docs/engineering/dependency-policy.md)。

## 6. 隐私

- 评论未启用，因此暂不需要评论区隐私说明；**启用时必须补**（TD-32）。
- 站点未引用第三方脚本（安全脚本会检查 `<script src="http...">`），无追踪像素。
- About 仍为占位内容，未写入任何真实个人信息（符合 [隐私规范](../../docs/security/privacy.md)）。

## 7. 遗留

- **TD-35**：Waline critical 漏洞，阻塞评论启用。
- **TD-06**：浏览量仍未验证，继续不展示。
- **TD-34**：依赖审计需显式指定官方 registry，未进 CI（避免每次构建都依赖外网审计接口）。
- **OG 图是几何图**：没有文字（命令行无字体渲染），作者可替换。
- **sitemap 未包含分类/标签聚合页**：有意为之，若未来需要可加。

## 8. 下一阶段

Phase 12（最终验收）：Lighthouse 实测、真机离线与无障碍核对、文档一致性、债务复盘。需要真实内容与浏览器环境。
