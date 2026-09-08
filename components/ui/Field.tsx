'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-md border border-ln bg-bg px-3 py-2.5 text-sm text-fg ' +
  'placeholder:text-fg3 transition-colors duration-200 focus:border-acc focus:outline-none ' +
  'disabled:opacity-55 aria-invalid:border-ng';

interface Base {
  label: string;
  /** Thông báo lỗi. Có giá trị thì input được đánh dấu aria-invalid. */
  error?: string;
  /** Dòng gợi ý dưới label. */
  hint?: ReactNode;
  className?: string;
}

function Shell({
  label,
  error,
  hint,
  id,
  className,
  children,
}: Base & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-bold text-fg2">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-fg3">
          {hint}
        </p>
      )}
      {children}
      {error && (
        // role="alert" để screen reader đọc ngay khi lỗi xuất hiện.
        <p id={`${id}-error`} role="alert" className="text-xs text-ng">
          {error}
        </p>
      )}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  className,
  ...props
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <Shell label={label} error={error} hint={hint} id={id} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={CONTROL}
        {...props}
      />
    </Shell>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  className,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <Shell label={label} error={error} hint={hint} id={id} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(CONTROL, 'resize-y')}
        {...props}
      />
    </Shell>
  );
}
