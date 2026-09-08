/**
 * Lỗi có chủ đích từ tầng ghi của admin. Route wrapper (lib/admin/route.ts)
 * đổi nó thành mã HTTP và `code` của ApiResult; form tô ô lỗi theo fieldErrors.
 */
export class AdminError extends Error {
  constructor(
    public code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'IN_USE' | 'FORBIDDEN',
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AdminError';
  }
}
