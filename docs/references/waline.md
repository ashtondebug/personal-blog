# Waline 参考资料

> **用途**：Waline 的官方事实依据（客户端参数、浏览量、反应、部署与数据库）。配评论前核对这里。
> **状态**：✅ 已核验（2026-11-26）；版本敏感项需复核
> **更新**：2026-11-26
> **相关**：[资料索引](./index.md) · [Waline 集成](../integrations/waline.md) · [ADR-0005](../decisions/0005-waline-for-comments.md) · [分析](../integrations/analytics.md)

## 1. 官方链接

| 主题 | 链接 |
| --- | --- |
| 官网 | https://waline.js.org/ |
| 客户端配置（组件 Props） | https://waline.js.org/reference/client/props.html |
| 浏览量（Pageview） | https://waline.js.org/guide/features/pageview.html |
| 反应（Reaction） | https://waline.js.org/guide/features/reaction.html |
| 数据库支持 | https://waline.js.org/guide/database.html |
| 部署方式 | https://waline.js.org/guide/deploy/ |
| 服务端配置 | https://waline.js.org/reference/server/ |

## 2. 客户端 Props（逐字，核验 2026-11-26）

`serverURL`、`path`、`lang`、`locale`、`emoji`、`dark`、`commentSorting`、`meta`、`requiredMeta`、`login`、`wordLimit`、`pageSize`、`imageUploader`、`highlighter`、`texRenderer`、`search`、`noCopyright`、`noRss`、`recaptchaV3Key`、`turnstileKey`、`reaction`、`pageview`。

| 结论 | 置信度 |
| --- | --- |
| `path` 默认取 `window.location.pathname`，官方要求保证每个页面 path 唯一 | ✅ |
| `path` 官方建议处理末尾斜杠（如去掉 `/` 后作为 key）以避免同页两个评论区 | ✅ |
| `lang` 可选值包含 `zh-CN`、`zh-TW`、`en`、**`jp`**（日语是 `jp`，不是 `ja`） | ✅ |
| `dark` 可传布尔值、`'auto'` 或 **CSS 选择器**（在其匹配时启用深色） | ✅ |
| `reaction` 可传 `true` 或表情 URL 数组，**最多 9 个**；计数按位置统计 | ✅ |
| `login` 取值 `'enable'`（默认）/`'disable'`/`'force'` | ✅ |
| `meta` 默认 `['nick','mail','link']`；`requiredMeta` 默认 `[]` | ✅ |
| `pageSize` 默认 10；`wordLimit` 默认 0（不限） | ✅ |
| `imageUploader` 默认把图片以 Base64 内嵌，可设为 `false` 禁用 | ✅ |
| `recaptchaV3Key` / `turnstileKey` 需配合服务端 secret 使用 | ✅ |
| `@waline/client` 当前大版本号 | ○ 待复核（文档示例仍使用 `@waline/client@v3` 路径） |

## 3. 浏览量（Pageview）

| 结论 | 置信度 |
| --- | --- |
| 初始化时设 `pageview: true`，Waline 自动填充页面中 class 为 `waline-pageview-count` 的元素，取其 `data-path` 作为统计路径 | ✅ |
| `pageview` 也可设为一个自定义 CSS 选择器 | ✅ |
| 调用实例的 `update()` 会重新扫描页面并刷新计数 | ✅ |
| 可单独引入：`import { pageviewCount } from '@waline/client@v3/dist/pageview.js'`，参数 `{ serverURL, path, selector?, update? }` | ✅ |
| `pageviewCount` 返回取消函数，可中止进行中的请求 | ✅ |

## 4. 部署方式（官方 `guide/deploy` 目录，核验 2026-11-26）

`vercel`、`netlify`、`railway`、`zeabur`、`tidb`、`aliyun-computenest`、`vps`。

## 5. 数据库（官方 `guide/database`，核验 2026-11-26）

| 数据库 | 官方给出的说明 | 环境变量前缀 |
| --- | --- | --- |
| MongoDB | 官方提到 mongodb.com 提供 512M 免费额度 | `MONGO_*` |
| MySQL | 可自建；官方提到 FreeDB 25 MB、PlanetScale 目前仅付费 | `MYSQL_*` |
| TiDB | TiDB Cloud 提供 5 GB 免费额度 | `TIDB_*` |
| PostgreSQL | 官方提到 Supabase / Neon 提供 512M、Tembo 提供 10G 免费 | `PG_*` / `POSTGRES_*` |
| SQLite | 需要 `SQLITE_PATH` 与 `JWT_TOKEN` | `SQLITE_*` |
| GitHub（CSV 存评论） | 官方明确"性能原因不推荐" | `GITHUB_TOKEN`、`GITHUB_REPO` |
| 自定义存储 | 需继承基类实现 `select/add/update/delete` | — |

**注意**：以上免费额度是官方文档文内的表述，属于易变项，选型时必须重新核对并提供当日证据。

## 6. 易变项与待复核

- `@waline/client` 的大版本与导入路径（`dist/pageview.js` 属于实现路径，可能随版本变化）。
- 各数据库服务商的免费额度、是否需要信用卡、地区可用性。
- 默认 `emoji` 资源来自 unpkg CDN（第三方域名，涉及隐私与可用性，`Needs Validation`：是否改为自托管）。
- 评论数据的导出与删除能力的具体入口。
