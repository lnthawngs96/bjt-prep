import { db } from '@/lib/db';
import { AdminError } from '@/lib/admin/errors';
import type { AdminQuestionStat, AdminReportRow, AdminUserRow } from '@/lib/data/types';
import type { UserRole } from '@/lib/prisma-types';
import { logAudit } from './audit';

/* ============================================================
   NGƯỜI DÙNG
   ============================================================ */

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      _count: { select: { attempts: { where: { finishedAt: { not: null } } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(({ _count, ...u }) => ({ ...u, attemptCount: _count.attempts }));
}

/** Không tự hạ quyền chính mình — nếu không, admin cuối cùng tự khoá cửa. */
export async function setUserRole(id: string, role: UserRole, actorId: string): Promise<{ id: string }> {
  if (id === actorId && role !== 'ADMIN') {
    throw new AdminError('FORBIDDEN', 'Không thể tự bỏ quyền admin của chính mình');
  }
  return db.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { role } });
    await logAudit(tx, { actorId, entity: 'User', entityId: id, action: 'role', diff: { role } });
    return { id };
  });
}

/* ============================================================
   THỐNG KÊ CÂU HỎI — soát chất lượng nội dung, KHÔNG dùng để chấm
   ============================================================ */

/** Dưới ngần này lượt thì tỉ lệ chưa nói lên gì. */
export const STAT_MIN_ATTEMPTS = 30;

export async function getAdminQuestionStats(): Promise<AdminQuestionStat[]> {
  const [all, correct, questions] = await Promise.all([
    db.attemptAnswer.groupBy({ by: ['questionId'], _count: { _all: true } }),
    db.attemptAnswer.groupBy({ by: ['questionId'], where: { isCorrect: true }, _count: { _all: true } }),
    db.question.findMany({ select: { id: true, stemJa: true, sectionCode: true }, orderBy: [{ sectionCode: 'asc' }, { order: 'asc' }] }),
  ]);
  const attempts = new Map(all.map((r) => [r.questionId, r._count._all]));
  const corrects = new Map(correct.map((r) => [r.questionId, r._count._all]));
  return questions.map((q) => {
    const a = attempts.get(q.id) ?? 0;
    const c = corrects.get(q.id) ?? 0;
    const rate = a > 0 ? c / a : 0;
    return {
      questionId: q.id,
      stemJa: q.stemJa,
      sectionCode: q.sectionCode,
      attempts: a,
      correct: c,
      rate,
      suspicious: a >= STAT_MIN_ATTEMPTS && (rate < 0.1 || rate > 0.95),
    };
  });
}

/* ============================================================
   BÁO LỖI CÂU HỎI
   ============================================================ */

export async function getAdminReports(): Promise<AdminReportRow[]> {
  return db.questionReport.findMany({
    include: {
      question: { select: { id: true, stemJa: true, sectionCode: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function resolveReport(
  id: string,
  status: 'resolved' | 'rejected',
  actorId: string,
): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.questionReport.update({ where: { id }, data: { status, resolvedBy: actorId, resolvedAt: new Date() } });
    await logAudit(tx, { actorId, entity: 'QuestionReport', entityId: id, action: 'resolve', diff: { status } });
    return { id };
  });
}
