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
      className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-800/80 dark:hover:border-gray-700 dark:hover:shadow-black/20"
    >
      {/* Colored accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Icon container */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <span role="img" aria-hidden="true">{icon}</span>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-gray-900 transition-colors duration-200 group-hover:text-[var(--color-primary)] dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-0.5 text-sm leading-snug text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Arrow icon */}
      <svg
        className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)] dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
