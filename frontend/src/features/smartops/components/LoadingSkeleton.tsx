// Loading Skeleton Component
// Provides skeleton loading states for better UX

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: '',
    card: 'h-32',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count === 1) {
    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className)}
        style={style}
        aria-label="Loading"
        role="status"
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={style}
          aria-label="Loading"
          role="status"
        />
      ))}
    </div>
  );
}

// Pre-built skeleton components
export function MetricCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <LoadingSkeleton variant="circular" width={24} height={24} />
        <LoadingSkeleton variant="text" width={40} height={16} />
      </div>
      <LoadingSkeleton variant="text" width={60} height={32} className="mb-1" />
      <LoadingSkeleton variant="text" width={100} height={12} />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <LoadingSkeleton variant="text" width={200} height={16} />
        <LoadingSkeleton variant="text" width={60} height={16} />
      </div>
      <LoadingSkeleton variant="text" width={150} height={12} />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <LoadingSkeleton variant="text" width="80%" height={16} />
        </td>
      ))}
    </tr>
  );
}
