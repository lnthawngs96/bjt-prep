import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gộp class Tailwind, class sau ghi đè class trước khi trùng nhóm.
 * Không có tailwind-merge thì `cn('p-2', 'p-4')` ra cả hai và kết quả
 * phụ thuộc thứ tự trong file CSS — sai âm thầm, rất khó truy.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
