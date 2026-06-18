import { createRoute, useParams } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { getShare, type ShareStatus } from '../api/client';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share/$id',
  component: ShareViewPage,
});

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ShareViewPage() {
  const { id } = useParams({ from: '/share/$id' });
  const [share, setShare] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getShare(id);
        setShare(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load share');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Can't access this share</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (!share) return null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800/80">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shared Files</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Someone shared {share.file_keys.length} file{share.file_keys.length > 1 ? 's' : ''} with you
            </p>
          </div>
        </div>

        {/* Message */}
        {share.message && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm italic text-gray-600 dark:text-gray-300">"{share.message}"</p>
          </div>
        )}

        {/* Download links */}
        <div className="space-y-2">
          {(share.download_urls || []).map((url, i) => (
            <a
              key={i}
              href={url}
              download
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                  {share.file_keys[i]?.split('/').pop() || `File ${i + 1}`}
                </p>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
          <span>Expires: {new Date(share.expires_at).toLocaleString()}</span>
          {share.max_downloads > 0 && (
            <span>Downloads: {share.download_count}/{share.max_downloads}</span>
          )}
        </div>
      </div>
    </div>
  );
}
