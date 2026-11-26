/**
 * 评论（Waline）配置。
 *
 * 服务端尚未确定（作者稍后选型）。在提供地址之前：
 * - `COMMENTS_READY` 为 false；
 * - 文章页与留言板都**不渲染**评论区，也不会打包 Waline 客户端；
 * - 页面不出现"评论加载失败"这类噪声。
 *
 * 启用步骤：
 * 1. 部署 Waline 服务端（方式见 docs/integrations/waline.md）；
 * 2. 在构建环境设置 `PUBLIC_WALINE_SERVER_URL`（如 https://waline.example.com），
 *    或直接填写下方 fallback；
 * 3. 重新构建。
 */
const fromEnv = (import.meta.env.PUBLIC_WALINE_SERVER_URL ?? '').trim();

export const WALINE_SERVER_URL = fromEnv;

export const COMMENTS_READY = WALINE_SERVER_URL.length > 0;

/**
 * 评论 path 规则（一旦上线不可随意变更，否则评论会"错位"）：
 * - 文章：去掉 base 前缀与末尾斜杠的完整路径，例如 `/zh-CN/blog/hello`
 * - 留言板：固定 `guestbook`（全站共用一块留言板，不按语言拆分）
 */
export const GUESTBOOK_PATH = 'guestbook';

/** 把 Astro 的路径转换成稳定的评论 key（去掉 base、去尾斜杠） */
export function commentPath(pathname: string, base: string): string {
  let path = pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  if (!path.startsWith('/')) path = `/${path}`;
  return path.replace(/\/+$/, '') || '/';
}
