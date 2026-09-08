import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteMedia, updateMedia } from '@/lib/data/admin';
import { mediaInputSchema } from '@/lib/validation/admin/media';

export const PATCH = adminRoute(mediaInputSchema, ({ data, actorId, params }) => updateMedia(params.id, data, actorId));
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteMedia(params.id, actorId));
