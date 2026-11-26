/**
 * 图集灯箱：把 [data-lightbox] 链接升级为浮层浏览。
 * 无 JS 时链接仍然指向原图（新标签页打开），不会坏。
 */

interface Item {
  href: string;
  caption: string;
  alt: string;
}

const root = document.querySelector<HTMLElement>('[data-lightbox-root]');

if (root) {
  const panel = root.querySelector<HTMLElement>('[data-lightbox-panel]');
  const image = root.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const caption = root.querySelector<HTMLElement>('[data-lightbox-caption]');
  const triggers = [...document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]')];

  let items: Item[] = [];
  let index = 0;
  let lastFocus: HTMLElement | null = null;

  const render = (): void => {
    const item = items[index];
    if (!item || !image) return;
    image.src = item.href;
    image.alt = item.alt;
    if (caption) {
      caption.textContent = item.caption;
      caption.hidden = item.caption.length === 0;
    }
  };

  const open = (startIndex: number): void => {
    const gallery = triggers[startIndex]?.dataset.gallery ?? '';
    // 同一组图片连续浏览；没有分组时只看被点的那一张
    const group = gallery
      ? triggers.filter((trigger) => trigger.dataset.gallery === gallery)
      : [triggers[startIndex]!];

    items = group.map((trigger) => ({
      href: trigger.getAttribute('href') ?? '',
      caption: trigger.dataset.caption ?? '',
      alt: trigger.dataset.alt ?? '',
    }));

    index = gallery ? group.indexOf(triggers[startIndex]!) : 0;
    if (index < 0) index = 0;

    lastFocus = document.activeElement as HTMLElement | null;
    render();
    root!.hidden = false;
    document.body.style.overflow = 'hidden';
    panel?.focus();
  };

  const close = (): void => {
    root.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  };

  const step = (delta: number): void => {
    if (items.length === 0) return;
    index = (index + delta + items.length) % items.length;
    render();
  };

  triggers.forEach((trigger, triggerIndex) => {
    trigger.addEventListener('click', (event) => {
      // 允许按住修饰键时走默认行为（新标签页打开原图）
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(triggerIndex);
    });
  });

  for (const closer of root.querySelectorAll<HTMLElement>('[data-lightbox-close]')) {
    closer.addEventListener('click', close);
  }
  root.querySelector<HTMLElement>('[data-lightbox-prev]')?.addEventListener('click', () => step(-1));
  root.querySelector<HTMLElement>('[data-lightbox-next]')?.addEventListener('click', () => step(1));

  document.addEventListener('keydown', (event) => {
    if (root.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  });
}
