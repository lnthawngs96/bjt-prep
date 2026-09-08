'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import type { ApiFailureCode, ApiResult } from '@/services/api/common/apiResult';

/** Lời nhắn chung cho mã lỗi ở trang admin — form chỉ cần nói thêm ô nào sai. */
export const ADMIN_ERROR_MESSAGE: Record<ApiFailureCode, string> = {
  UNAUTHENTICATED: 'Phiên đăng nhập đã hết. Tải lại trang và đăng nhập.',
  FORBIDDEN: 'Tài khoản này không có quyền quản trị.',
  VALIDATION: 'Có ô chưa hợp lệ, xem chỗ đánh dấu đỏ.',
  EMPTY: 'Chưa có dữ liệu.',
  NOT_FOUND: 'Bản ghi không còn tồn tại. Tải lại trang.',
  CONFLICT: 'Trùng giá trị duy nhất (slug, mã, thứ tự…).',
  IN_USE: 'Bản ghi đang được dùng ở nơi khác, không xoá được. Chuyển sang Lưu trữ thay vì xoá.',
  ALREADY_SUBMITTED: 'Đã nộp rồi.',
  TIME_EXCEEDED: 'Quá thời gian.',
  NETWORK: 'Mất kết nối. Kiểm tra mạng rồi thử lại.',
  UNKNOWN: 'Lỗi không xác định. Thử lại, nếu vẫn lỗi thì xem log server.',
};

/**
 * Bọc một hàm gọi API admin: trạng thái đang lưu, lỗi theo ô, toast và
 * router.refresh() sau khi thành công để server component tải lại danh sách.
 * Không cần TanStack Query — dữ liệu admin đọc ở server, mutation ít.
 */
export function useAdminMutation<A extends unknown[], T>(
  fn: (...args: A) => Promise<ApiResult<T>>,
  opts: { successMessage?: string; onSuccess?: (data: T) => void; refresh?: boolean } = {},
) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function run(...args: A): Promise<ApiResult<T>> {
    setSaving(true);
    const result = await fn(...args);
    setSaving(false);
    if (result.ok) {
      setFieldErrors({});
      toast(opts.successMessage ?? 'Đã lưu');
      opts.onSuccess?.(result.data);
      if (opts.refresh !== false) router.refresh();
      return result;
    }
    setFieldErrors(result.fieldErrors ?? {});
    toast(result.message && result.code === 'VALIDATION' ? result.message : ADMIN_ERROR_MESSAGE[result.code], 'ng');
    return result;
  }

  return { run, saving, fieldErrors, clearErrors: () => setFieldErrors({}) };
}
