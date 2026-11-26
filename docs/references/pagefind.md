# Pagefind 参考资料

> **用途**：搜索方案的外部事实依据（CLI、浏览器 API、索引行为）。改搜索实现前核对这里。
> **状态**：✅ 已核验（2026-11-26，v1.6.0）
> **更新**：2026-11-26
> **相关**：[资料索引](./index.md) · [搜索集成](../integrations/search.md) · [依赖策略](../engineering/dependency-policy.md) · [Phase 6 报告](../../plans/completed/006-phase-6-search-reading.md)

## 1. 官方链接

| 主题 | 链接 |
| --- | --- |
| 文档首页 | https://pagefind.app/ |
| 运行索引（CLI 用法） | https://pagefind.app/docs/running-pagefind/ |
| CLI 配置项 | https://pagefind.app/docs/config-options/ |
| 索引内容控制（`data-pagefind-body` 等） | https://pagefind.app/docs/indexing/ |
| 浏览器端配置 | https://pagefind.app/docs/search-config/ |
| JS 搜索 API | https://pagefind.app/docs/api/ |
| 多语言 | https://pagefind.app/docs/multilingual/ |

## 2. CLI（已核验）

| 结论 | 置信度 |
| --- | --- |
| 必需参数 `--site <PATH>`（`PAGEFIND_SITE`） | ✅ |
| `--output-subdir <DIR>`：索引输出子目录（默认 `pagefind`） | ✅ |
| `--glob <GLOB>`：发现 HTML 的 glob，默认 `**/*.{html}` | ✅ |
| `--force-language <LANG>`：强制单语言索引（ISO 639-1） | ✅ |
| `--root-selector` / `--exclude-selectors`：限定索引根元素 / 排除选择器 | ✅ |
| `--keep-index-url`：保留 `index.html` 结尾 | ✅ |
| **没有 `--base-url` 选项**：子路径部署由浏览器端 `baseUrl` 处理 | ✅ |

## 3. 浏览器 API（已核验）

| 结论 | 置信度 |
| --- | --- |
| 初始化：`const pagefind = await import("/pagefind/pagefind.js")`，子路径部署需带上 base | ✅ |
| 配置：`await pagefind.options({ baseUrl, bundlePath, excerptLength, ... })`；子路径必须给 `baseUrl` | ✅ |
| `await pagefind.search(term)` → `{ results: [{ id, data: async () => ({ url, excerpt, plain_excerpt, meta, sub_results }) }] }` | ✅ |
| `pagefind.debouncedSearch(term)`：内置防抖；有更新的输入时返回 `null` | ✅ |
| `data().url` 已按 `baseUrl` 前置 base | ✅ |
| `excerpt` 中的 HTML 实体已转义、含 `<mark>`，可直接作为 `innerHTML` | ✅ |
| `pagefind.init()` 可选；也可在搜索前自动初始化 | ✅ |
| 结果 id 前缀与 `<html lang>` 对应；多语言站点按语言分索引 | ✅ |

## 4. 索引控制（已核验 + 本项目实测）

| 结论 | 置信度 |
| --- | --- |
| `data-pagefind-body`：只索引该元素内内容，标题取其中第一个 `h1` | ✅ |
| `data-pagefind-ignore`：整个页面或元素被排除 | ✅ |
| 若站点**没有任何可索引页面**，CLI 会以「Pagefind was not able to build an index」失败退出 | ✅（本项目实测） |
| 只有一个语言的 `<html lang>` 时，索引按该语言归类；本项目为 `zh-cn` / `zh-tw` / `en` / `ja` | ✅（本项目实测 entry 文件） |

## 5. 本项目的取舍

- 只索引**内容详情页**（blog / knowledge / projects / moments / gallery）与 About 页；列表与聚合页加 `data-pagefind-ignore`，避免同一内容在搜索结果里出现两次。
- 索引保持**单一 bundle**，查询时在客户端按 `url` 前缀过滤当前语言（简单可靠；代价是首次搜索会拉取多语言元数据，已登记为 TD-27）。
- 因为 About 始终存在，即使站点零文章也能成功生成索引。

## 6. 待复核

- Pagefind 大版本升级后 CLI 参数与 `data().url` 语义。
- 是否需要改用 `.pf_meta` 预取或按语言拆分 bundle 以优化首搜速度。
- `--force-language` 与 `baseUrl` 组合的边界行为。
