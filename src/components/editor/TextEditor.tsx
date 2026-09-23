'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Clock, FileCode2, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { DeleteConfirmModal } from '@/components/explorer/DeleteConfirmModal';

interface TextEditorProps {
  fileId: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const items = useWorkspaceStore((state) => state.items);
  const updateFileContent = useWorkspaceStore((state) => state.updateFileContent);
  const renameItem = useWorkspaceStore((state) => state.renameItem);
  const deleteItem = useWorkspaceStore((state) => state.deleteItem);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);

  const file = items.find((i) => i.id === fileId);
  const fileContent = file?.content ?? '';

  const [content, setContent] = useState(fileContent);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Renaming state in editor
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  // Deleting state in editor
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setContent(fileContent);
    setSaveStatus('saved');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [fileId, fileContent]);

  const handleContentChange = (newText: string) => {
    setContent(newText);
    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      await updateFileContent(fileId, newText);
      setSaveStatus('saved');
    }, 400);
  };

  const handleStartRename = () => {
    if (!file) return;
    setRenameValue(file.name);
    setRenameError(null);
    setIsRenaming(true);
  };

  const handleConfirmRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renameValue.trim() || !file) return;

    try {
      setRenameError(null);
      await renameItem(file.id, renameValue.trim());
      setIsRenaming(false);
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Rename failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!file) return;
    try {
      await deleteItem(file.id);
      setActiveFile(null);
    } catch {
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!file || file.type !== 'file') return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs select-none">
        <div className="flex items-center space-x-2 min-w-0">
          <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />

          {isRenaming ? (
            <form onSubmit={handleConfirmRename} className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  if (renameError) setRenameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="bg-white border border-blue-500 rounded px-2 py-0.5 text-xs text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Save (Enter)"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                title="Cancel (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">
              {file.name}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Action buttons to allow rename/delete file from editor */}
          {!isRenaming && (
            <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
              <button
                type="button"
                onClick={handleStartRename}
                className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded text-gray-500 transition"
                title="Rename file"
                aria-label="Rename file"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="p-1 hover:text-red-600 hover:bg-red-50 rounded text-gray-400 transition"
                title="Delete file"
                aria-label="Delete file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-1.5 text-[11px]">
            {saveStatus === 'saving' ? (
              <span className="flex items-center space-x-1 text-amber-600">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-600">
                <Check className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {renameError && (
        <div className="px-4 py-1.5 bg-red-50 border-b border-red-200 flex items-center space-x-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{renameError}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-white p-3 text-gray-900 resize-none focus:outline-none leading-relaxed font-mono text-xs border border-gray-200 rounded-lg selection:bg-blue-100 overflow-auto shadow-2xs"
          placeholder="Start typing your file content..."
        />
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 select-none">
        <span>Path: {file.name}</span>
        <span>{content.length} characters</span>
      </div>

      <DeleteConfirmModal
        item={file}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
