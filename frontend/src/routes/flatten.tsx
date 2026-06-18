import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flatten',
  component: FlattenPage,
});

function FlattenPage() {
  return (
    <ToolPage
      title="Flatten PDF"
      description="Lock all form fields and annotations permanently so they can't be edited"
      operation="flatten"
    />
  );
}
