'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Folder,
  FileCode2,
  FileText,
  FileJson,
  Plus,
  Trash2,
  Edit2,
  FolderArchive,
  FolderPlus,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getChildItems } from '@/store/workspaceSelectors';
import { Breadcrumbs } from './Breadcrumbs';
import { SearchBar } from './SearchBar';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { TextEditor } from '@/components/editor/TextEditor';
import { getSuggestedItemName } from '@/utils/naming';
import type { FileSystemItem } from '@/types/filesystem';

function getItemIcon(item: FileSystemItem) {
  if (item.type === 'folder') return <Folder className="w-8 h-8 text-amber-500 shrink-0" />;
  const ext = item.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode2 className="w-8 h-8 text-blue-600 shrink-0" />;
    case 'json':
      return <FileJson className="w-8 h-8 text-amber-600 shrink-0" />;
    default:
      return <FileText className="w-8 h-8 text-gray-500 shrink-0" />;
  }
}

function getItemSmallIcon(item: FileSystemItem) {
  if (item.type === 'folder') return <Folder className="w-4 h-4 text-amber-500 shrink-0" />;
  const ext = item.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-amber-600 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500 shrink-0" />;
  }
}

export const MainPanel: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'folder' | 'editor'>('folder');

  // Renaming state
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Deletion modal state
  const [deletingItem, setDeletingItem] = useState<FileSystemItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const items = useWorkspaceStore((state) => state.items);
  const selectedItemId = useWorkspaceStore((state) => state.selectedItemId);
  const activeFileId = useWorkspaceStore((state) => state.activeFileId);
  const selectItem = useWorkspaceStore((state) => state.selectItem);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);
  const deleteItem = useWorkspaceStore((state) => state.deleteItem);
  const renameItem = useWorkspaceStore((state) => state.renameItem);
  const createItem = useWorkspaceStore((state) => state.createItem);

  const currentFolderId = useMemo(() => {
    if (!selectedItemId) return null;
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return null;
    return item.type === 'folder' ? item.id : item.parentId;
  }, [items, selectedItemId]);

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return items.find((i) => i.id === currentFolderId) ?? null;
  }, [items, currentFolderId]);

  const children = useMemo(
    () => getChildItems(items, currentFolderId),
    [items, currentFolderId]
  );

  const activeFile = activeFileId ? items.find((i) => i.id === activeFileId) : null;
  const showEditor = activeTab === 'editor' && activeFile;

  // Auto-focus and select suggested name when creation starts
  useEffect(() => {
    if (isCreating) {
      setTimeout(() => {
        if (createInputRef.current) {
          createInputRef.current.focus();
          createInputRef.current.select();
        }
      }, 50);
    }
  }, [isCreating]);

  const handleNavigateToFolder = (folderId: string | null) => {
    selectItem(folderId);
    setActiveTab('folder');
  };

  const handleOpenFile = (fileId: string) => {
    setActiveFile(fileId);
    selectItem(fileId);
    setActiveTab('editor');
  };

  const handleStartRename = (item: FileSystemItem) => {
    setRenamingItemId(item.id);
    setRenameValue(item.name);
  };

  const handleSaveRename = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      await renameItem(id, renameValue.trim());
      setRenamingItemId(null);
      setRenameValue('');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Rename failed');
    }
  };

  const handleStartCreate = (type: 'file' | 'folder') => {
    setCreateType(type);
    const suggested = getSuggestedItemName(items, currentFolderId, type);
    setNewItemName(suggested);
    setCreateError(null);
    setIsCreating(true);
    setActiveTab('folder');
  };

  const handleConfirmCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setCreateError(null);
      const created = await createItem({
        name: newItemName.trim(),
        type: createType,
        parentId: currentFolderId,
        content: createType === 'file' ? '' : undefined,
      });

      setIsCreating(false);
      setNewItemName('');

      if (createType === 'file') {
        handleOpenFile(created.id);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Item creation failed');
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewItemName('');
    setCreateError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const isDeletingCurrentFolder = deletingItem.id === currentFolderId;
    const parentIdOfCurrent = currentFolder?.parentId ?? null;

    try {
      await deleteItem(deletingItem.id);
      if (isDeletingCurrentFolder) {
        handleNavigateToFolder(parentIdOfCurrent);
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none font-sans">
      {/* Top Header / Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
        <div className="flex items-center min-w-0 flex-1 mr-2">
          <Breadcrumbs
            currentFolderId={currentFolderId}
            onSelectFolder={handleNavigateToFolder}
          />

          {/* Current folder actions (allow rename/delete current folder from anywhere) */}
          {currentFolder && (
            <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => handleStartRename(currentFolder)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                title={`Rename folder "${currentFolder.name}"`}
                aria-label={`Rename folder ${currentFolder.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingItem(currentFolder)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                title={`Delete folder "${currentFolder.name}"`}
                aria-label={`Delete folder ${currentFolder.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <SearchBar onSelectResult={() => setActiveTab('editor')} />

          <div className="flex items-center bg-gray-100 border border-gray-200 rounded p-0.5 text-gray-500">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'}`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header Tabs & Creation Buttons */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('folder')}
            className={`px-2.5 py-1 rounded transition font-medium ${
              activeTab === 'folder'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Folder View ({children.length})
          </button>

          {activeFile && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition font-medium ${
                  activeTab === 'editor'
                    ? 'bg-white text-blue-600 shadow-xs border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{activeFile.name}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFile(null);
                  setActiveTab('folder');
                }}
                className="p-1 hover:text-gray-900 rounded text-gray-400"
                title="Close file tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleStartCreate('file')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
            title="Create new file with name suggestion"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>File</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartCreate('folder')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
            title="Create new folder with name suggestion"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>Folder</span>
          </button>
        </div>
      </div>

      {/* Inline Creation Input Field (Prompt with suggestion, NOT directly saved) */}
      {isCreating && (
        <div className="mx-4 mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg shadow-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <form onSubmit={handleConfirmCreate} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1.5 font-medium text-blue-900">
                {createType === 'file' ? (
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-500" />
                )}
                <span>
                  Create New {createType === 'file' ? 'File' : 'Folder'} in{' '}
                  <span className="font-semibold text-gray-800">
                    {currentFolder?.name ?? 'Workspace Root'}
                  </span>
                </span>
              </span>
              <span className="text-[11px] text-blue-600 hidden sm:inline">
                Press Enter to confirm, Esc to cancel
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <input
                ref={createInputRef}
                type="text"
                autoFocus
                placeholder={createType === 'file' ? 'new-file.ts' : 'new-folder'}
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  if (createError) setCreateError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelCreate();
                }}
                className="flex-1 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <button
                type="submit"
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition shadow-2xs"
                title="Create item"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition shadow-2xs"
                title="Cancel creation"
              >
                Cancel
              </button>
            </div>

            {createError && (
              <div className="flex items-center space-x-1.5 text-xs text-red-600 pt-0.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-amber-600 hover:text-amber-900 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {showEditor ? (
          <TextEditor fileId={activeFile.id} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <FolderPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">Your workspace is empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              Your workspace is empty. Create a folder or file to get started.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => handleStartCreate('folder')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => handleStartCreate('file')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition shadow-2xs"
              >
                Create File
              </button>
            </div>
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <FolderArchive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">This folder is empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              Create a new file or folder using the toolbar buttons.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => handleStartCreate('file')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
              >
                Create File
              </button>
              <button
                type="button"
                onClick={() => handleStartCreate('folder')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition shadow-2xs"
              >
                Create Folder
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with full mobile responsive delete and rename */
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {children.map((item) => {
              const isFolder = item.type === 'folder';
              const isEditing = renamingItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isEditing) return;
                    if (isFolder) {
                      handleNavigateToFolder(item.id);
                    } else {
                      handleOpenFile(item.id);
                    }
                  }}
                  className="group relative flex flex-col items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition shadow-2xs"
                >
                  {/* Action buttons: ALWAYS VISIBLE on mobile (flex md:hidden), visible on hover on desktop (md:group-hover:flex) */}
                  {!isEditing && (
                    <div className="absolute top-1.5 right-1.5 flex md:hidden md:group-hover:flex items-center space-x-0.5 bg-white/95 backdrop-blur-xs rounded-md p-0.5 border border-gray-200 shadow-xs z-10">
                      <button
                        type="button"
                        title={`Rename ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(item);
                        }}
                        className="p-1 hover:text-blue-600 hover:bg-blue-50 text-gray-600 rounded transition"
                        aria-label={`Rename ${item.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title={`Delete ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItem(item);
                        }}
                        className="p-1 hover:text-red-600 hover:bg-red-50 text-gray-600 rounded transition"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="my-2">{getItemIcon(item)}</div>

                  {isEditing ? (
                    <div
                      className="w-full space-y-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(item.id);
                          if (e.key === 'Escape') setRenamingItemId(null);
                        }}
                        className="w-full bg-white border border-blue-500 rounded px-1.5 py-1 text-xs text-gray-900 text-center focus:outline-none shadow-2xs"
                      />
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save Rename (Enter)"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingItemId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          title="Cancel (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-gray-800 group-hover:text-blue-600 text-center truncate w-full">
                      {item.name}
                    </span>
                  )}

                  <span className="text-[10px] text-gray-400 capitalize mt-1">
                    {item.type}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View with full mobile responsive delete and rename */
          <div className="p-4">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <div className="col-span-8 sm:col-span-7">Name</div>
                <div className="hidden sm:block sm:col-span-2">Type</div>
                <div className="col-span-4 sm:col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {children.map((item) => {
                  const isFolder = item.type === 'folder';
                  const isEditing = renamingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isEditing) return;
                        if (isFolder) {
                          handleNavigateToFolder(item.id);
                        } else {
                          handleOpenFile(item.id);
                        }
                      }}
                      className="grid grid-cols-12 items-center px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer transition group"
                    >
                      <div className="col-span-8 sm:col-span-7 flex items-center space-x-2 truncate">
                        {getItemSmallIcon(item)}
                        {isEditing ? (
                          <div
                            className="flex items-center space-x-1 flex-1 min-w-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(item.id);
                                if (e.key === 'Escape') setRenamingItemId(null);
                              }}
                              className="bg-white border border-blue-500 rounded px-2 py-0.5 text-xs text-gray-900 focus:outline-none flex-1 min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingItemId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-800 group-hover:text-blue-600 font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </div>

                      <div className="hidden sm:block sm:col-span-2 capitalize text-gray-500">
                        {item.type}
                      </div>

                      <div className="col-span-4 sm:col-span-3 flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(item);
                          }}
                          className="p-1.5 hover:text-blue-600 text-gray-500 rounded hover:bg-blue-50 transition"
                          title={`Rename ${item.name}`}
                          aria-label={`Rename ${item.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingItem(item);
                          }}
                          className="p-1.5 hover:text-red-600 text-gray-500 rounded hover:bg-red-50 transition"
                          title={`Delete ${item.name}`}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
