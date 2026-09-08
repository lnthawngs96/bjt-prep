'use client';

import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

/**
 * Vẽ CẢ HAI icon, ẩn/hiện bằng CSS theo data-theme trên <html>.
 * Cách này không đọc theme lúc render nên không thể lệch hydration —
 * khỏi cần cờ `mounted`, khỏi nhấp nháy khi tải lại trang.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Chuyển giao diện sáng hoặc tối"
      className={cn(
        'group relative grid size-8 place-items-center overflow-hidden rounded-lg border border-ln',
        'text-fg3 transition-colors duration-200 hover:border-transparent hover:text-on-g',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-(image:--g) opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <FaMoon aria-hidden className="relative z-10 size-3.5 dark:hidden" />
      <FaSun aria-hidden className="relative z-10 hidden size-3.5 dark:block" />
    </button>
  );
}
