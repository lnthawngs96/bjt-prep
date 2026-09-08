import {
  MOCK_ATTEMPTS,
  MOCK_ATTEMPT_ANSWERS,
  MOCK_ATTEMPT_BY_ID,
  MOCK_ESTIMATED_LEVEL,
  MOCK_ESTIMATED_SCORE,
} from '@/mock/user';
import { MOCK_SETS, MOCK_SET_BY_ID, MOCK_SET_ITEMS } from '@/mock/sets';
import { MOCK_TESTS, MOCK_TEST_BY_ID, MOCK_TEST_ITEMS } from '@/mock/mockTests';
import { MOCK_GROUP_BY_ID } from '@/mock/groups';
import { MOCK_QUESTIONS } from '@/mock/questions';
import { gradeSubmission } from '@/lib/grading';
import { mockTimeLimitSec, practiceTimeLimitSec } from '@/lib/exam-rules';
import { attemptStore, newAttemptId, type StoredAttempt } from './store';
import { getPartsWithSections } from './sections';
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
  SubmitError,
  SubmitResult,
} from '@/lib/data/types';
import type { Attempt, AttemptMode, SectionCode } from '@/lib/prisma-types';

/* ============================================================
   HÀM NỘI BỘ
   ============================================================ */

/** Id các group của một đề, đúng thứ tự. */
function groupIdsOf(input: { questionSetId: string | null; mockTestId: string | null }): string[] {
  if (input.mockTestId) {
    return MOCK_TEST_ITEMS.filter((i) => i.mockTestId === input.mockTestId)
      .sort((a, b) => a.order - b.order)
      .map((i) => i.groupId);
  }
  return MOCK_SET_ITEMS.filter((i) => i.setId === input.questionSetId)
    .sort((a, b) => a.order - b.order)
    .map((i) => i.groupId);
}

/** Mọi câu của đề, đúng thứ tự — đây là tập DUY NHẤT được chấm. */
function questionsOfGroups(groupIds: string[]) {
  return groupIds.flatMap((gid) =>
    MOCK_QUESTIONS.filter((q) => q.groupId === gid).sort((a, b) => a.order - b.order),
  );
}

function questionCountOfSet(setId: string): number {
  return questionsOfGroups(groupIdsOf({ questionSetId: setId, mockTestId: null })).length;
}

/* ============================================================
   DANH SÁCH BỘ VÀ ĐỀ
   ============================================================ */

export async function getSetsBySection(
  sectionCode: SectionCode,
  userId: string | null,
): Promise<QuestionSetSummary[]> {
  // TODO(db): db.questionSet.findMany({ where: { sectionCode, status: 'PUBLISHED' },
  //   include: { items: { include: { group: { include: { _count: { select: { questions: true } } } } } },
  //              attempts: { where: { userId }, orderBy: { startedAt: 'desc' }, take: 1 } },
  //   orderBy: { indexNo: 'asc' } })
  return MOCK_SETS.filter((s) => s.sectionCode === sectionCode)
    .sort((a, b) => a.indexNo - b.indexNo)
    .map((s) => {
      const last = userId
        ? MOCK_ATTEMPTS.find((a) => a.userId === userId && a.questionSetId === s.id && a.finishedAt)
        : undefined;
      return {
        ...s,
        questionCount: questionCountOfSet(s.id),
        lastResult: last
          ? { correct: last.rawCorrect, total: last.totalQuestions, attemptId: last.id }
          : null,
      };
    });
}

export async function getMockTests(userId: string | null): Promise<MockTestSummary[]> {
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
    const last = userId
      ? MOCK_ATTEMPTS.find((a) => a.userId === userId && a.mockTestId === t.id && a.finishedAt)
      : undefined;
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

/** Lượt làm bài — chỉ trả về khi ĐÚNG chủ. Người khác thấy như không tồn tại. */
export async function getAttempt(attemptId: string, userId: string): Promise<Attempt | null> {
  // TODO(db): db.attempt.findFirst({ where: { id: attemptId, userId } })
  const live = attemptStore.get(attemptId);
  const attempt = live ? toAttempt(live) : (MOCK_ATTEMPT_BY_ID.get(attemptId) ?? null);
  if (!attempt || attempt.userId !== userId) return null;
  return attempt;
}

export async function getAttemptHistory(userId: string): Promise<Attempt[]> {
  // TODO(db): db.attempt.findMany({ where: { userId, finishedAt: { not: null } }, orderBy: { startedAt: 'desc' } })
  const live = [...attemptStore.values()].map(toAttempt);
  return [...MOCK_ATTEMPTS, ...live]
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
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
  const ref = { questionSetId: input.questionSetId ?? null, mockTestId: input.mockTestId ?? null };
  const totalQuestions = questionsOfGroups(groupIdsOf(ref)).length;
  // Đề chưa có câu nào thì không mở được — nếu không sẽ vào màn thi trắng.
  if (totalQuestions === 0) return { error: 'EMPTY' };

  const id = newAttemptId();
  attemptStore.set(id, {
    id,
    userId,
    mode: input.mode,
    ...ref,
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
 * Toàn bộ quy tắc (không nộp lại, chỉ chấm câu thuộc đề, không nộp trễ)
 * nằm trong lib/grading.ts để nguồn DB dùng lại y nguyên.
 */
export async function submitAttempt(input: {
  attemptId: string;
  userId: string;
  answers: { questionId: string; selectedOptionId: string | null }[];
  now?: Date;
}): Promise<SubmitResult | { error: SubmitError }> {
  // TODO(db): transaction — chèn AttemptAnswer, cập nhật Attempt, đẩy job cập nhật UserSkillStat
  const attempt = attemptStore.get(input.attemptId);
  // Không cho nộp hộ lượt của người khác — trả NOT_FOUND để không lộ id có tồn tại.
  if (!attempt || attempt.userId !== input.userId) return { error: 'NOT_FOUND' };

  const groupIds = groupIdsOf(attempt);
  const questions = questionsOfGroups(groupIds);
  const attemptQuestionIds = questions.map((q) => q.id);
  const correctOptionByQuestion = await getCorrectOptionIds(attemptQuestionIds);

  const timeLimitSec =
    attempt.mode === 'MOCK'
      ? mockTimeLimitSec(
          await getPartsWithSections(),
          questions.map((q) => q.sectionCode),
        )
      : practiceTimeLimitSec(
          attempt.questionSetId ? MOCK_SET_BY_ID.get(attempt.questionSetId)?.estMinutes : null,
        );

  const result = gradeSubmission({
    attempt,
    attemptQuestionIds,
    correctOptionByQuestion,
    answers: input.answers,
    now: input.now ?? new Date(),
    timeLimitSec,
  });
  if (!result.ok) return { error: result.code };

  attemptStore.set(input.attemptId, {
    ...attempt,
    finishedAt: result.finishedAt,
    timeSpentSec: result.timeSpentSec,
    rawCorrect: result.correct,
    estimatedScore: result.scored.estimatedScore,
    estimatedLevel: result.scored.estimatedLevel,
    answers: result.graded,
  });

  return { attemptId: input.attemptId, ...result.scored };
}

/* ============================================================
   MÀN KẾT QUẢ — nơi tạo ra giá trị thật, không phải con số điểm
   ============================================================ */

export async function getAttemptResult(attemptId: string, userId: string): Promise<AttemptResult | null> {
  // TODO(db): db.attempt.findFirst({ where: { id: attemptId, userId }, include: { answers: {
  //   include: { question: { include: { options: true, group: { include: { materials: ... } },
  //   vocabLinks: { include: { vocab: true } }, grammarLinks: { include: { grammar: true } },
  //   tags: { include: { tag: true } } } } } } } })
  const live = attemptStore.get(attemptId);
  const attempt = live ? toAttempt(live) : (MOCK_ATTEMPT_BY_ID.get(attemptId) ?? null);
  if (!attempt || attempt.userId !== userId) return null;

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

/** Điểm ước tính hiện tại — lấy từ lần thi thử gần nhất, null nếu chưa thi thử. */
export async function getCurrentEstimate(userId: string) {
  // TODO(db): db.attempt.findFirst({ where: { userId, mode: 'MOCK', finishedAt: { not: null } }, orderBy: { finishedAt: 'desc' } })
  const latest = (await getAttemptHistory(userId)).find(
    (a) => a.mode === 'MOCK' && a.finishedAt && a.estimatedScore != null,
  );
  if (latest) return { score: latest.estimatedScore as number, level: latest.estimatedLevel };
  // Học viên mẫu có sẵn điểm để đối chiếu với prototype.
  if (userId === 'usr-demo') return { score: MOCK_ESTIMATED_SCORE, level: MOCK_ESTIMATED_LEVEL };
  return null;
}

export async function getMockTest(mockTestId: string) {
  // TODO(db): db.mockTest.findUnique({ where: { id: mockTestId } })
  return MOCK_TEST_BY_ID.get(mockTestId) ?? null;
}

export async function getSet(setId: string) {
  // TODO(db): db.questionSet.findUnique({ where: { id: setId } })
  return MOCK_SET_BY_ID.get(setId) ?? null;
}

/** Group đầu tiên của một bộ — còn dùng ở vài chỗ hiển thị. */
export async function getFirstGroupOfSet(setId: string) {
  const first = groupIdsOf({ questionSetId: setId, mockTestId: null })[0];
  return first ? (MOCK_GROUP_BY_ID.get(first) ?? null) : null;
}
