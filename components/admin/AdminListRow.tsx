import type { ReactNode } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

/**
 * Một dòng trong danh sách admin. Phân tách bằng đường kẻ 1px, không card.
 * Là <button> để mở drawer sửa — bàn phím Tab tới được.
 */
export function AdminListRow({
  onClick,
  leading,
  title,
  subtitle,
  columns,
  trailing,
  className,
}: {
  onClick?: () => void;
  /** Ô đầu dòng cỡ cố định: mã, section… */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Các cột phụ bên phải tiêu đề, ẩn trên màn hẹp. */
  columns?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  const inner = (
    <>
      {leading && <span className="w-20 flex-none text-xs text-fg3">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle && <span className="block truncate text-xs text-fg2">{subtitle}</span>}
      </span>
      {columns && <span className="hidden flex-none items-center gap-4 text-xs text-fg3 md:flex">{columns}</span>}
      {trailing && <span className="flex flex-none items-center gap-2">{trailing}</span>}
      {onClick && <FaChevronRight className="size-2.5 flex-none text-fg3" aria-hidden />}
    </>
  );
  const base = cn(
    'flex w-full items-center gap-3.5 border-b border-ln px-3 py-3 text-left first:border-t',
    onClick && 'transition-colors duration-150 hover:bg-ln2',
    className,
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={base}>
      {inner}
    </button>
  ) : (
    <div className={base}>{inner}</div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="border-y border-ln py-10 text-center text-sm text-fg3">{children}</p>;
}
