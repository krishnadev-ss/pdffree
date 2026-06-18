import { type ReactNode, useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { FileDropzone } from './FileDropzone';
import { JobProgress } from './JobProgress';
import { DownloadButton } from './DownloadButton';
import { useUpload } from '../hooks/useUpload';
import { useJob } from '../hooks/useJob';

interface ToolPageProps {
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  operation: string;
  renderOptions?: (
    options: Record<string, string>,
    setOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => ReactNode;
}

type Phase = 'select' | 'uploading' | 'processing' | 'done';

export function ToolPage({
  title,
  description,
  accept = 'application/pdf',
  multiple = false,
  operation,
  renderOptions,
}: ToolPageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>('select');

  const { upload, uploading, progress: uploadProgress } = useUpload();
  const job = useJob(operation);

  async function handleProcess() {
    if (files.length === 0) return;

    setPhase('uploading');
    try {
      const fileKeys: string[] = [];
      for (const file of files) {
        const key = await upload(file);
        fileKeys.push(key);
      }
      setPhase('processing');
      await job.submit(fileKeys, Object.keys(options).length > 0 ? options : undefined);
    } catch {
      setPhase('select');
    }
  }

  useEffect(() => {
    if (job.status === 'done' && phase === 'processing') {
      setPhase('done');
    }
    if (job.status === 'failed' && phase === 'processing') {
      setPhase('select');
    }
  }, [job.status, phase]);

  function handleReset() {
    setFiles([]);
    setOptions({});
    setPhase('select');
    job.reset();
  }

  const stepLabels = [
    { num: 1, label: 'Choose file', active: phase === 'select' },
    { num: 2, label: renderOptions ? 'Set options' : 'Ready', active: phase === 'select' && files.length > 0 },
    { num: 3, label: 'Process', active: phase === 'uploading' || phase === 'processing' },
    { num: 4, label: 'Download', active: phase === 'done' },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Tools
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      {/* Step indicator - mini breadcrumb */}
      {phase !== 'done' && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {stepLabels.map((step, i) => (
            <div key={step.num} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    step.active
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : phase === 'done' || (phase !== 'select' && step.num <= 2)
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {(phase === 'done' || (phase !== 'select' && step.num <= 2)) && step.num < 4 ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`hidden text-xs font-medium sm:inline ${
                  step.active ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className="h-px w-4 bg-gray-200 dark:bg-gray-800 sm:w-6" />
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'done' && job.downloadUrl ? (
        <div className="space-y-8">
          <DownloadButton
            downloadUrl={job.downloadUrl}
            fileSize={job.fileSizeBytes}
          />
          <div className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Process another file
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File selection */}
          {phase === 'select' && (
            <>
              <FileDropzone
                accept={accept}
                multiple={multiple}
                onFilesSelected={setFiles}
              />

              {/* Options */}
              {renderOptions && files.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                  <div className="mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Settings
                    </h3>
                  </div>
                  {renderOptions(options, setOptions)}
                </div>
              )}

              {/* Action button */}
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleProcess}
                  className="group relative w-full overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:scale-[1.01] hover:bg-[var(--color-primary-dark)] hover:shadow-xl hover:shadow-red-200 active:scale-[0.99] dark:shadow-red-900/20 sm:py-5"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {title}
                  </span>
                </button>
              )}

              {/* Helpful tips */}
              {files.length === 0 && (
                <div className="flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure & Private
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Files deleted after 1 hour
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    No sign-up needed
                  </span>
                </div>
              )}
            </>
          )}

          {/* Uploading state */}
          {phase === 'uploading' && (
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
              <JobProgress status="processing" progress={uploadProgress} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {uploading ? 'Uploading your files securely...' : 'Upload complete! Starting processing...'}
              </p>
            </div>
          )}

          {/* Processing state */}
          {phase === 'processing' && (
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
              <JobProgress
                status={job.status}
                progress={job.progress}
                error={job.error}
              />
            </div>
          )}

          {/* Error with retry */}
          {job.error && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
