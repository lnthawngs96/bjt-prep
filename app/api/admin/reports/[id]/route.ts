import { adminRoute } from '@/lib/admin/route';
import { resolveReport } from '@/lib/data/admin';
import { reportResolveSchema } from '@/lib/validation/admin/user';

export const PATCH = adminRoute(reportResolveSchema, ({ data, actorId, params }) =>
  resolveReport(params.id, data.status, actorId),
);
