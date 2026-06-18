import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ocr',
  component: OcrPage,
});

function OcrPage() {
  return (
    <ToolPage
      title="OCR - Text Recognition"
      description="Extract searchable text from scanned documents and images in PDFs"
      operation="ocr"
    />
  );
}
