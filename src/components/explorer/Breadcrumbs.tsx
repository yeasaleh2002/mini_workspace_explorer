'use client';

import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getItemBreadcrumbs } from '@/store/workspaceSelectors';

interface BreadcrumbsProps {
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentFolderId,
  onSelectFolder,
}) => {
  const items = useWorkspaceStore((state) => state.items);
  const breadcrumbs = getItemBreadcrumbs(items, currentFolderId);

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto py-1 select-none">
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={`flex items-center space-x-1 hover:text-gray-900 transition py-1 px-1.5 rounded hover:bg-gray-100 ${
          currentFolderId === null ? 'text-blue-600 font-medium' : 'text-gray-600'
        }`}
      >
        <Home className="w-3.5 h-3.5 shrink-0" />
        <span>Workspace</span>
      </button>

      {breadcrumbs.map((item, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={item.id}>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <button
              type="button"
              onClick={() => onSelectFolder(item.id)}
              className={`flex items-center space-x-1 max-w-[140px] truncate hover:text-gray-900 transition py-1 px-1.5 rounded hover:bg-gray-100 ${
                isLast ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {item.type === 'folder' && (
                <Folder className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span className="truncate">{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
