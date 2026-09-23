export type FileSystemItemType = 'folder' | 'file';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileSystemItemType;
  parentId: string | null;
  content?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateItemInput {
  name: string;
  type: FileSystemItemType;
  parentId: string | null;
  content?: string;
}

export interface RenameItemInput {
  id: string;
  newName: string;
}

export interface UpdateContentInput {
  id: string;
  content: string;
}

export interface FileSystemTreeNode extends FileSystemItem {
  children?: FileSystemTreeNode[];
}

export interface WorkspaceState {
  items: FileSystemItem[];
  selectedItemId: string | null;
  activeFileId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface WorkspaceActions {
  initializeStore: () => Promise<void>;
  createItem: (input: CreateItemInput) => Promise<FileSystemItem>;
  deleteItem: (id: string) => Promise<void>;
  renameItem: (id: string, newName: string) => Promise<void>;
  updateFileContent: (id: string, content: string) => Promise<void>;
  setActiveFile: (id: string | null) => void;
  selectItem: (id: string | null) => void;
  clearError: () => void;
  resetWorkspace: () => Promise<void>;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;
