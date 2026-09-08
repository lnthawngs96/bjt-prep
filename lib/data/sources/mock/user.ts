import {
  MOCK_DUE_VOCAB_COUNT,
  MOCK_SKILL_STATS,
  MOCK_USER,
  MOCK_USER_PROFILE,
  MOCK_WEEKLY_ACTIVITY,
} from '@/mock/user';
import { TODAY } from '@/mock/_shared';
import { MOCK_TAGS } from '@/mock/tags';
import { MOCK_PARTS, MOCK_SECTIONS } from '@/mock/sections';
import { getCurrentEstimate } from './attempts';
import type { StudentDashboard, WeakSkill } from '@/lib/data/types';
import type { User, UserProfile } from '@/lib/prisma-types';

/**
 * Nguồn mock chỉ có MỘT học viên mẫu (usr-demo). Người đăng nhập thật ở giai
 * đoạn này được coi là "học viên mới": chưa có thống kê, chưa có điểm.
 * Nguồn DB (Phase 4) tính mọi thứ từ Attempt/AttemptAnswer của đúng userId.
 */
const isDemo = (userId: string | null) => userId === MOCK_USER.id;

export async function getCurrentUser(userId: string): Promise<User | null> {
  // TODO(db): db.user.findUnique({ where: { id: userId } })
  return isDemo(userId) ? MOCK_USER : null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // TODO(db): db.userProfile.findUnique({ where: { userId } })
  return isDemo(userId) ? MOCK_USER_PROFILE : null;
}

/** Nhãn tiếng Việt cho một key thống kê — tag dùng nameVi, section dùng nameJa. */
function labelFor(dimension: 'section' | 'tag', key: string): string {
  if (dimension === 'tag') return MOCK_TAGS.find((t) => t.slug === key)?.nameVi ?? key;
  const s = MOCK_SECTIONS.find((x) => x.code === key);
  return s ? `${s.nameJa} — ${s.nameVi}` : key;
}

/**
 * Bảng dẫn xuất UserSkillStat, KHÔNG tính lại từ AttemptAnswer mỗi lần vào trang chủ.
 * TODO(db): db.userSkillStat.findMany({ where: { userId, dimension }, orderBy: { accuracy: 'asc' }, take: limit })
 * Index [userId, accuracy] đã có sẵn trong schema cho đúng truy vấn này.
 */
export async function getWeakSkills(
  userId: string | null,
  dimension: 'section' | 'tag' = 'tag',
  limit = 4,
): Promise<WeakSkill[]> {
  if (!isDemo(userId)) return [];
  return MOCK_SKILL_STATS.filter((s) => s.dimension === dimension)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map((s) => ({
      dimension,
      key: s.key,
      labelVi: labelFor(dimension, s.key),
      attempts: s.attempts,
      correct: s.correct,
      accuracy: s.accuracy,
    }));
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = date.getTime() - TODAY.getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

const WEEK_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export async function getStudentDashboard(userId: string | null): Promise<StudentDashboard> {
  // TODO(db): gộp từ user, userProfile, attempt gần nhất, userSkillStat và srsCard đến hạn.
  // Mảng xếp thứ Hai → Chủ nhật, còn getDay() trả 0 cho Chủ nhật.
  const todayIndex = (TODAY.getDay() + 6) % 7;

  if (!isDemo(userId)) {
    // Học viên mới hoặc khách: chưa có số liệu nào, gợi ý bộ đầu tiên để bắt đầu.
    return {
      displayName: '',
      estimatedScore: null,
      estimatedLevel: null,
      daysToExam: null,
      continueHere: {
        sectionCode: 'LR2',
        partNameJa: '聴読解',
        sectionNameJa: '資料聴読解問題',
        sectionOrder: 2,
        setId: 'set-lr2-005',
        setTitleVi: 'Báo cáo doanh số quý',
        indexNo: 5,
        accuracy: 0,
        sectionScore: 0,
        sectionMaxScore: 200,
        questionCount: 3,
        level: 'J3',
        reasonVi:
          'Bắt đầu bằng phần 聴読解: đây là phần người Việt mất điểm nhiều nhất và cũng là phần dễ cải thiện nhất khi luyện đúng cách.',
      },
      todayTasks: [
        {
          id: 'task-first-set',
          titleVi: 'Làm bộ luyện tập đầu tiên',
          subtitleVi: '聴読解 Section 2, bộ 5',
          meta: '3 câu',
          href: '/practice',
        },
        {
          id: 'task-first-mock',
          titleVi: 'Làm một đề thi thử để có điểm tham khảo',
          subtitleVi: '模擬試験',
          meta: '80 câu',
          href: '/mock-test',
        },
      ],
      weakSkills: [],
      weeklyActivity: WEEK_LABELS.map((label, i) => ({
        label,
        questions: 0,
        heightPct: 0,
        isToday: i === todayIndex,
      })),
      weeklyTotal: 0,
    };
  }

  const weakSection = MOCK_SKILL_STATS.filter((s) => s.dimension === 'section').sort(
    (a, b) => a.accuracy - b.accuracy,
  )[0];
  const section = MOCK_SECTIONS.find((s) => s.code === weakSection?.key);
  const part = MOCK_PARTS.find((p) => p.code === section?.part);
  const weakSkills = await getWeakSkills(userId, 'tag', 4);
  const estimate = await getCurrentEstimate(MOCK_USER.id);
  const maxWeek = Math.max(...MOCK_WEEKLY_ACTIVITY.map((d) => d.questions), 1);

  return {
    displayName: MOCK_USER.name,
    estimatedScore: estimate?.score ?? null,
    estimatedLevel: estimate?.level ?? null,
    daysToExam: daysUntil(MOCK_USER_PROFILE.examDate),
    continueHere: section
      ? {
          sectionCode: section.code,
          partNameJa: part?.nameJa ?? section.nameJa,
          sectionNameJa: section.nameJa,
          sectionOrder: section.order,
          setId: 'set-lr2-007',
          setTitleVi: 'Doanh số theo khu vực',
          indexNo: 7,
          accuracy: weakSection.accuracy,
          sectionScore: Math.round(weakSection.accuracy * 200),
          sectionMaxScore: 200,
          questionCount: 10,
          level: 'J2',
          reasonVi:
            'Đây là phần bạn yếu nhất và cũng là phần dễ kéo điểm nhất lúc này. Bốn bộ gần nhất bạn sai chủ yếu ở câu hỏi về chỉ thị gián tiếp của cấp trên.',
        }
      : null,
    todayTasks: [
      {
        id: 'task-srs',
        titleVi: `Ôn ${MOCK_DUE_VOCAB_COUNT} từ đến hạn`,
        subtitleVi: '会議・報告',
        meta: '8 phút',
        href: '/vocabulary/review',
      },
      {
        id: 'task-set',
        titleVi: '聴読解 Section 2, bộ 7',
        subtitleVi: 'Nghe kèm bảng số liệu',
        meta: '10 câu',
        href: '/practice',
      },
      {
        id: 'task-review',
        titleVi: 'Xem lại 6 câu đã sai',
        subtitleVi: 'Đề thi thử số 2',
        meta: '6 câu',
        href: '/result/att-mt-02',
      },
    ],
    weakSkills,
    weeklyActivity: MOCK_WEEKLY_ACTIVITY.map((d, i) => ({
      label: d.label,
      questions: d.questions,
      // Chuẩn hoá theo ngày cao nhất trong tuần để vẽ cột.
      heightPct: Math.round((d.questions / maxWeek) * 100),
      isToday: i === todayIndex,
    })),
    weeklyTotal: MOCK_WEEKLY_ACTIVITY.reduce((n, d) => n + d.questions, 0),
  };
}

/** Xếp hạng — giai đoạn tĩnh dùng dữ liệu bịa. */
export async function getRanking(userId: string | null) {
  // TODO(db): bảng dẫn xuất riêng, đừng quét toàn bộ Attempt mỗi lần vào trang.
  const me = isDemo(userId);
  return [
    { rank: 1, name: 'Hoàng Nam', score: 638, level: 'J1_PLUS', isMe: false },
    { rank: 2, name: 'Thuỳ Linh', score: 592, level: 'J1', isMe: false },
    { rank: 3, name: 'Đức Anh', score: 547, level: 'J1', isMe: false },
    { rank: 4, name: 'Phương Thảo', score: 511, level: 'J2', isMe: false },
    { rank: 5, name: 'Quang Huy', score: 486, level: 'J2', isMe: false },
    { rank: 6, name: 'Minh Anh', score: 412, level: 'J3', isMe: me },
    { rank: 7, name: 'Bảo Ngọc', score: 388, level: 'J3', isMe: false },
  ];
}
