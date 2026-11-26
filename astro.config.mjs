// Astro 配置 —— 站点名见 src/config/site.ts；URL 策略见 docs/decisions/0008-url-strategy.md
import { defineConfig } from 'astro/config';
import remarkWikiLinks from './src/lib/remark-wiki-links.ts';

export default defineConfig({
  // 知识条目的 [[双向链接]] 语法（见 docs/architecture/content-architecture.md）
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
  // GitHub Pages 用户地址；项目页路径由 base 决定
  site: 'https://ashtondebug.github.io',
  base: '/personal-blog',

  // 与 GitHub Pages 的目录式产物一致，避免 /a 与 /a/ 两套 URL
  trailingSlash: 'always',
  build: { format: 'directory' },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'zh-TW', 'en', 'ja'],
    routing: {
      // 所有语言都带前缀：/zh-CN/、/en/ …（ADR-0008）
      // 根路径的重定向由 src/pages/index.astro 显式实现，便于控制带 base 的目标地址
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
