import type { Level } from '@/lib/prisma-types';

/**
 * 配点 thật của BJT không được công bố (đề thật chấm bằng IRT), nên không cố
 * mô phỏng. Dùng cách đơn giản nhất và NÓI THẬT với học viên đây là điểm tham khảo.
 */
export const POINTS_PER_QUESTION = 10;
export const MOCK_TEST_QUESTION_COUNT = 80;
export const MAX_SCORE = MOCK_TEST_QUESTION_COUNT * POINTS_PER_QUESTION; // 800

export const SCORING_BANDS = [
  { level: 'J5' as Level, min: 0, max: 199, labelVi: 'Gần như chưa giao tiếp được trong công việc' },
  { level: 'J4' as Level, min: 200, max: 319, labelVi: 'Giao tiếp được ở mức tối thiểu' },
  { level: 'J3' as Level, min: 320, max: 419, labelVi: 'Xử lý được công việc trong phạm vi hạn chế' },
  { level: 'J2' as Level, min: 420, max: 529, labelVi: 'Giao tiếp được trong phần lớn tình huống công sở' },
  { level: 'J1' as Level, min: 530, max: 599, labelVi: 'Giao tiếp thành thạo trong công việc' },
  { level: 'J1_PLUS' as Level, min: 600, max: 800, labelVi: 'Giao tiếp đầy đủ ở mọi tình huống kinh doanh' },
] as const;

export function levelFromScore(score: number): Level {
  return (
    score >= 600 ? 'J1_PLUS' :
    score >= 530 ? 'J1' :
    score >= 420 ? 'J2' :
    score >= 320 ? 'J3' :
    score >= 200 ? 'J4' : 'J5'
  ) as Level;
}

/**
 * Chấm điểm. LUÔN chạy phía server, kể cả khi dữ liệu còn là mock —
 * thiết kế sai chỗ này từ bây giờ thì sau này phải viết lại.
 *
 * `isFullMockTest` = false thì KHÔNG quy ra thang 800: ngoại suy từ một bộ
 * 10 câu làm điểm dao động 200 đơn vị chỉ vì đoán trúng một câu.
 */
export function scoreAttempt(correct: number, total: number, isFullMockTest: boolean) {
  const accuracy = total > 0 ? correct / total : 0;
  if (!isFullMockTest) {
    return { correct, total, accuracy, estimatedScore: null, estimatedLevel: null };
  }
  const estimatedScore = correct * POINTS_PER_QUESTION;
  return { correct, total, accuracy, estimatedScore, estimatedLevel: levelFromScore(estimatedScore) };
}

export function bandOf(level: Level) {
  return SCORING_BANDS.find((b) => b.level === level) ?? SCORING_BANDS[0];
}

/** Còn bao nhiêu điểm nữa lên bậc kế tiếp. null nếu đã ở bậc cao nhất. */
export function pointsToNextBand(score: number): { nextLevel: Level; gap: number } | null {
  const next = SCORING_BANDS.find((b) => b.min > score);
  return next ? { nextLevel: next.level, gap: next.min - score } : null;
}
