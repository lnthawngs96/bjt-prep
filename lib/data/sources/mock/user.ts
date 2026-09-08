import {
  MOCK_DUE_VOCAB_COUNT,
  MOCK_ESTIMATED_LEVEL,
  MOCK_ESTIMATED_SCORE,
  MOCK_SKILL_STATS,
  MOCK_USER,
  MOCK_USER_PROFILE,
  MOCK_WEEKLY_ACTIVITY,
} from '@/mock/user';
import { TODAY } from '@/mock/_shared';
import { MOCK_TAGS } from '@/mock/tags';
import { MOCK_PARTS, MOCK_SECTIONS } from '@/mock/sections';
import type { StudentDashboard, WeakSkill } from '@/lib/data/types';
import type { User, UserProfile } from '@/lib/prisma-types';

export async function getCurrentUser(): Promise<User | null> {
  // TODO(db): đọc session Better Auth rồi db.user.findUnique({ where: { id: session.user.id } })
  return MOCK_USER;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  // TODO(db): db.userProfile.findUnique({ where: { userId } })
  return MOCK_USER_PROFILE;
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
  dimension: 'section' | 'tag' = 'tag',
  limit = 4,
): Promise<WeakSkill[]> {
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

export async function getStudentDashboard(): Promise<StudentDashboard> {
  // TODO(db): gộp từ user, userProfile, attempt gần nhất, userSkillStat và srsCard đến hạn.
  const weakSection = MOCK_SKILL_STATS.filter((s) => s.dimension === 'section').sort(
    (a, b) => a.accuracy - b.accuracy,
  )[0];
  const section = MOCK_SECTIONS.find((s) => s.code === weakSection?.key);
  const part = MOCK_PARTS.find((p) => p.code === section?.part);
  const weakSkills = await getWeakSkills('tag', 4);
  const maxWeek = Math.max(...MOCK_WEEKLY_ACTIVITY.map((d) => d.questions), 1);
  // Mảng xếp thứ Hai → Chủ nhật, còn getDay() trả 0 cho Chủ nhật.
  const todayIndex = (TODAY.getDay() + 6) % 7;

  return {
    displayName: MOCK_USER.name,
    estimatedScore: MOCK_ESTIMATED_SCORE,
    estimatedLevel: MOCK_ESTIMATED_LEVEL,
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
export async function getRanking() {
  // TODO(db): bảng dẫn xuất riêng, đừng quét toàn bộ Attempt mỗi lần vào trang.
  return [
    { rank: 1, name: 'Hoàng Nam', score: 638, level: 'J1_PLUS', isMe: false },
    { rank: 2, name: 'Thuỳ Linh', score: 592, level: 'J1', isMe: false },
    { rank: 3, name: 'Đức Anh', score: 547, level: 'J1', isMe: false },
    { rank: 4, name: 'Phương Thảo', score: 511, level: 'J2', isMe: false },
    { rank: 5, name: 'Quang Huy', score: 486, level: 'J2', isMe: false },
    { rank: 6, name: 'Minh Anh', score: 412, level: 'J3', isMe: true },
    { rank: 7, name: 'Bảo Ngọc', score: 388, level: 'J3', isMe: false },
  ];
}
