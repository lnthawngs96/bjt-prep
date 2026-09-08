import * as mock from './sources/mock/attempts';
import * as dbSource from './sources/db/attempts';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const {
  getSetsBySection,
  getMockTests,
  getAttempt,
  getAttemptHistory,
  startAttempt,
  submitAttempt,
  getAttemptResult,
  getCurrentEstimate,
  getSet,
  getFirstGroupOfSet,
  getMockTest,
} = src;
