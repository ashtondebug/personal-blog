import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from './config';

/**
 * 生成站内语言路径（唯一入口）。
 *
 * 必须使用 normalizeLocale: false：默认会把 `zh-CN` 小写成 `zh-cn`，
 * 而静态产物目录是 `zh-CN`，GitHub Pages 大小写敏感 → 会 404。
 */
export function localeUrl(locale: Locale, path = ''): string {
  return getRelativeLocaleUrl(locale, path, { normalizeLocale: false });
}
