# 前端架构

> **用途**：规定页面、组件、样式与客户端脚本的组织方式，尤其是"不引入前端框架"时如何仍然做出有交互的站点。动手写页面/组件前必读。
> **状态**：Confirmed（零框架、纯静态）+ Proposed（目录与技术细节）
> **更新**：2026-11-26
> **相关**：[系统总览](./system-overview.md) · [路由与 i18n](./routing-and-i18n.md) · [设计系统](../design/design-system.md) · [编码规范](../engineering/coding-standards.md) · [ADR-0006](../decisions/0006-no-default-ui-framework.md)

## 1. 总原则：静态优先，渐进增强

- 页面由 `.astro` 组件构成，**在构建期渲染成 HTML**，产物中没有框架运行时。
- 内容与导航在**禁用 JS 的情况下完全可用**：文章可读、列表可翻页、链接可点。
- 交互用原生 ES Module（TypeScript 编译）实现，按需加载、按页加载。
- 任何"客户端组件"只有在**确实需要状态**时才存在；能用 CSS 表达的交互（悬停、展开、焦点）不写 JS。

## 2. 分层

| 层 | 位置（规划） | 职责 | 禁止 |
| --- | --- | --- | --- |
| 页面 | `src/pages/[locale]/**` | 路由入口、取数据、拼布局 | 写复杂 DOM 结构、写样式细节 |
| 布局 | `src/layouts/` | `<html>` 骨架、meta、导航/页脚、插槽 | 承担业务数据查询 |
| 区块组件 | `src/components/blocks/` | 列表、卡片、TOC、评论、灯箱等组合件 | 直接读全局内容集合 |
| 基础组件 | `src/components/ui/` | 按钮、标签、分页、空状态等原子件 | 依赖具体页面语义 |
| 客户端脚本 | `src/scripts/` | 主题、搜索、灯箱、播放器、进度 | 直接操作其他脚本的内部状态 |
| 样式 | `src/styles/` | token、reset、排版、工具类 | 写死颜色/字号数值 |

数据获取只发生在**页面层**（`getCollection` 等），区块组件通过 props 接收已准备好的数据。这样组件可复用、可测试、不产生隐式耦合。

## 3. 客户端交互清单（全部为独立小脚本）

| 脚本 | 触发 | 依赖顺序 | 降级行为 |
| --- | --- | --- | --- |
| 主题初始化 | `<head>` 内联、阻塞极短 | 无 | 未执行则用 CSS 默认浅色 |
| 主题切换 UI | 页面加载后 | 主题初始化 | 无 JS 时保持 CSS 默认主题 |
| 搜索浮层 | 点击图标 / `/` | 搜索索引加载 | 无 JS 时 `/search/` 页面仍可用 |
| 灯箱 | 点击缩略图 | 无 | 无 JS 时直接打开原图链接 |
| 阅读进度 | 滚动 | 无 | 无 JS 时不显示 |
| 音乐播放器 | 用户点击播放 | 音频资源 | 无 JS 时不出现控件 |
| 视图切换 | 点击切换器 | 无 | 无 JS 时固定默认视图 |
| TOC 高亮 | 滚动（IntersectionObserver） | 无 | 无 JS 时 TOC 仍可点击跳转 |

约定：

- 每个脚本**单一职责**、幂等、可重复初始化（Astro 的视图过渡会重复触发页面脚本时，必须用 `astro:page-load` 之类的生命周期或幂等守卫）。
- 脚本体积目标：单个 ≤ 6 KB（gzip，Proposed，未实测）。
- 共享状态只经 `localStorage`，键名统一前缀 `blog:`（如 `blog:theme`、`blog:view`）。跨脚本通信不通过全局变量。

## 4. 样式落地

- 用 **CSS 自定义属性承载设计 token**（唯一数值来源：[设计系统](../design/design-system.md)），组件样式只消费 token。
- 全局层：`reset/normalize` → `tokens` → `typography` → `layout`；组件层用 Astro 的 scoped style。
- 允许 SCSS（需求已列出），但**不引入 CSS-in-JS**，也不默认引入 utility 框架；若未来引入需走 [依赖策略](../engineering/dependency-policy.md) 与 ADR。
- 媒体查询集中在设计系统的断点上；禁止在组件里临时发明断点。
- 与 JS 的状态联动通过 `html[data-theme="dark"]` 这类**属性选择器**，而不是内联样式。

## 5. `base` 路径与资源引用

GitHub Pages 项目页发布在 `/<repo>/` 下，配置 `base` 后**所有站内链接与资源都必须带前缀**（官方文档明确要求）。因此：

- 站内链接统一由 i18n 工具函数或基路径常量生成，**禁止手写以 `/` 开头的绝对路径**。
- 静态资源引用走构建器（`import` 资源）或显式拼接基路径。
- 该规则同样是 Waline `path`、PWA `start_url`、搜索索引资源路径的前提。

## 6. 性能与体积预算（Proposed，待实测校准）

| 指标 | 目标 |
| --- | --- |
| 首屏自有 JS | ≤ 30 KB（gzip） |
| 单篇文章页面 JS | ≤ 20 KB（不含搜索索引按需加载） |
| 搜索索引 | 按语言拆分，单语言 ≤ 500 KB（Proposed） |
| 字体 | 见 [排版](../design/typography.md)；中文全量字体不可接受 |
| LCP | ≤ 2.5 s（4G 移动端基线，`Needs Validation`：需真实测量后定稿） |

任何超标都要在 [技术债](../../plans/tech-debt.md) 登记，不允许"先上线再说"。
