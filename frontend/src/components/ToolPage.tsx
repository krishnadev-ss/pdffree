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

  // Watch job status to transition phases
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

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Tools
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {phase === 'done' && job.downloadUrl ? (
        <div className="space-y-6 text-center">
          <DownloadButton
            downloadUrl={job.downloadUrl}
            fileSize={job.fileSizeBytes}
          />
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Process another file
          </button>
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
              {renderOptions && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Options
                  </h3>
                  {renderOptions(options, setOptions)}
                </div>
              )}

              {/* Action button */}
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleProcess}
                  className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-xl active:scale-[0.98] sm:w-auto"
                >
                  {title}
                </button>
              )}
            </>
          )}

          {/* Uploading state */}
          {phase === 'uploading' && (
            <div className="space-y-4">
              <JobProgress status="processing" progress={uploadProgress} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {uploading ? 'Uploading files...' : 'Upload complete, submitting job...'}
              </p>
            </div>
          )}

          {/* Processing state */}
          {phase === 'processing' && (
            <JobProgress
              status={job.status}
              progress={job.progress}
              error={job.error}
            />
          )}

          {/* Error with retry */}
          {job.error && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
