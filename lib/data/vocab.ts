import * as mock from './sources/mock/vocab';
import * as dbSource from './sources/db/vocab';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const {
  getVocabTopics,
  getVocabByTopic,
  getVocabEntry,
  getAllVocab,
  getDueVocabCount,
  getDueVocabCards,
  recordVocabReview,
} = src;
