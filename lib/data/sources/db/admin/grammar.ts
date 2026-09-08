import { db } from '@/lib/db';
import type { AdminGrammarRow } from '@/lib/data/types';
import type { GrammarInput } from '@/lib/validation/admin/grammar';
import type { Prisma } from '@/lib/prisma-types';
import { logAudit } from './audit';

export async function getAdminGrammar(): Promise<AdminGrammarRow[]> {
  return db.grammarPoint.findMany({
    include: { examples: { orderBy: { order: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
}

function scalarData(input: GrammarInput) {
  return {
    slug: input.slug,
    pattern: input.pattern,
    formation: input.formation,
    meaningVi: input.meaningVi,
    register: input.register,
    level: input.level,
    usageNoteVi: input.usageNoteVi,
    commonMistakeVi: input.commonMistakeVi,
    jlptLevel: input.jlptLevel,
    status: input.status,
  };
}

async function writeExamples(tx: Prisma.TransactionClient, grammarId: string, input: GrammarInput) {
  await tx.grammarExample.deleteMany({ where: { grammarId } });
  if (input.examples.length) {
    await tx.grammarExample.createMany({ data: input.examples.map((e, i) => ({ grammarId, ...e, order: i })) });
  }
}

export async function createGrammar(input: GrammarInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const g = await tx.grammarPoint.create({ data: scalarData(input), select: { id: true } });
    await writeExamples(tx, g.id, input);
    await logAudit(tx, { actorId, entity: 'GrammarPoint', entityId: g.id, action: 'create', diff: input });
    return g;
  });
}

export async function updateGrammar(id: string, input: GrammarInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.grammarPoint.update({ where: { id }, data: scalarData(input) });
    await writeExamples(tx, id, input);
    await logAudit(tx, { actorId, entity: 'GrammarPoint', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

export async function deleteGrammar(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.grammarPoint.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'GrammarPoint', entityId: id, action: 'delete' });
  });
}
