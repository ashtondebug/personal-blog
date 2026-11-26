/**
 * 首页主视觉的打字机句子。
 *
 * 规则：
 * - `prefers-reduced-motion: reduce` → 完全不启动，保留服务端渲染的第一句。
 * - 页面不可见时暂停，回来再继续（不空转 CPU）。
 * - 句子来自组件的 data-lines（构建期按语言写入），脚本不硬编码文案。
 */

const TYPE_DELAY = 55;
const DELETE_DELAY = 24;
const HOLD_DELAY = 2200;
const GAP_DELAY = 400;

const root = document.querySelector<HTMLElement>('[data-typewriter]');

if (root) {
  const textEl = root.querySelector<HTMLElement>('[data-tw-text]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lines: string[] = [];
  try {
    lines = JSON.parse(root.dataset.lines ?? '[]');
  } catch {
    lines = [];
  }

  if (textEl && lines.length > 0 && !reduced) {
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: number | undefined;

    const schedule = (delay: number): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, delay);
    };

    const tick = (): void => {
      if (document.hidden) return; // 页面不可见时停在这里

      const line = lines[lineIndex] ?? '';

      if (!deleting) {
        charIndex += 1;
        textEl.textContent = line.slice(0, charIndex);

        if (charIndex >= line.length) {
          deleting = true;
          schedule(HOLD_DELAY);
          return;
        }
        schedule(TYPE_DELAY);
        return;
      }

      charIndex -= 1;
      textEl.textContent = line.slice(0, Math.max(charIndex, 0));

      if (charIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        textEl.textContent = '';
        schedule(GAP_DELAY);
        return;
      }
      schedule(DELETE_DELAY);
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) schedule(GAP_DELAY);
    });

    // 从空白开始打字（服务端渲染的第一句只用于无 JS 场景）
    textEl.textContent = '';
    schedule(GAP_DELAY);
  }
}
