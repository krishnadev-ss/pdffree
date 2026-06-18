import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FileDropzone } from '../components/FileDropzone';
import { useUpload } from '../hooks/useUpload';
import { createTransfer, unlockTransfer, type TransferResponse, type TransferUnlockResponse } from '../api/client';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transfer',
  component: TransferPage,
});

function TransferPage() {
  const [tab, setTab] = useState<'send' | 'receive'>('send');

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
          Instant Transfer
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Send files instantly with a 6-digit code. No login needed.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-8 flex items-center justify-center gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setTab('send')}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
            tab === 'send'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Send Files
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('receive')}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
            tab === 'receive'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Receive Files
          </span>
        </button>
      </div>

      {tab === 'send' ? <SendTab /> : <ReceiveTab />}
    </div>
  );
}

function SendTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'select' | 'uploading' | 'done'>('select');
  const [result, setResult] = useState<TransferResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { upload, uploading, progress } = useUpload();

  async function handleTransfer() {
    if (files.length === 0) return;
    setPhase('uploading');
    setError(null);
    try {
      const fileKeys: string[] = [];
      for (const file of files) {
        const key = await upload(file);
        fileKeys.push(key);
      }
      const res = await createTransfer(fileKeys, message);
      setResult(res);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer');
      setPhase('select');
    }
  }

  function copyKey() {
    if (!result) return;
    navigator.clipboard.writeText(result.unlock_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setFiles([]);
    setMessage('');
    setResult(null);
    setPhase('select');
    setError(null);
  }

  if (phase === 'done' && result) {
    return (
      <div className="animate-bounce-in space-y-6">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <svg className="h-8 w-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ready to Transfer!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Share this code with the person who should receive the files
            </p>
          </div>

          {/* Big unlock key display */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white px-8 py-5 dark:border-gray-600 dark:bg-gray-800">
              <span className="font-mono text-4xl font-extrabold tracking-[0.3em] text-gray-900 dark:text-white sm:text-5xl">
                {result.unlock_key}
              </span>
            </div>
            <button
              type="button"
              onClick={copyKey}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all ${
                copied
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              }`}
            >
              {copied ? 'Code Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Expires in 1 hour
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              One-time use only
            </span>
          </div>
        </div>

        <div className="text-center">
          <button type="button" onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Send more files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {phase === 'select' && (
        <>
          <FileDropzone accept="*/*" multiple={true} onFilesSelected={setFiles} />

          {files.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
              <label htmlFor="transfer-msg" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message (optional)
              </label>
              <input
                id="transfer-msg"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note for the receiver"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>
          )}

          {files.length > 0 && (
            <button type="button" onClick={handleTransfer}
              className="group relative w-full overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-200 transition-all hover:scale-[1.01] hover:bg-[var(--color-primary-dark)] active:scale-[0.99] dark:shadow-red-900/20 sm:py-5">
              <span className="relative flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Create Transfer Code
              </span>
            </button>
          )}
        </>
      )}

      {phase === 'uploading' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
          <div className="mb-4 h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-stripes h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {uploading ? `Uploading... ${progress}%` : 'Creating transfer...'}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

function ReceiveTab() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransferUnlockResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    if (key.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await unlockTransfer(key);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock transfer');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="animate-bounce-in space-y-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/30">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <svg className="h-6 w-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transfer Unlocked!</h3>
              {result.message && (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">"{result.message}"</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {result.download_urls.map((url, i) => (
              <a key={i} href={url} download
                className="flex items-center gap-3 rounded-xl border border-green-200 bg-white p-4 transition-all hover:shadow-md dark:border-green-800 dark:bg-gray-800">
                <svg className="h-5 w-5 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Download File {i + 1}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">Enter the 6-digit code</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Ask the sender for their transfer code
        </p>

        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="______"
          maxLength={6}
          className="mx-auto block w-48 rounded-xl border-2 border-gray-300 bg-white py-4 text-center font-mono text-3xl font-extrabold tracking-[0.3em] text-gray-900 placeholder-gray-300 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-600"
          autoFocus
        />
      </div>

      <button
        type="button"
        onClick={handleUnlock}
        disabled={key.length < 6 || loading}
        className="group relative w-full overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-200 transition-all hover:scale-[1.01] hover:bg-[var(--color-primary-dark)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:shadow-red-900/20 sm:py-5"
      >
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
          Unlock Transfer
        </span>
      </button>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
