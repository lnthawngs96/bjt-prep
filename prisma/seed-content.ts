/**
 * Nạp NỘI DUNG mẫu (nhóm câu, câu hỏi, tài liệu, từ vựng, ngữ pháp, bộ, đề)
 * từ mock/ vào database. Chạy SAU `npm run db:seed` (bảng cấu trúc).
 *
 *   npm run db:seed:content
 *
 * Idempotent: upsert theo id của mock, chạy lại bao nhiêu lần cũng được.
 * Tag và chủ đề từ vựng đã được seed.ts tạo với id cuid → tra theo slug rồi
 * ánh xạ lại id trước khi ghi liên kết.
 *
 * Chạy bằng tsx ngoài Next; tsx đọc alias @/ từ tsconfig nên import mock/ được.
 */
import 'dotenv/config';
import { PrismaClient, Prisma } from '../app/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { MOCK_MEDIA, MOCK_MATERIALS } from '@/mock/materials';
import { MOCK_GROUPS, MOCK_GROUP_MATERIALS } from '@/mock/groups';
import {
  MOCK_OPTIONS,
  MOCK_QUESTIONS,
  MOCK_QUESTION_GRAMMAR,
  MOCK_QUESTION_TAGS,
  MOCK_QUESTION_VOCAB,
} from '@/mock/questions';
import { MOCK_TAGS } from '@/mock/tags';
import { MOCK_VOCAB, MOCK_VOCAB_EXAMPLES, MOCK_VOCAB_RELATIONS, MOCK_VOCAB_TOPICS } from '@/mock/vocab';
import { MOCK_GRAMMAR, MOCK_GRAMMAR_EXAMPLES } from '@/mock/grammar';
import { MOCK_SETS, MOCK_SET_ITEMS } from '@/mock/sets';
import { MOCK_TESTS, MOCK_TEST_ITEMS } from '@/mock/mockTests';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Thiếu DATABASE_URL — xem docs/setup.md');
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

/** Prisma không nhận `null` cho cột Json — phải là DbNull. */
const json = (v: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull =>
  v === null || v === undefined ? Prisma.DbNull : (v as Prisma.InputJsonValue);

/** Bỏ createdAt/updatedAt để DB tự đặt. */
function stamps<T extends { createdAt?: Date; updatedAt?: Date }>(row: T) {
  const { createdAt: _c, updatedAt: _u, ...rest } = row;
  return rest;
}

async function main() {
  const sectionCount = await db.sectionDef.count();
  if (sectionCount !== 9) {
    throw new Error(`SectionDef có ${sectionCount} dòng, cần 9 — chạy \`npm run db:seed\` trước.`);
  }

  // ---- Media và tài liệu ----
  for (const m of MOCK_MEDIA) {
    const data = { ...stamps(m), waveform: json(m.waveform) };
    await db.mediaAsset.upsert({ where: { id: m.id }, create: data, update: data });
  }
  for (const m of MOCK_MATERIALS) {
    const data = { ...stamps(m), transcript: json(m.transcript), body: json(m.body) };
    await db.material.upsert({ where: { id: m.id }, create: data, update: data });
  }

  // ---- Nhóm câu và câu hỏi ----
  for (const g of MOCK_GROUPS) {
    const data = stamps(g);
    await db.questionGroup.upsert({ where: { id: g.id }, create: data, update: data });
  }
  for (const gm of MOCK_GROUP_MATERIALS) {
    await db.groupMaterial.upsert({
      where: { groupId_materialId: { groupId: gm.groupId, materialId: gm.materialId } },
      create: gm,
      update: { order: gm.order },
    });
  }
  for (const q of MOCK_QUESTIONS) {
    const data = { ...stamps(q), stemFurigana: json(q.stemFurigana) };
    await db.question.upsert({ where: { id: q.id }, create: data, update: data });
  }
  for (const o of MOCK_OPTIONS) {
    await db.questionOption.upsert({ where: { id: o.id }, create: o, update: o });
  }

  // ---- Nhãn kỹ năng: tra id thật theo slug ----
  for (const [i, t] of MOCK_TAGS.entries()) {
    await db.tag.upsert({
      where: { slug: t.slug },
      create: { id: t.id, slug: t.slug, nameVi: t.nameVi, nameJa: t.nameJa, category: t.category, order: i },
      update: { nameVi: t.nameVi, nameJa: t.nameJa, category: t.category, order: i },
    });
  }
  const tagIdBySlug = new Map((await db.tag.findMany()).map((t) => [t.slug, t.id]));
  const mockTagSlug = new Map(MOCK_TAGS.map((t) => [t.id, t.slug]));
  for (const qt of MOCK_QUESTION_TAGS) {
    const tagId = tagIdBySlug.get(mockTagSlug.get(qt.tagId) ?? '');
    if (!tagId) throw new Error(`Không tìm thấy tag ${qt.tagId}`);
    await db.questionTag.upsert({
      where: { questionId_tagId: { questionId: qt.questionId, tagId } },
      create: { questionId: qt.questionId, tagId },
      update: {},
    });
  }

  // ---- Từ vựng: chủ đề tra theo slug ----
  for (const t of MOCK_VOCAB_TOPICS) {
    await db.vocabTopic.upsert({
      where: { slug: t.slug },
      create: { id: t.id, slug: t.slug, nameVi: t.nameVi, nameJa: t.nameJa, order: t.order },
      update: { nameVi: t.nameVi, nameJa: t.nameJa, order: t.order },
    });
  }
  const topicIdBySlug = new Map((await db.vocabTopic.findMany()).map((t) => [t.slug, t.id]));
  const mockTopicSlug = new Map(MOCK_VOCAB_TOPICS.map((t) => [t.id, t.slug]));
  for (const v of MOCK_VOCAB) {
    const topicId = v.topicId ? (topicIdBySlug.get(mockTopicSlug.get(v.topicId) ?? '') ?? null) : null;
    const data = { ...stamps(v), topicId };
    await db.vocabEntry.upsert({ where: { id: v.id }, create: data, update: data });
  }
  for (const e of MOCK_VOCAB_EXAMPLES) {
    await db.vocabExample.upsert({ where: { id: e.id }, create: e, update: e });
  }
  for (const r of MOCK_VOCAB_RELATIONS) {
    await db.vocabRelation.upsert({
      where: { vocabId_relatedId_relation: r },
      create: r,
      update: {},
    });
  }
  for (const qv of MOCK_QUESTION_VOCAB) {
    await db.questionVocab.upsert({
      where: { questionId_vocabId: { questionId: qv.questionId, vocabId: qv.vocabId } },
      create: qv,
      update: { relevance: qv.relevance },
    });
  }

  // ---- Ngữ pháp ----
  for (const g of MOCK_GRAMMAR) {
    const data = stamps(g);
    await db.grammarPoint.upsert({ where: { id: g.id }, create: data, update: data });
  }
  for (const e of MOCK_GRAMMAR_EXAMPLES) {
    await db.grammarExample.upsert({ where: { id: e.id }, create: e, update: e });
  }
  for (const qg of MOCK_QUESTION_GRAMMAR) {
    await db.questionGrammar.upsert({
      where: { questionId_grammarId: { questionId: qg.questionId, grammarId: qg.grammarId } },
      create: qg,
      update: { relevance: qg.relevance },
    });
  }

  // ---- Bộ luyện tập và đề thi thử ----
  for (const s of MOCK_SETS) {
    const data = stamps(s);
    await db.questionSet.upsert({ where: { id: s.id }, create: data, update: data });
  }
  for (const i of MOCK_SET_ITEMS) {
    await db.questionSetItem.upsert({
      where: { setId_groupId: { setId: i.setId, groupId: i.groupId } },
      create: i,
      update: { order: i.order },
    });
  }
  for (const t of MOCK_TESTS) {
    const data = stamps(t);
    await db.mockTest.upsert({ where: { id: t.id }, create: data, update: data });
  }
  for (const i of MOCK_TEST_ITEMS) {
    await db.mockTestItem.upsert({
      where: { mockTestId_groupId: { mockTestId: i.mockTestId, groupId: i.groupId } },
      create: i,
      update: { order: i.order, sectionCode: i.sectionCode },
    });
  }

  console.log(
    `Nạp nội dung xong: ${MOCK_GROUPS.length} nhóm · ${MOCK_QUESTIONS.length} câu · ` +
      `${MOCK_MATERIALS.length} tài liệu · ${MOCK_VOCAB.length} từ · ${MOCK_GRAMMAR.length} mẫu ngữ pháp · ` +
      `${MOCK_SETS.length} bộ · ${MOCK_TESTS.length} đề`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
