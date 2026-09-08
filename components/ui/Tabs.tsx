'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  /** Nhãn chính — thường là tên phần tiếng Nhật cỡ lớn. */
  label: ReactNode;
  /** Dòng phụ tiếng Việt. */
  hint?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  'aria-label': string;
  className?: string;
}

/**
 * role="tablist" + aria-selected + điều hướng bằng phím mũi tên trái/phải,
 * Home/End. Đây là hợp đồng ARIA của tablist, thiếu là screen reader lạc.
 */
export function Tabs({ items, value, onChange, className, ...aria }: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const i = items.findIndex((t) => t.id === value);
    if (i < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = items[next].id;
    onChange(id);
    refs.current[id]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={aria['aria-label']}
      onKeyDown={onKeyDown}
      className={cn('flex overflow-x-auto border-b border-ln [scrollbar-width:none]', className)}
    >
      {items.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`tabpanel-${t.id}`}
            // Chỉ tab đang chọn nằm trong luồng Tab — phần còn lại đi bằng mũi tên.
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              'group relative -mb-px whitespace-nowrap px-6 pb-3.5 pt-[17px] transition-colors duration-150',
              selected ? 'text-fg' : 'text-fg2 hover:text-fg',
            )}
          >
            <span className="block text-xl font-bold leading-tight">{t.label}</span>
            {t.hint && <span className="block text-[11.5px]">{t.hint}</span>}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-6 bottom-0 h-0.5 rounded-sm bg-(image:--g-line) transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
                selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[.55]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`tabpanel-${id}`} aria-labelledby={`tab-${id}`} tabIndex={0}>
      {children}
    </div>
  );
}
