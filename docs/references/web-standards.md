# Web 标准参考资料

> **用途**：PWA、主题、无障碍相关的标准层依据。只写标准层面稳定的结论，不写浏览器版本号。
> **状态**：◐ 部分核验（清单见下）；实现前按官方链接复核细节
> **更新**：2026-11-26
> **相关**：[资料索引](./index.md) · [PWA](../integrations/pwa.md) · [配色与主题](../design/color-and-theme.md) · [交互准则](../design/interaction-guidelines.md) · [安全基线](../security/security-baseline.md)

## 1. 官方链接

| 主题 | 链接 |
| --- | --- |
| Web App Manifest | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest |
| 让 PWA 可安装 | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable |
| Service Worker API | https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API |
| 安全上下文 | https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts |
| `prefers-color-scheme` | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme |
| `color-scheme` | https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme |
| `prefers-reduced-motion` | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ |
| Manifest 规范（W3C） | https://www.w3.org/TR/appmanifest/ |

## 2. Manifest

| 结论 | 置信度 |
| --- | --- |
| 通过 HTML `<link rel="manifest" href="...">` 关联 | ◐ |
| 常用成员：`name`、`short_name`、`start_url`、`display`、`theme_color`、`background_color`、`icons` | ✅ |
| 还有其他成员（如 `scope`、`description`、`orientation`、`id`），按需使用 | ◐ |
| `icons` 需提供多个尺寸（常见 192 与 512），可声明 `purpose` 为 `maskable` | ◐ |
| Manifest 中的相对 URL 相对于 manifest 文件位置解析（**`base` 场景下需注意**） | ◐ 待复核 |

## 3. Service Worker

| 结论 | 置信度 |
| --- | --- |
| 必须在**安全上下文**注册（HTTPS 或 localhost） | ✅ |
| 由页面脚本调用注册，作用域受脚本路径限制 | ◐ |
| 可拦截同源请求并实现缓存策略 | ✅ |
| 更新在后台下载，新版本在旧版本无客户端时才完全接管（`skipWaiting`/`clients.claim` 可改变行为） | ◐ |
| 生命周期事件：`install`、`activate`、`fetch` | ✅ |

## 4. 主题

| 结论 | 置信度 |
| --- | --- |
| `@media (prefers-color-scheme: dark)` 响应系统深色偏好 | ✅ |
| `color-scheme` 属性声明控件配色方案（如 `color-scheme: light dark`） | ✅ |
| 系统偏好变化可通过 `matchMedia('(prefers-color-scheme: dark)')` 的 change 事件感知 | ◐ |
| 首屏避免主题闪烁需要"在渲染前决定主题"（内联脚本），属工程手法而非标准 | ◐ |

## 5. 无障碍（WCAG 2.2 相关）

| 结论 | 置信度 |
| --- | --- |
| 正文文本对比度要求 4.5:1（大文本 3:1） | ✅ |
| 所有功能需可用键盘操作，焦点可见 | ✅ |
| 触控目标最小尺寸建议 24×24（WCAG 2.2 AA），实践上常用 44×44 | ◐ |
| 动画需响应 `prefers-reduced-motion`，避免前庭不适 | ◐ |
| 图片需有等价替代文本（`alt`），装饰图用空 `alt` | ✅ |

## 6. 待复核清单（实现前逐项确认）

- [ ] Manifest 成员的确切语义与必填性（尤其 `id`、`scope`）。
- [ ] Manifest 内相对 URL 的解析基准（影响 `base` 下的图标与 `start_url`）。
- [ ] Service Worker 更新与 `skipWaiting` 的推荐组合（避免旧内容长期缓存）。
- [ ] 自定义域名迁移后旧 SW 作用域的自注销手段。
- [ ] WCAG 2.2 新增条款中与本项目相关的部分（如焦点不被遮挡）。
