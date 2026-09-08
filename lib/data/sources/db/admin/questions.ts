import { db } from '@/lib/db';
import { AdminError } from '@/lib/admin/errors';
import type { AdminQuestionEditor, AdminQuestionRow } from '@/lib/data/types';
import type { QuestionInput } from '@/lib/validation/admin/question';
import type { Prisma, SectionCode } from '@/lib/prisma-types';
import { logAudit } from './audit';

/** Ở ba section này phương án được đọc trong audio nên textJa được phép trống. */
const SPOKEN_OPTION_SECTIONS = new Set<SectionCode>(['L1', 'L2', 'LR1']);

export async function getAdminQuestions(): Promise<AdminQuestionRow[]> {
  const rows = await db.question.findMany({
    select: {
      id: true,
      stemJa: true,
      sectionCode: true,
      level: true,
      status: true,
      groupId: true,
      order: true,
      updatedAt: true,
      group: { select: { titleAdmin: true } },
      options: { select: { textJa: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(({ group, options, ...q }) => ({
    ...q,
    groupTitle: group.titleAdmin,
    optionCount: options.length,
    spokenOptions: options.length > 0 && options.every((o) => !o.textJa),
  }));
}

export async function getAdminQuestionEditor(id: string): Promise<AdminQuestionEditor | null> {
  const q = await db.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { order: 'asc' } },
      tags: { select: { tagId: true } },
      vocabLinks: { select: { vocabId: true, relevance: true } },
      grammarLinks: { select: { grammarId: true, relevance: true } },
    },
  });
  if (!q) return null;
  const { tags, ...rest } = q;
  return { ...rest, tagIds: tags.map((t) => t.tagId) };
}

/** Section của group quyết định textJa có được trống không; sectionCode của câu luôn chép từ group. */
async function resolveGroup(tx: Prisma.TransactionClient, input: QuestionInput) {
  const group = await tx.questionGroup.findUnique({ where: { id: input.groupId }, select: { sectionCode: true } });
  if (!group) throw new AdminError('VALIDATION', 'Nhóm câu không tồn tại', { groupId: 'Nhóm câu không tồn tại' });
  if (!SPOKEN_OPTION_SECTIONS.has(group.sectionCode)) {
    const blank = input.options.findIndex((o) => !o.textJa);
    if (blank >= 0) {
      throw new AdminError('VALIDATION', 'Phương án phải có chữ ở section này', {
        [`options.${blank}.textJa`]: `Section ${group.sectionCode} hiện chữ phương án — chỉ L1, L2, LR1 được để trống`,
      });
    }
  }
  return group;
}

function scalarData(input: QuestionInput, sectionCode: SectionCode) {
  return {
    groupId: input.groupId,
    order: input.order,
    sectionCode,
    level: input.level,
    stemJa: input.stemJa,
    stemVi: input.stemVi,
    audioStartMs: input.audioStartMs,
    audioEndMs: input.audioEndMs,
    explanationVi: input.explanationVi,
    businessNoteVi: input.businessNoteVi,
    status: input.status,
  };
}

async function writeLinks(tx: Prisma.TransactionClient, questionId: string, input: QuestionInput) {
  await tx.questionTag.deleteMany({ where: { questionId } });
  if (input.tagIds.length) {
    await tx.questionTag.createMany({ data: input.tagIds.map((tagId) => ({ questionId, tagId })), skipDuplicates: true });
  }
  await tx.questionVocab.deleteMany({ where: { questionId } });
  if (input.vocabLinks.length) {
    await tx.questionVocab.createMany({
      data: input.vocabLinks.map((l) => ({ questionId, vocabId: l.vocabId, relevance: l.relevance })),
      skipDuplicates: true,
    });
  }
  await tx.questionGrammar.deleteMany({ where: { questionId } });
  if (input.grammarLinks.length) {
    await tx.questionGrammar.createMany({
      data: input.grammarLinks.map((l) => ({ questionId, grammarId: l.grammarId, relevance: l.relevance })),
      skipDuplicates: true,
    });
  }
}

export async function createQuestion(input: QuestionInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const group = await resolveGroup(tx, input);
    const q = await tx.question.create({
      data: {
        ...scalarData(input, group.sectionCode),
        createdById: actorId,
        options: { create: input.options.map((o) => ({ ...o })) },
      },
      select: { id: true },
    });
    await writeLinks(tx, q.id, input);
    await logAudit(tx, { actorId, entity: 'Question', entityId: q.id, action: 'create', diff: input });
    return q;
  });
}

/**
 * Phương án upsert theo (questionId, order) để GIỮ id — AttemptAnswer đang
 * trỏ vào id phương án, đổi id là mất lịch sử ai chọn gì.
 */
export async function updateQuestion(id: string, input: QuestionInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const group = await resolveGroup(tx, input);
    await tx.question.update({ where: { id }, data: scalarData(input, group.sectionCode) });
    for (const o of input.options) {
      await tx.questionOption.upsert({
        where: { questionId_order: { questionId: id, order: o.order } },
        create: { questionId: id, ...o },
        update: { textJa: o.textJa, isCorrect: o.isCorrect, distractorNote: o.distractorNote },
      });
    }
    await writeLinks(tx, id, input);
    await logAudit(tx, { actorId, entity: 'Question', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

/** Câu đã có lượt làm thì không xoá được (P2003 → IN_USE) — chuyển ARCHIVED thay vì xoá. */
export async function deleteQuestion(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.question.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'Question', entityId: id, action: 'delete' });
  });
}
