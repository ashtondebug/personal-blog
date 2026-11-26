import type { APIRoute } from 'astro';
import { SITE_NAME } from '../config/site';
import { DEFAULT_LOCALE } from '../i18n/config';

/**
 * PWA manifest（构建期生成的静态文件）。
 *
 * 放在 `.ts` 端点里而不是 public/ 静态文件，是为了让 start_url / scope / 图标路径
 * 自动带上 `base`（/personal-blog/），避免切换域名或仓库名时手改。
 */
export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const manifest = {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: '简约文艺的多语言个人博客',
    lang: DEFAULT_LOCALE,
    dir: 'ltr',
    start_url: `${base}${DEFAULT_LOCALE}/`,
    scope: base,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#121212',
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${base}icons/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
