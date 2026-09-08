import { adminRoute, adminRouteNoBody } from '@/lib/admin/route';
import { deleteGrammar, updateGrammar } from '@/lib/data/admin';
import { grammarInputSchema } from '@/lib/validation/admin/grammar';

export const PATCH = adminRoute(grammarInputSchema, ({ data, actorId, params }) =>
  updateGrammar(params.id, data, actorId),
);
export const DELETE = adminRouteNoBody(({ actorId, params }) => deleteGrammar(params.id, actorId));
