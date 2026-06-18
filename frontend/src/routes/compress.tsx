import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compress',
  component: CompressPage,
});

function CompressPage() {
  return (
    <ToolPage
      title="Compress PDF"
      description="Reduce your PDF file size"
      operation="compress"
    />
  );
}
