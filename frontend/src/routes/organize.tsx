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
      description="Rearrange the pages in your PDF however you want"
      operation="organize"
      renderOptions={(options, setOptions) => (
        <div>
          <label
            htmlFor="page-order"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New page order
          </label>
          <input
            id="page-order"
            type="text"
            value={options.pages || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
            placeholder="e.g., 3, 1, 2, 4"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
          />
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            List the page numbers in the order you want them. For example, "3, 1, 2" puts page 3 first, then page 1, then page 2.
          </p>
        </div>
      )}
    />
  );
}
