# 设计系统（Token 与组件契约）

> **用途**：给出可测量的设计决策（token 命名、刻度、断点、组件清单），让不同阶段的实现保持一致。**本文件是设计数值的唯一来源。**
> **状态**：Confirmed（已落地为 `src/styles/tokens.css`；数值可随设计演进调整，但须保持对比度门槛并同步本文）
> **更新**：2026-11-26
> **相关**：[设计原则](./design-principles.md) · [字体与排版](./typography.md) · [配色与主题](./color-and-theme.md) · [交互准则](./interaction-guidelines.md) · [前端架构](../architecture/frontend-architecture.md)

## 1. Token 命名约定

**实现位置**：`src/styles/tokens.css`（全站唯一数值来源）。组件只引用变量，不得写死数值；改数值改这一个文件，并跑 `npm run check:contrast`。

CSS 自定义属性，语义优先于外观：

```text
--color-{role}         背景/前景/线/文字角色，不写具体颜色名
--text-{step}          字号阶梯
--leading-{step}       行高
--tracking-{step}      字距
--space-{n}            间距刻度
--radius-{n}           圆角
--line-{n}             线宽
--dur-{n} / --ease-*   动效时长与曲线
--z-{layer}            层级
--measure-*            行长
```

规则：组件只消费 token，不写死数值；新增 token 必须同时给出浅色/深色两套值（见 [配色与主题](./color-and-theme.md)）。

## 2. 间距刻度（4px 基准）

| Token | 值 | 典型用途 |
| --- | --- | --- |
| `--space-1` | 4px | 图标与文字间隙 |
| `--space-2` | 8px | 紧凑内边距 |
| `--space-3` | 12px | 列表项内边距 |
| `--space-4` | 16px | 移动端页边距 |
| `--space-6` | 24px | 段落间距 |
| `--space-8` | 32px | 区块间距（移动端） |
| `--space-12` | 48px | 区块间距（桌面端） |
| `--space-16` | 64px | 大区块分隔 |
| `--space-24` | 96px | 章节级留白 |
| `--space-32` | 128px | 首屏留白 |

## 3. 字号阶梯

移动端取小值、桌面端取大值（`clamp()` 表达）。具体字体族见 [字体与排版](./typography.md)。

| Token | 移动端 | 桌面端 | 用途 |
| --- | --- | --- | --- |
| `--text-xs` | 12px | 12px | 元信息、标签 |
| `--text-sm` | 13px | 14px | 辅助文字、页脚 |
| `--text-base` | 16px | 17px | 正文 |
| `--text-lg` | 18px | 20px | 导语、引用 |
| `--text-xl` | 22px | 26px | 小节标题 |
| `--text-2xl` | 28px | 34px | 板块标题 |
| `--text-3xl` | 34px | 44px | 文章标题 |
| `--text-4xl` | 40px | 60px | 首页主视觉标题 |

行高：正文 1.8（中文）/1.7（英文）；标题 1.15–1.3；元信息 1.4。

## 3.1 首页主视觉专用 token（ADR-0011）

以下 5 个 token **只允许在首页主视觉与首页章节标记中使用**，其余页面保持灰阶：

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-accent` | `#22d3ee` | 首页强调色（标签底、主 CTA、章节竖条、链接悬停下划线） |
| `--color-accent-ink` | `#041018` | 强调色上的文字 |
| `--color-hero-bg` | `#0e1116` | 主视觉底色 |
| `--color-hero-text` | `#f2f4f7` | 主视觉正文 |
| `--color-hero-muted` | `#a9b4c2` | 主视觉次要文字 |

对比度由 `npm run check:contrast` 单独成组校验（不随明暗主题变化）：文字 17.16:1、次要文字 9.00:1、强调色上文字 10.64:1、强调色对底色 10.46:1。

> 想把这些颜色用到内页 = 改需求，必须先写新 ADR 并获得作者确认。

## 4. 布局与断点

| 断点 | 宽度 | 行为 |
| --- | --- | --- |
| `sm` | < 640px | 单列；导航收起为抽屉；页边距 16px |
| `md` | 640–899px | 单列加宽；杂志视图退化为两列 |
| `lg` | 900–1199px | 出现侧栏（TOC）；导航横向展开 |
| `xl` | ≥ 1200px | 正文居中最大宽度 + 侧栏；页边距 32px |

正文最大行长：`--measure-prose` = 68ch（英文）/ 36em 级（中文）`[Proposed]`。全站最大内容宽度 `1200px`，阅读区 `72ch` 上限。

## 5. 其他 token

| 类别 | Token | 值 |
| --- | --- | --- |
| 圆角 | `--radius-sm / md / lg` | 2px / 4px / 8px（简约文艺倾向小圆角，不用胶囊形按钮） |
| 线宽 | `--line-hair` / `--line-bold` | 1px / 2px |
| 动效 | `--dur-fast` / `--dur-base` / `--dur-slow` | 120ms / 200ms / 320ms |
| 曲线 | `--ease-standard` / `--ease-out` | `cubic-bezier(.2,0,0,1)` / `cubic-bezier(0,0,.2,1)` |
| 层级 | `--z-header` / `--z-overlay` / `--z-modal` / `--z-toast` | 100 / 200 / 300 / 400 |
| 图标 | 线宽 | 1.25px 线性图标，24×24 视框，与文字同色 |

禁止出现：模糊阴影堆叠（>1 层）、渐变背景、超过 8px 的圆角（除非图片容器）。

## 6. 组件契约（仅清单，本阶段不实现）

第二阶段将按此清单建立组件；此处只约定职责与状态，避免过度设计。

| 组件 | 职责 | 必须支持的状态 |
| --- | --- | --- |
| Header / Nav | 主导航、语言切换、主题切换、搜索入口 | 默认 / 滚动收缩 / 移动抽屉打开 |
| Footer | 站点信息、板块入口、Guestbook | — |
| ThemeToggle | 三态切换 | light / dark / system |
| LanguageSwitcher | 语言切换 | 有该语言版本 / 无版本（禁用+提示） |
| SearchOverlay | 搜索浮层与结果 | 空 / 加载 / 有结果 / 无结果 / 错误 |
| PostCard | 文章条目 | 列表 / 网格 / 杂志三种变体 |
| ViewSwitcher | 列表视图切换 | 三态选中 |
| TOC | 目录与当前章节高亮 | 有 heading / 无 heading / 移动折叠 |
| ReadingProgress | 阅读进度条 | 显示 / 隐藏（短页面） |
| Prose | 正文排版容器 | 代码块 / 引用 / 表格 / 公式 / 图片 / 脚注 |
| GalleryGrid + Lightbox | 图集与灯箱 | 关闭 / 打开 / 首张 / 末张 |
| MomentsList | 动态流 | 文字 / 图片 / 视频 |
| HeatmapCalendar | 年度热力图 | 有数据 / 无数据 / 未来日期 |
| Timeline | 时间轴 | 按年分组 |
| MusicPlayer | 悬浮播放器 | 折叠 / 展开 / 播放 / 暂停 / 无曲目 |
| CommentSection | Waline 容器 | 加载 / 就绪 / 服务不可用（降级文案） |
| EmptyState | 空状态 | 无内容 / 搜索无结果 / 服务不可用 |
| Pagination | 分页 | 首页 / 中间页 / 末页 |

## 7. 无障碍硬指标

| 项 | 要求 |
| --- | --- |
| 正文对比度 | ≥ 4.5:1（浅色与深色主题都要测） |
| 大字/标题对比度 | ≥ 3:1 |
| 焦点可见 | 所有可交互元素有 ≥2px 可见焦点环，且不被 `outline:none` 抹掉 |
| 触控目标 | ≥ 44×44px |
| 动效 | 遵循 `prefers-reduced-motion`，关闭非必要过渡 |
| 语义 | 标题层级不跳级；灯箱/浮层为 dialog 语义并能 `Esc` 关闭 |
| 图片 | 全部 `alt`；纯装饰图 `alt=""` |

上述指标将在 [验收阶段](../../plans/active/000-initial-implementation-roadmap.md) 的 Phase 12 复核。
