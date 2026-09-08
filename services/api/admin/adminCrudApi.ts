import { deleteJson, getJson, patchJson, postJson, type ApiResult } from '@/services/api/common/apiResult';

/**
 * Bốn thao tác giống nhau ở mọi thực thể admin. Mỗi file *Api.ts vẫn export
 * hàm có tên theo endpoint (handlePostAdminQuestions…) để tra ngược được —
 * đây chỉ là chỗ tránh chép lại URL.
 */
export function adminCrud<TInput, TRow = unknown>(base: string) {
  return {
    get: (id: string) => getJson<TRow>(`${base}/${id}`),
    create: (body: TInput) => postJson<{ id: string }>(base, body),
    update: (id: string, body: TInput) => patchJson<{ id: string }>(`${base}/${id}`, body),
    remove: (id: string) => deleteJson(`${base}/${id}`),
  } satisfies Record<string, (...a: never[]) => Promise<ApiResult<unknown>>>;
}
