import * as mock from './sources/mock/sections';
import * as dbSource from './sources/db/sections';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const { getParts, getPartsWithSections, getSections, getSectionsByPart, getSection, getTags } = src;
