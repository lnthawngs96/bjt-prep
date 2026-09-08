'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  /** Trạng thái nút lọc — bắt buộc, đây là thứ screen reader đọc. */
  pressed: boolean;
}

/** Nút lọc. Chip đang chọn là một trong số ít chỗ được phép dùng gradient. */
export function Chip({ pressed, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'rounded-md px-3 py-1.5 text-xs transition-colors duration-200',
        pressed
          ? 'border border-transparent bg-(image:--g) font-semibold text-on-g'
          : 'border border-ln text-fg2 hover:border-acc-dim hover:text-fg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
