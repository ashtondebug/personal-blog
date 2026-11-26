import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { LOCALE_CODES, type Locale } from '../i18n/config';
import { entryLocale, entrySlug, published } from '../lib/content';

/**
 * 站点地图（最小实现）。
 *
 * 覆盖：站点级页面（四语言互为 alternate）+ 五类内容详情页（按 translationKey 组 alternate）。
 * 不含：搜索页（noindex）、404、分类/标签聚合页（可由列表页发现，加进来只会膨胀）。
 */

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  alternates: { hreflang: string; href: string }[];
}

const STATIC_SECTIONS = ['', 'about', 'blog', 'knowledge', 'projects', 'gallery', 'moments', 'guestbook'];

const HTML_LANG: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en',
  ja: 'ja',
};

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const origin = site ? site.origin : 'https://ashtondebug.github.io';
  const absolute = (path: string) => `${origin}${base}${path}`;

  const entries: SitemapEntry[] = [];

  // 站点级页面：每种语言一份，互为 alternate
  for (const section of STATIC_SECTIONS) {
    for (const locale of LOCALE_CODES) {
      const path = section ? `${locale}/${section}/` : `${locale}/`;
      entries.push({
        loc: absolute(path),
        alternates: LOCALE_CODES.map((code) => ({
          hreflang: HTML_LANG[code],
          href: absolute(section ? `${code}/${section}/` : `${code}/`),
        })),
      });
    }
  }

  // 内容详情页
  const collections = [
    { key: 'blog' as const, path: 'blog' },
    { key: 'knowledge' as const, path: 'knowledge' },
    { key: 'projects' as const, path: 'projects' },
    { key: 'moments' as const, path: 'moments' },
    { key: 'gallery' as const, path: 'gallery' },
  ];

  for (const collection of collections) {
    const all = published(await getCollection(collection.key));
    const groups = new Map<string, { locale: Locale; entry: (typeof all)[number] }[]>();

    for (const entry of all) {
      const locale = entryLocale(entry.id);
      const key = entry.data.translationKey ?? `__single__${entry.id}`;
      const list = groups.get(key) ?? [];
      list.push({ locale, entry });
      groups.set(key, list);
    }

    for (const group of groups.values()) {
      for (const item of group) {
        const path = `${item.locale}/${collection.path}/${entrySlug(item.entry.id)}/`;
        entries.push({
          loc: absolute(path),
          lastmod: (item.entry.data.updated ?? item.entry.data.date).toISOString().slice(0, 10),
          alternates: group.map((other) => ({
            hreflang: HTML_LANG[other.locale],
            href: absolute(`${other.locale}/${collection.path}/${entrySlug(other.entry.id)}/`),
          })),
        });
      }
    }
  }

  const urls = entries
    .map((entry) => {
      const alternates = entry.alternates
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}"/>`,
        )
        .join('\n');
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n${alternates}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
