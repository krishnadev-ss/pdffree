import { createRoute, useSearch, Link } from '@tanstack/react-router';
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

const conversionTypes: Record<string, { title: string; description: string; accept: string; operation: string; icon: string; color: string }> = {
  'word-to-pdf': {
    title: 'Word to PDF',
    description: 'Convert Word documents (.doc, .docx) to PDF format',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    operation: 'word-to-pdf',
    icon: '\uD83D\uDCDD',
    color: '#1565c0',
  },
  'excel-to-pdf': {
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets (.xls, .xlsx) to PDF format',
    accept: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    operation: 'excel-to-pdf',
    icon: '\uD83D\uDCCA',
    color: '#2e7d32',
  },
  'ppt-to-pdf': {
    title: 'PPT to PDF',
    description: 'Convert PowerPoint presentations (.ppt, .pptx) to PDF format',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    operation: 'ppt-to-pdf',
    icon: '\uD83D\uDCFD\uFE0F',
    color: '#d84315',
  },
  'image-to-pdf': {
    title: 'Image to PDF',
    description: 'Convert images (JPG, PNG, etc.) to PDF format',
    accept: 'image/*',
    operation: 'image-to-pdf',
    icon: '\uD83D\uDDBC\uFE0F',
    color: '#6a1b9a',
  },
  'html-to-pdf': {
    title: 'HTML to PDF',
    description: 'Convert HTML files to PDF format',
    accept: '.html,.htm,text/html',
    operation: 'html-to-pdf',
    icon: '\uD83C\uDF10',
    color: '#00838f',
  },
  'pdf-to-image': {
    title: 'PDF to Image',
    description: 'Convert PDF pages to JPG or PNG images',
    accept: 'application/pdf',
    operation: 'pdf-to-image',
    icon: '\uD83D\uDDBC\uFE0F',
    color: '#e91e63',
  },
  'pdf-to-html': {
    title: 'PDF to HTML',
    description: 'Convert PDF documents to HTML web pages',
    accept: 'application/pdf',
    operation: 'pdf-to-html',
    icon: '\uD83C\uDF10',
    color: '#ff6f00',
  },
};

function ConvertPage() {
  const { type } = useSearch({ from: '/convert' });
  const config = type ? conversionTypes[type] : null;

  if (!config) {
    return (
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Tools
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Convert Files
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            What would you like to convert? Choose a format below.
          </p>
        </div>

        {/* To PDF */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Convert to PDF
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(conversionTypes)
              .filter(([key]) => key.endsWith('-to-pdf'))
              .map(([key, val]) => (
                <Link
                  key={key}
                  to="/convert"
                  search={{ type: key }}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/80"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${val.color}15` }}
                  >
                    {val.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] dark:text-gray-100">
                      {val.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{val.description}</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)] dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
          </div>
        </div>

        {/* From PDF */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Convert from PDF
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(conversionTypes)
              .filter(([key]) => key.startsWith('pdf-to'))
              .map(([key, val]) => (
                <Link
                  key={key}
                  to="/convert"
                  search={{ type: key }}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/80"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${val.color}15` }}
                  >
                    {val.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] dark:text-gray-100">
                      {val.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{val.description}</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)] dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
          </div>
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
