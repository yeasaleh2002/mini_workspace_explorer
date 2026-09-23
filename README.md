# Mini Workspace Explorer

A browser-based file explorer and text editor. Everything runs client-side — no backend, no API calls. Files and folders are stored in IndexedDB so they survive page refreshes.

Built with Next.js, React, TypeScript, Zustand, and Tailwind CSS.

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



