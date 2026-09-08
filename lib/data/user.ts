import * as mock from './sources/mock/user';
import * as dbSource from './sources/db/user';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const { getCurrentUser, getUserProfile, getWeakSkills, getStudentDashboard, getRanking } = src;
