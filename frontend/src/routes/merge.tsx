import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/merge',
  component: MergePage,
});

function MergePage() {
  return (
    <ToolPage
      title="Merge PDF"
      description="Combine multiple PDF files into a single document"
      operation="merge"
      multiple={true}
    />
  );
}
