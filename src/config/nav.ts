import type { UiKey } from '../i18n/ui';

export interface NavItem {
  /** 词典键，用于多语言文案 */
  key: UiKey;
  /** 语言前缀之后的路径；空串表示首页。末尾不加斜杠，由 localeUrl 补齐 */
  path: string;
  /**
   * 页面是否已经存在。
   * Phase 2 只有首页；其余页面在 Phase 5 创建后再置为 true。
   * 未启用的项渲染为不可点击的弱化文本，避免产生死链。
   */
  enabled: boolean;
}

/** 主导航顺序与信息架构一致（guestbook 放页脚） */
export const PRIMARY_NAV: NavItem[] = [
  { key: 'nav.home', path: '', enabled: true },
  { key: 'nav.blog', path: 'blog', enabled: false },
  { key: 'nav.knowledge', path: 'knowledge', enabled: false },
  { key: 'nav.projects', path: 'projects', enabled: false },
  { key: 'nav.gallery', path: 'gallery', enabled: false },
  { key: 'nav.moments', path: 'moments', enabled: false },
  { key: 'nav.about', path: 'about', enabled: false },
];

/** 页脚条目 */
export const FOOTER_NAV: NavItem[] = [{ key: 'nav.guestbook', path: 'guestbook', enabled: false }];
