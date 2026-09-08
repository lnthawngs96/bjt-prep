import { adminRoute } from '@/lib/admin/route';
import { createSet } from '@/lib/data/admin';
import { setInputSchema } from '@/lib/validation/admin/set';

export const POST = adminRoute(setInputSchema, ({ data, actorId }) => createSet(data, actorId));
