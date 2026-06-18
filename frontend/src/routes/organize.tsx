import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organize',
  component: OrganizePage,
});

function OrganizePage() {
  return (
    <ToolPage
      title="Organize Pages"
      description="Rearrange pages in your PDF"
      operation="organize"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page Order
          </label>
          <input
            type="text"
            value={options.pages || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
            placeholder="e.g., 3,1,2,4"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      )}
    />
  );
}
