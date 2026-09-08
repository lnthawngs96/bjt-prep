'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Dòng phụ cạnh tiêu đề, ví dụ "Sửa lần cuối 2 giờ trước". */
  subtitle?: string;
  children: ReactNode;
  /** Vùng nút ở đáy, luôn nhìn thấy được. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Cũng là <dialog> gốc như Modal — chỉ khác animation trượt từ phải và
 * chiếm hết chiều cao. Lý do giống hệt Modal: focus trap, Esc, trả focus.
 */
export function Drawer({ open, onClose, title, subtitle, children, footer, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Nền không cuộn được khi dialog mở.
  useBodyScrollLock(open);

  return (
    <dialog
      ref={ref}
      aria-labelledby="drawer-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        // ml-auto + h-full: dính mép phải, cao hết màn hình
        'ml-auto mr-0 my-0 h-dvh max-h-none w-full max-w-130 bg-transparent p-0',
        'backdrop:bg-(--ov) backdrop:backdrop-blur-xs',
        'motion-safe:[&[open]]:animate-drawer-in',
        className,
      )}
    >
      <div className="flex h-full flex-col border-l border-ln bg-bg shadow-dlg">
        <header className="flex h-13 flex-none items-center gap-2.5 border-b border-ln px-5">
          <b id="drawer-title" className="text-sm font-semibold">
            {title}
          </b>
          {subtitle && <span className="text-xs text-fg3">{subtitle}</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-fg3 transition-colors duration-200 hover:bg-(image:--g-soft) hover:text-acc-hi"
          >
            <FaXmark className="size-3" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <footer className="flex flex-none gap-2.5 border-t border-ln px-5 py-4">{footer}</footer>
        )}
      </div>
    </dialog>
  );
}
