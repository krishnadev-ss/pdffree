import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rotate',
  component: RotatePage,
});

const degrees = ['90', '180', '270'];

function RotatePage() {
  return (
    <ToolPage
      title="Rotate PDF"
      description="Rotate PDF pages to any angle"
      operation="rotate"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rotation Angle
          </label>
          <div className="flex gap-2">
            {degrees.map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, degrees: deg }))}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  (options.degrees || '90') === deg
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {deg}&deg;
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
}
