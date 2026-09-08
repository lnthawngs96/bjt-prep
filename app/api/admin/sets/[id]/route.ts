import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteSet, updateSet } from '@/lib/data/admin';
import { setInputSchema } from '@/lib/validation/admin/set';

export const PATCH = adminRoute(setInputSchema, ({ data, actorId, params }) => updateSet(params.id, data, actorId));
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteSet(params.id, actorId));
