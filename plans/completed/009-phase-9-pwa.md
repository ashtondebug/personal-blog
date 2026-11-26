# 009 · PWA（Phase 9）

> **用途**：记录 PWA 的实现、缓存策略与验证方式。改 manifest / Service Worker 前先读本文。
> **状态**：Completed（2026-11-26）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [PWA 集成](../../docs/integrations/pwa.md) · [构建与部署](../../docs/engineering/build-and-deployment.md)

## 1. 目标

可安装、可离线打开已访问页面、**更新后不会长期看到旧内容**（这是 PWA 最大的坑）。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `scripts/generate-icons.mjs` | 用 Node 内建 `zlib` 手写 PNG，生成 192 / 512 / maskable 512 / apple-touch 180 与 `favicon.svg`；图形为深色圆角方块 + 月牙 + 地平线 |
| `public/icons/*.png`、`public/favicon.svg` | 可复现的占位图标（作者可随时替换） |
| `src/pages/site.webmanifest.ts` | 构建期生成的 manifest 端点：`start_url`/`scope`/图标路径都带 `base`，`lang` 取默认语言 |
| `src/scripts/pwa.ts` | 仅生产环境注册 `${BASE}sw.js`，`scope` 为 base |
| `scripts/build-sw.mjs` | 构建末尾生成 `dist/sw.js`；缓存名 = 产物文件列表与大小的 sha256 前 10 位 |
| `BaseLayout.astro` | 引入 manifest、svg favicon、apple-touch-icon、两套 `theme-color`（明/暗），并加载注册脚本 |
| `package.json` | `build` = `astro build && pagefind --site dist && node scripts/build-sw.mjs` |

## 3. 缓存策略

| 请求类型 | 策略 | 原因 |
| --- | --- | --- |
| 页面导航（`mode === 'navigate'`） | **网络优先**，成功则更新缓存；失败回退缓存，再回退首页 | 保证内容新鲜，同时断网可读 |
| `/_astro/`、`/icons/`、`/pagefind/` | 缓存优先 | 文件名带哈希，不会过期 |
| 其它同源请求 | 不拦截 | 避免缓存不该缓存的东西 |
| 跨域请求（评论等） | **完全不拦截** | 评论必须实时 |

更新机制：缓存名随产物哈希变化，`activate` 时删除旧缓存并 `clients.claim()`；新版本在下次页面加载生效。**不弹"新版本"提示**（本阶段不做，登记为后续可选）。

## 4. 验证证据

| 检查 | 结果 |
| --- | --- |
| HTML 引用 manifest / svg favicon / apple-touch-icon（均带 base） | OK |
| HTML 有两套 `theme-color`（明暗各一） | OK |
| manifest 内含 192 / 512 / maskable 图标 | OK |
| manifest `start_url` = `/personal-blog/zh-CN/`、`scope` = `/personal-blog/` | OK |
| manifest 描述为合法 UTF-8 中文 | OK |
| `dist/sw.js` 存在且缓存名含产物哈希 | OK |
| SW 明确跳过跨域请求 | OK |
| 注册脚本已进入页面（内联） | OK |

图标经预览确认：深色圆角底、白色月牙、地平线，512px 下清晰无锯齿。

## 5. 遗留

- **离线与安装的真机验证**：需要真实浏览器（DevTools → Application）确认，命令行无法验证。Phase 12 验收时补。
- **新版本提示**：目前靠下次加载自动更新；如需"有新版本，点击刷新"要额外 UI。
- **搜索索引缓存**：`/pagefind/` 走缓存优先，索引文件名带哈希所以安全；但若未来改为固定文件名，需要把缓存名绑到构建版本（已具备）。
- **图标是几何占位**：作者可替换 `public/icons/` 与 `favicon.svg`。
- **旧 SW 作用域**：自定义域名迁移时需处理旧作用域，已记在 [PWA 集成](../../docs/integrations/pwa.md)。

## 6. 下一阶段

Phase 10（SEO、隐私、安全）与 Phase 12（最终验收）。Phase 8 的服务端收尾仍待作者选型。
