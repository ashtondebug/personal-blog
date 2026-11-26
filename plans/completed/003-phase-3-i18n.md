# 003 · 多语言系统（Phase 3）

> **用途**：记录多语言的落地方式、自动化校验与平台限制下的折中。改路由、切换器或 meta 前先读本文。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [路由与 i18n](../../docs/architecture/routing-and-i18n.md) · [ADR-0004](../../docs/decisions/0004-per-language-articles.md) · [ADR-0008](../../docs/decisions/0008-url-strategy.md)

## 1. 目标

让"四语言"从"能出四种页面"升级为"元信息、切换、错误页都正确且可自动化验证"。

## 2. 交付物

| 项 | 实现 |
| --- | --- |
| `hreflang` 组 | `BaseLayout` 对每个页面输出 4 个 `link rel="alternate"`（绝对地址）+ 1 个 `x-default` 指向默认语言 |
| `og:locale` / OG 基础标签 | `zh_CN` / `zh_TW` / `en_US` / `ja_JP`，配 `og:site_name`/`og:title`/`og:description`/`og:type` |
| 版块级语言切换 | `BaseLayout` 的 `path` 传入 `SiteHeader` → `LanguageSwitcher`，切换后停在**同一版块**（`/en/about/` ↔ `/zh-CN/about/`），不再回首页 |
| 无翻译不出现链接 | `availableLocales` 控制：缺省全部可用；内容页 Phase 4 接入后按 `translationKey` 传入 |
| `aria-current` 约定 | 语言组当前项用 `aria-current="true"`；导航当前版块用 `aria-current="page"`，全页唯一 |
| 语言感知 404 | 静态渲染默认语言 + 内联脚本按 URL 语言段/浏览器语言替换标题与提示；含四语言首页入口、`noindex`、无 alternates |
| 第二个版块（关于） | 新增 `/{locale}/about/` 占位页并把导航 `about` 置为可点击，用于真实验证"同版块切换" |
| 自动化校验 | `scripts/check-i18n.mjs` 校验 lang / canonical / hreflang / x-default / og:locale / 切换链接 / `aria-current` / 404 / 根重定向；已接入 CI |

## 3. 验收证据

| 检查 | 结果 |
| --- | --- |
| 构建 | 10 页：四语言 × (首页 + about) + 404 + 根重定向 |
| `npm run check:i18n` | 通过：8 个语言页面 + 404 + 根重定向的 lang / canonical / hreflang / 切换链接均一致 |
| `npm run check:docs` | 通过 |
| `npm run check:contrast` | 通过（两套主题全部 ≥4.5:1） |
| CI | 「Docs & Design Check」新增 `npm ci` + `npm run build` + i18n 校验步骤 |

## 4. 平台限制与折中

**GitHub Pages 只能有一个全局 `404.html`**，无法按语言分文件。所以 404 采用"静态默认语言 + 客户端按语言替换"的方式：

- 优点：任何语言访问者都能看到自己语言的错误提示（JS 可用时），且能一键回到对应语言首页。
- 代价：禁用 JS 时只看得到默认语言文案；这不影响导航（四语言入口是静态链接）。
- 记录在案：如果未来改用支持 per-locale 404 的托管，应替换为静态分语言 404。

**`aria-current` 曾出现两处 `page`**：导航当前项与语言组当前项都用 `page` 时，自动化无法判定"唯一当前版块"。已改为语言组用 `true`，并写入 [路由与 i18n §5.1](../../docs/architecture/routing-and-i18n.md)，校验脚本据此断言唯一性。

**404 的路径耦合（线上发现）**：最初 404 把 `path="__404__"` 同时用于"导航不高亮"和"语言切换"，导致切换链接变成 `/zh-TW/__404__/`（死链）。修复：拆成 `path`（语言切换 + hreflang）与 `navPath`（导航高亮），404 传 `path=""`、`navPath="__404__"`；并在 `check-i18n.mjs` 增加"链接中不得出现 `__` 哨兵"的断言，防止同类问题复发。

教训：**同一个 prop 承担两种语义，迟早会泄漏**。导航状态与 URL 生成必须分开。

## 5. 遗留

- **内容页的语言切换**尚未真实生效：需要 Phase 4 的 `translationKey` 与"该内容存在哪些语言"的派生数据；当前 `availableLocales` 只在站点级页面使用。
- **About 是占位页**（`about.placeholder`），实际内容由作者填写；不得由 Agent 编造个人资料。
- **`hreflang` 只在页面语言存在时输出**——内容页的"部分语言"场景要等 Phase 4 才有真实数据。
- 404 的语言检测只覆盖四种本站语言；其他语言回落到浏览器判断，再回落默认语言。

## 6. 下一阶段

Phase 4（内容模型与 Markdown 管理）：`src/content.config.ts`、五个集合的 zod schema、语言目录约定、派生数据（分类/标签/年份/阅读时间/反向链接）、`translationKey` 一致性校验。
