import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unlock',
  component: UnlockPage,
});

function UnlockPage() {
  return (
    <ToolPage
      title="Unlock PDF"
      description="Remove password from your PDF"
      operation="unlock"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Password
          </label>
          <input
            type="password"
            value={options.password || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Enter current password"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      )}
    />
  );
}
