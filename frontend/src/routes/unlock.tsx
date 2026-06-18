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
      description="Remove the password from your PDF so anyone can open it"
      operation="unlock"
      renderOptions={(options, setOptions) => (
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enter the current password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="password"
              type="password"
              value={options.password || ''}
              onChange={(e) => setOptions((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="The password used to lock this PDF"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            You need the original password to unlock the file.
          </p>
        </div>
      )}
    />
  );
}
