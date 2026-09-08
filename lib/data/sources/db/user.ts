import { db } from '@/lib/db';
import { POINTS_PER_QUESTION } from '@/lib/scoring';
import { getCurrentEstimate } from './attempts';
import type { StudentDashboard, WeakSkill } from '@/lib/data/types';
import type { SectionCode, User, UserProfile } from '@/lib/prisma-types';

/**
 * Thống kê học viên tính TRỰC TIẾP từ Attempt/AttemptAnswer.
 *
 * Dữ liệu còn nhỏ (một người vài trăm câu) nên đủ nhanh. Khi có vài trăm
 * người dùng thì chuyển sang bảng dẫn xuất UserSkillStat cập nhật bằng cron —
 * schema đã có sẵn, chỉ đổi ruột hai hàm getWeakSkills và sectionStats.
 * TODO(cron): đọc UserSkillStat thay vì quét AttemptAnswer.
 */

const HCM_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;
const WEEK_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
/** Dưới ngần này lượt thì chưa kết luận được là "yếu". */
const MIN_ATTEMPTS = 3;

/** Số ngày kể từ epoch theo giờ Việt Nam. */
function hcmDay(d: Date): number {
  return Math.floor((d.getTime() + HCM_OFFSET_MS) / DAY_MS);
}

/** 0 giờ thứ Hai của tuần hiện tại theo giờ Việt Nam, trả về mốc UTC. */
function startOfWeekHcm(now: Date): { start: Date; todayIndex: number } {
  const day = hcmDay(now);
  // 1970-01-01 là thứ Năm → (day + 3) % 7 cho 0 = thứ Hai.
  const todayIndex = (day + 3) % 7;
  const mondayDay = day - todayIndex;
  return { start: new Date(mondayDay * DAY_MS - HCM_OFFSET_MS), todayIndex };
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  return db.user.findUnique({ where: { id: userId } });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return db.userProfile.findUnique({ where: { userId } });
}

type Stat = { attempts: number; correct: number };

/** Độ chính xác theo section và theo tag trong 30 ngày qua. */
async function skillStats(userId: string) {
  const since = new Date(Date.now() - 30 * DAY_MS);
  const rows = await db.attemptAnswer.findMany({
    where: { attempt: { userId, finishedAt: { gte: since } } },
    select: {
      isCorrect: true,
      question: {
        select: { sectionCode: true, tags: { select: { tag: { select: { slug: true, nameVi: true } } } } },
      },
    },
  });

  const section = new Map<string, Stat>();
  const tag = new Map<string, Stat & { nameVi: string }>();
  const bump = (s: Stat, ok: boolean) => {
    s.attempts += 1;
    if (ok) s.correct += 1;
  };
  for (const r of rows) {
    const s = section.get(r.question.sectionCode) ?? { attempts: 0, correct: 0 };
    bump(s, r.isCorrect);
    section.set(r.question.sectionCode, s);
    for (const { tag: t } of r.question.tags) {
      const ts = tag.get(t.slug) ?? { attempts: 0, correct: 0, nameVi: t.nameVi };
      bump(ts, r.isCorrect);
      tag.set(t.slug, ts);
    }
  }
  return { section, tag };
}

export async function getWeakSkills(
  userId: string | null,
  dimension: 'section' | 'tag' = 'tag',
  limit = 4,
): Promise<WeakSkill[]> {
  if (!userId) return [];
  const stats = await skillStats(userId);

  if (dimension === 'tag') {
    return [...stats.tag.entries()]
      .filter(([, s]) => s.attempts >= MIN_ATTEMPTS)
      .map(([key, s]) => ({
        dimension,
        key,
        labelVi: s.nameVi,
        attempts: s.attempts,
        correct: s.correct,
        accuracy: s.correct / s.attempts,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);
  }

  const sections = await db.sectionDef.findMany();
  const label = new Map(sections.map((s) => [s.code, `${s.nameJa} — ${s.nameVi}`]));
  return [...stats.section.entries()]
    .filter(([, s]) => s.attempts >= MIN_ATTEMPTS)
    .map(([key, s]) => ({
      dimension,
      key,
      labelVi: label.get(key as SectionCode) ?? key,
      attempts: s.attempts,
      correct: s.correct,
      accuracy: s.correct / s.attempts,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

/** Bộ luyện tập gợi ý: ưu tiên section yếu nhất, trong đó chọn bộ chưa làm xong. */
async function pickContinueSet(userId: string | null, weakSection: string | null) {
  const where = weakSection ? { sectionCode: weakSection as SectionCode } : {};
  const sets = await db.questionSet.findMany({
    where: { ...where, status: 'PUBLISHED' },
    include: {
      section: { include: { partDef: true } },
      items: {
        include: {
          group: { select: { status: true, _count: { select: { questions: { where: { status: 'PUBLISHED' } } } } } },
        },
      },
      attempts: { where: { userId: userId ?? '__guest__', finishedAt: { not: null } }, select: { id: true }, take: 1 },
    },
    orderBy: [{ sectionCode: 'asc' }, { indexNo: 'asc' }],
  });
  const withCount = sets.map((s) => ({
    ...s,
    questionCount: s.items
      .filter((i) => i.group.status === 'PUBLISHED')
      .reduce((n, i) => n + i.group._count.questions, 0),
  }));
  const usable = withCount.filter((s) => s.questionCount > 0);
  return usable.find((s) => s.attempts.length === 0) ?? usable[0] ?? null;
}

function emptyWeek(todayIndex: number): StudentDashboard['weeklyActivity'] {
  return WEEK_LABELS.map((label, i) => ({ label, questions: 0, heightPct: 0, isToday: i === todayIndex }));
}

export async function getStudentDashboard(userId: string | null): Promise<StudentDashboard> {
  const now = new Date();
  const { start: weekStart, todayIndex } = startOfWeekHcm(now);

  if (!userId) {
    const set = await pickContinueSet(null, null);
    return {
      displayName: '',
      estimatedScore: null,
      estimatedLevel: null,
      daysToExam: null,
      continueHere: set ? continueFrom(set, 0, null) : null,
      todayTasks: [
        {
          id: 'task-first-mock',
          titleVi: 'Đăng nhập rồi làm một đề thi thử để có điểm tham khảo',
          subtitleVi: '模擬試験',
          meta: '80 câu',
          href: '/mock-test',
        },
      ],
      weakSkills: [],
      weeklyActivity: emptyWeek(todayIndex),
      weeklyTotal: 0,
    };
  }

  const [user, profile, estimate, weakSections, weakTags, weekRows, latest, mockCount] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    db.userProfile.findUnique({ where: { userId } }),
    getCurrentEstimate(userId),
    getWeakSkills(userId, 'section', 1),
    getWeakSkills(userId, 'tag', 4),
    db.attemptAnswer.findMany({
      where: { attempt: { userId }, answeredAt: { gte: weekStart } },
      select: { answeredAt: true },
    }),
    db.attempt.findFirst({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      include: { questionSet: { select: { titleVi: true } }, mockTest: { select: { titleVi: true } } },
    }),
    db.attempt.count({ where: { userId, mode: 'MOCK', finishedAt: { not: null } } }),
  ]);

  const weak = weakSections[0] ?? null;
  const set = await pickContinueSet(userId, weak?.key ?? null);

  // Hoạt động tuần: đếm câu theo ngày, thứ Hai → Chủ nhật.
  const counts = Array<number>(7).fill(0);
  const weekStartDay = hcmDay(weekStart);
  for (const r of weekRows) {
    const idx = hcmDay(r.answeredAt) - weekStartDay;
    if (idx >= 0 && idx < 7) counts[idx] += 1;
  }
  const maxWeek = Math.max(...counts, 1);

  const todayTasks: StudentDashboard['todayTasks'] = [];
  if (set) {
    todayTasks.push({
      id: 'task-set',
      titleVi: `${set.section.nameJa} Section ${set.section.order}, bộ ${set.indexNo}`,
      subtitleVi: set.titleVi,
      meta: `${set.questionCount} câu`,
      href: '/practice',
    });
  }
  if (latest) {
    const wrong = latest.totalQuestions - latest.rawCorrect;
    if (wrong > 0) {
      todayTasks.push({
        id: 'task-review',
        titleVi: `Xem lại ${wrong} câu đã sai`,
        subtitleVi: latest.mockTest?.titleVi ?? latest.questionSet?.titleVi ?? '',
        meta: `${wrong} câu`,
        href: `/result/${latest.id}`,
      });
    }
  }
  if (mockCount === 0) {
    todayTasks.push({
      id: 'task-first-mock',
      titleVi: 'Làm một đề thi thử để có điểm tham khảo',
      subtitleVi: '模擬試験',
      meta: '80 câu',
      href: '/mock-test',
    });
  }

  return {
    displayName: user?.name ?? '',
    estimatedScore: estimate?.score ?? null,
    estimatedLevel: estimate?.level ?? null,
    daysToExam: profile?.examDate
      ? Math.max(0, Math.round((profile.examDate.getTime() - now.getTime()) / DAY_MS))
      : null,
    continueHere: set ? continueFrom(set, weak?.accuracy ?? 0, weak ? weak.attempts : null) : null,
    todayTasks,
    weakSkills: weakTags,
    weeklyActivity: WEEK_LABELS.map((label, i) => ({
      label,
      questions: counts[i],
      heightPct: Math.round((counts[i] / maxWeek) * 100),
      isToday: i === todayIndex,
    })),
    weeklyTotal: counts.reduce((n, c) => n + c, 0),
  };
}

type PickedSet = NonNullable<Awaited<ReturnType<typeof pickContinueSet>>>;

function continueFrom(
  set: PickedSet,
  accuracy: number,
  weakAttempts: number | null,
): NonNullable<StudentDashboard['continueHere']> {
  const maxScore = set.section.questionCount * POINTS_PER_QUESTION;
  const pct = Math.round(accuracy * 100);
  return {
    sectionCode: set.sectionCode,
    partNameJa: set.section.partDef.nameJa,
    sectionNameJa: set.section.nameJa,
    sectionOrder: set.section.order,
    setId: set.id,
    setTitleVi: set.titleVi,
    indexNo: set.indexNo,
    accuracy,
    sectionScore: Math.round(accuracy * maxScore),
    sectionMaxScore: maxScore,
    questionCount: set.questionCount,
    level: set.level,
    reasonVi:
      weakAttempts != null
        ? `Đây là phần bạn sai nhiều nhất trong 30 ngày qua (${pct}% đúng trên ${weakAttempts} câu). Luyện đúng phần này là cách kéo điểm nhanh nhất lúc này.`
        : `Chưa có đủ dữ liệu để biết bạn yếu phần nào. Bắt đầu từ ${set.section.nameVi.toLowerCase()} — làm vài bộ, trang chủ sẽ chỉ ra kỹ năng bạn hay sai.`,
  };
}

/** Xếp hạng theo điểm tham khảo cao nhất của mỗi người trên đề đủ 80 câu. */
export async function getRanking(
  userId: string | null,
): Promise<{ rank: number; name: string; score: number; level: string; isMe: boolean }[]> {
  const rows = await db.attempt.findMany({
    where: { mode: 'MOCK', estimatedScore: { not: null } },
    select: { userId: true, estimatedScore: true, estimatedLevel: true, user: { select: { name: true } } },
    orderBy: { estimatedScore: 'desc' },
  });
  const best = new Map<string, (typeof rows)[number]>();
  for (const r of rows) if (!best.has(r.userId)) best.set(r.userId, r);
  return [...best.values()].slice(0, 20).map((r, i) => ({
    rank: i + 1,
    name: r.user.name,
    score: r.estimatedScore ?? 0,
    level: r.estimatedLevel ?? 'J5',
    isMe: r.userId === userId,
  }));
}
