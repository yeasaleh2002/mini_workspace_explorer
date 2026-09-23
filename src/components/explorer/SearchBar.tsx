'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, FileCode2, FileText, FileJson, Folder, X, CornerDownLeft } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getItemBreadcrumbs } from '@/store/workspaceSelectors';
import type { FileSystemItem } from '@/types/filesystem';

function getResultIcon(item: FileSystemItem) {
  if (item.type === 'folder') {
    return <Folder className="w-4 h-4 text-amber-500 shrink-0" />;
  }
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

interface SearchBarProps {
  onSelectResult?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useWorkspaceStore((state) => state.items);
  const selectItem = useWorkspaceStore((state) => state.selectItem);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !Array.isArray(items)) return [];

    return items
      .filter((item) => item && item.name.toLowerCase().includes(trimmed))
      .map((item) => {
        const pathCrumbs = getItemBreadcrumbs(items, item.parentId);
        const displayPath = pathCrumbs.length > 0
          ? pathCrumbs.map((c) => c.name).join(' / ')
          : 'Workspace root';
        return { item, displayPath };
      })
      .slice(0, 15);
  }, [items, query]);

  const handleSelectItem = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      selectItem(item.id);
    } else {
      setActiveFile(item.id);
      selectItem(item.id);
    }

    setIsOpen(false);
    setQuery('');
    onSelectResult?.();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search all files... (Ctrl+K)"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full bg-white border border-gray-300 rounded-md pl-8 pr-7 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400">
              No matching items found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="py-1 divide-y divide-gray-100">
              {searchResults.map(({ item, displayPath }) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0">
                      {getResultIcon(item)}
                      <div className="truncate">
                        <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {displayPath}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 shrink-0 text-[10px] text-gray-400">
                      <span className="capitalize">{item.type}</span>
                      <CornerDownLeft className="w-3 h-3 text-gray-300 group-hover:text-gray-600" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
