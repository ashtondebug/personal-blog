# 依赖策略

> **用途**：决定"这个包能不能装"。引入任何依赖前必读，装完后必须登记到本文的登记表。
> **状态**：Confirmed（默认零前端框架）+ Proposed（登记流程与门槛）
> **更新**：2026-11-26
> **相关**：[工程索引](./index.md) · [ADR-0006](../decisions/0006-no-default-ui-framework.md) · [构建与部署](./build-and-deployment.md) · [安全基线](../security/security-baseline.md)

## 1. 默认立场

- **客户端零框架**：不引入 React/Vue/Svelte/Solid 及其组件库（[ADR-0006](../decisions/0006-no-default-ui-framework.md)）。
- **构建期谨慎**：构建期插件不增加用户下载量，但会增加构建时间、升级风险与供应链面。
- **能自己写 20 行解决的，不装包**。

## 2. 依赖分类

| 类型 | 例子 | 门槛 |
| --- | --- | --- |
| A. 框架核心 | Astro 本身 | 已定（[ADR-0001](../decisions/0001-astro-as-site-framework.md)） |
| B. 官方集成 | Astro 官方 integrations（如 MDX、sitemap） | 低门槛，仍需登记 |
| C. 构建期工具 | Markdown 插件、图片优化、搜索索引器（如 Pagefind） | 中门槛：说明为什么自写不可行 |
| D. 客户端库 | 任何会被打进浏览器 JS 的包 | 高门槛：需 ADR + 体积论证 |
| E. 开发工具 | 类型检查、格式化、Lint | 低门槛，但要考虑维护成本 |

## 3. 引入前必须回答

1. 它解决的具体问题是什么？**现状**为什么不够？
2. 有无更小的替代（自己实现 / 已有依赖的子能力）？
3. 是构建期还是运行期？被打进客户端的体积是多少（gzip）？
4. 许可证是否允许当前使用方式？
5. 维护状态：最近发布、issue 响应、是否有替代品在取代它？
6. 出问题时的退出成本：卸载它要改多少地方？
7. 是否会引入网络请求、遥测或第三方账号？

任一项答不上来 → 不装。

## 4. 登记表（每次引入必须加一行）

| 包名 | 用途 | 类型(A–E) | 体积影响 | 引入日期 | 关联文档/ADR |
| --- | --- | --- | --- | --- | --- |
| `astro` | 站点框架 | A | 构建期；产物为静态文件 | 2026-11-26 | [ADR-0001](../decisions/0001-astro-as-site-framework.md) |
| `@astrojs/markdown-remark` | 恢复 unified/remark 管线，挂载 `[[双向链接]]` 插件（Astro 7 默认 Sätteri） | C | 仅构建期，不进客户端 | 2026-11-26 | [ADR-0009](../decisions/0009-markdown-pipeline-and-wiki-links.md) |
| `pagefind` | 构建后生成静态搜索索引（CLI 由 `npm run build` 调用） | C | 仅构建期；产物是静态索引文件 | 2026-11-26 | [Pagefind 参考](../references/pagefind.md) |
| `@waline/client` | 评论与 reaction 点赞的第三方预构建组件（内部自带 Vue 运行时，非本站 UI 框架） | D | 仅在配置了服务端的构建中打进评论区页面；未配置时页面零引用 | 2026-11-26 | [ADR-0010](../decisions/0010-comments-and-reactions.md) |

## 5. 版本与锁定

- 使用 lockfile 并入库；CI 用 `npm ci`（或等价的可复现安装）。
- 依赖版本区间保守（精确或 `~`），不用 `*`。
- Node 版本：Astro 7.4.13 要求 `node >= 22.23.4`（官方元数据，核验 2026-11-26）；工作流固定主版本，避免"某天突然构建失败"。
- 升级节奏：安全更新尽快；主版本升级单独一次提交 + 跑完整验收（[测试策略](./testing-strategy.md)）。

## 6. 安全与供应链

- 定期审计（`npm audit` 或等价）并把结论记入 [技术债](../../plans/tech-debt.md)。
- 不使用来源不明的包；不安装 `postinstall` 脚本可疑的包（安装时注意警告）。
- 依赖配置中不得出现密钥；密钥只通过 CI 环境变量或服务端配置注入。
- 不允许把 `dist/`、`node_modules/` 提交进仓库。

## 7. 移除依赖

移除同样要在登记表更新，并搜索全仓确认没有残留引用；移除运行时依赖后必须重新测量首屏体积。
