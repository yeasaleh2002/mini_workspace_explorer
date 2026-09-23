"use client";

import React, { useState, useEffect } from "react";
import { Menu, AlertCircle, FolderGit2 } from "lucide-react";
import { Sidebar } from "@/components/explorer/Sidebar";
import { MainPanel } from "@/components/explorer/MainPanel";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function WorkspacePage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const initializeStore = useWorkspaceStore((state) => state.initializeStore);
  const isInitialized = useWorkspaceStore((state) => state.isInitialized);
  const error = useWorkspaceStore((state) => state.error);
  const clearError = useWorkspaceStore((state) => state.clearError);

  useEffect(() => {
    if (!isInitialized) {
      initializeStore();
    }
  }, [isInitialized, initializeStore]);

  return (
    <div
      className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans antialiased"
      suppressHydrationWarning
    >
      <header className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b border-gray-200 bg-white select-none">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            aria-label="Open sidebar file tree"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-50 text-blue-600">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-900 tracking-wide">
              Mini Workspace Explorer
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-3 py-1.5 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center space-x-2 truncate">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-[11px] text-red-600 hover:text-red-800 underline ml-2 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          <MainPanel />
        </main>
      </div>
    </div>
  );
}
