import type { FileSystemItem, FileSystemTreeNode } from '@/types/filesystem';

export function getChildItems(
  items: FileSystemItem[],
  parentId: string | null
): FileSystemItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.parentId === parentId)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

export function getItemBreadcrumbs(
  items: FileSystemItem[],
  itemId: string | null
): FileSystemItem[] {
  if (!Array.isArray(items) || !itemId) return [];

  const itemMap = new Map<string, FileSystemItem>();
  for (const item of items) {
    if (item && item.id) {
      itemMap.set(item.id, item);
    }
  }

  const crumbs: FileSystemItem[] = [];
  let current: FileSystemItem | undefined = itemMap.get(itemId);

  while (current) {
    crumbs.unshift(current);
    current = current.parentId ? itemMap.get(current.parentId) : undefined;
  }

  return crumbs;
}

export function buildFileSystemTree(
  items: FileSystemItem[],
  parentId: string | null = null
): FileSystemTreeNode[] {
  const children = getChildItems(items, parentId);

  return children.map((item) => ({
    ...item,
    ...(item.type === 'folder'
      ? { children: buildFileSystemTree(items, item.id) }
      : {}),
  }));
}
