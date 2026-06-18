import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/repair',
  component: RepairPage,
});

function RepairPage() {
  return (
    <ToolPage
      title="Repair PDF"
      description="Fix broken or corrupted PDF files that won't open properly"
      operation="repair"
    />
  );
}
