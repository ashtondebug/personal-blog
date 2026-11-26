/**
 * 搜索：Pagefind 构建后索引 + 浏览器查询（见 docs/integrations/search.md）。
 *
 * 关键点：
 * - 索引资源位于 `${BASE}pagefind/`，因此动态 import 与 baseUrl 都必须带 BASE。
 * - 只显示当前语言的命中：结果 URL 以 `${BASE}${locale}/` 开头才保留。
 * - excerpt 由 Pagefind 输出（实体已转义、含 <mark>），可以安全作为 innerHTML。
 */

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta?: { title?: string };
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindApi {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (term: string) => Promise<{ results: PagefindResult[] } | null>;
}

const BASE = import.meta.env.BASE_URL;
const MAX_RESULTS = 8;
const MAX_CANDIDATES = 30;

let pagefindPromise: Promise<PagefindApi> | null = null;

function loadPagefind(): Promise<PagefindApi> {
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      const module = (await import(/* @vite-ignore */ `${BASE}pagefind/pagefind.js`)) as PagefindApi;
      await module.options({ baseUrl: BASE });
      await module.init();
      return module;
    })();
  }
  return pagefindPromise;
}

function text(root: HTMLElement, name: string): string {
  return root.dataset[name] ?? '';
}

function setStatus(root: HTMLElement, message: string): void {
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  if (status) status.textContent = message;
}

function clearResults(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>('[data-search-results]');
  if (list) list.replaceChildren();
}

function focusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('input, button, a[href]')].filter(
    (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
  );
}

function setOpen(root: HTMLElement, open: boolean): void {
  if (open) {
    root.hidden = false;
    root.dataset.open = 'true';
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    input?.focus();
    input?.select();
  } else {
    root.dataset.open = 'false';
    if (root.dataset.mode === 'overlay') root.hidden = true;
  }
}

function isEditable(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
}

async function search(root: HTMLElement, term: string): Promise<void> {
  const list = root.querySelector<HTMLElement>('[data-search-results]');
  if (!list) return;

  if (term.trim().length === 0) {
    clearResults(root);
    setStatus(root, text(root, 'msgHint'));
    return;
  }

  const locale = root.dataset.locale ?? 'zh-CN';
  const localePrefix = `${BASE}${locale}/`;

  try {
    setStatus(root, text(root, 'msgLoading'));
    const pagefind = await loadPagefind();
    const response = await pagefind.debouncedSearch(term);
    if (response === null) return; // 有更新的输入

    const candidates = response.results.slice(0, MAX_CANDIDATES);
    const loaded = await Promise.all(candidates.map((item) => item.data()));
    const filtered = loaded
      .filter((item) => item.url.startsWith(localePrefix))
      .slice(0, MAX_RESULTS);

    list.replaceChildren();
    if (filtered.length === 0) {
      setStatus(root, text(root, 'msgEmpty'));
      return;
    }

    setStatus(root, '');
    for (const item of filtered) {
      const link = document.createElement('a');
      link.className = 'result';
      link.href = item.url;

      const title = document.createElement('span');
      title.className = 'result__title';
      title.textContent = item.meta?.title ?? item.url;

      const excerpt = document.createElement('span');
      excerpt.className = 'result__excerpt';
      excerpt.innerHTML = item.excerpt;

      link.append(title, excerpt);
      const li = document.createElement('li');
      li.append(link);
      list.append(li);
    }
  } catch (error) {
    console.error('[search]', error);
    clearResults(root);
    setStatus(root, text(root, 'msgError'));
  }
}

function bind(root: HTMLElement): void {
  if (root.dataset.searchBound) return;
  root.dataset.searchBound = '1';

  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  let timer: number | undefined;

  input?.addEventListener('input', () => {
    const term = input.value;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void search(root, term), 180);
  });

  for (const closer of root.querySelectorAll<HTMLElement>('[data-search-close]')) {
    closer.addEventListener('click', () => setOpen(root, false));
  }

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = focusable(root);
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

// 页面级：初始化所有搜索容器 + 打开按钮 + 全局快捷键
for (const root of document.querySelectorAll<HTMLElement>('[data-search]')) {
  bind(root);

  for (const trigger of document.querySelectorAll<HTMLElement>('[data-search-open]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(root, true);
      void loadPagefind().catch(() => undefined);
    });
  }

  if (root.dataset.mode === 'page') {
    void loadPagefind().catch(() => undefined);
  }
}

if (!document.documentElement.dataset.searchKeysBound) {
  document.documentElement.dataset.searchKeysBound = '1';

  document.addEventListener('keydown', (event) => {
    const open = [...document.querySelectorAll<HTMLElement>('[data-search]')].find(
      (root) => root.dataset.open === 'true',
    );

    if (event.key === 'Escape' && open) {
      setOpen(open, false);
      return;
    }

    if (event.key === '/' && !isEditable(event.target) && !open) {
      const overlay = document.querySelector<HTMLElement>('[data-search][data-mode="overlay"]');
      if (!overlay) return;
      event.preventDefault();
      setOpen(overlay, true);
      void loadPagefind().catch(() => undefined);
    }
  });
}
