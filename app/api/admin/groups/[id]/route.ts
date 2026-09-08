import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteGroup, updateGroup } from '@/lib/data/admin';
import { groupInputSchema } from '@/lib/validation/admin/group';

export const PATCH = adminRoute(groupInputSchema, ({ data, actorId, params }) => updateGroup(params.id, data, actorId));
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteGroup(params.id, actorId));
