#!/usr/bin/env node
/**
 * 生成 dist/sw.js（Service Worker）。
 *
 * 为什么要构建期生成：缓存名里要带一个随产物变化的版本号，否则用户会长期看到旧页面。
 * 这里用「产物文件列表 + 大小」的哈希作为版本，任何一次内容变化都会换新缓存名。
 *
 * 缓存策略（见 docs/integrations/pwa.md）：
 * - 页面导航：网络优先，失败回退缓存（保证内容新鲜，同时能离线打开看过的页面）
 * - 带哈希的静态资源（/_astro/、/icons/、pagefind 索引）：缓存优先
 * - 其它（含所有跨域请求，例如评论）：不拦截
 */
import { createHash } from 'node:crypto';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const BASE = process.env.PWA_BASE ?? '/personal-blog/';

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(`${full}:${stat.size}`);
  }
  return files;
}

const fingerprint = walk(DIST).sort().join('|');
const version = createHash('sha256').update(fingerprint).digest('hex').slice(0, 10);
const cacheName = `the-commons-${version}`;

const precache = [
  BASE,
  `${BASE}404.html`,
  `${BASE}favicon.svg`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
];

const serviceWorker = `/* 自动生成，请勿手改；源文件：scripts/build-sw.mjs */
const CACHE = ${JSON.stringify(cacheName)};
const BASE = ${JSON.stringify(BASE)};
const PRECACHE = ${JSON.stringify(precache)};
const STATIC_HINTS = ['/_astro/', '/icons/', '/pagefind/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isStatic(pathname) {
  return STATIC_HINTS.some((hint) => pathname.includes(hint));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 评论等跨域请求一律放行

  // 页面导航：网络优先，断网回退到缓存（再退到首页）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(BASE)) ?? Response.error()),
    );
    return;
  }

  if (!isStatic(url.pathname)) return;

  // 静态资源：缓存优先（文件名带哈希，不会过期）
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        }),
    ),
  );
});
`;

writeFileSync(join(DIST, 'sw.js'), serviceWorker);
console.log(`generated dist/sw.js (cache: ${cacheName})`);
