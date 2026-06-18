import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pagenumbers',
  component: PageNumbersPage,
});

function PageNumbersPage() {
  return (
    <ToolPage
      title="Add Page Numbers"
      description="Automatically add page numbers to every page of your PDF"
      operation="pagenumbers"
    />
  );
}
