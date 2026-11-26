/**
 * 分享：复制规范链接（navigator.clipboard），失败时提示手动复制。
 * 不做第三方分享 SDK，不引入追踪（见 docs/product/feature-specifications.md §5）。
 */

for (const button of document.querySelectorAll<HTMLElement>('[data-share-copy]')) {
  if (button.dataset.shareBound) continue;
  button.dataset.shareBound = '1';

  const status = button.parentElement?.querySelector<HTMLElement>('[data-share-status]');
  const copied = button.dataset.msgCopied ?? 'Copied';
  const failed = button.dataset.msgFailed ?? 'Copy failed';

  const show = (message: string): void => {
    if (!status) return;
    status.textContent = message;
    window.setTimeout(() => {
      if (status.textContent === message) status.textContent = '';
    }, 2000);
  };

  button.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      show(copied);
    } catch {
      show(failed);
      // 兜底：选中地址栏内容让用户手动复制
      const input = document.createElement('input');
      input.value = url;
      document.body.append(input);
      input.select();
      try {
        document.execCommand('copy');
        show(copied);
      } catch {
        show(failed);
      }
      input.remove();
    }
  });
}
