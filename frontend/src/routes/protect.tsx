import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/protect',
  component: ProtectPage,
});

function ProtectPage() {
  return (
    <ToolPage
      title="Protect PDF"
      description="Add password protection to your PDF"
      operation="protect"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            value={options.password || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Enter password"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      )}
    />
  );
}
