import { useRef, useState, useCallback, type DragEvent } from 'react';

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['html', 'htm'].includes(ext)) return 'html';
  return 'file';
}

function FileIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    pdf: 'text-red-500',
    word: 'text-blue-600',
    excel: 'text-green-600',
    ppt: 'text-orange-500',
    image: 'text-purple-500',
    html: 'text-cyan-600',
    file: 'text-gray-400',
  };
  return (
    <svg className={`h-5 w-5 ${colors[type] || colors.file}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  );
}

export function FileDropzone({
  accept = 'application/pdf',
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const files = Array.from(fileList);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const oversized = files.find((f) => f.size > maxBytes);
    if (oversized) {
      setError(`"${oversized.name}" is too large. Maximum file size is ${maxSizeMB}MB.`);
      return;
    }
    if (files.length === 0) return;
    const newFiles = multiple ? [...selectedFiles, ...files] : files;
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [maxSizeMB, multiple, selectedFiles, onFilesSelected]);

  function removeFile(index: number) {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files);
  }

  const hasFiles = selectedFiles.length > 0;

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        aria-label={`Drop ${multiple ? 'files' : 'a file'} here or click to browse`}
        className={`
          relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out
          ${hasFiles ? 'p-6' : 'p-10 sm:p-14'}
          ${
            dragOver
              ? 'scale-[1.02] border-[var(--color-primary)] bg-red-50/50 shadow-lg shadow-red-100 dark:bg-red-950/20 dark:shadow-red-900/10'
              : hasFiles
              ? 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600'
              : 'border-gray-300 bg-white hover:border-[var(--color-primary)] hover:bg-red-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-[var(--color-primary)] dark:hover:bg-red-950/10'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { validateAndSet(e.target.files); if (inputRef.current) inputRef.current.value = ''; }}
        />

        {/* Background shimmer on hover */}
        {!hasFiles && !dragOver && (
          <div className="animate-shimmer pointer-events-none absolute inset-0" />
        )}

        <div className="relative flex flex-col items-center gap-4">
          {/* Upload illustration */}
          <div className={`${dragOver ? 'animate-float' : ''} transition-transform duration-300`}>
            <div className="relative">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dragOver ? 'bg-[var(--color-primary)]' : 'bg-gray-100 dark:bg-gray-700'} transition-colors duration-300`}>
                <svg
                  className={`h-8 w-8 ${dragOver ? 'text-white' : 'text-gray-400 dark:text-gray-500'} transition-colors duration-300`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {dragOver ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  )}
                </svg>
              </div>
              {/* Decorative dots */}
              {!hasFiles && (
                <>
                  <div className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-red-200 dark:bg-red-800" />
                  <div className="absolute -bottom-1 -left-3 h-2 w-2 rounded-full bg-blue-200 dark:bg-blue-800" />
                </>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            {dragOver ? (
              <p className="text-lg font-bold text-[var(--color-primary)]">
                Drop it right here!
              </p>
            ) : hasFiles ? (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {multiple ? 'Click or drop to add more files' : 'Click or drop to change file'}
              </p>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl">
                  {multiple ? 'Drop your files here' : 'Drop your file here'}
                </p>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  or{' '}
                  <span className="font-semibold text-[var(--color-primary)] underline decoration-dotted underline-offset-2">
                    click to browse
                  </span>{' '}
                  your computer
                </p>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Maximum {maxSizeMB}MB per file
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/50">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatSize(selectedFiles.reduce((sum, f) => sum + f.size, 0))} total
            </p>
          </div>

          <ul className="space-y-1.5">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <FileIcon type={getFileIcon(file.name)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
