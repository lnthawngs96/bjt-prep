import * as mock from './sources/mock/questions';
import * as dbSource from './sources/db/questions';
import { USE_DB } from './source';

/** Hai nguồn phải cùng chữ ký — ép `typeof mock` ở đây, lệch là typecheck gãy. */
const src: typeof mock = USE_DB ? dbSource : mock;

export const {
  getGroupsForExamBySet,
  getGroupsForExamByMockTest,
  getGroupsWithAnswersBySet,
  getGroupsWithAnswersByMockTest,
  getQuestionWithAnswer,
  getCorrectOptionIds,
  getTagsForQuestion,
  getVocabToReview,
  getGrammarToReview,
  getAllGroups,
  getAllQuestionsForAdmin,
  getTagBySlug,
} = src;
