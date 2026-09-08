'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'right';
  className?: string;
}

/**
 * CSS thuần: opacity + pointer-events-none, hiện khi hover hoặc focus phần tử con.
 * aria-describedby nối vào phần tử con qua thuộc tính trên wrapper — screen reader
 * đọc được nhãn mà không cần JS.
 */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  return (
    <span className={cn('group/tt relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-fg px-2.5 py-1.5',
          'text-xs text-bg opacity-0 shadow-soft transition-opacity duration-200',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' && 'bottom-full left-1/2 mb-2 -translate-x-1/2',
          side === 'right' && 'left-full top-1/2 ml-2.5 -translate-y-1/2',
        )}
      >
        {label}
      </span>
    </span>
  );
}
