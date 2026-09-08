import { adminRoute } from '@/lib/admin/route';
import { createQuestion } from '@/lib/data/admin';
import { questionInputSchema } from '@/lib/validation/admin/question';

export const POST = adminRoute(questionInputSchema, ({ data, actorId }) => createQuestion(data, actorId));
