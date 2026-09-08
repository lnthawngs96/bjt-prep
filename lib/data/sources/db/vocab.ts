import { db } from '@/lib/db';
import type { VocabTopicWithCount, VocabWithExamples } from '@/lib/data/types';
import type { VocabEntry } from '@/lib/prisma-types';

export async function getVocabTopics(): Promise<VocabTopicWithCount[]> {
  const topics = await db.vocabTopic.findMany({
    include: { _count: { select: { entries: { where: { status: 'PUBLISHED' } } } } },
    orderBy: { order: 'asc' },
  });
  return topics.map(({ _count, ...t }) => ({ ...t, entryCount: _count.entries }));
}

export async function getVocabByTopic(topicSlug: string): Promise<VocabEntry[]> {
  return db.vocabEntry.findMany({
    where: { topic: { slug: topicSlug }, status: 'PUBLISHED' },
    orderBy: [{ level: 'asc' }, { headword: 'asc' }],
  });
}

const WITH_EXAMPLES = {
  examples: { orderBy: { order: 'asc' as const } },
  relationsFrom: { include: { to: true } },
};

type Row = VocabEntry & {
  examples: VocabWithExamples['examples'];
  relationsFrom: { relation: string; to: VocabEntry }[];
};

function toWithExamples({ relationsFrom, ...v }: Row): VocabWithExamples {
  return { ...v, related: relationsFrom.map((r) => ({ relation: r.relation, entry: r.to })) };
}

export async function getVocabEntry(id: string): Promise<VocabWithExamples | null> {
  const v = await db.vocabEntry.findUnique({ where: { id }, include: WITH_EXAMPLES });
  return v ? toWithExamples(v) : null;
}

export async function getAllVocab(): Promise<VocabEntry[]> {
  return db.vocabEntry.findMany({ orderBy: { headword: 'asc' } });
}

/**
 * SRS chưa làm (ngoài phạm vi tới khi deploy). Chưa có SrsCard nào nên không
 * có từ "đến hạn"; màn ôn tạm lấy các từ đầu tiên để luồng vẫn đi được.
 * TODO(srs): db.srsCard.findMany({ where: { userId, dueAt: { lte: new Date() } }, orderBy: { dueAt: 'asc' } })
 */
export async function getDueVocabCount(_userId: string | null): Promise<number> {
  return 0;
}

export async function getDueVocabCards(_userId: string, limit = 20): Promise<VocabWithExamples[]> {
  const rows = await db.vocabEntry.findMany({
    where: { status: 'PUBLISHED' },
    include: WITH_EXAMPLES,
    orderBy: [{ level: 'asc' }, { headword: 'asc' }],
    take: limit,
  });
  return rows.map(toWithExamples);
}

/** TODO(srs): tính lịch bằng ts-fsrs rồi cập nhật srsCard + chèn srsReview. */
export async function recordVocabReview(
  _userId: string,
  _vocabId: string,
  _rating: 1 | 2 | 3 | 4,
): Promise<void> {}
