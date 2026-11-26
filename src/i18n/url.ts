import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from './config';

/**
 * 生成站内语言路径（唯一入口），始终带尾斜杠。
 *
 * 两个必须处理的细节：
 * 1. normalizeLocale: false —— 默认会把 `zh-CN` 归一化成 `zh-cn`，
 *    而静态产物目录是 `zh-CN`（GitHub Pages 大小写敏感），会 404。
 * 2. trailingSlash: 'always' —— 链接必须带尾斜杠，否则会多一跳重定向。
 */
export function localeUrl(locale: Locale, path = ''): string {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  const url = getRelativeLocaleUrl(locale, normalized, { normalizeLocale: false });
  return url.endsWith('/') ? url : `${url}/`;
}
