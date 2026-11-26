import type { CollectionEntry, CollectionKey } from 'astro:content';
import { DEFAULT_LOCALE, LOCALE_CODES, type Locale } from '../i18n/config';

/**
 * 内容派生工具：只做纯计算，不读文件、不写站点。
 * 规则来源：docs/architecture/content-architecture.md 与 data-models.md
 */

export type EntryOf<C extends CollectionKey> = CollectionEntry<C>;

interface WithIdAndData {
  id: string;
  data: { draft: boolean; date: Date; tags: string[]; translationKey?: string };
}

/**
 * 语言由目录决定：`zh-CN/hello` → `zh-CN`。
 *
 * 注意：Astro 的 `glob()` 加载器会把条目 id 整体 slug 化，目录段会变成小写
 * （`zh-CN/` → `zh-cn/`）。因此这里必须做**大小写无关**的映射，否则四语言内容全被判为非法。
 * 详见 docs/references/astro.md 的“实测踩坑”。
 */
export function entryLocale(id: string): Locale {
  const [first] = id.split('/');
  const segment = (first ?? '').toLowerCase();
  const matched = LOCALE_CODES.find((code) => code.toLowerCase() === segment);
  if (matched) return matched;
  throw new Error(
    `内容 id "${id}" 缺少合法语言目录（允许：zh-CN / zh-TW / en / ja），见 docs/architecture/content-architecture.md`,
  );
}

/** slug = 语言段之后的路径 */
export function entrySlug(id: string): string {
  return id.split('/').slice(1).join('/');
}

/** 只保留已发布的条目 */
export function published<T extends WithIdAndData>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.draft !== true);
}

/** 日期倒序（同日按 id 稳定排序，保证构建可复现） */
export function sortByDateDesc<T extends WithIdAndData>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const diff = b.data.date.getTime() - a.data.date.getTime();
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

export function byLocale<T extends WithIdAndData>(entries: T[], locale: Locale): T[] {
  return entries.filter((entry) => entryLocale(entry.id) === locale);
}

/**
 * 阅读时长（分钟，向上取整，最少 1）：
 * 中日文按字符数（400 字/分钟），其余按词数（220 词/分钟）。
 */
export function readingMinutes(body: string | undefined): number {
  const text = (body ?? '').replace(/```[\s\S]*?```/g, ' ');
  const cjk = (text.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? []).length;
  const words = (text.replace(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ').match(/[A-Za-z0-9]+/g) ?? [])
    .length;
  const minutes = cjk / 400 + words / 220;
  return Math.max(1, Math.ceil(minutes));
}

/** 标签归一：全角转半角、去掉前导 #、合并空白、拉丁转小写；中文原样保留 */
export function normalizeTag(raw: string): string {
  return raw
    .normalize('NFKC')
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export interface TagBucket<T> {
  tag: string;
  entries: T[];
}

/** 标签索引：按出现次数降序，同次数按标签名排序 */
export function buildTagIndex<T extends WithIdAndData>(entries: T[]): TagBucket<T>[] {
  const buckets = new Map<string, T[]>();
  for (const entry of entries) {
    for (const raw of entry.data.tags ?? []) {
      const tag = normalizeTag(raw);
      if (!tag) continue;
      const list = buckets.get(tag) ?? [];
      list.push(entry);
      buckets.set(tag, list);
    }
  }
  return [...buckets.entries()]
    .map(([tag, list]) => ({ tag, entries: sortByDateDesc(list) }))
    .sort((a, b) => b.entries.length - a.entries.length || a.tag.localeCompare(b.tag));
}

/** 同一 translationKey 的多语言版本：key → (locale → entry) */
export function buildTranslations<T extends WithIdAndData>(
  entries: T[],
): Map<string, Map<Locale, T>> {
  const map = new Map<string, Map<Locale, T>>();
  for (const entry of published(entries)) {
    const key = entry.data.translationKey;
    if (!key) continue;
    const locale = entryLocale(entry.id);
    const group = map.get(key) ?? new Map<Locale, T>();
    if (group.has(locale)) {
      throw new Error(`translationKey "${key}" 在语言 ${locale} 下重复，见 docs/architecture/data-models.md`);
    }
    group.set(locale, entry);
    map.set(key, group);
  }
  return map;
}

/** 某条目可用的语言版本（含自身）。没有 translationKey 时只有自身语言 */
export function availableLocalesFor<T extends WithIdAndData>(
  entry: T,
  translations: Map<string, Map<Locale, T>>,
): Locale[] {
  const key = entry.data.translationKey;
  if (!key) return [entryLocale(entry.id)];
  const group = translations.get(key);
  return group ? [...group.keys()] : [entryLocale(entry.id)];
}

/** 抽取 `[[target]]` / `[[target|显示文本]]` 的引用目标 */
export function wikiLinkTargets(body: string | undefined): string[] {
  const text = body ?? '';
  return [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map((match) => match[1].trim());
}

/** 知识条目的可解析键：slug 与 aliases（不含语言段，便于跨语言写作） */
function knowledgeKeys(entry: WithIdAndData): string[] {
  const slug = entrySlug(entry.id);
  const aliases = (entry.data as { aliases?: string[] }).aliases ?? [];
  return [slug, ...aliases.map((alias) => alias.trim())].filter(Boolean);
}

/**
 * 校验知识条目里的内部链接：目标必须存在（同语言内匹配 slug 或 alias）。
 * 悬空链接在构建期抛错，而不是生成死链。
 */
export function assertKnowledgeLinks<T extends WithIdAndData & { body?: string }>(entries: T[]): void {
  const byLocaleKeys = new Map<Locale, Set<string>>();
  for (const entry of entries) {
    const locale = entryLocale(entry.id);
    const keys = byLocaleKeys.get(locale) ?? new Set<string>();
    for (const key of knowledgeKeys(entry)) keys.add(key);
    byLocaleKeys.set(locale, keys);
  }

  const problems: string[] = [];
  for (const entry of entries) {
    const locale = entryLocale(entry.id);
    const keys = byLocaleKeys.get(locale) ?? new Set<string>();
    for (const target of wikiLinkTargets(entry.body)) {
      if (!keys.has(target)) {
        problems.push(`${entry.id} → [[${target}]]（语言 ${locale} 下不存在该条目）`);
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(`知识条目的内部链接无法解析：\n  ${problems.join('\n  ')}`);
  }
}

/** 反向链接：目标 slug/alias → 引用了它的条目 */
export function buildBacklinks<T extends WithIdAndData & { body?: string }>(
  entries: T[],
): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const entry of entries) {
    const locale = entryLocale(entry.id);
    for (const target of wikiLinkTargets(entry.body)) {
      const list = result.get(target) ?? [];
      if (!list.some((item) => item.id === entry.id)) list.push(entry);
      result.set(target, list);
      void locale;
    }
  }
  return result;
}

/** 年度活动：年 → (ISO 日期 → 数量)，用于热力图与时间轴 */
export function yearlyActivity<T extends WithIdAndData>(entries: T[]): Map<number, Map<string, number>> {
  const years = new Map<number, Map<string, number>>();
  for (const entry of published(entries)) {
    const date = entry.data.date;
    const year = date.getUTCFullYear();
    const iso = date.toISOString().slice(0, 10);
    const days = years.get(year) ?? new Map<string, number>();
    days.set(iso, (days.get(iso) ?? 0) + 1);
    years.set(year, days);
  }
  return years;
}

/** 默认语言（供未显式指定语言的场景） */
export const fallbackLocale = DEFAULT_LOCALE;
