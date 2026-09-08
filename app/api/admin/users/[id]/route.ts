import { adminRoute } from '@/lib/admin/route';
import { setUserRole } from '@/lib/data/admin';
import { userRoleInputSchema } from '@/lib/validation/admin/user';

/** Đổi vai trò. Truy vấn thẳng bảng user, không qua listUsers của plugin (cột role là enum). */
export const PATCH = adminRoute(userRoleInputSchema, ({ data, actorId, params }) =>
  setUserRole(params.id, data.role, actorId),
);
