# 路由与国际化

> **用途**：定义 URL 结构、语言前缀策略、语言切换与回退规则。改任何路由、加任何语言相关功能前必读。
> **状态**：Confirmed（四语言、独立语言文章、UI 全量国际化、URL 策略）+ Proposed（具体实现细节）
> **更新**：2026-11-26
> **相关**：[信息架构](../product/information-architecture.md) · [前端架构](./frontend-architecture.md) · [内容架构](./content-architecture.md) · [ADR-0004](../decisions/0004-per-language-articles.md) · [ADR-0008](../decisions/0008-url-strategy.md) · [Waline 集成](../integrations/waline.md)

## 1. 语言集合

| 语言 | 代码 | Waline `lang` | `<html lang>` |
| --- | --- | --- | --- |
| 简体中文 | `zh-CN` | `zh-CN` | `zh-CN` |
| 繁体中文 | `zh-TW` | `zh-TW` | `zh-TW` |
| English | `en` | `en` | `en` |
| 日本語 | `ja` | **`jp`** | `ja` |

注意：Waline 的日语值是 `jp`，不是 `ja`（官方 props 文档核验，2026-11-26）。映射表必须集中在 i18n 配置里，不在组件内散写。

## 2. 路由形态

采用 Astro 内置 i18n 路由（不手写语言前缀逻辑）：

```text
src/pages/[locale]/index.astro         → /{locale}/
src/pages/[locale]/blog/index.astro    → /{locale}/blog/
src/pages/[locale]/blog/[slug].astro   → /{locale}/blog/{slug}/
...
```

- 路由由 `getStaticPaths()` 按四种语言展开，构建期全部生成静态页。
- 站点级页面（Home/Blog 列表/Projects/Gallery/Moments/About/Guestbook/搜索）**四种语言都存在**，文案来自完整词典。
- 内容页（文章/知识/项目/图集/动态）只在其内容所属语言下生成。

## 3. 配置字段（已核验的官方字段名）

在 `astro.config` 的 `i18n` 中配置（字段名以 `astro:i18n` 官方参考为准，2026-11-26 核验）：

| 字段 | 作用 | 本项目取值 |
| --- | --- | --- |
| `defaultLocale` | 默认语言 | `zh-CN`（Proposed） |
| `locales` | 语言列表 | `['zh-CN','zh-TW','en','ja']` |
| `routing.prefixDefaultLocale` | 默认语言是否也带前缀 | `true`（[ADR-0008](../decisions/0008-url-strategy.md)） |
| `trailingSlash` | 尾斜杠 | `'always'`（[ADR-0008](../decisions/0008-url-strategy.md)） |
| `routing.fallbackType` | 回退方式 `redirect` \| `rewrite` | 本项目**不用内容级 fallback**（见 §6） |
| `fallback` | 语言 → 回退语言 | 不使用 |

URL 生成统一使用 `src/i18n/url.ts` 的 `localeUrl(locale, path?)`（内部调用 `astro:i18n` 的 `getRelativeLocaleUrl`，并传 `normalizeLocale: false`）。**禁止**手写 `/${locale}/` 字符串拼接，也**不要**在页面里直接调用 `getRelativeLocaleUrl`——见下方陷阱说明。

> **已踩过的坑（Phase 1 实测）**：`getRelativeLocaleUrl` 默认会把 `zh-CN` 归一化为小写 `zh-cn`，而静态产物目录是 `zh-CN`；GitHub Pages 大小写敏感，链接会 404。必须传 `normalizeLocale: false`，或一律走 `localeUrl()` 包装。

## 4. URL 策略（已定案）

| 项 | 决定 | 依据 |
| --- | --- | --- |
| 默认语言前缀 | **全部语言都带**：`/{locale}/...` | [ADR-0008](../decisions/0008-url-strategy.md) |
| 根路径 | `/` → 302 重定向到 `/zh-CN/` | `src/pages/index.astro` |
| 尾斜杠 | `always` + `build.format: 'directory'` | ADR-0008 |
| `base` | `/personal-blog` | 项目页路径 |

曾考虑的"默认语言不带前缀"方案已否决：会导致评论 path、搜索索引与 canonical 出现双形态。此决定影响：全站 URL、Waline 评论 `path`、搜索索引 URL、canonical、`hreflang`、PWA `start_url`。**上线后不得变更**。

## 5. 语言切换

- 站点级页面：切到目标语言的同一路径（由 `localeUrl()` 生成）。
- 内容页：**只有存在目标语言版本时**才提供该语言链接；否则该语言项显示为不可用并给出说明，禁止指向同 slug 的其他语言页面。
- 内容之间的对应关系由内容模型里的可选字段声明（如 `translationKey`，[数据模型](./data-models.md) 定义），构建期生成"该内容的可用语言列表"。
- 不生成伪 `hreflang`：只对真正存在的语言版本输出 `<link rel="alternate" hreflang>`。
- 语言选择记忆：可选，存 `localStorage: blog:locale`（Proposed）。**注意**不得据此自动跳转用户所在语言——会破坏分享链接的可预测性。

## 6. 回退与 404

- **不使用内容级 fallback**：需求明确"不生成不存在的翻译链接"，回退渲染会让用户看到错误语言的内容，等价于伪造翻译。
- 未知路径 → 语言感知的 404：`/{locale}/404` 优先，其次根 404 页。GitHub Pages 支持自定义 404（官方 `404.html` 约定，落地时复核）。
- 非法 `locale` 段 → 404，不猜测、不重定向。
- 尾斜杠策略（`trailingSlash`）与 `build.format` 需与 `base` 一起定案，否则站内链接会出现重定向链（`Needs Validation`）。

## 7. 元信息一致性

每个页面必须输出：`<html lang>`（按页面语言）、`<title>`（含站点名与页面名，站点名未定 → 走配置项）、`meta description`、`canonical`（绝对 URL，需 `site`）、`hreflang` 组（仅存在的语言版本）、`og:locale`（`zh_CN` / `zh_TW` / `en` / `ja` 这类下划线形式）。四语言各自的文案来自词典，禁止把中文文案直接塞进英文页面的 meta。

## 8. 检查清单（实现路由时逐条核对）

- [ ] 四种语言的全部站点级页面都能构建出静态 HTML。
- [ ] 切换语言后落在同一板块，而不是回到首页（内容页除外，无翻译时禁用）。
- [ ] 站内所有链接都经由 i18n 工具生成，配置 `base` 后仍正确。
- [ ] 无翻译的文章页面**不出现**其他语言的可点击链接。
- [ ] Waline `path` 在语言切换后随之变化（每种语言独立评论区）。
- [ ] `hreflang` 与实际存在的语言版本完全一致。
