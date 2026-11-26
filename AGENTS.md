# 项目导航（AGENTS.md）

简约文艺风格的多语言个人博客 **The Commons**。Astro + TypeScript + Markdown，托管 GitHub Pages，评论走 Waline 外部服务。
当前阶段：**Phase 5 已完成（八大页面、三视图与分页、分类/标签聚合、双向链接与反链）**；搜索、TOC、灯箱、评论、PWA 尚未开始。

常用命令：`npm run build`、`npm run dev`、`npm run check:docs`、`npm run check:contrast`、`npm run check:i18n`（后者需先 build）。受限环境跑构建需 `ASTRO_TELEMETRY_DISABLED=1`。

## 阅读顺序

1. 本文件（地图）
2. [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md)（领域与权威文档）
3. 按下方"任务 → 文档"补读，**不要**为了保险通读全部文档

## 任务 → 先读哪份

| 任务 | 文档 |
| --- | --- |
| 确认某功能是否该做 | [需求清单](docs/product/requirements.md) —— 唯一需求来源 |
| 加页面、改 URL、做语言切换 | [信息架构](docs/product/information-architecture.md) → [路由与 i18n](docs/architecture/routing-and-i18n.md) |
| 写页面/组件/样式/脚本 | [前端架构](docs/architecture/frontend-architecture.md) → [编码规范](docs/engineering/coding-standards.md) |
| 改颜色、字号、间距 | [设计系统](docs/design/design-system.md)（唯一数值来源） |
| 改正文排版、字体 | [字体与排版](docs/design/typography.md) |
| 做浮层、动效、键盘交互 | [交互准则](docs/design/interaction-guidelines.md) |
| 加/改内容类型、frontmatter | [数据模型](docs/architecture/data-models.md) → [内容架构](docs/architecture/content-architecture.md) |
| 接评论、统计、PWA、搜索 | [集成索引](docs/integrations/index.md) |
| 改构建、部署、`base`、域名 | [部署架构](docs/architecture/deployment-architecture.md) → [构建与部署](docs/engineering/build-and-deployment.md) |
| 加依赖 | [依赖策略](docs/engineering/dependency-policy.md)（必须登记） |
| 涉及个人信息、密钥、外链 | [隐私规范](docs/security/privacy.md) → [安全基线](docs/security/security-baseline.md) |
| 判断"做完了吗" | [测试策略](docs/engineering/testing-strategy.md) |
| 知道下一步做什么 | [路线图](plans/active/000-initial-implementation-roadmap.md) |
| 想知道什么还没定 | [风险与待验证](docs/risks-and-validation.md) |
| 查官方事实 | [参考资料](docs/references/index.md) |
| 想改架构/换服务/推翻旧决定 | 先读 [决策记录](docs/decisions/index.md)，再写新 ADR |

## 状态标记

`Confirmed` 用户已确认，可实现 ｜ `Proposed` 提议，落地前需确认 ｜ `Needs Validation` 需证据 ｜ `Deprecated` 已废弃，必须移除。
文档与条目都带这四种状态。**`Proposed` 不等于 `Confirmed`**。

## 硬规则

- **需求只信** [requirements.md](docs/product/requirements.md)。不得增删需求语义；改需求必须先获用户确认。
- **不得编造事实**：API、参数名、服务额度、平台限制一律先查 [参考资料](docs/references/index.md) 或官方文档，并把结论与核验日期写回该目录。查不到就标 `Needs Validation`。
- **不得擅自改变**：简约文艺/黑白灰/杂志编辑式排版/三态主题的视觉方向；独立语言文章策略；零前端框架。
- **条件性功能不得写成必做**：浏览量、点赞必须经免费方案验证；不满足则完全不实现，不留按钮/UI/接口/字段/占位。
- **禁止伪造数据**：不使用假浏览量、假点赞、假翻译链接。
- 不写入真实姓名、学校、班级、住址、私人联系方式；不编造个人资料。
- 站内链接一律用相对路径或框架的基路径能力，禁止手写 `/` 开头的绝对路径。

## 文档维护（与代码同批提交）

改动需求、架构、数据模型、技术选型、目录结构时，**同一次提交**内更新对应文档；改完跑：

```
node scripts/check-docs.mjs
```

会检查相对链接是否可达、文档头四行是否齐备、AGENTS.md 是否超过 100 行。CI（`.github/workflows/docs-check.yml`）也会跑。
新发现的问题登记到 [技术债](plans/tech-debt.md)，不要只在对话里说。

## 当前起点

1. URL 策略（全前缀 + 尾斜杠 always）、`base=/personal-blog`、站点名（The Commons）均已定案，见 [ADR-0008](docs/decisions/0008-url-strategy.md) 与 `src/config/site.ts`；不得擅自改动。
2. 从 [路线图](plans/active/000-initial-implementation-roadmap.md) 的 Phase 6 开始；不得跳阶段。
3. 写文章：`src/content/blog/{zh-CN|zh-TW|en|ja}/<slug>.md`，字段见 [数据模型](docs/architecture/data-models.md)；构建期会自动校验语言目录、`translationKey` 与内部链接。
3. `FOR_AGENT.md`（本地任务书）不入库，已在 `.gitignore` 排除；不要引用或推送它。
