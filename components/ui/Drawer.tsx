'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { FaXmark } from 'react-icons/fa6';
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
        'ml-auto mr-0 my-0 h-dvh max-h-none w-full max-w-[520px] bg-transparent p-0',
        'backdrop:bg-(--ov) backdrop:backdrop-blur-[3px]',
        'motion-safe:[&[open]]:animate-[drawer-in_.34s_cubic-bezier(.4,0,.2,1)]',
        className,
      )}
    >
      <div className="flex h-full flex-col border-l border-ln bg-bg shadow-dlg">
        <header className="flex h-[52px] flex-none items-center gap-2.5 border-b border-ln px-5">
          <b id="drawer-title" className="text-[13.5px] font-semibold">
            {title}
          </b>
          {subtitle && <span className="text-[11.5px] text-fg3">{subtitle}</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="ml-auto grid size-7 place-items-center rounded-[7px] text-fg3 transition-colors duration-200 hover:bg-(image:--g-soft) hover:text-acc-hi"
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
