import { useRef, useState, type DragEvent } from 'react';

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

  function validateAndSet(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);
    const files = Array.from(fileList);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const oversized = files.find((f) => f.size > maxBytes);
    if (oversized) {
      setError(`File "${oversized.name}" exceeds ${maxSizeMB}MB limit`);
      return;
    }
    const newFiles = multiple ? [...selectedFiles, ...files] : files;
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }

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

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center
          transition-all duration-200
          ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Drop your {multiple ? 'files' : 'file'} here
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              or click to browse (max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">&#128196;</span>
                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {formatSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="ml-2 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
