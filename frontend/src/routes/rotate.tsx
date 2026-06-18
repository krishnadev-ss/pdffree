import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rotate',
  component: RotatePage,
});

const degrees = [
  { value: '90', label: '90\u00B0', desc: 'Quarter turn right' },
  { value: '180', label: '180\u00B0', desc: 'Upside down' },
  { value: '270', label: '270\u00B0', desc: 'Quarter turn left' },
];

function RotatePage() {
  return (
    <ToolPage
      title="Rotate PDF"
      description="Fix the orientation of your PDF pages"
      operation="rotate"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            How much do you want to rotate?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {degrees.map((deg) => {
              const selected = (options.degrees || '90') === deg.value;
              return (
                <button
                  key={deg.value}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, degrees: deg.value }))}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
                    selected
                      ? 'border-[var(--color-primary)] bg-red-50 shadow-sm dark:bg-red-950/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Rotation preview */}
                  <div
                    className={`flex h-10 w-8 items-center justify-center rounded border-2 text-xs font-bold transition-transform duration-500 ${
                      selected
                        ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                        : 'border-gray-300 text-gray-400 dark:border-gray-600'
                    }`}
                    style={{ transform: `rotate(${deg.value}deg)` }}
                  >
                    A
                  </div>
                  <span className={`mt-1 text-lg font-bold ${selected ? 'text-[var(--color-primary)]' : 'text-gray-700 dark:text-gray-300'}`}>
                    {deg.label}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">{deg.desc}</span>
                  {selected && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
