/**
 * 注册 Service Worker（仅生产构建）。
 * sw.js 由 scripts/build-sw.mjs 在构建末尾生成，缓存名随产物哈希变化。
 */
const base = import.meta.env.BASE_URL;

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((error: unknown) => {
      // 注册失败不影响页面可用性，只记录
      console.warn('[pwa] service worker 注册失败', error);
    });
  });
}
