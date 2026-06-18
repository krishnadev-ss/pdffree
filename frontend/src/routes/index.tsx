import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ToolCard } from '../components/ToolCard';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

interface Tool {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const sections: { heading: string; description: string; tools: Tool[] }[] = [
  {
    heading: 'Most Popular',
    description: 'The tools people use every day',
    tools: [
      { title: 'Merge PDF', description: 'Combine multiple PDFs into one file', icon: '\uD83D\uDD17', href: '/merge', color: '#e5322d' },
      { title: 'Split PDF', description: 'Extract specific pages from your PDF', icon: '\u2702\uFE0F', href: '/split', color: '#4caf50' },
      { title: 'Compress PDF', description: 'Make your PDF file smaller', icon: '\uD83D\uDCE6', href: '/compress', color: '#ff9800' },
      { title: 'Rotate PDF', description: 'Fix the orientation of your pages', icon: '\uD83D\uDD04', href: '/rotate', color: '#2196f3' },
    ],
  },
  {
    heading: 'Organize',
    description: 'Rearrange and enhance your PDFs',
    tools: [
      { title: 'Page Numbers', description: 'Add page numbers to every page', icon: '\uD83D\uDD22', href: '/pagenumbers', color: '#9c27b0' },
      { title: 'Organize Pages', description: 'Reorder pages however you want', icon: '\uD83D\uDCD1', href: '/organize', color: '#607d8b' },
      { title: 'Repair PDF', description: 'Fix broken or damaged PDFs', icon: '\uD83D\uDD27', href: '/repair', color: '#795548' },
    ],
  },
  {
    heading: 'Convert to PDF',
    description: 'Turn any document into a PDF',
    tools: [
      { title: 'Word to PDF', description: 'Convert .doc and .docx files', icon: '\uD83D\uDCDD', href: '/convert?type=word-to-pdf', color: '#1565c0' },
      { title: 'Excel to PDF', description: 'Convert spreadsheets to PDF', icon: '\uD83D\uDCCA', href: '/convert?type=excel-to-pdf', color: '#2e7d32' },
      { title: 'PPT to PDF', description: 'Convert presentations to PDF', icon: '\uD83D\uDCFD\uFE0F', href: '/convert?type=ppt-to-pdf', color: '#d84315' },
      { title: 'Image to PDF', description: 'Turn photos into PDF files', icon: '\uD83D\uDDBC\uFE0F', href: '/convert?type=image-to-pdf', color: '#6a1b9a' },
      { title: 'HTML to PDF', description: 'Save web pages as PDFs', icon: '\uD83C\uDF10', href: '/convert?type=html-to-pdf', color: '#00838f' },
    ],
  },
  {
    heading: 'Convert from PDF',
    description: 'Extract content from your PDFs',
    tools: [
      { title: 'PDF to Image', description: 'Turn PDF pages into JPG or PNG', icon: '\uD83D\uDDBC\uFE0F', href: '/convert?type=pdf-to-image', color: '#e91e63' },
      { title: 'PDF to HTML', description: 'Convert PDFs to web pages', icon: '\uD83C\uDF10', href: '/convert?type=pdf-to-html', color: '#ff6f00' },
    ],
  },
  {
    heading: 'PDF Security',
    description: 'Protect your sensitive documents',
    tools: [
      { title: 'Protect PDF', description: 'Lock your PDF with a password', icon: '\uD83D\uDD12', href: '/protect', color: '#1b5e20' },
      { title: 'Unlock PDF', description: 'Remove password from your PDF', icon: '\uD83D\uDD13', href: '/unlock', color: '#b71c1c' },
      { title: 'e-Sign', description: 'Add your signature to a PDF', icon: '\u270D\uFE0F', href: '/esign', color: '#4a148c' },
      { title: 'Flatten Forms', description: 'Lock form fields permanently', icon: '\uD83D\uDCCB', href: '/flatten', color: '#263238' },
      { title: 'OCR', description: 'Read text from scanned documents', icon: '\uD83D\uDC41\uFE0F', href: '/ocr', color: '#01579b' },
    ],
  },
  {
    heading: 'Share & Transfer',
    description: 'Send files securely to anyone',
    tools: [
      { title: 'Share Files', description: 'Create a shareable download link', icon: '\uD83D\uDD17', href: '/share', color: '#1565c0' },
      { title: 'Instant Transfer', description: 'Send files with a 6-digit code', icon: '\u26A1', href: '/transfer', color: '#e65100' },
    ],
  },
  {
    heading: 'Watermark',
    description: 'Brand and protect your documents',
    tools: [
      { title: 'Add Watermark', description: 'Stamp text across your PDF pages', icon: '\uD83D\uDCA7', href: '/watermark', color: '#0277bd' },
    ],
  },
];

function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="mb-14 text-center sm:mb-16">
        <div className="mx-auto max-w-3xl">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Always free. No sign-up. No watermarks.
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Every PDF tool you need,{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent">
              in one place
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl">
            Merge, split, compress, convert, and edit PDFs instantly.
            Your files stay private and are automatically deleted.
          </p>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Encrypted transfers
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Auto-deleted in 1 hour
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              No account required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Lightning fast
            </span>
          </div>
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section className="mb-14 sm:mb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            { num: '1', title: 'Choose your tool', desc: 'Pick what you want to do with your PDF', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
            { num: '2', title: 'Upload your file', desc: 'Drag & drop or click to select — up to 100MB', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
            { num: '3', title: 'Download result', desc: 'Get your processed file in seconds', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
          ].map((step) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                <svg className="h-6 w-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                </svg>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Step {step.num}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tool sections */}
      {sections.map((section) => (
        <section key={section.heading} className="mb-10 sm:mb-12">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {section.heading}
            </h2>
            <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
              {section.description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {section.tools.map((tool) => (
              <ToolCard key={tool.href + tool.title} {...tool} />
            ))}
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="mb-8 mt-16 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white shadow-2xl dark:from-gray-800 dark:to-gray-900 sm:p-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">
          Ready to work with your PDFs?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-gray-300">
          No sign-up, no credit card, no nonsense. Just pick a tool above and get started.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            20+ PDF tools
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% free forever
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Privacy first
          </span>
        </div>
      </section>
    </div>
  );
}
