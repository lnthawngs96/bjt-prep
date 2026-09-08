/**
 * Hình dạng kết quả chung của mọi hàm gọi API phía client.
 *
 * Trả về kết quả đã phân loại thay vì ném `Response` thô: chỗ gọi cần phân
 * biệt 401 (mở dialog đăng nhập tại chỗ) với lỗi thật, mà đọc `res.status`
 * rải rác trong component thì mỗi nơi bắt một kiểu.
 *
 * Chỉ trả `code`, KHÔNG trả câu chữ hiển thị — lời nhắn cho học viên nằm ở
 * component, vì cùng một mã lỗi ở hai màn có thể cần nói khác nhau.
 */
export type ApiFailureCode =
  /** Chưa đăng nhập — chỗ gọi nên mở dialog đăng nhập, không điều hướng. */
  | 'UNAUTHENTICATED'
  /** Body không qua được zod ở server. Lỗi lập trình, không phải lỗi người dùng. */
  | 'VALIDATION'
  /** Đề chưa có câu hỏi nào. */
  | 'EMPTY'
  | 'NOT_FOUND'
  | 'ALREADY_SUBMITTED'
  | 'TIME_EXCEEDED'
  /** fetch ném — mất mạng, server chết. */
  | 'NETWORK'
  | 'UNKNOWN';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; code: ApiFailureCode };

/** Đọc `code` server trả về, quy về `ApiFailureCode`. */
export async function toApiFailure(res: Response): Promise<{ ok: false; code: ApiFailureCode }> {
  const body = (await res.json().catch(() => ({}))) as { code?: string };
  const known: ApiFailureCode[] = [
    'UNAUTHENTICATED',
    'VALIDATION',
    'EMPTY',
    'NOT_FOUND',
    'ALREADY_SUBMITTED',
    'TIME_EXCEEDED',
  ];
  const code = known.find((c) => c === body.code) ?? 'UNKNOWN';
  return { ok: false, code };
}

/** POST JSON. Bọc fetch để không lặp header và try/catch ở từng hàm. */
export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, code: 'NETWORK' };
  }
  if (!res.ok) return toApiFailure(res);
  return { ok: true, data: (await res.json()) as T };
}
