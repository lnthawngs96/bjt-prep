import { db } from '@/lib/db';
import type { AdminLookups, AdminOverview } from '@/lib/data/types';
import type { ContentStatus } from '@/lib/prisma-types';

/** Mọi danh sách chọn của form admin, tải một lần ở server component. */
export async function getAdminLookups(): Promise<AdminLookups> {
  const [parts, sections, groups, materials, media, tags, vocab, grammar, topics] = await Promise.all([
    db.partDef.findMany({ orderBy: { order: 'asc' } }),
    db.sectionDef.findMany({ orderBy: [{ part: 'asc' }, { order: 'asc' }] }),
    db.questionGroup
      .findMany({
        select: {
          id: true,
          titleAdmin: true,
          sectionCode: true,
          level: true,
          status: true,
          _count: { select: { questions: { where: { status: 'PUBLISHED' } } } },
        },
        orderBy: [{ sectionCode: 'asc' }, { titleAdmin: 'asc' }],
      })
      .then((rows) => rows.map(({ _count, ...g }) => ({ ...g, questionCount: _count.questions }))),
    db.material.findMany({ select: { id: true, titleAdmin: true, kind: true }, orderBy: { titleAdmin: 'asc' } }),
    db.mediaAsset.findMany({ select: { id: true, r2Key: true, mime: true }, orderBy: { r2Key: 'asc' } }),
    db.tag.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
    db.vocabEntry.findMany({ select: { id: true, headword: true, readingKana: true }, orderBy: { headword: 'asc' } }),
    db.grammarPoint.findMany({ select: { id: true, pattern: true, slug: true }, orderBy: { pattern: 'asc' } }),
    db.vocabTopic.findMany({ orderBy: { order: 'asc' } }),
  ]);
  return { parts, sections, groups, materials, media, tags, vocab, grammar, topics };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [byStatus, groups, materials, media, vocab, grammar, sets, mockTests, users, attempts, openReports] =
    await Promise.all([
      db.question.groupBy({ by: ['status'], _count: { _all: true } }),
      db.questionGroup.count(),
      db.material.count(),
      db.mediaAsset.count(),
      db.vocabEntry.count(),
      db.grammarPoint.count(),
      db.questionSet.count(),
      db.mockTest.count(),
      db.user.count(),
      db.attempt.count({ where: { finishedAt: { not: null } } }),
      db.questionReport.count({ where: { status: 'open' } }),
    ]);
  const questionsByStatus: Partial<Record<ContentStatus, number>> = {};
  for (const r of byStatus) questionsByStatus[r.status] = r._count._all;
  return {
    questionsByStatus,
    counts: { groups, materials, media, vocab, grammar, sets, mockTests, users, attempts, openReports },
  };
}
