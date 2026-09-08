import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAttempt,
  getAttemptResult,
  startAttempt,
  submitAttempt,
} from '@/lib/data/sources/mock/attempts';
import { getGroupsForExamBySet, getGroupsForExamByMockTest } from '@/lib/data/sources/mock/questions';
import { attemptStore } from '@/lib/data/sources/mock/store';
import { MOCK_OPTIONS } from '@/mock/questions';

const ME = 'user-a';
const OTHER = 'user-b';

/** Đáp án đúng của mọi câu — chỉ test mới được nhìn vào đây. */
function correctAnswersFor(questionIds: string[]) {
  return questionIds.map((questionId) => ({
    questionId,
    selectedOptionId: MOCK_OPTIONS.find((o) => o.questionId === questionId && o.isCorrect)!.id,
  }));
}

describe('luồng mở và nộp bài (nguồn mock)', () => {
  beforeEach(() => attemptStore.clear());

  it('mở bài rồi nộp: chấm ở server, kết quả có đủ giải thích', async () => {
    const started = await startAttempt({ userId: ME, mode: 'PRACTICE', questionSetId: 'set-lr2-005' });
    expect('attemptId' in started).toBe(true);
    if (!('attemptId' in started)) return;

    const groups = await getGroupsForExamBySet('set-lr2-005');
    const ids = groups.flatMap((g) => g.questions.map((q) => q.id));
    // Màn thi không được thấy đáp án.
    for (const g of groups) for (const q of g.questions) for (const o of q.options) {
      expect(o).not.toHaveProperty('isCorrect');
    }

    const answers = correctAnswersFor(ids);
    answers[0].selectedOptionId = `${ids[0]}-o1`; // cố tình sai một câu — o1 không phải đáp án
    const r = await submitAttempt({ attemptId: started.attemptId, userId: ME, answers });
    expect('error' in r).toBe(false);
    if ('error' in r) return;
    expect(r.correct).toBe(ids.length - 1);
    expect(r.estimatedScore).toBeNull();

    const result = await getAttemptResult(started.attemptId, ME);
    expect(result?.items).toHaveLength(ids.length);
    expect(result?.items[0].isCorrect).toBe(false);
    expect(result?.items[0].question.explanationVi).toBeTruthy();
  });

  it('nộp lần hai bị từ chối, kể cả với đáp án đúng hết', async () => {
    const started = await startAttempt({ userId: ME, mode: 'PRACTICE', questionSetId: 'set-lr2-005' });
    if (!('attemptId' in started)) throw new Error('không mở được');
    const ids = (await getGroupsForExamBySet('set-lr2-005')).flatMap((g) => g.questions.map((q) => q.id));

    const first = await submitAttempt({ attemptId: started.attemptId, userId: ME, answers: [] });
    expect('error' in first).toBe(false);

    const second = await submitAttempt({
      attemptId: started.attemptId,
      userId: ME,
      answers: correctAnswersFor(ids),
    });
    expect(second).toEqual({ error: 'ALREADY_SUBMITTED' });

    // Điểm không đổi sau lần nộp thứ hai.
    const a = await getAttempt(started.attemptId, ME);
    expect(a?.rawCorrect).toBe(0);
  });

  it('câu của bộ khác không được chấm vào lượt này', async () => {
    const started = await startAttempt({ userId: ME, mode: 'PRACTICE', questionSetId: 'set-l2-014' });
    if (!('attemptId' in started)) throw new Error('không mở được');
    // Đáp án đúng của bộ LR2 (đã biết từ lần làm trước) nhét vào lượt L2.
    const foreign = (await getGroupsForExamBySet('set-lr2-007')).flatMap((g) => g.questions.map((q) => q.id));
    const r = await submitAttempt({ attemptId: started.attemptId, userId: ME, answers: correctAnswersFor(foreign) });
    expect('error' in r).toBe(false);
    if ('error' in r) return;
    expect(r.correct).toBe(0);
    expect(r.total).toBe(1);
  });

  it('người khác không thấy và không nộp được lượt của tôi', async () => {
    const started = await startAttempt({ userId: ME, mode: 'PRACTICE', questionSetId: 'set-lr2-005' });
    if (!('attemptId' in started)) throw new Error('không mở được');
    expect(await getAttempt(started.attemptId, OTHER)).toBeNull();
    expect(await getAttemptResult(started.attemptId, OTHER)).toBeNull();
    expect(await submitAttempt({ attemptId: started.attemptId, userId: OTHER, answers: [] })).toEqual({
      error: 'NOT_FOUND',
    });
  });

  it('nộp quá giờ bị từ chối', async () => {
    const started = await startAttempt({ userId: ME, mode: 'PRACTICE', questionSetId: 'set-l2-014' });
    if (!('attemptId' in started)) throw new Error('không mở được');
    const stored = attemptStore.get(started.attemptId)!;
    // set-l2-014 có estMinutes = 8 → 480s + 120s bù.
    const late = new Date(stored.startedAt.getTime() + (480 + 120 + 1) * 1000);
    const r = await submitAttempt({ attemptId: started.attemptId, userId: ME, answers: [], now: late });
    expect(r).toEqual({ error: 'TIME_EXCEEDED' });
  });

  it('đề thi thử MT-03 trải đủ ba phần và chưa đủ 80 câu nên không có điểm 800', async () => {
    const started = await startAttempt({ userId: ME, mode: 'MOCK', mockTestId: 'mt-03' });
    if (!('attemptId' in started)) throw new Error('không mở được');
    const groups = await getGroupsForExamByMockTest('mt-03');
    const codes = new Set(groups.map((g) => g.sectionCode));
    for (const c of ['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3', 'R1', 'R2', 'R3']) expect(codes.has(c as never)).toBe(true);

    const ids = groups.flatMap((g) => g.questions.map((q) => q.id));
    const r = await submitAttempt({ attemptId: started.attemptId, userId: ME, answers: correctAnswersFor(ids) });
    if ('error' in r) throw new Error(r.error);
    expect(r.correct).toBe(ids.length);
    expect(r.estimatedScore).toBeNull();
  });

  it('đề rỗng không mở được', async () => {
    expect(await startAttempt({ userId: ME, mode: 'MOCK', mockTestId: 'mt-01' })).toEqual({ error: 'EMPTY' });
  });
});
