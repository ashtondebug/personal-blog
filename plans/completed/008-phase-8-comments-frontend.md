# 008 · 评论与点赞（Phase 8 前端部分）

> **用途**：记录评论前端挂载、评论 key 规则与点赞落地方式；**服务端仍未选型**，本阶段只完成前端部分。
> **状态**：Partial（2026-11-26：前端就绪并通过构建验证；服务端待定）
> **更新**：2026-11-26
> **相关**：[计划索引](../index.md) · [路线图](../active/000-initial-implementation-roadmap.md) · [Waline 集成](../../docs/integrations/waline.md) · [ADR-0010](../../docs/decisions/0010-comments-and-reactions.md) · [分析](../../docs/integrations/analytics.md)

## 1. 目标与范围

用户决定：**服务端先留空**，点赞用 Waline 自带 `reaction`。

因此本阶段只做前端可验证的部分：配置开关、挂载逻辑、评论 key 规则、语言与主题适配、未配置时的零噪声降级；服务端选型与真机联通留待后续。

## 2. 交付物

| 文件 | 内容 |
| --- | --- |
| `src/config/comments.ts` | `PUBLIC_WALINE_SERVER_URL` → `WALINE_SERVER_URL`；`COMMENTS_READY`；`GUESTBOOK_PATH = 'guestbook'`；`commentPath()`（去 base、去尾斜杠） |
| `src/components/comments/Comments.astro` | 评论区容器：标题、加载占位、`data-path`/`data-lang`/`data-reaction`/`data-server-url` |
| `src/scripts/waline.ts` | 按需 `import('@waline/client')`，`init({ serverURL, path, lang, dark: 'html[data-theme="dark"]', reaction })`；失败时显示降级文案并隐藏占位 |
| `src/pages/[locale]/blog/[slug].astro` | 文章页在 `COMMENTS_READY` 为真时挂载评论，`path` 为去 base 的路径 |
| `src/pages/[locale]/guestbook.astro` | 留言板：就绪则挂载（`path = guestbook`），否则保留说明文案 |
| 依赖 | `@waline/client@^3.16.2`（客户端依赖，内部自带 Vue 运行时，仅评论页按需加载） |

## 3. 实测证据

| 场景 | 检查 | 结果 |
| --- | --- | --- |
| 默认构建（无服务端） | 不渲染评论区、不出现 `data-waline` | OK |
| 默认构建 | 留言板保留"评论服务接入后开放"说明 | OK |
| 默认构建 | 页面不引用 Waline 脚本与库样式 | OK |
| 默认构建 | 文章列表页不含评论区 | OK |
| 临时配置 `PUBLIC_WALINE_SERVER_URL=https://waline.example.com` | 渲染容器、写入服务端地址 | OK |
| 同上 | 留言板 `path = guestbook`；文章页 `path` 为去 base 路径 | OK |
| 同上 | `data-reaction="true"` | OK |
| 同上 | 日语页面 `data-lang="jp"` | OK |
| 同上 | 页面引用评论脚本、含加载占位 | OK |

临时环境变量只在构建时注入，未写入仓库；默认构建已恢复为零引用状态。

## 4. 关键决定

1. **未配置 = 完全不出现**：文章页不显示"评论暂不可用"，避免给读者一个坏掉的区块；留言板作为地标页保留一句说明。
2. **点赞即 `reaction`**：不再引第三方；`pageview` 不搭便车（浏览量仍未验证）。
3. **评论 key 规则冻结**：文章为去 base 的完整路径、留言板固定 `guestbook`。上线后改 URL 结构会让评论错位，这条已写进 [Waline 集成](../../docs/integrations/waline.md) 与告警。
4. **按需加载**：`import('@waline/client')` 在脚本内动态导入，未配置时页面零引用。

## 5. 遗留（服务端就绪后要补）

- **服务端选型**（TD-08）：部署方式 × 数据库，需按验证清单取证。
- **真实联通测试**：发评论、审核、删除、导出、CORS、主题切换下的观感。
- **隐私说明**：评论区上线后需要告知访客数据由 Waline 存储（[隐私规范](../../docs/security/privacy.md)）。
- **浏览量**（TD-06）仍未定；若最终不可用，不保留任何占位。
- **未引用的构建产物**：未配置时 `_astro/` 里仍会留下评论 JS/CSS chunk（TD-31，仅产出体积）。

## 6. 下一阶段

Phase 9（PWA）与 Phase 10（SEO/隐私/安全）不依赖外部账号，可以先做；Phase 8 的收尾等服务端确定后与本阶段报告合并验收。
