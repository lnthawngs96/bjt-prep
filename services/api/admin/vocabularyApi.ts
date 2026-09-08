import { adminCrud } from './adminCrudApi';
import type { VocabInput } from '@/lib/validation/admin/vocab';
import type { GrammarInput } from '@/lib/validation/admin/grammar';

const vocab = adminCrud<VocabInput>('/api/admin/vocabulary');
const grammar = adminCrud<GrammarInput>('/api/admin/grammar');

/** POST /api/admin/vocabulary */
export const handlePostAdminVocabulary = vocab.create;
/** PATCH /api/admin/vocabulary/[id] */
export const handlePatchAdminVocabularyEntry = vocab.update;
/** DELETE /api/admin/vocabulary/[id] */
export const handleDeleteAdminVocabularyEntry = vocab.remove;

/** POST /api/admin/grammar */
export const handlePostAdminGrammar = grammar.create;
/** PATCH /api/admin/grammar/[id] */
export const handlePatchAdminGrammarPoint = grammar.update;
/** DELETE /api/admin/grammar/[id] */
export const handleDeleteAdminGrammarPoint = grammar.remove;
