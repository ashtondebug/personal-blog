export const PAGE_SIZE = 6;

export interface PageSlice<T> {
  number: number;
  posts: T[];
}

/** 按页切片；空集合时返回一页（第 1 页、无文章），保证列表页始终存在 */
export function paginate<T>(posts: T[], pageSize = PAGE_SIZE): PageSlice<T>[] {
  if (posts.length === 0) return [{ number: 1, posts: [] }];
  const pages: PageSlice<T>[] = [];
  for (let index = 0; index < posts.length; index += pageSize) {
    pages.push({ number: pages.length + 1, posts: posts.slice(index, index + pageSize) });
  }
  return pages;
}

/** 分页路径：第 1 页是列表根路径 */
export function pagePath(base: string, page: number): string {
  if (page <= 1) return base;
  return `${base}/page/${page}`;
}

/** 分类/标签的 URL 段：全角转半角、转小写、空白转连字符 */
export function taxonomySlug(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, '-');
}
