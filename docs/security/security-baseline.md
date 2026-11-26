# 安全基线

> **用途**：站点与仓库的最小安全要求。改构建、加脚本、加外链、配服务时对照本文。
> **状态**：Confirmed（HTTPS、无密钥泄露、依赖检查）+ Proposed（具体措施）+ Needs Validation（CSP、环境变量前缀）
> **更新**：2026-11-26
> **相关**：[安全索引](./index.md) · [隐私规范](./privacy.md) · [依赖策略](../engineering/dependency-policy.md) · [Waline](../integrations/waline.md) · [部署架构](../architecture/deployment-architecture.md)

## 1. 传输与托管

- 全站 HTTPS：`*.github.io` 默认提供；自定义域名需在 Pages 设置中启用 HTTPS（并等待证书签发）。
- 不引入 HTTP 资源（混合内容会被浏览器拦截）。
- 外部链接：`rel="noopener noreferrer"`；需要新窗口时同时提示用户（[交互准则](../design/interaction-guidelines.md)）。

## 2. 密钥与配置

| 规则 | 说明 |
| --- | --- |
| 前端无密钥 | 静态站的"前端"就是公开产物，任何进入构建产物或 HTML 的值都是公开的 |
| `.env` 不入库 | `.gitignore` 已排除 `.env*`；示例值写 `.env.example`（若需要） |
| 服务端密钥只在服务端 | Waline 的数据库凭据、`JWT_TOKEN`、验证码 secret 只配在服务端环境 |
| 公开变量与私有变量的区别 | Astro 对"可暴露给客户端"的环境变量有前缀约定，具体前缀与行为需按官方文档确认（`Needs Validation`），不确定时一律按"会公开"处理 |

**误提交密钥的处置**：立即轮换该密钥（视为已泄露），再清理历史；仅删除文件不安全。

## 3. 外部内容与脚本

- 只加载必要的第三方脚本；每个脚本都要能说明用途与数据流向。
- 第三方脚本加载失败不得影响页面可读（[交互准则 §5](../design/interaction-guidelines.md)）。
- 不在页面中渲染用户输入的 HTML（评论渲染交给 Waline 处理）。
- 图片外链确认来源可信；避免 `javascript:` 等异常协议（构建期校验 URL 协议，`Needs Validation`）。

## 4. CSP 与安全响应头

GitHub Pages 对自定义响应头的支持有限（`Needs Validation`：需按官方文档确认当前能力）。因此在无法设置 CSP 的前提下：

- 从设计上减少需要 CSP 兜底的风险面（少第三方脚本、无内联事件处理器）。
- 若未来可配置：以 `default-src 'self'` 为起点，为 Waline 服务域与字体域单独放行，逐步收紧。
- **不要**在未经测试的情况下上线严格 CSP，会直接打断评论与字体加载。

## 5. 依赖与供应链

- lockfile 入库、`npm ci` 安装（[依赖策略](../engineering/dependency-policy.md)）。
- 定期审计依赖漏洞；高危及时升级并记录到 [技术债](../../plans/tech-debt.md)。
- 不安装来源不明或被弃用的包；安装时留意可疑的安装脚本。
- GitHub Actions 只使用可信来源；第三方 action 需固定主版本或 SHA（`Needs Validation`：项目当前只使用官方 action 与自有脚本）。

## 6. 评论与输入

- 反垃圾：启用 Waline 审核或验证码（`recaptchaV3Key` / `turnstileKey`，密钥在服务端）。
- 不在前端暴露管理入口；后台地址不进文档、不进仓库。
- 上传图片能力若开启，需限制类型与大小（Waline 的 `imageUploader`，默认行为是按 Base64 内嵌，`Needs Validation`：是否禁用上传）。

## 7. 仓库卫生

- `.gitignore` 排除：依赖、产物、`.env`、编辑器个人配置、任务书 `FOR_AGENT.md`。
- 不提交大体积二进制（[媒体存储](../integrations/media-storage.md)）。
- 分支保护与强制审查：个人项目可省略，但 `main` 必须可构建。
- 定期检查仓库协作者与 token 权限。

## 8. 发布前安全清单

- [ ] 产物中搜索 `key`、`token`、`secret`、`password`、数据库连接串 → 无命中。
- [ ] 无 `http://` 资源。
- [ ] 外链均有 `rel="noopener noreferrer"`。
- [ ] 新增第三方脚本已评估并记录。
- [ ] 依赖审计无未处理的高危项。
- [ ] 评论管理凭据未出现在仓库任何文件中。
