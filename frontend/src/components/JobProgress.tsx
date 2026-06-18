interface JobProgressProps {
  status: 'queued' | 'processing' | 'done' | 'failed' | null;
  progress: number;
  error?: string | null;
}

const steps = [
  { label: 'Uploaded', icon: 'upload' },
  { label: 'In Queue', icon: 'queue' },
  { label: 'Processing', icon: 'processing' },
  { label: 'Done', icon: 'done' },
] as const;

function stepIndex(status: JobProgressProps['status']): number {
  switch (status) {
    case 'queued': return 1;
    case 'processing': return 2;
    case 'done': return 3;
    case 'failed': return 2;
    default: return 0;
  }
}

function StepIcon({ type, active, done, failed }: { type: string; active: boolean; done: boolean; failed: boolean }) {
  if (done) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (failed) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  if (active && type === 'processing') {
    return (
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }

  if (active && type === 'queue') {
    return (
      <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  return (
    <span className="text-xs font-bold">
      {type === 'upload' ? '1' : type === 'queue' ? '2' : type === 'processing' ? '3' : '4'}
    </span>
  );
}

export function JobProgress({ status, progress, error }: JobProgressProps) {
  if (!status) return null;

  const current = stepIndex(status);
  const isFailed = status === 'failed';
  const isDone = status === 'done';

  return (
    <div className="w-full space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500
                  ${
                    i < current
                      ? 'bg-[var(--color-success)] text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
                      : i === current && isFailed
                      ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                      : i === current
                      ? 'bg-[var(--color-primary)] text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                  }
                `}
              >
                <StepIcon
                  type={step.icon}
                  active={i === current}
                  done={i < current || (i === current && isDone)}
                  failed={i === current && isFailed}
                />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  i <= current
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 hidden h-0.5 w-6 rounded-full transition-all duration-500 sm:mx-2 sm:block sm:w-12 md:w-16 ${
                  i < current
                    ? 'bg-[var(--color-success)]'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isFailed
                ? 'bg-red-500'
                : isDone
                ? 'bg-[var(--color-success)]'
                : 'animate-stripes bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]'
            }`}
            style={{ width: `${isDone ? 100 : progress}%` }}
          />
        </div>
        {/* Percentage label */}
        {!isFailed && (
          <div className="absolute right-0 top-full mt-1.5">
            <span className={`text-sm font-bold ${isDone ? 'text-[var(--color-success)]' : 'text-gray-600 dark:text-gray-400'}`}>
              {isDone ? '100' : progress}%
            </span>
          </div>
        )}
      </div>

      {/* Status message */}
      <div className="pt-2 text-center">
        {isFailed ? (
          <div className="inline-flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/50">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Something went wrong</p>
              <p className="mt-0.5 text-xs text-red-600 dark:text-red-500">
                {error || 'Processing failed. Please try again with a different file.'}
              </p>
            </div>
          </div>
        ) : isDone ? (
          <div className="inline-flex items-center gap-2 text-[var(--color-success)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-base font-bold">Your file is ready!</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status === 'queued' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
                </span>
                Waiting in queue... This won't take long.
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Working on your file... Almost there!
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
