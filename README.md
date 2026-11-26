# The Commons

一个**简约文艺风格的多语言个人门户型博客**：文字与摄影为主，静态生成，长期可维护。

仓库：<https://github.com/ashtondebug/personal-blog> · 线上地址：<https://ashtondebug.github.io/personal-blog/>

- 内容方向：Tech（技术）· Life（生活）· Knowledge（知识）· Thought（思考）
- 页面：Home · Blog · Projects · Knowledge · About · Gallery · Moments · Guestbook
- 语言：简体中文 `zh-CN` · 繁體中文 `zh-TW` · English `en` · 日本語 `ja`
- 技术栈：Astro · TypeScript · Markdown/MDX · Content Collections · Waline（评论）· GitHub Actions · GitHub Pages

## 当前状态

**Phase 6：搜索与阅读（已完成）**——Pagefind 构建后索引 + 搜索浮层（`/` 呼出、`Esc` 关闭，结果只含当前语言）、文章 TOC、阅读进度、复制链接分享；搜索索引由 `npm run build` 自动生成。

此前已完成：八大页面、三视图与分页、分类/标签聚合、双向链接与反链、设计系统与三态主题、四语言元信息与 404。**尚未开始**：灯箱、年度热力图、时间轴、音乐播放器、评论、PWA、统计。

写文章：在 `src/content/blog/<语言>/<slug>.md` 新建文件，字段见 [数据模型](docs/architecture/data-models.md)。

## 常用命令

```bash
npm install             # 安装依赖（lockfile 已入库，CI 用 npm ci）
npm run dev             # 本地开发
npm run build           # 构建到 dist/
npm run preview         # 预览构建产物
npm run check:docs      # 文档链接与结构检查（CI 也会跑）
npm run check:contrast  # 设计 token 对比度检查（CI 也会跑）
npm run check:i18n      # 构建产物的 lang/canonical/hreflang 校验（需先 build，CI 也会跑）
```

构建注意：若在受限环境（如沙箱）运行，Astro 会尝试写用户目录的遥测配置，可设环境变量 `ASTRO_TELEMETRY_DISABLED=1`。

## 从这里开始读

| 你想了解 | 读 |
| --- | --- |
| 项目是什么、做到什么程度算成功 | [docs/product/product-overview.md](docs/product/product-overview.md) |
| 有哪些需求、哪些还没定 | [docs/product/requirements.md](docs/product/requirements.md) |
| 系统怎么分层、什么能静态生成 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 每个领域的权威文档在哪 | [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md) |
| 为什么做这些技术选择 | [docs/decisions/index.md](docs/decisions/index.md) |
| 下一步做什么 | [plans/active/000-initial-implementation-roadmap.md](plans/active/000-initial-implementation-roadmap.md) |

给 AI Agent 的入口是 [AGENTS.md](AGENTS.md)（地图式导航，不复制需求）。

## 仓库结构

```text
AGENTS.md            Agent 入口地图
ARCHITECTURE.md      架构总地图
README.md            本文件（人类入口）
astro.config.mjs     站点配置（site / base / i18n / trailingSlash）
tsconfig.json        TypeScript 严格模式配置
docs/                项目知识库（产品/设计/架构/工程/集成/安全/决策/参考资料）
plans/               路线图、技术债与已完成计划
scripts/             文档检查、对比度检查、i18n 产物检查
src/
  config/            站点常量与导航配置（站名唯一定义处）
  content/           五个内容集合（按语言分目录；.gitkeep 保持目录入库）
  content.config.ts  集合定义与 zod schema
  i18n/              语言定义、UI 词典、带 base 的路径工具
  lib/               内容派生函数、构建期内容门禁、日期格式化、分页与 URL 归一、wiki 链接插件
  styles/            设计 token、reset、排版基线、正文排版
  scripts/           客户端交互脚本（主题、Blog 视图切换）
  components/        layout（Header/Footer）、ui（语言/主题切换、分页）、blog（列表/视图切换/TOC/进度/分享）、search（搜索浮层）
  layouts/           页面骨架
  pages/             路由（[locale] 展开四语言 + 根重定向 + 404）
.github/workflows/   文档与设计检查 CI + Pages 部署
```

## 约定

- **仓库是唯一事实来源**：需求、决策、字段定义、设计数值都写在仓库里，不依赖聊天记录。
- 文档带状态标记：`Confirmed`（已确认）· `Proposed`（提议）· `Needs Validation`（待验证）· `Deprecated`（已废弃）。
- 改代码必须同批更新文档；改需求必须先获得作者确认。
- 站点不公开真实姓名、学校、班级、住址与私人联系方式（[隐私规范](docs/security/privacy.md)）。

## 尚未确定

Waline 服务端选型、浏览量方案与点赞是否启用、搜索方案、中文字体是否自托管子集化。完整清单见 [docs/risks-and-validation.md](docs/risks-and-validation.md)。

## 许可

尚未确定（`Needs Validation`）。在明确之前，默认保留所有权利，不视为开源许可。
