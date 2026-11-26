#!/usr/bin/env node
/**
 * 构建产物 i18n 一致性检查（无第三方依赖，需先 npm run build）。
 *
 * 检查项：
 *  1. 每种语言 × 每个版块的页面都存在
 *  2. <html lang> 与该语言一致
 *  3. canonical 等于「站点 + base + 语言 + 版块」，且带尾斜杠
 *  4. 恰好 4 个 hreflang + 1 个 x-default，且指向同一版块的其他语言
 *  5. og:locale 正确
 *  6. 语言切换器为其他语言提供同一版块的链接（不回到首页）
 *  7. 导航当前项唯一（aria-current="page"）
 *  8. 404.html 有 noindex、无 hreflang、含四语言入口
 *  9. 根页面重定向到默认语言
 *
 * 用法：node scripts/check-i18n.mjs
 */
import { existsSync, readFileSync } from 'node:fs';

const SITE = 'https://ashtondebug.github.io';
const BASE = '/personal-blog';
const LOCALES = [
  { code: 'zh-CN', htmlLang: 'zh-CN', ogLocale: 'zh_CN' },
  { code: 'zh-TW', htmlLang: 'zh-TW', ogLocale: 'zh_TW' },
  { code: 'en', htmlLang: 'en', ogLocale: 'en_US' },
  { code: 'ja', htmlLang: 'ja', ogLocale: 'ja_JP' },
];
const DEFAULT_LOCALE = 'zh-CN';
const SECTIONS = ['', 'about'];

const failures = [];

function fail(message) {
  failures.push(message);
}

function readPage(relPath) {
  const file = `dist/${relPath}`;
  if (!existsSync(file)) {
    fail(`缺少产物文件 ${file}`);
    return null;
  }
  return readFileSync(file, 'utf8');
}

function matchOne(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : undefined;
}

function pagePath(locale, section) {
  return section ? `${locale}/${section}/` : `${locale}/`;
}

for (const section of SECTIONS) {
  const where = section === '' ? '首页' : `/${section}/`;
  for (const locale of LOCALES) {
    const html = readPage(`${pagePath(locale.code, section)}index.html`);
    if (!html) continue;
    const tag = `${locale.code} ${where}`;

    const htmlLang = matchOne(html, /<html lang="([^"]+)"/);
    if (htmlLang !== locale.htmlLang) {
      fail(`${tag}: <html lang> = ${htmlLang}，期望 ${locale.htmlLang}`);
    }

    const canonical = matchOne(html, /<link rel="canonical" href="([^"]+)"/);
    const expectedCanonical = `${SITE}${BASE}/${pagePath(locale.code, section)}`;
    if (canonical !== expectedCanonical) {
      fail(`${tag}: canonical = ${canonical}，期望 ${expectedCanonical}`);
    }

    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    const langAlternates = alternates.filter((m) => m[1] !== 'x-default');
    if (langAlternates.length !== LOCALES.length) {
      fail(`${tag}: hreflang 数量 = ${langAlternates.length}，期望 ${LOCALES.length}`);
    }
    for (const localeItem of LOCALES) {
      const expected = `${SITE}${BASE}/${pagePath(localeItem.code, section)}`;
      const found = langAlternates.find((m) => m[1] === localeItem.htmlLang);
      if (!found) {
        fail(`${tag}: 缺少 hreflang="${localeItem.htmlLang}"`);
      } else if (found[2] !== expected) {
        fail(`${tag}: hreflang ${localeItem.htmlLang} = ${found[2]}，期望 ${expected}`);
      }
    }
    const xDefault = alternates.find((m) => m[1] === 'x-default');
    const expectedXDefault = `${SITE}${BASE}/${pagePath(DEFAULT_LOCALE, section)}`;
    if (!xDefault) {
      fail(`${tag}: 缺少 x-default`);
    } else if (xDefault[2] !== expectedXDefault) {
      fail(`${tag}: x-default = ${xDefault[2]}，期望 ${expectedXDefault}`);
    }

    const ogLocale = matchOne(html, /<meta property="og:locale" content="([^"]+)"/);
    if (ogLocale !== locale.ogLocale) {
      fail(`${tag}: og:locale = ${ogLocale}，期望 ${locale.ogLocale}`);
    }

    for (const other of LOCALES) {
      if (other.code === locale.code) continue;
      const expectedHref = `${BASE}/${pagePath(other.code, section)}`;
      if (!html.includes(`href="${expectedHref}"`)) {
        fail(`${tag}: 语言切换缺少到 ${other.code} 同一版块的链接（${expectedHref}）`);
      }
    }

    const currentCount = (html.match(/aria-current="page"/g) || []).length;
    if (currentCount !== 1) {
      fail(`${tag}: aria-current="page" 出现 ${currentCount} 次，期望 1 次`);
    }

    // 哨兵路径绝不允许泄漏到链接里（曾因 404 的 navPath 与状态切换路径耦合而出现）
    const leaked = html.match(/href="[^"]*__[^"]*"/);
    if (leaked) {
      fail(`${tag}: 链接中出现内部哨兵路径 ${leaked[0]}`);
    }
  }
}

// 404
const notFound = readPage('404.html');
if (notFound) {
  if (!notFound.includes('name="robots" content="noindex"')) {
    fail('404: 缺少 noindex');
  }
  if (/<link rel="alternate" hreflang=/.test(notFound)) {
    fail('404: 不应输出 hreflang alternates');
  }
  for (const locale of LOCALES) {
    if (!notFound.includes(`href="${BASE}/${locale.code}/"`)) {
      fail(`404: 缺少 ${locale.code} 首页入口`);
    }
  }
  if (/href="[^"]*__[^"]*"/.test(notFound)) {
    fail('404: 语言切换/入口链接中泄漏了内部哨兵路径');
  }
}

// 根重定向
const root = readPage('index.html');
if (root) {
  if (!root.includes(`${BASE}/${DEFAULT_LOCALE}/`)) {
    fail(`根页面: 未重定向到 ${BASE}/${DEFAULT_LOCALE}/`);
  }
}

if (failures.length > 0) {
  console.error(`i18n 检查失败 ${failures.length} 条：`);
  for (const item of failures) console.error(`  x ${item}`);
  process.exit(1);
}

const pageCount = SECTIONS.length * LOCALES.length;
console.log(`通过：${pageCount} 个语言页面 + 404 + 根重定向的 lang / canonical / hreflang / 切换链接均一致。`);
