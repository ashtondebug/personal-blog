import { getLocaleDefinition, type Locale } from '../i18n/config';

/**
 * 按语言格式化日期。
 * 用 UTC 时区：frontmatter 里的 `YYYY-MM-DD` 会被解析为 UTC 零点，
 * 若用本地时区，东八区以西可能显示成前一天。
 */
export function formatDate(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** ISO 日期（YYYY-MM-DD），用于 <time datetime> 与排序 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
