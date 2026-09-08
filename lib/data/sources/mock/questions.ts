import {
  MOCK_OPTIONS,
  MOCK_QUESTIONS,
  MOCK_QUESTION_BY_ID,
  MOCK_QUESTION_GRAMMAR,
  MOCK_QUESTION_TAGS,
  MOCK_QUESTION_VOCAB,
} from '@/mock/questions';
import { MOCK_GROUPS, MOCK_GROUP_BY_ID, MOCK_GROUP_MATERIALS } from '@/mock/groups';
import { MOCK_MATERIAL_BY_ID, MOCK_MEDIA_BY_ID } from '@/mock/materials';
import { MOCK_SET_ITEMS } from '@/mock/sets';
import { MOCK_TEST_ITEMS } from '@/mock/mockTests';
import { MOCK_TAG_BY_SLUG, MOCK_TAGS } from '@/mock/tags';
import { MOCK_VOCAB_BY_ID } from '@/mock/vocab';
import { MOCK_GRAMMAR_BY_ID } from '@/mock/grammar';
import type {
  GroupForExam,
  GroupWithAnswers,
  MaterialWithMedia,
  QuestionForExam,
  QuestionWithAnswer,
} from '@/lib/data/types';
import type { GrammarPoint, Question, QuestionOption, Tag, VocabEntry } from '@/lib/prisma-types';

/* ============================================================
   HÀM NỘI BỘ
   ============================================================ */

function materialsOf(groupId: string): MaterialWithMedia[] {
  return MOCK_GROUP_MATERIALS.filter((gm) => gm.groupId === groupId)
    .sort((a, b) => a.order - b.order)
    .flatMap((gm) => {
      const m = MOCK_MATERIAL_BY_ID.get(gm.materialId);
      if (!m) return [];
      return [{ ...m, media: m.mediaId ? (MOCK_MEDIA_BY_ID.get(m.mediaId) ?? null) : null }];
    });
}

function optionsOf(questionId: string): QuestionOption[] {
  return MOCK_OPTIONS.filter((o) => o.questionId === questionId).sort((a, b) => a.order - b.order);
}

/**
 * LỌC BỎ ĐÁP ÁN. Đây là ranh giới bảo mật, không phải chuyện tiện tay.
 * Dùng Pick tường minh: mai kia schema thêm cột nhạy cảm thì nó KHÔNG tự lọt.
 */
function toExam(q: Question): QuestionForExam {
  return {
    id: q.id,
    groupId: q.groupId,
    order: q.order,
    sectionCode: q.sectionCode,
    level: q.level,
    stemJa: q.stemJa,
    stemFurigana: q.stemFurigana,
    audioStartMs: q.audioStartMs,
    audioEndMs: q.audioEndMs,
    options: optionsOf(q.id).map((o) => ({ id: o.id, order: o.order, textJa: o.textJa })),
  };
}

function toFull(q: Question): QuestionWithAnswer {
  return { ...q, options: optionsOf(q.id) };
}

function questionsOfGroup(groupId: string): Question[] {
  return MOCK_QUESTIONS.filter((q) => q.groupId === groupId).sort((a, b) => a.order - b.order);
}

/* ============================================================
   TRONG LÚC LÀM BÀI — không bao giờ trả đáp án
   ============================================================ */

/** Group cho màn thi. Trả về KHÔNG có isCorrect, explanationVi, distractorNote. */
export async function getGroupsForExamBySet(setId: string): Promise<GroupForExam[]> {
  // TODO(db): const items = await db.questionSetItem.findMany({
  //   where: { setId }, orderBy: { order: 'asc' },
  //   include: { group: { include: {
  //     materials: { include: { material: { include: { media: true } } }, orderBy: { order: 'asc' } },
  //     questions: { orderBy: { order: 'asc' }, include: { options: { select: { id: true, order: true, textJa: true } } } },
  //   } } },
  // });
  // Lưu ý: `select` ở options là bắt buộc — include đầy đủ sẽ kéo cả isCorrect xuống.
  return MOCK_SET_ITEMS.filter((i) => i.setId === setId)
    .sort((a, b) => a.order - b.order)
    .flatMap((i) => {
      const g = MOCK_GROUP_BY_ID.get(i.groupId);
      if (!g) return [];
      return [{ ...g, materials: materialsOf(g.id), questions: questionsOfGroup(g.id).map(toExam) }];
    });
}

export async function getGroupsForExamByMockTest(mockTestId: string): Promise<GroupForExam[]> {
  // TODO(db): tương tự trên, đọc từ db.mockTestItem
  return MOCK_TEST_ITEMS.filter((i) => i.mockTestId === mockTestId)
    .sort((a, b) => a.order - b.order)
    .flatMap((i) => {
      const g = MOCK_GROUP_BY_ID.get(i.groupId);
      if (!g) return [];
      return [{ ...g, materials: materialsOf(g.id), questions: questionsOfGroup(g.id).map(toExam) }];
    });
}

/* ============================================================
   SAU KHI NỘP — mới trả kiểu đầy đủ
   ============================================================ */

export async function getGroupsWithAnswersBySet(setId: string): Promise<GroupWithAnswers[]> {
  // TODO(db): như getGroupsForExamBySet nhưng include: { options: true }
  return MOCK_SET_ITEMS.filter((i) => i.setId === setId)
    .sort((a, b) => a.order - b.order)
    .flatMap((i) => {
      const g = MOCK_GROUP_BY_ID.get(i.groupId);
      if (!g) return [];
      return [{ ...g, materials: materialsOf(g.id), questions: questionsOfGroup(g.id).map(toFull) }];
    });
}

export async function getQuestionWithAnswer(questionId: string): Promise<QuestionWithAnswer | null> {
  // TODO(db): return db.question.findUnique({ where: { id: questionId }, include: { options: { orderBy: { order: 'asc' } } } })
  const q = MOCK_QUESTION_BY_ID.get(questionId);
  return q ? toFull(q) : null;
}

/**
 * Dùng để CHẤM ĐIỂM — chỉ gọi từ server.
 * Trả map questionId → id phương án đúng.
 */
export async function getCorrectOptionIds(questionIds: string[]): Promise<Map<string, string>> {
  // TODO(db): db.questionOption.findMany({ where: { questionId: { in: questionIds }, isCorrect: true }, select: { questionId: true, id: true } })
  const wanted = new Set(questionIds);
  const out = new Map<string, string>();
  for (const o of MOCK_OPTIONS) {
    if (o.isCorrect && wanted.has(o.questionId)) out.set(o.questionId, o.id);
  }
  return out;
}

/* ============================================================
   LIÊN KẾT NGƯỢC — sai câu nào thì biết ôn gì
   ============================================================ */

export async function getTagsForQuestion(questionId: string): Promise<Tag[]> {
  // TODO(db): db.questionTag.findMany({ where: { questionId }, include: { tag: true } })
  return MOCK_QUESTION_TAGS.filter((qt) => qt.questionId === questionId).flatMap((qt) => {
    const tag = MOCK_TAGS.find((t) => t.id === qt.tagId);
    return tag ? [tag] : [];
  });
}

export async function getVocabToReview(questionId: string): Promise<VocabEntry[]> {
  // TODO(db): db.questionVocab.findMany({ where: { questionId }, include: { vocab: true } })
  return MOCK_QUESTION_VOCAB.filter((qv) => qv.questionId === questionId).flatMap((qv) => {
    const v = MOCK_VOCAB_BY_ID.get(qv.vocabId);
    return v ? [v] : [];
  });
}

export async function getGrammarToReview(questionId: string): Promise<GrammarPoint[]> {
  // TODO(db): db.questionGrammar.findMany({ where: { questionId }, include: { grammar: true } })
  return MOCK_QUESTION_GRAMMAR.filter((qg) => qg.questionId === questionId).flatMap((qg) => {
    const g = MOCK_GRAMMAR_BY_ID.get(qg.grammarId);
    return g ? [g] : [];
  });
}

/* ============================================================
   QUẢN TRỊ — dùng ở Phase 3
   ============================================================ */

export async function getAllGroups() {
  // TODO(db): db.questionGroup.findMany({ orderBy: { updatedAt: 'desc' } })
  return [...MOCK_GROUPS];
}

export async function getAllQuestionsForAdmin(): Promise<QuestionWithAnswer[]> {
  // TODO(db): db.question.findMany({ include: { options: true }, orderBy: { updatedAt: 'desc' } })
  return MOCK_QUESTIONS.map(toFull);
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  // TODO(db): db.tag.findUnique({ where: { slug } })
  return MOCK_TAG_BY_SLUG.get(slug) ?? null;
}
