import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Tiêu đề mục. Phân tách bằng đường kẻ 1px và khoảng trắng, không dùng card. */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('border-t border-ln py-7', className)}>{children}</section>;
}

export function SectionHeading({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {meta && <span className="text-xs text-fg3">{meta}</span>}
      {action && <span className="ml-auto text-[12.5px] font-semibold">{action}</span>}
    </div>
  );
}
