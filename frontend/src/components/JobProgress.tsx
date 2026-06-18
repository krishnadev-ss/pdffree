interface JobProgressProps {
  status: 'queued' | 'processing' | 'done' | 'failed' | null;
  progress: number;
  error?: string | null;
}

const steps = ['Upload', 'Queued', 'Processing', 'Done'] as const;

function stepIndex(status: JobProgressProps['status']): number {
  switch (status) {
    case 'queued': return 1;
    case 'processing': return 2;
    case 'done': return 3;
    case 'failed': return 2;
    default: return 0;
  }
}

export function JobProgress({ status, progress, error }: JobProgressProps) {
  if (!status) return null;

  const current = stepIndex(status);
  const isFailed = status === 'failed';

  return (
    <div className="w-full space-y-4">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`
                flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                ${
                  i < current
                    ? 'bg-green-500 text-white'
                    : i === current && isFailed
                    ? 'bg-red-500 text-white'
                    : i === current
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }
              `}
            >
              {i < current ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                i <= current
                  ? 'text-gray-800 dark:text-gray-200'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 hidden h-0.5 w-8 sm:block ${
                  i < current ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isFailed
              ? 'bg-red-500'
              : status === 'done'
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]'
          }`}
          style={{ width: `${status === 'done' ? 100 : progress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="text-center">
        {isFailed ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {error || 'Processing failed. Please try again.'}
          </p>
        ) : status === 'done' ? (
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete!
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {progress}% {status === 'queued' ? '- Waiting in queue...' : '- Processing...'}
          </p>
        )}
      </div>
    </div>
  );
}
