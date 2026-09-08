import { postJson, type ApiResult } from '@/services/api/common/apiResult';
import type { StartAttemptBody, SubmitBody } from '@/lib/validation/attempts';
import type { SubmitResult } from '@/lib/data/types';

/**
 * Gọi các endpoint dưới /api/attempts.
 *
 * Tên hàm ghép từ method + đuôi endpoint để tra ngược được: thấy
 * `handlePostAttemptSubmit` là biết nó bắn vào POST /api/attempts/[id]/submit.
 *
 * Kiểu body dùng lại schema zod ở lib/validation/attempts.ts — một nguồn sự
 * thật cho cả chỗ server kiểm lẫn chỗ client gửi.
 */

/** POST /api/attempts — mở một lượt làm bài, server sinh id. */
export function handlePostAttempts(body: StartAttemptBody): Promise<ApiResult<{ attemptId: string }>> {
  return postJson<{ attemptId: string }>('/api/attempts', body);
}

/** POST /api/attempts/[attemptId]/submit — nộp bài, server chấm. */
export function handlePostAttemptSubmit(
  attemptId: string,
  body: SubmitBody,
): Promise<ApiResult<SubmitResult>> {
  return postJson<SubmitResult>(`/api/attempts/${attemptId}/submit`, body);
}
