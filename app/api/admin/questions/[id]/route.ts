import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { AdminError } from '@/lib/admin/errors';
import { deleteQuestion, getAdminQuestionEditor, updateQuestion } from '@/lib/data/admin';
import { questionInputSchema } from '@/lib/validation/admin/question';

/** Bản đầy đủ để sửa — có đáp án, chỉ admin gọi được. */
export const GET = adminRouteNoBody(async ({ params }) => {
  const q = await getAdminQuestionEditor(params.id);
  if (!q) throw new AdminError('NOT_FOUND', 'Không tìm thấy câu hỏi');
  return q;
});

export const PATCH = adminRoute(questionInputSchema, ({ data, actorId, params }) =>
  updateQuestion(params.id, data, actorId),
);

export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteQuestion(params.id, actorId));
