# ADR-0009：引入 `@astrojs/markdown-remark` 以支持自定义 Markdown 插件

> **用途**：说明为什么在 Astro 7 默认 Sätteri 处理器之外，还要装回 unified/remark 管线。改 Markdown 处理方式前必读。
> **状态**：Confirmed（2026-11-26，Phase 5 实施时定案）
> **更新**：2026-11-26
> **相关**：[决策索引](./index.md) · [内容架构](../architecture/content-architecture.md) · [依赖策略](../engineering/dependency-policy.md) · [Astro 参考](../references/astro.md)

## 背景

需求要求 Knowledge 支持**双向链接**（REQ-CONTENT-05）。选定的写作语法是 `[[目标]]` / `[[目标|显示文本]]`，需要在 Markdown 编译阶段把文本节点替换成链接节点。

Astro 7 起默认 Markdown 处理器改为 **Sätteri**，`markdown.remarkPlugins` / `rehypePlugins` / `remarkRehype` 这类配置会要求安装 `@astrojs/markdown-remark`（官方包），否则构建直接报错。这是实际构建时遇到的错误，不是猜测。

## 决策

安装 **`@astrojs/markdown-remark`（^7.3.0，devDependency，构建期）**，并在 `astro.config.mjs` 的 `markdown.remarkPlugins` 中挂载自写的 `remarkWikiLinks`。

## 备选方案

| 方案 | 为什么没选 |
| --- | --- |
| 让作者写标准相对链接 `[目标](../目标/)` | 放弃语法糖、写作体验差；且"双向链接"更像普通内链，仍需自写反链解析 |
| 在页面渲染后再用字符串替换 HTML | 脆弱：会误伤代码块里的 `[[...]]`，也会破坏已生成的属性 |
| 自写 Sätteri 插件 | API 未公开验证，不能凭猜测实现（违反"不编造 API"） |
| 不实现双向链接 | 违背已确认需求 |

## 选择原因

1. **官方包、构建期依赖**：不进入客户端产物，符合 [ADR-0006](./0006-no-default-ui-framework.md) 的"客户端零框架"。
2. **一次投资、多处受益**：后续数学公式（TD-23）同样需要 remark/rehype 管线，不必再装第二套。
3. **控制面小**：只在 `markdown` 配置里加一个插件数组。

## 影响

- 构建多一个 devDependency；`package-lock.json` 更新。
- Markdown 渲染从 Sätteri 切到 unified/remark 管线：代码高亮仍由 Shiki 提供，但**行为细节可能与 Sätteri 不同**，升级 Astro 时需复核。
- 插件只处理文本节点中的 `[[...]]`，不碰代码块；悬空目标由 `assertKnowledgeLinks` 在构建期拦截（双保险）。
- 已在 [依赖策略](../engineering/dependency-policy.md) 的登记表登记。
