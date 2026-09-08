import * as mock from './sources/mock/grammar';
import * as dbSource from './sources/db/grammar';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const { getGrammarPoints, getGrammarBySlug, getAllGrammarForAdmin } = src;
