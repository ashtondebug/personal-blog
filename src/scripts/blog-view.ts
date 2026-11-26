const STORAGE_KEY = 'blog:view';
const VIEWS = ['list', 'grid', 'magazine'] as const;
type ViewName = (typeof VIEWS)[number];

function isView(value: string | null | undefined): value is ViewName {
  return value !== null && value !== undefined && (VIEWS as readonly string[]).includes(value);
}

function readView(): ViewName | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isView(saved) ? saved : null;
  } catch {
    return null;
  }
}

function apply(view: ViewName): void {
  for (const archive of document.querySelectorAll<HTMLElement>('[data-archive]')) {
    archive.dataset.view = view;
  }
  for (const button of document.querySelectorAll<HTMLElement>('[data-view-value]')) {
    button.setAttribute('aria-pressed', button.dataset.viewValue === view ? 'true' : 'false');
  }
}

if (!document.documentElement.dataset.blogViewBound) {
  document.documentElement.dataset.blogViewBound = '1';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-view-value]');
    if (!button) return;
    const value = button.dataset.viewValue;
    if (!isView(value)) return;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* 无法持久化时仍允许本次切换 */
    }
    apply(value);
  });
}

const saved = readView();
if (saved) apply(saved);
