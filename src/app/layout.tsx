import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini Workspace Explorer',
  description: 'A client-side file system explorer with IndexedDB persistence and Zustand state management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-gray-50 text-gray-900 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
