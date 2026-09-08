import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Một khối trường trong drawer, phân tách bằng đường kẻ 1px — theo prototype `.fld`. */
export function AdminFormSection({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-ln px-5 py-4', className)}>
      {title && <h3 className="mb-1 text-xs font-bold text-fg2">{title}</h3>}
      {hint && <p className="mb-3 text-xs text-fg3">{hint}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/** Hai hoặc ba ô trên một dòng. */
export function AdminFormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-3 sm:grid-cols-2', className)}>{children}</div>;
}

/** Lỗi không gắn được vào ô nào (ví dụ "phải có đúng một đáp án đúng"). */
export function AdminFormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-ng">
      {message}
    </p>
  );
}
