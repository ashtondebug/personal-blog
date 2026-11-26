# 编码规范

> **用途**：实现阶段必须遵守的代码约定。写任何页面、组件、脚本、样式前必读。
> **状态**：Proposed（可在实现阶段调整，但调整需修改本文并说明理由）
> **更新**：2026-11-26
> **相关**：[工程索引](./index.md) · [项目结构](./project-structure.md) · [前端架构](../architecture/frontend-architecture.md) · [依赖策略](./dependency-policy.md) · [ADR-0006](../decisions/0006-no-default-ui-framework.md)

## 1. TypeScript

- 开启 `strict`；禁止 `any`（确实无类型时用 `unknown` + 收窄）。
- 导出的类型与函数必须有明确返回类型（组件除外）。
- 内容集合类型从 schema 推导（`CollectionEntry<'blog'>` 之类），不手写重复接口。
- 不用 `// @ts-ignore`；确需忽略时用 `// @ts-expect-error` 并写明原因。

## 2. 组件与文件

| 规则 | 说明 |
| --- | --- |
| 组件用 `.astro` | 除非明确需要客户端 JS 逻辑（此时逻辑放 `src/scripts/`） |
| 一文件一主组件 | 文件名与组件名一致（PascalCase） |
| 页面薄、组件厚 | 页面只做数据获取与布局拼装（[前端架构](../architecture/frontend-architecture.md)） |
| 不写内联样式对象 | 用 class + token；只有一次性动态值（如进度百分比）可用 CSS 变量注入 |
| 导入顺序 | 类型 → 框架/运行时 → 本地模块 → 样式；组内按字母序 |

## 3. 样式

- **只消费设计 token**：颜色、字号、间距、圆角、时长一律引用 CSS 自定义属性，禁止魔法数字（[设计系统](../design/design-system.md)）。
- 类名用轻量语义命名（如 `post-card__meta`），**不引入 utility 框架**。
- 组件样式默认 `scoped`；全局样式只出现在 `src/styles/` 的 token/reset/typography 层。
- 媒体查询只用既定断点。
- 禁止 `!important`（除非覆盖第三方组件，需注释原因）。

## 4. 国际化与文案

- **所有可见文案走词典键**，禁止在模板里硬编码中文/英文。
- 词典按语言分文件，键名语义化（`nav.blog`、`empty.search.title`）。
- 日期、数字、复数按语言格式化，不手写拼接。
- 语言映射（含 Waline 的 `ja → jp`）集中在一处定义。

## 5. 路径与 URL

- 站内链接必须由 i18n 工具或基路径生成（[路由与 i18n](../architecture/routing-and-i18n.md)）。
- 禁止手写以 `/` 开头的绝对路径（`base` 变更即 404）。
- 外链必须带 `rel="noopener noreferrer"`。

## 6. 客户端脚本

- 原生 ES Module + TypeScript；单一职责；幂等初始化。
- 不挂全局变量；状态只经 `localStorage`（前缀 `blog:`）。
- 必须处理"元素不存在"的情况（同一脚本可能被多个页面复用）。
- 事件监听在元素移除时清理（视图过渡场景）。

## 7. 注释与可读性

- 注释解释**为什么**，不复述代码在做什么。
- 遇到非显然的取舍（性能 vs 简洁、浏览器兼容绕行）必须留一行注释指向相关 ADR 或文档。
- 禁止提交被注释掉的旧代码。

## 8. 提交

- 一次提交一件事；提交信息使用 `type(scope): 说明`（如 `feat(blog): 增加三种列表视图`）。
- 内容变更与代码变更分开提交，便于回溯。
- 不提交密钥、`.env`、构建产物、编辑器个人配置（见 `.gitignore`）。

## 9. 质量门槛（提交前）

1. 类型检查与构建通过。
2. 没有新增 `any`、没有新增魔法数字。
3. 新增文案已在四种语言词典中补齐（或显式标注待补，且构建不显示空串）。
4. 相关文档已同步（[AGENTS.md](../../AGENTS.md)）。
