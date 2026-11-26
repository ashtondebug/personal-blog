# 设计索引

> **用途**：设计板块入口。做页面、改样式、评估视觉一致性时从这里进入。
> **状态**：Confirmed（风格方向）+ Proposed（全部具体数值）
> **更新**：2026-11-26
> **相关**：[设计原则](./design-principles.md) · [设计系统](./design-system.md) · [字体与排版](./typography.md) · [配色与主题](./color-and-theme.md) · [交互准则](./interaction-guidelines.md) · [文档地图](../PROJECT_MAP.md)

## 1. 五份文档的分工

| 文档 | 回答什么问题 | 谁需要读 |
| --- | --- | --- |
| [设计原则](./design-principles.md) | 为什么这样设计？争议怎么裁？ | 所有做界面的人，动手前 |
| [设计系统](./design-system.md) | 字号、间距、断点、圆角、层级的**具体数值** | 写样式的人（唯一数值来源） |
| [字体与排版](./typography.md) | 用什么字体、怎么处理中英混排与标点 | 排版与正文样式 |
| [配色与主题](./color-and-theme.md) | 黑白灰的具体灰阶、三态主题怎么落地 | 主题、对比度、Waline 深色适配 |
| [交互准则](./interaction-guidelines.md) | 动效、焦点、键盘、降级、空状态 | 写交互脚本的人 |

## 2. 三条规则

1. **数值只改 `design-system.md`**：任何组件里出现的字号、间距、颜色都必须来自 token；要改数值就改那张表，并同步 color-and-theme。
2. **方向不可擅改**：简约文艺、黑白灰、杂志编辑式排版、三态主题是用户确认项（[需求 §7](../product/requirements.md)）。Agent 可以在数值层提议，不得更换风格方向。
3. **可访问性是硬门槛**：对比度、焦点可见、触控目标不达标即为缺陷，不是"后续优化"（[设计系统 §7](./design-system.md)）。

## 3. 与其他板块的接口

- 需求边界：[需求清单](../product/requirements.md)
- 页面结构：[信息架构](../product/information-architecture.md)
- 组件如何落地：[前端架构](../architecture/frontend-architecture.md)
- 交互的可测试性：[测试策略](../engineering/testing-strategy.md)
