import { describe, expect, it } from 'vitest';
import { levelFromScore, pointsToNextBand, scoreAttempt } from '@/lib/scoring';

describe('levelFromScore — biên các bậc', () => {
  it.each([
    [0, 'J5'],
    [199, 'J5'],
    [200, 'J4'],
    [319, 'J4'],
    [320, 'J3'],
    [419, 'J3'],
    [420, 'J2'],
    [529, 'J2'],
    [530, 'J1'],
    [599, 'J1'],
    [600, 'J1_PLUS'],
    [800, 'J1_PLUS'],
  ])('%i điểm → %s', (score, level) => {
    expect(levelFromScore(score)).toBe(level);
  });
});

describe('scoreAttempt', () => {
  it('bộ luyện tập KHÔNG quy ra thang 800', () => {
    const r = scoreAttempt(8, 10, false);
    expect(r.estimatedScore).toBeNull();
    expect(r.estimatedLevel).toBeNull();
    expect(r.accuracy).toBeCloseTo(0.8);
  });

  it('đề thi thử đủ 80 câu: 10 điểm mỗi câu', () => {
    const r = scoreAttempt(52, 80, true);
    expect(r.estimatedScore).toBe(520);
    expect(r.estimatedLevel).toBe('J2');
  });

  it('không chia cho 0', () => {
    expect(scoreAttempt(0, 0, false).accuracy).toBe(0);
  });
});

describe('pointsToNextBand', () => {
  it('còn bao nhiêu điểm lên bậc kế', () => {
    expect(pointsToNextBand(412)).toEqual({ nextLevel: 'J2', gap: 8 });
  });
  it('bậc cao nhất trả null', () => {
    expect(pointsToNextBand(700)).toBeNull();
  });
});
