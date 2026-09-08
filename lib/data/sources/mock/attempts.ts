import {
  MOCK_ATTEMPTS,
  MOCK_ATTEMPT_ANSWERS,
  MOCK_ATTEMPT_BY_ID,
  MOCK_ESTIMATED_LEVEL,
  MOCK_ESTIMATED_SCORE,
} from '@/mock/user';
import { MOCK_SETS, MOCK_SET_BY_ID, MOCK_SET_ITEMS } from '@/mock/sets';
import { MOCK_TESTS, MOCK_TEST_ITEMS } from '@/mock/mockTests';
import { MOCK_GROUP_BY_ID } from '@/mock/groups';
import { MOCK_QUESTIONS } from '@/mock/questions';
import { MOCK_TEST_QUESTION_COUNT, scoreAttempt } from '@/lib/scoring';
import { attemptStore, newAttemptId, type StoredAttempt } from './store';
import {
  getCorrectOptionIds,
  getGrammarToReview,
  getGroupsWithAnswersByMockTest,
  getGroupsWithAnswersBySet,
  getTagsForQuestion,
  getVocabToReview,
} from './questions';
import type {
  AttemptResult,
  MockTestSummary,
  QuestionSetSummary,
  ResultItem,
} from '@/lib/data/types';
import type { Attempt, AttemptMode, SectionCode } from '@/lib/prisma-types';

/* ============================================================
   DANH SÁCH BỘ VÀ ĐỀ
   ============================================================ */

function questionCountOfSet(setId: string): number {
  return MOCK_SET_ITEMS.filter((i) => i.setId === setId).reduce(
    (n, i) => n + MOCK_QUESTIONS.filter((q) => q.groupId === i.groupId).length,
    0,
  );
}

export async function getSetsBySection(sectionCode: SectionCode): Promise<QuestionSetSummary[]> {
  // TODO(db): db.questionSet.findMany({ where: { sectionCode, status: 'PUBLISHED' },
  //   include: { items: { include: { group: { include: { _count: { select: { questions: true } } } } } },
  //              attempts: { where: { userId }, orderBy: { startedAt: 'desc' }, take: 1 } },
  //   orderBy: { indexNo: 'asc' } })
  return MOCK_SETS.filter((s) => s.sectionCode === sectionCode)
    .sort((a, b) => a.indexNo - b.indexNo)
    .map((s) => {
      const last = MOCK_ATTEMPTS.find((a) => a.questionSetId === s.id && a.finishedAt);
      return {
        ...s,
        questionCount: questionCountOfSet(s.id),
        lastResult: last
          ? { correct: last.rawCorrect, total: last.totalQuestions, attemptId: last.id }
          : null,
      };
    });
}

export async function getMockTests(): Promise<MockTestSummary[]> {
  // TODO(db): db.mockTest.findMany({ include: { items: true, attempts: { where: { userId } } } })
  const rows = MOCK_TESTS.map((t) => {
    const items = MOCK_TEST_ITEMS.filter((i) => i.mockTestId === t.id);
    const perSection: Partial<Record<SectionCode, number>> = {};
    let questionCount = 0;
    for (const i of items) {
      const n = MOCK_QUESTIONS.filter((q) => q.groupId === i.groupId).length;
      perSection[i.sectionCode] = (perSection[i.sectionCode] ?? 0) + n;
      questionCount += n;
    }
    const last = MOCK_ATTEMPTS.find((a) => a.mockTestId === t.id && a.finishedAt);
    return {
      ...t,
      questionCount,
      perSection,
      lastAttempt:
        last && last.finishedAt
          ? {
              attemptId: last.id,
              score: last.estimatedScore ?? 0,
              correct: last.rawCorrect,
              takenAt: last.finishedAt,
            }
          : null,
    };
  });

  // Đề chưa làm lên trước — đó là việc học viên cần làm tiếp.
  // Đề đã làm xếp theo lần làm gần nhất.
  return rows.sort((a, b) => {
    if (!a.lastAttempt && b.lastAttempt) return -1;
    if (a.lastAttempt && !b.lastAttempt) return 1;
    if (a.lastAttempt && b.lastAttempt) {
      return b.lastAttempt.takenAt.getTime() - a.lastAttempt.takenAt.getTime();
    }
    return a.code.localeCompare(b.code);
  });
}

/* ============================================================
   LƯỢT LÀM BÀI
   ============================================================ */

/** Đổi bản ghi trong bộ nhớ tạm sang đúng hình dạng model Attempt. */
function toAttempt(a: StoredAttempt): Attempt {
  return {
    id: a.id,
    userId: a.userId,
    mode: a.mode,
    questionSetId: a.questionSetId,
    mockTestId: a.mockTestId,
    startedAt: a.startedAt,
    finishedAt: a.finishedAt,
    timeSpentSec: a.timeSpentSec,
    rawCorrect: a.rawCorrect,
    totalQuestions: a.totalQuestions,
    estimatedScore: a.estimatedScore,
    estimatedLevel: a.estimatedLevel,
    perSection: null,
  };
}

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  // TODO(db): db.attempt.findUnique({ where: { id: attemptId } })
  //           kèm kiểm attempt.userId === session.user.id, nếu lệch trả 404.
  const live = attemptStore.get(attemptId);
  if (live) return toAttempt(live);
  return MOCK_ATTEMPT_BY_ID.get(attemptId) ?? null;
}

export async function getAttemptHistory(): Promise<Attempt[]> {
  // TODO(db): db.attempt.findMany({ where: { userId }, orderBy: { startedAt: 'desc' } })
  return [...MOCK_ATTEMPTS].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

/**
 * Mở một lượt làm bài — server sinh id và gắn với userId.
 *
 * KHÔNG suy id từ setId. Làm vậy thì hai học viên cùng làm một bộ sẽ dùng
 * chung id và ghi đè kết quả của nhau.
 *
 * TODO(db): db.attempt.create({ data: { userId, mode, questionSetId, mockTestId, totalQuestions } })
 */
export async function startAttempt(input: {
  userId: string;
  mode: AttemptMode;
  questionSetId?: string | null;
  mockTestId?: string | null;
}): Promise<{ attemptId: string } | { error: 'EMPTY' }> {
  const { userId } = input;

  const groups = input.mockTestId
    ? MOCK_TEST_ITEMS.filter((i) => i.mockTestId === input.mockTestId).map((i) => i.groupId)
    : MOCK_SET_ITEMS.filter((i) => i.setId === input.questionSetId).map((i) => i.groupId);

  const totalQuestions = groups.reduce(
    (n, gid) => n + MOCK_QUESTIONS.filter((q) => q.groupId === gid).length,
    0,
  );
  // Đề chưa có câu nào thì không mở được — nếu không sẽ vào màn thi trắng.
  if (totalQuestions === 0) return { error: 'EMPTY' };

  const id = newAttemptId();
  attemptStore.set(id, {
    id,
    userId,
    mode: input.mode,
    questionSetId: input.questionSetId ?? null,
    mockTestId: input.mockTestId ?? null,
    startedAt: new Date(),
    finishedAt: null,
    timeSpentSec: null,
    totalQuestions,
    rawCorrect: 0,
    estimatedScore: null,
    estimatedLevel: null,
    answers: [],
  });
  return { attemptId: id };
}

/**
 * CHẤM ĐIỂM — luôn ở server, kể cả khi dữ liệu còn mock.
 * Client gửi lên questionId → optionId, server tự tra đáp án.
 * KHÔNG BAO GIỜ tin con số đúng/sai do client tính.
 */
export async function submitAttempt(input: {
  attemptId: string;
  userId: string;
  answers: { questionId: string; selectedOptionId: string | null }[];
}) {
  // TODO(db): transaction — chèn AttemptAnswer, cập nhật Attempt, đẩy job cập nhật UserSkillStat
  const attempt = attemptStore.get(input.attemptId);
  if (!attempt) return null;
  // Không cho nộp hộ lượt của người khác.
  if (attempt.userId !== input.userId) return null;

  const correctMap = await getCorrectOptionIds(input.answers.map((a) => a.questionId));
  const graded = input.answers.map((a) => ({
    questionId: a.questionId,
    selectedOptionId: a.selectedOptionId,
    isCorrect: Boolean(a.selectedOptionId && correctMap.get(a.questionId) === a.selectedOptionId),
  }));
  const correct = graded.filter((a) => a.isCorrect).length;

  // Chỉ đề thi thử ĐỦ 80 câu mới quy ra thang 800. Ngoại suy từ một bộ nhỏ
  // làm điểm dao động hàng trăm đơn vị chỉ vì đoán trúng một câu.
  const isFullMockTest =
    attempt.mode === 'MOCK' && attempt.totalQuestions === MOCK_TEST_QUESTION_COUNT;
  const scored = scoreAttempt(correct, attempt.totalQuestions, isFullMockTest);

  const finishedAt = new Date();
  attemptStore.set(input.attemptId, {
    ...attempt,
    finishedAt,
    timeSpentSec: Math.round((finishedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    rawCorrect: correct,
    estimatedScore: scored.estimatedScore,
    estimatedLevel: scored.estimatedLevel,
    answers: graded,
  });

  return { attemptId: input.attemptId, ...scored };
}

/* ============================================================
   MÀN KẾT QUẢ — nơi tạo ra giá trị thật, không phải con số điểm
   ============================================================ */

export async function getAttemptResult(attemptId: string): Promise<AttemptResult | null> {
  // TODO(db): db.attempt.findUnique({ where: { id: attemptId }, include: { answers: {
  //   include: { question: { include: { options: true, group: { include: { materials: ... } },
  //   vocabLinks: { include: { vocab: true } }, grammarLinks: { include: { grammar: true } },
  //   tags: { include: { tag: true } } } } } } } })
  //   Nhớ kiểm attempt.userId === session.user.id.
  const live = attemptStore.get(attemptId);
  const attempt = live ? toAttempt(live) : (MOCK_ATTEMPT_BY_ID.get(attemptId) ?? null);
  if (!attempt) return null;

  const groups = attempt.mockTestId
    ? await getGroupsWithAnswersByMockTest(attempt.mockTestId)
    : attempt.questionSetId
      ? await getGroupsWithAnswersBySet(attempt.questionSetId)
      : [];

  const answers = live
    ? live.answers
    : MOCK_ATTEMPT_ANSWERS.filter((a) => a.attemptId === attemptId);

  const items: ResultItem[] = [];
  for (const g of groups) {
    for (const q of g.questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      const [vocabToReview, grammarToReview, tags] = await Promise.all([
        getVocabToReview(q.id),
        getGrammarToReview(q.id),
        getTagsForQuestion(q.id),
      ]);
      items.push({
        question: q,
        group: {
          id: g.id,
          titleAdmin: g.titleAdmin,
          sectionCode: g.sectionCode,
          instructionVi: g.instructionVi,
        },
        materials: g.materials,
        selectedOptionId: answer?.selectedOptionId ?? null,
        // Không có bản ghi trả lời nghĩa là bỏ trống — tính là sai.
        isCorrect: answer?.isCorrect ?? false,
        vocabToReview,
        grammarToReview,
        tags,
      });
    }
  }

  return {
    attempt,
    items,
    estimatedScore: attempt.estimatedScore,
    estimatedLevel: attempt.estimatedLevel,
  };
}

/** Điểm ước tính hiện tại — lấy từ lần thi thử gần nhất. */
export async function getCurrentEstimate() {
  // TODO(db): db.attempt.findFirst({ where: { userId, mode: 'MOCK', finishedAt: { not: null } }, orderBy: { finishedAt: 'desc' } })
  return { score: MOCK_ESTIMATED_SCORE, level: MOCK_ESTIMATED_LEVEL };
}

export async function getMockTest(mockTestId: string) {
  // TODO(db): db.mockTest.findUnique({ where: { id: mockTestId } })
  return MOCK_TESTS.find((t) => t.id === mockTestId) ?? null;
}

/** Section của group đầu tiên trong đề — dùng suy ra navigationMode. */
export async function getFirstGroupOfMockTest(mockTestId: string) {
  const first = MOCK_TEST_ITEMS.filter((i) => i.mockTestId === mockTestId).sort(
    (a, b) => a.order - b.order,
  )[0];
  return first ? (MOCK_GROUP_BY_ID.get(first.groupId) ?? null) : null;
}

export async function getSet(setId: string) {
  // TODO(db): db.questionSet.findUnique({ where: { id: setId } })
  return MOCK_SET_BY_ID.get(setId) ?? null;
}

/** Group đầu tiên của một bộ — dùng suy ra sectionCode cho navigationMode. */
export async function getFirstGroupOfSet(setId: string) {
  const first = MOCK_SET_ITEMS.filter((i) => i.setId === setId).sort((a, b) => a.order - b.order)[0];
  return first ? (MOCK_GROUP_BY_ID.get(first.groupId) ?? null) : null;
}
