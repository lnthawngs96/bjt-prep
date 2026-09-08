import { db } from '@/lib/db';
import { Prisma } from '@/lib/prisma-types';
import { gradeSubmission } from '@/lib/grading';
import { mockTimeLimitSec, practiceTimeLimitSec } from '@/lib/exam-rules';
import { getGroupsWithAnswersByMockTest, getGroupsWithAnswersBySet } from './questions';
import type {
  AttemptResult,
  MockTestSummary,
  QuestionSetSummary,
  ResultItem,
  SubmitError,
  SubmitResult,
} from '@/lib/data/types';
import type { Attempt, AttemptMode, MockTest, QuestionGroup, QuestionSet, SectionCode } from '@/lib/prisma-types';

type Tx = Prisma.TransactionClient;

/** userId giả để truy vấn "lượt của người này" trả rỗng khi là khách. */
const NO_USER = '__guest__';

/* ============================================================
   HÀM NỘI BỘ
   ============================================================ */

/** Id các group của một đề, đúng thứ tự. Group chưa PUBLISHED bị bỏ. */
async function groupIdsOf(
  tx: Tx,
  ref: { questionSetId: string | null; mockTestId: string | null },
): Promise<string[]> {
  if (ref.mockTestId) {
    const items = await tx.mockTestItem.findMany({
      where: { mockTestId: ref.mockTestId, group: { status: 'PUBLISHED' } },
      orderBy: { order: 'asc' },
      select: { groupId: true },
    });
    return items.map((i) => i.groupId);
  }
  if (ref.questionSetId) {
    const items = await tx.questionSetItem.findMany({
      where: { setId: ref.questionSetId, group: { status: 'PUBLISHED' } },
      orderBy: { order: 'asc' },
      select: { groupId: true },
    });
    return items.map((i) => i.groupId);
  }
  return [];
}

/** Mọi câu PUBLISHED của đề, đúng thứ tự group rồi thứ tự câu — tập DUY NHẤT được chấm. */
async function questionsOfGroups(tx: Tx, groupIds: string[]) {
  if (groupIds.length === 0) return [];
  const rows = await tx.question.findMany({
    where: { groupId: { in: groupIds }, status: 'PUBLISHED' },
    select: { id: true, groupId: true, order: true, sectionCode: true },
  });
  const pos = new Map(groupIds.map((id, i) => [id, i]));
  return rows.sort(
    (a, b) => (pos.get(a.groupId) ?? 0) - (pos.get(b.groupId) ?? 0) || a.order - b.order,
  );
}

const PUBLISHED_QUESTION_COUNT = {
  _count: { select: { questions: { where: { status: 'PUBLISHED' as const } } } },
};

/* ============================================================
   DANH SÁCH BỘ VÀ ĐỀ
   ============================================================ */

export async function getSetsBySection(
  sectionCode: SectionCode,
  userId: string | null,
): Promise<QuestionSetSummary[]> {
  const sets = await db.questionSet.findMany({
    where: { sectionCode, status: 'PUBLISHED' },
    include: {
      items: { include: { group: { select: { status: true, ...PUBLISHED_QUESTION_COUNT } } } },
      attempts: {
        where: { userId: userId ?? NO_USER, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { indexNo: 'asc' },
  });

  return sets.map(({ items, attempts, ...s }) => {
    const last = attempts[0];
    return {
      ...s,
      questionCount: items
        .filter((i) => i.group.status === 'PUBLISHED')
        .reduce((n, i) => n + i.group._count.questions, 0),
      lastResult: last
        ? { correct: last.rawCorrect, total: last.totalQuestions, attemptId: last.id }
        : null,
    };
  });
}

export async function getMockTests(userId: string | null): Promise<MockTestSummary[]> {
  const tests = await db.mockTest.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      items: { include: { group: { select: { status: true, ...PUBLISHED_QUESTION_COUNT } } } },
      attempts: {
        where: { userId: userId ?? NO_USER, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        take: 1,
      },
    },
  });

  const rows = tests.map(({ items, attempts, ...t }) => {
    const perSection: Partial<Record<SectionCode, number>> = {};
    let questionCount = 0;
    for (const i of items) {
      if (i.group.status !== 'PUBLISHED') continue;
      const n = i.group._count.questions;
      perSection[i.sectionCode] = (perSection[i.sectionCode] ?? 0) + n;
      questionCount += n;
    }
    const last = attempts[0];
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

  // Đề chưa làm lên trước; đề đã làm xếp theo lần làm gần nhất.
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

/** Lượt làm bài — chỉ trả về khi ĐÚNG chủ. Người khác thấy như không tồn tại. */
export async function getAttempt(attemptId: string, userId: string): Promise<Attempt | null> {
  return db.attempt.findFirst({ where: { id: attemptId, userId } });
}

export async function getAttemptHistory(userId: string): Promise<Attempt[]> {
  return db.attempt.findMany({
    where: { userId, finishedAt: { not: null } },
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Mở một lượt làm bài — server sinh id (cuid) và gắn với userId.
 * totalQuestions chốt lúc mở, đếm đúng những câu sẽ được chấm.
 */
export async function startAttempt(input: {
  userId: string;
  mode: AttemptMode;
  questionSetId?: string | null;
  mockTestId?: string | null;
}): Promise<{ attemptId: string } | { error: 'EMPTY' }> {
  const ref = { questionSetId: input.questionSetId ?? null, mockTestId: input.mockTestId ?? null };
  const groupIds = await groupIdsOf(db, ref);
  const totalQuestions =
    groupIds.length === 0
      ? 0
      : await db.question.count({ where: { groupId: { in: groupIds }, status: 'PUBLISHED' } });
  // Đề chưa có câu nào thì không mở được — nếu không sẽ vào màn thi trắng.
  if (totalQuestions === 0) return { error: 'EMPTY' };

  const created = await db.attempt.create({
    data: { userId: input.userId, mode: input.mode, ...ref, totalQuestions },
    select: { id: true },
  });
  return { attemptId: created.id };
}

/**
 * CHẤM ĐIỂM — trong một transaction: đọc lượt, tra đáp án, chấm bằng
 * lib/grading.ts, ghi AttemptAnswer rồi chốt Attempt.
 *
 * Hai request nộp cùng lúc: cả hai thấy finishedAt null, nhưng unique
 * (attemptId, questionId) làm request thứ hai vỡ ở createMany → P2002 →
 * trả ALREADY_SUBMITTED. Không cần khoá hàng.
 */
export async function submitAttempt(input: {
  attemptId: string;
  userId: string;
  answers: { questionId: string; selectedOptionId: string | null }[];
  now?: Date;
}): Promise<SubmitResult | { error: SubmitError }> {
  try {
    return await db.$transaction(async (tx) => {
      const attempt = await tx.attempt.findFirst({ where: { id: input.attemptId, userId: input.userId } });
      if (!attempt) return { error: 'NOT_FOUND' as const };

      const groupIds = await groupIdsOf(tx, attempt);
      const questions = await questionsOfGroups(tx, groupIds);
      const attemptQuestionIds = questions.map((q) => q.id);

      const correctRows =
        attemptQuestionIds.length === 0
          ? []
          : await tx.questionOption.findMany({
              where: { questionId: { in: attemptQuestionIds }, isCorrect: true },
              select: { questionId: true, id: true },
            });
      const correctOptionByQuestion = new Map(correctRows.map((r) => [r.questionId, r.id]));

      let timeLimitSec: number;
      if (attempt.mode === 'MOCK') {
        const parts = await tx.partDef.findMany({ include: { sections: true }, orderBy: { order: 'asc' } });
        timeLimitSec = mockTimeLimitSec(
          parts,
          questions.map((q) => q.sectionCode),
        );
      } else {
        const set = attempt.questionSetId
          ? await tx.questionSet.findUnique({ where: { id: attempt.questionSetId }, select: { estMinutes: true } })
          : null;
        timeLimitSec = practiceTimeLimitSec(set?.estMinutes);
      }

      const result = gradeSubmission({
        attempt,
        attemptQuestionIds,
        correctOptionByQuestion,
        answers: input.answers,
        now: input.now ?? new Date(),
        timeLimitSec,
      });
      if (!result.ok) return { error: result.code };

      // { "L1": { correct, total }, ... } — cho màn kết quả và thống kê sau này.
      const sectionOf = new Map(questions.map((q) => [q.id, q.sectionCode]));
      const perSection: Record<string, { correct: number; total: number }> = {};
      for (const g of result.graded) {
        const code = sectionOf.get(g.questionId) ?? 'UNKNOWN';
        const cur = (perSection[code] ??= { correct: 0, total: 0 });
        cur.total += 1;
        if (g.isCorrect) cur.correct += 1;
      }

      if (result.graded.length > 0) {
        await tx.attemptAnswer.createMany({
          data: result.graded.map((g) => ({
            attemptId: attempt.id,
            questionId: g.questionId,
            selectedOptionId: g.selectedOptionId,
            isCorrect: g.isCorrect,
            answeredAt: result.finishedAt,
          })),
        });
      }

      await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          finishedAt: result.finishedAt,
          timeSpentSec: result.timeSpentSec,
          rawCorrect: result.correct,
          estimatedScore: result.scored.estimatedScore,
          estimatedLevel: result.scored.estimatedLevel,
          perSection,
        },
      });

      return { attemptId: attempt.id, ...result.scored };
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'ALREADY_SUBMITTED' };
    }
    throw e;
  }
}

/* ============================================================
   MÀN KẾT QUẢ — nơi tạo ra giá trị thật, không phải con số điểm
   ============================================================ */

export async function getAttemptResult(attemptId: string, userId: string): Promise<AttemptResult | null> {
  const found = await db.attempt.findFirst({
    where: { id: attemptId, userId },
    include: { answers: true },
  });
  if (!found) return null;
  const { answers, ...attempt } = found;

  const groups = attempt.mockTestId
    ? await getGroupsWithAnswersByMockTest(attempt.mockTestId)
    : attempt.questionSetId
      ? await getGroupsWithAnswersBySet(attempt.questionSetId)
      : [];

  // Gom liên kết ngược của mọi câu bằng ba truy vấn thay vì ba truy vấn mỗi câu.
  const questionIds = groups.flatMap((g) => g.questions.map((q) => q.id));
  const [tagRows, vocabRows, grammarRows] = await Promise.all([
    db.questionTag.findMany({ where: { questionId: { in: questionIds } }, include: { tag: true } }),
    db.questionVocab.findMany({ where: { questionId: { in: questionIds } }, include: { vocab: true } }),
    db.questionGrammar.findMany({ where: { questionId: { in: questionIds } }, include: { grammar: true } }),
  ]);
  const byQuestion = <T extends { questionId: string }>(rows: T[]) => {
    const m = new Map<string, T[]>();
    for (const r of rows) (m.get(r.questionId) ?? m.set(r.questionId, []).get(r.questionId)!).push(r);
    return m;
  };
  const tagsBy = byQuestion(tagRows);
  const vocabBy = byQuestion(vocabRows);
  const grammarBy = byQuestion(grammarRows);
  const answerBy = new Map(answers.map((a) => [a.questionId, a]));

  const items: ResultItem[] = [];
  for (const g of groups) {
    for (const q of g.questions) {
      const answer = answerBy.get(q.id);
      items.push({
        question: q,
        group: { id: g.id, titleAdmin: g.titleAdmin, sectionCode: g.sectionCode, instructionVi: g.instructionVi },
        materials: g.materials,
        selectedOptionId: answer?.selectedOptionId ?? null,
        // Không có bản ghi trả lời nghĩa là bỏ trống — tính là sai.
        isCorrect: answer?.isCorrect ?? false,
        vocabToReview: (vocabBy.get(q.id) ?? []).map((r) => r.vocab),
        grammarToReview: (grammarBy.get(q.id) ?? []).map((r) => r.grammar),
        tags: (tagsBy.get(q.id) ?? []).map((r) => r.tag).sort((a, b) => a.order - b.order),
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
  const latest = await db.attempt.findFirst({
    where: { userId, mode: 'MOCK', finishedAt: { not: null }, estimatedScore: { not: null } },
    orderBy: { finishedAt: 'desc' },
    select: { estimatedScore: true, estimatedLevel: true },
  });
  if (!latest || latest.estimatedScore == null) return null;
  return { score: latest.estimatedScore, level: latest.estimatedLevel };
}

export async function getMockTest(mockTestId: string): Promise<MockTest | null> {
  return db.mockTest.findUnique({ where: { id: mockTestId } });
}

export async function getSet(setId: string): Promise<QuestionSet | null> {
  return db.questionSet.findUnique({ where: { id: setId } });
}

/** Group đầu tiên của một bộ — còn dùng ở vài chỗ hiển thị. */
export async function getFirstGroupOfSet(setId: string): Promise<QuestionGroup | null> {
  const first = await db.questionSetItem.findFirst({
    where: { setId },
    orderBy: { order: 'asc' },
    include: { group: true },
  });
  return first?.group ?? null;
}
