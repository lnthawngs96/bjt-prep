import { adminRoute } from '@/lib/admin/route';
import { createMaterial } from '@/lib/data/admin';
import { materialInputSchema } from '@/lib/validation/admin/material';

export const POST = adminRoute(materialInputSchema, ({ data, actorId }) => createMaterial(data, actorId));
