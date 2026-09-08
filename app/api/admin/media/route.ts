import { adminRoute } from '@/lib/admin/route';
import { createMedia } from '@/lib/data/admin';
import { mediaInputSchema } from '@/lib/validation/admin/media';

export const POST = adminRoute(mediaInputSchema, ({ data, actorId }) => createMedia(data, actorId));
