import { adminRouteNoBody } from '@/lib/admin/route';
import { publishMockTest } from '@/lib/data/admin';

/** Server kiểm đủ 80 câu đúng phân bổ section trước khi cho publish. */
export const POST = adminRouteNoBody(({ actorId, params }) => publishMockTest(params.id, actorId));
