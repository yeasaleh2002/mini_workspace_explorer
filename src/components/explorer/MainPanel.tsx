'use client';

import React, { useState, useMemo } from 'react';
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
  AlertTriangle,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getChildItems } from '@/store/workspaceSelectors';
import { Breadcrumbs } from './Breadcrumbs';
import { SearchBar } from './SearchBar';
import { TextEditor } from '@/components/editor/TextEditor';
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
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
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

  const children = useMemo(
    () => getChildItems(items, currentFolderId),
    [items, currentFolderId]
  );

  const activeFile = activeFileId ? items.find((i) => i.id === activeFileId) : null;
  const showEditor = activeTab === 'editor' && activeFile;

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
      await renameItem(id, renameValue);
      setRenamingItemId(null);
      setRenameValue('');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Rename failed');
    }
  };

  const handleQuickCreate = async (type: 'file' | 'folder') => {
    const baseName = type === 'file' ? 'new-file.ts' : 'new-folder';
    try {
      const created = await createItem({
        name: baseName,
        type,
        parentId: currentFolderId,
        content: type === 'file' ? '' : undefined,
      });
      if (type === 'file') handleOpenFile(created.id);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Item creation failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
        <div className="flex items-center min-w-0 flex-1 mr-2">
          <Breadcrumbs
            currentFolderId={currentFolderId}
            onSelectFolder={handleNavigateToFolder}
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <SearchBar onSelectResult={() => setActiveTab('editor')} />

          <div className="flex items-center bg-gray-100 border border-gray-200 rounded p-0.5 text-gray-500">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-gray-900'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

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
            onClick={() => handleQuickCreate('file')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
          >
            <Plus className="w-3 h-3 text-blue-600" />
            <span>File</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickCreate('folder')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
          >
            <Plus className="w-3 h-3 text-amber-500" />
            <span>Folder</span>
          </button>
        </div>
      </div>

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
              Your workspace is empty. Create a folder to get started.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => handleQuickCreate('folder')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => handleQuickCreate('file')}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
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
                onClick={() => handleQuickCreate('file')}
                className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Create File
              </button>
              <button
                type="button"
                onClick={() => handleQuickCreate('folder')}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
              >
                Create Folder
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {children.map((item) => {
              const isFolder = item.type === 'folder';
              const isEditing = renamingItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isFolder) {
                      handleNavigateToFolder(item.id);
                    } else {
                      handleOpenFile(item.id);
                    }
                  }}
                  className="group relative flex flex-col items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition shadow-2xs"
                >
                  <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center space-x-0.5 bg-white rounded p-0.5 border border-gray-200 shadow-xs">
                    <button
                      type="button"
                      title="Rename"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(item);
                      }}
                      className="p-1 hover:text-gray-900 text-gray-500 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="p-1 hover:text-red-600 text-gray-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="my-2">{getItemIcon(item)}</div>

                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={renameValue}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(item.id);
                        if (e.key === 'Escape') setRenamingItemId(null);
                      }}
                      onBlur={() => handleSaveRename(item.id)}
                      className="w-full bg-white border border-blue-500 rounded px-1 text-xs text-gray-900 text-center focus:outline-none"
                    />
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
          <div className="p-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <div className="col-span-6 sm:col-span-7">Name</div>
                <div className="col-span-3 sm:col-span-2">Type</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {children.map((item) => {
                  const isFolder = item.type === 'folder';
                  const isEditing = renamingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isFolder) {
                          handleNavigateToFolder(item.id);
                        } else {
                          handleOpenFile(item.id);
                        }
                      }}
                      className="grid grid-cols-12 items-center px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer transition group"
                    >
                      <div className="col-span-6 sm:col-span-7 flex items-center space-x-2 truncate">
                        {getItemSmallIcon(item)}
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={renameValue}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(item.id);
                              if (e.key === 'Escape') setRenamingItemId(null);
                            }}
                            onBlur={() => handleSaveRename(item.id)}
                            className="bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none"
                          />
                        ) : (
                          <span className="text-gray-800 group-hover:text-blue-600 font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-2 capitalize text-gray-500">
                        {item.type}
                      </div>
                      <div className="col-span-3 flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(item);
                          }}
                          className="p-1 hover:text-gray-900 text-gray-400 rounded hover:bg-gray-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-1 hover:text-red-600 text-gray-400 rounded hover:bg-red-50"
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
    </div>
  );
};
