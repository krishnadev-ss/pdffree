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
      description="Fix corrupted or damaged PDF files"
      operation="repair"
    />
  );
}
