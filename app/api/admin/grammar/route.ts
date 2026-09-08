import { adminRoute } from '@/lib/admin/route';
import { createGrammar } from '@/lib/data/admin';
import { grammarInputSchema } from '@/lib/validation/admin/grammar';

export const POST = adminRoute(grammarInputSchema, ({ data, actorId }) => createGrammar(data, actorId));
