import { openDB, type IDBPDatabase } from 'idb';
import type { FileSystemItem } from '@/types/filesystem';

const DB_NAME = 'MiniWorkspaceDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_items';

interface WorkspaceDBSchema {
  [STORE_NAME]: {
    key: string;
    value: FileSystemItem;
    indexes: {
      'by-parentId': string | null;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<WorkspaceDBSchema>> | null = null;

function getDB(): Promise<IDBPDatabase<WorkspaceDBSchema>> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB<WorkspaceDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-parentId', 'parentId');
        }
      },
    });
  }

  return dbPromise;
}

export async function getAllItemsFromDB(): Promise<FileSystemItem[]> {
  const db = await getDB();
  if (!db) return [];
  const items = await db.getAll(STORE_NAME);
  return Array.isArray(items) ? items : [];
}

export async function getItemFromDB(id: string): Promise<FileSystemItem | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return db.get(STORE_NAME, id);
}

export async function putItemToDB(item: FileSystemItem): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put(STORE_NAME, item);
}

export async function putItemsToDB(items: FileSystemItem[]): Promise<void> {
  const db = await getDB();
  if (!db || items.length === 0) return;

  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...items.map((item) => tx.store.put(item)),
    tx.done,
  ]);
}

export async function deleteItemFromDB(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete(STORE_NAME, id);
}

export async function deleteItemsFromDB(ids: string[]): Promise<void> {
  const db = await getDB();
  if (!db || ids.length === 0) return;

  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...ids.map((id) => tx.store.delete(id)),
    tx.done,
  ]);
}

export async function clearAllItemsFromDB(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.clear(STORE_NAME);
}
