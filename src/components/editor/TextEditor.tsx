'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Clock, FileCode2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface TextEditorProps {
  fileId: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const items = useWorkspaceStore((state) => state.items);
  const updateFileContent = useWorkspaceStore((state) => state.updateFileContent);

  const file = items.find((i) => i.id === fileId);
  const fileContent = file?.content ?? '';

  const [content, setContent] = useState(fileContent);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs select-none">
        <div className="flex items-center space-x-2">
          <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium text-gray-800">{file.name}</span>
        </div>

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

      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-white p-2 text-gray-900 resize-none focus:outline-none leading-relaxed font-mono text-xs border border-gray-200 rounded selection:bg-blue-100 overflow-auto"
          placeholder="Start typing your file content..."
        />
      </div>

      <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 select-none">
        <span>{content.length} characters</span>
      </div>
    </div>
  );
};
