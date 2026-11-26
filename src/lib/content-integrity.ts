import { getCollection } from 'astro:content';
import { assertKnowledgeLinks, buildTranslations, entryLocale } from './content';

let verified = false;

/**
 * 内容完整性校验（构建期门禁）。
 *
 * 检查：语言目录合法、translationKey 在同语言下不重复、知识条目内部链接可解析。
 * 在 BaseLayout 中调用一次（模块级缓存，整次构建只跑一遍），
 * 这样任何页面构建都会触发校验——内容有问题时构建失败，而不是上线死链。
 */
export async function assertContentIntegrity(): Promise<void> {
  if (verified) return;
  verified = true;

  const collections = await Promise.all([
    getCollection('blog'),
    getCollection('knowledge'),
    getCollection('projects'),
    getCollection('moments'),
    getCollection('gallery'),
  ]);

  for (const entries of collections) {
    for (const entry of entries) {
      entryLocale(entry.id); // 语言目录非法时抛错
    }
    buildTranslations(entries); // translationKey 同语言重复时抛错
  }

  const [, knowledge] = collections;
  assertKnowledgeLinks(knowledge);
}
