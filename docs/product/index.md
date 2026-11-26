# 产品索引

> **用途**：产品板块入口。确认"要做什么、不做什么、做到什么程度"时从这里进入。
> **状态**：Confirmed（需求内容）+ Proposed / Needs Validation（待定项）
> **更新**：2026-11-26
> **相关**：[产品概览](./product-overview.md) · [需求清单](./requirements.md) · [信息架构](./information-architecture.md) · [功能规格](./feature-specifications.md) · [文档地图](../PROJECT_MAP.md)

## 1. 四份文档的分工

| 文档 | 回答的问题 | 何时读 |
| --- | --- | --- |
| [产品概览](./product-overview.md) | 这是个什么站点？给谁看？成功标准与非目标 | 第一次接触项目 |
| [需求清单](./requirements.md) | **有哪些需求，状态是什么**（唯一事实来源） | 任何功能开工前 |
| [信息架构](./information-architecture.md) | 页面层级、URL、导航、内容关系 | 加页面、改路由、做导航时 |
| [功能规格](./feature-specifications.md) | 每个功能的具体行为、边界、验收要点 | 实现某个具体功能时（按小节读） |

## 2. 状态图例

| 标记 | 含义 |
| --- | --- |
| ✅ `Confirmed` | 用户已确认，可以直接实现 |
| 🟡 `Proposed` | Agent 提议，落地前必须获确认 |
| 🔵 `Needs Validation` | 需要技术或政策验证后才能确定 |
| ⛔ `Deprecated` | 已废弃，不留 UI/接口/数据结构 |

## 3. 硬规则

1. **需求以 [需求清单](./requirements.md) 为唯一事实来源**；本文档与其他文档不得改变其语义。
2. 改需求必须先获**用户确认**，再更新需求清单，最后才动其他文档。Agent 不得自行增删需求。
3. **条件性功能不得写成必做**：浏览量、点赞都带前置条件（[需求 §6](./requirements.md)）。
4. 建议与需求分开写：任何 `Proposed` 项都不是用户已同意的事。

## 4. 交叉引用

- 视觉与交互约束：[设计板块](../design/index.md)
- 实现方式：[架构板块](../architecture/index.md)
- 执行计划：[路线图](../../plans/active/000-initial-implementation-roadmap.md)
- 未定事项汇总：[风险与待验证](../risks-and-validation.md)
