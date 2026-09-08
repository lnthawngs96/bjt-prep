import type { Prisma } from '@/lib/prisma-types';

/**
 * Ghi AuditLog trong CÙNG transaction với thao tác ghi. Nghe thừa với dự án
 * một người, nhưng khi sửa nhầm đáp án của 30 câu lúc 2 giờ sáng thì đây là
 * thứ duy nhất cứu được.
 */
export async function logAudit(
  tx: Prisma.TransactionClient,
  entry: {
    actorId: string;
    entity: string;
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'role' | 'resolve';
    diff?: unknown;
  },
) {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      diff: entry.diff === undefined ? undefined : (entry.diff as Prisma.InputJsonValue),
    },
  });
}
