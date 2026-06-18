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

const sections: { heading: string; tools: Tool[] }[] = [
  {
    heading: 'Most Popular',
    tools: [
      { title: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: '\uD83D\uDD17', href: '/merge', color: '#e5322d' },
      { title: 'Split PDF', description: 'Extract pages from your PDF', icon: '\u2702\uFE0F', href: '/split', color: '#4caf50' },
      { title: 'Compress PDF', description: 'Reduce PDF file size', icon: '\uD83D\uDCE6', href: '/compress', color: '#ff9800' },
      { title: 'Rotate PDF', description: 'Rotate PDF pages', icon: '\uD83D\uDD04', href: '/rotate', color: '#2196f3' },
    ],
  },
  {
    heading: 'Organize',
    tools: [
      { title: 'Page Numbers', description: 'Add page numbers', icon: '\uD83D\uDD22', href: '/pagenumbers', color: '#9c27b0' },
      { title: 'Organize Pages', description: 'Rearrange PDF pages', icon: '\uD83D\uDCD1', href: '/organize', color: '#607d8b' },
      { title: 'Repair PDF', description: 'Fix broken PDFs', icon: '\uD83D\uDD27', href: '/repair', color: '#795548' },
    ],
  },
  {
    heading: 'Convert to PDF',
    tools: [
      { title: 'Word to PDF', description: 'Convert Word documents to PDF', icon: '\uD83D\uDCDD', href: '/convert?type=word-to-pdf', color: '#1565c0' },
      { title: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF', icon: '\uD83D\uDCCA', href: '/convert?type=excel-to-pdf', color: '#2e7d32' },
      { title: 'PPT to PDF', description: 'Convert PowerPoint to PDF', icon: '\uD83D\uDCFD\uFE0F', href: '/convert?type=ppt-to-pdf', color: '#d84315' },
      { title: 'Image to PDF', description: 'Convert images to PDF', icon: '\uD83D\uDDBC\uFE0F', href: '/convert?type=image-to-pdf', color: '#6a1b9a' },
      { title: 'HTML to PDF', description: 'Convert HTML pages to PDF', icon: '\uD83C\uDF10', href: '/convert?type=html-to-pdf', color: '#00838f' },
    ],
  },
  {
    heading: 'Convert from PDF',
    tools: [
      { title: 'PDF to Image', description: 'Convert PDF pages to images', icon: '\uD83D\uDDBC\uFE0F', href: '/convert?type=pdf-to-image', color: '#e91e63' },
      { title: 'PDF to HTML', description: 'Convert PDF to HTML pages', icon: '\uD83C\uDF10', href: '/convert?type=pdf-to-html', color: '#ff6f00' },
    ],
  },
  {
    heading: 'PDF Security',
    tools: [
      { title: 'Protect PDF', description: 'Add password protection', icon: '\uD83D\uDD12', href: '/protect', color: '#1b5e20' },
      { title: 'Unlock PDF', description: 'Remove PDF password', icon: '\uD83D\uDD13', href: '/unlock', color: '#b71c1c' },
      { title: 'e-Sign', description: 'Sign your PDF', icon: '\u270D\uFE0F', href: '/esign', color: '#4a148c' },
      { title: 'Flatten', description: 'Flatten PDF forms', icon: '\uD83D\uDCCB', href: '/flatten', color: '#263238' },
      { title: 'OCR', description: 'Extract text from scanned PDFs', icon: '\uD83D\uDC41\uFE0F', href: '/ocr', color: '#01579b' },
    ],
  },
  {
    heading: 'Watermark',
    tools: [
      { title: 'Add Watermark', description: 'Stamp text on your PDF', icon: '\uD83D\uDCA7', href: '/watermark', color: '#0277bd' },
    ],
  },
];

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
          Free Online PDF Tools
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Everything you need to work with PDFs. No sign-up, no watermarks, completely free.
        </p>
      </section>

      {/* Tool sections */}
      {sections.map((section) => (
        <section key={section.heading} className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
            {section.heading}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {section.tools.map((tool) => (
              <ToolCard key={tool.href + tool.title} {...tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
