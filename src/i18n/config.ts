/**
 * 语言定义：全站语言相关的唯一定义处。
 *
 * 注意 walineLang：Waline 的日语值是 `jp`，不是 `ja`（官方文档核验 2026-11-26，
 * 见 docs/references/waline.md）。新加语言时三处映射都要补。
 */
export const LOCALES = [
  { code: 'zh-CN', htmlLang: 'zh-CN', ogLocale: 'zh_CN', walineLang: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', htmlLang: 'zh-TW', ogLocale: 'zh_TW', walineLang: 'zh-TW', label: '繁體中文' },
  { code: 'en', htmlLang: 'en', ogLocale: 'en_US', walineLang: 'en', label: 'English' },
  { code: 'ja', htmlLang: 'ja', ogLocale: 'ja_JP', walineLang: 'jp', label: '日本語' },
] as const;

export type LocaleDefinition = (typeof LOCALES)[number];
export type Locale = LocaleDefinition['code'];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const LOCALE_CODES: Locale[] = LOCALES.map((l) => l.code);

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && LOCALE_CODES.includes(value as Locale);
}

export function getLocaleDefinition(locale: Locale): LocaleDefinition {
  const found = LOCALES.find((l) => l.code === locale);
  if (!found) throw new Error(`未知语言：${locale}`);
  return found;
}
