import { adminRoute } from '@/lib/admin/route';
import { createVocab } from '@/lib/data/admin';
import { vocabInputSchema } from '@/lib/validation/admin/vocab';

export const POST = adminRoute(vocabInputSchema, ({ data, actorId }) => createVocab(data, actorId));
