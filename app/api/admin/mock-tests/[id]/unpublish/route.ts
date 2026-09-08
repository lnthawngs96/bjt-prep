import { adminRouteNoBody } from '@/lib/admin/route';
import { unpublishMockTest } from '@/lib/data/admin';

export const POST = adminRouteNoBody(({ actorId, params }) => unpublishMockTest(params.id, actorId));
