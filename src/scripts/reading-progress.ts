/**
 * 阅读进度：细进度条，仅内容详情页使用。
 * 以 <main> 内文章的高度为基准，不使用整页高度（评论/页脚不参与）。
 */

const bar = document.querySelector<HTMLElement>('[data-reading-progress-bar]');
const article = document.querySelector<HTMLElement>('[data-reading-article]');

if (bar && article) {
  let frame = 0;

  const update = (): void => {
    frame = 0;
    const rect = article.getBoundingClientRect();
    const viewport = window.innerHeight;
    const total = rect.height - viewport;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const percent = total > 0 ? (scrolled / total) * 100 : 100;
    bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };

  const schedule = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}
