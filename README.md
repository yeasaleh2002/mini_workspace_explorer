# Mini Workspace Explorer

A browser-based file explorer and text editor. Everything runs client-side — no backend, no API calls. Files and folders are stored in IndexedDB so they survive page refreshes.

Built with Next.js, React, TypeScript, Zustand, and Tailwind CSS.

### Live Link: https://miniworkspaceexplorer.vercel.app/

--------------------------------------------------

## Getting Started

## How I Set This Up

Started by initializing the project with `npm init` and then installed everything manually:

`npm init -y`
`npm install next@latest react@latest react-dom@latest`
`npm install zustand idb lucide-react clsx tailwind-merge`
`npm install -D typescript @types/react @types/react-dom @types/node`
`npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer`

After that I set up the Next.js config, added `tsconfig.json` with strict mode, configured PostCSS for Tailwind v4, and created the `src/app/` directory for the App Router structure. Then built out the components one by one started with the data layer (types, store, IndexedDB utils), then the explorer UI, and finally the editor.

----------------------------------------------------


## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Zustand for state management
- IndexedDB
- Tailwind CSS for styling

-----------------------------------------------------

## Project Structure

- `src/app/` — page, layout, global styles
- `src/components/explorer/` — sidebar, folder tree, main panel, breadcrumbs, search, toolbar
- `src/components/editor/` — text editor
- `src/hooks/` — custom hook for store access
- `src/store/` — Zustand store and selectors
- `src/types/` — TypeScript interfaces
- `src/utils/` — IndexedDB helpers, input sanitization, seed data

------------------------------------------------------


## How State Management Works

### Zustand + IndexedDB

I went with Zustand over Redux because the API is way simpler for a project this size — no action types, no dispatchers, just a hook that gives you state and setters.

The flow is pretty straightforward:

1. On app load, the store pulls everything from IndexedDB and hydrates the in-memory state.
2. When you create/rename/delete something, the UI updates immediately (optimistic update), and a write-through to IndexedDB happens in the background.
3. IndexedDB was picked over localStorage because it's async, handles way more data, and supports structured objects natively.

----------------------------------------

### typescript

```typescript
interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null; // null = root level
  content?: string;
  createdAt: number;
  updatedAt: number;
}
```

-----------------------------------------

## Edge Cases

### Recursive folder deletion

When you delete a folder, all its contents need to go too. The store does a BFS traversal starting from the target folder, collects every descendant ID, then removes them all in one batch — both from memory and from IndexedDB in a single transaction.

If you happen to be viewing a folder that gets deleted, the app automatically navigates back to its parent (or root) so you don't end up staring at a blank screen.

### Breadcrumbs

Breadcrumbs are built by walking up the `parentId` chain from the current item to root, then reversing the result. Nothing fancy, just a while loop.

### Duplicate names

Before creating or renaming anything, the app checks all siblings (items with the same `parentId`) for name collisions. The check is case-insensitive — you can't have both "Notes" and "notes" in the same folder. If there's a conflict, you get an error message instead of a silent failure.

### Empty states

When a folder has nothing in it, the main panel shows a prompt to create a file or folder rather than just being blank.

-----------------------------------


## Security

Since users can type whatever they want as file/folder names, I added a `sanitizeItemName()` function that cleans up the input before saving. It strips out HTML tags, dangerous protocols like `javascript:`, path traversal stuff like `../`, and reserved OS characters. Also trims whitespace and caps names at 255 chars. Basically just making sure nobody can sneak in anything weird through the filename input.

-------------------------------------

## Performance

A few things I did to keep it snappy:

- Lazy-loaded the editor with `next/dynamic` so it doesn't get bundled into the initial page load
- Added a 400ms debounce on the text editor — typing doesn't write to IndexedDB on every keystroke, it waits until you pause
- On mobile the sidebar collapses into a drawer instead of always being visible, keeps the layout clean on smaller screens

---------------------------------

