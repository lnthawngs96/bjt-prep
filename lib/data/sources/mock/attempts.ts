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
import {
  getCorrectOptionIds,
  getGrammarToReview,
  getGroupsWithAnswersBySet,
  getTagsForQuestion,
  getVocabToReview,
} from './questions';
import type {
  AttemptResult,
  MockTestSummary,
  NavigationMode,
  QuestionSetSummary,
  ResultItem,
} from '@/lib/data/types';
import type { Attempt, AttemptMode, SectionCode } from '@/lib/prisma-types';

/* ============================================================
   ĐIỀU HƯỚNG — bám theo CBT thật, xem CLAUDE.md
   ============================================================ */

const LISTENING_SECTIONS = new Set<string>(['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3']);

/**
 * BJT thật là CBT tuyến tính: audio phát một lần, phần 聴解/聴読解 không lùi được.
 * Chỉ chế độ MOCK mô phỏng điều đó; luyện tập thì tự do để còn học được.
 */
export function navigationModeFor(mode: AttemptMode, sectionCode: SectionCode): NavigationMode {
  if (mode !== 'MOCK') return 'free';
  return LISTENING_SECTIONS.has(sectionCode) ? 'linear' : 'free';
}

/** Audio chỉ phát một lần ở chế độ thi thử. */
export function audioPlayOnce(mode: AttemptMode): boolean {
  return mode === 'MOCK';
}

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
  return MOCK_TESTS.map((t) => {
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
}

/* ============================================================
   LƯỢT LÀM BÀI
   ============================================================ */

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  // TODO(db): db.attempt.findUnique({ where: { id: attemptId } }) — kèm kiểm userId khớp session
  return MOCK_ATTEMPT_BY_ID.get(attemptId) ?? null;
}

export async function getAttemptHistory(): Promise<Attempt[]> {
  // TODO(db): db.attempt.findMany({ where: { userId }, orderBy: { startedAt: 'desc' } })
  return [...MOCK_ATTEMPTS].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

/**
 * Mở một lượt làm bài. Giai đoạn tĩnh trả id suy ra từ setId.
 * TODO(db): db.attempt.create({ data: { userId, mode, questionSetId, totalQuestions } })
 */
export async function startAttempt(input: {
  mode: AttemptMode;
  questionSetId?: string;
  mockTestId?: string;
}): Promise<{ attemptId: string }> {
  const key = input.questionSetId ?? input.mockTestId ?? 'unknown';
  return { attemptId: `att-${key}` };
}

/**
 * CHẤM ĐIỂM — luôn ở server, kể cả khi dữ liệu còn mock.
 * Client gửi lên questionId → optionId, server tự tra đáp án.
 * KHÔNG BAO GIỜ tin con số đúng/sai do client tính.
 */
export async function submitAttempt(input: {
  attemptId: string;
  mode: AttemptMode;
  answers: { questionId: string; selectedOptionId: string | null }[];
}) {
  // TODO(db): transaction — chèn AttemptAnswer, cập nhật Attempt, đẩy job cập nhật UserSkillStat
  const correctMap = await getCorrectOptionIds(input.answers.map((a) => a.questionId));
  let correct = 0;
  for (const a of input.answers) {
    if (a.selectedOptionId && correctMap.get(a.questionId) === a.selectedOptionId) correct++;
  }
  const isFullMockTest = input.mode === 'MOCK' && input.answers.length === MOCK_TEST_QUESTION_COUNT;
  return {
    attemptId: input.attemptId,
    ...scoreAttempt(correct, input.answers.length, isFullMockTest),
  };
}

/* ============================================================
   MÀN KẾT QUẢ — nơi tạo ra giá trị thật, không phải con số điểm
   ============================================================ */

export async function getAttemptResult(attemptId: string): Promise<AttemptResult | null> {
  // TODO(db): db.attempt.findUnique({ where: { id: attemptId }, include: { answers: {
  //   include: { question: { include: { options: true, group: { include: { materials: ... } },
  //   vocabLinks: { include: { vocab: true } }, grammarLinks: { include: { grammar: true } },
  //   tags: { include: { tag: true } } } } } } } })
  const attempt = MOCK_ATTEMPT_BY_ID.get(attemptId);
  if (!attempt) return null;

  const setId = attempt.questionSetId;
  const groups = setId ? await getGroupsWithAnswersBySet(setId) : [];
  const answers = MOCK_ATTEMPT_ANSWERS.filter((a) => a.attemptId === attemptId);

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

export async function getSet(setId: string) {
  // TODO(db): db.questionSet.findUnique({ where: { id: setId } })
  return MOCK_SET_BY_ID.get(setId) ?? null;
}

/** Group đầu tiên của một bộ — dùng suy ra sectionCode cho navigationMode. */
export async function getFirstGroupOfSet(setId: string) {
  const first = MOCK_SET_ITEMS.filter((i) => i.setId === setId).sort((a, b) => a.order - b.order)[0];
  return first ? (MOCK_GROUP_BY_ID.get(first.groupId) ?? null) : null;
}
