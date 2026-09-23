'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { FolderTree } from './FolderTree';
import { ActionToolbar } from './ActionToolbar';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import type { FileSystemItem } from '@/types/filesystem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const items = useWorkspaceStore((state) => state.items);
  const selectedItemId = useWorkspaceStore((state) => state.selectedItemId);
  const createItem = useWorkspaceStore((state) => state.createItem);
  const renameItem = useWorkspaceStore((state) => state.renameItem);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [renamingItem, setRenamingItem] = useState<FileSystemItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCollapseAll = () => {
    setExpandedFolderIds({});
  };

  const handleStartCreate = (parentId: string | null = null, type: 'file' | 'folder' = 'file') => {
    setTargetParentId(parentId);
    setCreateType(type);
    setNewItemName('');
    setIsCreating(true);
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await createItem({
        name: newItemName,
        type: createType,
        parentId: targetParentId,
        content: createType === 'file' ? '' : undefined,
      });

      if (targetParentId) {
        setExpandedFolderIds((prev) => ({ ...prev, [targetParentId]: true }));
      }

      setIsCreating(false);
      setNewItemName('');
    } catch {
    }
  };

  const handleStartRename = (item: FileSystemItem) => {
    setRenamingItem(item);
    setRenameValue(item.name);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem || !renameValue.trim()) return;

    try {
      await renameItem(renamingItem.id, renameValue);
      setRenamingItem(null);
      setRenameValue('');
    } catch {
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex md:hidden items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-700">Workspace Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ActionToolbar
          onNewFile={() => {
            const parent = selectedItem?.type === 'folder' ? selectedItem.id : (selectedItem?.parentId ?? null);
            handleStartCreate(parent, 'file');
          }}
          onNewFolder={() => {
            const parent = selectedItem?.type === 'folder' ? selectedItem.id : (selectedItem?.parentId ?? null);
            handleStartCreate(parent, 'folder');
          }}
          onCollapseAll={handleCollapseAll}
          onReset={resetWorkspace}
        />

        {isCreating && (
          <form
            onSubmit={handleConfirmCreate}
            className="p-2.5 bg-gray-50 border-b border-gray-200 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>New {createType === 'file' ? 'File' : 'Folder'} in:</span>
              <span className="font-medium text-gray-700 truncate max-w-[120px]">
                {targetParentId ? items.find((i) => i.id === targetParentId)?.name ?? 'root' : 'root'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                placeholder={createType === 'file' ? 'index.ts' : 'new-folder'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
              />
              <button
                type="submit"
                className="p-1 text-emerald-600 hover:bg-gray-200 rounded transition"
                title="Confirm"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 text-gray-500 hover:bg-gray-200 rounded transition"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {renamingItem && (
          <form
            onSubmit={handleConfirmRename}
            className="p-2.5 bg-gray-50 border-b border-gray-200 space-y-2"
          >
            <div className="text-[11px] text-gray-500 truncate">
              Renaming: <span className="font-medium text-gray-800">{renamingItem.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
              />
              <button
                type="submit"
                className="p-1 text-emerald-600 hover:bg-gray-200 rounded transition"
                title="Save Rename"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRenamingItem(null)}
                className="p-1 text-gray-500 hover:bg-gray-200 rounded transition"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          <FolderTree
            parentId={null}
            depth={0}
            expandedIds={expandedFolderIds}
            onToggleExpand={handleToggleExpand}
            onStartCreate={handleStartCreate}
            onStartRename={handleStartRename}
          />
        </div>
      </aside>
    </>
  );
};
