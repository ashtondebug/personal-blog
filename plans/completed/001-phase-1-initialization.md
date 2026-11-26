# 001 · 项目初始化与基础架构（Phase 1）

> **用途**：记录 Phase 1 的实际产出、实测数据与踩坑。接手 Phase 2 前先读"遗留"一节。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [ADR-0008](../../docs/decisions/0008-url-strategy.md) · [构建与部署](../../docs/engineering/build-and-deployment.md) · [项目结构](../../docs/engineering/project-structure.md)

## 1. 目标

得到能构建、能部署、结构清晰的静态骨架：`site`/`base`/i18n 配置正确，四种语言各有一个页面，根路径重定向到默认语言，部署工作流就位。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `package.json` + `package-lock.json` | Astro ^7.4.13；脚本 `dev`/`build`/`preview`/`check:docs`；`engines.node >= 22.23.4` |
| `astro.config.mjs` | `site`、`base=/personal-blog`、`trailingSlash=always`、`build.format=directory`、`i18n`（4 语言、全前缀、`redirectToDefaultLocale: false`） |
| `tsconfig.json` | 继承 `astro/tsconfigs/strict` |
| `src/config/site.ts` | 站点名占位值（唯一处）与一句话定位 |
| `src/i18n/config.ts` | 语言定义：`code` / `htmlLang` / `ogLocale` / `walineLang`（ja→`jp`）/ `label` |
| `src/i18n/ui.ts` | 四语言最小词典 + `t()`（缺键抛错，不静默空串） |
| `src/i18n/url.ts` | `localeUrl()`：带 base、保留大小写的语言路径 |
| `src/layouts/BaseLayout.astro` | `<html lang>`、title、description、canonical、`color-scheme` |
| `src/pages/index.astro` | 根路径 → `/personal-blog/zh-CN/`（302） |
| `src/pages/[locale]/index.astro` | 四语言首页骨架 + 语言切换（当前语言用 `aria-current`，非当前用 `hreflang`） |
| `.github/workflows/deploy.yml` | 官方形态：`actions/checkout@v7` + `withastro/action@v6` + `actions/deploy-pages@v5`，权限 `pages: write`/`id-token: write` |
| `.gitignore` | 新增 `.npm-cache/` |

## 3. 实测结果

| 验证项 | 结果 |
| --- | --- |
| `npm install` | 188 个包，约 5 分钟（沙箱内需 `--cache .npm-cache`） |
| `npm run build` | 成功，5 个页面（4 语言 + 根重定向），约 1.0 s |
| 产物目录 | `dist/{zh-CN,zh-TW,en,ja}/index.html` + `dist/index.html` |
| 根重定向目标 | `/personal-blog/zh-CN/`（含 base，大小写正确） |
| 页面内链 | `/personal-blog/zh-CN/`、`/personal-blog/zh-TW/`、`/personal-blog/ja/` 均带 base |
| canonical | `https://ashtondebug.github.io/personal-blog/{locale}/` |
| `<html lang>` | `zh-CN` / `zh-TW` / `en` / `ja` 各自正确 |
| 词典 | 四语言首页文案各自正确，未出现串语言 |
| GitHub Pages | **已启用**（Source = GitHub Actions，`https_enforced: true`），地址 `https://ashtondebug.github.io/personal-blog/` |
| 部署工作流 | run `45828802713`：build + deploy 全绿，43 s |
| 线上验证 | `/personal-blog/` → 重定向到 `/personal-blog/zh-CN/`；`/en/`、`/ja/`、`/zh-CN/`、`/zh-TW/` 均 HTTP 200，文案与语言正确 |

## 4. 踩到的三个坑（后来者必看）

1. **Astro 遥测写用户目录被沙箱拒绝**（`EPERM: mkdir C:\Users\...\astro\Config`）→ 构建时设 `ASTRO_TELEMETRY_DISABLED=1`。CI 不受影响。
2. **`MissingIndexForInternationalization`**：`i18n.routing.redirectToDefaultLocale: true` 要求根 index 页面存在，否则构建失败。本项目改为 `false` + 显式 `src/pages/index.astro` 重定向，便于控制带 base 的目标地址。
3. **`getRelativeLocaleUrl` 会把 `zh-CN` 归一化成 `zh-cn`**：产物目录是 `zh-CN`，GitHub Pages 大小写敏感 → 链接 404。修复：`src/i18n/url.ts` 的 `localeUrl()` 传 `normalizeLocale: false`，全站只用它生成语言路径。

## 5. 未完成 / 遗留

- **站点名仍是占位「未命名空间」**：定名后改 `src/config/site.ts` 一处。
- **根重定向是 302**：内容稳定后可视情况改 301。
- **尚无**：样式与设计 token（Phase 2）、内容集合（Phase 4）、八大页面（Phase 5）、搜索索引（Phase 6）。
- **Phase 11 剩余**：发布后冒烟清单尚未固化为流程（每次发布人工走一遍即可，待写作 PWA/搜索后再补自动化）。

## 6. 下一阶段

Phase 2（设计系统与全局布局）：把 [设计系统](../../docs/design/design-system.md) 落为 token 文件、reset、排版基线与 Header/Footer 外壳，同时解决中文字体策略（TD-10）。
