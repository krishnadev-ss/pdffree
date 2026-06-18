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
    <div className="flex flex-col items-center gap-2">
      <a
        href={downloadUrl}
        download={fileName || true}
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl active:scale-95"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
        {fileSize != null && (
          <span className="text-sm font-normal opacity-80">({formatSize(fileSize)})</span>
        )}
      </a>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Link expires in 1 hour
      </p>
    </div>
  );
}
