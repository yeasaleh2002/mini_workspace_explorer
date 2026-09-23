import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getChildItems, getItemBreadcrumbs } from '@/store/workspaceSelectors';

export function useWorkspace() {
  const items = useWorkspaceStore((state) => state.items);
  const selectedItemId = useWorkspaceStore((state) => state.selectedItemId);
  const activeFileId = useWorkspaceStore((state) => state.activeFileId);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const isInitialized = useWorkspaceStore((state) => state.isInitialized);
  const error = useWorkspaceStore((state) => state.error);

  const initializeStore = useWorkspaceStore((state) => state.initializeStore);
  const createItem = useWorkspaceStore((state) => state.createItem);
  const deleteItem = useWorkspaceStore((state) => state.deleteItem);
  const renameItem = useWorkspaceStore((state) => state.renameItem);
  const updateFileContent = useWorkspaceStore((state) => state.updateFileContent);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);
  const selectItem = useWorkspaceStore((state) => state.selectItem);
  const clearError = useWorkspaceStore((state) => state.clearError);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  useEffect(() => {
    if (!isInitialized) {
      initializeStore();
    }
  }, [isInitialized, initializeStore]);

  const activeFile = activeFileId ? items.find((i) => i.id === activeFileId) ?? null : null;
  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) ?? null : null;
  const breadcrumbs = getItemBreadcrumbs(items, selectedItemId || activeFileId);

  return {
    items,
    activeFile,
    selectedItem,
    isLoading,
    isInitialized,
    error,
    breadcrumbs,
    getChildren: (parentId: string | null) => getChildItems(items, parentId),
    createItem,
    deleteItem,
    renameItem,
    updateFileContent,
    setActiveFile,
    selectItem,
    clearError,
    resetWorkspace,
  };
}
