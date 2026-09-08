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
  /** Đã đăng nhập nhưng không đủ quyền (không phải ADMIN). */
  | 'FORBIDDEN'
  /** Body không qua được zod ở server. Với form admin, `fieldErrors` chỉ rõ ô nào. */
  | 'VALIDATION'
  /** Đề chưa có câu hỏi nào. */
  | 'EMPTY'
  | 'NOT_FOUND'
  /** Trùng khoá duy nhất (slug, mã đề, thứ tự…). */
  | 'CONFLICT'
  /** Bản ghi đang được tham chiếu (câu đã có lượt làm), không xoá được. */
  | 'IN_USE'
  | 'ALREADY_SUBMITTED'
  | 'TIME_EXCEEDED'
  /** fetch ném — mất mạng, server chết. */
  | 'NETWORK'
  | 'UNKNOWN';

export type ApiFailure = {
  ok: false;
  code: ApiFailureCode;
  /** Lỗi theo từng trường, chỉ có khi code = VALIDATION. Key là đường dẫn zod: "options.2.textJa". */
  fieldErrors?: Record<string, string>;
  /** Câu chữ server gửi kèm, dùng khi component không có lời riêng. */
  message?: string;
};

export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

const KNOWN: ApiFailureCode[] = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'VALIDATION',
  'EMPTY',
  'NOT_FOUND',
  'CONFLICT',
  'IN_USE',
  'ALREADY_SUBMITTED',
  'TIME_EXCEEDED',
];

/** Đọc `code` server trả về, quy về `ApiFailureCode`. */
export async function toApiFailure(res: Response): Promise<ApiFailure> {
  const body = (await res.json().catch(() => ({}))) as {
    code?: string;
    fieldErrors?: Record<string, string>;
    error?: string;
  };
  const code = KNOWN.find((c) => c === body.code) ?? 'UNKNOWN';
  return { ok: false, code, fieldErrors: body.fieldErrors, message: body.error };
}

async function requestJson<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, code: 'NETWORK' };
  }
  if (!res.ok) return toApiFailure(res);
  if (res.status === 204) return { ok: true, data: undefined as T };
  return { ok: true, data: (await res.json()) as T };
}

/** POST JSON. Bọc fetch để không lặp header và try/catch ở từng hàm. */
export function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return requestJson<T>('POST', url, body);
}

export function patchJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return requestJson<T>('PATCH', url, body);
}

export function deleteJson<T = void>(url: string): Promise<ApiResult<T>> {
  return requestJson<T>('DELETE', url);
}

export function getJson<T>(url: string): Promise<ApiResult<T>> {
  return requestJson<T>('GET', url);
}
