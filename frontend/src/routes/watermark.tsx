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
      description="Stamp text across every page of your PDF"
      operation="watermark"
      renderOptions={(options, setOptions) => (
        <div>
          <label
            htmlFor="watermark-text"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Watermark text
          </label>
          <input
            id="watermark-text"
            type="text"
            value={options.text || ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
            placeholder='e.g., "CONFIDENTIAL" or "DRAFT"'
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
          />
          {options.text && (
            <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <span className="rotate-[-30deg] text-2xl font-bold uppercase tracking-widest text-gray-300/80 dark:text-gray-600/80">
                {options.text}
              </span>
            </div>
          )}
        </div>
      )}
    />
  );
}
