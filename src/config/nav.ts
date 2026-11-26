import type { UiKey } from '../i18n/ui';

export interface NavItem {
  /** 词典键，用于多语言文案 */
  key: UiKey;
  /** 语言前缀之后的路径；空串表示首页。末尾不加斜杠，由 localeUrl 补齐 */
  path: string;
  /**
   * 页面是否已经存在。Phase 5 起八个页面全部存在，因此全部为 true；
   * 保留该字段是为了未来新增板块时可以先挂入口、后建页面，避免死链。
   */
  enabled: boolean;
}

/** 主导航顺序与信息架构一致（guestbook 放页脚） */
export const PRIMARY_NAV: NavItem[] = [
  { key: 'nav.home', path: '', enabled: true },
  { key: 'nav.blog', path: 'blog', enabled: true },
  { key: 'nav.knowledge', path: 'knowledge', enabled: true },
  { key: 'nav.projects', path: 'projects', enabled: true },
  { key: 'nav.gallery', path: 'gallery', enabled: true },
  { key: 'nav.moments', path: 'moments', enabled: true },
  { key: 'nav.about', path: 'about', enabled: true },
];

/** 页脚条目 */
export const FOOTER_NAV: NavItem[] = [{ key: 'nav.guestbook', path: 'guestbook', enabled: true }];
