import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteMockTest, updateMockTest } from '@/lib/data/admin';
import { mockTestInputSchema } from '@/lib/validation/admin/mockTest';

export const PATCH = adminRoute(mockTestInputSchema, ({ data, actorId, params }) =>
  updateMockTest(params.id, data, actorId),
);
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteMockTest(params.id, actorId));
