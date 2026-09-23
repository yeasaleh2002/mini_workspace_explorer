import type { FileSystemItem } from '@/types/filesystem';

/**
 * Returns a suggested item name that does not conflict with existing siblings in the target folder.
 */
export function getSuggestedItemName(
  items: FileSystemItem[],
  parentId: string | null,
  type: 'file' | 'folder'
): string {
  const siblingNames = new Set(
    (Array.isArray(items) ? items : [])
      .filter((item) => item && item.parentId === parentId)
      .map((item) => item.name.toLowerCase())
  );

  if (type === 'folder') {
    const base = 'new-folder';
    if (!siblingNames.has(base.toLowerCase())) {
      return base;
    }
    let counter = 1;
    while (siblingNames.has(`${base}-${counter}`.toLowerCase())) {
      counter++;
    }
    return `${base}-${counter}`;
  } else {
    const baseName = 'new-file';
    const extension = '.ts';
    const fullName = `${baseName}${extension}`;
    if (!siblingNames.has(fullName.toLowerCase())) {
      return fullName;
    }
    let counter = 1;
    while (siblingNames.has(`${baseName}-${counter}${extension}`.toLowerCase())) {
      counter++;
    }
    return `${baseName}-${counter}${extension}`;
  }
}
