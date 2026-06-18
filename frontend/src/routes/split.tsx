import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/split',
  component: SplitPage,
});

function SplitPage() {
  return (
    <ToolPage
      title="Split PDF"
      description="Extract specific pages from your PDF"
      operation="split"
      renderOptions={(options, setOptions) => (
        <div>
          <label
            htmlFor="pages"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Which pages do you want?
          </label>
          <input
            id="pages"
            type="text"
            value={options.pages || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
            placeholder="e.g., 1-3, 5, 7-10"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
          />
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Leave empty to split every page into a separate file. Use ranges like "1-3" or individual pages like "1, 3, 5".
          </p>
        </div>
      )}
    />
  );
}
