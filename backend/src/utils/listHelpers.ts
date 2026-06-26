/** Shared helpers for comma-serialised list columns (tags, images). */

export function parseList(raw: string): string[] {
  return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

export function serializeList(arr: unknown): string {
  if (Array.isArray(arr)) return arr.join(',');
  if (typeof arr === 'string') return arr;
  return '';
}

export function withParsedLists<T extends { images?: string; tags?: string }>(row: T) {
  const out: Record<string, unknown> = { ...row };
  if ('images' in row) out.images = parseList(row.images as string);
  if ('tags'   in row) out.tags   = parseList(row.tags   as string);
  return out as Omit<T, 'images' | 'tags'> & { images: string[]; tags: string[] };
}
