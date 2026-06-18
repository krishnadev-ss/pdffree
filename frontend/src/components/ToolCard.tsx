import { Link } from '@tanstack/react-router';

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export function ToolCard({ title, description, icon, href, color }: ToolCardProps) {
  return (
    <Link
      to={href}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}
