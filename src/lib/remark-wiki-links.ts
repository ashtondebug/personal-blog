/**
 * 把知识条目正文里的 `[[target]]` / `[[target|显示文本]]` 转成相对链接。
 *
 * 为什么用相对链接 `../<target>/`：文章页位于 `.../{locale}/knowledge/{slug}/`，
 * 同语言的目标条目是其兄弟目录。相对链接天然带上了 base 与语言前缀，
 * 不需要在 Markdown 编译阶段知道站点根路径。
 *
 * 悬空目标不在这里处理——由 src/lib/content.ts 的 assertKnowledgeLinks 在构建期拦截。
 * 语法说明见 docs/architecture/content-architecture.md。
 */

interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
}

const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function splitText(value: string): MdNode[] {
  const nodes: MdNode[] = [];
  let last = 0;

  for (const match of value.matchAll(WIKI_LINK)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push({ type: 'text', value: value.slice(last, index) });

    const target = match[1]!.trim();
    const label = (match[2] ?? match[1]!).trim();
    nodes.push({
      type: 'link',
      url: `../${encodeURIComponent(target)}/`,
      children: [{ type: 'text', value: label }],
      data: { hProperties: { 'data-wiki-link': target } },
    });

    last = index + match[0].length;
  }

  if (last < value.length) nodes.push({ type: 'text', value: value.slice(last) });
  return nodes;
}

function walk(node: MdNode): void {
  if (!node.children) return;

  const next: MdNode[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && child.value && child.value.includes('[[')) {
      const replaced = splitText(child.value);
      if (replaced.some((item) => item.type === 'link')) {
        next.push(...replaced);
        continue;
      }
    }
    walk(child);
    next.push(child);
  }
  node.children = next;
}

export default function remarkWikiLinks() {
  return (tree: MdNode): void => {
    walk(tree);
  };
}
