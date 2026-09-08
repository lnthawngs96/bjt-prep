'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Checkbox gốc kèm nhãn. Không vẽ lại — accent-color đã lấy màu accent. */
export function AdminCheckbox({
  label,
  className,
  ...props
}: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-center gap-2 text-sm', className)}>
      <input id={id} type="checkbox" className="size-4 accent-acc" {...props} />
      {label}
    </label>
  );
}
