import type { Attempt, AttemptAnswer, User, UserProfile, UserSkillStat } from '@/lib/prisma-types';
import { AttemptMode, Level, UserRole } from '@/lib/prisma-types';
import { T0, T1, TODAY } from './_shared';

/**
 * Học viên mẫu. Số liệu ở đây khớp với docs/prototype.html để đối chiếu thị giác:
 * 412 điểm · bậc J3 · 47 ngày đến kỳ thi · tỉ lệ đúng 聴読解 52%.
 */

export const MOCK_USER: User = {
  id: 'usr-demo',
  name: 'Minh Anh',
  email: 'minhanh@example.com',
  emailVerified: true,
  image: null,
  role: UserRole.USER,
  banned: false,
  banReason: null,
  banExpires: null,
  locale: 'vi',
  createdAt: T0,
  updatedAt: T1,
};

export const MOCK_USER_PROFILE: UserProfile = {
  userId: 'usr-demo',
  targetLevel: Level.J2,
  // 47 ngày kể từ TODAY (07/09/2026) → 24/10/2026
  examDate: new Date('2026-10-24T09:00:00+07:00'),
  dailyGoalMinutes: 30,
  timezone: 'Asia/Ho_Chi_Minh',
  updatedAt: T1,
};

/** Điểm ước tính hiện tại — lấy từ lần làm đề thi thử gần nhất. */
export const MOCK_ESTIMATED_SCORE = 412;
export const MOCK_ESTIMATED_LEVEL: Level = Level.J3;

/**
 * Bảng dẫn xuất. Ở DB thật cập nhật bằng cron mỗi giờ — ĐỪNG tính trực tiếp
 * từ AttemptAnswer mỗi lần vào trang chủ, nó sẽ chậm dần và không ai nhận ra
 * cho tới khi có 500 người dùng.
 */
export const MOCK_SKILL_STATS: UserSkillStat[] = [
  // dimension = tag
  { userId: 'usr-demo', dimension: 'tag', key: 'keigo-phone', attempts: 34, correct: 13, accuracy: 0.38, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'table-numbers', attempts: 41, correct: 18, accuracy: 0.44, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'apology-customer', attempts: 27, correct: 14, accuracy: 0.51, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'indirect-order', attempts: 30, correct: 17, accuracy: 0.57, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'keigo-facetoface', attempts: 22, correct: 14, accuracy: 0.64, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'doc-email-client', attempts: 25, correct: 18, accuracy: 0.72, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'tag', key: 'sc-meeting', attempts: 38, correct: 29, accuracy: 0.76, updatedAt: T1 },

  // dimension = section
  { userId: 'usr-demo', dimension: 'section', key: 'LR2', attempts: 50, correct: 26, accuracy: 0.52, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'section', key: 'L2', attempts: 40, correct: 23, accuracy: 0.58, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'section', key: 'L3', attempts: 35, correct: 21, accuracy: 0.6, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'section', key: 'R3', attempts: 30, correct: 20, accuracy: 0.67, updatedAt: T1 },
  { userId: 'usr-demo', dimension: 'section', key: 'R1', attempts: 45, correct: 34, accuracy: 0.76, updatedAt: T1 },
];

/** Hoạt động 7 ngày, thứ Hai → Chủ nhật. TODAY (07/09/2026) là Chủ nhật. */
export const MOCK_WEEKLY_ACTIVITY = [
  { label: 'T2', questions: 18 },
  { label: 'T3', questions: 29 },
  { label: 'T4', questions: 11 },
  { label: 'T5', questions: 36 },
  { label: 'T6', questions: 25 },
  { label: 'T7', questions: 45 },
  { label: 'CN', questions: 3 },
];

/** Số từ đến hạn ôn hôm nay. */
export const MOCK_DUE_VOCAB_COUNT = 24;

/* ============================================================
   LỊCH SỬ LÀM BÀI
   ============================================================ */

export const MOCK_ATTEMPTS: Attempt[] = [
  {
    id: 'att-mt-02',
    userId: 'usr-demo',
    mode: AttemptMode.MOCK,
    questionSetId: null,
    mockTestId: 'mt-02',
    startedAt: new Date('2026-08-28T09:00:00+07:00'),
    finishedAt: new Date('2026-08-28T10:48:00+07:00'),
    timeSpentSec: 6480,
    rawCorrect: 52,
    totalQuestions: 80,
    // Chỉ điền estimatedScore khi mode = MOCK và đề đủ 80 câu.
    estimatedScore: 520,
    estimatedLevel: Level.J2,
    perSection: {
      L1: { correct: 3, total: 5 }, L2: { correct: 6, total: 10 }, L3: { correct: 6, total: 10 },
      LR1: { correct: 3, total: 5 }, LR2: { correct: 5, total: 10 }, LR3: { correct: 6, total: 10 },
      R1: { correct: 8, total: 10 }, R2: { correct: 8, total: 10 }, R3: { correct: 7, total: 10 },
    },
  },
  {
    id: 'att-mt-01',
    userId: 'usr-demo',
    mode: AttemptMode.MOCK,
    questionSetId: null,
    mockTestId: 'mt-01',
    startedAt: new Date('2026-08-14T09:00:00+07:00'),
    finishedAt: new Date('2026-08-14T10:52:00+07:00'),
    timeSpentSec: 6720,
    rawCorrect: 47,
    totalQuestions: 80,
    estimatedScore: 470,
    estimatedLevel: Level.J2,
    perSection: {
      L1: { correct: 3, total: 5 }, L2: { correct: 5, total: 10 }, L3: { correct: 5, total: 10 },
      LR1: { correct: 2, total: 5 }, LR2: { correct: 4, total: 10 }, LR3: { correct: 5, total: 10 },
      R1: { correct: 8, total: 10 }, R2: { correct: 8, total: 10 }, R3: { correct: 7, total: 10 },
    },
  },
  {
    id: 'att-set-lr2-005',
    userId: 'usr-demo',
    mode: AttemptMode.PRACTICE,
    questionSetId: 'set-lr2-005',
    mockTestId: null,
    startedAt: new Date('2026-09-05T20:10:00+07:00'),
    finishedAt: new Date('2026-09-05T20:21:00+07:00'),
    timeSpentSec: 660,
    rawCorrect: 8,
    totalQuestions: 10,
    // PRACTICE để null — ngoại suy thang 800 từ 10 câu làm điểm nhảy 200 đơn vị
    // chỉ vì đoán trúng một câu, học viên sẽ mất niềm tin vào con số.
    estimatedScore: null,
    estimatedLevel: null,
    perSection: null,
  },
  {
    id: 'att-set-lr2-006',
    userId: 'usr-demo',
    mode: AttemptMode.PRACTICE,
    questionSetId: 'set-lr2-006',
    mockTestId: null,
    startedAt: new Date('2026-09-06T21:00:00+07:00'),
    finishedAt: new Date('2026-09-06T21:13:00+07:00'),
    timeSpentSec: 780,
    rawCorrect: 5,
    totalQuestions: 10,
    estimatedScore: null,
    estimatedLevel: null,
    perSection: null,
  },
];

export const MOCK_ATTEMPT_BY_ID = new Map(MOCK_ATTEMPTS.map((a) => [a.id, a]));

/** Đáp án đã chọn của lượt luyện tập gần nhất — dùng dựng màn kết quả mẫu. */
export const MOCK_ATTEMPT_ANSWERS: AttemptAnswer[] = [
  { id: 'ans-1', attemptId: 'att-set-lr2-005', questionId: 'q-lr2-007-1', selectedOptionId: 'q-lr2-007-1-o1', isCorrect: false, timeSpentMs: 24_000, flagged: false, answeredAt: TODAY },
  { id: 'ans-2', attemptId: 'att-set-lr2-005', questionId: 'q-lr2-007-2', selectedOptionId: 'q-lr2-007-2-o2', isCorrect: true, timeSpentMs: 19_500, flagged: false, answeredAt: TODAY },
  { id: 'ans-3', attemptId: 'att-set-lr2-005', questionId: 'q-lr2-007-3', selectedOptionId: 'q-lr2-007-3-o4', isCorrect: false, timeSpentMs: 31_200, flagged: true, answeredAt: TODAY },
];
