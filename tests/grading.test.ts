import { describe, expect, it } from 'vitest';
import { gradeSubmission, type GradeInput } from '@/lib/grading';

const START = new Date('2026-09-08T09:00:00+07:00');
const at = (sec: number) => new Date(START.getTime() + sec * 1000);

const QUESTIONS = ['q1', 'q2', 'q3'];
const CORRECT = new Map([
  ['q1', 'q1-o2'],
  ['q2', 'q2-o1'],
  ['q3', 'q3-o4'],
]);

function input(over: Partial<GradeInput> = {}): GradeInput {
  return {
    attempt: { mode: 'PRACTICE', startedAt: START, finishedAt: null, totalQuestions: 3 },
    attemptQuestionIds: QUESTIONS,
    correctOptionByQuestion: CORRECT,
    answers: [
      { questionId: 'q1', selectedOptionId: 'q1-o2' },
      { questionId: 'q2', selectedOptionId: 'q2-o3' },
    ],
    now: at(300),
    timeLimitSec: 600,
    ...over,
  };
}

describe('gradeSubmission', () => {
  it('chấm đúng: 1 đúng, 1 sai, 1 bỏ trống tính sai', () => {
    const r = gradeSubmission(input());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.correct).toBe(1);
    expect(r.graded).toEqual([
      { questionId: 'q1', selectedOptionId: 'q1-o2', isCorrect: true },
      { questionId: 'q2', selectedOptionId: 'q2-o3', isCorrect: false },
      { questionId: 'q3', selectedOptionId: null, isCorrect: false },
    ]);
    expect(r.timeSpentSec).toBe(300);
    expect(r.scored.estimatedScore).toBeNull();
  });

  it('lượt đã nộp thì từ chối', () => {
    const r = gradeSubmission(
      input({ attempt: { mode: 'PRACTICE', startedAt: START, finishedAt: at(100), totalQuestions: 3 } }),
    );
    expect(r).toEqual({ ok: false, code: 'ALREADY_SUBMITTED' });
  });

  it('questionId lạ bị bỏ, không làm tăng số câu đúng', () => {
    // Kẻ gian gửi 200 câu "đúng" của bộ khác.
    const junk = Array.from({ length: 200 }, (_, i) => ({
      questionId: `other-${i}`,
      selectedOptionId: `other-${i}-o1`,
    }));
    const r = gradeSubmission(input({ answers: [...junk, { questionId: 'q1', selectedOptionId: 'q1-o2' }] }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.correct).toBe(1);
    expect(r.graded).toHaveLength(3);
  });

  it('số câu đúng không bao giờ vượt số câu của đề', () => {
    const answers = QUESTIONS.flatMap((q) => [
      { questionId: q, selectedOptionId: CORRECT.get(q)! },
      { questionId: q, selectedOptionId: CORRECT.get(q)! },
    ]);
    const r = gradeSubmission(input({ answers }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.correct).toBe(3);
  });

  it('cùng một câu gửi nhiều lần thì lấy lần cuối', () => {
    const r = gradeSubmission(
      input({
        answers: [
          { questionId: 'q1', selectedOptionId: 'q1-o2' },
          { questionId: 'q1', selectedOptionId: 'q1-o1' },
        ],
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.graded[0]).toEqual({ questionId: 'q1', selectedOptionId: 'q1-o1', isCorrect: false });
  });

  it('đúng mốc hạn + thời gian bù thì vẫn nhận, quá 1 giây thì từ chối', () => {
    const ok = gradeSubmission(input({ now: at(600 + 120), graceSec: 120 }));
    expect(ok.ok).toBe(true);
    const late = gradeSubmission(input({ now: at(600 + 120 + 1), graceSec: 120 }));
    expect(late).toEqual({ ok: false, code: 'TIME_EXCEEDED' });
  });

  it('đề thi thử đủ 80 câu mới quy ra thang 800', () => {
    const ids = Array.from({ length: 80 }, (_, i) => `m${i}`);
    const correct = new Map(ids.map((id) => [id, `${id}-o1`]));
    const answers = ids.slice(0, 60).map((id) => ({ questionId: id, selectedOptionId: `${id}-o1` }));
    const r = gradeSubmission(
      input({
        attempt: { mode: 'MOCK', startedAt: START, finishedAt: null, totalQuestions: 80 },
        attemptQuestionIds: ids,
        correctOptionByQuestion: correct,
        answers,
        timeLimitSec: 6300,
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.scored.estimatedScore).toBe(600);
    expect(r.scored.estimatedLevel).toBe('J1_PLUS');
  });

  it('MOCK chưa đủ 80 câu thì không có điểm tham khảo', () => {
    const r = gradeSubmission(
      input({ attempt: { mode: 'MOCK', startedAt: START, finishedAt: null, totalQuestions: 3 } }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.scored.estimatedScore).toBeNull();
  });
});
