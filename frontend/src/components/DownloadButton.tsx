interface DownloadButtonProps {
  downloadUrl: string;
  fileName?: string;
  fileSize?: number | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadButton({ downloadUrl, fileName, fileSize }: DownloadButtonProps) {
  return (
    <div className="animate-bounce-in flex flex-col items-center gap-5">
      {/* Success illustration */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-10 w-10 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {/* Decorative ring */}
        <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-green-300 dark:border-green-700" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Your file is ready!
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Click the button below to download
        </p>
      </div>

      {/* Download button */}
      <a
        href={downloadUrl}
        download={fileName || true}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-success)] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-green-200 transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--color-success-light)] hover:shadow-2xl hover:shadow-green-200 active:scale-[0.98] dark:shadow-green-900/20 dark:hover:shadow-green-900/30"
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <svg className="relative h-6 w-6 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="relative">Download File</span>
        {fileSize != null && (
          <span className="relative rounded-lg bg-white/20 px-2.5 py-1 text-sm font-medium">
            {formatSize(fileSize)}
          </span>
        )}
      </a>

      {/* Security & expiry info */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Link expires in 1 hour
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          File auto-deleted after download
        </span>
      </div>
    </div>
  );
}
