import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 内容集合定义 —— 与 docs/architecture/data-models.md 必须逐字一致。
 *
 * 约定：
 * - 内容按语言分目录（zh-CN / zh-TW / en / ja），语言由目录决定，不在 frontmatter 重复声明。
 * - 条目 id 形如 `zh-CN/hello-world`，slug 为语言段之后的路径。
 * - 字段名 camelCase；必填缺失会让构建失败（优于运行时 undefined）。
 */

const commonFields = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    /** 同一内容的多语言版本共享同一个 key；缺省表示独立内容 */
    translationKey: z.string().optional(),
  });

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }: SchemaContext) =>
    commonFields({ image }).extend({
      series: z.string().optional(),
      toc: z.boolean().default(true),
    }),
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: ({ image }: SchemaContext) =>
    commonFields({ image }).extend({
      section: z.string().optional(),
      order: z.number().optional(),
      aliases: z.array(z.string()).default([]),
      related: z.array(z.string()).default([]),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }: SchemaContext) =>
    commonFields({ image }).extend({
      stack: z.array(z.string()).min(1),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
      status: z.enum(['active', 'archived', 'wip']).default('active'),
      screenshots: z.array(image()).default([]),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }),
});

const moments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/moments' }),
  schema: ({ image }: SchemaContext) =>
    commonFields({ image }).extend({
      media: z
        .array(
          z.object({
            type: z.enum(['image', 'video']),
            src: z.string().min(1),
            alt: z.string().optional(),
            poster: z.string().optional(),
          }),
        )
        .default([]),
      location: z.string().optional(),
    }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: ({ image }: SchemaContext) =>
    commonFields({ image }).extend({
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string().min(1),
            caption: z.string().optional(),
          }),
        )
        .min(1),
      camera: z.string().optional(),
      lens: z.string().optional(),
      location: z.string().optional(),
      shotAt: z.coerce.date().optional(),
    }),
});

export const collections = { blog, knowledge, projects, moments, gallery };
