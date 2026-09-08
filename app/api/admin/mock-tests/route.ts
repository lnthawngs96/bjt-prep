import { adminRoute } from '@/lib/admin/route';
import { createMockTest } from '@/lib/data/admin';
import { mockTestInputSchema } from '@/lib/validation/admin/mockTest';

export const POST = adminRoute(mockTestInputSchema, ({ data, actorId }) => createMockTest(data, actorId));
