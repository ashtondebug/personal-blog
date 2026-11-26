/**
 * Waline 评论区挂载（按需加载；服务端未配置时整个组件不会被渲染，这段代码也不会进页面）。
 *
 * 选项依据（docs/references/waline.md，核验 2026-11-26）：
 * - `path` 决定评论区身份，必须稳定；本站在构建期算好传进来。
 * - `lang` 用本站映射（日语是 `jp`，不是 `ja`）。
 * - `dark` 传 CSS 选择器而不是 `'auto'`，保证跟随用户选择的主题而不是系统主题。
 * - `reaction` 是"点赞"的落地方式（ADR-0010），最多 9 个表情。
 * - 不启用 `pageview`：浏览量仍未通过免费方案验证（TD-06）。
 */import '@waline/client/waline.css';

const container = document.querySelector<HTMLElement>('[data-waline]');

if (container) {
  const status = document.querySelector<HTMLElement>('[data-comments-status]');
  const errorMessage = container.dataset.msgError ?? 'Comments are unavailable right now.';

  const fail = (): void => {
    if (!status) return;
    status.textContent = errorMessage;
    status.hidden = false;
  };

  (async () => {
    try {
      const { init } = await import('@waline/client');

      init({
        el: container,
        serverURL: container.dataset.serverUrl ?? '',
        path: container.dataset.path ?? window.location.pathname,
        lang: container.dataset.lang ?? 'zh-CN',
        dark: 'html[data-theme="dark"]',
        reaction: container.dataset.reaction === 'true',
      });

      status?.remove();
    } catch (error) {
      console.error('[waline]', error);
      fail();
    }
  })();
}
