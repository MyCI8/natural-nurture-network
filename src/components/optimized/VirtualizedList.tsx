import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
}

// Virtualized list for handling large datasets efficiently
export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  gap = 0
}: VirtualizedListProps<T>) {
  const itemCount = items.length;
  const adjustedItemHeight = itemHeight + gap;

  const Row = useMemo(() => 
    React.memo<{ index: number; style: React.CSSProperties }>(({ index, style }) => (
      <div style={style} className={gap > 0 ? `pb-${gap}` : ''}>
        {renderItem(items[index], index)}
      </div>
    )),
    [items, renderItem, gap]
  );

  Row.displayName = 'VirtualizedRow';

  if (itemCount === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <List
        height={height}
        itemCount={itemCount}
        itemSize={adjustedItemHeight}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
}

export default VirtualizedList;