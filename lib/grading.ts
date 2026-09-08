import type { AttemptMode } from '@/lib/prisma-types';
import { MOCK_TEST_QUESTION_COUNT, scoreAttempt } from '@/lib/scoring';
import { SUBMIT_GRACE_SEC } from '@/lib/exam-rules';

/**
 * CHẤM ĐIỂM — logic thuần, chạy ở server, dùng chung cho nguồn mock và DB.
 *
 * Ba quy tắc bảo vệ, mỗi quy tắc từng bị bỏ sót một lần:
 * 1. Lượt đã nộp thì không nộp lại — nếu không, xem kết quả xong gửi lại đáp án đúng.
 * 2. Chỉ chấm câu THUỘC ĐỀ — client gửi questionId của bộ khác thì bỏ, và
 *    số câu đúng không bao giờ vượt số câu của đề.
 * 3. Quá giờ (kể cả thời gian bù) thì từ chối — đồng hồ client tắt được.
 */

export type GradedAnswer = { questionId: string; selectedOptionId: string | null; isCorrect: boolean };

export type GradeInput = {
  attempt: { mode: AttemptMode; startedAt: Date; finishedAt: Date | null; totalQuestions: number };
  /** Mọi câu của đề, đúng thứ tự. */
  attemptQuestionIds: string[];
  correctOptionByQuestion: Map<string, string>;
  answers: { questionId: string; selectedOptionId: string | null }[];
  now: Date;
  timeLimitSec: number;
  graceSec?: number;
};

export type GradeResult =
  | { ok: false; code: 'ALREADY_SUBMITTED' | 'TIME_EXCEEDED' }
  | {
      ok: true;
      graded: GradedAnswer[];
      correct: number;
      scored: ReturnType<typeof scoreAttempt>;
      finishedAt: Date;
      timeSpentSec: number;
    };

export function gradeSubmission(input: GradeInput): GradeResult {
  const { attempt, now } = input;
  if (attempt.finishedAt) return { ok: false, code: 'ALREADY_SUBMITTED' };

  const grace = input.graceSec ?? SUBMIT_GRACE_SEC;
  const deadline = attempt.startedAt.getTime() + (input.timeLimitSec + grace) * 1000;
  if (now.getTime() > deadline) return { ok: false, code: 'TIME_EXCEEDED' };

  // Câu nào gửi nhiều lần thì lấy lần cuối; id không thuộc đề bị bỏ ở bước map dưới.
  const chosen = new Map<string, string | null>();
  for (const a of input.answers) chosen.set(a.questionId, a.selectedOptionId);

  const graded: GradedAnswer[] = input.attemptQuestionIds.map((questionId) => {
    const selectedOptionId = chosen.get(questionId) ?? null;
    const isCorrect =
      selectedOptionId != null && input.correctOptionByQuestion.get(questionId) === selectedOptionId;
    return { questionId, selectedOptionId, isCorrect };
  });

  const correct = graded.filter((g) => g.isCorrect).length;
  const total = input.attemptQuestionIds.length;

  // Chỉ đề thi thử ĐỦ 80 câu mới quy ra thang 800.
  const isFullMockTest = attempt.mode === 'MOCK' && total === MOCK_TEST_QUESTION_COUNT;
  const scored = scoreAttempt(correct, total, isFullMockTest);

  return {
    ok: true,
    graded,
    correct,
    scored,
    finishedAt: now,
    timeSpentSec: Math.max(0, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000)),
  };
}
