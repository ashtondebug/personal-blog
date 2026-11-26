type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'blog:theme';
const root = document.documentElement;

function readMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    /* 隐私模式下可能抛错，忽略即可 */
  }
  return 'system';
}

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function resolve(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return darkQuery.matches ? 'dark' : 'light';
  return mode;
}

function updateControls(mode: ThemeMode): void {
  for (const button of document.querySelectorAll<HTMLElement>('[data-theme-toggle]')) {
    button.dataset.mode = mode;
    const label = button.querySelector<HTMLElement>('[data-theme-label]');
    if (label) {
      const text = button.dataset[`label${mode[0].toUpperCase()}${mode.slice(1)}`];
      if (text) label.textContent = text;
    }
  }
}

function apply(mode: ThemeMode): void {
  root.dataset.theme = resolve(mode);
  root.dataset.themeMode = mode;
  updateControls(mode);
}

function save(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* 无法存储时仍允许本次切换生效 */
  }
}

const CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

function next(mode: ThemeMode): ThemeMode {
  const index = CYCLE.indexOf(mode);
  return CYCLE[(index + 1) % CYCLE.length]!;
}

// 幂等初始化：Astro 视图过渡会重复执行页面脚本时不会重复绑定
if (!root.dataset.themeBound) {
  root.dataset.themeBound = '1';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-theme-toggle]');
    if (!button) return;

    const mode = next(readMode());
    save(mode);
    apply(mode);
  });

  darkQuery.addEventListener('change', () => {
    if (readMode() === 'system') apply('system');
  });
}

apply(readMode());
