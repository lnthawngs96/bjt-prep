import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteVocab, updateVocab } from '@/lib/data/admin';
import { vocabInputSchema } from '@/lib/validation/admin/vocab';

export const PATCH = adminRoute(vocabInputSchema, ({ data, actorId, params }) => updateVocab(params.id, data, actorId));
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteVocab(params.id, actorId));
