# 分析与统计（浏览量 / 点赞）

> **用途**：两个**条件性**需求的唯一权威说明：浏览量（REQ-DATA-03）与点赞（REQ-DATA-05）。任何"加个统计/加个赞"的想法先读本文。
> **状态**：Needs Validation（方案未验证）+ Confirmed（没有合格免费方案时**不实现**）
> **更新**：2026-11-26
> **相关**：[集成索引](./index.md) · [需求清单 §6](../product/requirements.md) · [Waline](./waline.md) · [隐私](../security/privacy.md) · [ADR-0007](../decisions/0007-static-dynamic-service-boundary.md)

## 0. 需求原话的含义

- 浏览量：**只使用免费第三方方案**；找不到合适方案 → **不展示**（不是"先放个假数字"）。
- 点赞：**仅在找到真正免费且满足要求的服务时启用**；否则**彻底弃用**——不保留按钮、UI、接口、数据结构、占位功能。
- 两者都**禁止伪造数据**。

因此本文的默认结论是：**当前不实现**，直到有证据推翻。

## 1. 浏览量

### 1.1 候选方案

| 方案 | 是否免费 | 隐私 | 集成成本 | 风险 | 状态 |
| --- | --- | --- | --- | --- | --- |
| **Waline 自带 `pageview`** | 取决于 Waline 服务端（已有服务，无额外成本） | 数据在自选数据库，可控 | 低（`pageview: true` 或单独引入 `pageviewCount`） | 与评论服务绑定：服务挂了浏览数也没了 | **第一候选** |
| GoatCounter | 官方称对非商业个人站免费 | 无 cookie、较友好 | 低（一段脚本） | 免费政策与"商业"判定、境内访问 | Needs Validation |
| Umami Cloud / 自建 Umami | 免费额度/需自建 | 可自控（自建） | 中（自建需服务器） | 自建违背零运维 | Needs Validation |
| Cloudflare Web Analytics | 免费 | 号称无 cookie | 低 | 需接入 Cloudflare，增加一层依赖 | Needs Validation |
| Plausible 等 | 付费为主 | 好 | 低 | 不免费 | 排除 |

Waline 的 pageview 机制（官方核验 2026-11-26）：初始化时 `pageview: true` 会自动填充页面上 class 为 `waline-pageview-count` 的元素，取其 `data-path` 作为统计路径；也可单独 `import { pageviewCount } from '@waline/client@v3/dist/pageview.js'`，参数 `{ serverURL, path, selector?, update? }`，返回取消函数。

选它的理由：**不新增第三方追踪**，与评论共用同一后台与路径规则；缺点是与 Waline 强绑定。

### 1.2 采用门槛（全部满足才可展示）

- [ ] 免费额度有官方书面说明，且不要求信用卡。
- [ ] 数据可导出/可迁移；隐私政策可引用。
- [ ] 前端脚本 gzip ≤ 50 KB，或干脆无额外脚本。
- [ ] 提供只读取数的公开接口，且被服务端限流不会打挂页面。
- [ ] 服务不可用时页面无报错、无 0 占位。
- [ ] 不依赖用户开启 JS 之外的行为（不埋点、不指纹）。

未通过 → 全站不展示浏览量，且仓库中**不保留**相关组件与字段。

## 2. 点赞

### 2.1 结论（2026-11-26 已定）

用户确认：**"点赞"用 Waline 自带的 `reaction` 实现**，不再另找第三方点赞服务。实现细节见 [ADR-0010](../decisions/0010-comments-and-reactions.md)。

| 项 | 取值 |
| --- | --- |
| 选项 | `reaction: true`（最多 9 个表情，按位置计数） |
| 生效条件 | Waline 服务端就绪（当前 `PUBLIC_WALINE_SERVER_URL` 为空，整个评论区不渲染） |
| 数据位置 | 与评论同一个自托管服务与数据库 |
| 不做的 | 不设独立点赞服务、不做本地假计数、不在 frontmatter 存计数值 |

### 2.2 历史记录

Waline 提供 `reaction`（表情反应，最多 9 个，官方核验 2026-11-26），早期记为"与点赞是否等价未确认"；经用户确认后转为上表结论。

## 3. 实现任何方案时必须遵守

- 数值必须来自真实接口；**不得**本地递增造假，不得用随机数/占位。
- 计数请求失败 → 隐藏该数值，而不是显示 0。
- 不引入跨站追踪脚本，不写入长期第三方 cookie。
- 相关数据不进入 frontmatter（[数据模型](../architecture/data-models.md)）。
- 上线后若服务停摆，必须在下一次发布中移除 UI 或替换方案，不允许长期显示坏值。

## 4. 变更流程

选定方案 → 补齐本文的验证清单证据（链接 + 核验日期）→ 更新 [风险清单](../risks-and-validation.md) → 若涉及新第三方，追加 ADR → 再实现。
