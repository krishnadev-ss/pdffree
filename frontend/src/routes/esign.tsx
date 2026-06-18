import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/esign',
  component: ESignPage,
});

function ESignPage() {
  return (
    <ToolPage
      title="e-Sign PDF"
      description="Add your signature to any PDF document. Draw, type, or upload your signature."
      operation="esign"
    />
  );
}
