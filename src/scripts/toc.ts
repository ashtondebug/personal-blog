const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];

if (links.length > 0) {
  const items = links
    .map((link) => ({
      link,
      target: document.getElementById(decodeURIComponent(link.dataset.tocLink ?? '')),
    }))
    .filter((item): item is { link: HTMLAnchorElement; target: HTMLElement } => item.target !== null);

  let active: string | null = null;

  const update = (): void => {
    const offset = 120;
    let current = items[0]?.target.id ?? null;

    for (const item of items) {
      if (item.target.getBoundingClientRect().top - offset <= 0) current = item.target.id;
    }

    if (current === active) return;
    active = current;

    for (const item of items) {
      if (item.target.id === current) item.link.setAttribute('aria-current', 'true');
      else item.link.removeAttribute('aria-current');
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}
