import { Link } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdffree-dark') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pdffree-dark', String(dark));
  }, [dark]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--color-primary)]">PDFFree</span>
            <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline">
              | Free PDF Tools
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="rounded-lg p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          PDFFree &mdash; Free PDF tools. No login required. &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
