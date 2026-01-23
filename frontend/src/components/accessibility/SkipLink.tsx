// Skip Link Component
// Provides keyboard navigation to skip to main content

import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  to?: string;
  className?: string;
}

export function SkipLink({ to = '#main-content', className = '' }: SkipLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'focus:z-50 focus:px-4 focus:py-2',
        'focus:bg-blue-600 focus:text-white',
        'focus:rounded focus:font-bold',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      aria-label="Skip to main content"
    >
      Skip to main content
    </Link>
  );
}
