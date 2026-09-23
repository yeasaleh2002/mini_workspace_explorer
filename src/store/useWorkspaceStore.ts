import { create } from 'zustand';
import type {
  FileSystemItem,
  WorkspaceStore,
  CreateItemInput,
} from '@/types/filesystem';
import {
  getAllItemsFromDB,
  putItemToDB,
  deleteItemsFromDB,
  clearAllItemsFromDB,
} from '@/utils/indexedDB';
import { sanitizeItemName, assertUniqueSiblingName } from '@/utils/sanitize';

function collectDescendantIds(
  rootId: string,
  items: FileSystemItem[]
): string[] {
  const descendantIds: string[] = [rootId];
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const currentParentId = queue.shift()!;
    for (const item of items) {
      if (item && item.parentId === currentParentId) {
        descendantIds.push(item.id);
        if (item.type === 'folder') {
          queue.push(item.id);
        }
      }
    }
  }

  return descendantIds;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  items: [],
  selectedItemId: null,
  activeFileId: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initializeStore: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      const storedItems = await getAllItemsFromDB();
      const validItems = Array.isArray(storedItems)
        ? storedItems.filter((item) => item && typeof item.id === 'string')
        : [];

      set({
        items: validItems,
        activeFileId: null,
        selectedItemId: null,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize workspace';
      set({ error: message, isLoading: false });
    }
  },

  createItem: async (input: CreateItemInput): Promise<FileSystemItem> => {
    set({ error: null });

    try {
      const sanitizedName = sanitizeItemName(input.name);
      const items = Array.isArray(get().items) ? get().items : [];

      const siblingNames = items
        .filter((item) => item && item.parentId === input.parentId)
        .map((item) => item.name);

      assertUniqueSiblingName(sanitizedName, siblingNames);

      const timestamp = Date.now();
      const newItem: FileSystemItem = {
        id: crypto.randomUUID(),
        name: sanitizedName,
        type: input.type,
        parentId: input.parentId,
        content: input.type === 'file' ? (input.content ?? '') : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      set((state) => ({
        items: [...state.items, newItem],
        selectedItemId: newItem.id,
        activeFileId: newItem.type === 'file' ? newItem.id : state.activeFileId,
      }));

      await putItemToDB(newItem);
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      set({ error: message });
      throw err;
    }
  },

  deleteItem: async (id: string): Promise<void> => {
    set({ error: null });

    const { items, activeFileId, selectedItemId } = get();
    const targetItem = items.find((item) => item.id === id);
    if (!targetItem) return;

    try {
      const idsToDelete = targetItem.type === 'folder'
        ? collectDescendantIds(id, items)
        : [id];

      const idsSet = new Set(idsToDelete);

      const nextSelectedId =
        selectedItemId && idsSet.has(selectedItemId)
          ? targetItem.parentId
          : selectedItemId;

      set((state) => ({
        items: state.items.filter((item) => !idsSet.has(item.id)),
        activeFileId: activeFileId && idsSet.has(activeFileId) ? null : activeFileId,
        selectedItemId: nextSelectedId,
      }));

      await deleteItemsFromDB(idsToDelete);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      set({ error: message });
      throw err;
    }
  },

  renameItem: async (id: string, newName: string): Promise<void> => {
    set({ error: null });

    const { items } = get();
    const targetItem = items.find((item) => item.id === id);
    if (!targetItem) {
      throw new Error(`Item with id "${id}" does not exist.`);
    }

    try {
      const sanitizedName = sanitizeItemName(newName);

      const siblingNames = items
        .filter((item) => item && item.parentId === targetItem.parentId && item.id !== id)
        .map((item) => item.name);

      assertUniqueSiblingName(sanitizedName, siblingNames);

      const updatedItem: FileSystemItem = {
        ...targetItem,
        name: sanitizedName,
        updatedAt: Date.now(),
      };

      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
      }));

      await putItemToDB(updatedItem);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename item';
      set({ error: message });
      throw err;
    }
  },

  updateFileContent: async (id: string, content: string): Promise<void> => {
    const { items } = get();
    const targetItem = items.find((item) => item.id === id);
    if (!targetItem || targetItem.type !== 'file') return;

    const updatedItem: FileSystemItem = {
      ...targetItem,
      content,
      updatedAt: Date.now(),
    };

    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updatedItem : item)),
    }));

    try {
      await putItemToDB(updatedItem);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save file content';
      set({ error: message });
    }
  },

  setActiveFile: (id: string | null) => set({ activeFileId: id, selectedItemId: id }),
  selectItem: (id: string | null) => set({ selectedItemId: id }),
  clearError: () => set({ error: null }),

  resetWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearAllItemsFromDB();
      set({
        items: [],
        activeFileId: null,
        selectedItemId: null,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset workspace';
      set({ error: message, isLoading: false });
    }
  },
}));
