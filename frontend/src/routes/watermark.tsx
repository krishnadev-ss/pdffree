import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watermark',
  component: WatermarkPage,
});

function WatermarkPage() {
  return (
    <ToolPage
      title="Add Watermark"
      description="Add text watermark to your PDF"
      operation="watermark"
      renderOptions={(options, setOptions) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Watermark Text
          </label>
          <input
            type="text"
            value={options.text || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
            placeholder="Enter watermark text"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      )}
    />
  );
}
