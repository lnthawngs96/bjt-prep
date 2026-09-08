import { db } from '@/lib/db';
import type {
  GroupForExam,
  GroupWithAnswers,
  MaterialWithMedia,
  QuestionForExam,
  QuestionWithAnswer,
} from '@/lib/data/types';
import type { GrammarPoint, Question, QuestionOption, Tag, VocabEntry } from '@/lib/prisma-types';

/* ============================================================
   MẢNH TRUY VẤN DÙNG CHUNG
   ============================================================ */

/** Tài liệu của group, kèm media, đúng thứ tự. */
const MATERIALS = {
  materials: {
    include: { material: { include: { media: true } } },
    orderBy: { order: 'asc' as const },
  },
};

/**
 * Câu hỏi cho MÀN THI: `select` ở options là BẮT BUỘC — include đầy đủ sẽ kéo
 * isCorrect và distractorNote xuống client.
 */
const QUESTIONS_FOR_EXAM = {
  questions: {
    where: { status: 'PUBLISHED' as const },
    orderBy: { order: 'asc' as const },
    include: {
      options: { select: { id: true, order: true, textJa: true }, orderBy: { order: 'asc' as const } },
    },
  },
};

/** Câu hỏi cho MÀN XEM LẠI: đầy đủ đáp án và giải thích. */
const QUESTIONS_WITH_ANSWERS = {
  questions: {
    where: { status: 'PUBLISHED' as const },
    orderBy: { order: 'asc' as const },
    include: { options: { orderBy: { order: 'asc' as const } } },
  },
};

type GroupMaterialRow = { order: number; material: MaterialWithMedia };

function flattenMaterials(rows: GroupMaterialRow[]): MaterialWithMedia[] {
  return rows.map((r) => r.material);
}

/**
 * LỌC BỎ ĐÁP ÁN — ranh giới bảo mật, không phải chuyện tiện tay.
 * Dùng Pick tường minh: mai kia schema thêm cột nhạy cảm thì nó KHÔNG tự lọt.
 */
function toExam(
  q: Question & { options: Pick<QuestionOption, 'id' | 'order' | 'textJa'>[] },
): QuestionForExam {
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
    options: q.options.map((o) => ({ id: o.id, order: o.order, textJa: o.textJa })),
  };
}

/** Id các group của một bộ hoặc một đề, đúng thứ tự. Group chưa PUBLISHED bị bỏ. */
async function orderedGroupIds(ref: { setId?: string; mockTestId?: string }): Promise<string[]> {
  if (ref.mockTestId) {
    const items = await db.mockTestItem.findMany({
      where: { mockTestId: ref.mockTestId, group: { status: 'PUBLISHED' } },
      orderBy: { order: 'asc' },
      select: { groupId: true },
    });
    return items.map((i) => i.groupId);
  }
  const items = await db.questionSetItem.findMany({
    where: { setId: ref.setId ?? '', group: { status: 'PUBLISHED' } },
    orderBy: { order: 'asc' },
    select: { groupId: true },
  });
  return items.map((i) => i.groupId);
}

/** Giữ thứ tự group như trong bộ/đề — `in` của Postgres không đảm bảo thứ tự. */
function sortByIds<T extends { id: string }>(rows: T[], ids: string[]): T[] {
  const pos = new Map(ids.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
}

async function groupsForExam(ids: string[]): Promise<GroupForExam[]> {
  const rows = await db.questionGroup.findMany({
    where: { id: { in: ids } },
    include: { ...MATERIALS, ...QUESTIONS_FOR_EXAM },
  });
  return sortByIds(rows, ids).map(({ materials, questions, ...g }) => ({
    ...g,
    materials: flattenMaterials(materials),
    questions: questions.map(toExam),
  }));
}

async function groupsWithAnswers(ids: string[]): Promise<GroupWithAnswers[]> {
  const rows = await db.questionGroup.findMany({
    where: { id: { in: ids } },
    include: { ...MATERIALS, ...QUESTIONS_WITH_ANSWERS },
  });
  return sortByIds(rows, ids).map(({ materials, ...g }) => ({
    ...g,
    materials: flattenMaterials(materials),
  }));
}

/* ============================================================
   TRONG LÚC LÀM BÀI — không bao giờ trả đáp án
   ============================================================ */

export async function getGroupsForExamBySet(setId: string): Promise<GroupForExam[]> {
  return groupsForExam(await orderedGroupIds({ setId }));
}

export async function getGroupsForExamByMockTest(mockTestId: string): Promise<GroupForExam[]> {
  return groupsForExam(await orderedGroupIds({ mockTestId }));
}

/* ============================================================
   SAU KHI NỘP — mới trả kiểu đầy đủ
   ============================================================ */

export async function getGroupsWithAnswersBySet(setId: string): Promise<GroupWithAnswers[]> {
  return groupsWithAnswers(await orderedGroupIds({ setId }));
}

export async function getGroupsWithAnswersByMockTest(mockTestId: string): Promise<GroupWithAnswers[]> {
  return groupsWithAnswers(await orderedGroupIds({ mockTestId }));
}

export async function getQuestionWithAnswer(questionId: string): Promise<QuestionWithAnswer | null> {
  return db.question.findUnique({
    where: { id: questionId },
    include: { options: { orderBy: { order: 'asc' } } },
  });
}

/**
 * Dùng để CHẤM ĐIỂM — chỉ gọi từ server.
 * Trả map questionId → id phương án đúng.
 */
export async function getCorrectOptionIds(questionIds: string[]): Promise<Map<string, string>> {
  const rows = await db.questionOption.findMany({
    where: { questionId: { in: questionIds }, isCorrect: true },
    select: { questionId: true, id: true },
  });
  return new Map(rows.map((r) => [r.questionId, r.id]));
}

/* ============================================================
   LIÊN KẾT NGƯỢC — sai câu nào thì biết ôn gì
   ============================================================ */

export async function getTagsForQuestion(questionId: string): Promise<Tag[]> {
  const rows = await db.questionTag.findMany({ where: { questionId }, include: { tag: true } });
  return rows.map((r) => r.tag).sort((a, b) => a.order - b.order);
}

export async function getVocabToReview(questionId: string): Promise<VocabEntry[]> {
  const rows = await db.questionVocab.findMany({ where: { questionId }, include: { vocab: true } });
  // "tested" lên trước "appears".
  return rows.sort((a, b) => a.relevance.localeCompare(b.relevance)).map((r) => r.vocab);
}

export async function getGrammarToReview(questionId: string): Promise<GrammarPoint[]> {
  const rows = await db.questionGrammar.findMany({ where: { questionId }, include: { grammar: true } });
  return rows.sort((a, b) => a.relevance.localeCompare(b.relevance)).map((r) => r.grammar);
}

/* ============================================================
   QUẢN TRỊ
   ============================================================ */

export async function getAllGroups() {
  return db.questionGroup.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function getAllQuestionsForAdmin(): Promise<QuestionWithAnswer[]> {
  return db.question.findMany({
    include: { options: { orderBy: { order: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return db.tag.findUnique({ where: { slug } });
}
