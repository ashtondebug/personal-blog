import type { APIRoute } from 'astro';

/**
 * robots.txt：允许抓取全站，并指向站点地图。
 * 搜索页在页面级被标记为 noindex，这里不额外 Disallow（避免爬虫看不到 noindex）。
 */
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const origin = site ? site.origin : 'https://ashtondebug.github.io';
  const sitemap = `${origin}${base}sitemap.xml`;

  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
