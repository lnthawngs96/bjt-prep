'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Nội dung cho aria-labelledby. Bắt buộc để screen reader đọc được dialog. */
  title: string;
  /** Ẩn tiêu đề khỏi màn hình nhưng vẫn giữ cho screen reader. */
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  showClose?: boolean;
}

/**
 * Dùng thẻ <dialog> gốc + showModal(). Nó cho SẴN năm thứ mà tự viết bằng <div>
 * gần như chắc chắn sẽ sót: focus trap · phím Esc · backdrop · inert cho nền ·
 * trả focus về đúng nút đã mở. Đừng thay bằng <div>.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle = true,
  children,
  className,
  showClose = true,
}: ModalProps) {
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
      aria-labelledby="modal-title"
      // Esc gọi 'close' — chuyển ngược lên state để React và DOM không lệch nhau.
      onClose={onClose}
      // Click ra ngoài: target là chính <dialog> chứ không phải phần tử con.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto w-full max-w-[396px] overflow-visible bg-transparent p-5 text-fg',
        'backdrop:bg-(--ov) backdrop:backdrop-blur-[5px]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-ln bg-bg shadow-dlg',
          className,
        )}
      >
        {/* Vạch gradient trên đỉnh dialog — theo docs/login-dialog.html */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-(image:--g-line)" />

        <h2 id="modal-title" className={hideTitle ? 'sr-only' : 'sr-only'}>
          {title}
        </h2>

        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3.5 top-3.5 z-10 grid size-[30px] place-items-center rounded-lg text-fg3 transition-colors duration-200 hover:bg-ln2 hover:text-fg"
          >
            <FaXmark className="size-3" />
          </button>
        )}

        {children}
      </div>
    </dialog>
  );
}
