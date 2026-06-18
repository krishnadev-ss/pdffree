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
      description="Extract pages from your PDF"
      operation="split"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page Range
          </label>
          <input
            type="text"
            value={options.pages || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
            placeholder="e.g., 1-3,5,7-10 (leave empty for all)"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      )}
    />
  );
}
