import type { ReactNode } from 'react';

/** Thanh trên của mỗi trang admin: tiêu đề, dòng phụ và nút hành động. Dính đỉnh khi cuộn. */
export function AdminPageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ln bg-(--hdbg) px-7 backdrop-blur-md">
      <h1 className="text-base font-bold tracking-tight">{title}</h1>
      {meta && <span className="text-xs text-fg3">{meta}</span>}
      {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
    </header>
  );
}

/** Vùng nội dung dưới header. Không card, không nền khác — chỉ khoảng trắng. */
export function AdminContent({ children }: { children: ReactNode }) {
  return <div className="px-7 pb-20 pt-6">{children}</div>;
}
