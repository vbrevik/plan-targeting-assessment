// Virtualized List Component
// Efficiently renders long lists using virtual scrolling

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  getItemKey?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 60,
  overscan = 5,
  className = '',
  containerClassName = '',
  getItemKey,
  emptyMessage = 'No items',
  loading = false,
  loadingMessage = 'Loading...',
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  // Generate keys for items
  const getKey = useMemo(() => {
    if (getItemKey) {
      return getItemKey;
    }
    return (_: T, index: number) => index;
  }, [getItemKey]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-sm text-slate-400 animate-pulse">{loadingMessage}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-sm text-slate-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-full overflow-auto', containerClassName)}
      role="list"
      aria-label="Virtualized list"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={getKey(item, virtualItem.index)}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              role="listitem"
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
