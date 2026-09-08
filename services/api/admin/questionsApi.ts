import { adminCrud } from './adminCrudApi';
import type { QuestionInput } from '@/lib/validation/admin/question';
import type { AdminQuestionEditor } from '@/lib/data/types';

const api = adminCrud<QuestionInput, AdminQuestionEditor>('/api/admin/questions');

/** GET /api/admin/questions/[id] — bản đầy đủ để sửa. */
export const handleGetAdminQuestion = api.get;
/** POST /api/admin/questions */
export const handlePostAdminQuestions = api.create;
/** PATCH /api/admin/questions/[id] */
export const handlePatchAdminQuestion = api.update;
/** DELETE /api/admin/questions/[id] */
export const handleDeleteAdminQuestion = api.remove;
