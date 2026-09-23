# Mini Workspace Explorer

A browser-based file explorer and text editor. Everything runs client-side — no backend, no API calls. Files and folders are stored in IndexedDB so they survive page refreshes.

Built with Next.js, React, TypeScript, Zustand, and Tailwind CSS.

--------------------------------------------------

## Getting Started

## How I Set This Up

Started by initializing the project with `npm init` and then installed everything manually:

npm init -y
npm install next@latest react@latest react-dom@latest
npm install zustand idb lucide-react clsx tailwind-merge
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer

After that I set up the Next.js config, added `tsconfig.json` with strict mode, configured PostCSS for Tailwind v4, and created the `src/app/` directory for the App Router structure. Then built out the components one by one started with the data layer (types, store, IndexedDB utils), then the explorer UI, and finally the editor.

----------------------------------------------------



