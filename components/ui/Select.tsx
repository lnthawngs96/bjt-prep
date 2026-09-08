'use client';

import { useId, type SelectHTMLAttributes } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  className?: string;
}

/**
 * <select> GỐC, chỉ bỏ mũi tên mặc định bằng appearance-none và vẽ lại icon.
 * Không tự viết listbox: bàn phím, tìm-theo-chữ, và menu gốc của mobile
 * đều miễn phí ở đây, tự làm lại chỉ tệ hơn.
 */
export function Select({ label, error, className, children, ...props }: SelectProps) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[11px] font-bold text-fg2">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full appearance-none rounded-[7px] border border-ln bg-bg py-2.5 pl-3 pr-9',
            'text-[13.5px] text-fg transition-colors duration-200',
            'focus:border-acc focus:outline-none disabled:opacity-55',
            error && 'border-ng',
          )}
          {...props}
        >
          {children}
        </select>
        <FaChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-fg3"
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[11.5px] text-ng">
          {error}
        </p>
      )}
    </div>
  );
}
