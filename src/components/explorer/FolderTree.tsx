"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  ChevronRight,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getChildItems } from "@/store/workspaceSelectors";
import type { FileSystemItem } from "@/types/filesystem";

interface FolderTreeProps {
  parentId?: string | null;
  depth?: number;
  expandedIds?: Record<string, boolean>;
  onToggleExpand?: (folderId: string) => void;
  onStartCreate?: (parentId: string | null, type: "file" | "folder") => void;
  onStartRename?: (item: FileSystemItem) => void;
  onStartDelete?: (item: FileSystemItem) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />;
    case "json":
      return <FileJson className="w-4 h-4 text-amber-600 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500 shrink-0" />;
  }
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  parentId = null,
  depth = 0,
  expandedIds: controlledExpandedIds,
  onToggleExpand: controlledOnToggle,
  onStartCreate,
  onStartRename,
  onStartDelete,
}) => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<
    Record<string, boolean>
  >({});

  const expandedIds = controlledExpandedIds ?? internalExpandedIds;

  const handleToggle = useCallback(
    (folderId: string) => {
      if (controlledOnToggle) {
        controlledOnToggle(folderId);
      } else {
        setInternalExpandedIds((prev) => ({
          ...prev,
          [folderId]: !prev[folderId],
        }));
      }
    },
    [controlledOnToggle],
  );

  const items = useWorkspaceStore((state) => state.items);
  const selectedItemId = useWorkspaceStore((state) => state.selectedItemId);
  const activeFileId = useWorkspaceStore((state) => state.activeFileId);
  const selectItem = useWorkspaceStore((state) => state.selectItem);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);
  const deleteItem = useWorkspaceStore((state) => state.deleteItem);

  const children = useMemo(
    () => getChildItems(items, parentId),
    [items, parentId],
  );

  if (children.length === 0) {
    if (depth === 0) {
      return (
        <div className="py-6 px-3 text-center text-xs text-gray-400 select-none">
          No files or folders yet.
        </div>
      );
    }
    return (
      <div
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
        className="py-1 text-xs text-gray-400 italic select-none"
      >
        Empty folder
      </div>
    );
  }

  return (
    <ul className="flex flex-col space-y-0.5 select-none" role="tree">
      {children.map((item) => {
        const isFolder = item.type === "folder";
        const isExpanded = isFolder ? !!expandedIds[item.id] : false;
        const isSelectedFolder = isFolder && selectedItemId === item.id;
        const isActiveFile = !isFolder && activeFileId === item.id;

        return (
          <li
            key={item.id}
            role="treeitem"
            aria-expanded={isFolder ? isExpanded : undefined}
          >
            <div
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                selectItem(item.id);
                if (isFolder) {
                  handleToggle(item.id);
                } else {
                  setActiveFile(item.id);
                }
              }}
              className={`group flex items-center justify-between py-1.5 pr-2 rounded text-sm cursor-pointer transition-colors ${
                isSelectedFolder
                  ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none"
                  : isActiveFile
                    ? "bg-gray-100 text-gray-900 font-medium border-l-2 border-gray-500 rounded-l-none"
                    : selectedItemId === item.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                {isFolder ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item.id);
                    }}
                    className="p-0.5 -ml-1 text-gray-400 hover:text-gray-700 rounded transition-transform"
                    aria-label={
                      isExpanded ? "Collapse folder" : "Expand folder"
                    }
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-150 ${
                        isExpanded ? "rotate-90 text-gray-600" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}

                {isFolder ? (
                  isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  )
                ) : (
                  getFileIcon(item.name)
                )}

                <span className="truncate text-xs">{item.name}</span>
              </div>

              <div
                className={`flex items-center space-x-0.5 shrink-0 ml-1 transition-opacity ${
                  isSelectedFolder || isActiveFile || selectedItemId === item.id
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100"
                }`}
              >
                {isFolder && onStartCreate && (
                  <>
                    <button
                      type="button"
                      title="Add file inside"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectItem(item.id);
                        if (!isExpanded) handleToggle(item.id);
                        onStartCreate(item.id, "file");
                      }}
                      className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded text-gray-500 transition"
                      aria-label={`Add file inside ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Add folder inside"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectItem(item.id);
                        if (!isExpanded) handleToggle(item.id);
                        onStartCreate(item.id, "folder");
                      }}
                      className="p-1 hover:text-amber-600 hover:bg-amber-50 rounded text-gray-500 transition"
                      aria-label={`Add folder inside ${item.name}`}
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {onStartRename && (
                  <button
                    type="button"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRename(item);
                    }}
                    className="p-1 hover:text-gray-900 hover:bg-gray-200 rounded text-gray-500 transition"
                    aria-label={`Rename ${item.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  title={
                    isFolder ? "Delete folder and all contents" : "Delete file"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStartDelete) {
                      onStartDelete(item);
                    } else {
                      deleteItem(item.id);
                    }
                  }}
                  className="p-1 hover:text-red-600 hover:bg-red-50 rounded text-gray-400 transition"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isFolder && isExpanded && (
              <FolderTree
                parentId={item.id}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={handleToggle}
                onStartCreate={onStartCreate}
                onStartRename={onStartRename}
                onStartDelete={onStartDelete}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
