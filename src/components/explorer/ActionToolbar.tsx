'use client';

import React from 'react';
import {
  FilePlus2,
  FolderPlus,
  RotateCcw,
  FoldVertical,
} from 'lucide-react';

interface ActionToolbarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onCollapseAll: () => void;
  onReset: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onNewFile,
  onNewFolder,
  onCollapseAll,
  onReset,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 text-gray-600">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Workspace
      </span>
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={onNewFile}
          title="New File"
          className="p-1 hover:text-gray-900 hover:bg-gray-200 rounded text-gray-500 transition"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onNewFolder}
          title="New Folder"
          className="p-1 hover:text-gray-900 hover:bg-gray-200 rounded text-gray-500 transition"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          title="Collapse All Folders"
          className="p-1 hover:text-gray-900 hover:bg-gray-200 rounded text-gray-500 transition"
        >
          <FoldVertical className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onReset}
          title="Clear Workspace"
          className="p-1 hover:text-red-600 hover:bg-red-50 rounded text-gray-500 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
