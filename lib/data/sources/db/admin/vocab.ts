import { db } from '@/lib/db';
import type { AdminVocabRow } from '@/lib/data/types';
import type { VocabInput } from '@/lib/validation/admin/vocab';
import type { Prisma } from '@/lib/prisma-types';
import { logAudit } from './audit';

export async function getAdminVocab(): Promise<AdminVocabRow[]> {
  const rows = await db.vocabEntry.findMany({
    include: {
      examples: { orderBy: { order: 'asc' } },
      relationsFrom: { include: { to: { select: { headword: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(({ relationsFrom, ...v }) => ({
    ...v,
    relations: relationsFrom.map((r) => ({ relatedId: r.relatedId, relation: r.relation, headword: r.to.headword })),
  }));
}

function scalarData(input: VocabInput) {
  return {
    headword: input.headword,
    readingKana: input.readingKana,
    accent: input.accent,
    pos: input.pos,
    meaningVi: input.meaningVi,
    meaningEn: input.meaningEn,
    level: input.level,
    topicId: input.topicId,
    register: input.register,
    audioId: input.audioId,
    noteVi: input.noteVi,
    status: input.status,
  };
}

/** Ví dụ và quan hệ thay toàn bộ — dữ liệu con, không có gì tham chiếu vào chúng. */
async function writeChildren(tx: Prisma.TransactionClient, vocabId: string, input: VocabInput) {
  await tx.vocabExample.deleteMany({ where: { vocabId } });
  if (input.examples.length) {
    await tx.vocabExample.createMany({
      data: input.examples.map((e, i) => ({ vocabId, ...e, order: i })),
    });
  }
  await tx.vocabRelation.deleteMany({ where: { vocabId } });
  if (input.relations.length) {
    await tx.vocabRelation.createMany({
      data: input.relations.filter((r) => r.relatedId !== vocabId).map((r) => ({ vocabId, ...r })),
      skipDuplicates: true,
    });
  }
}

export async function createVocab(input: VocabInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const v = await tx.vocabEntry.create({ data: scalarData(input), select: { id: true } });
    await writeChildren(tx, v.id, input);
    await logAudit(tx, { actorId, entity: 'VocabEntry', entityId: v.id, action: 'create', diff: input });
    return v;
  });
}

export async function updateVocab(id: string, input: VocabInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.vocabEntry.update({ where: { id }, data: scalarData(input) });
    await writeChildren(tx, id, input);
    await logAudit(tx, { actorId, entity: 'VocabEntry', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

export async function deleteVocab(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.vocabEntry.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'VocabEntry', entityId: id, action: 'delete' });
  });
}
