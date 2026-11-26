# Waline 集成

> **用途**：评论与留言板的集成契约：路径规则、多语言映射、服务端选型与降级。接评论前必读。
> **状态**：Confirmed（使用 Waline、Guestbook 独立标识）+ Needs Validation（服务端与数据库选型）
> **更新**：2026-11-26
> **相关**：[集成索引](./index.md) · [ADR-0005](../decisions/0005-waline-for-comments.md) · [Waline 参考](../references/waline.md) · [隐私](../security/privacy.md) · [路由与 i18n](../architecture/routing-and-i18n.md)

## 1. 为什么必须外置

GitHub Pages 只返回静态文件，不能运行服务端。评论需要写入并跨用户持久化 → 只能由独立服务承担（[ADR-0007](../decisions/0007-static-dynamic-service-boundary.md)）。前端只挂载 Waline 客户端，通过 `serverURL` 连接；站点仓库不包含任何评论数据。

## 2. 路径契约（最容易造成数据"丢失"的地方）

Waline 用 `path` 区分评论区，默认取 `window.location.pathname`（官方 props 核验 2026-11-26）。

规则：

| 规则 | 说明 |
| --- | --- |
| 唯一性 | 每个页面必须有唯一 path；`/a/` 与 `/a` 会被视为两个页面 |
| 规范化 | 建议去掉末尾斜杠后作为 path（官方文档建议 `window.location.pathname.replace(/\/$/,'')` 之类处理），全站统一 |
| 稳定性 | 文章 URL 一旦对公众发布并产生评论，**不得再改动** |
| 语言隔离 | path 包含语言段 → 各语言评论区天然独立 |
| 留言板 | 固定 key `guestbook`（全站共用一块留言板，不按语言拆分），见 [ADR-0010](../decisions/0010-comments-and-reactions.md) |

受影响的外部变更：**仓库名变更（`base` 变化）、默认语言前缀策略变更、尾斜杠策略变更** 都会改变 path → 评论错位。因此这三项必须在启用评论前定案（[技术债](../../plans/tech-debt.md)）。

## 3. 客户端配置要点

| 选项 | 本项目取值 | 说明 |
| --- | --- | --- |
| `serverURL` | 外部服务地址 | 写入站点配置；不是密钥，可出现在前端 |
| `path` | 规范化后的当前路径 | 见 §2 |
| `lang` | `zh-CN` / `zh-TW` / `en` / **`jp`** | 日语是 `jp`，不是 `ja`（官方核验） |
| `dark` | `html[data-theme="dark"]` 选择器 | 不用 `'auto'`，否则会跟随系统而非用户选择 |
| `reaction` | `true`（点赞，用户已确认等价，[ADR-0010](../decisions/0010-comments-and-reactions.md)） | 最多 9 个表情 |
| `pageview` | **不启用** | 浏览量仍未通过免费验证（TD-06） |
| `noCopyright` | `false` | 保留 Waline 署名 |
| `login` | 待定 | 游客评论 vs 强制登录，`Needs Validation` |

## 4. 多语言

每种语言的页面使用对应 `lang`，界面文案（评论框、按钮、提示）随之切换。站点自身的 i18n 词典**不**负责 Waline 内部文案，避免重复维护。评论内容本身不做翻译。

## 5. 服务端选型候选（均需验证）

官方提供的部署方式（`docs/src/en/guide/deploy` 目录，核验 2026-11-26）：`vercel`、`netlify`、`railway`、`zeabur`、`tidb`、`aliyun-computenest`、`vps`。

官方支持的数据库（核验 2026-11-26）：MySQL、PostgreSQL、SQLite、MongoDB、TiDB、GitHub CSV（官方明确"性能原因不推荐"）、自定义。官方文中列出的免费额度示例：MongoDB 512 MB、TiDB Cloud 5 GB、Supabase/Neon 512 MB。

| 组合 | 优点 | 风险 | 状态 |
| --- | --- | --- | --- |
| Vercel + 免费 PostgreSQL（Neon/Supabase） | 部署最简、生态成熟 | 免费额度政策可能变化；中国大陆访问速度未知 | Needs Validation |
| Vercel + TiDB Cloud | 5 GB 免费额度较大 | 需自行建表与网络配置 | Needs Validation |
| Zeabur / Railway | 一键部署 | 免费策略可能收紧 | Needs Validation |
| 阿里云计算巢 | 国内访问快 | 可能需要实名/计费细则 | Needs Validation |
| VPS | 完全可控 | 有运维成本，违背零运维 | 备选 |

## 6. 验证清单（勾完才能定选型）

- [ ] 免费额度与续期规则写清（附官方链接与核验日期）。
- [ ] 是否需要绑定信用卡。
- [ ] 数据库是否需要手动导入 `waline.sql`/`waline.pgsql`。
- [ ] 服务端 CORS 是否允许本站域名。
- [ ] 中国大陆访问速度是否可接受（真实测速）。
- [ ] 服务商隐私政策与数据存放地区。
- [ ] 数据可导出（评论导出能力）。
- [ ] 停服/欠费时的行为（是否静默失败）。

## 7. 降级与运维

- 客户端加载失败或服务不可用：评论区显示一行说明，页面其余部分正常；不得整页报错。
- 反垃圾：Waline 自带审核与验证码能力（`recaptchaV3Key`/`turnstileKey` 需服务端配置密钥），密钥只放服务端。
- 备份：定期导出评论数据；数据归属说明写入 [隐私规范](../security/privacy.md)。
- 监控：无需自建监控，但发布后应人工打开一次评论区确认可用。

## 8. 前端实现状态（Phase 8，服务端待定）

| 项 | 实现 |
| --- | --- |
| 配置 | `src/config/comments.ts`：`WALINE_SERVER_URL` 读 `PUBLIC_WALINE_SERVER_URL`，为空则 `COMMENTS_READY = false` |
| 评论组件 | `src/components/comments/Comments.astro` + `src/scripts/waline.ts`：按需 `import('@waline/client')`，`lang` 走本站映射（ja→`jp`），`dark` 传 `html[data-theme="dark"]`，`reaction: true` |
| 挂载点 | 文章详情页（`path` = 去 base 的路径）与留言板页（`path` = `guestbook`） |
| 未配置时 | 不渲染评论区、页面不引用任何 Waline JS/CSS；留言板保留说明文案 |
| 验证 | 用临时 `PUBLIC_WALINE_SERVER_URL` 构建：容器、服务端地址、`path`、`reaction`、日语 `jp` 映射全部命中；默认构建下页面零引用 |

服务端就绪后只需设置环境变量并重新构建，无需改代码。
