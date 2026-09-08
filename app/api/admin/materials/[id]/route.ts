import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteMaterial, updateMaterial } from '@/lib/data/admin';
import { materialInputSchema } from '@/lib/validation/admin/material';

export const PATCH = adminRoute(materialInputSchema, ({ data, actorId, params }) =>
  updateMaterial(params.id, data, actorId),
);
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteMaterial(params.id, actorId));
