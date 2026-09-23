'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { FileSystemItem } from '@/types/filesystem';

interface DeleteConfirmModalProps {
  item: FileSystemItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  const isFolder = item.type === 'folder';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center space-x-2 text-red-600 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Delete {isFolder ? 'Folder' : 'File'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-700 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 break-all">
              &ldquo;{item.name}&rdquo;
            </span>
            ?
          </p>
          {isFolder && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              ⚠️ This will permanently remove this folder and all subfolders and files inside it.
            </p>
          )}
          <p className="text-[11px] text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
