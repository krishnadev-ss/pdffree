import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FileDropzone } from '../components/FileDropzone';
import { useUpload } from '../hooks/useUpload';
import { createShare, type ShareResponse } from '../api/client';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share',
  component: SharePage,
});

function SharePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxDownloads, setMaxDownloads] = useState(0);
  const [phase, setPhase] = useState<'select' | 'uploading' | 'done'>('select');
  const [shareResult, setShareResult] = useState<ShareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { upload, uploading, progress } = useUpload();

  async function handleShare() {
    if (files.length === 0) return;
    setPhase('uploading');
    setError(null);
    try {
      const fileKeys: string[] = [];
      for (const file of files) {
        const key = await upload(file);
        fileKeys.push(key);
      }
      const result = await createShare(fileKeys, { expiresIn, maxDownloads, message });
      setShareResult(result);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
      setPhase('select');
    }
  }

  function copyLink() {
    if (!shareResult) return;
    const url = `${window.location.origin}${shareResult.share_url}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setFiles([]);
    setMessage('');
    setShareResult(null);
    setPhase('select');
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Tools
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
          Share Files
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Upload files and get a shareable link. No login needed.
        </p>
      </div>

      {phase === 'done' && shareResult ? (
        <div className="animate-bounce-in space-y-6">
          {/* Success */}
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <svg className="h-8 w-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Link Created!</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Share this link with anyone</p>
            </div>

            {/* Link display */}
            <div className="flex w-full items-stretch gap-2">
              <div className="flex-1 truncate rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {window.location.origin}{shareResult.share_url}
              </div>
              <button
                type="button"
                onClick={copyLink}
                className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all ${
                  copied
                    ? 'bg-[var(--color-success)]'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              Expires: {new Date(shareResult.expires_at).toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Share more files
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {phase === 'select' && (
            <>
              <FileDropzone
                accept="*/*"
                multiple={true}
                onFilesSelected={setFiles}
              />

              {files.length > 0 && (
                <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Settings</h3>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="share-msg" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message (optional)
                    </label>
                    <input
                      id="share-msg"
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a note for the recipient"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                    />
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Link expires after
                    </label>
                    <div className="flex gap-2">
                      {[1, 24, 48, 72].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setExpiresIn(h)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            expiresIn === h
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {h === 1 ? '1 hour' : `${h}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max downloads */}
                  <div>
                    <label htmlFor="max-dl" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max downloads (0 = unlimited)
                    </label>
                    <input
                      id="max-dl"
                      type="number"
                      min={0}
                      max={100}
                      value={maxDownloads}
                      onChange={(e) => setMaxDownloads(parseInt(e.target.value) || 0)}
                      className="w-24 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="group relative w-full overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:scale-[1.01] hover:bg-[var(--color-primary-dark)] hover:shadow-xl active:scale-[0.99] dark:shadow-red-900/20 sm:py-5"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Create Share Link
                  </span>
                </button>
              )}
            </>
          )}

          {phase === 'uploading' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
              <div className="mb-4 h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="animate-stripes h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {uploading ? `Uploading... ${progress}%` : 'Creating share link...'}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
