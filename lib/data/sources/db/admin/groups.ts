import { db } from '@/lib/db';
import type { AdminGroupRow } from '@/lib/data/types';
import type { GroupInput } from '@/lib/validation/admin/group';
import type { Prisma } from '@/lib/prisma-types';
import { logAudit } from './audit';

export async function getAdminGroups(): Promise<AdminGroupRow[]> {
  const rows = await db.questionGroup.findMany({
    include: {
      materials: { include: { material: { select: { titleAdmin: true, kind: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { questions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(({ materials, _count, ...g }) => ({
    ...g,
    materials: materials.map((m) => ({
      materialId: m.materialId,
      order: m.order,
      titleAdmin: m.material.titleAdmin,
      kind: m.material.kind,
    })),
    questionCount: _count.questions,
  }));
}

function scalarData(input: GroupInput) {
  return {
    sectionCode: input.sectionCode,
    level: input.level,
    titleAdmin: input.titleAdmin,
    instructionJa: input.instructionJa,
    instructionVi: input.instructionVi,
    sourceKey: input.sourceKey,
    sourceLocator: input.sourceLocator,
    status: input.status,
  };
}

async function writeMaterials(tx: Prisma.TransactionClient, groupId: string, input: GroupInput) {
  await tx.groupMaterial.deleteMany({ where: { groupId } });
  if (input.materials.length) {
    await tx.groupMaterial.createMany({
      data: input.materials.map((m) => ({ groupId, materialId: m.materialId, order: m.order })),
      skipDuplicates: true,
    });
  }
}

export async function createGroup(input: GroupInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const g = await tx.questionGroup.create({ data: { ...scalarData(input), createdById: actorId }, select: { id: true } });
    await writeMaterials(tx, g.id, input);
    await logAudit(tx, { actorId, entity: 'QuestionGroup', entityId: g.id, action: 'create', diff: input });
    return g;
  });
}

/** Đổi section của group thì mọi câu trong group đổi theo — sectionCode ở câu chỉ là bản chép. */
export async function updateGroup(id: string, input: GroupInput, actorId: string): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await tx.questionGroup.update({ where: { id }, data: scalarData(input) });
    await tx.question.updateMany({ where: { groupId: id }, data: { sectionCode: input.sectionCode } });
    await writeMaterials(tx, id, input);
    await logAudit(tx, { actorId, entity: 'QuestionGroup', entityId: id, action: 'update', diff: input });
    return { id };
  });
}

/** Xoá group xoá luôn câu (cascade); có lượt làm hoặc đang nằm trong bộ/đề thì P2003 → IN_USE. */
export async function deleteGroup(id: string, actorId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.questionGroup.delete({ where: { id } });
    await logAudit(tx, { actorId, entity: 'QuestionGroup', entityId: id, action: 'delete' });
  });
}
