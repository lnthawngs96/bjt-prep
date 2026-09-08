import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Khối trang chủ — không border-t full ngang (tránh rối mắt).
 * Phân tách bằng khoảng trắng; điểm nhấn là gạch gradient ngắn dưới tiêu đề.
 */
export function HomeSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn('px-6 py-10 md:py-12', className)}>{children}</section>;
}

export function HomeHeading({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {meta && <span className="text-xs text-fg3">{meta}</span>}
        {action && <span className="ml-auto text-xs font-semibold">{action}</span>}
      </div>
      <span
        aria-hidden
        className="mt-2.5 block h-0.5 w-12 rounded-sm bg-(image:--g-line) opacity-70"
      />
    </div>
  );
}

