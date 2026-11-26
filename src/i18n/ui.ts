import { DEFAULT_LOCALE, type Locale } from './config';

/**
 * UI 词典。四种语言的键必须完全一致（类型会强制）。
 * 文案在 Phase 5 建页面时继续补充；新增键必须四语言同时补齐。
 */
export const ui = {
  'zh-CN': {
    'site.tagline': '简约文艺的个人博客',
    'home.status': '站点骨架已就绪。内容与页面将按路线图分阶段加入。',
    'nav.primary': '主导航',
    'nav.home': '首页',
    'nav.blog': '文章',
    'nav.knowledge': '知识',
    'nav.projects': '项目',
    'nav.gallery': '摄影',
    'nav.moments': '动态',
    'nav.about': '关于',
    'nav.guestbook': '留言板',
    'theme.label': '主题',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'theme.system': '跟随系统',
    'lang.label': '语言',
    'skip.toContent': '跳到正文',
    'footer.note': '内容版权归作者所有。',
    'notFound.title': '页面不存在',
    'notFound.hint': '这个地址没有对应内容，可能已被移动或删除。',
    'notFound.homeLink': '返回首页',
    'about.placeholder': '这一页还没写。作者稍后补充。',
  },
  'zh-TW': {
    'site.tagline': '簡約文藝的個人部落格',
    'home.status': '站點骨架已就緒。內容與頁面將依路線圖分階段加入。',
    'nav.primary': '主導覽',
    'nav.home': '首頁',
    'nav.blog': '文章',
    'nav.knowledge': '知識',
    'nav.projects': '專案',
    'nav.gallery': '攝影',
    'nav.moments': '動態',
    'nav.about': '關於',
    'nav.guestbook': '留言板',
    'theme.label': '主題',
    'theme.light': '淺色',
    'theme.dark': '深色',
    'theme.system': '跟隨系統',
    'lang.label': '語言',
    'skip.toContent': '跳至正文',
    'footer.note': '內容版權歸作者所有。',
    'notFound.title': '頁面不存在',
    'notFound.hint': '這個位址沒有對應內容，可能已被移動或刪除。',
    'notFound.homeLink': '返回首頁',
    'about.placeholder': '這一頁還沒寫。作者稍後補充。',
  },
  en: {
    'site.tagline': 'A minimal, literary personal blog',
    'home.status': 'The site skeleton is in place. Content and pages arrive in later phases.',
    'nav.primary': 'Main',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.knowledge': 'Knowledge',
    'nav.projects': 'Projects',
    'nav.gallery': 'Gallery',
    'nav.moments': 'Moments',
    'nav.about': 'About',
    'nav.guestbook': 'Guestbook',
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'lang.label': 'Language',
    'skip.toContent': 'Skip to content',
    'footer.note': 'All content is the author\u2019s own.',
    'notFound.title': 'Page not found',
    'notFound.hint': 'This address has no content. It may have moved or been removed.',
    'notFound.homeLink': 'Back to home',
    'about.placeholder': 'This page has not been written yet.',
  },
  ja: {
    'site.tagline': '簡素で文芸的な個人ブログ',
    'home.status': 'サイトの骨格ができました。コンテンツと各ページは段階的に追加します。',
    'nav.primary': 'メインナビ',
    'nav.home': 'ホーム',
    'nav.blog': '記事',
    'nav.knowledge': '知識',
    'nav.projects': 'プロジェクト',
    'nav.gallery': '写真',
    'nav.moments': 'つぶやき',
    'nav.about': 'このサイトについて',
    'nav.guestbook': 'ゲストブック',
    'theme.label': 'テーマ',
    'theme.light': 'ライト',
    'theme.dark': 'ダーク',
    'theme.system': '端末に合わせる',
    'lang.label': '言語',
    'skip.toContent': '本文へスキップ',
    'footer.note': 'コンテンツの著作権は作者に帰属します。',
    'notFound.title': 'ページが見つかりません',
    'notFound.hint': 'このアドレスに対応する内容はありません。移動または削除された可能性があります。',
    'notFound.homeLink': 'ホームへ戻る',
    'about.placeholder': 'このページはまだ書かれていません。',
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof DEFAULT_LOCALE];

/** 取文案；缺失时显式抛错，避免静默显示空串 */
export function t(locale: Locale, key: UiKey): string {
  const dict = ui[locale] as Record<string, string> | undefined;
  const value = dict?.[key];
  if (value === undefined) {
    throw new Error(`词典缺少键：${locale} / ${String(key)}`);
  }
  return value;
}
