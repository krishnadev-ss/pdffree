import { createRoute, useSearch } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolPage } from '../components/ToolPage';

interface ConvertSearch {
  type?: string;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/convert',
  validateSearch: (search: Record<string, unknown>): ConvertSearch => ({
    type: (search.type as string) || undefined,
  }),
  component: ConvertPage,
});

const conversionTypes: Record<string, { title: string; description: string; accept: string; operation: string }> = {
  'word-to-pdf': {
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    operation: 'word-to-pdf',
  },
  'excel-to-pdf': {
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    accept: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    operation: 'excel-to-pdf',
  },
  'ppt-to-pdf': {
    title: 'PPT to PDF',
    description: 'Convert PowerPoint presentations to PDF format',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    operation: 'ppt-to-pdf',
  },
  'image-to-pdf': {
    title: 'Image to PDF',
    description: 'Convert images to PDF format',
    accept: 'image/*',
    operation: 'image-to-pdf',
  },
  'html-to-pdf': {
    title: 'HTML to PDF',
    description: 'Convert HTML files to PDF format',
    accept: '.html,.htm,text/html',
    operation: 'html-to-pdf',
  },
  'pdf-to-image': {
    title: 'PDF to Image',
    description: 'Convert PDF pages to image files',
    accept: 'application/pdf',
    operation: 'pdf-to-image',
  },
  'pdf-to-html': {
    title: 'PDF to HTML',
    description: 'Convert PDF to HTML format',
    accept: 'application/pdf',
    operation: 'pdf-to-html',
  },
};

function ConvertPage() {
  const { type } = useSearch({ from: '/convert' });
  const config = type ? conversionTypes[type] : null;

  if (!config) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Convert Files</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">Choose a conversion type:</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(conversionTypes).map(([key, val]) => (
            <a
              key={key}
              href={`/convert?type=${key}`}
              className="rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{val.title}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{val.description}</p>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ToolPage
      title={config.title}
      description={config.description}
      accept={config.accept}
      operation={config.operation}
    />
  );
}
