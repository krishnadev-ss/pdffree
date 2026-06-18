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
      description="Make your PDF smaller without losing quality. Perfect for email attachments."
      operation="compress"
    />
  );
}
