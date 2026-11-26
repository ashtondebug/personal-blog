import { DEFAULT_LOCALE, type Locale } from './config';

/**
 * UI 词典。Phase 1 只有骨架所需的最少键；正式文案在 Phase 2/5 补齐。
 * 四种语言的键必须完全一致（类型会强制）。
 */
export const ui = {
  'zh-CN': {
    'site.tagline': '简约文艺的个人博客',
    'home.status': '站点骨架已就绪。内容与页面将按路线图分阶段加入。',
    'home.languageHint': '选择语言',
    'nav.home': '首页',
  },
  'zh-TW': {
    'site.tagline': '簡約文藝的個人部落格',
    'home.status': '站點骨架已就緒。內容與頁面將依路線圖分階段加入。',
    'home.languageHint': '選擇語言',
    'nav.home': '首頁',
  },
  en: {
    'site.tagline': 'A minimal, literary personal blog',
    'home.status': 'The site skeleton is in place. Content and pages arrive in later phases.',
    'home.languageHint': 'Choose a language',
    'nav.home': 'Home',
  },
  ja: {
    'site.tagline': '簡素で文芸的な個人ブログ',
    'home.status': 'サイトの骨格ができました。コンテンツと各ページは段階的に追加します。',
    'home.languageHint': '言語を選択',
    'nav.home': 'ホーム',
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof DEFAULT_LOCALE];

/** 取文案；缺失时回退默认语言并显式抛错，避免静默显示空串 */
export function t(locale: Locale, key: UiKey): string {
  const dict = ui[locale] as Record<string, string> | undefined;
  const value = dict?.[key];
  if (value === undefined) {
    throw new Error(`词典缺少键：${locale} / ${String(key)}`);
  }
  return value;
}
