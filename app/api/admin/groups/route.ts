import { adminRoute } from '@/lib/admin/route';
import { createGroup } from '@/lib/data/admin';
import { groupInputSchema } from '@/lib/validation/admin/group';

export const POST = adminRoute(groupInputSchema, ({ data, actorId }) => createGroup(data, actorId));
