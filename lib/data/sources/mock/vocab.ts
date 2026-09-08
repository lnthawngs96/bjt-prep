import {
  MOCK_VOCAB,
  MOCK_VOCAB_BY_ID,
  MOCK_VOCAB_EXAMPLES,
  MOCK_VOCAB_RELATIONS,
  MOCK_VOCAB_TOPICS,
} from '@/mock/vocab';
import { MOCK_DUE_VOCAB_COUNT } from '@/mock/user';
import type { VocabTopicWithCount, VocabWithExamples } from '@/lib/data/types';
import type { VocabEntry } from '@/lib/prisma-types';

export async function getVocabTopics(): Promise<VocabTopicWithCount[]> {
  // TODO(db): db.vocabTopic.findMany({ include: { _count: { select: { entries: true } } }, orderBy: { order: 'asc' } })
  return [...MOCK_VOCAB_TOPICS]
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ ...t, entryCount: MOCK_VOCAB.filter((v) => v.topicId === t.id).length }));
}

export async function getVocabByTopic(topicSlug: string): Promise<VocabEntry[]> {
  // TODO(db): db.vocabEntry.findMany({ where: { topic: { slug: topicSlug }, status: 'PUBLISHED' } })
  const topic = MOCK_VOCAB_TOPICS.find((t) => t.slug === topicSlug);
  if (!topic) return [];
  return MOCK_VOCAB.filter((v) => v.topicId === topic.id);
}

export async function getVocabEntry(id: string): Promise<VocabWithExamples | null> {
  // TODO(db): db.vocabEntry.findUnique({ where: { id }, include: {
  //   examples: { orderBy: { order: 'asc' } },
  //   relationsFrom: { include: { to: true } },
  // } })
  const v = MOCK_VOCAB_BY_ID.get(id);
  if (!v) return null;
  return {
    ...v,
    examples: MOCK_VOCAB_EXAMPLES.filter((e) => e.vocabId === id).sort((a, b) => a.order - b.order),
    related: MOCK_VOCAB_RELATIONS.filter((r) => r.vocabId === id).flatMap((r) => {
      const entry = MOCK_VOCAB_BY_ID.get(r.relatedId);
      return entry ? [{ relation: r.relation, entry }] : [];
    }),
  };
}

export async function getAllVocab(): Promise<VocabEntry[]> {
  // TODO(db): db.vocabEntry.findMany({ orderBy: { headword: 'asc' } })
  return [...MOCK_VOCAB];
}

/**
 * Thẻ đến hạn ôn hôm nay.
 * TODO(db): db.srsCard.findMany({ where: { userId, dueAt: { lte: new Date() } }, orderBy: { dueAt: 'asc' } })
 * Đây là truy vấn NÓNG NHẤT của cả app — index [userId, dueAt] đã có sẵn trong schema.
 */
export async function getDueVocabCount(userId: string | null): Promise<number> {
  // Chỉ học viên mẫu có hàng đợi ôn; người thật chưa có SRS cho tới phase SRS.
  return userId === 'usr-demo' ? MOCK_DUE_VOCAB_COUNT : 0;
}

export async function getDueVocabCards(_userId: string, limit = 20): Promise<VocabWithExamples[]> {
  // TODO(db): join srsCard (cardType = VOCAB, dueAt <= now) với vocabEntry
  const due = MOCK_VOCAB.slice(0, limit);
  return due.map((v) => ({
    ...v,
    examples: MOCK_VOCAB_EXAMPLES.filter((e) => e.vocabId === v.id),
    related: MOCK_VOCAB_RELATIONS.filter((r) => r.vocabId === v.id).flatMap((r) => {
      const entry = MOCK_VOCAB_BY_ID.get(r.relatedId);
      return entry ? [{ relation: r.relation, entry }] : [];
    }),
  }));
}

/**
 * Ghi lại một lượt ôn. Dùng FSRS (ts-fsrs), KHÔNG tự viết SM-2.
 * TODO(db): tính lịch bằng ts-fsrs rồi cập nhật srsCard + chèn srsReview.
 */
export async function recordVocabReview(
  _userId: string,
  _vocabId: string,
  _rating: 1 | 2 | 3 | 4,
): Promise<void> {
  // Giai đoạn tĩnh chưa lưu gì.
}
